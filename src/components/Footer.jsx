import { Box, Container, Grid, Typography, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer = () => {
  return (
    <Box sx={{ bgcolor: 'white', color: 'black', py: 6, borderTop: '1px solid #eee', mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          
       
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Συνδέσου μαζί μας
            </Typography>
            <Box>
              {/* Εικονίδια Social Media */}
              <IconButton color="inherit" aria-label="Facebook"><FacebookIcon /></IconButton>
              <IconButton color="inherit" aria-label="LinkedIn"><LinkedInIcon /></IconButton>
              <IconButton color="inherit" aria-label="YouTube"><YouTubeIcon /></IconButton>
              <IconButton color="inherit" aria-label="Instagram"><InstagramIcon /></IconButton>
            </Box>
          </Grid>

      
          <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Στοιχεία επικοινωνίας:
            </Typography>
            <Typography variant="body1">
              mail: mypet@mail.com
            </Typography>
            <Typography variant="body1">
              Τηλ: 210 1234567
            </Typography>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;