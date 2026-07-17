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

await fs.mkdir('qa/renders/three-outcome-volume', {recursive: true});
const browser = await chromium.launch({headless: true});

for (const viewport of viewports) {
  const page = await browser.newPage({viewport});
  const errors = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', error => errors.push(error.message));

  await page.goto(baseURL, {waitUntil: 'networkidle'});
  await page.waitForSelector('.outcome-volume-stage');

  const early = await page.evaluate(() => {
    const stage = document.querySelector('.outcome-volume-stage');
    const rect = stage.getBoundingClientRect();
    return {width: rect.width, height: rect.height};
  });

  await page.waitForTimeout(3400);

  const report = await page.evaluate(() => {
    const stage = document.querySelector('.outcome-volume-stage');
    const canvas = stage.querySelector('canvas');
    const fallback = stage.querySelector('.outcome-volume__fallback');
    const scenario = document.querySelector('.outcome-strip--scenario');
    const rect = stage.getBoundingClientRect();
    const canvasRect = canvas?.getBoundingClientRect();
    const fallbackRect = fallback?.getBoundingClientRect();
    const diagnostics = window.__outcomeVolumeDiagnostics || null;
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      stageRect: rect.toJSON(),
      canvasRect: canvasRect?.toJSON() || null,
      fallbackRect: fallbackRect?.toJSON() || null,
      fallbackDisplay: fallback ? getComputedStyle(fallback).display : 'missing',
      scenarioPresent: Boolean(scenario),
      diagnostics,
      currentSize: {width: rect.width, height: rect.height},
    };
  });

  assert(report.overflow <= 1, `${viewport.name}: horizontal overflow ${report.overflow}px`);
  assert(report.scenarioPresent, `${viewport.name}: interactive Outcome Span was removed`);
  assert(report.diagnostics, `${viewport.name}: diagnostics unavailable`);
  assert(report.diagnostics.fieldCount === 5, `${viewport.name}: expected five fields`);
  assert(report.diagnostics.settled === true, `${viewport.name}: scene did not settle`);
  assert(report.diagnostics.continuousAnimation === false, `${viewport.name}: scene kept animating`);
  assert(report.diagnostics.meshCount >= 10, `${viewport.name}: scene is structurally too sparse`);
  assert(Math.abs(report.currentSize.width - early.width) <= 1, `${viewport.name}: stage width changed during motion`);
  assert(Math.abs(report.currentSize.height - early.height) <= 1, `${viewport.name}: stage height changed during motion`);

  const visibleRect = report.diagnostics.fallbackActive ? report.fallbackRect : report.canvasRect;
  assert(visibleRect, `${viewport.name}: no visible canvas or fallback`);
  assert(visibleRect.left >= report.stageRect.left - 1, `${viewport.name}: visual escapes stage left`);
  assert(visibleRect.right <= report.stageRect.right + 1, `${viewport.name}: visual escapes stage right`);
  assert(visibleRect.top >= report.stageRect.top - 1, `${viewport.name}: visual escapes stage top`);
  assert(visibleRect.bottom <= report.stageRect.bottom + 1, `${viewport.name}: visual escapes stage bottom`);
  assert(errors.length === 0, `${viewport.name}: browser errors: ${errors.join(' | ')}`);

  await page.screenshot({
    path: `qa/renders/three-outcome-volume/${viewport.name}.png`,
    fullPage: false,
  });
  await page.close();
}

const reducedPage = await browser.newPage({
  viewport: {width: 390, height: 844},
  reducedMotion: 'reduce',
});
await reducedPage.goto(baseURL, {waitUntil: 'networkidle'});
await reducedPage.waitForSelector('.outcome-volume-stage');
await reducedPage.waitForTimeout(300);
const reduced = await reducedPage.evaluate(() => ({
  diagnostics: window.__outcomeVolumeDiagnostics,
  stageFallback: document.querySelector('.outcome-volume-stage')?.dataset.fallback || 'false',
}));
assert(reduced.diagnostics, 'reduced motion diagnostics unavailable');
assert(reduced.diagnostics.reducedMotion === true, 'reduced motion not detected');
assert(reduced.diagnostics.settled === true, 'reduced motion did not show final state immediately');
assert(reduced.diagnostics.continuousAnimation === false, 'reduced motion started continuous animation');
assert(reduced.diagnostics.frameCount <= 2, `reduced motion rendered too many frames: ${reduced.diagnostics.frameCount}`);
await reducedPage.close();

const fallbackPage = await browser.newPage({viewport: {width: 1280, height: 800}});
await fallbackPage.addInitScript(() => {
  window.__forceOutcomeVolumeFallback = true;
});
await fallbackPage.goto(baseURL, {waitUntil: 'networkidle'});
await fallbackPage.waitForSelector('.outcome-volume-stage[data-fallback="true"]');
const fallback = await fallbackPage.evaluate(() => ({
  diagnostics: window.__outcomeVolumeDiagnostics,
  fallbackDisplay: getComputedStyle(document.querySelector('.outcome-volume__fallback')).display,
  scenarioPresent: Boolean(document.querySelector('.outcome-strip--scenario')),
}));
assert(fallback.diagnostics?.fallbackActive === true, 'forced fallback did not activate');
assert(fallback.diagnostics?.settled === true, 'fallback did not resolve to final state');
assert(fallback.fallbackDisplay !== 'none', 'fallback visual is hidden');
assert(fallback.scenarioPresent, 'fallback removed interactive Outcome Span');
await fallbackPage.close();

await browser.close();
console.log('Three.js Outcome Volume rendered regression: PASS');
