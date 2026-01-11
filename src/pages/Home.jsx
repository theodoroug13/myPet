import { useRef } from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'; 
const heroImage = '../pictures/home-hero.jpg';

const Home = () => {
  const navigate = useNavigate();
  

  const featuresRef = useRef(null);

  
  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      description: "Βρήκες ένα ζωάκι; Δες τη λίστα με τα δηλωμένα χαμένα ζώα και έλα σε επαφή με τον ιδιοκτήτη του.",
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
        height: '92vh', 
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        position: 'relative' 
      }}>
        <Container>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 2, color: '#ffffff' }}>
                Όλα όσα χρειάζεσαι για το κατοικίδιό σου, σε ένα μέρος!
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, color: '#f9f9f9', maxWidth: '600px' }}>
                Οργάνωσε την υγεία των αγαπημένων σου ζώων σε λίγα μόνο κλικ!
              </Typography>
              
              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Button 
                    variant="contained" 
                    size="large" 
                    sx={{ bgcolor: 'black', color: 'white', px: 4, py: 1.5, '&:hover': { bgcolor: '#636363ff' } }} 
                    onClick={() => navigate('/login')}
                >
                  Είμαι Ιδιοκτήτης
                </Button>
                <Button 
                    variant="contained" 
                    size="large" 
                    sx={{ bgcolor: 'black', color: 'white', px: 4, py: 1.5, '&:hover': { bgcolor: '#636363ff' } }} 
                    onClick={() => navigate('/login')}
                >
                  Είμαι Κτηνίατρος
                </Button>
                <Button 
                    variant="contained" 
                    size="large" 
                    sx={{ bgcolor: '#3f0a2bff', color: 'white', px: 4, py: 1.5, '&:hover': { bgcolor: '#636363ff' } }} 
                    onClick={() => navigate('/lost-pets')}
                >
                  Βρήκα χαμένο ζώο
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>

       
        <Box sx={{ 
            position: 'absolute', 
            bottom: 30, 
            left: '50%', 
            transform: 'translateX(-50%)',
            animation: 'bounce 2s infinite', 
            '@keyframes bounce': {
                '0%, 20%, 50%, 80%, 100%': { transform: 'translate(-50%, 0)' },
                '40%': { transform: 'translate(-50%, -10px)' },
                '60%': { transform: 'translate(-50%, -5px)' }
            }
        }}>
            <IconButton onClick={scrollToFeatures} sx={{ color: 'white', flexDirection: 'column' }}>
                <Typography variant="caption" sx={{ mb: -1, opacity: 0.8 }}>Περισσότερα</Typography>
                <KeyboardArrowDownIcon sx={{ fontSize: 50 }} />
            </IconButton>
        </Box>
      </Box>

      
      <Box ref={featuresRef} sx={{ py: 10, bgcolor: '#f9f9f9', minHeight: '60vh' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 6 }}>
            Τι προσφέρει το myPet;
          </Typography>

          <Grid container spacing={4} alignItems="stretch">
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index} sx={{ display: 'flex' }}>
                <Card
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    textAlign: 'center',
                    padding: 3,
                    boxShadow: 3,
                    borderRadius: 3,
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      cursor: 'pointer',
                      boxShadow: 6
                    }
                  }}
                  onClick={feature.action}
                >
                  <CardContent>
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                      {feature.icon}
                    </Box>
                    <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
    </Box>
  );
};

export default Home;