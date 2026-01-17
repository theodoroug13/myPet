import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


const actionButtonSx = {
  bgcolor: "black",
  color: "white",
  px: 4,
  py: 3,
  fontSize: "1.1rem",
  fontWeight: 600,
  borderRadius: 2,
  height: 60,
  width: 400,
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
  
  textTransform: 'none',
  "&:hover": {
    bgcolor: "black",
    transform: "translateY(-4px)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
  },
};


const AnimalServices = () => {
  const { microchip } = useParams();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState(null);


  useEffect(() => {
    const fetchAnimal = async () => {
      const mockData = { name: 'Φιλίπ', type: 'Γάτα' }; 
      setAnimal(mockData);
    };
    fetchAnimal();
  }, [microchip]);


  if (!animal) return <Typography>Φόρτωση...</Typography>;


  const services = [
    { label: 'Προβολή Ιστορικού', action: () => navigate(`/vet/animal-services/history/${microchip}`) },
    { label: 'Εύρεση', action: () => navigate(`/vet/animal-services/found/${microchip}`) },
    { label: 'Νέα Ιατρική πράξη', action: () => navigate(`/vet/animal-services/medical-action/${microchip}`) },
    { label: 'Δήλωση απώλειας', action: () => navigate(`/vet/animal-services/lost/${microchip}`) },
    { label: 'Μεταβίβαση', action: () => navigate(`/vet/animal-services/update-transfer/${microchip}`) },
    { label: 'Αναδοχή', action: () => navigate(`/vet/animal-services/update-foster/${microchip}`) },
    { label: 'Υιοθεσία', action: () => navigate(`/vet/animal-services/adoption/${microchip}`) },
    { label: 'Πρόχειρες ενημερώσεις', action: () => navigate(`/vet/animal-services/drafts/${microchip}`) }
  ];


  return (
    <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{
          mb: 3,
          color: 'black',
          fontWeight: 600,
          '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        
      </Button>

      <Typography 
        variant="h5" 
        sx={{ 
          textAlign: 'center',
          mb: 5,
          fontWeight: 'bold'
        }}
      >
        Επιλογές υπηρεσιών του ζώου:
      </Typography>


      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Grid container spacing={3} sx={{ maxWidth: 850, width: '100%' }}>
          {services.map((service, i) => (
            <Grid item xs={6} key={i}>
              <Button fullWidth sx={actionButtonSx} onClick={service.action}>
                {service.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>


    </Box>
  );
};


export default AnimalServices;
