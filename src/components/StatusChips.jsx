
import React from "react";
import { Chip } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

const STATUS_MAP = {
  draft: {
    label: "Πρόχειρο",
    color: "warning",
    icon: <EditOutlinedIcon />,
  },
  submitted: {
    label: "Υποβλήθηκε",
    color: "info",
    icon: <SendOutlinedIcon />,
  },
  pending: {
    label: "Εκκρεμές",
    color: "warning",
    icon: <HourglassEmptyOutlinedIcon />,
  },
  confirmed: {
    label: "Επιβεβαιωμένο",
    color: "success",
    icon: <CheckCircleOutlineOutlinedIcon />,
  },
  cancelled: {
    label: "Ακυρωμένο",
    color: "error",
    icon: <CancelOutlinedIcon />,
  },
};

export default function StatusChip({ status, size = "small", variant = "outlined", ...rest }) {
  const s = (status || "").toLowerCase();
  const cfg = STATUS_MAP[s];

  if (!cfg) {
    return <Chip label={status || "—"} size={size} variant={variant} {...rest} />;
  }

  return (
    <Chip
      label={cfg.label}
      color={cfg.color}
      icon={cfg.icon}
      size={size}
      variant={variant}
      {...rest}
    />
  );
}
