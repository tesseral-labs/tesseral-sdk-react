export function getCookie(key: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(key + "="))
    ?.split("=")[1];
}

export function setCookie(key: string, value: string): void {
  document.cookie = `${key}=${value}`;
}
