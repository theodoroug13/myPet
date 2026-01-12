import { Box, Typography, Button, IconButton } from "@mui/material";
import backpic from "../../pictures/autumndog.jpg";
import VetLayout from "../components/VetLayout";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const actionButtonSx = {
  bgcolor: "black",
  color: "white",
  py: 1.8,
  fontSize: "1rem",
  borderRadius: 0,
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  "&:hover": {
    bgcolor: "black",
    transform: "translateY(-4px)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
  },
};

const VetPets = () => {
  const navigate = useNavigate();

  const handleNewPet = () => navigate("/vet/new-pet");

  // προσωρινά (μέχρι να τα υλοποιήσεις)
  const handleDrafts = () => navigate("/vet/drafts");
  const handleUpdatePet = () => navigate("/vet/update-pets");

  return (
    <VetLayout>
      <Box
        sx={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${backpic})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          height: "92vh",
          display: "flex",
          alignItems: "center",
          color: "white",
          px: { xs: 3, md: 8 },
        }}
      >
        <Box sx={{ maxWidth: 900 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                backdropFilter: "blur(10px)",
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: "bold", lineHeight: 1.4 }}>
            Επιλέξτε ενέργεια για να συνεχίσετε. Προχωρήστε σε καταγραφή νέου ζώου ή
            αναζητήστε και ενημερώστε υφιστάμενο φάκελο για την καταχώρηση ιατρικών
            πράξεων, εμβολιασμών και δηλώσεις αλλαγών (μεταβίβαση, απώλεια κ.α.).
          </Typography>

          <Box
            sx={{
              mt: 6,
              display: "flex",
              flexDirection: "column",
              gap: 3,
              maxWidth: 400,
            }}
          >
            <Button variant="contained" onClick={handleNewPet} sx={actionButtonSx}>
              Καταχώρηση νέου κατοικιδίου
            </Button>

            <Button variant="contained" onClick={handleDrafts} sx={actionButtonSx}>
              Πρόχειρες καταχωρήσεις
            </Button>

            <Button variant="contained" onClick={handleUpdatePet} sx={actionButtonSx}>
              Ενημέρωση υφιστάμενου
            </Button>
          </Box>
        </Box>
      </Box>
    </VetLayout>
  );
};

export default VetPets;
