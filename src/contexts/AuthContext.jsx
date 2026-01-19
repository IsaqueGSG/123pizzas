import { createContext, useContext, useEffect, useState } from "react";
import {
    loginWithGoogle,
    logout,
    isUserAllowed,
} from "../services/auth.service";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";

import { useLoja } from "../contexts/LojaContext"

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const { idLoja } = useLoja();
    console.log(idLoja)

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openAdminDrawer, setOpenAdminDrawer] = useState(false);

    // persiste sessão
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const allowed = await isUserAllowed(idLoja, firebaseUser.email);

                if (!allowed) {
                    await logout();
                    setUser(null);
                } else {
                    setUser(firebaseUser);
                }
            } else {
                setUser(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, [idLoja]);

    const login = async (idLoja) => {
        const user = await loginWithGoogle();
        const allowed = await isUserAllowed(idLoja, user.email);

        if (!allowed) {
            await logout();
            alert("Acesso não autorizado");
            return;
        }

        setUser(user);
    };

    const signOut = async () => {
        await logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signOut, loading, openAdminDrawer, setOpenAdminDrawer }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
