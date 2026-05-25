import { useFormik }              from "formik";
import * as Yup                   from "yup";
import { CircularProgress }       from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { createDeal }             from "../../../Redux Toolkit/Admin/DealSlice";

const CreateDealForm = () => {
  const dispatch  = useAppDispatch();
  const homePage  = useAppSelector((s) => s.homePage);
  const deal      = useAppSelector((s) => s.deal);

  const cats = homePage.homePageData?.dealCategories ?? [];

  const formik = useFormik({
    initialValues: { discount: "", category: "" },
    validationSchema: Yup.object({
      discount: Yup.number().required("Required").min(1,"Min 1%").max(100,"Max 100%"),
      category: Yup.string().required("Select a category"),
    }),
    onSubmit: (values, { resetForm }) => {
      dispatch(createDeal({
        discount: Number(values.discount),
        category: { _id: values.category },
      }));
      resetForm();
    },
  });

  const selectedCat = cats.find((c: any) => c._id === formik.values.category);
  const disc        = Number(formik.values.discount);

  const inputStyle = (err: boolean): React.CSSProperties => ({
    width:"100%", padding:"11px 14px",
    borderRadius:"10px",
    border:`1.5px solid ${err ? "#ef4444" : "#e5e7eb"}`,
    fontSize:"14px", outline:"none", background:"#f9fafb",
    boxSizing:"border-box", fontFamily:"inherit",
    transition:"border-color .2s",
  });

  return (
    <div style={{ maxWidth:"480px", width:"100%" }}>

      {/* Header */}
      <div style={{ marginBottom:"24px" }}>
        <h2 style={{ fontSize:"18px", fontWeight:900, color:"#111827", margin:"0 0 4px" }}>
          ⚡ Create New Deal
        </h2>
        <p style={{ fontSize:"13px", color:"#9ca3af", margin:0 }}>
          Attach a discount to a deal category shown on home page
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>

        {/* Discount */}
        <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
          <label style={{ fontSize:"12px", fontWeight:700, color:"#374151" }}>
            Discount Percentage
          </label>
          <div style={{ position:"relative" }}>
            <input
              name="discount"
              type="number"
              min={1} max={100}
              placeholder="e.g. 30"
              value={formik.values.discount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              style={{ ...inputStyle(!!(formik.touched.discount && formik.errors.discount)), paddingRight:"36px" }}
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

        {/* Category */}
        <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
          <label style={{ fontSize:"12px", fontWeight:700, color:"#374151" }}>
            Deal Category
          </label>
          <select
            name="category"
            value={formik.values.category}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            style={{
              ...inputStyle(!!(formik.touched.category && formik.errors.category)),
              cursor:"pointer",
            }}
            onFocus={(e)=>(e.target.style.borderColor="#6366f1")}
          >
            <option value="">— Select a category —</option>
            {cats.map((c: any) => (
              <option key={c._id} value={c._id}>{c.categoryId}</option>
            ))}
          </select>
          {formik.touched.category && formik.errors.category && (
            <span style={{ fontSize:"11px", color:"#ef4444" }}>⚠️ {formik.errors.category}</span>
          )}
        </div>

        {/* Live Preview */}
        {(disc > 0 || selectedCat) && (
          <div style={{
            padding:"14px 18px", borderRadius:"14px",
            background:"linear-gradient(135deg,#6366f110,#a855f710)",
            border:"1.5px dashed #6366f1",
          }}>
            <p style={{ fontSize:"9px", fontWeight:800, letterSpacing:"2px", textTransform:"uppercase", color:"#6366f1", margin:"0 0 8px" }}>
              Preview
            </p>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"8px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                {selectedCat?.image && (
                  <img loading="lazy" decoding="async" src={selectedCat.image} alt="" style={{
                    width:"40px", height:"32px", objectFit:"cover",
                    borderRadius:"6px", border:"1px solid #e5e7eb",
                  }} />
                )}
                <div>
                  <p style={{ fontSize:"12px", color:"#6b7280", margin:0 }}>Category</p>
                  <p style={{ fontSize:"13px", fontWeight:700, color:"#111827", margin:0 }}>
                    {selectedCat?.categoryId ?? "—"}
                  </p>
                </div>
              </div>
              {disc > 0 && (
                <span style={{
                  padding:"6px 16px", borderRadius:"999px",
                  background:"linear-gradient(135deg,#6366f1,#a855f7)",
                  color:"#fff", fontWeight:900, fontSize:"16px",
                }}>
                  {disc}% OFF
                </span>
              )}
            </div>
          </div>
        )}

        {/* Submit */}
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
            ? <><CircularProgress size={18} sx={{ color:"#fff" }} /> Creating...</>
            : "⚡ Create Deal"
          }
        </button>
      </form>
    </div>
  );
};

export default CreateDealForm;