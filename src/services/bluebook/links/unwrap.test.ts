import { describe, expect, test } from "bun:test";
import { unwrapRedirect } from "./unwrap";

const cases: [string, string][] = [
  [
    "https://www.linkedin.com/safety/go/?url=https%3A%2F%2Flnkd.in%2FgiHgfTNd&urlhash=9hmr&mt=Z60ys_Kx8M3Ok1pmjltzM0W_okZq2trYKtxocTJnGl5Mk6-qreJhNPIZKGom9B_0FFkNSngJRDVT-O6fzbq_OlJUTatIMLS6iVcZ0ZA_GYL_5Mt52BqfeHkQU_yRabdZpe_5LZRU7dtn5-CvPeFngGjVqxctHzvGUGTmbFTrosq3Kt8W8hZVywbpISYLqnXxDTZBAbfQzDpqw0A&isSdui=true&lipi=urn%3Ali%3Apage%3Ad_flagship3_showcase_overview%3BeDLoZ73uRXK%2BHqR0uGCXGA%3D%3D",
    "https://lnkd.in/giHgfTNd",
  ],
  [
    "https://www.google.com/url?sa=t&q=https%3A%2F%2Fexample.com%2Fpost&usg=abc",
    "https://example.com/post",
  ],
  [
    "https://www.linkedin.com/safety/go/?url=not-a-link",
    "https://www.linkedin.com/safety/go/?url=not-a-link",
  ],
  [
    "https://www.linkedin.com/in/someone/",
    "https://www.linkedin.com/in/someone/",
  ],
  [
    "https://example.com/url?q=https://other.com",
    "https://example.com/url?q=https://other.com",
  ],
];

describe("unwrapRedirect", () => {
  test.each(cases)("%s", (input, expected) => {
    expect(unwrapRedirect(input)).toBe(expected);
  });
});
