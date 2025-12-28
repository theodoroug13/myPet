import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import LostPets from './pages/LostPets';
import OwnerDashboard from './pages/OwnerDashboard';

function App() {
  return (
    
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      <Navbar />

      <Box sx={{ flexGrow: 1 }}>
        <Routes>
          
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/lost-pets" element={<LostPets />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Box>

      <Footer />
      
    </Box>
  );
}

export default App;