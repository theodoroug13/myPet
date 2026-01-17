import { useMemo } from "react";
import { Breadcrumbs, Link, Typography, Box } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


const LABELS = {
  // Owner paths
  "owner-dashboard": "Κέντρο Ιδιοκτήτη",
  "owner-pets": "Τα κατοικίδιά μου",
  "owner-appointments": "Ραντεβού",
  "my-vet": "Ο Κτηνίατρός μου",
  "my-diloseis": "Δηλώσεις",
  "lost-pets": "Χαμένα Κατοικίδια",

  // Vet paths
  "vet-dashboard": "Ιατρείο",
  "vet": "Ιατρείο",
  "new-pet": "Νέο Κατοικίδιο",
  "drafts": "Πρόχειρες Καταχωρήσεις",
  "update-pets": "Ενημέρωση υφιστάμενου",
  "animal-services": "Υπηρεσίες Ζώου",
  "history": "Ιστορικό",
  "found": "Εύρεση",
  "medical-action": "Ιατρική Πράξη",
  "lost": "Απώλεια",
  "update-transfer": "Μεταβίβαση",
  "update-foster": "Αναδοχή",
  "adoption": "Υιοθεσία",
};


const isIdLike = (seg) =>
  /^[0-9]+$/.test(seg) || /^[a-f0-9-]{8,}$/i.test(seg) || /^[A-Z0-9]{10,}$/i.test(seg);


export default function AppBreadcrumbs({ sx }) {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const base = user?.role === "vet" ? "/vet-dashboard" : "/owner-dashboard";
  const baseLabel = user?.role === "vet" ? "Ιατρείο" : "Κέντρο Ιδιοκτήτη";

  const crumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);

    const items = [
      { label: baseLabel, to: base },
    ];

    segments.forEach((seg, i) => {
      // Skip the dashboard segments themselves
      if (seg === "vet-dashboard" || seg === "owner-dashboard" || seg === "vet") return;

      const to = "/" + segments.slice(0, i + 1).join("/");

      // If it's an ID, don't show it as a breadcrumb but keep it in the path
      if (isIdLike(seg)) {
        return; // Skip displaying but URL building continues
      }

      let label = LABELS[seg];
      if (!label) {
        label = decodeURIComponent(seg).replace(/-/g, " ");
      }

      items.push({ label, to });
    });

    return items;
  }, [pathname, base, baseLabel]);

  if (!user) return null;

  return (
    <Box sx={{ mb: 2, ...sx }}>
      <Breadcrumbs aria-label="breadcrumb">
        {crumbs.map((c, idx) => {
          const last = idx === crumbs.length - 1;
          return last ? (
            <Typography key={c.to} color="text.primary" fontWeight={700}>
              {c.label}
            </Typography>
          ) : (
            <Link
              key={c.to}
              component={RouterLink}
              underline="hover"
              color="inherit"
              to={c.to}
            >
              {c.label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}
