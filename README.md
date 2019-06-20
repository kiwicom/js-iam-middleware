# Kiwi IAM

## Usage

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
      emailPath: "userEmail", // path for getting user email in context, default is 'email'
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
