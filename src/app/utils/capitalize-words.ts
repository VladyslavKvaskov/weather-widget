export const capitalizeWords = (str: string) =>
  str.replace(
    /\p{L}+/gu,
    (word) => word.charAt(0).toLocaleUpperCase() + word.slice(1)
  );
