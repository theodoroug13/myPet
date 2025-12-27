import { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Grid, Card, CardContent, CardMedia, 
   Button, MenuItem, Select, FormControl, InputLabel 
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PetsIcon from '@mui/icons-material/Pets';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import ClearIcon from '@mui/icons-material/Clear';


const LostPets = () => {
    const [pets, setPets] = useState([]);
  
  
    const [selectedType, setSelectedType] = useState('all'); 
    const [selectedLocation, setSelectedLocation] = useState('all');

    useEffect(() => {
        fetch('http://localhost:8000/lostPets')
        .then(res => res.json())
        .then(data => setPets(data));
        }, []);
    
    const petTypes = ['all', ...new Set(pets.map(pet => pet.type))];
    const lostLocations=['all', ...new Set(pets.map(pet => pet.location))];
    const filteredPets = pets.filter(pet => {
    
        const matchesType = selectedType === 'all' || pet.type === selectedType;
        const matchesLocation = selectedLocation === 'all' || pet.location === selectedLocation;
        return matchesType && matchesLocation;
    });
    const clearFilters = () => {
        setSelectedType('all');
        setSelectedLocation('all');
    };
    return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pb: 8 }}>
      
     
      <Box sx={{ bgcolor: 'white', py: 6, borderBottom: '1px solid #ddd' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Χαμένα Κατοικίδια
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Βοήθησε να βρεθούν τα ζωάκια που αγνοούνται.
          </Typography>

     
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            bgcolor: 'white', 
            p: 2, 
            borderRadius: 2, 
            boxShadow: 2,
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            
            
            <FormControl sx={{ minWidth: 200, flex: 1 }} size="small">
              <InputLabel id="type-select-label">Είδος Ζώου</InputLabel>
              <Select
                labelId="type-select-label"
                value={selectedType}
                label="Είδος Ζώου"
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <MenuItem value="all"><em>Όλα τα είδη</em></MenuItem>
                {petTypes.filter(t => t !== 'all').map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>

            
            <FormControl sx={{ minWidth: 200, flex: 1 }} size="small">
              <InputLabel id="location-select-label">Περιοχή</InputLabel>
              <Select
                labelId="location-select-label"
                value={selectedLocation}
                label="Περιοχή"
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <MenuItem value="all"><em>Όλες οι περιοχές</em></MenuItem>
                {lostLocations.filter(l => l !== 'all').map((loc) => (
                  <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                ))}
              </Select>
            </FormControl>

           
            {(selectedType !== 'all' || selectedLocation !== 'all') && (
                <Button 
                    variant="text" 
                    color="error" 
                    startIcon={<ClearIcon />} 
                    onClick={clearFilters}
                >
                    Καθαρισμός
                </Button>
            )}

          </Box>
        </Container>
      </Box>

      
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {filteredPets.map((pet) => (
            <Grid item xs={12} md={6} key={pet.id}>
               <Card sx={{ display: 'flex', height: '100%', boxShadow: 2, '&:hover': { boxShadow: 4 }, transition: '0.3s' }}>
                  <Box sx={{ width: 140, bgcolor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {pet.photo ? (
                      <CardMedia component="img" sx={{ width: 140, height: '100%', objectFit: 'cover' }} image={pet.photo} alt={pet.name} />
                    ) : (
                      <PetsOutlinedIcon sx={{ color: '#9e9e9e', fontSize: 40, opacity: 0.5 }} />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 2 }}>
                    <CardContent sx={{ flex: '1 0 auto', p: 0, pb: 1 }}>
                      <Typography component="div" variant="h6" fontWeight="bold">
                        “{pet.name}”
                      </Typography>
                      
                     
                      {pet.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 0.5 }}>
                            <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary">
                            {pet.location}
                            </Typography>
                        </Box>
                      )}
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                         <PetsIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 0.5 }} />
                         <Typography variant="body2" color="text.secondary">
                           {pet.type}
                         </Typography>
                      </Box>
                    </CardContent>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button size="small" startIcon={<VisibilityIcon />} sx={{ color: 'black' }}>
                        Λεπτομέρειες
                      </Button>
                    </Box>
                  </Box>
                </Card>
            </Grid>
          ))}
        </Grid>

        {filteredPets.length === 0 && (
           <Box sx={{ textAlign: 'center', mt: 8, opacity: 0.6 }}>
             <PetsIcon sx={{ fontSize: 60, mb: 2 }} />
             <Typography variant="h6">
               Δεν βρέθηκαν ζωάκια με αυτά τα κριτήρια.
             </Typography>
             <Button sx={{ mt: 2 }} onClick={clearFilters}>Καθαρισμός Φίλτρων</Button>
           </Box>
        )}
      </Container>
    </Box>
  );
};
export default LostPets;