export const truncateWithEllipsis = (str: string, maxLength = 15) =>
  str.length > maxLength ? str.slice(0, maxLength - 1) + "…" : str;
