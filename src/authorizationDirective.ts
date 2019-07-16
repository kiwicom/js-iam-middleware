import { SchemaDirectiveVisitor } from "graphql-tools";
import {
  GraphQLObjectType,
  GraphQLField,
  GraphQLInterfaceType,
  GraphQLResolveInfo,
} from "graphql";
import { getUser } from "./getUser";

export async function isUserAuthorized(
  serviceUA: string,
  email: string,
  permission: string,
  iamURL: string,
  iamToken: string,
): Promise<boolean> {
  const user = await getUser(serviceUA, email, iamURL, iamToken);
  return user.permissions && user.permissions.includes(permission);
}

export class AuthorizationDirective extends SchemaDirectiveVisitor {
  static serviceUA: string;
  static emailPath: string;
  static iamURL: string;
  static iamToken: string;

  visitFieldDefinition(
    field: GraphQLField<any, any, { [key: string]: any }>,
    _detail: { objectType: GraphQLObjectType | GraphQLInterfaceType },
  ): void | GraphQLField<any, any, { [key: string]: any }> | null {
    const resolve = field.resolve;
    if (!resolve) {
      throw Error("Protected field must define a resolver");
    }

    field.resolve = async (
      source: any,
      args: any, // args of the field
      context: { [key: string]: any }, // graphql context
      info: GraphQLResolveInfo,
    ) => {
      const email = context[AuthorizationDirective.emailPath];
      if (!email || typeof email !== "string") {
        throw Error("User email missing from context");
      }

      if (
        !(await isUserAuthorized(
          AuthorizationDirective.serviceUA,
          email,
          this.args.permission,
          AuthorizationDirective.iamURL,
          AuthorizationDirective.iamToken,
        ))
      ) {
        throw Error(`Token unauthorized for ${this.args.permission}`);
      }
      return resolve(source, args, context, info);
    };
  }
}

interface Options {
  serviceUserAgent: string;
  emailPath?: string;
  iamURL: string;
  iamToken: string;
}

export function authorizationDirective(
  options: Options,
): SchemaDirectiveVisitor {
  if (!options.serviceUserAgent) {
    throw Error(
      "serviceUserAgent must be specified to create the authorization directive",
    );
  }
  if (!options.iamURL || !options.iamToken) {
    throw Error(
      "IAM URL and token must be specified to create the authorization directive",
    );
  }
  AuthorizationDirective.serviceUA = options.serviceUserAgent;
  AuthorizationDirective.emailPath = options.emailPath || "iapEmail";
  AuthorizationDirective.iamURL = options.iamURL;
  AuthorizationDirective.iamToken = options.iamToken;

  // Ignored because TS complains about AuthorizationDirective not being of
  // type SchemaDirectiveVisitor, even though it extends the needed type. This
  // function needs to return the SchemaDirectiveVisitor type, so that the
  // clients using this library won't have to also use ts-ignore when adding
  // the directive to their schemas.
  // @ts-ignore
  return AuthorizationDirective;
}
