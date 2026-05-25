import { useEffect }              from "react";
import { useFormik }              from "formik";
import * as Yup                   from "yup";
import { CircularProgress }       from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { fetchHomeCategories }    from "../../../Redux Toolkit/Admin/AdminSlice";
import { updateDeal }             from "../../../Redux Toolkit/Admin/DealSlice";

const UpdateDealForm = ({ id }: { id: number }) => {
  const dispatch = useAppDispatch();
  const deal     = useAppSelector((s) => s.deal);
  const current  = (deal.deals as any[]).find((d) => d._id === id);

  useEffect(() => { dispatch(fetchHomeCategories()); }, []);

  const formik = useFormik({
    initialValues: { discount: current?.discount ?? 0 },
    enableReinitialize: true,
    validationSchema: Yup.object({
      discount: Yup.number().required("Required").min(0).max(100),
    }),
    onSubmit: (values) => {
      dispatch(updateDeal({ id, deal: { discount: values.discount } }));
    },
  });

  return (
    <div>
      {/* Modal header */}
      <div style={{
        padding:"20px 24px 16px",
        background:"linear-gradient(135deg,#6366f1,#a855f7)",
      }}>
        <h2 style={{ fontSize:"18px", fontWeight:900, color:"#fff", margin:"0 0 4px" }}>
          ✏️ Update Deal
        </h2>
        <p style={{ fontSize:"12px", color:"rgba(255,255,255,.75)", margin:0 }}>
          Category: <strong>{current?.category?.categoryId ?? "—"}</strong>
        </p>
      </div>

      <div style={{ padding:"24px" }}>
        {/* Current deal info */}
        {current && (
          <div style={{
            display:"flex", alignItems:"center", gap:"12px",
            padding:"12px 14px", borderRadius:"12px",
            background:"#f9fafb", border:"1px solid #f1f5f9",
            marginBottom:"20px",
          }}>
            {current.category?.image && (
              <img loading="lazy" decoding="async" src={current.category.image} alt=""
                style={{ width:"48px", height:"36px", objectFit:"cover", borderRadius:"8px" }} />
            )}
            <div>
              <p style={{ fontSize:"11px", color:"#9ca3af", margin:0 }}>Current Discount</p>
              <p style={{ fontSize:"20px", fontWeight:900, color:"#d97706", margin:0 }}>
                {current.discount}% OFF
              </p>
            </div>
          </div>
        )}

        <form onSubmit={formik.handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
            <label style={{ fontSize:"12px", fontWeight:700, color:"#374151" }}>
              New Discount %
            </label>
            <div style={{ position:"relative" }}>
              <input
                name="discount"
                type="number"
                min={0} max={100}
                value={formik.values.discount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                style={{
                  width:"100%", padding:"11px 36px 11px 14px",
                  borderRadius:"10px",
                  border:`1.5px solid ${formik.touched.discount && formik.errors.discount ? "#ef4444" : "#e5e7eb"}`,
                  fontSize:"16px", fontWeight:700,
                  outline:"none", background:"#f9fafb",
                  boxSizing:"border-box", fontFamily:"inherit",
                }}
                onFocus={(e)=>(e.target.style.borderColor="#6366f1")}
              />
              <span style={{
                position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)",
                fontSize:"14px", color:"#9ca3af", fontWeight:700,
              }}>%</span>
            </div>
            {formik.touched.discount && formik.errors.discount && (
              <span style={{ fontSize:"11px", color:"#ef4444" }}>⚠️ {formik.errors.discount}</span>
            )}
          </div>

          {/* Preview */}
          {formik.values.discount > 0 && (
            <div style={{
              padding:"10px 16px", borderRadius:"10px",
              background:"#fef3c720", border:"1px solid #f59e0b40",
              display:"flex", alignItems:"center", justifyContent:"space-between",
            }}>
              <span style={{ fontSize:"12px", color:"#92400e" }}>New discount will be:</span>
              <span style={{ fontSize:"18px", fontWeight:900, color:"#d97706" }}>
                {formik.values.discount}% OFF
              </span>
            </div>
          )}

          <button type="submit" disabled={deal.loading} style={{
            padding:"12px", borderRadius:"12px", border:"none",
            cursor: deal.loading ? "not-allowed" : "pointer",
            fontSize:"14px", fontWeight:700, color:"#fff",
            background: deal.loading ? "#d1d5db" : "linear-gradient(135deg,#6366f1,#a855f7)",
            boxShadow: deal.loading ? "none" : "0 4px 16px rgba(99,102,241,.4)",
            transition:"all .2s",
            display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
          }}>
            {deal.loading
              ? <><CircularProgress size={18} sx={{ color:"#fff" }} /> Updating...</>
              : "✅ Update Deal"
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateDealForm;