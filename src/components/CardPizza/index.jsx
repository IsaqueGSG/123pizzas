import { useState } from "react";
import { useCarrinho } from "../../contexts/CarrinhoContext";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";

import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// variações no front
const tamanhosPizza = [
  { id: "broto", nome: "Broto", fator: 0.75 },
  { id: "grande", nome: "Grande", fator: 1 }
];

export default function CardPizza({ pizza }) {
  const { addItem } = useCarrinho();

  const [open, setOpen] = useState(false);
  const [tamanho, setTamanho] = useState("grande");

  const tamanhoSelecionado =
    tamanhosPizza.find(t => t.id === tamanho) || tamanhosPizza[0];

  const precoFinal = pizza.valor * tamanhoSelecionado.fator;

  const adicionarAoCarrinho = () => {
    addItem({
      id: `${pizza.id}-${tamanho}`,
      nome: `${pizza.nome} (${tamanhoSelecionado.nome})`,
      preco: precoFinal,
      img: pizza.img
    });
  };

  return (
    <Card
      sx={{
        display: "flex",
        alignItems: "center",
        p: 1.5,
        mb: 1,
        borderRadius: 2
      }}
    >
      {/* IMAGEM */}
      <Avatar
        src={"https://images8.alphacoders.com/369/369063.jpg"} // substituir depois
        variant="rounded"
        sx={{ width: 56, height: 56, mr: 1.5 }}
      />

      {/* INFO */}
      <Box sx={{ flexGrow: 1 }}>
        <Typography fontWeight="bold" fontSize={14}>
          {pizza.nome}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          R$ {precoFinal.toFixed(2)}
        </Typography>

        {/* VARIAÇÕES */}
        {pizza.tipo === "pizza" && (
          <>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                mt: 0.5
              }}
              onClick={() => setOpen(!open)}
            >
              <Typography variant="caption">
                Tamanho: {tamanhoSelecionado.nome}
              </Typography>
              <ExpandMoreIcon
                sx={{
                  fontSize: 16,
                  transform: open ? "rotate(180deg)" : "rotate(0deg)"
                }}
              />
            </Box>

            <Collapse in={open}>
              <Divider sx={{ my: 0.5 }} />

              <RadioGroup
                row
                value={tamanho}
                onChange={(e) => setTamanho(e.target.value)}
              >
                {tamanhosPizza.map((t) => (
                  <FormControlLabel
                    key={t.id}
                    value={t.id}
                    control={<Radio size="small" />}
                    label={
                      <Typography variant="caption">
                        {t.nome}
                      </Typography>
                    }
                  />
                ))}
              </RadioGroup>
            </Collapse>
          </>
        )}
      </Box>

      {/* AÇÃO */}
      <IconButton color="primary" onClick={adicionarAoCarrinho}>
        <AddIcon />
      </IconButton>
    </Card>
  );
}
