---
layout: '../../layouts/ArticleLayout.astro'
title: "The End of Rapid Iteration"
summary: "Why acceleration is becoming the new competitive advantage."
date: 2026-11-07
minutes: 7
cover: /images/speed-acceleration.svg
coverMobile: /images/speed-acceleration-mobile.svg
coverAlt: "Two conceptual charts compare development speed over time with irregular fluctuations: blue maintains a higher speed on the left; on the right, blue accelerates above red from the same starting point despite local setbacks."
coverCaption: "Conceptual illustration, not measured data. Left: a higher development speed despite day-to-day fluctuations. Right: the development system also improves, allowing the speed advantage to grow. Development speed means validated progress per unit of time."
relatedSlug: what-we-learned-the-hard-way-about-npus-gpus-and-unified-memory
---

A team can ship faster without becoming better at shipping. Give it more
engineers, more compute, or more coding agents, and its output may rise. But
when the next difficult problem arrives, it may still search through the same
bad ideas, trust the same misleading benchmarks, and discover the same
limitations all over again.

For a company trying to survive, that distinction matters. A high rate of
output looks reassuring until a competitor starts increasing its own rate.
You can be working harder than ever and still be losing ground.

My argument is that AI changes what a durable engineering advantage looks
like. As more of development becomes accessible through agents, being able to
build quickly becomes easier to buy. The harder advantage is a development
system that keeps increasing its capacity to produce useful improvements.
Speed describes that capacity today. Acceleration describes how quickly it
is growing.

This is what I mean by the end of rapid iteration. Iteration remains essential;
its speed alone becomes a less secure basis for competition. The question is
what each iteration leaves behind for the next one.

## Two things are being built

Imagine two teams starting with the same models, tools, and computing budget.
Both have agents that write code, run tests, and revise a patch when it fails.
Initially, they make progress at about the same rate.

The first team spends its effort on the product. It delivers features, fixes
bugs, and improves performance. Its agents are useful, but each new task
passes through much the same machinery as the previous one.

The second team also treats that machinery as something under development.
When an agent wastes hours following an unproductive approach, the team asks
what would have allowed it to reject the approach earlier. If an agent's code
passes every test but makes the product slower in actual use, the team adds
tests that reproduce those conditions. Future agents use those tests before
submitting their changes. The lesson becomes part of how the agents work,
rather than something a developer has to remember.

The two teams could publish identical release notes while making very
different investments in their future. One has delivered a better product.
The other has also changed the starting conditions for its next project.

Good engineering organizations already do this. Postmortems, regression tests,
and better tooling are not inventions of AI. The interesting step is whether
agents can participate in improving this process themselves: diagnosing their
own failures, proposing changes to how they work, and testing those changes
before carrying them forward.

That is the practical version of **Recursive Self-Improvement (RSI)** I am
interested in here. The system includes the model, its tools, its memory, and
the procedures around it. Improving that system need not mean rewriting the
model's weights. But running a fixed agent workflow more often does not
qualify either. The method has to change, and the change has to help with
subsequent work.

Research such as the [Darwin Godel Machine](https://arxiv.org/abs/2505.22954)
explores this distinction by having coding agents modify their own code and
evaluating the resulting variants on coding tasks. That is evidence for a
bounded mechanism, not proof that a company can automate its way to unlimited
growth. It gives the larger argument something concrete to build on.

## What a failed optimization can buy

Consider a hypothetical agent optimizing an inference engine. It writes a
kernel that beats the existing implementation in a microbenchmark. The change
looks promising, but inside the complete runtime it makes generation slower.

Suppose the benchmark kept the inputs warm in cache. The real workload streams
weights and competes for memory bandwidth. The agent has optimized a situation
that scarcely exists where the code will actually run.

Reverting the patch protects the product. Adding a representative workload
to the benchmark protects future patches. Both are useful, familiar pieces of
engineering. The opportunity for a self-improving loop is to go further and
revise how it decides which optimizations deserve expensive evaluation.

It could preserve the input shapes, cache conditions, hardware configuration,
and measurements that explain the failure. It could then propose a screening
procedure: check memory behavior under representative load before spending
hours tuning arithmetic. The proposed procedure would itself need testing.
Does it reject misleading candidates earlier without discarding useful ones?
Does it help on held-out workloads, rather than only on the failure that
suggested it?

If it survives those checks, subsequent searches inherit a better method.
The value of the failed kernel now extends beyond the kernel. It has changed
how the system spends its next hundred hours.

There is an important distinction between this and simply collecting errors.
A log saying "candidate 37 was slower" contains little reusable knowledge.
A record of when it was slower, why the original measurement missed that,
and which corrective procedure actually helped is a different asset.

Nor does one useful lesson establish sustained acceleration. A better test
may produce a one-time increase in productivity. Continued growth requires a
process that can keep finding, checking, and retaining further improvements.
The recursive part becomes meaningful when experience also improves how the
system extracts lessons: which failures it investigates, what evidence it
keeps, and how it distinguishes a general lesson from an isolated accident.

Failure supplies material for that process. It is not the process itself.
A system that absorbs its own mistakes uncritically can become confidently
worse. The evaluation must retain an independent check on reality, through
held-out tasks, real workloads, and the ability to reject or roll back an
apparently clever change.

## Experience that earns its keep

A finished implementation hides much of the history of its discovery. It
shows the path that worked, but rarely explains why other plausible paths
were abandoned. A competitor reading the code may learn the solution without
learning which measurements were deceptive or which constraints took months
to uncover.

That missing history is often treated as disposable. It lives in closed
issues, benchmark folders, abandoned branches, or the memory of someone who
has since moved on. In a self-improving development system, it has another
possible use: improving the decisions that have not yet been made.

I think of this as **experience capital**. The term should be earned. A large
archive is not capital merely because it is large. The experience becomes
productive when it can be retrieved with its relevant context, checked for
continued validity, and turned into a reusable improvement. An old hardware
workaround that no longer applies can be a liability rather than an asset.

This gives failure histories a role beyond helping someone remember what went
wrong. They can inform the production system's search strategy. A failed
experiment may eliminate an attractive dead end; a misleading result may
reveal a weakness in the evaluator; a deployment incident may expose a class
of conditions that development never considered. Each offers a different way
to make later work more effective.

The advantage is not necessarily secrecy. Open projects can share reproductions,
negative results, and improved tools, allowing experience to accumulate across
organizations. What matters is whether those lessons enter the working system.
Possessing the record and benefiting from it are separate accomplishments.

A company with years of history may therefore learn less than a young project
with a good feedback loop. The younger project has less experience to draw on,
but more of what it encounters changes what it does next.

## Acceleration wins

Return to the two teams. The first can respond to competitive pressure by
running more agents. That may be exactly the right decision for an urgent
deadline. But if those agents repeat the same expensive mistakes, buying more
capacity does not resolve the underlying disadvantage.

The second team invests part of today's effort in changing tomorrow's
production system. That investment has a cost: time spent improving an
evaluator is time not spent shipping a feature. It pays off only if the new
method produces enough useful progress in later work. Recursive improvement
is not an exemption from engineering economics.

The opening charts isolate this difference. Their vertical axis is development
speed, understood as validated progress per unit of time, not commits or agent
calls. In the left panel, the faster team maintains its lead despite local fluctuations. In the
right, both begin at the same speed, but improving the product and its builder
allows the blue team's capacity to grow faster. The widening gap illustrates
the argument; it is not a measured forecast or a claim that growth continues
forever.

Customers, distribution, resources, and the choice of problem still matter.
Higher acceleration does not guarantee victory from every starting position.
But within engineering, it changes what a rival has to catch. Matching a
feature is one task. Matching a system that keeps getting better at producing
features is another.

I expect this to make the self-improvement loop a central concern for companies
and projects that want to last. A rival's better loop creates pressure to
improve your own, even when your current release cadence looks healthy.
Yesterday's speed can remain impressive long after it has stopped being enough.

The most consequential outcome of a project may then be something its users
never see: a development system that approaches the next problem with better
tools and fewer expensive illusions. The product is the immediate result.
The improved builder changes the cost of everything that follows.

Rapid iteration asks how soon the next version can ship. Recursive acceleration
asks what shipping it will teach the system that builds the version after that.
For a company measuring its future in years rather than releases, I think the
second question is becoming the more important one.
