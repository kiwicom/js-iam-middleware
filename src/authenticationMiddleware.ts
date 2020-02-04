import { Request, Response, NextFunction } from "express";
import { validateIAPToken } from "./validateIAPToken";

export const audienceRegex = /^\/projects\/\d+\/(?:apps|global\/backendServices)\/(?:\d+|[a-z0-9-]+)$/;

interface Options {
  audience?: string;
  iapProjectNumber?: string;
  iapServiceID?: string;
}

export function required<T>(value: T | undefined | null, fieldName: string): T {
  if (value === undefined || value === null) {
    throw Error(`Missing '${fieldName}', option must be specified.`);
  }

  console.log(`'${fieldName}' is deprecated and will be removed. Use 'audience' instead.`);
  return value;
}

export const authenticationMiddleware = (opts: Options) => async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (opts.audience) {
    if (!(typeof opts.audience === 'string' && opts.audience.match(audienceRegex))) {
      throw Error(`'audience' needs to be a string matching ${audienceRegex}`);
    }
  } else {
    required(opts.iapProjectNumber, "iapProjectNumber");
    required(opts.iapServiceID, "iapServiceID");
  }

  const iapToken = req.get("x-goog-iap-jwt-assertion");
  const expectedAudience = opts.audience || `/projects/${opts.iapProjectNumber}/global/backendServices/${opts.iapServiceID}`;

  try {
    if (!iapToken) {
      throw Error("IAP token not present");
    }

    await validateIAPToken(iapToken, expectedAudience);
    next();
  } catch (err) {
    console.log("IAP validation failed", err);
    res.status(403).json({ message: "IAP validation failed", err });
  }
};
