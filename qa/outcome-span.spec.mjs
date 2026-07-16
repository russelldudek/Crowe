import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const baseURL = process.env.CAMPAIGN_URL || 'http://127.0.0.1:4173/';
const viewports = [
  {name: 'desktop', width: 1440, height: 900},
  {name: 'laptop', width: 1280, height: 800},
  {name: 'tablet', width: 768, height: 1024},
  {name: 'mobile', width: 390, height: 844},
  {name: 'narrow', width: 320, height: 700},
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function overlaps(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

await fs.mkdir('qa/renders', {recursive: true});
const browser = await chromium.launch({headless: true});

for (const viewport of viewports) {
  const page = await browser.newPage({viewport});
  await page.goto(baseURL, {waitUntil: 'networkidle'});
  await page.waitForTimeout(3400);

  const report = await page.evaluate(() => {
    const hero = document.querySelector('.hero-workstream');
    const conditions = [...hero.querySelectorAll('[data-condition]')];
    const terminal = hero.querySelector('.ownership-terminal');
    const foundation = hero.querySelector('.workstream-foundation');
    const labels = conditions.map((node) => ({
      name: node.getAttribute('data-condition'),
      text: node.textContent.trim(),
      rect: node.getBoundingClientRect().toJSON(),
      opacity: getComputedStyle(node).opacity,
      animation: getComputedStyle(node).animationName,
      iteration: getComputedStyle(node).animationIterationCount,
    }));
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      conditionCount: conditions.length,
      labels,
      terminalText: terminal.textContent.trim(),
      terminalOpacity: getComputedStyle(terminal).opacity,
      terminalRect: terminal.getBoundingClientRect().toJSON(),
      foundationRect: foundation.getBoundingClientRect().toJSON(),
      frameRect: hero.getBoundingClientRect().toJSON(),
    };
  });

  assert(report.overflow <= 1, `${viewport.name}: horizontal overflow ${report.overflow}px`);
  assert(report.conditionCount === 5, `${viewport.name}: expected five conditions`);
  assert(report.terminalText === 'Owned operation', `${viewport.name}: ownership terminal missing`);
  assert(Number(report.terminalOpacity) === 1, `${viewport.name}: ownership terminal not settled`);
  for (const label of report.labels) {
    assert(label.text.length > 0, `${viewport.name}: ${label.name} label empty`);
    assert(Number(label.opacity) === 1, `${viewport.name}: ${label.name} not settled`);
    assert(label.iteration === '1', `${viewport.name}: ${label.name} animation repeats`);
    assert(label.rect.left >= report.frameRect.left - 1, `${viewport.name}: ${label.name} escapes frame left`);
    assert(label.rect.right <= report.frameRect.right + 1, `${viewport.name}: ${label.name} escapes frame right`);
  }

  for (let index = 0; index < report.labels.length - 1; index += 1) {
    const current = report.labels[index].rect;
    const next = report.labels[index + 1].rect;
    assert(!overlaps(current, next), `${viewport.name}: adjacent conditions overlap`);
  }
  assert(!overlaps(report.terminalRect, report.foundationRect), `${viewport.name}: ownership terminal overlaps foundation label`);

  await page.screenshot({
    path: `qa/renders/outcome-span-${viewport.name}.png`,
    fullPage: false,
  });
  await page.close();
}

const interactionPage = await browser.newPage({viewport: {width: 1280, height: 800}});
await interactionPage.goto(baseURL, {waitUntil: 'networkidle'});

const expected = {
  speed: {decision: 'REFRAME', evidence: 'unresolved', ownership: 'open'},
  agent: {decision: 'BOUND', authority: 'warning', boundary: 'authority'},
  orphan: {decision: 'HOLD', ownershipCondition: 'unresolved', ownership: 'open'},
  legacy: {decision: 'SEQUENCE', integration: 'uncertain'},
};

for (const [scenario, state] of Object.entries(expected)) {
  await interactionPage.click(`[data-scenario="${scenario}"]`);
  const result = await interactionPage.evaluate(() => {
    const frame = document.querySelector('.scenario-workstream');
    const condition = (name) => frame.querySelector(`[data-condition="${name}"]`).getAttribute('data-condition-state');
    return {
      decision: document.querySelector('#decision-status').textContent,
      evidence: condition('evidence'),
      authority: condition('authority'),
      ownershipCondition: condition('ownership'),
      integration: frame.getAttribute('data-integration-state'),
      ownership: frame.getAttribute('data-ownership-state'),
      boundary: frame.getAttribute('data-boundary-state'),
    };
  });
  assert(result.decision.startsWith(state.decision), `${scenario}: wrong decision ${result.decision}`);
  for (const [key, value] of Object.entries(state)) {
    if (key !== 'decision') assert(result[key] === value, `${scenario}: ${key} expected ${value}, got ${result[key]}`);
  }
}

await interactionPage.focus('[data-scenario="speed"]');
await interactionPage.keyboard.press('Enter');
assert(
  (await interactionPage.textContent('#decision-status')).startsWith('REFRAME'),
  'keyboard activation failed',
);

await interactionPage.click('[data-scenario="agent"]');
await interactionPage.click('[data-scenario="legacy"]');
await interactionPage.click('[data-scenario="orphan"]');
assert(
  (await interactionPage.textContent('#decision-status')).startsWith('HOLD'),
  'rapid selection did not settle on final state',
);
await interactionPage.click('#reset-scenario');
assert(
  (await interactionPage.textContent('#decision-status')).startsWith('ADVANCE'),
  'reset did not restore the baseline',
);
await interactionPage.close();

const reducedPage = await browser.newPage({
  viewport: {width: 390, height: 844},
  reducedMotion: 'reduce',
});
await reducedPage.goto(baseURL, {waitUntil: 'networkidle'});
const reduced = await reducedPage.evaluate(() => {
  const hero = document.querySelector('.hero-workstream');
  return [...hero.querySelectorAll('[data-condition],.continuity-rail,.ownership-terminal')].map((node) => ({
    animation: getComputedStyle(node).animationName,
    transition: getComputedStyle(node).transitionDuration,
    opacity: getComputedStyle(node).opacity,
  }));
});
for (const item of reduced) {
  assert(item.animation === 'none', `reduced motion animation remains: ${item.animation}`);
  assert(item.transition === '0s', `reduced motion transition remains: ${item.transition}`);
  assert(Number(item.opacity) === 1, 'reduced motion element is not visible');
}
await reducedPage.close();
await browser.close();
console.log('Outcome Span rendered regression: PASS');
