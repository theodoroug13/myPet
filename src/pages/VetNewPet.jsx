import React, { useState } from 'react';
import { useEffect } from "react";
import { MenuItem, CircularProgress } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { Box, Typography, TextField, Button, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VetLayout from '../components/VetLayout';


const VetNewPet = () => {
  const { user } = useAuth();

  const [owners, setOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(true);

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    microchip: "",
    type: "Dog",
    breed: "",
    birthdate: "",
    weight: "",
    ownerId: "",
  });


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const loadOwners = async () => {
      try {
        const res = await fetch("http://localhost:8000/users");
        const data = await res.json();
        const onlyOwners = Array.isArray(data)
          ? data.filter((u) => u.role === "owner")
          : [];

        setOwners(onlyOwners);

        // auto-select 1st owner
        if (onlyOwners.length > 0) {
          setFormData((prev) => ({ ...prev, ownerId: String(onlyOwners[0].id) }));
        }
      } catch (e) {
        console.error(e);
      }
      setLoadingOwners(false);
    };

    loadOwners();
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || user.role !== "vet") {
      alert("Πρέπει να είσαι κτηνίατρος για να καταχωρήσεις κατοικίδιο.");
      return;
    }

    try {
      const payload = {
        id: `p${Date.now()}`,
        ownerId: String(formData.ownerId),
        name: formData.name,
        type: formData.type,
        microchip: formData.microchip,
        status: "approved",
        birthDate: formData.birthdate,
        breed: formData.breed,
        weight: formData.weight,

        // ✅ αυτά είναι το ζητούμενο
        registeredVetId: String(user.id),
        linkedVetIds: [String(user.id)],
      };

      const res = await fetch("http://localhost:8000/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create pet");

      navigate(-1); // back to VetPets
    } catch (err) {
      console.error(err);
      alert("Αποτυχία καταχώρησης. Δοκίμασε ξανά.");
    }
  };


  return (
    <VetLayout>
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
          Καταχώρηση νέου κατοικιδίου
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          {loadingOwners ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={22} />
            </Box>
          ) : (
            <TextField
              select
              label="Κηδεμόνας (Owner account)"
              name="ownerId"
              value={formData.ownerId}
              onChange={handleChange}
              required
              fullWidth
            >
              {owners.map((o) => (
                <MenuItem key={o.id} value={String(o.id)}>
                  {o.fullName} ({o.username})
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            select
            label="Τύπος"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            fullWidth
          >
            <MenuItem value="Dog">Dog</MenuItem>
            <MenuItem value="Cat">Cat</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>

          <TextField
            label="Όνομα Κατοικιδίου"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            fullWidth
          />

          <TextField
            label="Αριθμός Microchip"
            name="microchip"
            value={formData.microchip}
            onChange={handleChange}
            required
            fullWidth
          />

          <TextField
            label="Φυλή"
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            required
            fullWidth
          />

          <TextField
            label="Ημερομηνία Γέννησης"
            name="birthdate"
            type="date"
            value={formData.birthdate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
            fullWidth
          />

          <TextField
            label="Βάρος (kg)"
            name="weight"
            type="number"
            value={formData.weight}
            onChange={handleChange}
            inputProps={{
              min: 0,
              step: 0.1,
              max: 500
            }}
            required
            fullWidth
          />

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Στοιχεία Κηδεμόνα
          </Typography>

          <TextField
            label="Όνομα Κηδεμόνα"
            name="ownerName"
            value={formData.ownerName}
            onChange={handleChange}
            required
            fullWidth
          />

          <TextField
            label="Διεύθυνση"
            name="ownerAddress"
            value={formData.ownerAddress}
            onChange={handleChange}
            required
            fullWidth
          />

          <TextField
            label="Email"
            name="ownerEmail"
            type="email"
            value={formData.ownerEmail}
            onChange={handleChange}
            required
            fullWidth
          />

          <TextField
            label="Τηλέφωνο"
            name="ownerPhone"
            value={formData.ownerPhone}
            onChange={handleChange}
            required
            fullWidth
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{ flex: 1, borderRadius: 0 }}
            >
              Ακύρωση
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                flex: 1, bgcolor: 'black', color: 'white', borderRadius: 0,
                '&:hover': { bgcolor: 'black', transform: 'translateY(-2px)' }
              }}
            >
              Καταχώρηση
            </Button>
          </Box>
        </Box>
      </Box>
    </VetLayout>
  );
};

export default VetNewPet;
