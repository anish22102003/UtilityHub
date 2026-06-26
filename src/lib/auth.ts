import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "anishkumarbiswas2003@gmail.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        const defaultAdminEmail = process.env.ADMIN_EMAIL || "anishkumarbiswas2003@gmail.com";
        const defaultAdminPassword = process.env.ADMIN_PASSWORD || "admin123";

        // Admin login fallback
        if (credentials.email === defaultAdminEmail && credentials.password === defaultAdminPassword) {
          let user = await prisma.user.findUnique({
            where: { email: credentials.email }
          }).catch(() => null);

          if (!user) {
            user = await prisma.user.create({
              data: {
                email: credentials.email,
                name: "Administrator",
                role: "ADMIN"
              }
            }).catch(() => null);
          }

          return {
            id: user?.id || "admin-id",
            name: user?.name || "Administrator",
            email: user?.email || defaultAdminEmail,
            role: user?.role || "ADMIN"
          };
        }

        // Generic DB check
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        }).catch(() => null);

        if (user && user.password && user.password === credentials.password) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          };
        }

        return null;
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "supersecretfortoolmitra"
};
