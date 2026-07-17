import type { NextAuthConfig } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      position?: string;
    };
  }

  interface User {
    position?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    position?: string;
  }
}

export type { NextAuthConfig };
