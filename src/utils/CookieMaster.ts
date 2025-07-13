type CookieConfig = {
    expires?: Date;
    sameSite?: 'strict' | 'lax' | 'none';
    secure?: boolean;
    maxAge: number;
    httpOnly?: boolean;
    path?: string;
}

export default class CookieMaster {
    static getAll() {
        return document.cookie.split(';').map(cookie => {
           const [name, value] = cookie.split('=');
           return {[name]: value}
        });
    }
    static get(name: string) {
        const cookies = document.cookie.split(';');
        const cookie = cookies.find(c => c.startsWith(`${name}=`));
        if (!cookie) return undefined;
        return cookie.split('=')[1];
    }
    static set(name: string, value: string, config?: CookieConfig) {
        let cookie = `${name}=${value};`;
        if (config?.expires) cookie += `expires=${config?.expires.toUTCString()};`;
        if (config?.sameSite) cookie += `SameSite=${config?.sameSite};`;
        if (config?.secure) cookie += `Secure;`;
        if (config?.maxAge) cookie += `Max-Age=${config?.maxAge};`;
        if (config?.httpOnly) cookie += `HttpOnly;`;
        if (config?.path) {
            if (!name.startsWith('__Host-')) cookie += `Path=${config?.path};`;
            else cookie += `Path=/; Secure;`;
        }
        document.cookie = cookie;
    }
    static delete(name: string) {
        const cookies = document.cookie.split(';');
        const cookie = cookies.find(c => c.startsWith(`${name}=`));
        if (cookie) {
            document.cookie += `${name}=;expires=${new Date(0).toUTCString()};Max-Age=0;`;
        }
    }

    static clear() {
        document.cookie.split(';').forEach(cookie => {
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
            document.cookie = name + '=;expires=' + new Date(0).toUTCString();
        });
    }
}