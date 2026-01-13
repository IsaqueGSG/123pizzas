import { Box, Typography, Chip } from "@mui/material";

const STATUS_FLOW = [
  { key: "pendente", label: "Pendente" },
  { key: "aceito", label: "Em preparo" },
  { key: "pronto", label: "Pronto" },
  { key: "entrega", label: "Entrega" }
];

export default function PedidosTimelineFilter({
  value,
  onChange
}) {
  return (
    <Box sx={{ mb: 3 }}>
      {/* LINHA DO TEMPO */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1
        }}
      >
        {STATUS_FLOW.map((status, index) => {
          const isActive = value === status.key;

          return (
            <Box
              key={status.key}
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer"
              }}
              onClick={() => onChange(status.key)}
            >
              {/* Bolinha */}
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  backgroundColor: isActive
                    ? "primary.main"
                    : "grey.400"
                }}
              />

              {/* Linha */}
              {index < STATUS_FLOW.length - 1 && (
                <Box
                  sx={{
                    width: 40,
                    height: 2,
                    backgroundColor: "grey.300"
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>

      {/* LABELS */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 1
        }}
      >
        {STATUS_FLOW.map((status) => (
          <Typography
            key={status.key}
            variant="caption"
            sx={{
              cursor: "pointer",
              color:
                value === status.key
                  ? "primary.main"
                  : "text.secondary"
            }}
            onClick={() => onChange(status.key)}
          >
            {status.label}
          </Typography>
        ))}
      </Box>

      {/* CANCELADO */}
      <Box sx={{ mt: 2 }}>
        <Chip
          label="Cancelados"
          color={value === "cancelado" ? "error" : "default"}
          onClick={() => onChange("cancelado")}
          clickable
        />
      </Box>
    </Box>
  );
}
