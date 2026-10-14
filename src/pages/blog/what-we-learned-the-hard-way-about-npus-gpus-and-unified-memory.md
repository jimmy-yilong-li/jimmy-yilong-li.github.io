---
layout: '../../layouts/ArticleLayout.astro'
title: "What We Learned the Hard Way About NPUs, GPUs, and Unified Memory"
summary: "NPUs like stable graphs, GPUs need enough parallel work, and shared memory is still shared."
date: 2026-07-11
minutes: 6
cover: /images/compute-memory.svg
---
> A quick note on the numbers: they are rounded from what we observed in our experiments. The trend matters more than the exact value.

An edge SoC is not a smaller datacenter GPU.

That sentence sounds obvious. It stopped feeling obvious once we tried to split
one model across a CPU, a GPU, and an NPU.

On a block diagram, the three engines sit beside the same memory pool. It looks
like a routing problem: send each operator to the box with the most FLOPS, avoid
a few copies, and call it done. Our experiments kept breaking that story.

The NPU wants a graph that has already made up its mind. The GPU is more
flexible, but it needs enough parallel work to stay busy. The CPU has fewer
lanes, yet it can be surprisingly good at following one stream of weights
through memory. The spec sheet doesn't capture those differences, and on our
system they mattered more than peak compute.

## The NPU was losing time between operators

Our biggest NPU speedup didn't come from a new matrix multiplication kernel. We
simply stopped submitting work to the accelerator so often.

An NPU is happiest with an ahead-of-time compiled graph: fixed shapes, a fixed
schedule, and large fused regions. Our first runtime chopped that graph into too
many small pieces. Every boundary charged a toll: graph dispatch, tensor
packing, host-side work, compilation overhead, and activation movement.

After we cut per-block accelerator submissions by roughly 80%, the vision stage
ran about four to five times faster. In some runs, a fixed-shape path was around
six times faster than the matching dynamic path.

The matrix multiplications hadn't changed. The plumbing had.

Now, when an NPU trace looks slow, we don't start by counting operators. We
count how often execution leaves the compiled region. A graph can contain all
the right math and still spend most of its time stopping, handing control back,
and starting again.

## A graph can compile and still be wrong

Compilation gave us a false sense of progress more than once.

We saw attention graphs match the reference in ONNX and the vendor simulator,
then produce incorrect outputs on the real NPU. We also built an integer path
that was nearly twice as fast per layer. Across the full transformer, however,
small errors accumulated until the model output was no longer acceptable.

We now check three things separately:

- Does the exported graph match the original model?
- Does it still match on real hardware?
- Does the complete model remain accurate after the change is repeated through
  every layer?

Compilation is permission to run the next test, not evidence that the
optimization works. The hardware and the end-to-end model get the final say.

## Unified memory is still shared memory

Unified memory solves a real problem. There is no PCIe-style transfer boundary,
and handing a tensor from one runtime to another becomes much cheaper. It also
makes it easy to forget that all three engines still share one memory
controller.

Our first transport fixes looked excellent in isolation. Replacing Python lists
and JSON serialization with binary buffers or shared memory cut boundary
latency by well over 90% in some runs. After that first cleanup, more zero-copy
work barely moved end-to-end generation throughput.

The reason is scale. A visual embedding may be only a few hundred kilobytes.
Autoregressive decoding can stream hundreds of megabytes of model weights for
every generated token. Removing one embedding copy helps, but it can't compete
with reading the decoder weights again and again.

> Unified memory makes handoff cheap; it does not make concurrent memory traffic free.

We saw the same effect when the CPU and GPU decoded at the same time. Together
they delivered only about 75 to 80% of their naive summed throughput. Sustained
throughput was roughly 15 to 20% above the CPU alone, not twice as fast.

The second lane was useful, but it added capacity, not a second memory system.
Both lanes still had to fight for the same LPDDR bandwidth.

## Why the CPU sometimes beat the GPU

On the RK3588, the CPU repeatedly beat the Mali GPU for batch-one
autoregressive decoding, sometimes by roughly 40%.

That looked wrong until we stopped thinking in FLOPS. A single decode stream is
mostly a sequence of skinny matrix-vector operations. There isn't much
arithmetic per byte, and there may not be enough independent work to fill the
GPU.

The CPU copes with this workload differently. Out-of-order execution, hardware
prefetching, and many memory requests in flight can keep the weight stream
moving. A mobile GPU usually hides memory latency by switching among thousands
of threads. With batch one, there may not be enough threads to do that.

A utilization counter near 100% doesn't contradict this. The GPU can be fully
occupied while its execution units wait for memory. Busy isn't the same as
compute-bound.

We tried workgroup changes, subgroup reductions, custom quantized kernels,
fused operators, and GPU-side sampling. Several microbenchmarks improved, but
many of those wins disappeared or became regressions in the full runtime. One
fused operator saved a dispatch but increased register pressure. Deferring a
logits read made the reported decode phase look faster while moving the same
synchronization cost into sampling.

A token doesn't care which profiler box paid the bill. We now optimize complete
token time, not the most convenient field in the profiler.

The GPU becomes more useful when the workload exposes more parallelism: long
prefills, several active requests, or true multi-sequence batching. Collecting
requests outside a single-sequence decoder isn't enough. Continuous batching
needs multi-sequence KV storage, batched attention, and a decoder loop that can
admit and retire sequences while it runs.

## Embeddings travel well. KV caches don't.

A visual embedding is an ordinary tensor. A KV cache is a bundle of assumptions
about layer layout, sequence position, precision, model revision, and private
runtime storage.

Some vendor LLM runtimes don't expose a compatible way to export or import that
state at all. The memory may be physically shared, but the runtimes still
disagree on what the bytes mean.

We built an exportable-KV path and confirmed that a faithful handoff was
possible. Whether it paid off depended on prompt length. For short prompts,
fixed launch and shape-bucketing costs ate most of the gain. Longer prefixes
gave the NPU enough work to pull ahead.

Prefix reuse often beat moving prefill to another accelerator. What we observed
ranged from about one-third less prefill work for short reusable prefixes to
well over 90% for long ones. A faster kernel makes the same work cheaper. Reuse
makes the work disappear.

Reuse still needs careful bookkeeping: exact prefix identity, model
compatibility, cache validity, and a scheduler that knows where the cached state
lives. Even so, that was often easier than translating private state between
two incompatible runtimes.

## What we look at now

We no longer start accelerator placement with peak FLOPS. We first ask whether
the shapes stay fixed, whether the GPU will see enough parallel work, what else
is hitting the memory controller, and whether the split boundary carries a
plain tensor or a runtime's private state. Then we time the whole request,
including packing, launches, synchronization, and sampling.

Peak compute still matters. On an edge SoC, the rest of the system has to make
it usable first.
