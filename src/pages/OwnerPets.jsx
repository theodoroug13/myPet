import { Typography } from "@mui/material";
import OwnerLayout from "../components/OwnerLayout";
import EmptyState from "../components/EmptyState";

export default function OwnerPets() {
  return (
    <OwnerLayout>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        Τα Κατοικίδιά μου
      </Typography>
      <EmptyState title="Σύντομα" desc="Εδώ θα εμφανίζεται η λίστα κατοικιδίων σου." />
    </OwnerLayout>
  );
}
