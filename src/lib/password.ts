import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, storedValue: string): boolean {
  // Handle bcrypt hash (starts with $2)
  if (storedValue.startsWith("$2")) {
    return bcrypt.compareSync(password, storedValue);
  }

  // Legacy: plain text comparison (for development)
  return password === storedValue;
}
