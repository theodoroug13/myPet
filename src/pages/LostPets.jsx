import { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Grid, Card, CardContent, CardMedia, 
  Button, MenuItem, Select, FormControl, InputLabel,
  Dialog, DialogContent, DialogTitle, IconButton, Divider, TextField, Snackbar, Alert,
  Autocomplete, CircularProgress
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/el'; 

import LocationOnIcon from '@mui/icons-material/LocationOn';
import PetsIcon from '@mui/icons-material/Pets';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraBackIcon from '@mui/icons-material/PhotoCameraBack';
const LostPets = () => {
  const [pets, setPets] = useState([]);


  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [openFoundDialog, setOpenFoundDialog] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [phoneError, setPhoneError] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);

  const [foundForm, setFoundForm] = useState({
    date: null,
    location: '',
    phone: '',
    name: '',
    comments: ''
  });

  useEffect(() => {
    fetch('http://localhost:8000/lostPets')
      .then(res => res.json())
      .then(data => setPets(data));
  }, []);

  const petTypes = ['all', ...new Set(pets.map(pet => pet.type).filter(Boolean))];
  const lostLocations = ['all', ...new Set(pets.map(pet => pet.location).filter(Boolean))];

  const filteredPets = pets.filter(pet => {
    const matchesType = selectedType === 'all' || pet.type === selectedType;
    const matchesLocation = selectedLocation === 'all' || pet.location === selectedLocation;
    return matchesType && matchesLocation;
  });

  const clearFilters = () => {
    setSelectedType('all');
    setSelectedLocation('all');
  };

  // --- HANDLERS ΓΙΑ ΤΟ MODAL ---
  const handleOpenDetails = (pet) => {
    setSelectedPet(pet);
    setOpenDialog(true);
  };

  const handleCloseDetails = () => {
    setOpenDialog(false);
    setSelectedPet(null);
  };
  const handleOpenFoundForm = () => {

    setOpenDialog(false);
    setOpenFoundDialog(true);
  };

  const handleCloseFoundForm = () => {
    setOpenFoundDialog(false);
  };

const handleLocationSearch = async (event, value) => {
        setFoundForm({ ...foundForm, location: value });
        
        
        if (!value || value.length <2) return;

        setLoadingLocation(true);
        try {
            // Χρήση OpenStreetMap API (Nominatim) επειδή είναι δωρεάν
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${value}&countrycodes=gr&addressdetails=1&limit=5`);
            const data = await response.json();
            setLocationOptions(data.map((place) => place.display_name)); 
        } catch (error) {
            console.error("Error fetching locations:", error);
        } finally {
            setLoadingLocation(false);
        }
    };

    
    const handlePhoneChange = (e) => {
        const val = e.target.value;
        if (!/^\d*$/.test(val)) return; 
        setFoundForm({ ...foundForm, phone: val });
        setPhoneError(val.length !== 10 && val.length > 0);
    };

    
    const handleSubmitFound = () => {
        if (foundForm.phone.length !== 10) {
            setPhoneError(true);
            alert("Παρακαλώ εισάγετε ένα έγκυρο 10ψήφιο τηλέφωνο.");
            return;
        }
        if (!foundForm.date || !foundForm.location) {
            alert("Παρακαλώ συμπληρώστε ημερομηνία και τοποθεσία.");
            return;
        }

        const formattedDate = dayjs(foundForm.date).format('DD/MM/YYYY');
        console.log("Found Report Submitted:", { ...foundForm, date: formattedDate });

        setOpenFoundDialog(false);
        setShowSuccess(true);
        setFoundForm({ date: null, location: '', phone: '', name: '', comments: '' });
        setPhoneError(false);
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

          <Box sx={{ display: 'flex', gap: 2, bgcolor: 'white', p: 2, borderRadius: 2, boxShadow: 2, flexWrap: 'wrap', alignItems: 'center' }}>
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
                <Button variant="text" color="error" startIcon={<ClearIcon />} onClick={clearFilters}>
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
                      <Typography component="div" variant="h6" fontWeight="bold">“{pet.name}”</Typography>
                      {pet.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 0.5 }}>
                            <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary">{pet.location}</Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                         <PetsIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 0.5 }} />
                         <Typography variant="body2" color="text.secondary">{pet.type}</Typography>
                      </Box>
                    </CardContent>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button size="small" startIcon={<VisibilityIcon />} sx={{ color: 'black' }} onClick={() => handleOpenDetails(pet)}>
                        Λεπτομέρειες
                      </Button>
                    </Box>
                  </Box>
                </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Dialog open={openDialog} onClose={handleCloseDetails} maxWidth="md" fullWidth scroll="body">
        {selectedPet && (
            <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" fontWeight="bold">Πληροφορίες δήλωσης απώλειας</Typography>
                <IconButton onClick={handleCloseDetails}><CloseIcon /></IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 4 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 3 }}><Typography variant="subtitle2" color="text.secondary">Όνομα κατοικιδίου:</Typography><Typography variant="h6" fontWeight="500">{selectedPet.name}</Typography></Box>
                        <Box sx={{ mb: 3 }}><Typography variant="subtitle2" color="text.secondary">Χάθηκε στις:</Typography><Typography variant="body1" fontWeight="500">{selectedPet.lostDate || '-'}</Typography></Box>
                        <Box sx={{ mb: 3 }}><Typography variant="subtitle2" color="text.secondary">Στην περιοχή:</Typography><Typography variant="body1" fontWeight="500">{selectedPet.location}</Typography></Box>
                        <Box sx={{ mb: 3 }}><Typography variant="subtitle2" color="text.secondary">Τηλέφωνο:</Typography><Typography variant="body1" fontWeight="500">{selectedPet.phone || '-'}</Typography></Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 3 }}><Typography variant="subtitle2" color="text.secondary">Αριθμός microchip:</Typography><Typography variant="body1" fontWeight="500">{selectedPet.microchip || '-'}</Typography></Box>
                        <Box sx={{ mb: 3 }}><Typography variant="subtitle2" color="text.secondary">Είδος:</Typography><Typography variant="body1" fontWeight="500">{selectedPet.type}</Typography></Box>
                        <Box sx={{ mb: 3 }}><Typography variant="subtitle2" color="text.secondary">Ονοματεπώνυμο Ιδιοκτήτη:</Typography><Typography variant="body1" fontWeight="500">{selectedPet.ownerName}</Typography></Box>
                        <Box sx={{ mb: 3 }}><Typography variant="subtitle2" color="text.secondary">Άλλες πληροφορίες:</Typography><Typography variant="body1">{selectedPet.description || '-'}</Typography></Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Πρόσφατη φωτογραφία:</Typography>
                        <Box sx={{ width: '100%', height: 250, bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, overflow: 'hidden', border: '1px solid #eee' }}>
                             {selectedPet.photo ? (
                                <img src={selectedPet.photo} alt={selectedPet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                             ) : (
                                <PetsIcon sx={{ fontSize: 80, color: '#ccc' }} />
                             )}
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                        <Button variant="contained" size="small" sx={{ bgcolor: 'black', color: 'white', py: 1.5, px: 4, fontWeight: 'bold', '&:hover': { bgcolor: '#333' } }} onClick={handleOpenFoundForm}>
                            ΒΡΗΚΑ ΑΥΤΟ ΤΟ ΚΑΤΟΙΚΙΔΙΟ
                        </Button>
                    </Grid>
                </Grid>
            </DialogContent>
            </>
        )}
      </Dialog>

      
      <Dialog open={openFoundDialog} onClose={handleCloseFoundForm} maxWidth="md" fullWidth scroll="body">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', pt: 4 }}>
            <Typography variant="h5" fontWeight="bold">Δήλωση Εύρεσης</Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="el">
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    
                   
                    <Typography variant="subtitle2" gutterBottom>Ημερομηνία</Typography>
                    <DatePicker
                        value={foundForm.date}
                        onChange={(newValue) => setFoundForm({ ...foundForm, date: newValue })}
                        slotProps={{ textField: { fullWidth: true, size: 'small', sx: { mb: 2 } } }}
                    />

                   
                    <Typography variant="subtitle2" gutterBottom>Τόπος που βρέθηκε</Typography>
                    <Autocomplete
                        freeSolo
                        options={locationOptions}
                        loading={loadingLocation}
                        onInputChange={handleLocationSearch}
                        renderInput={(params) => (
                            <TextField 
                                {...params} size="small" variant="outlined" sx={{ mb: 2 }} placeholder="Γράψε τοποθεσία..." 
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (<>{loadingLocation ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>),
                                }}
                            />
                        )}
                    />

                   
                    <Typography variant="subtitle2" gutterBottom>Τηλέφωνο επικοινωνίας</Typography>
                    <TextField 
                        fullWidth size="small" variant="outlined" sx={{ mb: 2 }} placeholder="π.χ. 6900000000"
                        value={foundForm.phone} onChange={handlePhoneChange} error={phoneError}
                        helperText={phoneError ? "Το τηλέφωνο πρέπει να έχει 10 ψηφία" : ""}
                        inputProps={{ maxLength: 10 }}
                    />

                    <Typography variant="subtitle2" gutterBottom>Ονοματεπώνυμο</Typography>
                    <TextField 
                        fullWidth size="small" variant="outlined" multiline rows={2} placeholder="Γρηγόρης Παπασταύρου"
                        value={foundForm.name} onChange={(e) => setFoundForm({...foundForm, name: e.target.value})}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                     <Typography variant="subtitle2" gutterBottom>Φωτογραφία για ταυτοποίηση</Typography>
                     <Box sx={{ border: '1px solid #ccc', borderRadius: 2, height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fafafa' }}>
                        <PhotoCameraBackIcon sx={{ fontSize: 80, color: '#333' }} />
                     </Box>
                </Grid>

                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                     <Button 
                        variant="contained" size="large"
                        sx={{ bgcolor: 'black', color: 'white', py: 1.5, px: 6, fontWeight: 'bold', '&:hover': { bgcolor: '#333' } }}
                        onClick={handleSubmitFound}
                    >
                        Βρήκα αυτό το κατοικίδιο
                    </Button>
                </Grid>
            </Grid>
            </LocalizationProvider>
        </DialogContent>
      </Dialog>

      <Snackbar open={showSuccess} autoHideDuration={4000} onClose={() => setShowSuccess(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%', bgcolor: '#e0e0e0', color: '#333', fontWeight: 'bold' }}>
          Η δήλωση σας ολοκληρώθηκε επιτυχώς!
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default LostPets;