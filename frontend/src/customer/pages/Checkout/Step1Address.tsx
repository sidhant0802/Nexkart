import { useState } from "react";
import { motion } from "framer-motion";
import { Button, TextField, Radio, CircularProgress, Snackbar, Alert } from "@mui/material";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HomeIcon from "@mui/icons-material/Home";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from "../../../routes/CustomerRoutes";
import { useAppDispatch } from "../../../Redux Toolkit/Store";
import { addAddress, deleteAddress } from "../../../Redux Toolkit/Customer/UserSlice";

interface Props {
  user:            any;
  selectedAddr:    any;
  setSelectedAddr: (a: any) => void;
  onNext:          () => void;
}

const Step1Address = ({ user, selectedAddr, setSelectedAddr, onNext }: Props) => {
  const { isDark } = useTheme();
  const dispatch   = useAppDispatch();

  const c = {
    text:     isDark ? "#f1f5f9" : "#0f172a",
    textSec:  isDark ? "#cbd5e1" : "#475569",
    textMute: isDark ? "#94a3b8" : "#64748b",
    bgCard:   isDark ? "#13131a" : "#ffffff",
    bgInner:  isDark ? "#1a1a24" : "#f9fafb",
    border:   isDark ? "#1f1f2e" : "#e5e7eb",
    accent:   "#6366f1",
    accentBg: isDark ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.06)",
    danger:   "#ef4444",
  };

  const [showForm,       setShowForm]       = useState(!user?.addresses?.length);
  const [savingAddress,  setSavingAddress]  = useState(false);
  const [deletingId,     setDeletingId]     = useState<string | null>(null);
  const [toast,          setToast]          = useState<{ open: boolean; msg: string; type: "success"|"error" }>({
    open: false, msg: "", type: "success",
  });

  const [form, setForm] = useState({
    name:     user?.fullName || "",
    mobile:   user?.mobile   || "",
    address:  "",
    locality: "",
    city:     "",
    state:    "",
    pinCode:  "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Validate form ──
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())    e.name    = "Name is required";
    if (!form.mobile.trim())  e.mobile  = "Mobile is required";
    else if (!/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = "Enter valid 10-digit mobile";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim())    e.city    = "City is required";
    if (!form.state.trim())   e.state   = "State is required";
    if (!form.pinCode.trim()) e.pinCode = "PIN code is required";
    else if (!/^\d{6}$/.test(form.pinCode)) e.pinCode = "Enter valid 6-digit PIN";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Save address to DB then continue ──
  const handleAddNew = async () => {
    if (!validate()) return;

    setSavingAddress(true);
    try {
      const updatedUser: any = await dispatch(addAddress({
        name:     form.name.trim(),
        mobile:   form.mobile.trim(),
        address:  form.address.trim(),
        locality: form.locality.trim() || form.city.trim(),
        city:     form.city.trim(),
        state:    form.state.trim(),
        pinCode:  form.pinCode.trim(),
      })).unwrap();

      // ✅ Pick the newly saved address (last one)
      const savedAddresses = updatedUser?.addresses || [];
      const newAddr = savedAddresses[savedAddresses.length - 1];
      setSelectedAddr(newAddr || form);

      setToast({ open: true, msg: "Address saved successfully!", type: "success" });
      setShowForm(false);

      // Small delay so user sees the saved address selected
      setTimeout(() => onNext(), 400);

    } catch (err: any) {
      console.error("Address save failed:", err);
      setToast({ open: true, msg: "Could not save address. Continuing anyway.", type: "error" });
      // ✅ Still proceed with local form data
      setSelectedAddr(form);
      setTimeout(() => onNext(), 400);
    } finally {
      setSavingAddress(false);
    }
  };

  // ── Delete saved address ──
  const handleDelete = async (e: React.MouseEvent, addrId: string) => {
    e.stopPropagation();
    if (!window.confirm("Remove this address?")) return;

    setDeletingId(addrId);
    try {
      await dispatch(deleteAddress(addrId)).unwrap();
      if (selectedAddr?._id === addrId) setSelectedAddr(null);
      setToast({ open: true, msg: "Address removed", type: "success" });
    } catch {
      setToast({ open: true, msg: "Could not delete address", type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleContinue = () => {
    if (!selectedAddr) {
      setToast({ open: true, msg: "Please select a delivery address", type: "error" });
      return;
    }
    onNext();
  };

  // ── Field helper ──
  const Field = ({
    label, field, span = false, multiline = false,
  }: {
    label: string; field: keyof typeof form; span?: boolean; multiline?: boolean;
  }) => (
    <TextField
      label={label}
      value={form[field]}
      onChange={(e) => {
        setForm({ ...form, [field]: e.target.value });
        if (errors[field]) setErrors({ ...errors, [field]: "" });
      }}
      fullWidth
      size="small"
      required
      multiline={multiline}
      rows={multiline ? 2 : 1}
      error={!!errors[field]}
      helperText={errors[field]}
      sx={{
        gridColumn: span ? "1/-1" : undefined,
        "& .MuiOutlinedInput-root": {
          color: c.text,
          "& fieldset":         { borderColor: c.border },
          "&:hover fieldset":   { borderColor: c.accent },
          "&.Mui-focused fieldset": { borderColor: c.accent },
        },
        "& .MuiInputLabel-root":          { color: c.textMute },
        "& .MuiInputLabel-root.Mui-focused": { color: c.accent },
        "& .MuiFormHelperText-root": { color: c.danger },
      }}
    />
  );

  return (
    <div style={{
      background: c.bgCard,
      borderRadius: 16,
      padding: 24,
      border: `1px solid ${c.border}`,
    }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <LocationOnIcon sx={{ color: c.accent, fontSize: 24 }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: c.text, margin: 0 }}>
          Delivery Address
        </h2>
      </div>

      {/* ── Saved Addresses ── */}
      {user?.addresses?.length > 0 && !showForm && (
        <div style={{ marginBottom: 16 }}>
          <p style={{
            fontSize: 11, color: c.textMute, marginBottom: 12,
            fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5,
          }}>
            Saved Addresses ({user.addresses.length})
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {user.addresses.map((addr: any, i: number) => {
              const isSelected = selectedAddr?._id === addr._id;
              const isDeleting = deletingId === addr._id;

              return (
                <motion.div
                  key={addr._id || i}
                  whileHover={{ scale: 1.005 }}
                  onClick={() => !isDeleting && setSelectedAddr(addr)}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    border: `2px solid ${isSelected ? c.accent : c.border}`,
                    background: isSelected ? c.accentBg : c.bgInner,
                    cursor: isDeleting ? "default" : "pointer",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    transition: "all 0.15s",
                    opacity: isDeleting ? 0.5 : 1,
                    position: "relative",
                  }}
                >
                  <Radio
                    checked={isSelected}
                    onChange={() => setSelectedAddr(addr)}
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      p: 0, mt: 0.3,
                      color: c.accent,
                      "&.Mui-checked": { color: c.accent },
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <HomeIcon sx={{ fontSize: 14, color: c.accent }} />
                      <p style={{ fontSize: 14, fontWeight: 700, color: c.text, margin: 0 }}>
                        {addr.name}
                      </p>
                      {isSelected && (
                        <span style={{
                          fontSize: 9, fontWeight: 800, color: c.accent,
                          background: c.accentBg, padding: "2px 6px",
                          borderRadius: 4, letterSpacing: 1,
                        }}>
                          SELECTED
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: c.textSec, margin: "0 0 4px", lineHeight: 1.6 }}>
                      {addr.address}
                      {addr.locality ? `, ${addr.locality}` : ""},
                      {addr.city}, {addr.state} - {addr.pinCode}
                    </p>
                    <p style={{ fontSize: 12, color: c.textMute, margin: 0 }}>
                      📞 {addr.mobile}
                    </p>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(e, addr._id)}
                    disabled={isDeleting}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: c.danger,
                      padding: 4,
                      borderRadius: 6,
                      opacity: isDeleting ? 0.5 : 1,
                      flexShrink: 0,
                    }}
                    title="Remove address"
                  >
                    {isDeleting
                      ? <CircularProgress size={14} sx={{ color: c.danger }} />
                      : <DeleteIcon fontSize="small" />}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Add new button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            onClick={() => setShowForm(true)}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "12px",
              borderRadius: 10,
              border: `2px dashed ${c.border}`,
              background: "transparent",
              color: c.accent,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <AddLocationAltIcon fontSize="small" />
            Add new address
          </motion.button>
        </div>
      )}

      {/* ── New Address Form ── */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div style={{
            padding: 20,
            background: c.bgInner,
            borderRadius: 12,
            border: `1px solid ${c.border}`,
          }}>
            <p style={{
              fontSize: 13, fontWeight: 700, color: c.text,
              margin: "0 0 16px", display: "flex", alignItems: "center", gap: 6,
            }}>
              <AddLocationAltIcon fontSize="small" sx={{ color: c.accent }} />
              Add New Delivery Address
            </p>

            <div style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            }}>
              <Field label="Full Name"      field="name"   />
              <Field label="Mobile Number"  field="mobile" />
              <Field label="House No / Street / Area" field="address" span multiline />
              <Field label="Locality / Town (optional)" field="locality" span />
              <Field label="City"    field="city"    />
              <Field label="State"   field="state"   />
              <Field label="PIN Code" field="pinCode" span />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              {user?.addresses?.length > 0 && (
                <Button
                  onClick={() => { setShowForm(false); setErrors({}); }}
                  disabled={savingAddress}
                  variant="outlined"
                  sx={{
                    flex: 1,
                    textTransform: "none",
                    fontWeight: 600,
                    borderColor: c.border,
                    color: c.textSec,
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button
                onClick={handleAddNew}
                disabled={savingAddress}
                variant="contained"
                sx={{
                  flex: 2,
                  py: 1.3,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 14,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                  "&:hover": { background: "linear-gradient(135deg, #4f46e5, #7c3aed)" },
                }}
              >
                {savingAddress
                  ? <><CircularProgress size={16} sx={{ color: "#fff", mr: 1 }} /> Saving...</>
                  : "Save & Continue →"}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Continue with selected address ── */}
      {!showForm && user?.addresses?.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}
        >
          <Button
            onClick={handleContinue}
            disabled={!selectedAddr}
            variant="contained"
            sx={{
              minWidth: 220,
              py: 1.4,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 14,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow: "0 6px 18px rgba(99,102,241,0.4)",
              "&:hover": { background: "linear-gradient(135deg, #4f46e5, #7c3aed)" },
              "&.Mui-disabled": { opacity: 0.45 },
            }}
          >
            Continue to Review →
          </Button>
        </motion.div>
      )}

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.type} onClose={() => setToast({ ...toast, open: false })}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Step1Address;