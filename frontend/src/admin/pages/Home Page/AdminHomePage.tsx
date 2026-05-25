import { useState, useEffect }  from "react";
import { useAppDispatch }        from "../../../Redux Toolkit/Store";
import { fetchHomePageData }     from "../../../Redux Toolkit/Customer/Customer/AsyncThunk";
import AdminBannerSection        from "./sections/AdminBannerSection";
import AdminSectionItems         from "./sections/AdminSectionItems";
import AdminHomeCategorySection  from "./sections/AdminHomeCategorySection";
import AdminFeaturedSettings     from "./sections/AdminFeaturedSettings";
import AdminBrandSettings        from "./sections/AdminBrandSettings";

const TABS = [
  { label:"🎠 Banners",            value:"banners"     },
  { label:"💻 Electronics",        value:"electronics" },
  { label:"👔 Men's",              value:"men"         },
  { label:"👗 Women's",            value:"women"       },
  { label:"✨ Fashion",            value:"fashion"     },
  { label:"🔥 Trending",           value:"grid"        },
  { label:"⚡ Lightning",          value:"lightning"   },
  { label:"🛍️ Shop By",           value:"shopBy"      },
  { label:"🏷️ Deal Cats",         value:"dealCats"    },
  { label:"📦 Featured",           value:"featured"    },
  { label:"🏆 Brands",             value:"brands"      },
];

const injectCSS = () => {
  if (document.getElementById("hp-css")) return;
  const s = document.createElement("style");
  s.id = "hp-css";
  s.innerHTML = `
    .hp-tab { transition:all .2s ease; cursor:pointer; white-space:nowrap; }
    .hp-tab:hover { transform:translateY(-1px); }
    .hp-tabs::-webkit-scrollbar { height:3px; }
    .hp-tabs::-webkit-scrollbar-track { background:transparent; }
    .hp-tabs::-webkit-scrollbar-thumb { background:#6366f1; border-radius:99px; }
  `;
  document.head.appendChild(s);
};

const AdminHomePage = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState("banners");

  useEffect(() => { injectCSS(); dispatch(fetchHomePageData()); }, []);

  const activeTabLabel = TABS.find((t) => t.value === activeTab)?.label ?? "";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>

      {/* Header */}
      <div style={{
        borderRadius:"16px", padding:"22px 24px",
        background:"#fff", border:"1px solid #f1f5f9",
        boxShadow:"0 1px 3px rgba(0,0,0,.06)",
      }}>
        <h1 style={{ fontSize:"20px", fontWeight:900, color:"#111827", margin:"0 0 4px" }}>
          🏠 Home Page Manager
        </h1>
        <p style={{ fontSize:"13px", color:"#9ca3af", margin:"0 0 16px" }}>
          Control everything visible on the Nexkart customer home page
        </p>

        {/* Scrollable tab pills */}
        <div className="hp-tabs" style={{
          display:"flex", gap:"8px", overflowX:"auto",
          paddingBottom:"4px",
        }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button key={tab.value} className="hp-tab"
                onClick={() => setActiveTab(tab.value)}
                style={{
                  padding:"8px 14px", borderRadius:"10px",
                  border:"none", fontSize:"12px", fontWeight:700,
                  flexShrink:0,
                  background: isActive
                    ? "linear-gradient(135deg,#6366f1,#a855f7)"
                    : "#f8fafc",
                  color:   isActive ? "#fff" : "#6b7280",
                  boxShadow: isActive ? "0 4px 12px rgba(99,102,241,.3)" : "none",
                  transform: isActive ? "scale(1.03)" : "scale(1)",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section header */}
      <div style={{
        padding:"12px 18px", borderRadius:"12px",
        background:"linear-gradient(135deg,#6366f110,#a855f710)",
        border:"1px solid #6366f125",
        display:"flex", alignItems:"center", gap:"10px",
      }}>
        <span style={{ fontSize:"20px" }}>
          {activeTabLabel.split(" ")[0]}
        </span>
        <div>
          <p style={{ fontSize:"13px", fontWeight:700, color:"#6366f1", margin:0 }}>
            {activeTabLabel}
          </p>
          <p style={{ fontSize:"11px", color:"#9ca3af", margin:0 }}>
            Editing section — changes are saved instantly
          </p>
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab==="banners"     && <AdminBannerSection />}
        {activeTab==="electronics" && <AdminSectionItems section="electronics" title="Electronics"        description="Gadgets in the Electronics horizontal scroll" />}
        {activeTab==="men"         && <AdminSectionItems section="men"         title="Men's Fashion"      description="Items in the Men's Fashion horizontal scroll" />}
        {activeTab==="women"       && <AdminSectionItems section="women"       title="Women's Fashion"    description="Items in the Women's Fashion horizontal scroll" />}
        {activeTab==="fashion"     && <AdminSectionItems section="fashion"     title="Fashion & Lifestyle" description="Items in Fashion & Lifestyle scroll" />}
        {activeTab==="lightning"   && <AdminSectionItems section="lightning"   title="Lightning Deals"    description="Items with discount text in Lightning Deals" />}
        {activeTab==="grid"        && <AdminHomeCategorySection dataKey="grid"             dbSection="GRID"               title="Trending Now"       description="Portrait cards in the Trending Now grid" />}
        {activeTab==="shopBy"      && <AdminHomeCategorySection dataKey="shopByCategories" dbSection="SHOP_BY_CATEGORIES" title="Shop By Category"   description="Category icons in Shop By Category" />}
        {activeTab==="dealCats"    && <AdminHomeCategorySection dataKey="dealCategories"   dbSection="DEALS"              title="Deal Categories"    description="Categories available for creating deals" />}
        {activeTab==="featured"    && <AdminFeaturedSettings />}
        {activeTab==="brands"      && <AdminBrandSettings />}
      </div>
    </div>
  );
};

export default AdminHomePage;