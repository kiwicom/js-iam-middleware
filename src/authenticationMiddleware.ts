import { Request, Response, NextFunction } from "express";
import { validateIAPToken } from "./validateIAPToken";

interface Options {
  iapProjectNumber?: string;
  iapServiceID?: string;
}

export function required<T>(value: T | undefined | null, fieldName: string): T {
  if (value === undefined || value === null) {
    throw Error(`Missing '${fieldName}', option must be specified.`);
  }
  return value;
}

export const authenticationMiddleware = (opts: Options) => async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  required(opts.iapProjectNumber, "iapProjectNumber");
  required(opts.iapServiceID, "iapServiceID");

  const iapToken = req.get("x-goog-iap-jwt-assertion");
  const expectedAudience = `/projects/${opts.iapProjectNumber}/global/backendServices/${opts.iapServiceID}`;

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
