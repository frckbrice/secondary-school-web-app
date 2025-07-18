declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      fullName?: string;
      email?: string;
      teacherSubject?: string;
    };
  }

  interface User {
    id: string;
    username: string;
    role: string;
    fullName?: string;
    email?: string;
    teacherSubject?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    username: string;
    fullName?: string;
    teacherSubject?: string;
  }
}
