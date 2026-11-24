import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

type Params = { n: number; r: number; p: number };

const CURRENT: Params = { n: 2 ** 17, r: 8, p: 1 };
const SALT_BYTES = 16;
const KEY_BYTES = 32;
const FORMAT = /^\$scrypt\$n=(\d+),r=(\d+),p=(\d+)\$([\w-]+)\$([\w-]+)$/;

function derive(
  password: string,
  salt: Buffer,
  params: Params,
  length: number,
) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(
      password.normalize("NFKC"),
      salt,
      length,
      {
        N: params.n,
        r: params.r,
        p: params.p,
        maxmem: 256 * params.n * params.r,
      },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const key = await derive(password, salt, CURRENT, KEY_BYTES);
  const { n, r, p } = CURRENT;
  return `$scrypt$n=${n},r=${r},p=${p}$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

function parse(stored: string) {
  const match = FORMAT.exec(stored);
  if (!match) return null;
  const [, n, r, p, salt, key] = match;
  return {
    params: { n: Number(n), r: Number(r), p: Number(p) },
    salt: Buffer.from(salt, "base64url"),
    key: Buffer.from(key, "base64url"),
  };
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parsed = parse(stored);
  if (!parsed || parsed.key.length === 0) return false;
  const key = await derive(
    password,
    parsed.salt,
    parsed.params,
    parsed.key.length,
  );
  return timingSafeEqual(key, parsed.key);
}

export function needsRehash(stored: string): boolean {
  const parsed = parse(stored);
  if (!parsed) return true;
  const { n, r, p } = parsed.params;
  return n !== CURRENT.n || r !== CURRENT.r || p !== CURRENT.p;
}

let dummyHash: Promise<string> | null = null;

/** Takes as long as a real check, for sign-ins with no account to check against. */
export async function wasteTime(password: string): Promise<false> {
  dummyHash ??= hashPassword(randomBytes(16).toString("hex"));
  await verifyPassword(password, await dummyHash);
  return false;
}
