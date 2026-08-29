import { createRemoteJWKSet, jwtVerify } from 'jose';

// Initialize the Remote JWK Set (keys are cached)
const JWKS = createRemoteJWKSet(
    new URL(`https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`)
);

export async function verifyM2MToken(request: Request) {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Missing or malformed Authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
        const { payload, protectedHeader } = await jwtVerify(token, JWKS, {
            issuer: `https://${process.env.AUTH0_DOMAIN}/`,
            algorithms: ['RS256'],
        });

        // Optional: Check for specific scopes if passed
        // if (requiredScope && !payload.scope?.includes(requiredScope)) ...

        return payload;
    } catch (error) {
        console.error('M2M Token Verification Failed:', error);
        throw new Error('Invalid token');
    }
}
