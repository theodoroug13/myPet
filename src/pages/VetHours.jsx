import { useState, useEffect, useRef } from 'react';
import { 
    Box, Typography, Paper, Grid, Switch, TextField, Button, Divider, IconButton, 
    Tabs, Tab, List, Chip, Alert, Stack, Snackbar, Card, CardContent, CircularProgress, InputAdornment, Tooltip
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import VetLayout from '../components/VetLayout';
import { useAuth } from '../context/AuthContext';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CoffeeIcon from '@mui/icons-material/Coffee';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'; 
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditIcon from '@mui/icons-material/Edit';

const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
};

const TimeSelector = ({ label, value, onChange, disabled }) => {
  const inputRef = useRef(null);

  const handleBoxClick = () => {
    if (!disabled && inputRef.current) {
        if (inputRef.current.showPicker) {
            inputRef.current.showPicker();
        } else {
            inputRef.current.focus();
        }
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
          {label}
      </Typography>
      
      <Box 
        onClick={handleBoxClick}
        sx={{
            position: 'relative',
            cursor: disabled ? 'default' : 'pointer'
        }}
      >
        <TextField
            inputRef={inputRef}
            type="time"
            value={value}
            onChange={onChange}
            disabled={disabled}
            fullWidth
            variant="outlined"
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <AccessTimeFilledIcon sx={{ color: disabled ? 'grey' : '#1976d2', fontSize: 22 }} />
                    </InputAdornment>
                ),
            }}
            sx={{
                '& .MuiOutlinedInput-root': {
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    bgcolor: disabled ? '#f0f0f0' : '#f8fdff',
                    cursor: disabled ? 'default' : 'pointer',
                    transition: '0.2s',
                    height: '50px', 
                    '& fieldset': { borderColor: disabled ? '#ddd' : '#bbdefb', borderWidth: '1px' },
                    '&:hover fieldset': { borderColor: disabled ? '#ddd' : '#1976d2' },
                    '&:hover': { bgcolor: disabled ? '#f0f0f0' : '#e3f2fd' },
                },
                '& input::-webkit-calendar-picker-indicator': {
                    display: 'none',
                    '-webkit-appearance': 'none'
                },
                '& input': {
                    cursor: disabled ? 'default' : 'pointer',
                    paddingLeft: 1,
                    colorScheme: 'light'
                }
            }}
        />
      </Box>
    </Box>
  );
};

const VetHours = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Χρησιμοποιούμε το location για να δούμε αν υπάρχει state από το Back button
  
  const [selectedDate, setSelectedDate] = useState(() => {
      return location.state?.savedDate || formatDate(new Date());
  });

  const [weekDates, setWeekDates] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [successMsg, setSuccessMsg] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const minDate = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
  const maxDate = new Date(today.getFullYear() + 5, today.getMonth(), today.getDate());

  // Έτσι θυμάται την ημερομηνία ΜΟΝΟ σε αυτό το "μονοπάτι" ιστορικού (π.χ. όταν πατάς Back)
  useEffect(() => {
      if (selectedDate) {
          // Το replace: true ενημερώνει την τρέχουσα εγγραφή ιστορικού χωρίς να προσθέτει καινούργια
          navigate('.', { state: { savedDate: selectedDate }, replace: true });
      }
  }, [selectedDate]);

  useEffect(() => {
    if (user) {
      fetch('http://localhost:8000/appointments')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
             const myApps = data.filter(app => app.vetId === user.id && (app.status === 'confirmed' || app.status === 'pending'));
             setAppointments(myApps);
          }
        })
        .catch(err => console.error(err));

      if (user.availability) {
          setSchedule(user.availability);
      }
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    try {
        if (!selectedDate) return;

        const [year, month, day] = selectedDate.split('-').map(Number);
        const current = new Date(year, month - 1, day, 12, 0, 0);

        const currentDayOfWeek = current.getDay(); 
        const diff = current.getDate() - currentDayOfWeek + (currentDayOfWeek === 0 ? -6 : 1);
        
        const monday = new Date(current);
        monday.setDate(diff);

        const week = [];
        for (let i = 0; i < 7; i++) {
            const nextDay = new Date(monday);
            nextDay.setDate(monday.getDate() + i);
            week.push(nextDay);
        }
        setWeekDates(week);
        
        // Συγχρονισμός Tab
        const dayIndex = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
        setSelectedTab(dayIndex);

    } catch (e) {
        console.error(e);
    }
  }, [selectedDate]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    // Όταν αλλάζει το Tab, αλλάζουμε και την selectedDate για να ενημερωθεί το History State
    const newDate = weekDates[newValue];
    if (newDate) {
        setSelectedDate(formatDate(newDate));
    }
  };

  const handlePrevWeek = () => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const current = new Date(year, month - 1, day, 12, 0, 0);
    current.setDate(current.getDate() - 7);
    
    if (current >= minDate) {
        setSelectedDate(formatDate(current));
    }
  };

  const handleNextWeek = () => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const current = new Date(year, month - 1, day, 12, 0, 0);
    current.setDate(current.getDate() + 7);
    
    if (current <= maxDate) {
        setSelectedDate(formatDate(current));
    }
  };

  const getActiveDateObj = () => weekDates[selectedTab] || new Date();
  const getActiveDateStr = () => formatDate(getActiveDateObj());

  const isPastDate = () => {
    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);
    const active = getActiveDateObj();
    const activeCheck = new Date(active);
    activeCheck.setHours(0, 0, 0, 0);
    return activeCheck < todayObj;
  };

  const getCurrentData = () => {
      const dateStr = getActiveDateStr();
      const rawData = schedule[dateStr] || {};
      return {
          isOpen: rawData.isOpen !== undefined ? rawData.isOpen : true,
          start: rawData.start || '09:00',
          end: rawData.end || '17:00',
          breaks: Array.isArray(rawData.breaks) ? rawData.breaks : []
      };
  };

  const updateSchedule = (field, value) => {
    if (isPastDate()) return;
    const dateStr = getActiveDateStr();
    const currentData = getCurrentData(); 
    setSchedule(prev => ({
      ...prev,
      [dateStr]: { ...currentData, [field]: value }
    }));
  };

  const addBreak = () => {
    if (isPastDate()) return;
    const dateStr = getActiveDateStr();
    const currentData = getCurrentData();
    setSchedule(prev => ({
      ...prev,
      [dateStr]: { 
        ...currentData, 
        breaks: [...currentData.breaks, { start: '13:00', end: '13:30' }] 
      }
    }));
  };

  const updateBreak = (index, field, value) => {
    if (isPastDate()) return;
    const dateStr = getActiveDateStr();
    const currentData = getCurrentData();
    const newBreaks = [...currentData.breaks];
    if (newBreaks[index]) {
        newBreaks[index][field] = value;
        setSchedule(prev => ({
            ...prev,
            [dateStr]: { ...currentData, breaks: newBreaks }
        }));
    }
  };

  const removeBreak = (index) => {
    if (isPastDate()) return;
    const dateStr = getActiveDateStr();
    const currentData = getCurrentData();
    const newBreaks = currentData.breaks.filter((_, i) => i !== index);
    setSchedule(prev => ({
      ...prev,
      [dateStr]: { ...currentData, breaks: newBreaks }
    }));
  };

  const getDayAppointments = () => {
    const dateStr = getActiveDateStr();
    return appointments.filter(app => app.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
  };

  const handleSave = async () => {
    if (!user) return;
    
    let hoursString = `Πρόγραμμα Εβδομάδας (${formatDate(weekDates[0])} - ${formatDate(weekDates[6])}):\n`;
    weekDates.forEach(date => {
        const dateStr = formatDate(date);
        const dayName = date.toLocaleDateString('el-GR', { weekday: 'long' });
        const rawData = schedule[dateStr] || {};
        const isOpen = rawData.isOpen !== undefined ? rawData.isOpen : true;
        const start = rawData.start || '09:00';
        const end = rawData.end || '17:00';

        if (isOpen) {
            hoursString += `• ${dayName}: ${start} - ${end}\n`;
        } else {
            hoursString += `• ${dayName}: Κλειστά\n`;
        }
    });

    try {
      await fetch(`http://localhost:8000/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours: hoursString, availability: schedule })
      });
      const updatedUser = { ...user, hours: hoursString, availability: schedule };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccessMsg(true);
    } catch (error) {
      alert("Σφάλμα κατά την αποθήκευση.");
    }
  };

  const handleEditAppointment = (app) => {
      const tabIndex = app.status === 'pending' ? 0 : 1;
      navigate(`/vet-appointments?date=${app.date}&tab=${tabIndex}`);
  };

  if (loading) {
      return (
          <VetLayout>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                  <CircularProgress />
              </Box>
          </VetLayout>
      );
  }

  const currentData = getCurrentData();
  const dayApps = getDayAppointments();
  const locked = isPastDate();

  return (
    <VetLayout>
      <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
        
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 2, bgcolor: '#f5f5f5' }}>
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: '#2c3e50' }}>Διαχείριση Προγράμματος</Typography>
                    <Typography variant="body1" color="text.secondary">Ορίστε τις ώρες διαθεσιμότητας.</Typography>
                </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Paper elevation={0} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 1.5, 
                    border: (selectedDate === formatDate(new Date())) ? '2px solid #1976d2' : '1px solid #ddd', 
                    borderRadius: 2,
                    bgcolor: (selectedDate === formatDate(new Date())) ? '#f8fdff' : 'inherit'
                }}>
                    <CalendarMonthIcon sx={{ mr: 1, color: (selectedDate === formatDate(new Date())) ? '#1976d2' : 'action' }} />
                    <Box>
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ lineHeight: 1 }}>Επιλογή Εβδομάδας</Typography>
                        <input 
                            type="date" 
                            value={selectedDate} 
                            min={formatDate(minDate)} 
                            max={formatDate(maxDate)}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{ border: 'none', outline: 'none', fontSize: '1rem', fontFamily: 'inherit', color: '#333', cursor: 'pointer', backgroundColor: 'transparent' }}
                        />
                    </Box>
                </Paper>
            </Box>
        </Box>

        <Grid container spacing={3}>
            
            <Grid item xs={12} lg={8}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f8f9fa', borderBottom: 1, borderColor: 'divider', px: 1 }}>
                        <Tooltip title="Προηγούμενη Εβδομάδα">
                            <IconButton onClick={handlePrevWeek} size="large">
                                <ChevronLeftIcon />
                            </IconButton>
                        </Tooltip>

                        <Tabs 
                            value={selectedTab} 
                            onChange={handleTabChange} 
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{ flexGrow: 1 }}
                        >
                            {weekDates.map((date, index) => (
                                <Tab 
                                    key={index} 
                                    label={
                                        <Box sx={{ textAlign: 'center', py: 0.5, position: 'relative', minWidth: 40, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                                {date ? date.toLocaleDateString('el-GR', { weekday: 'short' }).toUpperCase() : ''}
                                            </Typography>
                                            <Typography variant="h6" sx={{ lineHeight: 1, fontWeight: 'bold' }}>
                                                {date ? date.getDate() : ''}
                                            </Typography>
                                            {date && isToday(date) && (
                                                <Box sx={{ width: 6, height: 6, bgcolor: '#1976d2', borderRadius: '50%', position: 'absolute', bottom: -5 }} />
                                            )}
                                        </Box>
                                    } 
                                />
                            ))}
                        </Tabs>

                        <Tooltip title="Επόμενη Εβδομάδα">
                            <IconButton onClick={handleNextWeek} size="large">
                                <ChevronRightIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <CardContent sx={{ p: 4 }}>
                        {locked && (
                            <Alert severity="warning" sx={{ mb: 3 }}>
                                Η ημερομηνία έχει περάσει. Το πρόγραμμα είναι κλειδωμένο.
                            </Alert>
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, bgcolor: currentData.isOpen ? '#e8f5e9' : '#ffebee', p: 2, borderRadius: 2, width: 'fit-content' }}>
                            <Switch 
                                checked={currentData.isOpen} 
                                onChange={(e) => updateSchedule('isOpen', e.target.checked)}
                                color={currentData.isOpen ? "success" : "error"}
                                disabled={locked}
                            />
                            <Typography variant="h6" fontWeight="bold" sx={{ ml: 1, color: currentData.isOpen ? 'green' : 'red' }}>
                                {currentData.isOpen ? 'Ανοιχτά' : 'Κλειστά'}
                            </Typography>
                        </Box>

                        {currentData.isOpen && (
                            <>
                                <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
                                    <Grid item xs={12} sm={5}>
                                        <TimeSelector 
                                            label="ΩΡΑ ΕΝΑΡΞΗΣ"
                                            value={currentData.start}
                                            onChange={(e) => updateSchedule('start', e.target.value)}
                                            disabled={locked}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={2} sx={{ textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                                        <ArrowForwardIcon sx={{ color: '#bdbdbd', fontSize: 24 }} />
                                    </Grid>
                                    <Grid item xs={12} sm={5}>
                                        <TimeSelector 
                                            label="ΩΡΑ ΛΗΞΗΣ"
                                            value={currentData.end}
                                            onChange={(e) => updateSchedule('end', e.target.value)}
                                            disabled={locked}
                                        />
                                    </Grid>
                                </Grid>

                                <Divider sx={{ my: 3 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <CoffeeIcon color="primary" sx={{ mr: 1 }} />
                                        <Typography variant="h6" fontWeight="bold">Διαλείμματα</Typography>
                                    </Box>
                                    <Button 
                                        startIcon={<AddCircleOutlineIcon />} 
                                        onClick={addBreak} 
                                        variant="outlined" 
                                        size="small"
                                        disabled={locked}
                                    >
                                        Προσθήκη
                                    </Button>
                                </Box>

                                <Stack spacing={2}>
                                    {currentData.breaks.length === 0 && (
                                        <Typography color="text.secondary" sx={{ fontStyle: 'italic', bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                                            Δεν υπάρχουν διαλείμματα.
                                        </Typography>
                                    )}

                                    {currentData.breaks.map((brk, idx) => (
                                        <Paper key={idx} elevation={0} sx={{ p: 2, bgcolor: '#fafafa', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item xs={1} sx={{ display: 'flex', justifyContent: 'center' }}>
                                                    <Typography variant="body1" fontWeight="bold" color="primary">{idx + 1}.</Typography>
                                                </Grid>
                                                
                                                <Grid item xs={5}>
                                                    <TimeSelector
                                                        label="ΕΝΑΡΞΗ"
                                                        value={brk.start}
                                                        onChange={(e) => updateBreak(idx, 'start', e.target.value)}
                                                        disabled={locked}
                                                    />
                                                </Grid>
                                                
                                                <Grid item xs={5}>
                                                    <TimeSelector
                                                        label="ΛΗΞΗ"
                                                        value={brk.end}
                                                        onChange={(e) => updateBreak(idx, 'end', e.target.value)}
                                                        disabled={locked}
                                                    />
                                                </Grid>

                                                <Grid item xs={1} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                    <IconButton color="error" onClick={() => removeBreak(idx)} disabled={locked}>
                                                        <DeleteOutlineIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    ))}
                                </Stack>
                            </>
                        )}
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} lg={4}>
                <Card sx={{ height: '100%', bgcolor: '#fff8e1', border: '1px solid #ffe0b2', boxShadow: 'none' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <EventAvailableIcon color="warning" sx={{ mr: 1 }} />
                            <Typography variant="h6" fontWeight="bold">Ραντεβού Ημέρας</Typography>
                        </Box>
                        
                        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                            {getActiveDateObj().toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </Typography>

                        {dayApps.length > 0 ? (
                            <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                                {dayApps.map((app) => (
                                    <Paper 
                                        key={app.id} 
                                        elevation={2} 
                                        onClick={() => handleEditAppointment(app)}
                                        sx={{ 
                                            mb: 2, p: 2, borderRadius: 2, 
                                            borderLeft: `4px solid ${app.status === 'confirmed' ? 'green' : 'orange'}`,
                                            cursor: 'pointer',
                                            transition: '0.2s',
                                            '&:hover': { transform: 'translateY(-2px)', boxShadow: 4, bgcolor: '#fff' }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography fontWeight="bold" variant="h6">{app.time}</Typography>
                                            <Chip 
                                                label={app.status === 'confirmed' ? 'Επιβεβαιωμένο' : 'Εκκρεμεί'} 
                                                color={app.status === 'confirmed' ? 'success' : 'warning'} 
                                                size="small" 
                                                sx={{ height: 20, fontSize: '0.7rem' }} 
                                            />
                                        </Box>
                                        
                                        <Typography variant="body1" fontWeight="500">
                                            {app.petName} {app.ownerName ? `(${app.ownerName})` : ''}
                                        </Typography>
                                        
                                        <Typography variant="caption" color="text.secondary" display="block">{app.details}</Typography>
                                        
                                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                            <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                                <EditIcon sx={{ fontSize: 14, mr: 0.5 }} /> Διαχείριση
                                            </Typography>
                                        </Box>
                                    </Paper>
                                ))}
                            </List>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 4, opacity: 0.6 }}>
                                <Typography variant="body2">Κανένα ραντεβού για σήμερα.</Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', position: 'sticky', bottom: 20, zIndex: 10 }}>
            <Button 
                variant="contained" 
                size="large" 
                startIcon={<SaveIcon />} 
                onClick={handleSave}
                disabled={locked}
                sx={{ 
                    px: 6, py: 1.5, 
                    fontWeight: 'bold', 
                    borderRadius: 10, 
                    boxShadow: '0 4px 20px rgba(25, 118, 210, 0.4)',
                    textTransform: 'none',
                    fontSize: '1.1rem'
                }}
            >
                Αποθήκευση Προγράμματος
            </Button>
        </Box>

        <Snackbar
            open={successMsg}
            autoHideDuration={3000}
            onClose={() => setSuccessMsg(false)}
            message="Το πρόγραμμα αποθηκεύτηκε επιτυχώς!"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            sx={{ bottom: { xs: 90, sm: 40 } }}
        />

      </Box>
    </VetLayout>
  );
};

export default VetHours;