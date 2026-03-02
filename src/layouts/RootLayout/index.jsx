import { Outlet } from "react-router-dom";
import { Toolbar } from "@mui/material";

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";
import CarrinhoDrawer from "../../components/CarrinhoDrawer";

export default function RootLayout() {
    return (
        <>
            <Navbar />
            <Toolbar />
            <AdminDrawer />
            <CarrinhoDrawer />

            <Outlet />
        </>
    );
}
