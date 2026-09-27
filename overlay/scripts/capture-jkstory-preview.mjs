import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const browser = await chromium.launch({
  headless: true,
  args: ["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader"],
});
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
  await page.goto("http://localhost:3000/jkstory-preview", { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "JK Story Virtual 3D" }).waitFor();
  await page.locator("canvas").first().waitFor();
  await page.waitForTimeout(3000);
  const label = page.locator(".office-actor-label").first();
  await label.waitFor();
  const labelStyle = await label.evaluate((element) => ({
    position: getComputedStyle(element).position,
    background: getComputedStyle(element.querySelector(".office-actor-name")).backgroundColor,
  }));
  if (labelStyle.position !== "absolute" || labelStyle.background === "rgba(0, 0, 0, 0)") {
    throw new Error(`3D actor label styles are missing: ${JSON.stringify(labelStyle)}`);
  }
  if (await page.getByText("WebGL", { exact: false }).count()) {
    throw new Error("The office renderer reported that WebGL is unavailable.");
  }
  await page.getByLabel("시험 업무명").fill("출고 요청 접수 흐름 확인");
  await page.getByLabel("담당 AI").selectOption("Hermes");
  await page.getByRole("button", { name: "시험 업무 등록" }).click();
  await page.getByLabel("출고 요청 접수 흐름 확인 상태").selectOption("진행");
  await page.reload({ waitUntil: "networkidle" });
  const status = await page.getByLabel("출고 요청 접수 흐름 확인 상태").inputValue();
  if (status !== "진행") throw new Error(`Trial task was not preserved after reload: ${status}`);
  await mkdir("test-results", { recursive: true });
  const cdp = await page.context().newCDPSession(page);
  const capture = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  await writeFile("test-results/jkstory-preview.png", Buffer.from(capture.data, "base64"));
  await page.locator("canvas").first().evaluate((element) => element.setAttribute("data-preview-test-id", "persistent"));
  await page.getByRole("button", { name: "대표실" }).click();
  await page.getByText("JKSTORY 대표실").waitFor();
  if (await page.locator("canvas").first().getAttribute("data-preview-test-id") !== "persistent") {
    throw new Error("Room switching recreated the WebGL canvas.");
  }
  await page.waitForTimeout(1200);
  const suite = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  await writeFile("test-results/jkstory-executive-suite.png", Buffer.from(suite.data, "base64"));
  console.log("Captured JKSTORY office screenshot.");
} finally {
  await browser.close();
}
