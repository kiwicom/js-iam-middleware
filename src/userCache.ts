// https://gitlab.skypicker.com/platform/security/iam/blob/master/swagger.yml#L35
export interface User {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  email: string;
  location: string;
  isVendor: boolean;
  teamMembership: string[];
  orgStructure: string;
  manager: string;
  permissions: string[];
}

interface Cache {
  [email: string]: {
    expiration: number;
    user: User;
  };
}

class UserCache {
  cache: Cache = {};

  set(user: User, lifespan: number): void {
    this.cache[user.email] = {
      expiration: Date.now() + lifespan * 1000,
      user,
    };
  }

  get(email: string): User | null {
    const entry = this.cache[email];
    if (!entry) {
      return null;
    }

    if (entry.expiration <= Date.now()) {
      this.del(email);
      return null;
    }

    return entry.user;
  }

  del(email: string): void {
    delete this.cache[email];
  }
}

export const userCache = new UserCache();
