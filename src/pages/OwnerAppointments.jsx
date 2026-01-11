import { useEffect, useMemo, useState } from "react";
import {
    Box, Typography, Paper, Tabs, Tab, Button, IconButton, Chip, CircularProgress, Tooltip, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Table,
    TableHead, TableRow, TableCell, TableBody, TableContainer, Switch, FormControlLabel,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";

import OwnerLayout from "../components/OwnerLayout";
import { useAuth } from "../context/AuthContext";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

const pad2 = (n) => String(n).padStart(2, "0");
const toISODate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const greekDate = (iso) => {
    if (!iso) return "-";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
};

const dayLabels = ["Δευ", "Τρι", "Τετ", "Πεμ", "Παρ", "Σαβ", "Κυρ"];

function calculateWeek(anchorISO) {
    const d = new Date(anchorISO + "T00:00:00");
    if (Number.isNaN(d.getTime())) return [];

    // Monday-based week
    const day = d.getDay(); // 0=Sun ... 6=Sat
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
}

function isPast(isoDate) {
    const today = new Date();
    const todayISO = toISODate(today);
    const a = new Date(isoDate + "T00:00:00");
    const b = new Date(todayISO + "T00:00:00");
    return a < b;
}

const statusChip = (status, date) => {
    // Αν έχει μείνει "confirmed" στο παρελθόν, το θεωρούμε ιστορικό
    if (status === "confirmed" && isPast(date)) {
        return <Chip size="small" icon={<DoneAllIcon />} label="Ολοκληρωμένο" color="success" />;
    }

    switch (status) {
        case "pending":
            return <Chip size="small" icon={<HourglassEmptyIcon />} label="Εκκρεμές" color="warning" />;
        case "confirmed":
            return <Chip size="small" icon={<CheckCircleIcon />} label="Επιβεβαιωμένο" color="success" />;
        case "completed":
            return <Chip size="small" icon={<DoneAllIcon />} label="Ολοκληρωμένο" color="success" />;
        case "cancelled":
            return <Chip size="small" icon={<EventBusyIcon />} label="Ακυρωμένο" color="error" />;
        default:
            return <Chip size="small" label={status || "-"} />;
    }
};

export default function OwnerAppointments() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [appointments, setAppointments] = useState([]);

    // 0 pending, 1 confirmed, 2 history
    const [mainTab, setMainTab] = useState(0);

    // schedule mode vs list mode (όπως στα vet)
    const [showSchedule, setShowSchedule] = useState(true);

    // week navigation
    const todayISO = useMemo(() => toISODate(new Date()), []);
    const [anchorDate, setAnchorDate] = useState(todayISO);
    const [weekDates, setWeekDates] = useState(() => calculateWeek(todayISO));
    const [dayTab, setDayTab] = useState(0);

    // cancel dialog
    const [dialog, setDialog] = useState({ open: false, id: null });

    // read query params (tab/date)
    useEffect(() => {
        const tabParam = searchParams.get("tab");
        const dateParam = searchParams.get("date");

        if (tabParam !== null && !Number.isNaN(Number(tabParam))) {
            setMainTab(Number(tabParam));
        }
        if (dateParam) {
            setAnchorDate(dateParam);
            setWeekDates(calculateWeek(dateParam));

            const d = new Date(dateParam + "T00:00:00");

            const jsDay = d.getDay(); // 0..6 (Sun..Sat)
            const mondayIdx = jsDay === 0 ? 6 : jsDay - 1;
            setDayTab(mondayIdx);
        }

    }, []);


    useEffect(() => {
        const params = {};
        params.tab = String(mainTab);
        if (anchorDate) params.date = anchorDate;
        setSearchParams(params, { replace: true });
    }, [mainTab, anchorDate, setSearchParams]);


    useEffect(() => {
        setWeekDates(calculateWeek(anchorDate));
        const d = new Date(anchorDate + "T00:00:00");
        if (!Number.isNaN(d.getTime())) {
            const jsDay = d.getDay();
            const mondayIdx = jsDay === 0 ? 6 : jsDay - 1;
            setDayTab(mondayIdx);
        }
    }, [anchorDate]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [appsRes, usersRes] = await Promise.all([
                fetch("http://localhost:8000/appointments"),
                fetch("http://localhost:8000/users"),
            ]);
            const apps = await appsRes.json();
            const users = await usersRes.json();

            const myApps = Array.isArray(apps)
                ? apps
                    .filter((a) => a.ownerId == user.id)
                    .map((a) => {
                        const vet = Array.isArray(users) ? users.find((u) => u.id == a.vetId) : null;
                        return {
                            ...a,
                            vetName: vet?.fullName ?? "-",
                            vetSpecialty: vet?.specialty ?? "",
                        };
                    })
                : [];

            myApps.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
            setAppointments(myApps);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (user) fetchData();

    }, [user]);

    const categorized = useMemo(() => {
        const pending = appointments.filter((a) => a.status === "pending");
        const confirmedUpcoming = appointments.filter((a) => a.status === "confirmed" && !isPast(a.date));
        const history = appointments.filter(
            (a) =>
                a.status === "completed" ||
                a.status === "cancelled" ||
                (a.status === "confirmed" && isPast(a.date))
        );
        return { pending, confirmedUpcoming, history };
    }, [appointments]);

    const activeISO = useMemo(() => {
        if (!weekDates?.length) return null;
        const d = weekDates[dayTab] ?? weekDates[0];
        return toISODate(d);
    }, [weekDates, dayTab]);

    const dataForTab = useMemo(() => {
        if (mainTab === 0) return categorized.pending;
        if (mainTab === 1) return categorized.confirmedUpcoming;
        return categorized.history;
    }, [mainTab, categorized]);

    const visible = useMemo(() => {
        if (!showSchedule) return dataForTab;
        if (!activeISO) return dataForTab;
        return dataForTab.filter((a) => a.date === activeISO);
    }, [showSchedule, dataForTab, activeISO]);

    const openCancel = (id) => setDialog({ open: true, id });
    const closeDialog = () => setDialog({ open: false, id: null });

    const confirmCancel = async () => {
        if (!dialog.id) return;
        await fetch(`http://localhost:8000/appointments/${dialog.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "cancelled" }),
        });
        closeDialog();
        fetchData();
    };

    if (!user) {
        return (
            <OwnerLayout>
                <Typography>Πρέπει να κάνεις login.</Typography>
            </OwnerLayout>
        );
    }

    if (user.role !== "owner") {
        return (
            <OwnerLayout>
                <Typography>Δεν έχεις πρόσβαση σε αυτή τη σελίδα.</Typography>
            </OwnerLayout>
        );
    }

    return (
        <OwnerLayout>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <IconButton onClick={() => navigate("/owner-dashboard")}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight={800}>
                    Τα Ραντεβού Μου
                </Typography>
            </Box>

            <Paper sx={{ p: 2, borderRadius: 3 }}>
                <Button
                    variant="contained"
                    onClick={() => navigate("/owner-appointments/new")}
                >
                    Νέο Ραντεβού
                </Button>

                <Tabs
                    value={mainTab}
                    onChange={(_, v) => setMainTab(v)}
                    sx={{ mb: 2 }}
                >
                    <Tab label={`Εκκρεμή (${categorized.pending.length})`} />
                    <Tab label={`Επιβεβαιωμένα (${categorized.confirmedUpcoming.length})`} />
                    <Tab label={`Ιστορικό (${categorized.history.length})`} />
                </Tabs>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", mb: 2 }}>
                    <FormControlLabel
                        control={<Switch checked={showSchedule} onChange={(e) => setShowSchedule(e.target.checked)} />}
                        label={showSchedule ? "Πρόγραμμα (ανά ημέρα)" : "Λίστα (όλα)"}
                    />

                    <TextField
                        type="date"
                        size="small"
                        label="Εβδομάδα γύρω από"
                        value={anchorDate}
                        onChange={(e) => setAnchorDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />

                    <Tooltip title="Καθαρισμός φίλτρου (σήμερα)">
                        <Button
                            variant="outlined"
                            startIcon={<FilterAltOffIcon />}
                            onClick={() => setAnchorDate(todayISO)}
                        >
                            Σήμερα
                        </Button>
                    </Tooltip>

                    {showSchedule && activeISO && (
                        <Chip
                            label={`Προβολή ημέρας: ${dayLabels[dayTab]} ${greekDate(activeISO)}`}
                            variant="outlined"
                        />
                    )}
                </Box>

                {showSchedule && (
                    <Tabs
                        value={dayTab}
                        onChange={(_, v) => setDayTab(v)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ mb: 2 }}
                    >
                        {weekDates.map((d, idx) => {
                            const iso = toISODate(d);
                            return <Tab key={iso} label={`${dayLabels[idx]} ${greekDate(iso)}`} />;
                        })}
                    </Tabs>
                )}

                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : visible.length === 0 ? (
                    <Box sx={{ p: 3 }}>
                        <Typography color="text.secondary">
                            Δεν υπάρχουν ραντεβού για αυτή την προβολή.
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><b>Ημ/νία</b></TableCell>
                                    <TableCell><b>Ώρα</b></TableCell>
                                    <TableCell><b>Ζώο</b></TableCell>
                                    <TableCell><b>Microchip</b></TableCell>
                                    <TableCell><b>Κτηνίατρος</b></TableCell>
                                    <TableCell><b>Λεπτομέρειες</b></TableCell>
                                    <TableCell><b>Status</b></TableCell>
                                    <TableCell align="right"><b>Ενέργειες</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {visible.map((a) => {
                                    const canCancel = a.status === "pending" || (a.status === "confirmed" && !isPast(a.date));
                                    return (
                                        <TableRow key={a.id}>
                                            <TableCell>{greekDate(a.date)}</TableCell>
                                            <TableCell>{a.time}</TableCell>
                                            <TableCell>{a.petName}</TableCell>
                                            <TableCell>{a.microchip}</TableCell>
                                            <TableCell>
                                                {a.vetName}
                                                {a.vetSpecialty ? (
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        {a.vetSpecialty}
                                                    </Typography>
                                                ) : null}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{a.details}</Typography>
                                                {a.reason ? (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {a.reason}
                                                    </Typography>
                                                ) : null}
                                            </TableCell>
                                            <TableCell>{statusChip(a.status, a.date)}</TableCell>
                                            <TableCell align="right">
                                                {canCancel ? (
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        variant="outlined"
                                                        startIcon={<CancelIcon />}
                                                        onClick={() => openCancel(a.id)}
                                                    >
                                                        Ακύρωση
                                                    </Button>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">
                                                        —
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            <Dialog open={dialog.open} onClose={closeDialog}>
                <DialogTitle>Ακύρωση ραντεβού</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Θέλεις σίγουρα να ακυρώσεις αυτό το ραντεβού; Η ενέργεια θα εμφανιστεί και στον κτηνίατρο.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Άκυρο</Button>
                    <Button color="error" variant="contained" onClick={confirmCancel}>
                        Ακύρωση
                    </Button>
                </DialogActions>
            </Dialog>
        </OwnerLayout>
    );
}
