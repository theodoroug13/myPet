import { useMemo } from "react";
import { Breadcrumbs, Link, Typography, Box } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LABELS = {
  "owner-dashboard": "Κέντρο Ιδιοκτήτη",
  "owner-pets": "Τα κατοικίδιά μου",
  "owner-appointments": "Ραντεβού",
  "my-vet": "Ο Κτηνίατρός μου",
  "my-diloseis": "Δηλώσεις",
  "lost-pets": "Χαμένα Κατοικίδια",

  "vet-dashboard": "Ιατρείο",
};

const isIdLike = (seg) =>
  /^[0-9]+$/.test(seg) || /^[a-f0-9-]{8,}$/i.test(seg) || seg.length > 12;

export default function AppBreadcrumbs({ sx }) {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const base = user?.role === "vet" ? "/vet-dashboard" : "/owner-dashboard";
  const baseLabel = user?.role === "vet" ? "Ιατρείο" : "Κέντρο Ιδιοκτήτη";

  const crumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);

    // Αν είμαστε ήδη στο /owner-dashboard ή /vet-dashboard, μην βάλεις extra crumbs
    const baseSeg = base.replace("/", "");
    const filtered = segments[0] === baseSeg ? segments.slice(1) : segments;

    const items = [
      { label: baseLabel, to: base }, // ΠΡΩΤΟ crumb = dashboard (ΟΧΙ "/")
    ];

    filtered.forEach((seg, i) => {
      const to = "/" + filtered.slice(0, i + 1).join("/");
      const prev = filtered[i - 1];

      let label = LABELS[seg];
      if (!label) {
        if (isIdLike(seg)) {
          // πιο ωραίο label για ids
          if (prev === "owner-pets") label = "Κατοικίδιο";
          else if (prev === "owner-appointments") label = "Ραντεβού";
          else label = "Λεπτομέρειες";
        } else {
          label = decodeURIComponent(seg).replace(/-/g, " ");
        }
      }

      items.push({ label, to });
    });

    return items;
  }, [pathname, base, baseLabel]);

  if (!user) return null; // breadcrumbs μόνο όταν υπάρχει logged in user στα layouts

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
