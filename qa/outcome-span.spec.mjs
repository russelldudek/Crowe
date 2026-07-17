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
  return a.left < b.right - 1
    && a.right > b.left + 1
    && a.top < b.bottom - 1
    && a.bottom > b.top + 1;
}

await fs.mkdir('qa/renders/outcome-span', {recursive: true});
const browser = await chromium.launch({headless: true});

for (const viewport of viewports) {
  const page = await browser.newPage({viewport});
  await page.goto(baseURL, {waitUntil: 'networkidle'});
  await page.waitForSelector('.outcome-strip--scenario');

  const report = await page.evaluate(() => {
    const strip = document.querySelector('.outcome-strip--scenario');
    const shell = strip.querySelector('.outcome-strip__shell');
    const bays = [...strip.querySelectorAll('.outcome-bay')];
    const foundation = strip.querySelector('.integration-foundation');
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      shellRect: shell.getBoundingClientRect().toJSON(),
      foundationRect: foundation.getBoundingClientRect().toJSON(),
      foundationTextOverflow: foundation.scrollWidth - foundation.clientWidth,
      bays: bays.map(node => ({
        condition: node.dataset.condition || node.dataset.bay,
        rect: node.getBoundingClientRect().toJSON(),
        textOverflow: node.scrollWidth - node.clientWidth,
        text: node.textContent.trim(),
      })),
    };
  });

  assert(report.overflow <= 1, `${viewport.name}: horizontal overflow ${report.overflow}px`);
  assert(report.bays.length === 6, `${viewport.name}: expected six fixed bays`);
  assert(report.foundationTextOverflow <= 1, `${viewport.name}: foundation text overflows`);
  assert(Math.abs(report.foundationRect.left - report.shellRect.left) <= 1, `${viewport.name}: foundation does not start at shell edge`);
  assert(Math.abs(report.foundationRect.right - report.shellRect.right) <= 1, `${viewport.name}: foundation does not span shell`);

  for (const bay of report.bays) {
    assert(bay.text.length > 0, `${viewport.name}: ${bay.condition} text missing`);
    assert(bay.textOverflow <= 1, `${viewport.name}: ${bay.condition} text overflows by ${bay.textOverflow}px`);
    assert(bay.rect.left >= report.shellRect.left - 1, `${viewport.name}: ${bay.condition} escapes left`);
    assert(bay.rect.right <= report.shellRect.right + 1, `${viewport.name}: ${bay.condition} escapes right`);
  }

  for (let first = 0; first < report.bays.length; first += 1) {
    for (let second = first + 1; second < report.bays.length; second += 1) {
      assert(!overlaps(report.bays[first].rect, report.bays[second].rect), `${viewport.name}: bays overlap`);
    }
  }

  await page.screenshot({
    path: `qa/renders/outcome-span/${viewport.name}.png`,
    fullPage: false,
  });
  await page.close();
}

const interactionPage = await browser.newPage({viewport: {width: 1280, height: 800}});
await interactionPage.goto(baseURL, {waitUntil: 'networkidle'});
await interactionPage.waitForSelector('.outcome-strip--scenario');

const expected = {
  baseline: {decision: 'ADVANCE', operating: 'advance', integration: 'active'},
  speed: {decision: 'REFRAME', evidence: 'unresolved', ownership: 'unresolved', operating: 'reframe'},
  agent: {decision: 'BOUND', authority: 'warning', operating: 'bound'},
  orphan: {decision: 'HOLD', ownership: 'unresolved', operating: 'hold'},
  legacy: {decision: 'SEQUENCE', integration: 'uncertain', operating: 'sequence'},
};

for (const [scenario, state] of Object.entries(expected)) {
  await interactionPage.click(`[data-scenario="${scenario}"]`);
  const result = await interactionPage.evaluate(() => {
    const strip = document.querySelector('.outcome-strip--scenario');
    const condition = name => strip.querySelector(`[data-condition="${name}"]`).dataset.conditionState;
    return {
      decision: document.querySelector('#decision-status').textContent,
      outcome: condition('outcome'),
      workflow: condition('workflow'),
      authority: condition('authority'),
      evidence: condition('evidence'),
      ownership: condition('ownership'),
      integration: strip.querySelector('.integration-foundation').dataset.integrationState,
      operating: strip.querySelector('[data-bay="operating-state"]').dataset.operatingState,
    };
  });
  assert(result.decision.startsWith(state.decision), `${scenario}: wrong decision ${result.decision}`);
  for (const [key, value] of Object.entries(state)) {
    if (key !== 'decision') assert(result[key] === value, `${scenario}: ${key} expected ${value}, got ${result[key]}`);
  }
}

await interactionPage.focus('[data-scenario="speed"]');
await interactionPage.keyboard.press('Enter');
assert((await interactionPage.textContent('#decision-status')).startsWith('REFRAME'), 'keyboard activation failed');

await interactionPage.click('[data-scenario="agent"]');
await interactionPage.click('[data-scenario="legacy"]');
await interactionPage.click('[data-scenario="orphan"]');
assert((await interactionPage.textContent('#decision-status')).startsWith('HOLD'), 'rapid selection did not settle on final state');
await interactionPage.click('#reset-scenario');
assert((await interactionPage.textContent('#decision-status')).startsWith('ADVANCE'), 'reset did not restore baseline');
await interactionPage.close();

const reducedPage = await browser.newPage({
  viewport: {width: 390, height: 844},
  reducedMotion: 'reduce',
});
await reducedPage.goto(baseURL, {waitUntil: 'networkidle'});
await reducedPage.waitForSelector('.outcome-strip--scenario');
const reduced = await reducedPage.evaluate(() => [
  ...document.querySelectorAll('.outcome-strip--scenario .outcome-bay,.outcome-strip--scenario .integration-foundation'),
].map(node => getComputedStyle(node).transitionDuration));
for (const duration of reduced) assert(duration === '0s', `reduced motion transition remains: ${duration}`);
await reducedPage.close();

await browser.close();
console.log('Outcome Span interactive regression: PASS');
