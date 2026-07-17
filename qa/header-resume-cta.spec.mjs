import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const baseURL = process.env.CAMPAIGN_URL || 'http://127.0.0.1:4173/';
const viewports = [
  {name: 'desktop', width: 1440, height: 900, mobileMenu: false},
  {name: 'tablet', width: 768, height: 1024, mobileMenu: true},
  {name: 'mobile', width: 390, height: 844, mobileMenu: true},
  {name: 'narrow', width: 320, height: 700, mobileMenu: true},
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

await fs.mkdir('qa/renders/header-resume-cta', {recursive: true});
const browser = await chromium.launch({headless: true});

for (const viewport of viewports) {
  const page = await browser.newPage({viewport});
  const errors = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', error => errors.push(error.message));

  await page.goto(baseURL, {waitUntil: 'networkidle'});
  await page.waitForSelector('.header-resume-cta', {state: 'attached'});

  if (viewport.mobileMenu) {
    await page.click('.nav-toggle');
    await page.waitForSelector('.site-nav.open');
  }
  await page.waitForSelector('.header-resume-cta', {state: 'visible'});

  const report = await page.evaluate(() => {
    const cta = document.querySelector('.header-resume-cta');
    const nav = document.querySelector('.site-nav');
    const header = document.querySelector('.site-header');
    const rect = cta.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    const styles = getComputedStyle(cta);
    const navStyles = getComputedStyle(nav);
    return {
      text: cta.textContent.replace(/\s+/g, ' ').trim(),
      href: cta.getAttribute('href'),
      background: styles.backgroundColor,
      color: styles.color,
      fontWeight: styles.fontWeight,
      display: styles.display,
      order: styles.order,
      rect: rect.toJSON(),
      navRect: navRect.toJSON(),
      navPaddingLeft: parseFloat(navStyles.paddingLeft),
      navPaddingRight: parseFloat(navStyles.paddingRight),
      isLastDesktopLink: nav.lastElementChild === cta,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      headerHeight: header.getBoundingClientRect().height,
    };
  });

  assert(report.text.includes('View résumé'), `${viewport.name}: CTA label is ${report.text}`);
  assert(report.href === 'resume.html', `${viewport.name}: CTA href is ${report.href}`);
  assert(['flex', 'inline-flex'].includes(report.display), `${viewport.name}: CTA display is ${report.display}`);
  assert(report.background === 'rgb(245, 168, 0)', `${viewport.name}: CTA background is ${report.background}`);
  assert(report.color === 'rgb(1, 30, 65)', `${viewport.name}: CTA color is ${report.color}`);
  assert(Number(report.fontWeight) >= 800, `${viewport.name}: CTA weight is ${report.fontWeight}`);
  assert(report.rect.width > 110 && report.rect.height >= 40, `${viewport.name}: CTA is undersized ${report.rect.width}×${report.rect.height}`);
  assert(report.overflow <= 1, `${viewport.name}: horizontal overflow ${report.overflow}px`);
  assert(report.headerHeight > 0, `${viewport.name}: header has no geometry`);
  assert(errors.length === 0, `${viewport.name}: browser errors: ${errors.join(' | ')}`);

  if (viewport.mobileMenu) {
    const navContentWidth = report.navRect.width - report.navPaddingLeft - report.navPaddingRight;
    assert(report.order === '-1', `${viewport.name}: mobile CTA order is ${report.order}`);
    assert(Math.abs(report.rect.width - navContentWidth) <= 2, `${viewport.name}: CTA width ${report.rect.width}px does not span ${navContentWidth}px mobile content area`);
  } else {
    assert(report.isLastDesktopLink, 'desktop: résumé CTA is not the final navigation action');
  }

  await page.screenshot({
    path: `qa/renders/header-resume-cta/${viewport.name}.png`,
    fullPage: false,
  });
  await page.close();
}

await browser.close();
console.log('Header résumé CTA rendered regression: PASS');
