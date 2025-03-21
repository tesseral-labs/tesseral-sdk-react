# Tesseral React SDK

`@tesseral/tesseral-react` is a client-side React SDK for Tesseral.

* Documentation

## Installation

```bash
npm install @tesseral/tesseral-react
```

## Usage

Get a publishable key from the Tesseral Console, and then wrap your application
in a `TesseralProvider`:

```tsx
import { TesseralProvider } from "@tesseral/tesseral-react";

// before
return (
  <App>...</App>
)

// after
return (
  <TesseralProvider publishableKey="tesseral_publishable_key_...">
    <App>...</App>
  </TesseralProvider>
)
```

All code inside a `TesseralProvider` is guaranteed to only run when your end
user is properly authenticated. `TesseralProvider` will automatically redirect
your end user to your Project's Vault login page if they are not logged in
already.

Any React component under a `TesseralProvider` can get
the current User and the Organization they work for with `useUser()` and
`useOrganization()`:

```tsx
import { useOrganization, useUser } from "@tesseral/tesseral-react";

const SayHello = () => {
  const user = useUser();
  const organization = useOrganization()
  
  return (
    <div>Hi {user.email}! How are things at {organization.displayName}?</div>
  )
}
```

The Tesseral React SDK also provides these hooks:

* `useOrganizationSettingsUrl` returns a link to your Project's Vault
  Organization settings page.

* `useUserSettingsUrl` returns a link to your Project's Vault User settings
  page.

* `useLogout` returns a function. Call that function to log the user out. They
  will automatically be redirected to your Project's Vault login page.

## Authenticating with your API

> [!TIP]
> 
> If your React frontend lives on the same domain as your API, then you can ignore this section.
> 
> For example, if your webapp lives on `localhost:3000`/`app.company.com` and your API lives on `localhost:3000/api/*`/`app.company.com/api/*`, then you can ignore this section.

The Tesseral React SDK guarantees your React app will always have an access
token cookie present. That cookie is guaranteed to be valid for the domain your
React app runs on.

If you run your API on the same domain that your React app runs on, then that
cookie will be automatically sent to your API, and all of Tesseral's Backend
SDKs will automatically use it to authenticate your users.

If your API and your React app run on different domains, then you need to use
the Tesseral React SDK's `useAccessToken` to authenticate the requests your
React app sends to your API.

If you put an `Authorization` header with the value `Bearer ${accessToken}`,
where `accessToken` is the output of `useAccessToken`, then all of Tesseral's
Backend SDK will automatically authenticate your users.

### `useAccessToken` with `axios`

To automatically insert an `Authorization` header in your requests from `axios`,
use something like this:

```ts
import { useAccessToken } from "@tesseral/tesseral-react";

const useAxiosClient = () => {
  const accessToken = useAccessToken();
  return axios.create({
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
```

### `useAccessToken` with `fetch`

To automatically insert an `Authorization` header in your requests from `fetch`,
use something like this:

```ts
import { useAccessToken } from "@tesseral/tesseral-react";

const accessToken = useAccessToken()
const response = fetch("...", {
  // ...
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
});
```
