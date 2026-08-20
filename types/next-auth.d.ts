import 'next-auth';
import 'next-auth/jwt';

/**
 * The credentials provider puts `id` and `role` on the token/session; without
 * these augmentations TypeScript only knows about name/email/image.
 */
declare module 'next-auth' {
  interface Session {
    user?: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}
