import { Outlet } from "react-router-dom";
import { Toolbar } from "@mui/material";

import Navbar from "../../components/Navbar";

export default function RootLayout() {
    return (
        <>
            <Navbar />
            <Toolbar />

            <Outlet />
        </>
    );
}
