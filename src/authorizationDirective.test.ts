import test from "ava";
import { graphql } from "graphql";
import { makeExecutableSchema, SchemaDirectiveVisitor } from "graphql-tools";
import { authorizationDirective } from "./authorizationDirective";
import { userCache } from "./userCache";

const typeDefs = `
  directive @requires(permission: String!) on FIELD_DEFINITION

  type Query {
    paymentCard: String @requires(permission: "payment-card.read")
  }
`;

test("authorization directive grants access to a user with the permission", async (t) => {
  userCache.set(
    {
      employeeNumber: "1",
      firstName: "Jane",
      lastName: "Doe",
      position: "",
      department: "",
      email: "__EMAIL_1__",
      location: "",
      isVendor: false,
      teamMembership: [],
      orgStructure: "",
      manager: "",
      permissions: ["payment-card.read"],
    },
    "overseer",
    60,
  );

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers: { Query: { paymentCard: () => "4111 **** **** 1111" } },
    schemaDirectives: {
      requires: authorizationDirective({
        serviceUserAgent: "Overseer/f7a1295 (Kiwi.com sandbox)",
        iamURL: "http://iam.invalid",
        iamToken: "iam-service-token",
      }) as unknown as typeof SchemaDirectiveVisitor,
    },
  });

  const result = await graphql(schema, "{ paymentCard }", null, {
    iapEmail: "__EMAIL_1__",
  });

  t.is(result.errors, undefined);
  t.deepEqual(result.data, { paymentCard: "4111 **** **** 1111" });
});
