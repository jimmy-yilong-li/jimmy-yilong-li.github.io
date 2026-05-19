---
layout: post
title: "RL Post-Training for Efficient Edge AI"
date: 2026-05-18
status: "Ongoing"
theme: "Model efficiency"
summary: "Using reinforcement-learning post-training to make models more useful under strict memory, context, and compute budgets."
---

I am interested in post-training methods that make AI systems more efficient
after the base model already exists. In EMBER and StoreAgent, this means moving
beyond static retrieval and training memory policies that decide what evidence
to retain, how to structure it, and how to recall it later.

This direction connects model behavior to systems constraints. Edge AI often has
small memory budgets, expensive context windows, and limited compute. A useful
model should learn policies that respect those constraints instead of assuming
unbounded retrieval or full-history access.
