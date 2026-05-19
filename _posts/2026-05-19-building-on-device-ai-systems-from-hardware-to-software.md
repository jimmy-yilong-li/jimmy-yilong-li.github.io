---
layout: post
title: "Building On-Device AI Systems from Hardware to Software"
date: 2026-05-19
status: "Prototype"
theme: "On-device AI"
summary: "Notes on building battery-powered AI devices that combine custom hardware, sensors, runtimes, and local multimodal inference."
---

My on-device AI work starts from the device rather than the cloud. NanoMind and
Virgile combine custom wearable hardware, cameras and sensors, local inference
runtimes, and multimodal models that run without relying on a network
connection.

The research challenge is system integration. Hardware constraints shape model
choice, memory layout, accelerator scheduling, and user-facing latency. A good
edge AI system needs hardware and software to be designed together, not patched
together after model selection.
