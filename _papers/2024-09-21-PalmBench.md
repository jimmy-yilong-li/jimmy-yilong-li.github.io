---
layout: papers
title: "PalmBench: A Comprehensive Benchmark of Compressed Large Language Models on Mobile Platforms"
date: 2024-9-21
image: /images/palmbench.png
featured: true
venue: "ICLR 2025"
authors: "<strong>Yilong Li</strong>, Jingyu Liu, Hao Zhang, M Badri Narayanan, Utkarsh Sharma, Shuai Zhang, Pan Hu, Yijing Zeng, Bangya Liu, Jayaram Raghuram, Suman Banerjee"
link: https://arxiv.org/abs/2410.05315
arxiv: https://arxiv.org/abs/2410.05315
abstract: >
  Deploying large language models (LLMs) locally on mobile devices is advantageous
  in scenarios where transmitting data to remote cloud servers is either undesirable
  due to privacy concerns or impractical due to network connectivity. Recent 
  advancements have facilitated the local deployment of LLMs. However, local 
  deployment also presents challenges, particularly in balancing the (generative) 
  quality, latency, and throughput within the hardware constraints of mobile devices.
  In this paper, we introduce our lightweight, all-in-one automated benchmarking 
  framework that allows users to evaluate LLMs on mobile devices. We provide a 
  comprehensive benchmark of various popular LLMs with different quantization 
  configurations (both weights and activations), across multiple mobile platforms 
  with varying hardware capabilities. Unlike traditional benchmarks that assess 
  full-scale models on high-end GPU clusters, we focus on evaluating resource 
  efficiency (memory and power consumption) and harmful output for compressed 
  models on mobile devices. Our key observations include: i) differences in energy 
  efficiency and throughput across mobile platforms; ii) the impact of quantization 
  on memory usage, GPU execution time, and power consumption; iii) accuracy and 
  performance degradation of quantized models compared to their non-quantized 
  counterparts; and iv) the frequency of hallucinations and toxic content generated 
  by compressed LLMs on mobile devices.
pdf: /pdfs/palmbench.pdf
bib: |-
  @misc{li2024palmbenchcomprehensivebenchmarkcompressed,
      title={PalmBench: A Comprehensive Benchmark of Compressed Large Language Models on Mobile Platforms}, 
      author={
          Yilong Li and Jingyu Liu and Hao Zhang and 
          M Badri Narayanan and Utkarsh Sharma and 
          Shuai Zhang and Pan Hu and Yijing Zeng and 
          Jayaram Raghuram and Suman Banerjee
      },
      year={2024},
      eprint={2410.05315},
      archivePrefix={arXiv},
      primaryClass={cs.LG},
      url={https://arxiv.org/abs/2410.05315}, 
  }
---
