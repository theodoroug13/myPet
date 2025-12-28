import React from "react";
import {Box,Container, Paper,List,ListItemButton,ListItemIcon,ListItemText,Typography,Divider,Drawer,
IconButton,useMediaQuery} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PetsOutlinedIcon from "@mui/icons-material/PetsOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import { useLocation, useNavigate } from "react-router-dom";

const MENU = [
  { label: "Dashboard", path: "/owner", icon: <DashboardOutlinedIcon /> },
  { label: "Τα Κατοικίδιά μου", path: "/my-pets", icon: <PetsOutlinedIcon /> },
  { label: "Ραντεβού", path: "/appointments", icon: <EventAvailableOutlinedIcon /> },
  { label: "Δηλώσεις", path: "/lost-declarations", icon: <ReportProblemOutlinedIcon /> },
  { label: "Ο κτηνίατρός μου", path: "/search-vets", icon: <SearchOutlinedIcon /> },
];

function SideMenu({ onNavigate }) {
  const { pathname } = useLocation();

  return (
    <Box>
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography fontWeight={900}>Μενού</Typography>
        <Typography variant="body2" color="text.secondary">
          Γρήγορη πλοήγηση
        </Typography>
      </Box>

      <Divider />

      <List sx={{ py: 1 }}>
        {MENU.map((item) => (
          <ListItemButton
            key={item.path}
            selected={pathname === item.path}
            onClick={()=> onNavigate(item.path)}
            sx={{
              borderRadius: 2,
              mx: 1,
              my: 0.5,
              "&.Mui-selected": {
                bgcolor: "action.selected",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}

const OwnerDashboardLayout = ({ title, subtitle, children }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [open, setOpen] = React.useState(false);

  const go = (path) => {
    navigate(path);
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box sx={{ bgcolor: "#f6f7fb", py: 4, minHeight: "calc(100vh - 64px)" }}>
      <Container maxWidth="lg">
        {/* header row */}
        {(title || subtitle) && (
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              mb: 2,
              gap: 2,
            }}
          >
            <Box>
              {title ? (
                <Typography variant="h4" fontWeight={900}>
                  {title}
                </Typography>
              ) : null}
              {subtitle ? (
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  {subtitle}
                </Typography>
              ) : null}
            </Box>

            {/* mobile menu button */}
            {!mdUp ? (
              <IconButton onClick={() => setOpen(true)} aria-label="open menu">
                <MenuIcon />
              </IconButton>
            ) : null}
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 3 }}>
          {/* main content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>

          {/* right sticky menu (desktop) */}
          {mdUp ? (
            <Paper
              variant="outlined"
              sx={{
                width: 280,
                borderRadius: 4,
                position: "sticky",
                top: 88, // κάτω από AppBar
                alignSelf: "flex-start",
                maxHeight: "calc(100vh - 110px)",
                overflow: "auto",
              }}
            >
              <SideMenu onNavigate={go} />
            </Paper>
          ) : null}
        </Box>
      </Container>

      {/* mobile drawer */}
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 280 }}>
          <SideMenu onNavigate={go} />
        </Box>
      </Drawer>
    </Box>
  );
}
export default OwnerDashboardLayout;
