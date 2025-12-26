import { Box, Typography, Button, Container, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const heroImage='./pictures/home-hero.jpg';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${heroImage})`,
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
            <Typography variant="h3"  component="h1" sx={{ fontWeight: 'bold', mb: 2, color: '#ffffffff'  }}>
              Όλα όσα χρειάζεσαι για το κατοικίδιο σου, σε ένα μέρος!
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, color: '#f9f9f9ff'  }}>
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
  );
};

export default Home;