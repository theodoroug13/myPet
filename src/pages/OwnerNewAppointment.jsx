import { useEffect, useMemo, useState } from "react";
import {
    Box, Typography, Paper, IconButton, Button, TextField, MenuItem, CircularProgress,
    Chip, Divider, Alert,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import OwnerLayout from "../components/OwnerLayout";
import { useAuth } from "../context/AuthContext";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const pad2 = (n) => String(n).padStart(2, "0");
const toISODate = (d) =>
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const greekDate = (iso) => {
    if (!iso) return "-";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
};

const timeToMinutes = (t) => {
    // "HH:MM"
    const [h, m] = (t || "00:00").split(":").map(Number);
    return h * 60 + m;
};

const minutesToTime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${pad2(h)}:${pad2(m)}`;
};

const isWithin = (x, start, end) => x >= start && x < end;

function generateSlots({ start, end, breaks = [], step = 30 }) {
    const startM = timeToMinutes(start);
    const endM = timeToMinutes(end);
    if (endM <= startM) return [];

    const breakRanges = (breaks || [])
        .filter((b) => b?.start && b?.end)
        .map((b) => [timeToMinutes(b.start), timeToMinutes(b.end)])
        .filter(([s, e]) => e > s);

    const slots = [];
    for (let t = startM; t + step <= endM; t += step) {
        const inBreak = breakRanges.some(([bs, be]) => isWithin(t, bs, be));
        if (!inBreak) slots.push(minutesToTime(t));
    }
    return slots;
}


export default function OwnerNewAppointment() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const initialPetId = searchParams.get("petId") || "";
    const initialVetId = searchParams.get("vetId") || "";

    const todayISO = useMemo(() => toISODate(new Date()), []);

    const [loading, setLoading] = useState(true);
    const [pets, setPets] = useState([]);
    const [vets, setVets] = useState([]);
    const [appointments, setAppointments] = useState([]);

    const [petId, setPetId] = useState(initialPetId);
    const [vetId, setVetId] = useState(initialVetId);

    const [date, setDate] = useState(todayISO);
    const [time, setTime] = useState("");

    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");

    const [saving, setSaving] = useState(false);

    const selectedPet = useMemo(
        () => pets.find((p) => p.id === petId),
        [pets, petId]
    );

    const preferredVetIds = useMemo(() => {
        if (!selectedPet) return [];

        const ids = [];
        if (selectedPet.registeredVetId) ids.push(String(selectedPet.registeredVetId));

        if (Array.isArray(selectedPet.linkedVetIds)) {
            ids.push(...selectedPet.linkedVetIds.map(String));
        }

        return Array.from(new Set(ids));
    }, [selectedPet]);

    const preferredVets = useMemo(() => {
        const set = new Set(preferredVetIds);
        return vets.filter((v) => set.has(String(v.id)));
    }, [vets, preferredVetIds]);
    useEffect(() => {
        if (initialVetId) return; // ήρθαμε με vetId, μην κάνεις auto-select
        if (preferredVets.length > 0) {
            const first = String(preferredVets[0].id);
            if (String(vetId) !== first) setVetId(first);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preferredVets, initialVetId]);



    const selectedVet = useMemo(
        () => vets.find((v) => v.id === vetId),
        [vets, vetId]
    );

    const availabilityForDate = useMemo(() => {
        if (!selectedVet?.availability) return null;
        return selectedVet.availability[date] || null;
    }, [selectedVet, date]);

    const occupiedTimes = useMemo(() => {
        if (!vetId || !date) return new Set();
        // Block anything NOT cancelled
        const occ = appointments
            .filter((a) => a.vetId == vetId && a.date === date && a.status !== "cancelled")
            .map((a) => a.time);
        return new Set(occ);
    }, [appointments, vetId, date]);

    const availableSlots = useMemo(() => {
        if (!availabilityForDate || availabilityForDate.isOpen !== true) return [];
        const base = generateSlots({
            start: availabilityForDate.start,
            end: availabilityForDate.end,
            breaks: availabilityForDate.breaks || [],
            step: 30,
        });

        // Remove occupied
        return base.filter((t) => !occupiedTimes.has(t));
    }, [availabilityForDate, occupiedTimes]);

    // Reset selected time if it becomes unavailable
    useEffect(() => {
        if (time && !availableSlots.includes(time)) setTime("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [availableSlots]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [petsRes, usersRes, appsRes] = await Promise.all([
                fetch("http://localhost:8000/pets"),
                fetch("http://localhost:8000/users"),
                fetch("http://localhost:8000/appointments"),
            ]);

            const petsData = await petsRes.json();
            const usersData = await usersRes.json();
            const appsData = await appsRes.json();

            const myPets = Array.isArray(petsData)
                ? petsData.filter((p) => p.ownerId == user.id)
                : [];

            const vetUsers = Array.isArray(usersData)
                ? usersData.filter((u) => u.role === "vet")
                : [];

            setPets(myPets);
            if (initialPetId && myPets.some((p) => p.id === initialPetId)) {
                setPetId(initialPetId);
            }

            setVets(vetUsers);
            setAppointments(Array.isArray(appsData) ? appsData : []);

            // Auto select first pet if none selected
            if (!petId && myPets.length > 0) setPetId(myPets[0].id);

            // Auto select first vet if none selected (and no vetId from query)
            if (!vetId && vetUsers.length > 0) setVetId(vetUsers[0].id);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (user) fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const canSubmit =
        !!selectedPet &&
        !!selectedVet &&
        !!date &&
        !!time &&
        reason.trim().length > 0 &&
        !saving;

    const handleSubmit = async () => {
        if (!canSubmit) return;

        setSaving(true);
        try {
            const payload = {
                vetId: selectedVet.id,
                ownerId: user.id,
                petName: selectedPet.name,
                microchip: selectedPet.microchip,
                details: details.trim() || reason.trim(),
                reason: reason.trim(),
                date,
                time,
                status: "pending",
            };

            const res = await fetch("http://localhost:8000/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to create appointment");

            // return to appointments view focused on that date, pending tab
            navigate(`/owner-appointments?tab=0&date=${date}`);
        } catch (e) {
            console.error(e);
            alert("Κάτι πήγε στραβά με την καταχώρηση. Δοκίμασε ξανά.");
        }
        setSaving(false);
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
                <IconButton onClick={() => navigate("/owner-appointments")}>
                    <ArrowBackIcon />
                </IconButton>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" fontWeight={800}>
                        Νέο Ραντεβού
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Διάλεξε κατοικίδιο, κτηνίατρο, ημερομηνία και διαθέσιμη ώρα.
                    </Typography>
                </Box>
            </Box>

            <Paper sx={{ p: 2, borderRadius: 3 }}>
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                                gap: 2,
                            }}
                        >
                            <TextField
                                select
                                label="Κατοικίδιο"
                                value={petId}
                                onChange={(e) => setPetId(e.target.value)}
                                fullWidth
                            >
                                {pets.map((p) => (
                                    <MenuItem key={p.id} value={p.id}>
                                        {p.name} — {p.microchip}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <Button variant="outlined" onClick={() => navigate("/owner-dashboard")}>
                                Διάλεξε νέο κτηνίατρο
                            </Button>

                            <TextField select label="Κτηνίατρος" value={vetId} onChange={(e) => setVetId(e.target.value)} fullWidth>
                                {preferredVets.length > 0 && (
                                    <MenuItem disabled value="">
                                        — Κτηνίατροι που είναι δηλωμένο το κατοικίδιο: —
                                    </MenuItem>
                                )}
                                {preferredVets.map((v) => (
                                    <MenuItem key={`pref-${v.id}`} value={v.id}>
                                        {v.fullName} {v.specialty ? `— ${v.specialty}` : ""}
                                    </MenuItem>
                                ))}
                            </TextField>


                            <TextField
                                type="date"
                                label="Ημερομηνία"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />

                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    Διαθεσιμότητα
                                </Typography>

                                {!selectedVet ? (
                                    <Alert severity="info">Διάλεξε κτηνίατρο.</Alert>
                                ) : !availabilityForDate ? (
                                    <Alert severity="warning">
                                        Δεν υπάρχουν δηλωμένες ώρες για {greekDate(date)}.
                                    </Alert>
                                ) : availabilityForDate.isOpen !== true ? (
                                    <Alert severity="warning">
                                        Ο κτηνίατρος είναι κλειστός στις {greekDate(date)}.
                                    </Alert>
                                ) : (
                                    <Alert severity="success">
                                        Ανοιχτά: {availabilityForDate.start}–{availabilityForDate.end}
                                        {availabilityForDate.breaks?.length
                                            ? ` (διάλειμμα: ${availabilityForDate.breaks
                                                .map((b) => `${b.start}-${b.end}`)
                                                .join(", ")})`
                                            : ""}
                                    </Alert>
                                )}
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                            Διάλεξε ώρα
                        </Typography>

                        {availabilityForDate?.isOpen === true && availableSlots.length === 0 ? (
                            <Alert severity="info">
                                Δεν υπάρχουν διαθέσιμα slots για αυτή την ημέρα (ίσως είναι γεμάτα).
                            </Alert>
                        ) : (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                                {availableSlots.map((t) => (
                                    <Chip
                                        key={t}
                                        label={t}
                                        clickable
                                        color={time === t ? "primary" : "default"}
                                        variant={time === t ? "filled" : "outlined"}
                                        onClick={() => setTime(t)}
                                    />
                                ))}
                            </Box>
                        )}

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                                gap: 2,
                            }}
                        >
                            <TextField
                                label="Λόγος επίσκεψης (απαραίτητο)"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                fullWidth
                            />
                            <TextField
                                label="Λεπτομέρειες (προαιρετικό)"
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                fullWidth
                            />
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 2,
                                mt: 3,
                            }}
                        >
                            <Button onClick={() => navigate("/owner-appointments")}>
                                Πίσω
                            </Button>
                            <Button
                                variant="contained"
                                disabled={!canSubmit}
                                onClick={handleSubmit}
                            >
                                {saving ? "Αποθήκευση..." : "Υποβολή Ραντεβού"}
                            </Button>
                        </Box>
                    </>
                )}
            </Paper>
        </OwnerLayout>
    );
}
