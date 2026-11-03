import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';
import { socket } from '../socket';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);       // utente loggato (null = nessuno)
    const [loading, setLoading] = useState(true); // true finché non sappiamo se c'è una sessione
    const [favs, setFavs] = useState([]);

    // All'apertura del sito: chiedo al server se il cookie è valido
    useEffect(() => {
        api.get('/accounts/me')
            .then(res => {
                setFavs(res.data.favs);
                setUser(res.data.user);   // { id, nickname, account_type, lobby_code, admin_id , admission_status }
                socket.connect();
            })
            .catch(() => {
                // 401: nessuna sessione, user resta null
            })
            .finally(() => setLoading(false));
    }, []);

    // Da chiamare dopo registrazione, login o guest
    const login = (userData) => {
        if (userData.user.account_type === 'registration') {
            setUser(userData.user);
            setFavs(userData.favs);
        } else {
            setUser(userData);
            setFavs([]);
        }
        socket.connect();
    };

    const logout = async () => {
        try {
            await api.post('/accounts/logout');
        } catch (err) {
            console.error('Logout fallito:', err.response?.status, err.response?.data);
        } finally {
            socket.disconnect();
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, setUser, favs, setFavs }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);