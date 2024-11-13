import { verifyJWT } from '$lib/jwt';

export async function load({ cookies }) {
    const token = cookies.get('authToken');
    
    if (!token) {
        return {
            user: null
        };
    }

    const userData = verifyJWT(token);
    
    if (!userData) {
      
        cookies.delete('authToken', { path: '/' });
        return {
            user: null
        };
    }

    return {
        user: {
            id: userData.id,
            email: userData.email,
            name: userData.name
        }
    };
}
