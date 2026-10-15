# Interview: questions for Gareth

Questions for one long voice recording. The answers get transcribed, sliced by question, and used as the chatbot's source material (and later an ElevenLabs voice agent).

## How to record

- **Say the number before each answer**: "One point four." That's what the slicing keys on. Skip any you like; just say the number of the next one you answer.
- **Aim for 30 to 90 seconds each.** The chat answers in 2 or 3 sentences, so lead with the short answer, then add the story or example. Both get used.
- **Talk like you would to a curious person at a bar, not a panel.** Filler words are fine; they're good for the voice clone.
- **Say "off the record" before anything that shouldn't be on the site** (client names, tender outcomes, numbers you can't share). It gets cut.
- **Answered so far** (in `src/content/interview.ts`): 1.1, 1.3–1.7, 2.1–2.8. Recording 1 cut off mid-way through 2.8, so pick up from 2.8's ending or 2.9.
- ★ marks questions where the site currently has nothing, so the chatbot is guessing or saying "coming soon". Do those first if you only have twenty minutes.

---

## 1. Who you are

1.1 In thirty seconds: who are you and what do you do?
1.2 Your title says Lead Product Designer, and the site says "one-person product team". What does that actually mean day to day, and what does it *not* mean?
1.3 ★ You did a Bachelor of IT and an ISTQB testing certificate before design. How did you get from there to product design?
1.4 ★ Brisbane, then Melbourne, then Sydney, now New York. What took you to New York, and has it changed how you work?
1.5 What's the thing colleagues come to you for?
1.6 ★ What would a teammate say is the most annoying thing about working with you?
1.7 What kind of problem do you most want to be working on in the next couple of years?

## 2. Design, now that AI is here

2.1 ★ When did it click that you could build things, not just design them? What was the first thing you made that surprised you?
2.2 What was the hardest part of that shift? What did you have to unlearn?
2.3 Do you still use Figma? When, and for what?
2.4 Is this where every designer is heading? What would you say to a designer who's nervous about it?
2.5 If a designer wanted to start working this way tomorrow, what should they do first?
2.6 What does AI *not* do for you? What's still the designer's job?
2.7 You talk about taste a lot. What does taste mean to you, and how do you give "taste" feedback to a coding agent?
2.8 ★ When has AI let you down? Tell me about something it got badly wrong.
2.9 ★ How do engineers react when a designer turns up with working code? Has that changed over time?
2.10 Does your prototype code ever become production code? Should it?
2.11 ★ Models change every few months. How do you keep up, and how much does a new model change your work? (Opus 5.5 landing mid-project, August vs October Balatro.)
2.12 Hot take: what's one thing the design industry is getting wrong about AI right now?

## 3. How you work

3.1 Walk me through a normal day. What's open on your screen?
3.2 What's Conductor, and why run several agents in parallel?
3.3 How do you keep track of four or five agents at once without losing the plot?
3.4 Why voice? How do you use SuperWhisper, and what changed when you started talking instead of typing?
3.5 You prefer iterating over one-shotting. Why?
3.6 How do you check an agent's work before it gets merged?
3.7 Roughly how long does it take to ship a feature now, from idea to live?
3.8 ★ "You can conjure your own tools now." What's a tool you built for yourself that you didn't expect to need?
3.9 You keep design iterations behind feature flags instead of Figma frames. How does that work, and how do non-technical people use it?
3.10 Where does a canvas still fit? You've used Paper as a canvas agents can draw on. What's it for that code isn't?

## 4. The RFP: helping sales win a tender

4.1 Tell the story in your own words: the tender, the three of you, who you were up against.
4.2 What was the moment you gave up on Figma for it?
4.3 What is ProductLite, and why give it its own repo instead of building on the real product?
4.4 ProductLite became the reference for engineering, ahead of tickets. How did that happen, and did anyone push back?
4.5 ★ How long did the prototype take to build?
4.6 ★ What happened with the tender? (Say "off the record" if you can't share it.)
4.7 How did the founder and the PM react the first time they saw it?
4.8 You said you could design faster than engineering could build. Is that a good thing or a problem?
4.9 What would you do differently next time?

## 5. Configurator: testing whether it works

5.1 What is Configurator, in plain words, and who's it for?
5.2 Why prototype on live models? What do feasibility and viability mean to a designer?
5.3 GPT-4.1 took about 6 seconds and GPT-5 mini took 21. What did that teach you, and how did it change the design?
5.4 Explain "select, don't generate". What is Jev, and why let a classifier choose the blocks?
5.5 Why put a Show prompt button on every AI output? Who used it?
5.6 Why have the model return JSON for pre-built blocks instead of writing code?
5.7 The prototype reads a company's brand from just its name. How, and why did that matter?
5.8 ★ What's still unsolved in Configurator?

## 6. Enterprise AI: settings and AI document review

6.1 Settings was organised the way the system was built. How does that happen, and how did you spot it?
6.2 Why swap the colours, and why make workspace settings a dialog?
6.3 Setting a feature up was 1 of 5 in round one, then 3 of 6 for the chatbot. What did you learn, and what's next?
6.4 What's a seeded tenancy, and why put decoy documents in it?
6.5 For AI Document Review, people didn't know what a rule was. Why was drawing the document the answer?
6.6 Why is purple the colour for "what the AI is looking at"?
6.7 Why build a state machine instead of handing over screens? How did the team use it?
6.8 Twenty-seven rounds of feedback for one dialog. What was that like, and what did the agent keep getting wrong?
6.9 ★ What are Daisy Assist and Daisy Assess?

## 7. The Enterprise AI website and the HTML brand

7.1 What's an HTML brand, and what does "input-based outcomes" mean?
7.2 Why ask for ten versions, each crazier than the last? Which was your favourite?
7.3 ★ What's in magic_trick.md? What's the magic trick for Enterprise AI?
7.4 In round one, "Enterprise AI builds it" read as an outsourced service. What surprised you most in the testing?
7.5 Nobody in round two said who it's for. How would you fix that?
7.6 If agents build the outputs, what's the designer's job on a marketing site?

## 8. Agentic user testing

8.1 Why bother with usability testing in 2026, when you can just ship?
8.2 Tell the 0 out of 5 to 5 out of 5 story.
8.3 Every tester said they'd finished the task when they hadn't. Why can't you trust self-reported completion?
8.4 How does the agent set up a Lyssna test, and how long does a test take you now compared with before?
8.5 Is five testers enough?
8.6 Where does this go? Tests that run on every build?

## 9. SEEK

9.1 Set the scene: what's Career Advice, and what was your team asked to do?
9.2 The MVP missed its numbers. How did that feel, and why fix the funnel instead of starting again?
9.3 Of the three fixes, which mattered most, and how do you know?
9.4 "Usability tests tell you if people can, not if they will." Unpack that.
9.5 ★ Organic visits went up 25.9% in a year. What was that work?
9.6 ★ A colleague mentions an AI resume generator you worked on. What was it, and how did it do?
9.7 ★ What's the HEART framework, and how did you get a team to adopt it?
9.8 You ran hundreds of customer interviews. What makes a good interview, and what's one finding that changed a decision?
9.9 ★ Have you run a fake door or Wizard of Oz test? Tell me one.

## 10. Best Practice Software

10.1 Set the scene: pre-launch, the largest practice management system in Australia, and no access to customers. How did you design without them?
10.2 The two-panel idea came out of a workshop. How do you run a workshop that produces ideas, not opinions?
10.3 ★ You started a design system for 30+ engineers. How did you start it, and how did you get people to use it?
10.4 ★ You grew the team to five. What do you look for when hiring a designer?
10.5 ★ How do you mentor? What's one thing you'd tell a mid-level designer?
10.6 ★ You designed prescribing. What changes when a design mistake could hurt a patient?
10.7 What was it like working with an onsite doctor?

## 11. Things you've built yourself

11.1 ★ Why build your own products on the side at all?
11.2 ★ Dispatch: what is it, why did you build it, and who's it for?
11.3 ★ How did you build Dispatch, and what did you learn shipping a real product people pay for or use?
11.4 ★ Shader Wall: what is it, and why build it?
11.5 ★ The Shader Wall site runs the whole app on a fake Mac desktop in the browser. Why do it that way?
11.6 ★ Thesis: what problem does it solve, and who's it for?
11.7 ★ Where did Thesis come from? How does it connect to Teresa Torres and assumption testing?
11.8 Why size an opportunity like a hand of Balatro? What's a swing card?
11.9 ★ Wallbounce: why make a game, and why build the tools before the game?
11.10 ★ Games keep showing up: Balatro, Gears of War, Melee. What do games teach you about product design?

## 12. Process and philosophy

12.1 How do you actually use Shape Up? What does appetite mean in practice?
12.2 Give me a Jobs-to-be-Done example: the push, pull, anxiety and habit behind a real switch you studied.
12.3 How do you use opportunity solution trees, and do you still use them now that you can build so fast?
12.4 ★ Tell me about a time an experiment proved you wrong.
12.5 How do you decide when to run an experiment and when to just decide?
12.6 What do you do when the data is inconclusive?
12.7 Why Christopher Alexander? What does A Pattern Language have to do with software?
12.8 "The GUI has to earn its place." Which interfaces survive, and where does voice fit?
12.9 ★ What design decision are you proudest of, and which one do you regret?
12.10 Speed versus quality: where's your line?

## 13. This website

13.1 Why build your portfolio in code, with Claude Code, instead of a template?
13.2 Why put a chatbot on a portfolio? What do you hope people ask it?
13.3 ★ What's it like knowing people are talking to an AI version of you? What do you want it never to say?

## 14. Quick fire (one line each)

14.1 Favourite tool right now?
14.2 A tool you've dropped this year?
14.3 One book every product designer should read?
14.4 What game are you playing?
14.5 Best piece of career advice you've been given?
14.6 If you weren't designing, what would you be doing?
14.7 What are you nerding out on outside work?

## 15. Getting in touch

15.1 What's the best way to reach you, and what kind of conversations are you up for?
