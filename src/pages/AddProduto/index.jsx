import { useState } from "react";
import {
    Box,
    Toolbar,
    Tabs,
    Tab
} from "@mui/material";

import Navbar from "../../components/Navbar";
import AdminDrawer from "../../components/AdminDrawer";

import AddSabor from "../../components/AddSabor";
import AddBebida from "../../components/AddBebida";
import AddExtra from "../../components/AddExtra";
import AddBorda from "../../components/AddBorda";

export default function AddProduto() {
    const [aba, setAba] = useState(0);

    return (
        <Box sx={{ p: 2 }}>
            <Navbar />
            <Toolbar />
            <AdminDrawer />

            <Tabs
                value={aba}
                onChange={(_, v) => setAba(v)}
                variant="fullWidth"
            >
                <Tab label="Adicionar Sabor(pizza, broto, esfirra)" />
                <Tab label="Adicionar Bebida" />
                <Tab label="Adicionar Extras" />
                <Tab label="Adicionar Bordas" />
            </Tabs>

            {aba === 0 && <AddSabor />}
            {aba === 1 && <AddBebida />}
            {aba === 2 && <AddExtra />}
            {aba === 3 && <AddBorda />}

        </Box>
    );
}
