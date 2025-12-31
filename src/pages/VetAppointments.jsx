import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, IconButton, Chip, Tabs, Tab, Alert, Card, CardContent, InputAdornment, Tooltip, CircularProgress,
  List, ListItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Switch, FormControlLabel
} from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom'; 
import VetLayout from '../components/VetLayout';
import { useAuth } from '../context/AuthContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import DeleteIcon from '@mui/icons-material/Delete'; 
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';

const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
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

const getStatusInfo = (app) => {
    const appDateTime = new Date(`${app.date}T${app.time}`);
    const now = new Date();
    const isPast = appDateTime < now;

    if (app.status === 'completed' || (app.status === 'confirmed' && isPast)) {
        return { label: 'Ολοκληρώθηκε', color: 'default', textColor: 'text.secondary', fontWeight: 'normal' };
    }

    if (app.status === 'confirmed') {
        return { label: 'Επιβεβαιωμένο', color: 'success', textColor: 'green', fontWeight: 'bold' };
    } 
    
    if (app.status === 'pending') {
        if (isPast) {
            return { label: 'Έληξε', color: 'error', textColor: 'error.main', fontWeight: 'bold' };
        }
        return { label: 'Εκκρεμεί', color: 'warning', textColor: 'warning.main', fontWeight: 'normal' };
    }

    return { label: '-', color: 'default', textColor: 'text.primary', fontWeight: 'normal' };
};

const VetAppointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mainTab, setMainTab] = useState(0); 
  
  const [showPendingTable, setShowPendingTable] = useState(true);
  const [showConfirmedTable, setShowConfirmedTable] = useState(true);
  
  const [showCompleted, setShowCompleted] = useState(false);

  const [pendingFilterDate, setPendingFilterDate] = useState(formatDate(new Date()));
  const [confirmedDate, setConfirmedDate] = useState(formatDate(new Date()));
  
  const [pendingWeekDates, setPendingWeekDates] = useState([]); 
  const [confirmedWeekDates, setConfirmedWeekDates] = useState([]); 
  const [pendingDayTab, setPendingDayTab] = useState(0);
  const [confirmedDayTab, setConfirmedDayTab] = useState(0);

  const [dialog, setDialog] = useState({ open: false, id: null, type: '' });

  useEffect(() => { if (user) fetchData(); }, [user]);

  useEffect(() => {
    const dateParam = searchParams.get('date');
    const tabParam = searchParams.get('tab');

    if (tabParam !== null) {
      setMainTab(Number(tabParam));
    }

    if (dateParam) {
      if (tabParam === '0') {
        setPendingFilterDate(dateParam);
        setShowPendingTable(true);
      } else {
        setConfirmedDate(dateParam);
        setShowConfirmedTable(true); 
      }
    }
  }, [searchParams]);

  const fetchData = async () => {
    setLoading(true);
    try {
        const [appsRes, usersRes] = await Promise.all([
            fetch('http://localhost:8000/appointments'),
            fetch('http://localhost:8000/users')
        ]);
        const apps = await appsRes.json();
        const users = await usersRes.json();

        if (Array.isArray(apps)) {
            const myApps = apps.filter(a => a.vetId == user.id && a.status !== 'cancelled').map(app => {
                const owner = users.find(u => u.id == app.ownerId); 
                return { 
                    ...app, 
                    ownerName: owner && owner.fullName ? owner.fullName : '-',
                    microchip: app.microchip || '-' 
                };
            });
            myApps.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
            setAppointments(myApps);
        }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleDialogAction = async () => {
    if (!dialog.id) return;
    await fetch(`http://localhost:8000/appointments/${dialog.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: dialog.type })
    });
    fetchData();
    setDialog({ open: false, id: null, type: '' });
  };

  const calculateWeek = (dateStr) => {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return [];
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d);
      monday.setDate(diff);
      const week = [];
      for (let i = 0; i < 7; i++) {
          const next = new Date(monday);
          next.setDate(monday.getDate() + i);
          week.push(next);
      }
      return week;
  };

  useEffect(() => {
      if (pendingFilterDate) {
          setPendingWeekDates(calculateWeek(pendingFilterDate));
          const d = new Date(pendingFilterDate);
          if (!isNaN(d.getTime())) setPendingDayTab(d.getDay() === 0 ? 6 : d.getDay() - 1);
      }
  }, [pendingFilterDate]);

  useEffect(() => {
      if (confirmedDate) {
          setConfirmedWeekDates(calculateWeek(confirmedDate));
          const d = new Date(confirmedDate);
          if (!isNaN(d.getTime())) setConfirmedDayTab(d.getDay() === 0 ? 6 : d.getDay() - 1);
      }
  }, [confirmedDate]);

  const changePendingWeek = (days) => {
      const d = new Date(pendingFilterDate);
      d.setDate(d.getDate() + days);
      setPendingFilterDate(formatDate(d));
  };

  const changeConfirmedWeek = (days) => {
      const d = new Date(confirmedDate);
      d.setDate(d.getDate() + days);
      setConfirmedDate(formatDate(d));
  };

  // --- ΔΕΔΟΜΕΝΑ & ΦΙΛΤΡΑ ---
  
  const pendingAppsList = appointments.filter(a => a.status === 'pending');
  
  const confirmedAppsList = appointments.filter(a => {
      // Υπολογισμός αν το ραντεβού είναι στο παρελθόν
      const appDateTime = new Date(`${a.date}T${a.time}`);
      const now = new Date();
      const isPast = appDateTime < now;

      // Ένα ραντεβού θεωρείται "ολοκληρωμένο" αν έχει status 'completed' 
      // Ή αν είναι 'confirmed' αλλά η ημερομηνία έχει περάσει
      const isEffectivelyCompleted = a.status === 'completed' || (a.status === 'confirmed' && isPast);

      if (showCompleted) {
          // Αν θέλουμε να δούμε τα ολοκληρωμένα, τα δείχνουμε όλα
          return a.status === 'confirmed' || a.status === 'completed';
      } else {
          // Αν ΔΕΝ θέλουμε τα ολοκληρωμένα, δείχνουμε ΜΟΝΟ τα confirmed που είναι στο ΜΕΛΛΟΝ
          return a.status === 'confirmed' && !isEffectivelyCompleted;
      }
  });
  
  const activePendingDate = pendingWeekDates[pendingDayTab] || new Date();
  const activePendingStr = formatDate(activePendingDate);
  const pendingAppsTable = appointments.filter(a => a.status === 'pending' && a.date === activePendingStr);

  const activeConfirmedDate = confirmedWeekDates[confirmedDayTab] || new Date();
  const activeConfirmedStr = formatDate(activeConfirmedDate);
  const confirmedAppsTable = appointments.filter(a => (a.status === 'confirmed' || a.status === 'completed') && a.date === activeConfirmedStr);

  const WeekBar = ({ weekDates, activeTab, onChangeTab, onPrev, onNext }) => (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8f9fa', px: 1, borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
          <IconButton onClick={onPrev}><ChevronLeftIcon /></IconButton>
          <Tabs value={activeTab} onChange={onChangeTab} variant="scrollable" scrollButtons="auto">
              {weekDates.map((d, i) => (
                  <Tab key={i} label={
                      <Box sx={{ 
                          textAlign: 'center', px: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', minWidth: 40
                      }}>
                          <Typography variant="caption" display="block" fontWeight="bold">
                            {d.toLocaleDateString('el-GR', { weekday: 'short' }).toUpperCase()}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: isToday(d) ? 'bold' : 'normal' }}>
                            {d.getDate()}
                          </Typography>
                          {isToday(d) && (
                            <Box sx={{ width: 6, height: 6, bgcolor: '#1976d2', borderRadius: '50%', position: 'absolute', bottom: -4 }} />
                          )}
                      </Box>
                  } />
              ))}
          </Tabs>
          <IconButton onClick={onNext}><ChevronRightIcon /></IconButton>
      </Box>
  );

  return (
    <VetLayout>
      <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ mr: 1, bgcolor: '#f5f5f5' }}>
                <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" fontWeight="bold">Διαχείριση Ραντεβού</Typography>
        </Box>

        <Tabs value={mainTab} onChange={(e, v) => setMainTab(v)} centered sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Tab icon={<HourglassEmptyIcon />} label="ΕΚΚΡΕΜΗ" sx={{ fontWeight: 'bold' }} />
            <Tab icon={<EventAvailableIcon />} label="ΕΠΙΒΕΒΑΙΩΜΕΝΑ" sx={{ fontWeight: 'bold' }} />
        </Tabs>

        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box> : (
            <>
            {/* --- TAB ΕΚΚΡΕΜΗ --- */}
            {mainTab === 0 && (
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold">
                            {showPendingTable ? 'Πρόγραμμα Εκκρεμών' : 'Όλα τα Εκκρεμή'}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Button 
                                startIcon={showPendingTable ? <ListAltIcon /> : <ViewWeekIcon />}
                                variant="outlined" size="small"
                                onClick={() => setShowPendingTable(!showPendingTable)}
                            >
                                {showPendingTable ? 'Προβολή Λίστας' : 'Προβολή Πίνακα'}
                            </Button>

                            {showPendingTable && (
                                <Paper elevation={0} sx={{ 
                                    p: 1, border: (pendingFilterDate === formatDate(new Date())) ? '2px solid #1976d2' : '1px solid #ddd', 
                                    borderRadius: 2, display: 'flex', alignItems: 'center', bgcolor: (pendingFilterDate === formatDate(new Date())) ? '#e3f2fd' : 'inherit'
                                }}>
                                    <CalendarMonthIcon sx={{ mr: 1, color: (pendingFilterDate === formatDate(new Date())) ? '#1976d2' : 'action' }} />
                                    <input type="date" value={pendingFilterDate} onChange={(e) => setPendingFilterDate(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '1rem', cursor: 'pointer', backgroundColor: 'transparent' }} />
                                </Paper>
                            )}
                        </Box>
                    </Box>

                    {showPendingTable ? (
                        <Card sx={{ borderRadius: 3 }}>
                            <WeekBar 
                                weekDates={pendingWeekDates} activeTab={pendingDayTab} 
                                onChangeTab={(e, v) => { setPendingDayTab(v); setPendingFilterDate(formatDate(pendingWeekDates[v])); }}
                                onPrev={() => changePendingWeek(-7)} onNext={() => changePendingWeek(7)} 
                            />
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#2c3e50' }}>
                                    {activePendingDate.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </Typography>
                                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                                    <Table sx={{ minWidth: 700 }}>
                                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableRow>
                                                <TableCell><strong>Ιδιοκτήτης</strong></TableCell>
                                                <TableCell><strong>Κατοικίδιο</strong></TableCell>
                                                <TableCell><strong>Λεπτομέρειες</strong></TableCell>
                                                <TableCell><strong>Ημ/νία & Ώρα</strong></TableCell>
                                                <TableCell align="center"><strong>Ενέργειες</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {pendingAppsTable.length === 0 ? (
                                                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>Δεν υπάρχουν εκκρεμή ραντεβού για αυτή την ημέρα.</TableCell></TableRow>
                                            ) : pendingAppsTable.map(app => {
                                                const statusInfo = getStatusInfo(app);
                                                return (
                                                    <TableRow key={app.id} hover>
                                                        <TableCell>{app.ownerName}</TableCell>
                                                        <TableCell><Typography variant="body2" fontWeight="bold">{app.petName}</Typography><Typography variant="caption">{app.microchip}</Typography></TableCell>
                                                        <TableCell>{app.details || app.reason}</TableCell>
                                                        <TableCell><Typography variant="body2" fontWeight="bold">{app.date}</Typography><Typography variant="caption">{app.time}</Typography></TableCell>
                                                        <TableCell align="center">
                                                            {statusInfo.label === 'Έληξε' ? <Chip label="Έληξε" color="error" variant="outlined" size="small" /> : (
                                                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                                    <Tooltip title="Αποδοχή"><IconButton onClick={() => setDialog({ open: true, id: app.id, type: 'confirmed' })} color="success" sx={{ bgcolor: '#e8f5e9' }}><CheckCircleIcon /></IconButton></Tooltip>
                                                                    <Tooltip title="Απόρριψη"><IconButton onClick={() => setDialog({ open: true, id: app.id, type: 'cancelled' })} color="error" sx={{ bgcolor: '#ffebee' }}><CancelIcon /></IconButton></Tooltip>
                                                                </Box>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    ) : (
                        <List>
                            {pendingAppsList.length === 0 ? <Alert severity="info">Δεν υπάρχουν εκκρεμή ραντεβού.</Alert> : pendingAppsList.map(app => {
                                const statusInfo = getStatusInfo(app);
                                return (
                                    <Paper key={app.id} elevation={2} sx={{ mb: 2, p: 2, borderLeft: `6px solid ${statusInfo.label === 'Έληξε' ? 'red' : '#ed6c02'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography fontWeight="bold" variant="h6" onClick={() => { setPendingFilterDate(app.date); setShowPendingTable(true); }} sx={{ cursor: 'pointer', '&:hover': { color: '#ed6c02', textDecoration: 'underline' }, width: 'fit-content' }}>{app.date} - {app.time}</Typography>
                                            <Typography fontWeight="500">{app.petName} ({app.ownerName})</Typography>
                                            <Typography variant="body2">{app.details}</Typography>
                                            <Chip label={statusInfo.label} size="small" color={statusInfo.color} sx={{ mt: 1 }} />
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {statusInfo.label !== 'Έληξε' && (
                                                <><Button variant="contained" color="success" onClick={() => setDialog({ open: true, id: app.id, type: 'confirmed' })}>ΑΠΟΔΟΧΗ</Button><Button variant="outlined" color="error" onClick={() => setDialog({ open: true, id: app.id, type: 'cancelled' })}>ΑΠΟΡΡΙΨΗ</Button></>
                                            )}
                                        </Box>
                                    </Paper>
                                );
                            })}
                        </List>
                    )}
                </Box>
            )}

            {/* --- TAB ΕΠΙΒΕΒΑΙΩΜΕΝΑ --- */}
            {mainTab === 1 && (
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold">
                            {showConfirmedTable ? 'Πρόγραμμα Επιβεβαιωμένων' : 'Όλα τα Επιβεβαιωμένα'}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            {!showConfirmedTable && (
                                <FormControlLabel
                                    control={<Switch checked={showCompleted} onChange={(e) => setShowCompleted(e.target.checked)} />}
                                    label="Εμφάνιση Ολοκληρωμένων"
                                    sx={{ mr: 2 }}
                                />
                            )}

                            <Button 
                                startIcon={showConfirmedTable ? <ListAltIcon /> : <ViewWeekIcon />}
                                variant="outlined" size="small"
                                onClick={() => setShowConfirmedTable(!showConfirmedTable)}
                            >
                                {showConfirmedTable ? 'Προβολή Λίστας' : 'Προβολή Πίνακα'}
                            </Button>

                            {showConfirmedTable && (
                                <Paper elevation={0} sx={{ 
                                    p: 1, border: (confirmedDate === formatDate(new Date())) ? '2px solid #1976d2' : '1px solid #ddd', 
                                    borderRadius: 2, display: 'flex', alignItems: 'center', bgcolor: (confirmedDate === formatDate(new Date())) ? '#e3f2fd' : 'inherit'
                                }}>
                                    <CalendarMonthIcon sx={{ mr: 1, color: (confirmedDate === formatDate(new Date())) ? '#1976d2' : 'action' }} />
                                    <input type="date" value={confirmedDate} onChange={(e) => setConfirmedDate(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '1rem', cursor: 'pointer', backgroundColor: 'transparent' }} />
                                </Paper>
                            )}
                        </Box>
                    </Box>

                    {showConfirmedTable ? (
                        <Card sx={{ borderRadius: 3 }}>
                            <WeekBar 
                                weekDates={confirmedWeekDates} activeTab={confirmedDayTab} 
                                onChangeTab={(e, v) => { setConfirmedDayTab(v); setConfirmedDate(formatDate(confirmedWeekDates[v])); }}
                                onPrev={() => changeConfirmedWeek(-7)} onNext={() => changeConfirmedWeek(7)} 
                            />
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#2c3e50' }}>
                                    {activeConfirmedDate.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </Typography>
                                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                                    <Table sx={{ minWidth: 700 }}>
                                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableRow>
                                                <TableCell><strong>Ιδιοκτήτης</strong></TableCell>
                                                <TableCell><strong>Κατοικίδιο</strong></TableCell>
                                                <TableCell><strong>Λεπτομέρειες</strong></TableCell>
                                                <TableCell><strong>Ημ/νία & Ώρα</strong></TableCell>
                                                <TableCell align="center"><strong>Κατάσταση</strong></TableCell>
                                                <TableCell align="center"><strong>Ενέργειες</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {confirmedAppsTable.length === 0 ? (
                                                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>Κανένα ραντεβού για αυτή την ημέρα.</TableCell></TableRow>
                                            ) : confirmedAppsTable.map(app => {
                                                const statusInfo = getStatusInfo(app);
                                                return (
                                                    <TableRow key={app.id} hover>
                                                        <TableCell>{app.ownerName}</TableCell>
                                                        <TableCell><Typography variant="body2" fontWeight="bold">{app.petName}</Typography><Typography variant="caption">{app.microchip}</Typography></TableCell>
                                                        <TableCell>{app.details}</TableCell>
                                                        <TableCell><Typography variant="body2" fontWeight="bold">{app.date}</Typography><Typography variant="caption">{app.time}</Typography></TableCell>
                                                        <TableCell align="center" sx={{ color: statusInfo.textColor, fontWeight: statusInfo.fontWeight }}>{statusInfo.label}</TableCell>
                                                        <TableCell align="center">
                                                            <Tooltip title="Διαγραφή"><IconButton onClick={() => setDialog({ open: true, id: app.id, type: 'cancelled' })} sx={{ bgcolor: '#333', color: '#fff', '&:hover': { bgcolor: 'black' }, borderRadius: 1 }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    ) : (
                        <List>
                            {confirmedAppsList.length === 0 ? <Alert severity="info">Δεν υπάρχουν επιβεβαιωμένα ραντεβού.</Alert> : confirmedAppsList.map(app => {
                                const statusInfo = getStatusInfo(app);
                                return (
                                    <Paper key={app.id} elevation={2} sx={{ mb: 2, p: 2, borderLeft: `6px solid ${statusInfo.label === 'Ολοκληρώθηκε' ? 'grey' : 'green'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography fontWeight="bold" variant="h6" onClick={() => { setConfirmedDate(app.date); setShowConfirmedTable(true); }} sx={{ cursor: 'pointer', '&:hover': { color: 'green', textDecoration: 'underline' } }}>{app.date} - {app.time}</Typography>
                                            <Typography fontWeight="500">{app.petName} ({app.ownerName})</Typography>
                                            <Typography variant="body2">{app.details}</Typography>
                                            <Chip label={statusInfo.label} size="small" sx={{ mt: 1, bgcolor: statusInfo.label === 'Ολοκληρώθηκε' ? '#e0e0e0' : '#e8f5e9', color: statusInfo.label === 'Ολοκληρώθηκε' ? 'text.secondary' : 'green', fontWeight: 'bold' }} />
                                        </Box>
                                        <Tooltip title="Διαγραφή">
                                            <IconButton onClick={() => setDialog({ open: true, id: app.id, type: 'cancelled' })} sx={{ bgcolor: '#333', color: '#fff', '&:hover': { bgcolor: 'black' }, borderRadius: 1 }}><DeleteIcon /></IconButton>
                                        </Tooltip>
                                    </Paper>
                                );
                            })}
                        </List>
                    )}
                </Box>
            )}
            </>
        )}

        <Dialog open={dialog.open} onClose={() => setDialog({ ...dialog, open: false })}>
            <DialogTitle>{dialog.type === 'cancelled' ? 'Ακύρωση' : 'Επιβεβαίωση'}</DialogTitle>
            <DialogContent><DialogContentText>{dialog.type === 'cancelled' ? 'Είστε σίγουρος ότι θέλετε να ακυρώσετε/διαγράψετε αυτό το ραντεβού;' : 'Είστε σίγουρος ότι θέλετε να αποδεχτείτε αυτό το ραντεβού;'}</DialogContentText></DialogContent>
            <DialogActions>
                <Button onClick={() => setDialog({ ...dialog, open: false })}>OXI</Button>
                <Button onClick={handleDialogAction} variant="contained" color={dialog.type === 'cancelled' ? 'error' : 'success'}>NAI</Button>
            </DialogActions>
        </Dialog>
      </Box>
    </VetLayout>
  );
};

export default VetAppointments;