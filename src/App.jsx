import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import LostPets from './pages/LostPets';
import OwnerDashboard from './pages/OwnerDashboard';
import VetDashboard from './pages/VetDashboard';
import VetProfile from './pages/VetProfile';
import VetAppointments from './pages/VetAppointments';
import VetPets from './pages/VetPets';
import VetNewPet from './pages/VetNewPet';
import OwnerAppointments from './pages/OwnerAppointments';
import OwnerNewAppointment from './pages/OwnerNewAppointment';
import OwnerPets from './pages/OwnerPets';
import MyDiloseis from './pages/MyDiloseis';
import MyVet from './pages/MyVet';
import OwnerPetDetails from './pages/OwnerPetDetails';
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
          <Route path="/owner-pets" element={<OwnerPets />} />
          <Route path="/owner-pets/:petId" element={<OwnerPetDetails />} />

          <Route path="/owner-appointments" element={<OwnerAppointments/>}/>
          <Route path="/owner-appointments/new" element={<OwnerNewAppointment/>}/>
          <Route path="/my-vet" element={<MyVet/>}/>
          <Route path="/my-diloseis" element={<MyDiloseis/>}/>
          

          

          <Route path="/vet-dashboard" element={<VetDashboard />} />
          <Route path="/vet-profile" element={<VetProfile />} />
          <Route path="/vet-appointments" element={<VetAppointments />} />
          <Route path="/vet-pets" element={<VetPets />} />
          <Route path="/new-pet" element={<VetNewPet />} />
          
          <Route path="*" element={<Home />} />
        </Routes>
      </Box>

      <Footer />
      
    </Box>
  );
}

export default App;