import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const PREFIX = "scrypt";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${PREFIX}$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedValue: string) {
  if (!storedValue.startsWith(`${PREFIX}$`)) {
    return password === storedValue;
  }

  const [, salt, originalHash] = storedValue.split("$");
  if (!salt || !originalHash) {
    return false;
  }

  const derived = scryptSync(password, salt, KEY_LENGTH);
  const original = Buffer.from(originalHash, "hex");

  if (derived.length !== original.length) {
    return false;
  }

  return timingSafeEqual(derived, original);
}
