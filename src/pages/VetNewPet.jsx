import React, { useState } from 'react';
import { Box, Typography, TextField, Button, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VetLayout from '../components/VetLayout'; // adjust path

const VetNewPet = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', microchip: '', breed: '', birthdate: '', weight: '',
    ownerName: '', ownerAddress: '', ownerEmail: '', ownerPhone: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: POST to http://localhost:3000/pets
    console.log('New pet:', formData);
    navigate(-1); // back to VetPets
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
                min:0,
                step:0.1,
                max:500
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
