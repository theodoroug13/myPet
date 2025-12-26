import { Box, Typography, Button, Container, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
const heroImage = './pictures/home-hero.jpg';

const Home = () => {
  const navigate = useNavigate();
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
                <Button variant="contained" size="large" sx={{ bgcolor: 'black', borderColor: 'white', '&:hover': { bgcolor: '#470020ff' } }} onClick={() => navigate('/lost-pets')}>
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
    </Box>
  );
};

export default Home;