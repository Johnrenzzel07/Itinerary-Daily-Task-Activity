import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const employee = await prisma.employee.findUnique({
          where: { email: parsed.data.email },
        });

        if (!employee) return null;

        const valid = await bcrypt.compare(
          parsed.data.password,
          employee.password
        );
        if (!valid) return null;

        return {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          image: employee.avatar,
          position: employee.position,
        };
      },
    }),
  ],
});
