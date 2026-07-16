# Outcome Span Animation Redesign

## Status
Approved visual direction: executive consulting with selective technical-system cues.

## Objective
Replace the current perpetual dot-travel animation with a restrained, architectural sequence that makes a complete AI workstream feel validated, governed, and ready for ownership.

The motion should communicate one idea clearly:

> A workstream becomes credible when its operating conditions resolve into an owned system.

The result should feel appropriate for a senior consulting audience: deliberate, legible, calm, and structurally precise.

## Rejected execution
The current animation is rejected because it behaves like a generic CSS demo:

- one circular signal loops continuously across the hero;
- the supports read as decorative containers rather than operating conditions;
- the animation does not visibly distinguish proof, authority, integration, or ownership;
- perpetual motion competes with the candidate thesis;
- the visual lacks a decisive end state;
- scenario changes rely too heavily on opacity and weakened geometry.

## Approved concept

### 1. Hero choreography
The hero runs one short assembly sequence after the page becomes ready.

1. **Structural field appears**
   - The indigo field is already present.
   - A subtle baseline and five empty operating positions fade into view.
   - No object travels across the screen.

2. **Operating conditions lock into place**
   - Five labeled conditions resolve from left to right:
     - Outcome
     - Workflow
     - Authority
     - Evidence
     - Ownership
   - Each condition enters through a restrained vertical or depth-settle transform of no more than 12–18 pixels.
   - Each condition receives a brief amber confirmation edge when settled.
   - Labels remain static after confirmation.

3. **Continuity line resolves**
   - A single horizontal continuity line draws across the five conditions only after they are all present.
   - The line should visually connect the complete system rather than imply a moving packet or delivery race.

4. **Ownership closure**
   - A final ownership bar or bracket closes around the complete structure.
   - The system label resolves to **Owned operation**.
   - The hero then becomes fully static.

### 2. Motion character

Motion must be:

- single-run rather than perpetual;
- calm and precise;
- based on opacity and transform;
- free of bounce, elastic easing, glow pulses, particle effects, orbiting, or moving dots;
- complete within approximately 2.2–3.2 seconds;
- readable even when the sequence is interrupted or partially complete.

Recommended easing:

- primary settle: `cubic-bezier(.22,.61,.36,1)`;
- confirmation edge: short linear or ease-out transition;
- continuity-line reveal: controlled scale or clip reveal.

## Hero composition

The right-side visual becomes an architectural workstream frame rather than a bridge illustration.

### Visual structure

- Five vertical conditions with consistent width and spacing.
- One shared lower foundation labeled `Integration foundation`.
- One thin upper continuity line connecting all conditions.
- One final right-side closure bar labeled `Owned operation`.
- Crowe amber is used only for confirmations, the ownership closure, and the final state.
- Mint remains a subordinate candidate-created signal for operating readiness, not the dominant color.
- White text and indigo surfaces carry the primary hierarchy.

### Static end state

After the sequence:

- every condition is clearly readable;
- every condition is visibly connected;
- the integration foundation is present;
- the ownership closure is complete;
- no element continues moving.

## Interactive scenario behavior

The scenario lab retains the existing five decisions:

- Advance
- Reframe
- Bound
- Hold
- Sequence

The interaction should adopt the same architectural grammar as the hero.

### Baseline state

The useful default opens fully resolved:

- all five conditions active;
- integration foundation active;
- ownership closure present;
- decision reads `Advance — complete workstream`.

### Scenario transitions

Selecting a scenario changes only the relevant structural conditions.

- **Executive speed pressure**
  - Evidence and Ownership remain outlined but unresolved.
  - Decision: Reframe.

- **Multi-system agent**
  - Authority receives the primary warning treatment.
  - A boundary bracket appears around the affected operating span.
  - Decision: Bound.

- **Successful pilot without owner**
  - Ownership closure retracts or remains open.
  - The other conditions stay intact.
  - Decision: Hold.

- **Uncertain legacy integration**
  - The integration foundation becomes segmented at the uncertain boundary.
  - Decision: Sequence.

Scenario changes must not destroy the complete visual or make labels unreadable. A risk state should remain structurally legible.

## Components

### Hero workstream frame
Responsible for:

- initial assembly sequence;
- complete end-state composition;
- reduced-motion static state;
- responsive layout.

### Scenario workstream frame
Responsible for:

- applying scenario state classes;
- preserving all labels and structural context;
- highlighting the smallest relevant set of changed conditions;
- keeping the decision readout synchronized.

### Decision readout
Responsible for:

- presenting one decision label;
- explaining the operating consequence;
- announcing changes through the existing `aria-live` region;
- avoiding detached or ambiguous placement.

## State model

The JavaScript state object remains the source for scenario copy and gains explicit structural flags.

Example state fields:

- `decision`
- `copy`
- `conditions`
- `integrationState`
- `ownershipState`
- `boundaryState`

The DOM should receive one scenario identifier and semantic state attributes. Styling should be driven through those attributes rather than many imperative inline mutations.

## Responsive behavior

### Desktop and laptop

- Five conditions remain horizontal.
- Ownership closure remains visible on the right.
- Labels may use two lines when needed, but no overlap is permitted.

### Tablet

- Preserve the horizontal causal relationship when space allows.
- Reduce spacing and label size modestly before changing composition.
- If the frame cannot remain legible, use a two-row architectural arrangement with an explicit continuity connector.

### Mobile

- Recompose into a vertical operating stack.
- The sequence resolves from top to bottom.
- The ownership closure becomes a final full-width terminal state.
- Do not scale the desktop visual down until labels become microscopic.

## Reduced motion

When `prefers-reduced-motion: reduce` is active:

- the complete static end state is shown immediately;
- no staged delay, line drawing, opacity sequencing, or transform animation runs;
- scenario changes update instantly;
- all labels, structure, and decision states remain available.

## Accessibility

- All essential meaning must exist in visible text and DOM content.
- Animation cannot be the only indicator of completion or risk.
- Scenario buttons remain native buttons and keyboard operable.
- `aria-pressed` continues to reflect the selected scenario.
- Decision changes continue through the existing polite `aria-live` region.
- Focus indicators must remain visible against dark and light surfaces.

## Performance and failure behavior

- Use CSS transforms, opacity, and pseudo-elements where practical.
- Avoid canvas, WebGL, external animation libraries, and runtime asset dependencies.
- The visual must render correctly before JavaScript executes.
- JavaScript enhances scenario state and assembly timing; it must not be required for basic readability.
- If scripting fails, the hero should display the complete static end state and the baseline decision copy.

## Testing and acceptance criteria

### Visual acceptance

- No perpetual animation remains.
- No moving dot, packet, orb, bounce, pulse, glow chase, or novelty effect remains.
- The complete workstream relationship is visible in the final state.
- The sequence ends decisively and stays still.
- The result reads as an executive operating model rather than a decorative diagram.

### Functional acceptance

- Baseline scenario opens in a complete state.
- Every scenario changes the intended structural condition and decision readout.
- Reset returns to the complete baseline state.
- Keyboard operation works for all controls.
- Rapid scenario changes settle on the final selected state.

### Responsive acceptance

Inspect at:

- 1440 × 900
- 1280 × 800
- 768 × 1024
- 390 × 844
- 320 × 700

At every viewport:

- no horizontal overflow;
- no label overlap;
- no ownership closure collision;
- no microscopic text;
- the complete causal relationship remains understandable.

### Motion acceptance

- Hero sequence completes in approximately 2.2–3.2 seconds.
- No animation continues after completion.
- Reduced-motion mode resolves immediately to the complete static state.
- Scenario state changes remain below approximately 450 milliseconds and never block interaction.

## Scope boundaries

This redesign changes:

- hero operating-model markup;
- hero animation and visual geometry;
- scenario-lab geometry and state styling;
- scenario state attributes and supporting JavaScript;
- responsive and reduced-motion rules;
- regression coverage and campaign audit notes.

This redesign does not change:

- the campaign thesis;
- evidence claims;
- resume or cover-letter content;
- PDF page contracts;
- scenario decision language unless needed for visual clarity;
- Crowe logo treatment or employer identity.
