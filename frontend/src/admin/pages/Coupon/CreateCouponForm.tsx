import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { CircularProgress, Snackbar, Alert } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { Dayjs } from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { createCoupon } from "../../../Redux Toolkit/Admin/AdminCouponSlice";
import { useAdminTheme } from "../../context/AdminThemeContext";

interface CouponFormValues {
  code: string;
  discountPercentage: number | "";
  validityStartDate: Dayjs | null;
  validityEndDate: Dayjs | null;
  minimumOrderValue: number | "";
}

// ════════════════════════════════════════════════════════════════
// ✅ MOVED OUTSIDE — prevents re-creation on every render
// ════════════════════════════════════════════════════════════════
interface FieldProps {
  label: string;
  error?: string;
  labelC: string;
  children: React.ReactNode;
}

const Field = ({ label, error, labelC, children }: FieldProps) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <label
      style={{
        fontSize: "12px",
        fontWeight: 700,
        color: labelC,
        letterSpacing: "0.3px",
      }}
    >
      {label}
    </label>
    {children}
    {error && (
      <span style={{ fontSize: "11px", color: "#ef4444", marginTop: "2px" }}>
        ⚠️ {error}
      </span>
    )}
  </div>
);

const makeInputStyle = (
  hasError: boolean,
  bdr: string,
  inpBg: string,
  txt: string
): React.CSSProperties => ({
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: `1.5px solid ${hasError ? "#ef4444" : bdr}`,
  fontSize: "14px",
  outline: "none",
  background: inpBg,
  color: txt,
  boxSizing: "border-box",
  transition: "border-color 0.2s",
  fontFamily: "inherit",
});

// ════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════
export default function CreateCouponForm() {
  const dispatch = useAppDispatch();
  const adminCoupon = useAppSelector((s) => s.adminCoupon);
  const { isDark } = useAdminTheme();
  const [snackOpen, setSnackOpen] = useState(false);

  const txt = isDark ? "#f9fafb" : "#111827";
  const txt2 = isDark ? "#9ca3af" : "#6b7280";
  const labelC = isDark ? "#e5e7eb" : "#374151";
  const bdr = isDark ? "#1f2937" : "#e5e7eb";
  const inpBg = isDark ? "#1a1f2e" : "#f9fafb";

  const formik = useFormik<CouponFormValues>({
    initialValues: {
      code: "",
      discountPercentage: "",
      validityStartDate: null,
      validityEndDate: null,
      minimumOrderValue: "",
    },
    validationSchema: Yup.object({
      code: Yup.string()
        .required("Code is required")
        .min(3, "Min 3 characters")
        .max(20, "Max 20 characters"),
      discountPercentage: Yup.number()
        .typeError("Must be a number")
        .required("Required")
        .min(1, "Min 1%")
        .max(100, "Max 100%"),
      validityStartDate: Yup.date()
        .nullable()
        .required("Start date is required")
        .typeError("Invalid date"),
      validityEndDate: Yup.date()
        .nullable()
        .required("End date is required")
        .typeError("Invalid date")
        .min(Yup.ref("validityStartDate"), "Must be after start date"),
      minimumOrderValue: Yup.number()
        .typeError("Must be a number")
        .required("Required")
        .min(1, "Min ₹1"),
    }),
    onSubmit: (values, { resetForm }) => {
      dispatch(
        createCoupon({
          coupon: {
            ...values,
            validityStartDate:
              values.validityStartDate?.toISOString() ?? null,
            validityEndDate:
              values.validityEndDate?.toISOString() ?? null,
          },
          jwt: localStorage.getItem("jwt") || "",
        })
      );
      resetForm();
    },
  });

  useEffect(() => {
    if (adminCoupon.couponCreated) setSnackOpen(true);
  }, [adminCoupon.couponCreated]);

  const datePickerSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      background: inpBg,
      color: txt,
      "& fieldset": { borderColor: bdr },
      "&:hover fieldset": { borderColor: "#6366f1" },
      "&.Mui-focused fieldset": { borderColor: "#6366f1" },
    },
    "& .MuiInputBase-input": { color: txt },
    "& .MuiSvgIcon-root": { color: txt2 },
    "& .MuiInputLabel-root": { color: txt2 },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div style={{ maxWidth: "560px", width: "100%" }}>
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 900,
              color: txt,
              margin: "0 0 4px",
            }}
          >
            🎟️ Create New Coupon
          </h2>
          <p style={{ fontSize: "13px", color: txt2, margin: 0 }}>
            Fill in the details to generate a discount coupon
          </p>
        </div>

        <form
          onSubmit={formik.handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          {/* Row 1 - Code + Discount */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <Field
              label="Coupon Code"
              labelC={labelC}
              error={formik.touched.code ? formik.errors.code : undefined}
            >
              <input
                name="code"
                placeholder="e.g. SAVE20"
                value={formik.values.code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                style={{
                  ...makeInputStyle(
                    !!(formik.touched.code && formik.errors.code),
                    bdr,
                    inpBg,
                    txt
                  ),
                  textTransform: "uppercase",
                  fontFamily: "monospace",
                  fontWeight: 700,
                  letterSpacing: "2px",
                }}
              />
            </Field>

            <Field
              label="Discount %"
              labelC={labelC}
              error={
                formik.touched.discountPercentage
                  ? (formik.errors.discountPercentage as string)
                  : undefined
              }
            >
              <div style={{ position: "relative" }}>
                <input
                  name="discountPercentage"
                  type="number"
                  min={1}
                  max={100}
                  placeholder="e.g. 20"
                  value={formik.values.discountPercentage}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  style={{
                    ...makeInputStyle(
                      !!(
                        formik.touched.discountPercentage &&
                        formik.errors.discountPercentage
                      ),
                      bdr,
                      inpBg,
                      txt
                    ),
                    paddingRight: "36px",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "14px",
                    color: txt2,
                    fontWeight: 700,
                  }}
                >
                  %
                </span>
              </div>
            </Field>
          </div>

          {/* Row 2 - Dates */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <Field
              label="Start Date"
              labelC={labelC}
              error={
                formik.touched.validityStartDate
                  ? (formik.errors.validityStartDate as string)
                  : undefined
              }
            >
              <DatePicker
                value={formik.values.validityStartDate}
                onChange={(d) =>
                  formik.setFieldValue("validityStartDate", d)
                }
                slotProps={{
                  textField: {
                    size: "small",
                    error: !!(
                      formik.touched.validityStartDate &&
                      formik.errors.validityStartDate
                    ),
                    sx: datePickerSx,
                  },
                  popper: {
                    sx: {
                      "& .MuiPaper-root": {
                        background: isDark ? "#1a1f2e" : "#fff",
                        color: txt,
                      },
                    },
                  },
                }}
              />
            </Field>

            <Field
              label="End Date"
              labelC={labelC}
              error={
                formik.touched.validityEndDate
                  ? (formik.errors.validityEndDate as string)
                  : undefined
              }
            >
              <DatePicker
                value={formik.values.validityEndDate}
                onChange={(d) =>
                  formik.setFieldValue("validityEndDate", d)
                }
                slotProps={{
                  textField: {
                    size: "small",
                    error: !!(
                      formik.touched.validityEndDate &&
                      formik.errors.validityEndDate
                    ),
                    sx: datePickerSx,
                  },
                  popper: {
                    sx: {
                      "& .MuiPaper-root": {
                        background: isDark ? "#1a1f2e" : "#fff",
                        color: txt,
                      },
                    },
                  },
                }}
              />
            </Field>
          </div>

          {/* Min order value */}
          <Field
            label="Minimum Order Value (₹)"
            labelC={labelC}
            error={
              formik.touched.minimumOrderValue
                ? (formik.errors.minimumOrderValue as string)
                : undefined
            }
          >
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "13px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "14px",
                  color: txt2,
                  fontWeight: 700,
                }}
              >
                ₹
              </span>
              <input
                name="minimumOrderValue"
                type="number"
                min={1}
                placeholder="e.g. 500"
                value={formik.values.minimumOrderValue}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                style={{
                  ...makeInputStyle(
                    !!(
                      formik.touched.minimumOrderValue &&
                      formik.errors.minimumOrderValue
                    ),
                    bdr,
                    inpBg,
                    txt
                  ),
                  paddingLeft: "30px",
                }}
              />
            </div>
          </Field>

          {/* Preview card */}
          {formik.values.code && (
            <div
              style={{
                padding: "14px 18px",
                borderRadius: "12px",
                background: isDark
                  ? "linear-gradient(135deg, #6366f125, #a855f725)"
                  : "linear-gradient(135deg, #6366f120, #a855f720)",
                border: "1.5px dashed #6366f1",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: isDark ? "#a5b4fc" : "#6366f1",
                    margin: "0 0 2px",
                  }}
                >
                  Preview
                </p>
                <p
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 900,
                    fontSize: "18px",
                    letterSpacing: "3px",
                    color: txt,
                    margin: 0,
                  }}
                >
                  {formik.values.code.toUpperCase()}
                </p>
              </div>
              {Number(formik.values.discountPercentage) > 0 && (
                <span
                  style={{
                    padding: "6px 14px",
                    borderRadius: "999px",
                    background: "linear-gradient(135deg, #6366f1, #a855f7)",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "15px",
                    boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
                  }}
                >
                  {formik.values.discountPercentage}% OFF
                </span>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={adminCoupon.loading}
            style={{
              padding: "12px",
              borderRadius: "12px",
              border: "none",
              cursor: adminCoupon.loading ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: 700,
              color: "#fff",
              background: adminCoupon.loading
                ? isDark
                  ? "#374151"
                  : "#d1d5db"
                : "linear-gradient(135deg, #6366f1, #a855f7)",
              boxShadow: adminCoupon.loading
                ? "none"
                : "0 4px 16px rgba(99,102,241,0.4)",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "4px",
            }}
          >
            {adminCoupon.loading ? (
              <>
                <CircularProgress size={18} sx={{ color: "#fff" }} />
                Creating...
              </>
            ) : (
              <>🎟️ Create Coupon</>
            )}
          </button>
        </form>
      </div>

      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackOpen}
        autoHideDuration={5000}
        onClose={() => setSnackOpen(false)}
      >
        <Alert
          onClose={() => setSnackOpen(false)}
          severity={adminCoupon.error ? "error" : "success"}
          variant="filled"
          sx={{ borderRadius: "12px", fontWeight: 600 }}
        >
          {adminCoupon.error
            ? adminCoupon.error
            : "🎉 Coupon created successfully!"}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
}