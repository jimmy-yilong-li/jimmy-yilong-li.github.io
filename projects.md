---
layout: layout
title: Projects
permalink: /projects/
---

<section class="home-section projects-page">
  <div class="section-heading">
    <p class="section-label">Research Systems</p>
    <h1>Projects</h1>
    <p class="section-intro">
      A compact view of three current research lines. The publication list
      remains the complete record; this page explains the project context behind
      selected papers, prototypes, and ongoing work.
    </p>
  </div>

  <div class="project-detail-list">
    <article class="project-card">
      <div class="project-card-body">
        <p class="project-kicker">RL Finetuning for Small Models</p>
        <h3>RL, SFT, and Agentic Memory</h3>
        <p>
          <strong>Focus:</strong> Improving small language models under limited
          context, memory, and compute budgets.
        </p>
        <p>
          <strong>Ongoing project:</strong> Reinforcement-learning fine-tuning,
          supervised fine-tuning, and agentic-memory policies that decide what
          to write, retain, and recall for downstream solvers.
        </p>
        <p>
          <strong>Representative work:</strong> EMBER studies budgeted evidence
          retention for long-horizon agents; CPPO trains coordinated pass@K
          policies for diverse code reasoning attempts.
        </p>
        <p class="publication-links">
          <a href="/publications/">Related papers</a>
          <a href="https://arxiv.org/abs/2605.27000">CPPO arXiv</a>
        </p>
      </div>
    </article>

    <article class="project-card">
      <img
        class="project-image project-image--diagram"
        src="/images/mmpupil-system.png"
        alt="mmPupil wearable radar and front-facing camera system overview"
      />
      <div class="project-card-body">
        <p class="project-kicker">Wireless Human Sensing</p>
        <h3>mmPupil</h3>
        <p>
          <strong>Focus:</strong> In-the-wild pupillometry and cognitive
          sensing with a glasses-mounted 60 GHz mmWave radar and front-facing
          illumination context.
        </p>
        <p>
          <strong>Ongoing project:</strong> mmPupil estimates pupil dynamics
          with radar, uses the front-facing camera to model light-driven pupil
          changes, and subtracts that component before workload inference.
        </p>
        <p>
          <strong>Status:</strong> Under review. The draft is not publicly
          linked.
        </p>
        <p>
          <strong>Representative work:</strong> MEDUSA, LiveTag, and Gemini
          frame the broader wireless human sensing direction.
        </p>
        <p class="publication-links">
          <a href="https://github.com/JimmyLi-Network/Medusa_UWB_MIMO">MEDUSA Code</a>
          <a href="/publications/">Publications</a>
        </p>
      </div>
    </article>

    <article class="project-card">
      <div class="project-card-body">
        <p class="project-kicker">On-Device AI</p>
        <h3>Virgile / NanoMind</h3>
        <p>
          <strong>Focus:</strong> Privacy-preserving cognitive assistants and
          multimodal AI devices that run locally rather than relying on cloud
          inference.
        </p>
        <p>
          <strong>System contribution:</strong> Re-Mind, NanoMind, and Virgile
          combine custom device prototypes, embedded software,
          accelerator-aware scheduling, local vision-language inference, and
          real-world episodic memory.
        </p>
        <p>
          <strong>Artifact:</strong> 3D-printed hardware prototype and demo
          system close to completion, backed by runtime and benchmarking work
          such as PalmBench, Tiny but Mighty, and CRANE.
        </p>
        <p class="publication-links">
          <a href="/publications/">Related papers</a>
        </p>
      </div>
    </article>
  </div>
</section>
