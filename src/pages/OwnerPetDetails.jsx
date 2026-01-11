import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  IconButton,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import OwnerLayout from "../components/OwnerLayout";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";

const greekDate = (iso) => {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const isPast = (isoDate) => {
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;
  return new Date(isoDate + "T00:00:00") < new Date(todayISO + "T00:00:00");
};

const statusChip = (status, date) => {
  if (status === "confirmed" && date && isPast(date)) {
    return <Chip size="small" color="success" label="Ολοκληρωμένο" />;
  }
  switch (status) {
    case "pending":
      return <Chip size="small" color="warning" label="Εκκρεμές" />;
    case "confirmed":
      return <Chip size="small" color="success" label="Επιβεβαιωμένο" />;
    case "completed":
      return <Chip size="small" color="success" label="Ολοκληρωμένο" />;
    case "cancelled":
      return <Chip size="small" color="error" label="Ακυρωμένο" />;
    default:
      return <Chip size="small" label={status || "-"} />;
  }
};

export default function OwnerPetDetails() {
  const navigate = useNavigate();
  const params = useParams();
  const petId = params.petId ?? params.id;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [pet, setPet] = useState(null);
  const [vetsById, setVetsById] = useState({});
  const [appointments, setAppointments] = useState([]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [petRes, usersRes, appsRes] = await Promise.all([
        fetch(`http://localhost:8000/pets/${encodeURIComponent(petId)}`),
        fetch(`http://localhost:8000/users`),
        fetch(`http://localhost:8000/appointments`),
      ]);

      const petData = await petRes.json();
      const users = await usersRes.json();
      const apps = await appsRes.json();

      const vetMap = {};
      (Array.isArray(users) ? users : [])
        .filter((u) => u.role === "vet")
        .forEach((v) => {
          vetMap[String(v.id)] = v;
        });

      setPet(petData?.id ? petData : null);
      setVetsById(vetMap);

      const petMicro = petData?.microchip;
      const myApps = Array.isArray(apps)
        ? apps
            .filter((a) => String(a.ownerId) === String(user.id))
            .filter((a) => (petMicro ? a.microchip === petMicro : false))
            .map((a) => ({
              ...a,
              vetName: vetMap[String(a.vetId)]?.fullName || "-",
              vetSpecialty: vetMap[String(a.vetId)]?.specialty || "",
            }))
        : [];

      myApps.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
      setAppointments(myApps);
    } catch (e) {
      console.error(e);
      setPet(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user, petId]);

  const registeredVet = useMemo(() => {
    if (!pet?.registeredVetId) return null;
    return vetsById[String(pet.registeredVetId)] || null;
  }, [pet, vetsById]);

  const linkedVets = useMemo(() => {
    const ids = Array.isArray(pet?.linkedVetIds) ? pet.linkedVetIds : [];
    return ids.map((id) => vetsById[String(id)]).filter(Boolean);
  }, [pet, vetsById]);

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
        <Typography>Δεν έχεις πρόσβαση.</Typography>
      </OwnerLayout>
    );
  }

  if (loading) {
    return (
      <OwnerLayout>
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      </OwnerLayout>
    );
  }

  if (!pet || String(pet.ownerId) !== String(user.id)) {
    return (
      <OwnerLayout>
        <EmptyState
          title="Δεν βρέθηκε κατοικίδιο"
          description="Ίσως δεν υπάρχει ή δεν ανήκει στον λογαριασμό σου."
          actionLabel="Πίσω στα κατοικίδια"
          onAction={() => navigate("/owner-pets")}
        />
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <IconButton onClick={() => navigate("/owner-pets")}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight={900}>
            {pet.name}
          </Typography>
          <Typography color="text.secondary">
            {pet.type} • Microchip: {pet.microchip} • Γέννηση: {greekDate(pet.birthDate)}
          </Typography>
        </Box>

        <Button variant="outlined" onClick={() => window.print()}>
          Εκτύπωση
        </Button>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
          Κτηνίατρος & Σύνδεση
        </Typography>

        {registeredVet ? (
          <Box sx={{ mb: 1.5 }}>
            <Typography fontWeight={700}>{registeredVet.fullName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {registeredVet.specialty || ""} {registeredVet.address ? `• ${registeredVet.address}` : ""}
            </Typography>
          </Box>
        ) : (
          <Typography color="text.secondary" sx={{ mb: 1.5 }}>
            Δεν υπάρχει δηλωμένος “registered” κτηνίατρος.
          </Typography>
        )}

        {linkedVets.length > 0 ? (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {linkedVets.map((v) => (
              <Chip key={v.id} label={`${v.fullName}${v.specialty ? ` — ${v.specialty}` : ""}`} />
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">Δεν υπάρχουν άλλοι linked κτηνίατροι.</Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Button
          variant="contained"
          onClick={() =>
            navigate(
              `/owner-appointments/new?petId=${encodeURIComponent(pet.id)}&vetId=${encodeURIComponent(
                pet.registeredVetId || ""
              )}`
            )
          }
        >
          Κλείσε ραντεβού για {pet.name}
        </Button>
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
          Ιστορικό ραντεβού / “βιβλιάριο”
        </Typography>

        {appointments.length === 0 ? (
          <Typography color="text.secondary">Δεν υπάρχουν ραντεβού για αυτό το κατοικίδιο.</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>Ημ/νία</b></TableCell>
                  <TableCell><b>Ώρα</b></TableCell>
                  <TableCell><b>Κτηνίατρος</b></TableCell>
                  <TableCell><b>Λεπτομέρειες</b></TableCell>
                  <TableCell><b>Status</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{greekDate(a.date)}</TableCell>
                    <TableCell>{a.time}</TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </OwnerLayout>
  );
}
