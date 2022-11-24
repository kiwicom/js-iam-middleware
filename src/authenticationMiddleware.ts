import { Request, Response, NextFunction } from "express";
import { validateIAPToken } from "./validateIAPToken";

export const audienceRegex =
  /^\/projects\/\d+\/(?:apps|global\/backendServices)\/(?:\d+|[a-z0-9-]+)$/;

interface Options {
  audience?: string;
  iapProjectNumber?: string;
  iapServiceID?: string;
}

export function required<T>(value: T | undefined | null, fieldName: string): T {
  if (value === undefined || value === null) {
    throw Error(`Missing '${fieldName}', option must be specified.`);
  }

  return value;
}

export function validateAudience(audience: string | undefined): void {
  if (!(typeof audience === "string" && audience.match(audienceRegex))) {
    throw TypeError(
      `'audience' needs to be a string matching ${audienceRegex}`,
    );
  }
}

export const authenticationMiddleware =
  (opts: Options) => async (req: Request, _: Response, next: NextFunction) => {
    // Handle deprecated options
    if (opts.iapProjectNumber && opts.iapServiceID) {
      required(opts.iapProjectNumber, "iapProjectNumber");
      required(opts.iapServiceID, "iapServiceID");

      console.log(
        "'iapProjectNumber' and 'iapServiceID' are deprecated and will be removed. Use 'audience' instead.",
      );
    } else {
      validateAudience(required(opts.audience, "audience"));
    }

    const expectedAudience =
      opts.audience ||
      `/projects/${opts.iapProjectNumber}/global/backendServices/${opts.iapServiceID}`;
    const iapToken = req.get("x-goog-iap-jwt-assertion");

    try {
      if (!iapToken) {
        throw Error("IAP token not present");
      }

      await validateIAPToken(iapToken, expectedAudience);
      next();
    } catch (err) {
      console.log("IAP validation failed", err);
      err.status = 403;
      next(err);
    }
  };
