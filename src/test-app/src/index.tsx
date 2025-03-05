import React from "react";
import { createRoot } from "react-dom/client";
import {
    TesseralProvider,
    useAccessToken,
    useOrganization,
    useUser,
    useLogout,
    useMaybeOrganization, useMaybeUser
} from "../../index";

function App() {
  const organization = useOrganization();
  const user = useUser();
  const accessToken = useAccessToken();
  const logout = useLogout();
  //   console.log(useMaybeOrganization());
  //   console.log(useMaybeUser());
  //   console.log(useAccessToken());
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

        <button onClick={logout}>Logout</button>
    </div>
  );
}

const root = createRoot(document.getElementById("react-root") as HTMLElement);
root.render(
  <TesseralProvider
    publishableKey="publishable_key_78b34yplz6owh3c45jfpykeix"
    configApiHostname="config.tesseral.example.com"
  >
    <App />
  </TesseralProvider>,
);
