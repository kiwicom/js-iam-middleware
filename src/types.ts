import type {
  RequestInfo as NodeRequestInfo,
  RequestInit as NodeRequestInit,
  Response as NodeResponse,
} from "node-fetch";

/*
 * All of the options below are described in https://cloud.google.com/iap/docs/authentication-howto
 * Please prepare a Other type client id and secret as described in the above link in "Authenticating from a desktop app" section
 */
export interface DesktopIAPOptions {
  // other type client id
  clientId: string;
  // other type client secret
  clientSecret: string;
  // global IAP client ID
  iapClientId: string;
}

export type Fetcher = (
  url: NodeRequestInfo,
  init?: NodeRequestInit,
) => Promise<NodeResponse>;

export type ClientFetcher = (
  url: Request | URL,
  init?: RequestInit,
) => Promise<globalThis.Response>;
