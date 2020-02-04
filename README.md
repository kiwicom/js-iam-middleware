# Kiwi IAM

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This library is meant to be used together with [kiwicom/iam](https://github.com/kiwicom/iam)
for user authorization, and [IAP](https://cloud.google.com/iap/) for
authentication.

Permissions are defined as Okta groups. IAM parses (and caches) these groups,
and returns the relevant permissions for each user, based on the the service
requesting the data.

## Usage

1. [Authentication](#authentication)
2. [Authorization](#authorization)
   - [Requirements](#requirements)
   - [SDL first](<#sdl-first-approach-(directives)>)
   - [GraphQLJS](#GraphQL-JS)
3. [IAP token generation](#IAP-token-generation)
   - [Pre-requisites](#pre-requisites)
   - [Usage](#usage)

## Authentication

For authentication through IAP you can use the `express` middleware as in the
example below.

```js
import { authenticationMiddleware } from "@kiwicom/iam";

const options = {
  // The correct audience for your project can be found in GCP.
  audience: process.env.IAP_AUDIENCE,
};

const app = express();
// Routes created here will be unauthenticated.
app.use(authenticationMiddleware(options));
// Routes created here will be authenticated.
```

## Authorization

### Requirements

- You will need a service token for Kiwi IAM.
- Your user agent should be in the format `service/version (organization environment)` (eg. `my-secure-app/2c1e28a (Kiwi.com sandbox)`).
- **email**: if using directives the user email should be set in context, if
  using GraphQL-JS it should be passed to `isUserAuthorized`.

  Either way, **it is recommended to use the authentication part of this library
  to set the email in context**, or to extract it from the token after it's verified.

### SDL first approach (directives)

**schema.graphql**

```graphql
# import * from '@kiwicom/iam/AuthorizationDirective.graphql'

type Query {
  paymentCard: String @requires(permission: "payment-card.read")
}

type Mutation{
  updatePaymentCard(input: PaymentCardInfo!) @requires(permission: "payment-card.write")
}
```

**server.js**

```js
import { authorizationDirective } from "@kiwicom/iam";

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives: {
    requires: authorizationDirective({
      serviceUserAgent: "Overseer/f7a1295 (Kiwi.com sandbox)",
      emailPath: "userEmail", // path for getting user email in context, default is 'iapEmail'
      iamURL: process.env.KIWI_IAM_URL,
      iamToken: process.env.KIWI_IAM_TOKEN,
    }),
  },
});
```

### GraphQL-JS

**NOTE: do not forget to `await` for `isUserAuthorized`, otherwise it will
always evaluate to true** (being async it returns a Promise, and objects in JS
evaluate to true).

```js
import { isUserAuthorized } from "@kiwicom/iam";

const serviceUserAgent = "Overseer/f7a1295 (Kiwi.com sandbox)";

export default new GraphQLObject({
  name: "Booking",
  fields: {
    paymentCard: {
      // This field is available only to users with 'payment-card:read' permissions.
      type: PaymentCard,
      resolve: async ({ paymentCard }, args, { email }) => {
        if (
          !(await isUserAuthorized(
            serviceUserAgent,
            email,
            "payment-card:read",
            process.env.KIWI_IAM_URL,
            process.env.KIWI_IAM_TOKEN,
          ))
        ) {
          throw Error("Unauthorized");
        }
        return paymentCard;
      },
    },
  },
});
```

## IAP token generation for programmatic authentication

For local development it is useful to be able to generate a refresh_token. This library supplies a script for doing this.

### Pre-requisites

- OAuth client ID credentials ("Client ID" and "Client secret") for authenticating from a desktop app: <https://cloud.google.com/iap/docs/authentication-howto#authenticating_from_a_desktop_app>

### Usage

**Fill the following environment variables:**

```
CLIENT_ID - OAuth Client ID for authenticating from a desktop app
CLIENT_SECRET - OAuth Client secret for authenticating from a desktop app
```

`package.json`

```json
{
  "scripts": {
    "generate:token": "node ./node_modules/@kiwicom/iam/dist/scripts"
  }
}
```

Now run `generate:token` a browser will open displaying an authorization code (starting with `4/`) and the CLI will ask you to input the authorization code. After that you will be provided with a `refresh_token` (starting with `1/`) that has long validity and can be used for local development.

# Contributing

We are always looking for people to contribute! Please check https://github.com/kiwicom/js-iam-middleware/blob/master/CONTRIBUTING.md for the guidelines.

# License

The code in this project is licensed under [MIT license](https://github.com/kiwicom/js-iam-middleware/blob/master/LICENSE). By contributing to js-iam-middleware, you agree that your contributions will be licensed under its MIT license.
