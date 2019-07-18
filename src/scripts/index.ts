import { GetString } from "mamushi";
import opn from "opn";
import fetch from "node-fetch";
import { getRefreshToken } from "./getRefreshToken";
import { handleUserInput } from "./inputHandler";

async function start(): Promise<void> {
  const options = {
    clientId: GetString("CLIENT_ID"),
    clientSecret: GetString("CLIENT_SECRET"),
    iapClientId: GetString("IAP_CLIENT_ID"),
  };
  const refreshToken = await getRefreshToken(
    opn,
    handleUserInput,
    fetch,
    options,
  );

  console.log(
    `Your refresh token is: "${refreshToken}" please save it to your .env file`,
  );
}

start();
