import { LoginForm } from './LoginForm';

/*
 * next-auth/react resolves NEXTAUTH_URL at module scope, so statically
 * prerendering this page evaluates it at build time, and an empty or missing
 * value throws `Invalid URL`, failing the whole deploy. An auth screen has no
 * business being prerendered anyway; rendering it on demand keeps a
 * misconfigured environment a runtime problem rather than a build one.
 */
export const dynamic = 'force-dynamic';

export default function Page() {
  return <LoginForm />;
}
