import React from "react";
import { createRoot } from "react-dom/client";
import { useAccessToken, useOrganization, useUser } from "@/context";
import { TesseralProvider } from "@/tesseral-provider";

function App() {
  const organization = useOrganization();
  const user = useUser();
  const accessToken = useAccessToken();
  return (
    <div>
      <h1>Hello, {user.email}!</h1>
      <div>
        Organization: {organization.id} ("{organization.displayName}")
      </div>
      <div>
        User: {user.id} ({user.email})
      </div>
      <div>Access token: {accessToken}</div>
    </div>
  );
}

const root = createRoot(document.getElementById("react-root") as HTMLElement);
root.render(
  <TesseralProvider publishableKey="publishable_key_78b34yplz6owh3c45jfpykeix">
    <App />
  </TesseralProvider>,
);
