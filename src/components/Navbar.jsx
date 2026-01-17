import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import PetsIcon from '@mui/icons-material/Pets';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router-dom';     
import { useAuth } from '../context/AuthContext';    



function Navbar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  
  const navItems = [
    { label: 'Αρχική', path: '/' },
    { label: 'FAQ', path: '/faq' },
  ];

  
if (user?.role === 'owner') {
  navItems.push({ label: 'Τα Ζώα μου', path: '/owner-pets' });
  navItems.push({ label: 'Ραντεβού', path: '/owner-appointments' });
}

if (user?.role === 'vet') {
  navItems.push({ label: 'Ιατρείο', path: '/vet-dashboard' });
}


  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = (path) => {
    setAnchorElNav(null);
    if (path) {
        navigate(path);
    }
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  const handleLogout = () => {
    setAnchorElUser(null);
    logout();
    navigate('/');
  };
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const goOwner = () => {
    // αν δεν έχεις role-aware login, άστο απλά /login
    if (!user) return navigate("/login?as=owner");
    return navigate("/login");
  };

  const goVet = () => {
    if (!user) return navigate("/login?as=vet");
    return navigate("/login");
  };

  const goFound = () => {
    navigate("/lost-pets");
  };
  const goSmart = (nextPath, roleHint) => {
    // αν είναι logged-in, πήγαινε κατευθείαν εκεί (ή σε dashboard ανά ρόλο)
    if (user) {
      // αν πατάει "ΕΙΜΑΙ ΚΤΗΝΙΑΤΡΟΣ" αλλά είναι owner, προτίμησε το δικό του dashboard
      if (roleHint === "owner") return navigate("/owner-dashboard");
      if (roleHint === "vet") return navigate("/vet-dashboard");
      return navigate(nextPath);
    }

    // αν ΔΕΝ είναι logged-in, πήγαινε login με next (και προαιρετικά role hint)
    const qs = new URLSearchParams();
    qs.set("next", nextPath);
    if (roleHint) qs.set("as", roleHint);

    navigate(`/login?${qs.toString()}`);
  };


  return (
    <AppBar position="sticky" color="transparent" elevation={0} sx={{backgroundColor: "white", color:"black", borderBottom: "1px solid #eee",
    top: 0,       
    zIndex: 1100}}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box onClick={()=> navigate('/')} sx={{ display:{xs: 'none', md: 'flex'},alignItems: 'center',mr:2, cursor: 'pointer' }}>
          <PetsIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            myPet
          </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={() => handleCloseNavMenu(null)}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {navItems.map((item) => (
                <MenuItem key={item.label} onClick={()=> handleCloseNavMenu(item.path)}>
                  <Typography sx={{ textAlign: 'center' }}>{item.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          
          
          <PetsIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            myPet
          </Typography>


          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                onClick={() => handleCloseNavMenu(item.path)}
                sx={{ my: 2, color: 'black', display: 'block' }}
              >
                {item.label}
              </Button>
            ))}

          </Box>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", ml: 2 }}>
            <Button
              variant="contained"
              size="small"
              sx={{ bgcolor: "black", color: "white", px: 2, py: 1,borderRadius:2, "&:hover": { bgcolor: "#636363ff" } }}
              onClick={() =>  goSmart("/owner-dashboard", "owner")}
            >
              Είμαι Ιδιοκτήτης
            </Button>

            <Button
              variant="contained"
              size="small"
              sx={{ bgcolor: "black", color: "white", px: 2, py: 1, borderRadius:2,"&:hover": { bgcolor: "#636363ff" } }}
              onClick={() => goSmart("/vet-dashboard", "vet")}
            >
              Είμαι Κτηνίατρος
            </Button>

            <Button
              variant="contained"
              size="small"
              sx={{ bgcolor: "#3f0a2bff", color: "white", px: 2, py: 1,borderRadius:2, "&:hover": { bgcolor: "#636363ff" } }}
              onClick={goFound}
            >
              Βρήκα χαμένο ζώο
            </Button>
          </Box>

          <Box sx={{display: "flex", gap: 2, alignItems: "center", ml: 2 }}>
            {user ?(<><Tooltip title="Λογαριασμός">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar sx={{ bgcolor: "#3f0a2bff" }}>
                      {user.username.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  keepMounted
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem onClick={handleCloseUserMenu}>
                    <Typography textAlign="center">Προφίλ ({user.username})</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}> 
                    <Typography textAlign="center" color="error">Αποσύνδεση</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button 
                variant="outlined" 
                color="inherit" 
                onClick={() => navigate('/login')}
              >
                Σύνδεση
              </Button>
            )}
            
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Navbar;
