import type { ResearchWork } from './types';

// Publication identities follow the sibling site's _papers and _projects metadata.
// NanoMind authors, metrics, and system details follow the published ICLR 2026 PDF.
// Per-work comments identify prose sources.
export const works: ResearchWork[] = [
  // Sources: _papers/2024-10-1-tinyllm.md for publication identity; published
  // ICLR 2026 PDF b20260e3e1bd7ea108831925d65ce0a6, pages 1, 5-8, 11, and 14.
  // The PDF supersedes stale author and runtime metadata on the proceedings landing page.
  {
    slug: 'nanomind',
    name: 'NanoMind',
    title:
      'Tiny but Mighty: A Software-Hardware Co-Design Approach for Efficient Multimodal Inference on Battery-Powered Small Devices',
    category: 'On-Device AI',
    kind: 'Paper',
    venue: 'ICLR 2026',
    summary:
      'A battery-powered multimodal inference system that coordinates model modules, heterogeneous accelerators, and shared memory to run a self-contained assistant locally.',
    cover: '/images/nanomind-hardware.png',
    coverAlt:
      'Published NanoMind prototype photo showing camera and audio interfaces alongside the battery module.',
    coverFit: 'contain',
    imageCaption:
      'Prototype photo: NanoMind multimodal interfaces and battery module (Figure 11).',
    publicationId: '2024-10-1-tinyllm',
    authorHtml:
      '<strong>Yilong Li</strong>, Shuai Zhang, Yijing Zeng, Chengpo Yan, Hao Zhang, Xinmiao Xiong, Jingyu Liu, Pan Hu, Suman Banerjee',
    resources: [
      { label: 'Published paper PDF', href: '/pdfs/nanomind-iclr2026.pdf' },
      {
        label: 'ICLR proceedings',
        href: 'https://proceedings.iclr.cc/paper_files/paper/2026/hash/b20260e3e1bd7ea108831925d65ce0a6-Abstract-Conference.html',
      },
    ],
    sections: [
      {
        id: 'problem',
        title: 'Multimodal inference is a systems problem',
        paragraphs: [
          'Multimodal models combine vision and audio encoders, projectors, and language generation, each with different computational needs. Mapping the whole pipeline to one accelerator leaves other compute units idle and adds memory traffic and latency.',
          'On a small battery-powered device, efficient execution determines how much sensing and inference can fit within the energy and memory budget. NanoMind co-designs the hardware, scheduling, and data movement to make local multimodal assistance practical.',
        ],
      },
      {
        id: 'system',
        title: 'Custom hardware and accelerator-aware software',
        paragraphs: [
          'The custom prototype uses an RK3566 system-on-chip with an integrated NPU and GPU, shared LPDDR4x memory, and a power-management unit. NanoMind decomposes the model into independently executable modules, placing vision encoding on the NPU and language decoding on the GPU.',
          'The Token-Aware Buffer Manager (TABM) coordinates a shared ring buffer so the NPU can write embeddings that the GPU consumes directly, enabling zero-copy transfers. Fused low-bit GEMM kernels and battery-aware scheduling support efficient local execution. In low-power mode, an event-driven cascade loads, executes, and releases each module in sequence.',
        ],
        bullets: [
          'Schedule vision, projector, language, and audio modules around accelerator strengths.',
          'Transfer embeddings through shared memory with TABM zero-copy buffers.',
          'Adapt execution to battery level through continuous and on-demand modes.',
        ],
        image: {
          src: '/images/nanomind-system.png',
          alt: 'NanoMind architecture showing modular inference, cross-accelerator offloading, zero-copy transfers, and battery-aware scheduling.',
          caption:
            'Method illustration: modular inference, zero-copy transfers, and battery-aware scheduling (Figure 3).',
        },
      },
      {
        id: 'findings',
        title: 'Energy-efficient local multimodal inference',
        paragraphs: [
          'The published paper reports 42.3% lower end-to-end energy consumption against the evaluated mainstream edge frameworks and devkits. For LLaVA-OneVision-Qwen2-0.5B with a camera and a 2,000 mAh battery, it estimates nearly 18.8 hours of operation in on-demand low-power mode under low-duty-cycle, event-triggered workloads.',
          'The system breakdown shows how zero-copy buffering reduces memory use and CPU overhead during embedding transfer, while accelerator-specific placement improves vision encoding. Together, the results connect module-level execution decisions to the energy cost of the complete assistant.',
        ],
      },
      {
        id: 'context',
        title: 'From local inference to persistent assistance',
        paragraphs: [
          'NanoMind brings perception and language generation into a compact, self-contained device that operates offline. Its hardware-software design provides an execution platform for assistants that process visual and audio input locally.',
          'Virgile builds on the NanoMind hardware platform for persistent object and face recognition. PalmBench complements this systems work by measuring the quality, resource, and energy trade-offs of compressed language models on mobile hardware.',
        ],
      },
    ],
    highlights: [
      {
        value: '42.3%',
        label: 'Lower end-to-end energy consumption',
      },
      {
        value: 'Nearly 18.8 h',
        label: 'Estimated on-demand runtime',
      },
    ],
    related: ['palmbench', 'virgile'],
  },
  // Sources: _papers/2024-09-21-PalmBench.md; approved pdfs/palmbench.pdf,
  // Sections 3-4 and Figure 1. Runtime support statements describe that study.
  {
    slug: 'palmbench',
    name: 'PalmBench',
    title:
      'PalmBench: A Comprehensive Benchmark of Compressed Large Language Models on Mobile Platforms',
    category: 'On-Device AI',
    kind: 'Paper',
    venue: 'ICLR 2025',
    summary:
      'An automated benchmark of compressed mobile LLMs that brings resource use, latency, throughput, answer quality, and harmful outputs into one evaluation.',
    cover: '/images/palmbench-overview.png',
    coverAlt:
      'PalmBench paper figure connecting language models, inference frameworks, mobile platforms, and profiling tools.',
    coverFit: 'contain',
    imageCaption:
      'Method illustration: PalmBench models, runtimes, mobile platforms, and profiling tools.',
    publicationId: '2024-09-21-PalmBench',
    authorHtml:
      '<strong>Yilong Li</strong>, Jingyu Liu, Hao Zhang, M Badri Narayanan, Utkarsh Sharma, Shuai Zhang, Pan Hu, Yijing Zeng, Bangya Liu, Jayaram Raghuram, Suman Banerjee',
    resources: [
      { label: 'Paper PDF', href: '/pdfs/palmbench.pdf' },
      { label: 'arXiv', href: 'https://arxiv.org/abs/2410.05315' },
    ],
    sections: [
      {
        id: 'problem',
        title: 'Balancing quality and efficiency on mobile devices',
        paragraphs: [
          'Local language models support offline use and keep prompts on the device. Compression makes larger models fit in mobile memory, while deployment choices also shape response time, energy use, and answer quality.',
          'PalmBench studies how model architecture, quantization, inference runtime, and device hardware interact. Measurements on deployed mobile systems connect model choices to the experience and resource costs of local inference.',
        ],
      },
      {
        id: 'method',
        title: 'Automated measurements on mobile hardware',
        paragraphs: [
          'The framework automates prompt execution and profiling across Android phones, iPhones, and Linux edge devices. Experiments use MLC-LLM and llama.cpp on supported platforms with different weight and activation quantization configurations. Profiling draws on Android Debug Bridge and Android GPU Inspector, Xcode Instruments, and edge-device tooling.',
          'Systems measurements cover CPU and GPU activity, memory footprint, inference latency, throughput, and energy use. Question answering, multi-turn tasks, and hallucination and toxicity checks add the output-quality dimensions needed to compare deployment configurations.',
        ],
        bullets: [
          'Measure resource use and execution behavior on the actual deployment platform.',
          'Compare compressed outputs with non-quantized references and task evaluations.',
          'Include harmful-output checks alongside efficiency and quality measurements.',
        ],
        image: {
          src: '/images/palmbench-overview.png',
          alt: 'PalmBench workflow figure showing models, MLC and llama.cpp, device operating systems, and profiling automation.',
          caption:
            'Method illustration: platform-specific automation for resource and output-quality measurements.',
        },
      },
      {
        id: 'findings',
        title: 'Model and runtime choices shape the trade-off',
        paragraphs: [
          'Quantization changes memory traffic, GPU execution, power use, and output quality, with distinct behavior across models, runtimes, and platforms. Smaller models often deliver higher throughput in the tested configurations, while architecture and runtime choices also influence execution efficiency.',
          'Answer quality, hallucination, and toxicity vary across quantization methods, including non-monotonic differences between nearby bit widths. The findings make task-level evaluation part of the compression decision alongside memory, latency, and energy measurements.',
        ],
      },
      {
        id: 'context',
        title: 'Choosing mobile model configurations',
        paragraphs: [
          'PalmBench organizes the deployment decision around combinations of model, quantization method, runtime, and hardware. Comparing these combinations across quality and systems metrics helps identify configurations suited to a device\'s memory and energy budget and an application\'s tasks.',
          'This measurement-driven approach complements NanoMind\'s execution design. PalmBench characterizes compressed mobile LLM workloads, while NanoMind coordinates the accelerators and shared memory used by a multimodal pipeline.',
        ],
      },
    ],
    related: ['nanomind', 'cppo'],
  },
  // Sources: _projects/2024-9-10-tinyAssist.md; approved
  // pdfs/Re-Mind_for_pitch.pdf, used only as explicitly labeled broader context.
  {
    slug: 'virgile',
    name: 'Virgile',
    title:
      'Virgile: A Multimodal Visual Memory Assistant with Persistent Object and Face Recognition on Edge Devices',
    category: 'On-Device Agents',
    kind: 'Project',
    venue: 'On-device assistant',
    summary:
      'A wearable visual-memory assistant built on NanoMind hardware, combining local vision-language inference with persistent object and face recognition.',
    cover: '/images/virgile-concept.png',
    coverAlt:
      'Concept illustration of a wearable visual assistant, with a person observing surroundings and rendered glasses connected to a small device.',
    coverFit: 'contain',
    imageCaption:
      'Concept illustration: wearable visual assistance with camera glasses and a compact computing device.',
    authorHtml: '<strong>Yilong Li</strong>, Xinmiao Xiong, Suman Banerjee',
    resources: [
      { label: 'Re-Mind slides', href: '/pdfs/Re-Mind_for_pitch.pdf' },
    ],
    sections: [
      {
        id: 'problem',
        title: 'Visual assistance beyond a single observation',
        paragraphs: [
          'A visual-memory assistant connects the current camera view to objects and faces encountered before. Virgile focuses on persistent recognition across observations, bringing continuity to visual assistance on an edge device.',
          'Wearable use also places sensing, inference, and memory within an embedded resource budget. The project investigates how an assistant can connect visual observations to persistent recognition while keeping vision-language inference local.',
        ],
      },
      {
        id: 'system',
        title: 'Persistent recognition on the NanoMind platform',
        paragraphs: [
          'Virgile is built on the NanoMind hardware platform. It combines custom sensors, embedded hardware, accelerator-aware software, and local vision-language inference to support persistent object and face recognition.',
          'NanoMind provides resource-aware local execution, while Virgile focuses on visual-memory assistance. Pairing embedded sensing with persistent recognition connects new visual observations to familiar objects and faces over time.',
        ],
        image: {
          src: '/images/virgile-concept.png',
          alt: 'Concept drawing of a wearable visual-memory assistant and rendered camera glasses with an attached computing device.',
          caption:
            'Concept illustration: a wearable assistant for visual understanding and memory.',
        },
      },
      {
        id: 'prototype-scope',
        title: 'Visual understanding and face-and-item memory',
        paragraphs: [
          'Persistent recognition gives the project a concrete focus: making encountered objects and faces part of the assistant\'s visual memory. Local multimodal inference and embedded sensing provide the foundations for that continuity.',
          'The Re-Mind slides describe a real-time demonstration of visual understanding and face-and-item memory on custom-built hardware. They place this capability within the broader research program on personalized memory assistance.',
        ],
      },
      {
        id: 'context',
        title: 'Toward personalized memory assistance',
        paragraphs: [
          'The broader Re-Mind direction explores personalized memory and cognitive accessibility, with goals such as understanding surroundings and finding items. Virgile contributes the local perception and persistent-recognition foundations for this direction.',
          'The project brings together the embedded systems and application questions: how to run multimodal inference within a wearable resource budget, and how to make visual observations useful across repeated encounters.',
        ],
      },
    ],
    related: ['nanomind', 'palmbench'],
  },
  // Sources: _papers/2026-05-26-cppo.md; arXiv:2605.27000v3,
  // Sections 3.1-3.2 and 4.3 for the validity gate and budget distinction.
  {
    slug: 'cppo',
    name: 'CPPO',
    title: 'Cast a Wider Net: Coordinated Pass@K Policy Optimization for Code Reasoning',
    category: 'Efficient Models',
    kind: 'Paper',
    venue: 'EMNLP 2026',
    summary:
      'A code-reasoning post-training method that coordinates alternative plans and a shared solver, rewarding valid strategy sets only when execution confirms success.',
    cover: '/images/cppo-overview.svg',
    coverAlt: 'Explanatory drawing of a planner, alternative strategies, a shared solver, and verification.',
    coverFit: 'contain',
    imageCaption:
      'Method illustration: coordinated planning, shared solving, and verification.',
    publicationId: '2026-05-26-cppo',
    authorHtml: '<strong>Yilong Li</strong>, Suman Banerjee, Tong Che',
    resources: [
      { label: 'arXiv', href: 'https://arxiv.org/abs/2605.27000' },
      { label: 'Paper PDF', href: 'https://arxiv.org/pdf/2605.27000' },
    ],
    sections: [
      {
        id: 'problem',
        title: 'Repeated attempts can repeat the same mistake',
        paragraphs: [
          'For code generation, pass@K asks whether at least one of K attempts succeeds. Independent samples can spend that budget on nearly identical reasoning paths, offering little additional coverage when the dominant strategy fails.',
          'CPPO treats the attempts as a coordinated set. A planner distributes the available attempts across complementary algorithmic methods, making strategy exploration part of the policy.',
        ],
      },
      {
        id: 'method',
        title: 'A planner, a shared solver, and two checks',
        paragraphs: [
          'A planner generates a tuple of alternative high-level methods; a shared solver attempts one implementation per method. Later plans condition on earlier plans, so the policy can coordinate exploration across the tuple.',
          'A learned validity gate checks the strategy tuple, while an execution verifier checks solver outcomes. The multiplicative planner reward combines these signals: the planner receives credit when a valid tuple produces at least one passing solution.',
        ],
        image: {
          src: '/images/cppo-overview.svg',
          alt: 'Method illustration of coordinated planning, shared solving, and verification for code reasoning.',
          caption:
            'Method illustration: one strategy tuple guides a shared solver, with one verified code attempt per strategy.',
        },
      },
      {
        id: 'findings',
        title: 'Better coverage at a matched attempt budget',
        paragraphs: [
          'The paper reports improved pass@4 on APPS, CodeContests, and LiveCodeBench-v6 compared with direct sampling, planning baselines, planner-only supervised fine-tuning, and pass@K-oriented reinforcement learning.',
          'With the solver-attempt budget held fixed, the results show the value of coordinating how those attempts explore the problem. Joint planner-solver training turns a collection of samples into a strategy-level search policy.',
        ],
      },
      {
        id: 'context',
        title: 'Learning to allocate reasoning effort',
        paragraphs: [
          'CPPO connects test-time exploration to post-training. The planner learns which sets of methods give the solver useful alternatives, while branch-level verifier feedback trains the solver to execute those methods.',
          'The contribution is a way to allocate a finite reasoning budget on verifiable programming tasks. It makes complementary strategies, plan validity, and execution outcomes part of one coordinated learning objective.',
        ],
      },
    ],
    related: ['palmbench', 'nanomind'],
  },
  // Sources: _papers/2025-12-09-Medusa.md; approved pdfs/medusa_Li.pdf,
  // Sections 1-3. The PDF uses a longer "Multi-View" title; identity follows metadata.
  {
    slug: 'medusa',
    name: 'MEDUSA',
    title: 'Scalable Biometric Sensing in the Wild through Distributed MIMO Radars',
    category: 'Wireless Sensing',
    kind: 'Paper',
    venue: 'MobiCom 2025',
    summary:
      'A distributed UWB MIMO radar system that combines wireless synchronization, multiple spatial views, and learned signal separation for contactless vital-sign sensing.',
    cover: '/images/medusa-hardware.png',
    coverAlt: 'Photograph of the MEDUSA radar motherboard with an array of RF modules and connectors.',
    coverFit: 'cover',
    coverPosition: 'center',
    imageCaption:
      'Prototype photo: MEDUSA radar motherboard and RF modules.',
    publicationId: '2025-12-09-Medusa',
    authorHtml:
      '<strong>Yilong Li</strong>, Ramanujan K Sheshadri, Karthik Sundaresan, Eugene Chai, Yijing Zeng, Jayaram Raghuram, Suman Banerjee',
    resources: [
      { label: 'Paper PDF', href: '/pdfs/medusa_Li.pdf' },
      { label: 'arXiv', href: 'https://arxiv.org/abs/2310.05507' },
      { label: 'Code', href: 'https://github.com/JimmyLi-Network/Medusa_UWB_MIMO' },
    ],
    sections: [
      {
        id: 'problem',
        title: 'Vital signs amid motion and blocked signal paths',
        paragraphs: [
          'Breathing and heartbeat produce subtle signals within radar reflections. In an occupied room, those signals mix with body movement, changing orientation, furniture, and multipath. A single sensing view can lose useful information when a person turns away or an obstacle blocks the path.',
          'MEDUSA develops contactless vital-sign sensing for these changing indoor conditions. Distributed radar arrays capture complementary spatial views as people move and signal paths change.',
        ],
      },
      {
        id: 'hardware',
        title: 'Distributed, wirelessly synchronized UWB MIMO',
        paragraphs: [
          'The hardware supports a coherent UWB MIMO array that can be divided into spatially distributed sub-arrays. Wireless synchronization lets the system coordinate those views, while the hardware and data-processing pipeline support collection and processing of the multi-antenna signals.',
          'The design balances antenna gain against spatial diversity. Concentrating antennas strengthens one view; distributing them provides alternatives when a view is obstructed or poorly aligned. Array placement and partitioning are therefore part of the sensing design.',
        ],
        image: {
          src: '/images/medusa-hardware.png',
          alt: 'MEDUSA radar motherboard photographed with multiple RF modules, coaxial connectors, and central processing hardware.',
          caption:
            'Prototype photo: MEDUSA radar hardware with RF modules and central processing hardware.',
        },
      },
      {
        id: 'learning',
        title: 'Recovering physiological signals across views',
        paragraphs: [
          'The learning system uses self-supervised contrastive learning and multi-head attention to separate vital-sign waveforms from mixed radar returns. Attention relates to transmit-receive antenna pairs, allowing the model to combine spatial information instead of treating every channel as equally useful.',
          'Distributed measurements provide spatial diversity, and the model recovers the weaker physiological component amid movement and environmental reflections. Hardware, synchronization, and learned signal extraction work together to turn multi-view radar returns into vital-sign waveforms.',
        ],
        image: {
          src: '/images/medusa-signal.png',
          alt: 'Radar signal figure showing range-bin data over time for multiple antennas.',
          caption:
            'Signal visualization: radar returns organized by antenna, range bin, and time.',
        },
      },
      {
        id: 'findings',
        title: 'Multi-view sensing in everyday environments',
        paragraphs: [
          'The evaluation spans stationary and moving participants, varying locations and orientations, obstructed paths, multiple subjects, and familiar and unfamiliar indoor environments. The findings show how spatial diversity sustains vital-sign sensing when individual views become unreliable.',
          'MEDUSA connects distributed RF hardware to a learning system designed for dynamic indoor sensing. The work highlights the joint importance of array geometry, coherent synchronization, and multi-view signal extraction when recovering subtle physiological motion.',
        ],
      },
    ],
  },
  // Source: approved pdfs/EMBER_Li.pdf, Sections 1-4, Table 1, and Figures 1-2.
  {
    slug: 'ember',
    name: 'EMBER',
    title: 'EMBER: Efficient Memory via Budgeted Evidence Retention for Long-Horizon Agents',
    category: 'Efficient Models',
    kind: 'Paper',
    venue: 'arXiv preprint',
    summary:
      'A learned memory policy that preserves source-backed evidence before future questions are known, helping long-horizon agents work within a fixed evidence budget.',
    cover: '/images/ember-overview.png',
    coverAlt: 'EMBER paper diagram comparing query-conditioned memory and full-log retrieval with pre-query, budgeted evidence retention.',
    coverFit: 'contain',
    imageCaption:
      'System overview: retain source-backed evidence before the query arrives, then retrieve and select it for answering (Figure 1).',
    publicationId: '2026-05-07-ember',
    authorHtml: '<strong>Yilong Li</strong>, Suman Banerjee, Tong Che',
    resources: [
      { label: 'Paper PDF', href: '/pdfs/EMBER_Li.pdf' },
    ],
    sections: [
      {
        id: 'problem',
        title: 'What should an agent remember before it knows the question?',
        paragraphs: [
          'Long-running agents encounter conversations, documents, and tool traces long before they know which details a future request will need. Archiving everything does not make those details cheap to retrieve or fit into a model\'s context.',
          'EMBER studies Budgeted Pre-Query Retention: memory is written while the future question is hidden, only a fixed amount of source evidence can survive, and the reader later answers without returning to the full raw history. The challenge is choosing evidence that will still be useful and findable.',
        ],
      },
      {
        id: 'memory-policy',
        title: 'Evidence capsules, not generic summaries',
        paragraphs: [
          'The writer uses answerability probes to identify source spans that could support later information needs. Each retained capsule pairs a verbatim source excerpt with a title, entity anchors, retrieval keys, and update metadata. The evidence stays grounded in the original stream, while its retrieval handles make it searchable after the question arrives.',
          'A deterministic budget layer validates source grounding, counts excerpt tokens, and applies the writer\'s insert, merge, overwrite, or skip proposals. At read time, retrieval and evidence selection operate on the retained capsules. The reported budget caps source-excerpt tokens; retrieval metadata is accounted for separately.',
        ],
        bullets: [
          'Choose what evidence survives before the future question is available.',
          'Keep verbatim source excerpts together with useful retrieval handles.',
          'Retrieve and select retained evidence for the reader when a query arrives.',
        ],
      },
      {
        id: 'training',
        title: 'Learning from the eventual answer',
        paragraphs: [
          'EMBER trains Qwen2.5-7B and Qwen2.5-14B memory-policy backbones with an answer-gated evidence-chain reward. A rollout first writes memory, then reveals the question, retrieves and selects evidence, and produces an answer. Earlier memory decisions receive delayed feedback from that complete chain.',
          'The clipped GRPO-style update targets a curriculum-selected writer action or read-selection turn; the answer turn is score-only. Training samples evidence budgets from 512 to 8,192 tokens and includes multi-hop, update, temporal, and abstention episodes, so the policy learns which evidence to preserve as the budget changes.',
        ],
      },
      {
        id: 'findings',
        title: 'More useful evidence at the same retained budget',
        paragraphs: [
          'On LongMemEval-RR, EMBER-14B reaches 0.3017 answer F1 at an 8,192-token retained source-evidence budget, compared with 0.1765 for the strongest non-EMBER budgeted baseline. This comparison uses a Qwen2.5-14B memory writer, a GPT-4o reader, and top-10 retrieval.',
          'The evaluation measures retained evidence, evidence reaching the reader, and final answer quality separately. This makes it possible to distinguish evidence forgotten during writing from evidence missed during retrieval. The budget frontier shows how learned retention improves the use of a limited evidence state.',
        ],
        image: {
          src: '/images/ember-budget-frontier.png',
          alt: 'EMBER paper plots of answer F1, retained-evidence recall, and read-evidence recall across source-evidence budgets from 512 to 8192 tokens.',
          caption: 'LongMemEval-RR results across retained source-evidence budgets (Figure 2).',
        },
      },
    ],
    highlights: [
      { value: '8,192', label: 'Retained source-evidence tokens' },
      { value: '0.3017', label: 'Answer F1 with the 14B writer', note: 'LongMemEval-RR; GPT-4o reader.' },
    ],
    related: ['virgile', 'cppo'],
  },
];

export function getWork(slug: string): ResearchWork | undefined {
  return works.find((work) => work.slug === slug);
}
