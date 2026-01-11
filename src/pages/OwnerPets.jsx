import { useEffect, useMemo, useState } from "react";
import { Box, Typography, Paper, TextField, MenuItem, Grid, Card, CardContent, CardActions, Button, Chip, CircularProgress, } from "@mui/material";
import { useNavigate } from "react-router-dom";

import OwnerLayout from "../components/OwnerLayout";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";

const greekDate = (iso) => {
    if (!iso) return "-";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
};

const petStatusChip = (status) => {
    switch (status) {
        case "approved":
            return <Chip size="small" color="success" label="Εγκεκριμένο" />;
        case "submitted":
            return <Chip size="small" color="warning" label="Σε εκκρεμότητα" />;
        case "rejected":
            return <Chip size="small" color="error" label="Απορρίφθηκε" />;
        default:
            return <Chip size="small" label={status || "-"} />;
    }
};

export default function OwnerPets() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [pets, setPets] = useState([]);

    const [q, setQ] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8000/pets");
            const data = await res.json();

            const myPets = Array.isArray(data)
                ? data.filter((p) => String(p.ownerId) === String(user.id))
                : [];

            // sort by name
            myPets.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
            setPets(myPets);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();

        return pets.filter((p) => {
            const matchesQ =
                !query ||
                (p.name || "").toLowerCase().includes(query) ||
                (p.microchip || "").toLowerCase().includes(query) ||
                (p.type || "").toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === "all" ? true : String(p.status) === statusFilter;

            return matchesQ && matchesStatus;
        });
    }, [pets, q, statusFilter]);

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
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 2, flexWrap: "wrap" }}>
                <Box>
                    <Typography variant="h4" fontWeight={900}>
                        Τα Κατοικίδιά μου
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Προβολή στοιχείων και βιβλιαρίου υγείας.
                    </Typography>
                </Box>
            </Box>

            <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
                        gap: 2,
                    }}
                >
                    <TextField
                        label="Αναζήτηση (όνομα, microchip, είδος)"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        fullWidth
                    />

                    <TextField
                        select
                        label="Φίλτρο κατάστασης"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="all">Όλα</MenuItem>
                        <MenuItem value="approved">Εγκεκριμένα</MenuItem>
                        <MenuItem value="submitted">Σε εκκρεμότητα</MenuItem>
                        <MenuItem value="rejected">Απορριφθέντα</MenuItem>
                    </TextField>
                </Box>
            </Paper>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : filtered.length === 0 ? (
                <EmptyState
                    title="Δεν υπάρχουν κατοικίδια"
                    description="Όταν ο κτηνίατρος καταχωρήσει το κατοικίδιό σου, θα εμφανιστεί εδώ."
                    actionLabel="Πίσω στο Dashboard"
                    onAction={() => navigate("/owner-dashboard")}
                />
            ) : (
                <Grid container spacing={2}>
                    {filtered.map((p) => (
                        <Grid item xs={12} md={6} lg={4} key={p.id}>
                            <Card sx={{ borderRadius: 3, height: "100%" }}>
                                <CardContent>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                                        <Typography variant="h6" fontWeight={800}>
                                            {p.name}
                                        </Typography>
                                        {petStatusChip(p.status)}
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        {p.type || "-"} • Microchip: {p.microchip || "-"}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        Γέννηση: {greekDate(p.birthDate)}
                                    </Typography>
                                </CardContent>

                                <CardActions sx={{ px: 2, pb: 2, gap: 1, flexWrap: "wrap" }}>
                                    <Button
                                        variant="contained"
                                        onClick={() => navigate("/owner-pets/" + p.id)}

                                    >
                                        Βιβλιάριο υγείας
                                    </Button>


                                    <Button
                                        variant="outlined"
                                        onClick={() =>
                                            navigate(
                                                `/owner-appointments/new?petId=${encodeURIComponent(p.id)}&vetId=${encodeURIComponent(
                                                    p.registeredVetId || ""
                                                )}`
                                            )
                                        }
                                    >
                                        Κλείσε ραντεβού
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </OwnerLayout>
    );
}
