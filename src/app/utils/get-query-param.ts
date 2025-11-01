export const getQueryParam = (params: URLSearchParams, paramName: string) =>
  Array.from(params.entries()).find(
    ([key]) => key.toLowerCase() === paramName.toLowerCase()
  )?.[1] ?? null;
