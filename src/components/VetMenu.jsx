import { 
  Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Paper 
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; 
import { alpha } from '@mui/material/styles';

import PetsIcon from '@mui/icons-material/Pets';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';

const BRAND_COLOUR="#3f0a2b";

const VetMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();       
    navigate('/');  
  }; 

  const menuItems = [
    { text: 'Αρχική', icon: <DashboardIcon />, path: '/vet-dashboard' },
    { text: 'Το Προφίλ Μου', icon: <PersonIcon />, path: '/vet-profile' },
    { text: 'Τα Ραντεβού Μου', icon: <CalendarMonthIcon />, path: '/vet-appointments' },
    { text: 'Ώρες Εργασίας', icon: <AccessTimeIcon />, path: '/vet-hours' },
    { text: 'Αξιολογήσεις', icon: <StarIcon />, path: '/vet-reviews' },
    { text: 'Κατοικίδια', icon: <PetsIcon />, path: '/vet-pets' },
    { text: 'Ρυθμίσεις', icon: <SettingsIcon />, path: '/settings' }
  ];

   return (
    <Paper
      elevation={0}
      sx={{
        width: 290,
        bgcolor: "white",
        borderRight: `1px solid ${alpha("#000", 0.06)}`,
        borderRadius: 4,
        height: "calc(100vh - 32px)",
        position: "sticky",
        top: 16,
        ml: 2,
        overflow: "hidden",
      }}
    >
    
      <Box
        sx={{
          px: 2.5,
          py: 2.5,
          color: "white",
          background: `linear-gradient(135deg, ${BRAND_COLOUR} 0%, #0f0f10 100%)`,
        }}
      >
        <Typography fontWeight={900} sx={{ letterSpacing: 0.2 }}>
          myPet
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
          Vet panel
        </Typography>

      
        <Box
          sx={{
            mt: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            p: 1.2,
            borderRadius: 3,
            bgcolor: alpha("#fff", 0.10),
            border: `1px solid ${alpha("#fff", 0.14)}`,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 999,
              bgcolor: alpha("#fff", 0.16),
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
            }}
          >
            {(user?.name || user?.username || "V")[0]?.toUpperCase()}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={800} sx={{ fontSize: 13, lineHeight: 1.2 }}>
              {user?.name || user?.username || "Doctor"}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              Κτηνίατρος
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      <List sx={{ px: 1.2, py: 1 }}>
        {menuItems.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ my: 0.4 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={selected}
                sx={{
                  borderRadius: 3,
                  py: 1.2,
                  px: 1.4,
                  transition: "0.18s",
                  "&:hover": { bgcolor: alpha(BRAND_COLOUR, 0.0) },
                  "&.Mui-selected": {
                    bgcolor: alpha(BRAND_COLOUR, 0.1),
                    border: `1px solid ${alpha(BRAND_COLOUR, 0.1)}`,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: selected ? BRAND_COLOUR : alpha("#000", 0.6),
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                
                <ListItemText
                  primary={item.text}
                  slotProps={{
                    primary: {
                        fontWeight: selected ? 900 : 700,
                        fontSize: 14,
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ mt: 1 }} />

      <List sx={{ px: 1.2, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 3,
              py: 1.2,
              px: 1.4,
              "&:hover": { bgcolor: alpha("#d32f2f", 0.06) },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "error.main" }}>
              <LogoutIcon />
            </ListItemIcon>
            
            <ListItemText
              primary="Αποσύνδεση"
              slotProps={{
                primary: { fontWeight: 800, color: "error.main" }
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Paper>
  );
};

export default VetMenu;