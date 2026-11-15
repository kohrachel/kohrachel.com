import { BILIBILI_ID } from "@/domain-types/bluebook/links";

const {
  xorCode: XOR_CODE,
  maskCode: MASK_CODE,
  maxAid: MAX_AID,
  base: BASE,
  alphabet: ALPHABET,
} = BILIBILI_ID;

/** Converts an old-style `av` number to its `BV` id. */
export function avToBv(aid: bigint): string {
  const chars = ["B", "V", "1", "0", "0", "0", "0", "0", "0", "0", "0", "0"];
  let tmp = (MAX_AID | aid) ^ XOR_CODE;
  for (let i = chars.length - 1; tmp > BigInt(0); i--) {
    chars[i] = ALPHABET[Number(tmp % BASE)];
    tmp /= BASE;
  }
  [chars[3], chars[9]] = [chars[9], chars[3]];
  [chars[4], chars[7]] = [chars[7], chars[4]];
  return chars.join("");
}

/** Converts a `BV` id back to its `av` number. */
export function bvToAv(bvid: string): bigint {
  const chars = bvid.split("");
  [chars[3], chars[9]] = [chars[9], chars[3]];
  [chars[4], chars[7]] = [chars[7], chars[4]];
  const tmp = chars
    .slice(3)
    .reduce(
      (acc, char) => acc * BASE + BigInt(ALPHABET.indexOf(char)),
      BigInt(0),
    );
  return (tmp & MASK_CODE) ^ XOR_CODE;
}
