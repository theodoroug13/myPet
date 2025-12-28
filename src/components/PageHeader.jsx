
import React from "react";
import { Box, Stack, Typography, Divider } from "@mui/material";

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>

        {actions ? <Box>{actions}</Box> : null}
      </Stack>

      <Divider sx={{ mt: 2 }} />
    </Box>
  );
}
