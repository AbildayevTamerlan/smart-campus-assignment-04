// Takes the screenshots in docs/screenshots/ from the built app.
// Usage:
//   npm run build && npx vite preview --port 4173 --strictPort &
//   NODE_PATH=<dir containing playwright> CHROME=/usr/bin/google-chrome node docs/scripts/screenshots.cjs
// Playwright is not a project dependency; it was available globally in the
// environment used to produce these screenshots.
const path = require("node:path");
const { chromium } = require("playwright");

const URL = process.env.APP_URL || "http://localhost:4173/";
const OUT = path.join(__dirname, "..", "screenshots");

async function freshPage(browser, viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });
  await page.goto(URL);
  await page.getByRole("heading", { name: "Smart Campus Room Availability" }).waitFor();
  return page;
}

async function setTimes(page, now, start, end) {
  await page.getByLabel("Now", { exact: true }).fill(now);
  await page.getByLabel("Start", { exact: true }).fill(start);
  await page.getByLabel("End", { exact: true }).fill(end);
}

const room = (page, name) => page.getByRole("radio", { name: new RegExp(name) });
const check = (page) => page.getByRole("button", { name: /check availability/i }).click();

async function shot(page, file) {
  await page.screenshot({ path: path.join(OUT, file), fullPage: true });
  console.log("saved", file);
}

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROME || undefined,
    args: ["--no-sandbox"],
  });
  const desktop = { width: 1024, height: 900 };

  // (a) Filters with several matching rooms: 8 attendees + Projector.
  let page = await freshPage(browser, desktop);
  await page.getByLabel("Attendees").fill("8");
  await page.getByRole("checkbox", { name: "Projector" }).check();
  await shot(page, "a-filters-several-matches.png");
  await page.close();

  // (b) Empty state: Computers + Video conferencing (no room has both).
  page = await freshPage(browser, desktop);
  await page.getByRole("checkbox", { name: "Computers" }).check();
  await page.getByRole("checkbox", { name: "Video conferencing" }).check();
  await shot(page, "b-empty-state.png");
  await page.close();

  // (c) Available: Library Study Room 201, 10:30–11:30, now 08:30.
  page = await freshPage(browser, desktop);
  await room(page, "Library Study Room 201").check();
  await setTimes(page, "08:30", "10:30", "11:30");
  await check(page);
  await page.getByRole("status").waitFor();
  await shot(page, "c-available.png");
  await page.close();

  // (d) Unavailable overlap: Business Seminar Room 305, same slot (Case Discussion 10:30–11:30).
  page = await freshPage(browser, desktop);
  await room(page, "Business Seminar Room 305").check();
  await setTimes(page, "08:30", "10:30", "11:30");
  await check(page);
  await page.getByRole("status").waitFor();
  await shot(page, "d-unavailable-overlap.png");
  await page.close();

  // (e) Blocked room checked: Media Studio 014, free slot 13:00–14:00.
  page = await freshPage(browser, desktop);
  await room(page, "Media Studio 014").check();
  await setTimes(page, "08:00", "13:00", "14:00");
  await check(page);
  await page.getByRole("status").waitFor();
  await shot(page, "e-blocked-room.png");
  await page.close();

  // (f) Mobile width 390px: filters set, room picked, Available result.
  page = await freshPage(browser, { width: 390, height: 844 });
  await page.getByLabel("Attendees").fill("20");
  await page.getByRole("checkbox", { name: "Projector" }).check();
  await room(page, "Engineering Lab 110").check();
  await setTimes(page, "09:00", "10:00", "12:00");
  await check(page);
  await page.getByRole("status").waitFor();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  console.log("mobile horizontal overflow:", overflow);
  await shot(page, "f-mobile-390.png");
  await page.close();

  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
