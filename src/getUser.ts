import fetch from "node-fetch";
import { User, userCache } from "./userCache";

export async function getUser(
  serviceUA: string,
  email: string,
  iamURL: string,
  iamToken: string,
  fetcher: Function = fetch,
): Promise<User> {
  const cachedUser = userCache.get(email);
  if (cachedUser) {
    return cachedUser;
  }

  const cleanURL = iamURL.replace(/\/$/, "");
  const url = `${cleanURL}/v1/user?permissions=true&email=${email}`;
  const response = await fetcher(url, {
    headers: {
      Authorization: iamToken,
      "User-Agent": serviceUA,
    },
  });
  const user = await response.json();

  userCache.set(user, 10 * 60);
  return user;
}
