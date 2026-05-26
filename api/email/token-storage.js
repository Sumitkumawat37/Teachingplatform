// Shared token storage for email verification
const verificationTokens = new Map();

export function setToken(token, email) {
  verificationTokens.set(token, {
    email,
    expiresAt: Date.now() + 1000 * 60 * 60, // 1 hour
  });
}

export function getToken(token) {
  return verificationTokens.get(token);
}

export function deleteToken(token) {
  verificationTokens.delete(token);
}

export function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, data] of verificationTokens.entries()) {
    if (data.expiresAt < now) {
      verificationTokens.delete(token);
    }
  }
}

// Cleanup expired tokens every 5 minutes
setInterval(cleanupExpiredTokens, 5 * 60 * 1000);
