# Kiwi IAM

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Usage

1. [Authentication](#authentication)
2. [SDL first](<#sdl-first-approach-(directives)>)
3. [GraphQLJS](#GraphQL-JS)
4. [IAP token generation](#IAP-token-generation)

### Authentication

For authentication through IAP you can use the GraphQL middleware as in the
example below.

```js
import { applyMiddleware } from "graphql-middleware";
import { makeExecutableSchema } from "graphql-tools";
import { authenticationMiddleware } from "@kiwicom/iam";

const options = {
  iapProjectNumber: process.env.IAP_PROJECT_NUMBER,
  iapServiceID: process.env.IAP_SERVICE_ID,

  // Path to IAP token on context (default is `iapToken`).
  tokenPath: "token",
  // Set user email to context after validation (default is false).
  setUserEmail: true,

  // Set user data from IAM to context after validation, the attributes below
  // are mandatory if `setUserData` is true (default is false).
  setUserData: true,
  iamURL: process.env.IAM_URL,
  iamToken: process.env.IAM_TOKEN,
  serviceUserAgent: "Service/version (Kiwi.com environment)";
};

const schema = makeExecutableSchema({ typeDefs, resolvers });
const schemaWithMiddleware = applyMiddleware(
  schema,
  authenticationMiddleware(options),
);
```

### Requirements

- **email**: if using directives the user email should be set in context, if
  using GraphQL-JS it should be passed to `isUserAuthorized`.

  This value is used to determine which user is trying to access a certain
  object/field. **It is recommended to extract the email from the authentication
  token, and use it only if the token is authenticated.**

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

### IAP token generation

For local development it is useful to be able to generate a refresh_token. This library supplies a script for doing this.

#### Pre-requisites

- Client id and client secret from desktop IAP application <https://cloud.google.com/iap/docs/authentication-howto>

#### Usage:

**Fill the following environment variables:**

```
CLIENT_ID - Client ID of the desktop application created in IAP
CLIENT_SECRET - Client secret of the desktop application created in IAP
```

`package.json`

```json
{
  "scripts": {
    "generate:token": "node ./node_modules/@kiwicom/iam/dist/scripts"
  }
}
```

Now run `generate:token` a browser will open and the CLI will ask you to input the token you get from the browser. After that you will be provided with a `refresh_token` that has long validity and can be used for local development.

# Contributing

We are always looking for people to contribute! Please check https://github.com/kiwicom/js-iam-middleware/blob/master/CONTRIBUTING.md for the guidelines.

# License

The code in this project is licensed under [MIT license](https://github.com/kiwicom/js-iam-middleware/blob/master/LICENSE). By contributing to js-iam-middleware, you agree that your contributions will be licensed under its MIT license.
