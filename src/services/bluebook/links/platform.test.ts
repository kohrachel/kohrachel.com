import { describe, expect, test } from "bun:test";
import { platformGroup, platformName } from "./platform";

describe("platformGroup and platformName", () => {
  test("group subdomains under their common platform", () => {
    expect(platformGroup("en.wikipedia.org")).toBe("wikipedia.org");
    expect(platformGroup("space.bilibili.com")).toBe("bilibili.com");
    expect(platformGroup("example.com")).toBe("example.com");
  });

  test("name a platform, its subdomains and its group", () => {
    expect(platformName("youtube.com")).toBe("YouTube");
    expect(platformName("zh.wikipedia.org")).toBe("Wikipedia");
    expect(platformName("wikipedia.org")).toBe("Wikipedia");
    expect(platformName("example.com")).toBe("example.com");
  });
});
