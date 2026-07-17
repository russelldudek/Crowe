const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
}

const OUTCOME_STYLESHEET = 'site-v5.css?v=20260717-1';

function ensureOutcomeStylesheet() {
  const existing = [...document.querySelectorAll('link[rel="stylesheet"]')]
    .some((link) => link.getAttribute('href')?.includes('site-v5.css'));
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = OUTCOME_STYLESHEET;
  document.head.appendChild(link);
}

function buildHeroStrip() {
  const strip = document.createElement('div');
  strip.className = 'outcome-strip outcome-strip--hero';
  strip.setAttribute(
    'aria-label',
    'Outcome Span operating model resolving five conditions into an owned operation',
  );
  strip.innerHTML = `
    <div class="outcome-strip__kicker">The Outcome Span · illustrative operating model</div>
    <div class="outcome-strip__shell">
      <ol class="outcome-strip__bays" aria-label="Conditions for a complete AI workstream">
        <li class="outcome-bay" data-condition="outcome" data-condition-state="active" style="--bay-order:0">
          <span class="outcome-bay__number">01</span>
          <strong>Outcome</strong>
          <small>Business result</small>
          <span class="outcome-bay__state">Confirmed</span>
        </li>
        <li class="outcome-bay" data-condition="workflow" data-condition-state="active" style="--bay-order:1">
          <span class="outcome-bay__number">02</span>
          <strong>Workflow</strong>
          <small>Useful in the task</small>
          <span class="outcome-bay__state">Confirmed</span>
        </li>
        <li class="outcome-bay" data-condition="authority" data-condition-state="active" style="--bay-order:2">
          <span class="outcome-bay__number">03</span>
          <strong>Authority</strong>
          <small>Human boundaries</small>
          <span class="outcome-bay__state">Confirmed</span>
        </li>
        <li class="outcome-bay" data-condition="evidence" data-condition-state="active" style="--bay-order:3">
          <span class="outcome-bay__number">04</span>
          <strong>Evidence</strong>
          <small>Proof and trace</small>
          <span class="outcome-bay__state">Confirmed</span>
        </li>
        <li class="outcome-bay" data-condition="ownership" data-condition-state="active" style="--bay-order:4">
          <span class="outcome-bay__number">05</span>
          <strong>Ownership</strong>
          <small>Cadence and support</small>
          <span class="outcome-bay__state">Confirmed</span>
        </li>
        <li class="outcome-bay outcome-bay--operating" data-bay="operating-state" data-operating-state="forming" aria-label="Operating state resolves from workstream forming to owned operation">
          <span class="outcome-bay__eyebrow">Operating state</span>
          <span class="operating-state__value" aria-hidden="true">
            <strong class="operating-state__forming">Workstream forming</strong>
            <strong class="operating-state__owned">Owned operation</strong>
          </span>
          <small>Complete, governed, adopted, and supported</small>
        </li>
      </ol>
      <div class="integration-foundation" data-integration-state="active">
        <strong>Integration foundation</strong>
        <span class="integration-foundation__detail">data · APIs · connectors · security</span>
        <span class="integration-foundation__state">Confirmed</span>
      </div>
    </div>
  `;
  return strip;
}

function buildScenarioStrip() {
  const strip = document.createElement('div');
  strip.className = 'outcome-strip outcome-strip--scenario';
  strip.dataset.scenario = 'baseline';
  strip.setAttribute('aria-label', 'Scenario workstream conditions');
  strip.innerHTML = `
    <div class="outcome-strip__shell">
      <ol class="outcome-strip__bays">
        <li class="outcome-bay" data-condition="outcome" data-condition-state="active">
          <strong>Outcome</strong><small>Explicit</small><span class="outcome-bay__state">Confirmed</span>
        </li>
        <li class="outcome-bay" data-condition="workflow" data-condition-state="active">
          <strong>Workflow</strong><small>Embedded</small><span class="outcome-bay__state">Confirmed</span>
        </li>
        <li class="outcome-bay" data-condition="authority" data-condition-state="active">
          <strong>Authority</strong><small>Bounded</small><span class="outcome-bay__state">Confirmed</span>
        </li>
        <li class="outcome-bay" data-condition="evidence" data-condition-state="active">
          <strong>Evidence</strong><small>Instrumented</small><span class="outcome-bay__state">Confirmed</span>
        </li>
        <li class="outcome-bay" data-condition="ownership" data-condition-state="active">
          <strong>Ownership</strong><small>Named</small><span class="outcome-bay__state">Confirmed</span>
        </li>
        <li class="outcome-bay outcome-bay--operating" data-bay="operating-state" data-operating-state="advance">
          <span class="outcome-bay__eyebrow">Operating state</span>
          <strong class="operating-state__decision">ADVANCE</strong>
          <small class="operating-state__label">Owned operation</small>
        </li>
      </ol>
      <div class="integration-foundation" data-integration-state="active">
        <strong>Integration foundation</strong>
        <span class="integration-foundation__detail">data · APIs · connectors · security</span>
        <span class="integration-foundation__state">Confirmed</span>
      </div>
    </div>
  `;
  return strip;
}

function replaceOutcomeSpanMarkup() {
  if (!document.querySelector('.outcome-strip--hero')) {
    const legacyHero = document.querySelector('.hero-workstream');
    if (legacyHero) legacyHero.replaceWith(buildHeroStrip());
  }

  if (!document.querySelector('.outcome-strip--scenario')) {
    const legacyScenario = document.querySelector('.scenario-workstream');
    if (legacyScenario) legacyScenario.replaceWith(buildScenarioStrip());
  }
}

ensureOutcomeStylesheet();
replaceOutcomeSpanMarkup();

const lab = document.querySelector('.lab-stage');
const strip = document.querySelector('.outcome-strip--scenario');
const buttons = [...document.querySelectorAll('[data-scenario]')];
const status = document.querySelector('#decision-status');
const copy = document.querySelector('#decision-copy');
const conditionNodes = strip ? [...strip.querySelectorAll('[data-condition]')] : [];
const integration = strip?.querySelector('.integration-foundation');
const integrationStateLabel = integration?.querySelector('.integration-foundation__state');
const operatingBay = strip?.querySelector('[data-bay="operating-state"]');
const operatingDecision = operatingBay?.querySelector('.operating-state__decision');
const operatingLabel = operatingBay?.querySelector('.operating-state__label');

const allActive = {
  outcome: 'active',
  workflow: 'active',
  authority: 'active',
  evidence: 'active',
  ownership: 'active',
};

const confirmedLabels = {
  outcome: 'Confirmed',
  workflow: 'Confirmed',
  authority: 'Confirmed',
  evidence: 'Confirmed',
  ownership: 'Confirmed',
};

const states = {
  baseline: {
    status: 'ADVANCE — complete workstream',
    copy: 'The outcome, workflow, authority, evidence, integration, and client owner are explicit. Build the smallest production-worthy slice and instrument adoption from day one.',
    conditionStates: {...allActive},
    conditionLabels: {...confirmedLabels},
    integrationState: 'active',
    integrationLabel: 'Confirmed',
    operatingState: 'advance',
    operatingLabel: 'Owned operation',
  },
  speed: {
    status: 'REFRAME — fast is not yet complete',
    copy: 'Executive urgency is valid, but delivery speed without evidence and ownership turns a visible prototype into a hidden operating liability.',
    conditionStates: {...allActive, evidence: 'unresolved', ownership: 'unresolved'},
    conditionLabels: {...confirmedLabels, evidence: 'Proof unresolved', ownership: 'Owner unresolved'},
    integrationState: 'active',
    integrationLabel: 'Confirmed',
    operatingState: 'reframe',
    operatingLabel: 'Proof and owner required',
  },
  agent: {
    status: 'BOUND — define the action envelope',
    copy: 'When an agent can act across systems, permissions, traceability, exception handling, human authority, and fallback become part of the product—not review paperwork.',
    conditionStates: {...allActive, authority: 'warning'},
    conditionLabels: {...confirmedLabels, authority: 'Boundary required'},
    integrationState: 'active',
    integrationLabel: 'Confirmed',
    operatingState: 'bound',
    operatingLabel: 'Action envelope required',
  },
  orphan: {
    status: 'HOLD — name the operating owner',
    copy: 'A technically successful pilot without a client owner, cadence, and adoption mechanism is an isolated result. Ownership is a delivery requirement.',
    conditionStates: {...allActive, ownership: 'unresolved'},
    conditionLabels: {...confirmedLabels, ownership: 'Owner unresolved'},
    integrationState: 'active',
    integrationLabel: 'Confirmed',
    operatingState: 'hold',
    operatingLabel: 'Operating owner required',
  },
  legacy: {
    status: 'SEQUENCE — prove the integration boundary',
    copy: 'Where source systems or connectors are uncertain, test the boundary first. Platform selection should follow integration, control, and supportability evidence—not fashion.',
    conditionStates: {...allActive},
    conditionLabels: {...confirmedLabels},
    integrationState: 'uncertain',
    integrationLabel: 'Boundary uncertain',
    operatingState: 'sequence',
    operatingLabel: 'Prove integration first',
  },
};

function setScenario(key) {
  const next = states[key];
  if (
    !lab
    || !strip
    || !status
    || !copy
    || !integration
    || !integrationStateLabel
    || !operatingBay
    || !operatingDecision
    || !operatingLabel
    || !next
  ) return;

  lab.dataset.state = key;
  strip.dataset.scenario = key;
  integration.dataset.integrationState = next.integrationState;
  integrationStateLabel.textContent = next.integrationLabel;
  operatingBay.dataset.operatingState = next.operatingState;
  operatingDecision.textContent = next.status.split(' — ')[0];
  operatingLabel.textContent = next.operatingLabel;

  conditionNodes.forEach((node) => {
    const condition = node.dataset.condition;
    node.dataset.conditionState = next.conditionStates[condition] || 'active';
    const label = node.querySelector('.outcome-bay__state');
    if (label) label.textContent = next.conditionLabels[condition] || 'Confirmed';
  });

  buttons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.scenario === key));
  });

  status.textContent = next.status;
  copy.textContent = next.copy;
}

buttons.forEach((button) => {
  button.addEventListener('click', () => setScenario(button.dataset.scenario));
});

const reset = document.querySelector('#reset-scenario');
if (reset) reset.addEventListener('click', () => setScenario('baseline'));

setScenario('baseline');
