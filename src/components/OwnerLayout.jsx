import { Box, Container } from '@mui/material';
import OwnerMenu from './OwnerMenu'; 

const OwnerLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      
      <OwnerMenu />

      
      <Box component="main" sx={{ flexGrow: 1, p: 4, overflowY: 'auto' }}>
        <Container maxWidth="lg">
            {children}
        </Container>
      </Box>

    </Box>
  );
};

export default OwnerLayout;