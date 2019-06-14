# Kiwi IAM

## Usage

### Requirements

- **env**: the following environment variables need to be set.

```shell
# Used to connect to Kiwi IAM
KIWI_IAM_URL=
KIWI_IAM_TOKEN=
```

- **email**: if using directives the user email should be set in context, if
  using GraphQL-JS it should be passed to `isUserAuthorized`.

  This value is used to determine which user is trying to access a certain
  object/field. **It is recommended to extract the email from the authentication
  token, and use it only if the token is authenticated.**

### SDL first approach (directives)

**schema.graphql**

```graphql
# import * from '@kiwicom/iam/src/AuthorizationDirective.graphql'

type Query {
  paymentCard: String @auth(role: "payment-card:read")
}

type Mutation{
  updatePaymentCard(input: PaymentCardInfo!) @auth(role: "payment-card:write")
}
```

**server.js**

```js
import { authorizationDirective } from "@kiwicom/iam";

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives: {
    auth: authorizationDirective({
      serviceUserAgent: "Overseer/f7a1295 (Kiwi.com sandbox)",
      emailPath: "userEmail", // path for getting user email in context, default is 'email'
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
      // This field is available only to users with 'payment-card:read' role.
      type: PaymentCard,
      resolve: async ({ paymentCard }, args, { email }) => {
        if (
          !(await isUserAuthorized(
            serviceUserAgent,
            email,
            "payment-card:read",
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
