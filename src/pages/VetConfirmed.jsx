import { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

const VetConfirmed = ({ onBack }) => {
  const [appointments, setAppointments] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState(null); 

  const [openDialog, setOpenDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedApptId, setSelectedApptId] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      fetch('http://localhost:8000/appointments')
        .then(res => res.json())
        .then(data => {
          const myHistory = data.filter(app => 
            app.vetId === user.id && (app.status === 'confirmed' || app.status === 'completed')
          );
          setAppointments(myHistory);
        });
    }
  }, []);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    setSelectedDate(null);
  };

  const handleDateClick = (day) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const fullDate = `${year}-${month}-${dayStr}`;
    
    setSelectedDate(fullDate);
  };

  const handleDeleteClick = (id) => {
    setSelectedApptId(id);
    setOpenDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await fetch(`http://localhost:8000/appointments/${selectedApptId}`, { method: 'DELETE' });
      setAppointments(appointments.filter(app => app.id !== selectedApptId));
      setOpenDialog(false);
      setCancelReason('');
    } catch (error) {
      alert("Σφάλμα κατά τη διαγραφή");
    }
  };

  const dailyAppointments = appointments
    .filter(app => app.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayIndex = getFirstDayOfMonth(currentDate);
    const monthName = currentDate.toLocaleString('el-GR', { month: 'long', year: 'numeric' }).toUpperCase();
    const weekDays = ['ΚΥΡ', 'ΔΕΥ', 'ΤΡΙ', 'ΤΕΤ', 'ΠΕΜ', 'ΠΑΡ', 'ΣΑΒ'];
    
    const todayObj = new Date();
    const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

    const calendarCells = [];

    for (let i = 0; i < firstDayIndex; i++) {
        calendarCells.push(<Box key={`empty-${i}`} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const checkDate = `${year}-${month}-${dayStr}`;
        
        const hasAppointment = appointments.some(app => app.date === checkDate);
        const isSelected = selectedDate === checkDate;
        const isToday = checkDate === todayStr;
        
        calendarCells.push(
            <Box key={day} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <Box 
                    onClick={() => handleDateClick(day)}
                    sx={{
                        width: 40, height: 40, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        transition: '0.2s',
                        fontWeight: hasAppointment ? '900' : 'normal',
                        opacity: hasAppointment ? 1 : 0.4,
                        color: isSelected ? '#1976d2' : 'inherit',
                        border: isSelected ? '2px solid #1976d2' : '2px solid transparent',
                        bgcolor: 'transparent',
                        '&:hover': { bgcolor: '#f5f5f5', opacity: 1 }
                    }}
                >
                    {day}
                </Box>
                {isToday && (
                    <Box sx={{ width: 5, height: 5, bgcolor: '#d32f2f', borderRadius: '50%', mt: 0.5 }} />
                )}
            </Box>
        );
    }

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, px: 1 }}>
            <IconButton onClick={() => changeMonth(-1)}><ArrowBackIosIcon fontSize="small" /></IconButton>
            <Typography variant="h6" fontWeight="bold">{monthName}</Typography>
            <IconButton onClick={() => changeMonth(1)}><ArrowForwardIosIcon fontSize="small" /></IconButton>
        </Box>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 2, textAlign: 'center' }}>
            {weekDays.map((d) => (
                <Typography key={d} variant="caption" fontWeight="bold" color="text.secondary">
                    {d}
                </Typography>
            ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center' }}>
            {calendarCells}
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={selectedDate ? () => setSelectedDate(null) : onBack}>
            <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight="bold" sx={{ ml: 2 }}>
            {selectedDate ? `Ραντεβού: ${selectedDate.split('-').reverse().join('/')}` : 'Επιλογή Ημερομηνίας'}
        </Typography>
      </Box>

      {!selectedDate ? (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 450, margin: '0 auto', minHeight: 400 }}>
            {renderCalendar()}
        </Paper>
      ) : (
        <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell><b>Ιδιοκτήτης</b></TableCell>
                            <TableCell><b>Microchip</b></TableCell>
                            <TableCell><b>Λεπτομέρειες</b></TableCell>
                            <TableCell><b>Ώρα</b></TableCell>
                            <TableCell><b>Κατάσταση</b></TableCell>
                            <TableCell align="center"><b>Ενέργεια</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dailyAppointments.length > 0 ? (
                            dailyAppointments.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell>Ιδιοκτήτης (ID: {app.ownerId})</TableCell>
                                    <TableCell>{app.microchip}</TableCell>
                                    <TableCell>{app.details}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{app.time}</TableCell>
                                    
                                    <TableCell sx={{ 
                                        color: app.status === 'confirmed' ? 'green' : 'gray', 
                                        fontWeight: 'bold',
                                        fontStyle: app.status === 'completed' ? 'italic' : 'normal'
                                    }}>
                                        {app.status === 'confirmed' ? 'Επιβεβαιωμένο' : 'Ολοκληρώθηκε'}
                                    </TableCell>

                                    <TableCell align="center">
                                        {app.status === 'confirmed' && (
                                            <IconButton color="error" onClick={() => handleDeleteClick(app.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">Κανένα ραντεβού για αυτή τη μέρα.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'white' }}>Ακύρωση Ραντεβού</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
            <DialogContentText sx={{ mb: 2, fontWeight: 'bold' }}>
                Προσοχή: Η διαγραφή είναι οριστική.
            </DialogContentText>
            <TextField
                autoFocus
                margin="dense"
                label="Λόγος Ακύρωσης"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
            />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)} variant="outlined">Πίσω</Button>
            <Button onClick={confirmDelete} variant="contained" color="error">
                Οριστική Διαγραφή
            </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VetConfirmed;