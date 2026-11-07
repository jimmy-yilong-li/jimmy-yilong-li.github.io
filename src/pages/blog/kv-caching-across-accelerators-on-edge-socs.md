---
layout: '../../layouts/ArticleLayout.astro'
title: "KV Caching Across Accelerators on Edge SoCs"
summary: "What a KV cache saves, when another engine can use it, and when rebuilding the context is the better option."
date: 2026-10-21
minutes: 12
cover: /images/kv-context-branches.svg
coverMobile: /images/kv-context-branches-mobile.svg
coverId: context-branches
coverAlt: "A growing video history branches into independent answers, each bound to its own completed prefix; pending frames remain outside those views."
coverCaption: "New frames extend the history. Each answer keeps the completed prefix it started with."
relatedSlug: what-we-learned-the-hard-way-about-npus-gpus-and-unified-memory
---

A camera assistant has just answered a question about a table. Another frame
arrives, followed by a second question: "Where did the cup go?" The device has
already encoded much of the scene and processed its history. Starting over
would discard useful computation. Keeping everything forever would eventually
exhaust memory.

Now add a CPU, a GPU and an NPU. They can help with different parts of inference,
but they do not automatically share an executable view of that history. A
processor can be idle while the state it needs is busy, incomplete or stored
in another runtime's layout.

Working on these systems changed the question we ask when optimizing them:
**what computation has already been done, where is its result usable, and how
long will making it usable elsewhere take?**

Our paper has more details:
[Shared Context, Separate Engines: Stateful Streaming Inference for Multimodal LLMs on Edge SoCs](https://arxiv.org/pdf/2610.35309)
(arXiv preprint).

## What Is Actually Being Cached?

In a multimodal LLM (MLLM), several objects are casually called "the context."
They save different kinds of work.

<div class="blog-table-scroll" role="region" aria-label="What each retained object saves" tabindex="0">
<table>
  <thead><tr><th scope="col">Retained object</th><th scope="col">What a hit saves</th><th scope="col">What still has to run</th></tr></thead>
  <tbody>
    <tr><th scope="row">Projected visual embeddings</th><td>Image encoding and projection</td><td>Language prefill for those embeddings, query processing and generation</td></tr>
    <tr><th scope="row">Language KV for a shared prefix</th><td>Language prefill for the matching history</td><td>Query-suffix prefill and generation</td></tr>
    <tr><th scope="row">A response's private KV</th><td>Recomputing its already processed suffix</td><td>The next decoding step</td></tr>
  </tbody>
</table>
</div>

Visual embeddings are inputs to the language model. During **prefill**, the
language model processes those inputs and builds keys and values in its
attention layers. During **decode**, it generates new tokens while attending
to the retained history. Keeping an embedding buffer therefore does not, by
itself, retain the language computation performed over that buffer.

<figure class="blog-diagram" id="cache-reuse">
  <picture>
    <source media="(max-width: 600px)" srcset="/images/kv-cache-reuse-mobile.svg" width="480" height="720" />
    <img src="/images/kv-cache-reuse.svg" alt="Three inference paths show that cached embeddings save visual encoding, while a compatible prefix KV cache also saves historical language prefill. Every new question still needs suffix prefill and decoding." width="900" height="560" loading="lazy" decoding="async" />
  </picture>
  <figcaption>Different cache hits skip different work. Neither skips processing the new question or generating its answer.</figcaption>
</figure>

A KV hit also does not return a cached answer. A new question still needs
prefill for its own suffix, and generating the answer still requires language
model computation. Attention continues to read the relevant historical KV. A long prefix
can remain expensive to attend to even when rebuilding it costs nothing.

Model weights are another, separate resource. Two requests may share immutable
weights while owning different KV. Two processes may represent the same
logical history while independently loading the weights. These distinctions
matter when both latency and memory are being optimized.

## A Prefix Is More Than an Image Hash

Suppose two requests contain the same frame. Reusing the visual encoder's
output can be valid when preprocessing and model configuration match. Reusing
that frame's language KV requires more: the KV also depends on everything
that preceded it.

Consider these two inputs:

```text
[system prompt, frame A, frame B]
[system prompt, frame C, frame B]
```

The second occurrence of frame B has a different attention history. Its visual
embedding might be reusable; its contextual language state is generally not.
Likewise, changing a frame's token positions or inserting a question before it
changes the prefix being represented.

A useful cache separates two decisions. First, identify the **logical prefix**:
model and adapter identity, ordered text and visual inputs, preprocessing,
and the positions and attention rules applied to them. Second, check whether
the stored **representation** can be consumed by the target backend: KV dtype,
layout, numerical configuration and required position metadata.

Public serving systems already make prefix identity depend on prior history.
For example, vLLM's block hashes incorporate the preceding block's hash, token
IDs and additional identifiers such as multimodal input hashes. Image
placeholder tokens alone cannot distinguish different images.
[vLLM prefix-caching design](https://docs.vllm.ai/en/latest/design/prefix_caching/)

In our implementation, a bounded exact-match cache of complete visual prefixes
was a useful starting point. A longest-prefix index can reuse part of a growing history,
but requires additional indexing and lifetime management. Holding a caller's
live session is a third mechanism: it preserves state without searching for a
matching prefix at all. Each is useful, and their hit rates mean different
things.

## Keep the History Stable While the World Moves On

Continuous video introduces a dependency that ordinary request caching can
hide. A question refers to a particular point in the stream, while new frames
continue to arrive.

For a causal language model, an append-only prefix can support multiple
continuations, provided its earlier inputs, positions and attention semantics
remain unchanged. The [opening diagram](#context-branches) shows two questions
branching from different completed versions while the video history keeps growing.

Each answer needs a stable view of the history it was assigned. New frames may
extend the stream without becoming visible to an answer already in progress.
This can be implemented with shared read-only prefix storage and private
suffixes, or with separate compatible snapshots. The right choice depends on
the runtime's actual sequence and memory interfaces.

Two details make this work in practice. Publish a version only after the
backend has completed the work that makes its state usable. Also register
incoming frames before asynchronous processing: a query that requires one of
those frames must wait for it, rather than silently binding to an older
version just because that version is ready.

The answer's suffix belongs to its branch. If the application wants the answer
to become conversation history, it must choose an order for committing that
text. Independently generated KV tails cannot simply be concatenated into one
valid conversation: their hidden states were computed against different
histories.

Prefix sharing within an allocator is an established technique. PagedAttention
provides a public example of block-based KV storage and sharing across
requests. That capability is distinct from transferring state between two
different backend representations.
[PagedAttention](https://arxiv.org/abs/2309.06180)

## Sharing DRAM Does Not Make KV Portable

On a heterogeneous SoC, CPU, GPU and NPU often access a shared physical memory
system. A common DRAM pool does not establish a common tensor format, allocation
interface or synchronization protocol.

A GPU backend may store KV in a packed layout that its attention kernels
expect. A CPU backend may use a different layout or precision. Position state,
valid sequence length and quantization metadata may live outside the main
tensor. A pointer to the bytes is only useful if the receiving runtime can
interpret all of them and knows that the producer has finished writing.

This leaves three practical ways to prepare a query's history:

<div class="blog-table-scroll" role="region" aria-label="Ways to prepare a query's history" tabindex="0">
<table>
  <thead><tr><th scope="col">Path</th><th scope="col">Main benefit</th><th scope="col">Main cost</th></tr></thead>
  <tbody>
    <tr><th scope="row">Continue where the state is resident</th><td>Avoid moving or rebuilding the prefix</td><td>Wait for that engine to become available</td></tr>
    <tr><th scope="row">Import a compatible snapshot</th><td>Avoid historical prefill on the receiver</td><td>Export, conversion, transfer, synchronization and import</td></tr>
    <tr><th scope="row">Replay retained embeddings</th><td>Use the destination's own execution path</td><td>Repeat language prefill for the required history</td></tr>
  </tbody>
</table>
</div>

Replay can save visual encoding while still repeating substantial language
work. Snapshot import can remove that repeated prefill, but its total cost
includes more than a memory copy. A full snapshot also grows with history.
Repeatedly exporting and importing it for tiny answers can cost more than
waiting for the resident engine.

The practical target is to make useful state available with the least added
work. Sometimes that means sharing an allocation. Sometimes it means making
an explicit copy that avoids a much more expensive recomputation.

### Transfer Correctness and Numerical Differences

An imported GPU prefix followed by CPU decoding is a mixed execution path.
Its outputs need not be bitwise equal to either an all-CPU or an all-GPU run.
Different kernels and precision choices can already produce different
activations before a transfer occurs.

We separate the checks accordingly. First verify that transfer preserves the
intended values, positions and sequence boundaries, allowing only the declared
format conversion. Then compare concurrent execution with a serial reference
using the same backend sequence. Finally, assess the mixed path's task quality
against the deployment reference.

These checks answer different questions. A byte-perfect snapshot can preserve
a numerically poor producer result. Conversely, a difference from an all-GPU
answer does not by itself identify a serialization bug. This distinction makes
debugging much more productive than treating every logit difference as a
transfer failure.

## The Fastest Free Engine May Still Be the Wrong Choice

Suppose the GPU holds a long video prefix and is finishing an answer. The CPU
is idle. Sending the next question to the CPU immediately looks attractive
until the CPU has to reconstruct the entire history.

The useful comparison is between complete paths: waiting and continuing
locally, importing and continuing remotely, or replaying and continuing
remotely. Queue delay, context preparation and execution time all count.
Their relative importance changes with history length and answer length.

<figure class="blog-diagram" id="context-paths">
  <picture>
    <source media="(max-width: 600px)" srcset="/images/kv-context-paths-mobile.svg" width="480" height="720" />
    <img src="/images/kv-context-paths.svg" alt="Wait continues on the resident GPU; import prepares compatible KV on the CPU; replay rebuilds historical language KV from retained embeddings. All paths then prefill the new question and decode. The diagram does not compare measured times." width="900" height="560" loading="lazy" decoding="async" />
  </picture>
  <figcaption>Three ways to prepare the same history. Import depends on backend support; no path is always the fastest. These are execution paths, not measured timelines.</figcaption>
</figure>

Prefill and decode also favor different hardware in different configurations.
Prefill exposes substantial matrix work. Small-batch decode often puts more
pressure on weight and state movement. In our edge deployments, the faster
prefill engine has not always been the faster decoder. CPU and GPU roles
should follow measured stage costs rather than a fixed hierarchy.

Concurrent costs matter as well. Two engines sharing memory and power budgets
can slow each other down. Adding their isolated token rates gives an optimistic
capacity estimate. Observed interference is a reason to measure co-running
service times; identifying its cause as DRAM saturation requires additional
bandwidth evidence.

There is another streaming-specific cost: an answer can occupy the engine
needed to ingest the next frame. Even if that answer finishes sooner, later
questions may wait longer for their required history. A useful scheduler pays
attention to context readiness as well as request completion.

## Zero-Copy and Low Memory Are Separate Goals

Zero-copy should describe a particular producer-consumer boundary. For example,
a language frontend may borrow an immutable host embedding buffer rather than
copying it into another host buffer. Its backend may still upload, repack or
concatenate that input. KV transfer is another boundary, and model allocation
is another again.

The device's footprint contains model weights, KV, retained visual inputs,
execution workspaces and runtime overhead. Removing one staging buffer does
not remove the other allocations. A process-per-stream design can therefore
use substantial memory even when an input handoff avoids copying.

This was a useful lesson in our own work: when a shared-buffer path still
showed a large footprint, counting model owners revealed a different
optimization opportunity from counting copies. Sharing weights within a
backend can reduce duplication while keeping each stream's context private.

For a conventional full-attention transformer with uniform KV precision, the
uncompressed KV payload for one sequence is approximately:

<math display="block" class="memory-equation" aria-label="KV memory equals two times layers times retained tokens times KV heads times head dimension times bytes per element">
  <msub><mi>M</mi><mtext>KV</mtext></msub><mo>=</mo><mn>2</mn><mi>L</mi><mi>N</mi><msub><mi>H</mi><mtext>KV</mtext></msub><msub><mi>d</mi><mtext>head</mtext></msub><mi>b</mi><mo>.</mo>
</math>

Here, *L* is the number of layers, *N* the retained token count,
*H*<sub>KV</sub> the number of KV heads, *d*<sub>head</sub> the head
dimension, and *b* bytes per element. The factor two accounts for keys and
values. Padding, quantization metadata and allocator overhead add to this
payload. Architectures with other state representations need different
accounting.

This suggests distinct optimizations: share immutable weights where supported;
share compatible prefix storage among branches; retain only useful historical
inputs; and release response state when its readers finish. Cross-backend
copies may still be necessary even when same-backend sharing is effective.

For a bounded cache, use both an entry limit and a byte limit. Evict unused
entries before touching active state, and keep underlying storage alive until
its last consumer releases it. Retained inputs can provide a cheaper recovery
path than re-encoding video, but they also consume memory and need a budget.

Active history needs different treatment from an optional cache entry. If a
pending query requires a frame, freeing its only recoverable representation
changes what the query can answer. Limit pending work before expensive
encoding, and apply backpressure when that budget fills. Dropping frames or
summarizing history requires an explicit application policy.

KV quantization is a further trade-off, not an automatic latency improvement.
It reduces stored bytes but adds conversion work and can change outputs.
Transformers' documentation explicitly notes that cache quantization can hurt
latency for short contexts when memory is already sufficient.
[Transformers cache strategies](https://huggingface.co/docs/transformers/en/kv_cache)

## A Small View of the Measurements

One recent RK3588 experiment used a 0.5B MLLM, two persistent
video streams, eight frames and four queries per stream, and exactly 128 output
tokens per query. Each configuration had three runs, collected in separate
groups. The measured window included fresh NPU visual encoding, initial context
construction, state preparation, waiting and generation; model loading and
warmup were outside it.

The combined CPU/GPU language path achieved **about 16% higher request
throughput** and **about 26% lower mean arrival-to-first-token latency** than
the faster retained single-language-engine baseline, which was CPU in this
setup. Both paths used the NPU for vision. The comparison therefore includes
an already retained-context baseline, rather than giving only one side a
cache.

The updated runtime also used **about a quarter less peak aggregate process
RSS** than an earlier process-per-stream implementation. That is a separate
comparison, involving consolidated model ownership and other runtime changes;
RSS does not isolate unique physical memory or KV allocation. Mean first-token
latency remained slightly higher than in that earlier implementation, despite
the lower footprint.

These are short-session observations. They illustrate why caching, allocation
and placement need to be considered together. They do not establish a
sustainable stream count or a speedup for every model and workload.

For interpreting such measurements, three distinctions have been especially
useful. Count the first cache miss in a session. Measure TTFT from query arrival,
including any wait for its context. And record actual generated lengths: fewer
tokens can make requests per second rise without making inference faster.

## Start with the Work You Can Avoid

The most useful first optimization is often visible in the execution trace:
the same frame encoded again, the same prefix prefilled again, or the same
weights loaded by another worker. Removing that work can matter more than
making an individual kernel slightly faster.

After retention works, the next question is where to use the retained state.
Keep it local when waiting is cheaper, transfer it when that avoids enough
recomputation, and retain a replay path when the destination needs to rebuild
its own representation. Let new observations advance without changing the
history of an answer already being generated.

An effective on-device runtime makes those dependencies explicit. It knows
which history each response needs, which engine can use that history, and what
it will cost to continue. That knowledge is what turns a collection of caches
and accelerators into useful, sustained computation.
