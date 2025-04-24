// lib/auth.ts
import { cookies } from 'next/headers';

const TOKEN_COOKIE_NAME = 'api_token';
const TOKEN_EXPIRY_COOKIE_NAME = 'api_token_expiry';

export async function getToken(): Promise<string> {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
    const tokenExpiry = cookieStore.get(TOKEN_EXPIRY_COOKIE_NAME)?.value;


    // Check if we have a valid token
    if (token && tokenExpiry && new Date() < new Date(tokenExpiry)) {
        return token;
    }

    // Fetch new token
    const response = await fetch(process.env.COGNITO_ENDPOINT!, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-amz-json-1.1',
            'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
        },
        body: JSON.stringify({
            "AuthFlow": "USER_PASSWORD_AUTH",
            "ClientId": process.env.COGNITO_CLIENT_ID,
            "AuthParameters": {
                "USERNAME": process.env.COGNITO_USERNAME,
                "PASSWORD": process.env.COGNITO_PASSWORD,
                "SECRET_HASH": process.env.COGNITO_SECRET_HASH
            }
        }),
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
    }

    const data = await response.json();
    const newToken = data.AuthenticationResult.IdToken;

    // Set token in cookies (server-side)
    // In a production app, you would set secure and httpOnly flags
    const expiryTime = new Date(Date.now() + 55 * 60 * 1000); // 55 minutes

    // This is for Next.js Route Handlers
    cookieStore.set(TOKEN_COOKIE_NAME, newToken, {
        expires: expiryTime,
        path: '/',
        httpOnly: true
    });

    cookieStore.set(TOKEN_EXPIRY_COOKIE_NAME, expiryTime.toISOString(), {
        expires: expiryTime,
        path: '/',
        httpOnly: true
    });

    return newToken;
}