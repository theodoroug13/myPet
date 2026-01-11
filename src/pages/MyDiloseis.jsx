import { Typography } from "@mui/material";
import OwnerLayout from "../components/OwnerLayout";
import EmptyState from "../components/EmptyState";

export default function MyDiloseis() {
  return (
    <OwnerLayout>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        Δηλώσεις
      </Typography>
      <EmptyState title="Σύντομα" desc="Εδώ θα είναι οι δηλώσεις απώλειας/εύρεσης (draft/submitted)." />
    </OwnerLayout>
  );
}
