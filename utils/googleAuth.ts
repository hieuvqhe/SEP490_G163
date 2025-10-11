export const generateGoogleOAuthURL = () => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/google/callback`);
  const scope = encodeURIComponent('openid email profile');
  const responseType = 'code';
  const state = Math.random().toString(36).substring(7); // Simple state for CSRF protection

  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not defined in environment variables');
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=${responseType}&state=${state}&access_type=offline&prompt=consent`;
};