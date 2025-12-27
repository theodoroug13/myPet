import { Box, Typography, Button, Container, Grid, Card, CardContent, CardMedia } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useState, useEffect, useRef } from 'react';

const heroImage = '../pictures/home-hero.jpg';

const Home = () => {
  const navigate = useNavigate();
  const [recentLostPets, setRecentLostPets] = useState([]);
  const lostPetsRef = useRef(null);
  useEffect(() => {
    const fetchLostPets = async () => {
      try {
        const response = await fetch('http://localhost:8000/lostPets');
        const data = await response.json();
        setRecentLostPets(data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching lost pets:', error);
      }
    };
    fetchLostPets();
  }, []);
  const scrollToLostPets = () => {
    lostPetsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: <PetsOutlinedIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: "Για Ιδιοκτήτες",
      description: "Δημιούργησε προφίλ για το κατοικίδιό σου, κράτα ιστορικό υγείας και κλείσε ραντεβού με τον κτηνίατρό σου εύκολα.",
      action: () => navigate('/login')
    },
    {
      icon: <MedicalServicesOutlinedIcon sx={{ fontSize: 40, color: '#2e7d32' }} />,
      title: "Για Κτηνιάτρους",
      description: "Οργάνωσε το ιατρείο σου. Δες τα ραντεβού της ημέρας και απέκτησε πρόσβαση στον ιατρικό φάκελο των ασθενών σου.",
      action: () => navigate('/login')
    },
    {
      icon: <SearchOutlinedIcon sx={{ fontSize: 40, color: '#ed6c02' }} />,
      title: "Χαμένα Κατοικίδια",
      description: "Βρήκες ένα ζωάκι; Δες τη λίστα με τα δηλωμένα χαμένα ζώα ή καταχώρησε μια νέα αναφορά για να βοηθήσεις.",
      action: () => navigate('/lost-pets')
    }
  ];

  return (
    <Box>
      <Box sx={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        color: 'white'
      }}>
        <Container>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 2, color: '#ffffffff' }}>
                Όλα όσα χρειάζεσαι για το κατοικίδιο σου, σε ένα μέρος!
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, color: '#f9f9f9ff' }}>
                Οργάνωσε την υγεία των αγαπημένων σου ζώων σε λίγα μόνο κλικ!
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300 }}>
                <Button variant="contained" size="large" sx={{ bgcolor: 'black', color: 'white', '&:hover': { bgcolor: '#470020ff' } }} onClick={() => navigate('/login')}>
                  Είμαι Ιδιοκτήτης/τρια
                </Button>
                <Button variant="contained" size="large" sx={{ bgcolor: 'black', color: 'white', '&:hover': { bgcolor: '#470020ff' } }} onClick={() => navigate('/login')}>
                  Είμαι Κτηνίατρος
                </Button>
                <Button variant="contained" size="large" sx={{ bgcolor: 'black', borderColor: 'white', '&:hover': { bgcolor: '#470020ff' } }} onClick={scrollToLostPets}>
                  Βρήκα χαμένο ζώο
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 6 }}>
          Τι προσφέρει το myPet;
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index} sx={{ display: 'flex' }}>
              <Card
                sx={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  textAlign: 'center',
                  padding: 2,
                  boxShadow: 3,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    cursor: 'pointer'
                  }
                }}
                onClick={feature.action}
              >
                <CardContent>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                    {feature.icon}
                  </Box>
                  <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>


      <Box ref={lostPetsRef} sx={{ bgcolor: '#f9f9f9', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mb: 4 }}>
            Χαμένα κατοικίδια (πιο πρόσφατες δηλώσεις):
          </Typography>

          <Grid container spacing={3}>
            {recentLostPets.map((pet) => (
              <Grid item xs={12} md={6} key={pet.id}>
                {/* Horizontal Card */}
                <Card sx={{ display: 'flex', height: '100%', boxShadow: 2, '&:hover': { boxShadow: 4 } }}>
                  {/* Αριστερά: Εικόνα (Γκρι κουτί αν δεν υπάρχει φώτο) */}
                  <Box sx={{ width: 140, bgcolor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {pet.photo ? (
                      <CardMedia component="img" sx={{ width: 140, height: '100%', objectFit: 'cover' }} image={pet.photo} alt={pet.name} />
                    ) : (
                      <PetsOutlinedIcon sx={{ color: '#9e9e9e', fontSize: 40, opacity: 0.5 }} />
                    )}
                  </Box>

                  {/* Δεξιά: Πληροφορίες */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 2 }}>
                    <CardContent sx={{ flex: '1 0 auto', p: 0, pb: 1 }}>
                      <Typography component="div" variant="h6" fontWeight="bold">
                        “{pet.name}”
                      </Typography>
                      <Typography variant="body2" color="text.secondary" component="div">
                        {pet.type}, περιοχή: {pet.location}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" component="div">
                        ιδιοκτήτης: {pet.ownerName}
                      </Typography>
                    </CardContent>
                    {/* Κάτω μέρος: Εικονίδιο */}
                    <Box sx={{ display: 'flex', alignItems: 'center', pl: 0, pb: 0 }}>
                      <VisibilityIcon sx={{ color: 'black' }} />
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button variant="outlined" onClick={() => navigate('/lost-pets')}>
              Δες όλα τα χαμένα ζώα
            </Button>
          </Box>
        </Container>
      </Box>

    </Box>
  );
};

export default Home;