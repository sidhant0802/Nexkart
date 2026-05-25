import { useEffect, useState }    from "react";
import { Modal, Box }             from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { deleteDeal, getAllDeals } from "../../../Redux Toolkit/Admin/DealSlice";
import UpdateDealForm             from "./UpdateDealForm";

const injectCSS = () => {
  if (document.getElementById("deals-css")) return;
  const s = document.createElement("style");
  s.id = "deals-css";
  s.innerHTML = `
    @keyframes dt-fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    .dt-row{animation:dt-fade .25s ease forwards;}
    .dt-btn{transition:all .15s;}
    .dt-btn:hover{transform:scale(.96);opacity:.85;}
    .dt-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(99,102,241,.12)!important;}
    .dt-card{transition:all .2s ease;}
  `;
  document.head.appendChild(s);
};

export default function DealsTable() {
  useEffect(() => { injectCSS(); }, []);

  const dispatch = useAppDispatch();
  const deal     = useAppSelector((s) => s.deal);

  const [editId,   setEditId]   = useState<number | null>(null);
  const [modalOpen, setModal]   = useState(false);

  useEffect(() => { dispatch(getAllDeals()); }, []);

  const handleDelete = (id: any) => {
    if (window.confirm("Delete this deal permanently?")) dispatch(deleteDeal(id));
  };

  const handleEdit = (id: number) => { setEditId(id); setModal(true); };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>

      {/* Stats */}
      <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
        {[
          { label:"Total Deals",    value: deal.deals.length,                                    color:"#6366f1", emoji:"⚡" },
          { label:"Avg Discount",   value: deal.deals.length
              ? `${Math.round(deal.deals.reduce((a:number,d:any)=>a+d.discount,0)/deal.deals.length)}%`
              : "—",                                                                               color:"#f59e0b", emoji:"🏷️" },
          { label:"Max Discount",   value: deal.deals.length
              ? `${Math.max(...deal.deals.map((d:any)=>d.discount))}%`
              : "—",                                                                               color:"#10b981", emoji:"🔥" },
        ].map((s) => (
          <div key={s.label} style={{
            display:"flex", alignItems:"center", gap:"10px",
            padding:"10px 16px", borderRadius:"12px",
            background:`${s.color}10`, border:`1px solid ${s.color}25`,
          }}>
            <span style={{ fontSize:"20px" }}>{s.emoji}</span>
            <div>
              <p style={{ fontSize:"18px", fontWeight:900, color:s.color, margin:0, lineHeight:1 }}>{s.value}</p>
              <p style={{ fontSize:"11px", color:"#9ca3af", margin:0 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty */}
      {deal.deals.length === 0 ? (
        <div style={{
          textAlign:"center", padding:"60px 20px",
          borderRadius:"16px", background:"#f9fafb",
          border:"1px dashed #e5e7eb",
        }}>
          <p style={{ fontSize:"40px", margin:"0 0 8px" }}>⚡</p>
          <p style={{ color:"#9ca3af", fontWeight:600 }}>No deals yet — create your first deal!</p>
        </div>
      ) : (

        /* Table */
        <div style={{ overflowX:"auto", borderRadius:"16px", border:"1px solid #f1f5f9", background:"#fff" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:"600px" }}>
            <thead>
              <tr style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)" }}>
                {["#","Image","Category","Discount","Edit","Delete"].map((h) => (
                  <th key={h} style={{
                    padding:"12px 16px", fontSize:"11px", fontWeight:700,
                    letterSpacing:"1px", textTransform:"uppercase",
                    color:"rgba(255,255,255,.9)", textAlign:"left", whiteSpace:"nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deal.deals.map((d: any, i: number) => {
                const rowBg = i%2===0 ? "#fff" : "#fafafa";
                return (
                  <tr key={d._id} className="dt-row"
                    style={{
                      background:rowBg, borderBottom:"1px solid #f1f5f9",
                      animationDelay:`${i*30}ms`, animationFillMode:"both",
                      transition:"background .15s",
                    }}
                    onMouseEnter={(e)=>((e.currentTarget as HTMLTableRowElement).style.background="#eef2ff")}
                    onMouseLeave={(e)=>((e.currentTarget as HTMLTableRowElement).style.background=rowBg)}
                  >
                    {/* # */}
                    <td style={{ padding:"12px 16px", fontSize:"13px", color:"#9ca3af", fontWeight:700 }}>
                      {i+1}
                    </td>

                    {/* Image */}
                    <td style={{ padding:"10px 16px" }}>
                      <img
                        src={d.category?.image}
                        alt={d.category?.categoryId}
                        style={{
                          width:"56px", height:"40px", objectFit:"cover",
                          borderRadius:"8px", border:"1px solid #f1f5f9",
                        }}
                        onError={(e)=>{ (e.target as HTMLImageElement).src="https://placehold.co/56x40/eee/999?text=img"; }}
                      />
                    </td>

                    {/* Category */}
                    <td style={{ padding:"12px 16px" }}>
                      <span style={{
                        fontFamily:"monospace", fontSize:"12px",
                        background:"#eef2ff", color:"#6366f1",
                        padding:"3px 8px", borderRadius:"6px", fontWeight:700,
                      }}>
                        {d.category?.categoryId ?? "—"}
                      </span>
                    </td>

                    {/* Discount */}
                    <td style={{ padding:"12px 16px" }}>
                      <span style={{
                        display:"inline-flex", alignItems:"center", gap:"4px",
                        padding:"4px 12px", borderRadius:"999px",
                        background:"#fef3c7", color:"#d97706",
                        fontSize:"13px", fontWeight:800,
                      }}>
                        🏷️ {d.discount}% OFF
                      </span>
                    </td>

                    {/* Edit */}
                    <td style={{ padding:"12px 16px" }}>
                      <button className="dt-btn" onClick={() => handleEdit(d._id)} style={{
                        padding:"6px 14px", borderRadius:"8px", border:"none",
                        cursor:"pointer", fontSize:"12px", fontWeight:700,
                        background:"#eef2ff", color:"#6366f1",
                        display:"inline-flex", alignItems:"center", gap:"4px",
                      }}>
                        ✏️ Edit
                      </button>
                    </td>

                    {/* Delete */}
                    <td style={{ padding:"12px 16px" }}>
                      <button className="dt-btn" onClick={() => handleDelete(d._id)} style={{
                        padding:"6px 14px", borderRadius:"8px", border:"none",
                        cursor:"pointer", fontSize:"12px", fontWeight:700,
                        background:"#fee2e2", color:"#dc2626",
                        display:"inline-flex", alignItems:"center", gap:"4px",
                      }}>
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModal(false)}>
        <Box sx={{
          position:"absolute", top:"50%", left:"50%",
          transform:"translate(-50%,-50%)",
          width:420, bgcolor:"background.paper",
          borderRadius:"20px", p:0, overflow:"hidden",
          boxShadow:"0 20px 60px rgba(0,0,0,.2)",
        }}>
          {editId && <UpdateDealForm id={editId} />}
        </Box>
      </Modal>
    </div>
  );
}