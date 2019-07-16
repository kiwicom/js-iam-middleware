import { validate } from "./validateIAPToken";
import { getUser } from "./getUser";

interface Options {
  iapProjectNumber?: string;
  iapServiceID?: string;

  tokenPath?: string;
  setUserEmail?: boolean;

  serviceUserAgent?: string;
  iamURL?: string;
  iamToken?: string;
  setUserData?: boolean;
}

export function required<T>(value: T | undefined | null, fieldName: string): T {
  if (value === undefined || value === null) {
    throw Error(`Missing '${fieldName}', option must be specified.`);
  }
  return value;
}

export const authenticationMiddleware = (opts: Options) => async (
  resolve: Function,
  root: any,
  args: any,
  context: any,
  info: any,
) => {
  required(opts.iapProjectNumber, "iapProjectNumber");
  required(opts.iapServiceID, "iapServiceID");
  const expectedAudience = `/projects/${
    opts.iapProjectNumber
  }/global/backendServices/${opts.iapServiceID}`;

  const iapToken = context[opts.tokenPath || "iapToken"];
  if (!iapToken) {
    throw Error("IAP token is missing from context");
  }

  const userData = await validate(iapToken, expectedAudience);
  if (!userData || typeof userData !== "object") {
    throw Error("Token payload ");
  }

  if (opts.setUserEmail) {
    context.iapEmail = userData.email;
  }
  if (opts.setUserData) {
    context.iapUser = await getUser(
      required(opts.serviceUserAgent, "serviceUserAgent"),
      userData.email,
      required(opts.iamURL, "iamURL"),
      required(opts.iamToken, "iamToken"),
    );
  }

  return resolve(root, args, context, info);
};
