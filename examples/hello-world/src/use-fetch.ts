import { useEffect, useState } from "react";

export function useFetch<T>(
  url: string | URL,
  requestInit?: RequestInit,
): {
  error?: any;
  response?: Response;
  data?: T;
} {
  const [error, setError] = useState<any>();
  const [response, setResponse] = useState<Response>();
  const [data, setData] = useState<any>();

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(url, requestInit);
        setResponse(response);
        setData(await response.json());
      } catch (e) {
        setError(e);
      }
    })();
  }, [url, requestInit]);

  return { error, response, data };
}
