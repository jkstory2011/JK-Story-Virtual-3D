import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const browser = await chromium.launch({
  headless: true,
  args: ["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader"],
});
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto("http://localhost:3000/jkstory-preview", { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "JK Story Virtual 3D" }).waitFor();
  await page.locator("canvas").first().waitFor();
  await page.waitForTimeout(3000);
  if (await page.getByText("WebGL", { exact: false }).count()) {
    throw new Error("The office renderer reported that WebGL is unavailable.");
  }
  await mkdir("test-results", { recursive: true });
  await page.screenshot({ path: "test-results/jkstory-preview.png", fullPage: true });
  console.log("Captured JKSTORY office screenshot.");
} finally {
  await browser.close();
}
