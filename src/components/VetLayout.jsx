import { Box } from '@mui/material';
import VetMenu from './VetMenu'; // Εδώ συνδέουμε το μενού του γιατρού
import AppBreadcrumbs from './AppBreadcrumbs';
const VetLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fdfdfd' }}>
      
      {/* Αριστερά: Το Sidebar του Κτηνιάτρου */}
      <VetMenu />

      {/* Δεξιά: Το κυρίως περιεχόμενο που αλλάζει ανά σελίδα */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
        <AppBreadcrumbs />
        {children}
      </Box>
      
    </Box>
  );
};

export default VetLayout;