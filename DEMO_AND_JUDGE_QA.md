# Demonstration and explain-back

## 90-second script

“After a financial scam, people often need help deciding what to do next.
Fraud First Aid turns a few structured answers into a short, explainable checklist.

The official reporting options are visible immediately. We do not make someone
finish a questionnaire before contacting their bank or the reporting portal.

Here is a fictional UPI payment scenario. The app shows relevant steps, explains
why each one appears, and links the guidance to its source. It never tells us
that recovery is guaranteed.

Now I’ll mark the facts-organising step done and change the remote-access answer.
The checklist adds device guidance while preserving progress on an unchanged step.
If an action no longer applies, its old completion mark is discarded.

Finally, I can download the facts and self-reported progress as a clear summary.
The app does not submit a complaint or claim that the bank verified these steps.

Our prototype runs locally without an AI API. The rules and sources are separate
from the interface, so the team can review and update them transparently.”

Use the actual current build; do not claim browser checks passed until you run them.

## Questions you should be able to answer

**Where is the AI?**
This MVP uses deterministic rules. AI assisted development; it is not a trained
fraud-detection model. We chose traceable next-step guidance for a short hackathon.

**Why not just open the official reporting website?**
That remains the reporting destination. Our proposed value is helping a distressed
person organise the relevant steps, understand sources and prepare a clear record.
Whether this helps users better is still a user-testing question.

**What is the database doing?**
Questions, rules, actions and source references drive the app. Official statistics
provide context, while synthetic scenarios are used for demonstrations/regression
testing. Historical case counts do not determine remedies for an individual.

**Is this classification?**
It routes structured facts to relevant actions. It does not infer a legally proven
fraud type from a narrative. Overlapping exposure flags can select several actions.

**Can you get the money back?**
No. The app helps users identify next steps. Banks, payment providers and relevant
authorities determine actual action and outcomes.

**What happens if the user is unsure?**
Unknown remains unknown, clarification is shown, and official India reporting
options remain available. We do not fabricate missing facts.

**Are these real victim records?**
No. The demonstration cases are invented. We link selected public information
and guidance; we do not have access to a government victim-record system.

**Why use foreign references?**
They broaden general protective patterns. Adaptations are labelled; foreign laws,
contacts and compensation rules are not applied as Indian procedures.

**How did you test it?**
We tested backend requirements, API responses, regression scenarios and asynchronous
frontend controller behavior. These checks are assistant-authored. State separately
which manual browser and independent teammate checks the team has completed.

**What are the limitations?**
It is a local prototype with a limited question set, review-pending guidance and
no bank integration. Real deployment needs further user testing, guidance review,
privacy/security work and a maintained process for source updates.

## Freeze rule

After the local browser walkthrough succeeds, freeze features. Fix reproducible
defects, verify the submission contract, and rehearse. Do not add ML or dashboards
just to make the feature list longer.
