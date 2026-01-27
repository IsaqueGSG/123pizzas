import { createContext, useContext, useEffect, useState, useRef } from "react";
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

    const lojaRef = useRef(null);

    useEffect(() => {
        lojaRef.current = idLoja;
    }, [idLoja]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser || !lojaRef.current) {
                setUser(null);
                setLoading(false);
                return;
            }

            const allowed = await isUserAllowed(
                lojaRef.current,
                firebaseUser.email
            );

            if (!allowed) {
                await logout();
                setUser(null);
            } else {
                setUser(firebaseUser);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);



    const login = async () => {
        const firebaseUser = await loginWithGoogle();

        const allowed = await isUserAllowed(idLoja, firebaseUser.email);

        if (!allowed) {
            await logout();
            alert("Acesso não autorizado");
            return;
        }
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
