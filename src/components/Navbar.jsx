import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const Navbar= () => {
  const navigate= useNavigate();
  const {user, logout}= useAuth(); 

  const handleLogout=() => {
    logout();
    navigate('/');
  };

  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', color: 'black', borderBottom: '1px solid #eee' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          
          {/* ΛΟΓΟΤΥΠΟ */}
          <Typography 
            variant="h5"    
            component="div" 
            sx={{ flexGrow: 1, fontWeight: 'bold', cursor: 'pointer' }} 
            onClick={() => navigate('/')}
          >
            myPet Logo
          </Typography>

          {/* ΜΕΝΟΥ */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            
            <Button color="inherit" onClick={() => navigate('/about')}>Ποιοί Είμαστε</Button>
            <Button color="inherit" onClick={() => navigate('/faq')}>FAQ</Button>
            <Button color="inherit">ΕΛ/EN</Button>

            {user ? (
              <>
                 {user.role === 'owner' && (
                  <Button color="primary" onClick={() => navigate('/my-pets')}>Τα Ζώα μου</Button>
                )}

                {user.role === 'vet' && (
                  <Button color="primary" onClick={() => navigate('/vet-dashboard')}>Ιατρείο</Button>
                )}

                <Button variant="outlined" color="error" size="small" onClick={handleLogout} sx={{ ml: 2 }}>
                  Αποσύνδεση ({user.username})
                </Button>
              </>
            ) : (
              <Button variant="outlined" color="inherit" onClick={() => navigate('/login')} sx={{ ml: 2 }}>
                Σύνδεση
              </Button>
            )}

          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;