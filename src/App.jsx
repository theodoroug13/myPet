import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
  return (
    // Χρησιμοποιούμε Box για να σπρώξουμε το Footer στο κάτω μέρος
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      <Navbar />

      <Box sx={{ flexGrow: 1 }}>
        <Routes>
          {/* Ορίζουμε τις διαδρομές (Routes) */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Προσωρινά, αν πατήσεις κάτι που δεν υπάρχει, σε πάει σπίτι */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Box>

      <Footer />
      
    </Box>
  );
}

export default App;