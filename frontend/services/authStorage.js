const isBrowser = () => typeof window !== 'undefined';

export const getStoredUser = () => {
    if (!isBrowser()) return null;

    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) return null;

    try {
        return JSON.parse(storedUser);
    } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('currentUser');
        return null;
    }
};

export const setStoredUser = (userData) => {
    if (!isBrowser()) return;
    localStorage.setItem('currentUser', JSON.stringify(userData));
};

export const clearStoredUser = () => {
    if (!isBrowser()) return;
    localStorage.removeItem('currentUser');
};

export const clearAdminSessionCookie = () => {
    if (!isBrowser()) return;
    document.cookie = 'admin-session=; path=/; max-age=0';
};