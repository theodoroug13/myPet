
import React from "react";
import { Paper, Stack, Typography, Button } from "@mui/material";

export default function EmptyState({
  icon,
  title = "Δεν βρέθηκαν δεδομένα",
  description,
  actionLabel,
  onAction,
}) {
  return (
    <Paper variant="outlined" sx={{ p: 4 }}>
      <Stack spacing={1.5} alignItems="center" textAlign="center">
        {icon ?<span style={{ fontSize: 44, lineHeight: 1 }}>{icon}</span> : null}

        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>

        {description ? (<Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520 }}>{description}</Typography>) : null}

        {actionLabel && onAction ? (
          <Button variant="contained" onClick={onAction} sx={{ mt: 1 }}>
            {actionLabel}
          </Button>
        ) : null}
      </Stack>
    </Paper>
  );
}
