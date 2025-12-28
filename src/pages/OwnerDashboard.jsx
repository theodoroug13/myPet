import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Paper,
} from "@mui/material";

import PetsOutlinedIcon from "@mui/icons-material/PetsOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import OwnerMenu from "../components/OwnerMenu";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickActions = [
    {
      icon: <PetsOutlinedIcon />,
      title: "Τα Κατοικίδια μου",
      description: "Δες τα στοιχεία και το βιβλιάριο υγείας των κατοικιδίων σου.",
      actionLabel: "Άνοιγμα",
      action: () => navigate("/my-pets"),
    },
    {
      icon: <EventAvailableOutlinedIcon />,
      title: "Ραντεβού",
      description: "Προγραμμάτισε ή δες την κατάσταση των ραντεβού σου.",
      actionLabel: "Δες ραντεβού",
      action: () => navigate("/appointments"),
    },
    {
      icon: <ReportProblemOutlinedIcon />,
      title: "Δηλώσεις",
      description: "Δες τις δηλώσεις απώλειας που έχεις κάνει ή κάνε μια νέα.",
      actionLabel: "Διαχείριση",
      action: () => navigate("/lost-declarations"),
    },
    {
      icon: <SearchOutlinedIcon />,
      title: "Ο κτηνίατρός μου",
      description: "Βρες κτηνιάτρους κοντά σου και κλείσε ραντεβού.",
      actionLabel: "Αναζήτηση",
      action: () => navigate("/search-vets"),
    },
  ];

  return (
    <OwnerMenu
      title={`Dashboard${user?.username ? ` • ${user.username}` : ""}`}
      subtitle="Γρήγορες ενέργειες για διαχείριση κατοικιδίων, ραντεβού και δηλώσεων."
    >
      {/* Aesthetic hero card */}
      <Paper
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 4,
          mb: 3,
          color: "white",
          background:
            "linear-gradient(135deg, rgba(63,10,43,0.95), rgba(0,0,0,0.85))",
        }}
      >
        <Typography variant="h5" fontWeight={900}>
          Καλώς ήρθες{user?.username ? `, ${user.username}` : ""} 🐾
        </Typography>
        <Typography sx={{ mt: 0.5, opacity: 0.9, maxWidth: 720 }}>
          Επίλεξε μια ενέργεια παρακάτω ή χρησιμοποίησε το μενού δεξιά για να
          γυρνάς άμεσα στο dashboard από παντού.
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={() => navigate("/my-pets")}
            sx={{
              borderRadius: 999,
              bgcolor: "black",
              "&:hover": { bgcolor: "#222" },
            }}
          >
            Πήγαινε στα Κατοικίδιά μου
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/lost-pets")}
            sx={{
              borderRadius: 999,
              color: "white",
              borderColor: "rgba(255,255,255,0.6)",
              "&:hover": { borderColor: "white" },
            }}
          >
            Δες Χαμένα Κατοικίδια
          </Button>
        </Stack>
      </Paper>

      <Typography variant="h5" fontWeight={900} sx={{ mb: 2 }}>
        Γρήγορες Ενέργειες
      </Typography>

      <Grid container spacing={3}>
        {quickActions.map((item) => (
          <Grid key={item.title} item xs={12} sm={6}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 4,
                transition: "transform 0.18s ease, box-shadow 0.18s ease",
                "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  {/* Icon badge */}
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "16px",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "rgba(63,10,43,0.08)",
                    }}
                  >
                    {React.cloneElement(item.icon, {
                      sx: { fontSize: 30, color: "#3f0a2bff" },
                    })}
                  </Box>

                  <Box>
                    <Typography variant="h6" fontWeight={900}>
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {item.description}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    onClick={item.action}
                    sx={{ alignSelf: "flex-start", borderRadius: 999 }}
                  >
                    {item.actionLabel}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </OwnerMenu>
  );
};

export default OwnerDashboard;
