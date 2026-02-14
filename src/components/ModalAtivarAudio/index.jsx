import { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Button
} from "@mui/material";

const [open, setOpen] = useState(false);
// console.log("modal ativa som")

useEffect(() => {
    const unlocked = sessionStorage.getItem("audioUnlocked");

    if (!unlocked) {
        setOpen(true);
    }
}, []);

const handleUnlock = () => {
    unlockAudio();
    sessionStorage.setItem("audioUnlocked", "true");
    setOpen(false);
};

export default function ModalAtivarAudio() {
    const [open, setOpen] = useState(false);
    // console.log("modal ativa som")

    useEffect(() => {
        const unlocked = sessionStorage.getItem("audioUnlocked");

        if (!unlocked) {
            setOpen(true);
        }
    }, []);

    const handleUnlock = () => {
        unlockAudio();
        sessionStorage.setItem("audioUnlocked", "true");
        setOpen(false);
    };

    return (
        <Dialog open={open}>
            <DialogTitle>🔊 Ativar som ao chegar novos pedidos</DialogTitle>
            <DialogContent>
                <Button fullWidth variant="contained" onClick={handleUnlock}>
                    Ativar som
                </Button>
            </DialogContent>
        </Dialog>
    );
}
