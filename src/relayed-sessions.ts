const RELAYED_SESSION_TOKEN_PREFIX = "#__tesseral_relayed_session_token=";

export function extractRelayedSessionToken(): string | undefined {
  if (window.location.hash.startsWith(RELAYED_SESSION_TOKEN_PREFIX)) {
    const token = window.location.hash.substring(
      RELAYED_SESSION_TOKEN_PREFIX.length,
    );

    console.log("Extracted relayed session token, rewriting state", token);
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    return token;
  }
}
