export const validateViewBox = (input?: string | null): string => {
  const fallback = "0 0 130 130";
  if (!input) return fallback;

  const parts = input.trim().split(/\s+/);

  const isValid = parts.length === 4 && parts.every((p) => /^\d+$/.test(p));

  return isValid ? parts.join(" ") : fallback;
};
