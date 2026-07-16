AGENTS: DO NOT COMMIT THIS FILE TO THE REPO

The Great Flattening
For the engineer who became the whole engineering org.
The models woke up.
Something happened in the last year that most people haven't fully processed. The models got superhuman at programming, not trending there, not approximately, but genuinely superhuman right now. I was once ranked the number one coder in India, across Google Code Jam, Topcoder, ACM ICPC. The frontier models beat me by a longshot. I'm in awe every day.
Benchmark

What it tests

Earlier model

Today's frontier
SWE-bench Verified

Resolving real-world GitHub issues

33% (GPT-4o, 2024
)

88.2% (Claude Opus 4.8, 2026), and the benchmark is now saturated
Terminal-Bench 2.1

Agentic coding on real terminal tasks

88.0% (GPT-5.5, 2026
)

91.9% (GPT-5.6 Sol Ultra, 2026
)
Codeforces

Competitive programming

11th percentile (GPT-4o, 2024
)

99.8th percentile (o3, 2025
)
IOI

International informatics olympiad

49th percentile (o1, 2024
)

gold-medal level (2025)
Models this strong no longer fit inside your computer. Each release runs longer on its own, plans its own work, spawns its own helpers. A machine that has to sit open under your hands is the wrong home for that. The future of development is in the cloud. The rest of this document is why, and what it takes.
Image
You're still in the loop.
With every release the models run longer and perform better on their own. And yet walk into any engineering org and the humans are still in the loop: prompting, reviewing, course-correcting, chained to the machine. I lived it. I used Claude Code heavily and babysat every session, and intervening too much negated the speed advantage. While letting it run unsupervised lost the direction. The newest models killed most of that. They run unattended for hours, plan their own work, compact their own context, and check their own output before reporting back. So the babysitting is over? No. It moved up a level, the way bottlenecks do. You used to babysit the session. Now you babysit the system: whether you can trust a merge you didn't read line by line, whether twenty autonomous sessions can hit one codebase without trampling each other, whether any of it ran against your real stack before it reached you.
You want massive parallelism. You want to close the laptop and come back to finished work. The more you are taken out of the loop, the more the work has to run in the cloud.
Then why isn't everyone running in the cloud already? Because the cloud they were offered is blind. The agents write code on a VM somewhere, but they can't run your app and they can't test it end to end running all your services. So every branch comes back down to the laptop to be checked, and the loop has you again.  The cloud really needs to solve running and testing things end to end to be able to save you time.
Image
The whole company flattens.
The code stopped being the hard part. Engineers used to take a directive from a manager, hear requirements from a PM, and execute, with information decaying at every hop and the iterations stretching the timeline. That is over. When you can go from idea to production code in minutes, the scarce thing becomes having new ideas, pulling requirements from the customer directly, and running the next experiment. I was previously the co-founder/CTO of Rippling, worth $10B+
 today. These days I ship more lines of code than my own engineers every week, not because I'm a better programmer but because customers give me ideas on calls and those ideas go straight into sessions and get merged before the call is over. Backlogs shouldn't exist anymore. An idea should become production impact in a few hours.
Follow that shift all the way out, past your own desk, and it redraws the whole company. Every company has a fixed human cell boundary: the surface that faces the outside world. Sales, customer relationships, the moments a human has to represent the company to another human. That stays human... for now. Everything inside the boundary, the planning, the design, the architecture, the review, the execution, collapses toward the harness, the system that runs the work. The org chart doesn't shrink so much as change shape. One person inside, or zero. That is the great flattening.
Image
So the job goes meta. You stop solving the task in front of you and start solving why the organism couldn't solve it itself. Everyone's real work becomes self-profiling: what decision-making framework is in your head that isn't in the codebase, how you triage, what data you reach for, the contrarian call nobody else would make. That judgment is the only scarce thing left. So where does it go?
The harness.
If the job is now to codify the judgment instead of doing the work, the judgment needs somewhere to live. It lives in the harness. The harness is the one place your engineering principles stop sitting in your head and start running on every session: how you triage, the architecture calls only you would make, the bar nothing ships below. Write them in a doc and they decay the day after, unread. Put them in the harness and it applies that judgment a thousand times without you in the room, on work you will never see. That is the meta-job made physical. Your principles reach a new hire lossy, half of them never said out loud; they reach the harness lossless, and they compound, because every call you encode is a call you never make again. It is the one thing a competitor cannot copy, because it is the shape of your company, written down.
Image
And there is a second reason the harness has to be yours. Every model release eats the layer beneath it. Hand-built context management, custom sub-agent setups, the clever workarounds people roll by hand: the labs watch what works and ship it built in, so the trick you depend on this quarter is a default next quarter. Betting on mechanics is betting against the labs, and you lose that bet every release. Two things they structurally cannot ship, though. The first is your judgment, the calls only you would make, which is the whole point above. The second is neutrality. The labs' harness dispatches its own sub-agents and runs its own reviewers now, real engineering, genuinely good, but always from one family, tuned for the median codebase, because no lab will ever route your work to a competitor's model. Because we train none, the layer stays neutral: your judgment, run across every lab's best model, the work moving to whichever one wins a given job this week. We train none. The labs ship their opinion. Nobody ships yours.
Profile the bottleneck. Drown it in tokens.
So how do you build that harness? Not with a smarter model, and not with a faster autocomplete. The people already living this way converged on a method instead: tune the setup to your own codebase and throw tokens at the parts of the lifecycle that keep tripping you up. There's a popular term for it: tokenmaxxing.
Image
Those who have figured it out are in a new paradigm. Headcount stays low, information symmetry and rate of ideation stay high. The feature your team has been saying no to for months because the queue was full: done by morning. Some of my customers today:

    A PM is now the full R&D team. He reloads $1,000 a day in tokens and merges code faster than any team he's managed.
    A solo founder who raised venture funding decided not to hire at all.


Senior engineer

Tokens
Cost

$300-500K fully loaded

Few dollars per task
Time to start

Months to hire, weeks to onboard

Minutes
Parallelism

One task at a time

Horizontal, zero coordination overhead
The seat is the wrong unit of compute. The token is the right one. And the discipline is specific: every model release, profile where human time still goes, every bottleneck, and throw tokens at it until it's gone. The finish line is a prompt that ends in a one-shot merge with as little human intervention in between as possible. Human time is the bottleneck. Tokens are not.
Running that discipline is a full-time job. Standing up the infrastructure, configuring the sub-agents, assigning the right model to each, wiring the adversarial pass, then re-tuning all of it every few weeks when a new release resets which model is best: most teams don't have that job on the payroll, and whatever they build by hand is out of date in a quarter. Opus 4.8 reset the answers at the end of May; Fable 5 reset them again two weeks later, then vanished within days of landing. Whatever you tuned to last week, a better alternative may already be out this week.
Six bottlenecks sit between a prompt and a merged PR: the machine, the planning, the orchestration of many small plans into one change, the testing, the review, the merge itself. Each one dies the same way: profiled, then drowned in tokens.
While you sleep.
Picture the destination before the parts, because the destination is the whole point. Today a stack of tasks is a queue for one reason: every task needs you in front of it, one at a time. Nothing about the work itself requires that. A queue exists because dispatch is manual and execution is serial. Remove both and the queue stops being a queue: defined work fans out the moment it is defined, a hundred sessions running in parallel on a hundred isolated machines, finishing overnight while the person who asked is still asleep. A backlog was never a pile of work too big to finish. It was a pile of work waiting its turn behind one person. The six bottlenecks below are everything standing between today and that night, and how each one falls.
Image
Bottleneck one: the machine.
Start with where the work runs, because everything else depends on it, and because it is the real reason everyone is still on localhost. A production app is a suite of services and microservices wired together, all running at once: your frontend, your backend, your mobile app, your database. A cloud sandbox can run a script. It can't stand that up. CI/CD isn't wired, environment variables point nowhere, and the secrets that would make any of it point somewhere real never got asked for. Any team that tries a cloud agent in production ends up back on their own machine, because the agent keeps handing them code that never ran against their actual system.
So we set things up the way a developer sets up their own laptop, on a raw EC2 instance: a swarm of agents clones the repos, installs the libraries, and brings up every process. Multi-repo, one session, with the frontend, the backend, and the mobile app edited and run together. It asks for the secrets and environment variables it needs. The unglamorous parts come along too: authentication, seed data, cookies carried across browser sessions, and when it needs access to something it doesn't have, it asks, with hundreds of native integrations ready to connect. Then it snapshots the machine with everything live, so each new session wakes up on a computer that is already good to go: the libraries installed, the processes already up. From there a high-level prompt is enough.
Code that never ran against your actual system isn't finished. It's a guess. Nothing should reach you as a finished PR until the machine has built it and watched it work. This is the part that breaks the localhost circle: once the agent has a real home that runs everything you run, being out of the loop stops costing you confidence, and parallelism stops costing you your laptop.
Image
Bottleneck two: planning.
Engineers spend most of their day here, and the solved world spends even more, because this is the cheapest place to fix a mistake. Today's tools do the opposite: a few minutes on a thin prompt, then straight to code, when the problem deserved an hour of thought. The shortcut compounds downstream, every gap in the plan paid back tenfold in the build. So the most tokens belong here, not the fewest.
The ideal is simple to state. You hand over intent, two links and a sentence, and what comes back is not code but a plan worth arguing with. It explored your whole stack first, the repos, the databases, the relevant corners of the internet, and it asks the questions a good engineer asks before committing. You answer in a line: auto-approve the tool calls, gate the change behind a feature flag. Then it drafts, a reviewer from a different lab tears the draft apart, fix and critique and fix again, until what stands is a plan of plans: sub-tasks, each with its own test cases, each small enough to build cleanly. And you review it a level up from the code, where the real decisions live: the dependency graph, what runs in parallel and what waits, the architecture, the data model. You comment where it matters and the plan regenerates.
Get the plan right and the build stops fighting you. My rule is five minutes: if guiding a feature takes more of my time than that, it doesn't get built at all.
Image
Bottleneck three: orchestration.
A plan of plans is still a pile of parts. Each piece has to run, get sequenced against the others, have its output reconciled, its seams cleaned up. Today that work is yours, and it is the lowest-leverage thing a senior engineer does all day: coordination, zero judgment. Here is the tell that it should never have been human work. Every move you have learned to make, run /simplify after a sloppy pass, re-read the file the model rewrote twice, hold the dependency order in your head so two changes don't collide, is a rule. Rules are the one thing a system runs better than a person: it never forgets one and never tires of applying it. So the coordination stops being human. A controller fans the work down the dependency graph, holds every piece in a build, judge, fix loop until it lands, and surfaces the result.
Two things make that controller more than a loop. First, it staffs each part with the model that is best at that part, and the models are not interchangeable.
Model

Org DNA

Strength

Weakness

Best for
GPT (OpenAI)

Massive pre-training compute

Deep architectural reasoning, reads the whole picture

Weaker at frontend and tool calling

Planning, high-stakes design
Claude (Anthropic)

Inference-time compute focus

Long-horizon autonomy, orchestration, strong tool use; runs unattended for hours

Premium cost at scale

Building, dispatching sub-agents, long autonomous runs
Gemini (Google)

YouTube and web indexing

Multimedia, fast at high context, low cost

Weak on tool calls and iterative thinking

UI creation, high-volume processing
Chinese open source (Kimi, Qwen, GLM)

Open weights, RL-heavy

Near-frontier capability at a fraction of the cost

Needs a very detailed spec

High-volume, cost-sensitive execution
This table was accurate the week we wrote it, June 2026. Parts of it will be wrong by fall, and that matters more than it looks: someone has to keep working out which model, from any family, is strongest at each job as it shifts underneath you, and no vendor will do it for you.
Second, the controller keeps each sub-agent in its own context window, because a context window ages. A model dulls as its window fills, the way a long day wears a person down: it forgets a decision it made twenty minutes ago, leaves two half-built versions of the same thing in the codebase. One giant session is one aging mind. A team of fresh ones, each with its own context, its own model, its own standing job, stays sharp, and the main agent stays clean by pushing the messy work down to them. Coordination was always overhead, and overhead is the first thing tokens should eat.
Image
Bottleneck four: testing.
This is the bottleneck that makes everyone else's cloud pointless. If the branch still has to come down to your laptop to be checked, what was the cloud for? Running code isn't the bar; seeing it run is. A blind cloud executes a branch and calls it done, but no one watched it, so no one knows it works. The bar is absolute: nothing reaches you as done until the feature has been exercised end to end and seen to hold.
On a real machine that is possible. The whole app comes up and the tests run against it, not just the unit tests but the real thing: a browser driven through the actual flows, the feature proved correct on screen, a recording left behind so you clear testing by watching it instead of trusting it. The same machine boots a phone in the cloud and runs the native tests there too. Almost nobody does this, and it is the whole difference between code that looks right and code you have seen working.
And when you would rather see for yourself, the running app is right there on the box: open it, click into it, point at an element and ask for the change. Each branch gets a live URL, so a colleague can click around it while it is still a branch. Staging stops being a wait.
Image
Bottleneck five: review.
Once code is cheap to write, reading it becomes the expensive part. A single session can hand back an 8,000-line diff, and nobody is reading that line by line, which means review is where the whole promise either holds or quietly breaks. The naive fix is to have the model check its own work, and every lab now does. It doesn't count. An author grades itself generously; ask the model that wrote the code whether it's any good and it will tell you it's excellent. Even the labs' own review agents are siblings, the same family that wrote the code, trained by the same people with the same blind spots.
The review that means something comes from outside that family: a reviewer from a different lab, harder on the work because it shares none of the author's habits, catching the failures the author was built not to see. That cross-lab adversarial pass is most of what lets you trust a merge you didn't read, and it is the one check a lab will never ship, because hiring your competitor to grade your homework is a product no one will build. Once the grading is trustworthy, review changes shape. The reviewer flags what matters in plain language a non-engineer can follow, and walks you through the story of the diff: most important change first, tests and generated files folded away, instead of GitHub's wall of files in alphabetical order. I live by the beach these days and spend my mornings on a walk, reviewing from my phone. If the story reads right, you approve and keep walking.
Image
Bottleneck six: the merge.
All night the other sessions have been landing work, so master never stops moving, and in the old world that is exactly where the human gets pulled back in: rebase this, resolve that, nurse the queue so nothing collides. None of it is judgment. It's bookkeeping that happens to be hard, which makes it the purest thing to hand off. The queue keeps pace with the moving target on its own, resolves the conflicts, and lands change after change. Nobody rebases anything. Even the last step, the one teams reflexively keep for a person, doesn't need one: with access to your Postgres and your Kubernetes, the system enables the feature flag itself and the change goes live. The person who asked for it is still asleep when it does.
Image
We run it with you.
None of this ships as a box with a good-luck note taped to it. We come the other way: profile where your engineering actually breaks, wire the harness to your stack, and run the first sessions alongside you until it is landing real work. What you buy is the result, with us on the hook for it, not a tool to go figure out alone. And the models underneath churn, a new one every few months, each resetting which is best at what. Keeping current with that is our job, not yours: we re-route as the frontier moves so you never re-figure your setup. You teach the harness once. What runs underneath it keeps getting better on its own.
Image
Where this goes.
The whole field is climbing the same ladder. Today the labs run two layers and are reaching for the third. A prompt expands into a plan, an orchestrator lands it with sub-agents, and recurring agents are starting to ship as features. Every rung they climb, they climb inside their own walls: their models, their defaults, the median codebase, and your laptop in the loop. We run the climb where the walls cannot follow. The direction from here is the same for everyone: you set recurring intent ('look at every production crash and fix it,' 'find the ten slowest queries from yesterday and make them fast') and the system spawns the work on its own. Further out, you state your priorities and the system decides how to spend tokens against them. A token allocator. A lab's allocator will only ever spend inside its own family; ours spends across the market. We're not there yet, so we climb one layer at a time.
Image
The backlog is over.
When intelligence costs halve every four months and you can run a hundred sessions for the cost of one senior engineer's week, the backlog stops being a capacity problem and becomes a choice. The adage said startups have to focus, prioritize, say no a lot, and it was right while every yes cost a hiring cycle. Software is a commodity now, and a yes costs an overnight session. Execute a hundred ideas for the price of one and the whole strategy flips: you build them all and find out which ones matter. The constraint shifts completely, from "can we build it" to "can we identify what to build, and can we sell it." Sales and customer understanding inherit the bottleneck engineering just gave up. The companies that see it first are already flat by design: fewer engineers, larger token spend, faster shipping, a direct line from a customer's sentence to merged code. If you're still hiring engineers before you've maxed out what tokens can do, you're playing the 2022 game.
Image
In Vorflux every token attacks a bottleneck, and through our Codex partnership you bring your own subscription straight in and run at roughly 10x off, so the bill stays sane while you get there. This is how I live now: I sit on my phone, an idea lands, a session spawns, and it comes to life. These models are a genie. Localhost keeps it in the lamp. Vorflux lets it out.
The people who see it fastest are the ones who ship the most. That's the game now, and I want everyone playing it.
Tokenmaxx, not peoplemaxx. Come tokenmaxx with me. Come live in the frontier with me.
