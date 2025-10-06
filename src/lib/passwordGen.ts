export interface GenOptions {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeLookalike: boolean; // exclude 0O1lI|`'" and similar
}

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUM = "0123456789";
const SYM = "!@#$%^&*()-_=+[]{};:,<.>/?";
const LOOKALIKE = new Set("0O1lI|`'\"\u00A6\u2019\u2018");

export function generatePassword(opts: GenOptions): string {
  let pool = "";
  if (opts.lowercase) pool += LOWER;
  if (opts.uppercase) pool += UPPER;
  if (opts.numbers) pool += NUM;
  if (opts.symbols) pool += SYM;
  if (!pool) throw new Error("Empty character set");
  let chars = Array.from(pool);
  if (opts.excludeLookalike) {
    chars = chars.filter(c => !LOOKALIKE.has(c));
  }
  const arr = new Uint32Array(opts.length);
  crypto.getRandomValues(arr);
  let out = "";
  for (let i = 0; i < opts.length; i++) {
    out += chars[arr[i] % chars.length];
  }
  return out;
}


