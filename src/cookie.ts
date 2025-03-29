export function getCookie(key: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(key + "="))
    ?.split("=")[1];
}

export function setCookie(key: string, value: string): void {
  document.cookie = `${key}=${value}`;
}

export function deleteCookie(key: string): void {
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
