import { describe, expect, test } from "bun:test";
import { thumbnailFrame } from "./thumbnail";

describe("thumbnailFrame", () => {
  test("keeps a picture's own ratio within 9:16 and 2:1", () => {
    expect(thumbnailFrame({ width: 1280, height: 720 })).toMatchObject({
      ratio: "1280 / 720",
      crop: "cover",
    });
    expect(thumbnailFrame({ width: 113, height: 200 }).crop).toBe("cover");
  });

  test("crops taller pictures from the top and wider ones in the middle", () => {
    expect(thumbnailFrame({ width: 100, height: 400 })).toMatchObject({
      ratio: "9 / 16",
      crop: "top",
    });
    expect(thumbnailFrame({ width: 3000, height: 1000 })).toMatchObject({
      ratio: "2 / 1",
      crop: "cover",
    });
  });

  test("shows a picture of unknown size whole in a 16:9 frame", () => {
    expect(thumbnailFrame(null)).toMatchObject({
      ratio: "16 / 9",
      crop: "fit",
    });
  });
});
