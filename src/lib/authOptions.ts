import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { db } from '../lib/db';
import { users } from '../schema';
import { eq } from 'drizzle-orm';
import { AuthOptions } from 'next-auth';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const user = await db.query.users.findFirst({
            where: eq(users.username, credentials.username),
          });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id.toString(),
            username: user.username,
            role: user.role,
            fullName: user.fullName ?? undefined,
            email: user.email ?? undefined,
            teacherSubject: user.teacherSubject ?? undefined,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        if ('role' in user) token.role = user.role;
        if ('username' in user) token.username = user.username;
        if ('fullName' in user) token.fullName = user.fullName;
        if ('teacherSubject' in user)
          token.teacherSubject = user.teacherSubject;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const user = session.user as any;
        user.id = token.sub!;
        user.role = token.role as string;
        user.username = token.username as string;
        user.fullName = token.fullName as string;
        user.teacherSubject = token.teacherSubject as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
