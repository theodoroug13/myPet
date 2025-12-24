import { Box, Typography, Button, Container, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: '#808080', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
              Όλα όσα χρειάζεσαι για το κατοικίδιο σου
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300 }}>
              <Button variant="contained" color="secondary" size="large" onClick={() => navigate('/login')}>
                Είμαι Ιδιοκτήτης
              </Button>
              <Button variant="contained" color="secondary" size="large" onClick={() => navigate('/login')}>
                Είμαι Κτηνίατρος
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;