# Outcome Span Animation Redesign

## Status
Approved visual direction: executive consulting with selective technical-system cues.

## Objective
Replace the perpetual dot-travel animation with a restrained architectural sequence that shows an AI workstream becoming validated, governed, and owned.

The motion communicates one idea:

> A workstream becomes credible when its operating conditions resolve into an owned system.

The result must feel deliberate, legible, calm, and appropriate for a senior consulting audience.

## Rejected execution
The current animation is rejected because it behaves like a generic CSS demonstration:

- one circular signal loops continuously;
- the supports read as decoration rather than operating conditions;
- the sequence does not distinguish evidence, authority, integration, or ownership;
- perpetual motion competes with the thesis;
- the visual lacks a decisive end state;
- scenario changes depend too heavily on fading geometry.

## Approved hero concept

The hero becomes an architectural workstream frame rather than a bridge illustration.

### Visual structure

- Five vertical operating conditions: Outcome, Workflow, Authority, Evidence, Ownership.
- One shared lower foundation labeled `Integration foundation`.
- One thin upper continuity line connecting all five conditions.
- One right-side amber ownership bracket with top and bottom caps.
- One terminal label inside that bracket: `Owned operation`.
- White and indigo carry the primary hierarchy.
- Crowe amber is reserved for confirmation edges, the ownership bracket, and the terminal state.
- Mint remains a subordinate readiness accent.

### Hero choreography

The sequence runs once after the page is ready.

1. **Structural field**
   - The indigo hero field is already present.
   - The foundation, continuity-line track, and five empty operating positions fade in.

2. **Conditions settle**
   - The five conditions resolve left to right.
   - Each starts at `opacity: 0` and `translateY(14px)`.
   - Each settles with `cubic-bezier(.22,.61,.36,1)`.
   - Each receives one brief amber confirmation edge when settled.
   - Labels remain static after confirmation.

3. **Continuity resolves**
   - The upper continuity line reveals from left to right only after all conditions are present.
   - The line represents complete operating continuity, not a packet or delivery race.

4. **Ownership closes**
   - The right-side ownership bracket draws its vertical rail and two caps.
   - `Owned operation` resolves inside the bracket.
   - All motion stops permanently.

### Timing

- Total duration: 2.4–3.0 seconds.
- Condition stagger: approximately 120–160 milliseconds.
- Confirmation edge: no more than 220 milliseconds.
- Continuity reveal: approximately 450 milliseconds.
- Ownership closure: approximately 400 milliseconds.
- No animation repeats.

### Prohibited effects

Do not use:

- moving dots, packets, or orbs;
- bounce or elastic easing;
- glow chases or repeated pulses;
- particles, orbiting, parallax, or floating objects;
- perpetual movement;
- canvas, WebGL, or external animation libraries.

## Static end state

After the sequence:

- every condition is readable;
- every condition is visibly connected;
- the integration foundation is present;
- the ownership bracket is closed;
- `Owned operation` is visible;
- no element continues moving.

The end state must remain the default readable composition even when JavaScript does not run.

## Interactive scenario model

The scenario lab retains the existing decisions:

- Advance
- Reframe
- Bound
- Hold
- Sequence

The lab uses the same architectural grammar as the hero.

### Baseline

The baseline opens fully resolved:

- all five conditions active;
- integration foundation continuous;
- ownership bracket closed;
- decision: `Advance — complete workstream`.

### Executive speed pressure

- Evidence and Ownership remain visible but unresolved.
- Their amber confirmation edges are absent.
- The ownership bracket remains open at the top.
- Decision: Reframe.

### Multi-system agent

- Authority receives the warning treatment.
- A bounded amber outline encloses Authority and the affected continuity segment.
- All other conditions remain intact.
- Decision: Bound.

### Successful pilot without owner

- Ownership remains visible.
- The right-side ownership bracket retracts completely.
- The continuity line stops before the terminal state.
- Decision: Hold.

### Uncertain legacy integration

- The integration foundation is interrupted by one visible gap beneath the uncertain boundary.
- Conditions remain readable and connected to their labels.
- Decision: Sequence.

Scenario changes must alter only the smallest relevant structural set. Risk states must remain legible and must never resemble missing CSS or broken rendering.

## Components

### Hero workstream frame

Responsibilities:

- single-run assembly;
- complete static end state;
- responsive composition;
- reduced-motion state;
- script-failure fallback.

### Scenario workstream frame

Responsibilities:

- scenario state attributes;
- structural condition states;
- integration and ownership states;
- synchronized decision readout;
- rapid-selection stability.

### Decision readout

Responsibilities:

- one decision label;
- one operating consequence;
- placement directly beneath or beside the affected frame;
- updates through the existing polite `aria-live` region.

## State architecture

The JavaScript scenario object remains the source for decision copy and gains explicit structural fields:

- `decision`
- `copy`
- `conditions`
- `integrationState`
- `ownershipState`
- `boundaryState`

The DOM receives one scenario identifier and semantic state attributes. CSS handles presentation. JavaScript must not perform many inline style mutations.

## Responsive composition

### Desktop and laptop: 900 pixels and wider

- Five conditions remain in one horizontal row.
- The ownership bracket remains on the right.
- Labels may wrap to two lines but may not overlap.

### Tablet: 600–899 pixels

- Use a two-row architectural frame: three conditions on the first row and two on the second.
- A visible elbow connector preserves the left-to-right continuity relationship.
- The ownership bracket remains attached to the second row terminal state.
- Do not shrink labels below 12 pixels.

### Mobile: below 600 pixels

- Use a vertical operating stack.
- Conditions resolve from top to bottom.
- The integration foundation becomes a left-side structural rail.
- The ownership bracket becomes a final full-width terminal block.
- Do not scale the desktop diagram down.

## Reduced motion

When `prefers-reduced-motion: reduce` is active:

- show the complete static end state immediately;
- run no staged delay, line reveal, transform, or opacity sequence;
- apply scenario changes instantly;
- preserve all labels, structure, and decision states.

## Accessibility

- Essential meaning must exist in visible text and DOM content.
- Motion cannot be the only indication of completion or risk.
- Scenario controls remain native buttons.
- `aria-pressed` reflects selection.
- Decision changes use the existing polite `aria-live` region.
- Focus indicators remain visible on dark and light surfaces.
- The hero includes a concise accessible description of the complete operating relationship.

## Performance and failure behavior

- Use transforms, opacity, borders, and pseudo-elements.
- The visual must render as the complete end state before JavaScript enhancement.
- JavaScript may add an `is-assembling` state after initialization to play the sequence.
- If scripting fails, the complete frame and baseline decision remain visible.
- Rapid scenario selections must settle on the final requested state without queued animations.

## Acceptance criteria

### Visual

- No perpetual motion remains.
- No moving dot, packet, orb, bounce, pulse, or novelty effect remains.
- The full workstream relationship is visible.
- The sequence ends decisively and remains still.
- The result reads as an executive operating model rather than a decorative diagram.

### Functional

- Baseline opens complete.
- Every scenario changes the specified structural conditions and decision readout.
- Reset returns to baseline.
- Keyboard operation works for every control.
- Rapid scenario changes settle on the final selection.

### Responsive

Inspect at:

- 1440 × 900
- 1280 × 800
- 768 × 1024
- 390 × 844
- 320 × 700

At every viewport:

- no horizontal overflow;
- no label overlap;
- no ownership-bracket collision;
- no text below 12 pixels in the operating frame;
- the complete causal relationship remains understandable.

### Motion

- Hero sequence completes in 2.4–3.0 seconds.
- No animation continues afterward.
- Reduced-motion mode resolves immediately.
- Scenario transitions complete within 450 milliseconds.
- Interaction remains available during and after transitions.

## Scope

This redesign changes:

- hero operating-model markup;
- hero geometry and animation;
- scenario-lab geometry and state styling;
- scenario state attributes and supporting JavaScript;
- responsive and reduced-motion rules;
- regression coverage and campaign audit notes.

It does not change:

- the campaign thesis;
- evidence claims;
- resume or cover-letter content;
- PDF page contracts;
- Crowe logo treatment;
- scenario decision wording except where a minor accessibility clarification is required.
