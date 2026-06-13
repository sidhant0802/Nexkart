import { useEffect, useState } from "react";
import { useAppSelector } from "../../../Redux Toolkit/Store";
import {
  Alert, Dialog, DialogContent, DialogTitle, IconButton, Snackbar, Avatar,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  User, Building2, MapPin, Banknote, Edit3, X,
  Phone, Mail, CheckCircle, Shield, Hash, CreditCard,
} from "lucide-react";
import PersonalDetailsForm from "./PersionalDetailsForm";
import BusinessDetailsForm from "./BussinessDetailsForm";
import PickupAddressForm from "./PickupAddressForm";
import BankDetailsForm from "./BankDetailsForm";
import { useAdminTheme } from "../../../admin/context/AdminThemeContext";

const Profile = () => {
  const { sellers } = useAppSelector((store) => store);
  const { isDark } = useAdminTheme();

  const [open, setOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState("personalDetails");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleOpen = (formName: string) => {
    setSelectedForm(formName);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  useEffect(() => {
    if (sellers.profileUpdated || sellers.error) setSnackbarOpen(true);
  }, [sellers.profileUpdated, sellers.error]);

  const renderForm = () => {
    switch (selectedForm) {
      case "personalDetails": return <PersonalDetailsForm onClose={handleClose} />;
      case "businessDetails": return <BusinessDetailsForm onClose={handleClose} />;
      case "pickupAddress":   return <PickupAddressForm onClose={handleClose} />;
      case "bankDetails":     return <BankDetailsForm onClose={handleClose} />;
      default: return null;
    }
  };

  const profile = sellers.profile;
  const addr    = profile?.pickupAddress;

  // ── Theme colors ──
  const c = {
    bg:       isDark ? "#0a0a0f" : "#f9fafb",
    bgCard:   isDark ? "#13131a" : "#ffffff",
    bgInner:  isDark ? "#1a1a24" : "#f9fafb",
    border:   isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
    text:     isDark ? "#f1f5f9" : "#0f172a",
    textSec:  isDark ? "#cbd5e1" : "#475569",
    textMute: isDark ? "#94a3b8" : "#64748b",
  };

  const Section = ({
    icon: Icon, title, color, gradient, onEdit, children, complete = true,
  }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background:   c.bgCard,
        borderRadius: 16,
        border:       `1px solid ${c.border}`,
        overflow:     "hidden",
      }}
    >
      {/* Header */}
      <div style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        padding:        "16px 20px",
        borderBottom:   `1px solid ${c.border}`,
        background:     `linear-gradient(135deg, ${color}08, transparent)`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: gradient,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 12px ${color}40`,
          }}>
            <Icon size={18} color="#fff" />
          </div>
          <div>
            <h3 style={{
              margin: 0, fontSize: 15, fontWeight: 700, color: c.text,
            }}>{title}</h3>
            <p style={{
              margin: "2px 0 0", fontSize: 11,
              color: complete ? "#10b981" : "#f59e0b",
              fontWeight: 600,
            }}>
              {complete ? "✓ Complete" : "⚠ Incomplete"}
            </p>
          </div>
        </div>
        <IconButton onClick={onEdit} sx={{
          background: `${color}15`,
          "&:hover":  { background: `${color}25` },
        }}>
          <Edit3 size={16} color={color} />
        </IconButton>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </motion.div>
  );

  const Field = ({ icon: Icon, label, value, color = "#6366f1" }: any) => (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 14px",
      background: c.bgInner,
      borderRadius: 10,
      border: `1px solid ${c.border}`,
    }}>
      {Icon && (
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `${color}15`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon size={15} color={color} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: 10,
          color: c.textMute, fontWeight: 700, letterSpacing: 1,
          textTransform: "uppercase",
        }}>{label}</p>
        <p style={{
          margin: "2px 0 0", fontSize: 13,
          fontWeight: 600, color: c.text,
          wordBreak: "break-word",
        }}>{value || <span style={{ color: c.textMute, fontWeight: 400 }}>Not provided</span>}</p>
      </div>
    </div>
  );

  // ── Completion check ──
  const isPersonalComplete = !!(profile?.sellerName && profile?.email && profile?.mobile);
  const isBusinessComplete = !!(profile?.businessDetails?.businessName && profile?.GSTIN);
  const isPickupComplete   = !!(addr?.address && addr?.city && addr?.state && addr?.pinCode);
  const isBankComplete     = !!(profile?.bankDetails?.accountNumber && profile?.bankDetails?.ifscCode);

  const completionPct = [
    isPersonalComplete, isBusinessComplete, isPickupComplete, isBankComplete,
  ].filter(Boolean).length * 25;

  return (
    <div style={{ background: c.bg, minHeight: "100vh", padding: 20 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ── Hero Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: 20,
            padding: 28,
            color: "#fff",
            marginBottom: 20,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{
            position: "absolute", top: -40, right: -40,
            width: 200, height: 200, borderRadius: "50%",
            background: "rgba(255,255,255,0.1)", filter: "blur(40px)",
          }} />

          <div style={{
            display: "flex", alignItems: "center", gap: 20,
            flexWrap: "wrap", position: "relative",
          }}>
            <Avatar sx={{
              width: 80, height: 80,
              background: "rgba(255,255,255,0.2)",
              fontSize: 32, fontWeight: 900,
              border: "3px solid rgba(255,255,255,0.3)",
            }}>
              {profile?.sellerName?.[0]?.toUpperCase() || "S"}
            </Avatar>

            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{
                margin: 0, fontSize: 24, fontWeight: 900,
              }}>{profile?.sellerName || "Seller"}</h1>
              <p style={{
                margin: "4px 0", fontSize: 13, opacity: 0.85,
              }}>{profile?.businessDetails?.businessName || "Your Store"}</p>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: "rgba(34,197,94,0.25)",
                padding: "4px 10px", borderRadius: 999,
                fontSize: 10, fontWeight: 700, marginTop: 4,
              }}>
                <CheckCircle size={11} /> {profile?.accountStatus || "PENDING"}
              </div>
            </div>

            {/* Completion meter */}
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 80, height: 80,
                borderRadius: "50%",
                background: `conic-gradient(#fff ${completionPct * 3.6}deg, rgba(255,255,255,0.2) 0deg)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}>
                <div style={{
                  width: 62, height: 62, borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 900,
                }}>
                  {completionPct}%
                </div>
              </div>
              <p style={{ fontSize: 10, opacity: 0.85, marginTop: 6 }}>
                Profile Complete
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Sections Grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
          gap: 16,
        }}>

          {/* Personal */}
          <Section
            icon={User} title="Personal Details"
            color="#6366f1"
            gradient="linear-gradient(135deg, #6366f1, #8b5cf6)"
            onEdit={() => handleOpen("personalDetails")}
            complete={isPersonalComplete}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Field icon={User}  label="Seller Name" value={profile?.sellerName} color="#6366f1" />
              <Field icon={Mail}  label="Email"       value={profile?.email}      color="#6366f1" />
              <Field icon={Phone} label="Mobile"      value={profile?.mobile}     color="#6366f1" />
            </div>
          </Section>

          {/* Business */}
          <Section
            icon={Building2} title="Business Details"
            color="#f59e0b"
            gradient="linear-gradient(135deg, #f59e0b, #d97706)"
            onEdit={() => handleOpen("businessDetails")}
            complete={isBusinessComplete}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Field icon={Building2} label="Business Name" value={profile?.businessDetails?.businessName} color="#f59e0b" />
              <Field icon={Hash}      label="GSTIN"         value={profile?.GSTIN} color="#f59e0b" />
              <Field icon={Shield}    label="Account Status" value={profile?.accountStatus} color="#f59e0b" />
            </div>
          </Section>

          {/* Pickup Address */}
          <Section
            icon={MapPin} title="Pickup Address"
            color="#10b981"
            gradient="linear-gradient(135deg, #10b981, #059669)"
            onEdit={() => handleOpen("pickupAddress")}
            complete={isPickupComplete}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Field icon={User}    label="Contact Name" value={addr?.name} color="#10b981" />
              <Field icon={MapPin}  label="Address"      value={addr?.address} color="#10b981" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field icon={MapPin} label="City"    value={addr?.city}    color="#10b981" />
                <Field icon={MapPin} label="State"   value={addr?.state}   color="#10b981" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field icon={Hash}  label="Pincode" value={addr?.pinCode} color="#10b981" />
                <Field icon={Phone} label="Mobile"  value={addr?.mobile}  color="#10b981" />
              </div>
            </div>
          </Section>

          {/* Bank */}
          <Section
            icon={Banknote} title="Bank Details"
            color="#06b6d4"
            gradient="linear-gradient(135deg, #06b6d4, #0891b2)"
            onEdit={() => handleOpen("bankDetails")}
            complete={isBankComplete}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Field icon={User}       label="Account Holder" value={profile?.bankDetails?.accountHolderName} color="#06b6d4" />
              <Field icon={CreditCard} label="Account Number" value={profile?.bankDetails?.accountNumber ? "••••" + String(profile.bankDetails.accountNumber).slice(-4) : ""} color="#06b6d4" />
              <Field icon={Hash}       label="IFSC Code"      value={profile?.bankDetails?.ifscCode} color="#06b6d4" />
            </div>
          </Section>
        </div>
      </div>

      {/* ── Dialog for editing ── */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: c.bgCard,
            color: c.text,
            border: `1px solid ${c.border}`,
          }
        }}
      >
        <DialogTitle sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${c.border}`,
          fontSize: 16,
          fontWeight: 800,
        }}>
          Edit Details
          <IconButton onClick={handleClose} size="small">
            <X size={18} color={c.textMute} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          {renderForm()}
        </DialogContent>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={sellers.error ? "error" : "success"}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2, fontWeight: 600 }}
        >
          {sellers.error || "Profile updated successfully!"}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Profile;