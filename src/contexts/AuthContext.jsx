import { createContext, useContext, useState } from "react";
import {
    loginWithGoogle,
    logout,
    isUserAllowed,
} from "../services/auth.service";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openAdminDrawer, setOpenAdminDrawer] = useState(false);

    const login = async () => {
        setLoading(true);

        const user = await loginWithGoogle();
        const allowed = await isUserAllowed(user.email);

        if (!allowed) {
            await logout();
            alert("Acesso não autorizado");
            setLoading(false);
            return;
        }

        setUser(user);
        setLoading(false);
    };

    const signOut = async () => {
        await logout();
        setUser(null);
        setOpenAdminDrawer(false); 
    };

    return (
        <AuthContext.Provider value={{ user, login, signOut, loading, openAdminDrawer, setOpenAdminDrawer }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
