import { writable } from 'svelte/store';
import { browser } from '$app/environment';


const storedUser = browser && localStorage.getItem('user');
const initialUser = storedUser ? JSON.parse(storedUser) : null;

export const user = writable(initialUser);


if (browser) {
    user.subscribe((value) => {
        if (value) {
            localStorage.setItem('user', JSON.stringify(value));
        } else {
            localStorage.removeItem('user');
        }
    });
}

export const login = async (email, password) => {
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
    }

    const data = await response.json();
    user.set(data.user);
    return data.user;
};

export const signup = async (name, email, password) => {
    const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Signup failed');
    }

    const data = await response.json();
    user.set(data.user);
    return data.user;
};

export const logout = () => {
    user.set(null);
};
