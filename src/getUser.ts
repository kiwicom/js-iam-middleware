import fetch from "node-fetch";
import { User, userCache } from "./userCache";

export async function getUser(
  serviceUA: string,
  servicePermissionsIdentifier: string,
  email: string,
  iamURL: string,
  iamToken: string,
  fetcher: Function = fetch,
): Promise<User> {
  if (!servicePermissionsIdentifier) {
    servicePermissionsIdentifier = serviceUA.split("/")[0]; // Kiwi RFC 22
  }

  servicePermissionsIdentifier = servicePermissionsIdentifier.toLowerCase();

  const cachedUser = userCache.get(`${email}:${servicePermissionsIdentifier}`);
  if (cachedUser) {
    return cachedUser;
  }

  const cleanURL = iamURL.replace(/\/$/, "");
  const url = `${cleanURL}/v1/user?service=${servicePermissionsIdentifier}&email=${email}`;
  const response = await fetcher(url, {
    headers: {
      Authorization: iamToken,
      "User-Agent": serviceUA,
    },
  });
  const user = await response.json();

  userCache.set(user, servicePermissionsIdentifier, 10 * 60);
  return user;
}
