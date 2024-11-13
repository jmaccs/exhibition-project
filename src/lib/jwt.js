import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || import.meta.env.VITE_JWT_SECRET;

if (!JWT_SECRET) {
    console.error('JWT_SECRET is not set in environment variables');
    throw new Error('Authentication configuration error');
}

const TOKEN_EXPIRY = '30d'; 

export function createJWT(payload) {
    try {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    } catch (error) {
        console.error('JWT creation failed:', error.message);
        throw new Error('Failed to create authentication token');
    }
}

export function verifyJWT(token) {
    if (!token) {
        return null;
    }

    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error('JWT verification failed:', error.message);
        return null;
    }
}

export function decodeJWT(token) {
    if (!token) {
        return null;
    }

    try {
        return jwt.decode(token);
    } catch (error) {
        console.error('JWT decode failed:', error.message);
        return null;
    }
}
