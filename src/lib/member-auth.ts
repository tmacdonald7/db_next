export function normalizePhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  if (value.startsWith("+") && digits.length >= 10) {
    return `+${digits}`;
  }

  return null;
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}
