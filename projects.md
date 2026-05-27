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
      A compact view of the main systems I am building. The publication list
      remains the complete record; this page explains the project context behind
      selected papers and prototypes.
    </p>
  </div>

  <div class="project-grid">
    <article class="project-card">
      <div class="project-card-body">
        <p class="project-kicker">Wireless Sensing</p>
        <h3>Medusa Wireless Sensing</h3>
        <p>
          <strong>Focus:</strong> Scalable biometric and vital-sign sensing with
          distributed UWB MIMO radar in real indoor environments.
        </p>
        <p>
          <strong>System contribution:</strong> RF hardware, wireless
          synchronization, embedded data collection, and learning-based recovery
          of vital-sign waveforms from mixed motion and sensing signals.
        </p>
        <p>
          <strong>Related work:</strong> MEDUSA, MobiCom 2025; Gemini, mmWave
          sensing and communication.
        </p>
        <p class="publication-links">
          <a href="https://github.com/JimmyLi-Network/Medusa_UWB_MIMO">Code</a>
          <a href="/publications/">Publications</a>
        </p>
      </div>
    </article>

    <article class="project-card">
      <div class="project-card-body">
        <p class="project-kicker">On-Device AI</p>
        <h3>On-Device AI</h3>
        <p>
          <strong>Focus:</strong> Multimodal assistants that run locally on
          battery-powered edge devices rather than relying on cloud inference.
        </p>
        <p>
          <strong>System contribution:</strong> NanoMind and Virgile combine
          custom device prototypes, embedded software, accelerator-aware
          scheduling, and local vision-language inference for persistent object
          and face recognition.
        </p>
        <p>
          <strong>Artifact:</strong> 3D-printed hardware prototype and demo
          system close to completion.
        </p>
        <p class="publication-links">
          <a href="/publications/">Related papers</a>
        </p>
      </div>
    </article>

    <article class="project-card">
      <div class="project-card-body">
        <p class="project-kicker">ML Systems</p>
        <h3>ML Sys / EdgeFlow</h3>
        <p>
          <strong>Focus:</strong> Efficient edge inference pipelines across
          heterogeneous accelerators and private device runtimes.
        </p>
        <p>
          <strong>System contribution:</strong> EdgeFlow is the project umbrella
          for accelerator-aware ML systems work, including Split to Fit style
          model partitioning and CRANE, a direct Apple Neural Engine inference
          runtime that bypasses Core ML.
        </p>
        <p>
          <strong>Related work:</strong> Split to Fit, PalmBench, CRANE, and
          efficient mobile LLM/LMM execution.
        </p>
        <p class="publication-links">
          <a href="/publications/">Related papers</a>
        </p>
      </div>
    </article>

    <article class="project-card">
      <div class="project-card-body">
        <p class="project-kicker">LLM Post-Training</p>
        <h3>LLM RL Fine-Tuning</h3>
        <p>
          <strong>Focus:</strong> Reinforcement-learning fine-tuning for LLMs
          that must reason, remember, and retrieve under limited context and
          compute budgets.
        </p>
        <p>
          <strong>System contribution:</strong> EMBER studies budgeted evidence
          retention for long-horizon agents, while CPPO trains coordinated
          pass@K policies for diverse code reasoning attempts.
        </p>
        <p>
          <strong>Related work:</strong> EMBER and CPPO arXiv drafts.
        </p>
        <p class="publication-links">
          <a href="/publications/">Related papers</a>
          <a href="https://arxiv.org/abs/2605.27000">CPPO arXiv</a>
        </p>
      </div>
    </article>
  </div>
</section>
