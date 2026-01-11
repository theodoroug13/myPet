import { Typography } from "@mui/material";
import OwnerLayout from "../components/OwnerLayout";
import EmptyState from "../components/EmptyState";

export default function MyVet() {
  return (
    <OwnerLayout>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        Ο Κτηνίατρός μου
      </Typography>
      <EmptyState title="Σύντομα" desc="Εδώ θα κάνεις αναζήτηση/επιλογή κτηνιάτρου." />
    </OwnerLayout>
  );
}
