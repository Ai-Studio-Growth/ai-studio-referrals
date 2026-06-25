/**
 * Auth adapter interface. The demo runs in a passwordless "demo session" mode
 * (see lib/session.ts) so the full flow is explorable without standing up an
 * IdP. Real deployments select a provider via AUTH_PROVIDER and implement
 * `authenticate` against email/password, magic link, OAuth, or SAML SSO.
 */
export type AuthProvider = 'credentials' | 'magic-link' | 'google' | 'apple' | 'github' | 'saml';

export interface AuthAdapter {
  readonly provider: AuthProvider;
  // Returns a stable external identity for the authenticated principal.
  authenticate(req: Request): Promise<{ email: string; name?: string } | null>;
}

export function configuredAuthProvider(): AuthProvider {
  return (process.env.AUTH_PROVIDER as AuthProvider) ?? 'credentials';
}

// Placeholder factory — wire NextAuth / Lucia / WorkOS here per provider.
export function getAuthAdapter(): AuthAdapter {
  const provider = configuredAuthProvider();
  return {
    provider,
    async authenticate() {
      return null;
    },
  };
}
