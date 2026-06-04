import * as React       from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch }           from "../../../Redux Toolkit/Store";
import { performLogout }            from "../../../Redux Toolkit/Customer/AuthSlice";
import { useAdminTheme }            from "../../../admin/context/AdminThemeContext";
import { useAppSelector }           from "../../../Redux Toolkit/Store";
import { fetchNewSellers }          from "../../../Redux Toolkit/Admin/adminAnalyticsSlice";

export interface Menu {
  name:        string;
  path:        string;
  icon:        React.ReactElement<any>;
  activeIcon:  React.ReactElement<any>;
  badge?:      number;
  section?:    string;
}

interface DrawerListProps {
  toggleDrawer?: any;
  menu:          Menu[];
  menu2:         Menu[];
  onCollapse?:   () => void;
}

// ── CSS ──────────────────────────────────────────────────────
const injectCSS = () => {
  if (document.getElementById("nexkart-sidebar-css")) return;
  const style = document.createElement("style");
  style.id    = "nexkart-sidebar-css";
  style.innerHTML = `
    /* ── Scrollbar ── */
    .nk-sidebar-scroll { scrollbar-width: thin; scrollbar-color: #3730a3 transparent; }
    .nk-sidebar-scroll::-webkit-scrollbar       { width: 3px; }
    .nk-sidebar-scroll::-webkit-scrollbar-track  { background: transparent; }
    .nk-sidebar-scroll::-webkit-scrollbar-thumb  { background: #3730a3; border-radius: 99px; }
    .nk-sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #6366f1; }

    /* ── Regular item slide in ── */
    @keyframes nk-item-in {
      from { opacity:0; transform: translateX(-12px); }
      to   { opacity:1; transform: translateX(0); }
    }
    .nk-item { animation: nk-item-in 0.3s ease forwards; }
    .nk-item-inner { transition: all 0.18s cubic-bezier(.4,0,.2,1); }
    .nk-item-inner:hover { transform: translateX(4px); }

    /* ── Analytics item unique entrance ── */
    @keyframes nk-analytics-drop {
      0%   { opacity:0; transform: translateY(-16px) scale(0.92); }
      60%  { transform: translateY(3px) scale(1.01); }
      100% { opacity:1; transform: translateY(0) scale(1); }
    }
    .nk-analytics-item {
      animation: nk-analytics-drop 0.45s cubic-bezier(.34,1.56,.64,1) forwards;
    }

    /* ── Analytics icon float ── */
    @keyframes nk-icon-float {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-3px); }
    }
    .nk-icon-float { animation: nk-icon-float 2.5s ease-in-out infinite; }

    /* ── Analytics glow pulse ── */
    @keyframes nk-glow-pulse {
      0%,100% { box-shadow: 0 0 0 0 var(--glow-color, rgba(99,102,241,0)); }
      50%      { box-shadow: 0 0 12px 3px var(--glow-color, rgba(99,102,241,0.25)); }
    }
    .nk-glow { animation: nk-glow-pulse 2.8s ease-in-out infinite; }

    /* ── Analytics section slide down ── */
    @keyframes nk-section-reveal {
      from { opacity:0; max-height:0; transform: translateY(-8px); }
      to   { opacity:1; max-height:300px; transform: translateY(0); }
    }
    .nk-analytics-section {
      animation: nk-section-reveal 0.5s cubic-bezier(.4,0,.2,1) forwards;
      overflow: hidden;
    }

    /* ── Shimmer on active ── */
    @keyframes nk-shimmer {
      0%   { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
    .nk-shimmer { animation: nk-shimmer 2.5s ease-in-out infinite; }

    /* ── Active dot pulse ── */
    @keyframes nk-pulse {
      0%,100% { opacity:1; transform:scale(1); }
      50%      { opacity:0.5; transform:scale(1.5); }
    }
    .nk-pulse { animation: nk-pulse 2s ease-in-out infinite; }

    /* ── Badge pop ── */
    @keyframes nk-badge-pop {
      0%   { transform: scale(0.5); opacity: 0; }
      70%  { transform: scale(1.2); }
      100% { transform: scale(1);   opacity: 1; }
    }
    .nk-badge-pop { animation: nk-badge-pop 0.4s cubic-bezier(.34,1.56,.64,1) forwards; }

    /* ── Analytics label sparkle ── */
    @keyframes nk-sparkle {
      0%,100% { opacity: 0.6; letter-spacing: 2px; }
      50%      { opacity: 1;   letter-spacing: 2.5px; }
    }
    .nk-sparkle { animation: nk-sparkle 2s ease-in-out infinite; }

    /* ── Moving gradient border on analytics card ── */
    @keyframes nk-border-flow {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .nk-analytics-border {
      background: linear-gradient(270deg, #6366f1, #a855f7, #ec4899, #14b8a6, #6366f1);
      background-size: 400% 400%;
      animation: nk-border-flow 4s ease infinite;
    }

    /* ── Collapse btn ── */
    .nk-collapse-btn { transition: all 0.2s ease; }
    .nk-collapse-btn:hover { background: #6366f130 !important; transform: scale(1.05); }
  `;
  document.head.appendChild(style);
};

// ── Analytics config ─────────────────────────────────────────
const ANALYTICS_CONFIG = [
  {
    path:        "/admin/stock-sold",
    accent:      "#8b5cf6",
    glow:        "rgba(139,92,246,0.3)",
    emoji:       "📦",
    tag:         "Live",
  },
  {
    path:        "/admin/seller-revenue",
    accent:      "#ec4899",
    glow:        "rgba(236,72,153,0.3)",
    emoji:       "🥧",
    tag:         "Top 5",
  },
  {
    path:        "/admin/product-analytics",
    accent:      "#14b8a6",
    glow:        "rgba(20,184,166,0.3)",
    emoji:       "📊",
    tag:         "Trends",
  },
];

// ── DrawerList ────────────────────────────────────────────────
const DrawerList = ({ toggleDrawer, menu, menu2, onCollapse }: DrawerListProps) => {
  const dispatch   = useAppDispatch();
  const location   = useLocation();
  const navigate   = useNavigate();
  const { isDark } = useAdminTheme();

  const pendingCount = useAppSelector(
    (s) => (s as any).adminAnalytics?.pendingCount ?? 0
  );

  React.useEffect(() => {
    injectCSS();
    dispatch(fetchNewSellers());
  }, []);

  const bg      = isDark ? "#0d1117" : "#ffffff";
  const border  = isDark ? "#1f2937" : "#f1f5f9";
  const labelC  = isDark ? "#374151" : "#d1d5db";
  const textC   = isDark ? "#9ca3af" : "#6b7280";
  const hoverBg = isDark ? "#1a2035" : "#eef2ff";
  const hoverC  = isDark ? "#a5b4fc" : "#6366f1";

  const handleClick = (item: Menu) => () => {
    if (item.name === "Logout") {
      dispatch(performLogout());
      localStorage.clear();
      sessionStorage.clear();
      if (toggleDrawer) toggleDrawer(false)();
      setTimeout(() => { window.location.href = "/"; }, 100);
      return;
    }
    navigate(item.path);
    if (toggleDrawer) toggleDrawer(false)();
  };

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== "/admin/dashboard" &&
      path !== "/" &&
      location.pathname.startsWith(path));

  // Split menu into regular + analytics
  const regularMenu   = menu.filter(m => m.section !== "analytics");
  const analyticsMenu = menu.filter(m => m.section === "analytics");

  const enrichedRegular = regularMenu.map((item) => {
    if (item.name === "Sellers" && pendingCount > 0) {
      return { ...item, badge: pendingCount };
    }
    return item;
  });

  // ── Section label ─────────────────────────────────────────
  const SectionLabel = ({
    label, color,
  }: { label: string; color?: string }) => (
    <div style={{
      display:    "flex",
      alignItems: "center",
      gap:        "8px",
      padding:    "0 20px",
      margin:     "12px 0 4px",
    }}>
      <p style={{
        fontSize:      "9px",
        fontWeight:    800,
        letterSpacing: "2.5px",
        textTransform: "uppercase",
        color:         color ?? labelC,
        margin:        0,
        userSelect:    "none",
        whiteSpace:    "nowrap",
      }}>
        {label}
      </p>
      <div style={{
        flex:       1,
        height:     "1px",
        background: isDark
          ? "linear-gradient(90deg,#1f2937,transparent)"
          : "linear-gradient(90deg,#e5e7eb,transparent)",
      }} />
    </div>
  );

  // ── Regular MenuItem ──────────────────────────────────────
  const MenuItem = ({
    item, index,
  }: { item: Menu; index: number }) => {
    const active        = isActive(item.path);
    const [hov, setHov] = React.useState(false);

    return (
      <div
        className="nk-item"
        style={{
          padding:           "2px 8px",
          cursor:            "pointer",
          animationDelay:    `${index * 40}ms`,
          animationFillMode: "both",
        }}
        onClick={handleClick(item)}
      >
        <div
          className="nk-item-inner"
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            display:      "flex",
            alignItems:   "center",
            gap:          "10px",
            padding:      "9px 12px",
            borderRadius: "12px",
            position:     "relative",
            overflow:     "hidden",
            background:   active
              ? "linear-gradient(135deg, #6366f1, #a855f7)"
              : hov ? hoverBg : "transparent",
            boxShadow:    active
              ? "0 4px 16px rgba(99,102,241,0.38)"
              : "none",
            color:        active ? "#fff" : hov ? hoverC : textC,
          }}
        >
          {active && (
            <div className="nk-shimmer" style={{
              position:      "absolute",
              top:           0, left: 0,
              width:         "40%", height: "100%",
              background:    "linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)",
              pointerEvents: "none",
            }} />
          )}
          {active && (
            <span style={{
              position:     "absolute",
              left:         0,
              top:          "50%",
              transform:    "translateY(-50%)",
              width:        "3px",
              height:       "54%",
              background:   "rgba(255,255,255,0.7)",
              borderRadius: "0 3px 3px 0",
            }} />
          )}

          <span style={{
            fontSize:   "18px",
            display:    "flex",
            flexShrink: 0,
            filter:     active
              ? "drop-shadow(0 0 5px rgba(255,255,255,0.4))"
              : "none",
            transition: "filter 0.2s",
          }}>
            {active ? item.activeIcon : item.icon}
          </span>

          <span style={{
            fontSize:     "13px",
            fontWeight:   active ? 700 : 500,
            flex:         1,
            letterSpacing:"0.01em",
            whiteSpace:   "nowrap",
            overflow:     "hidden",
            textOverflow: "ellipsis",
          }}>
            {item.name}
          </span>

          {item.badge !== undefined && item.badge > 0 && (
            <span className="nk-badge-pop" style={{
              fontSize:     "10px",
              fontWeight:   800,
              padding:      "2px 7px",
              borderRadius: "999px",
              background:   active
                ? "rgba(255,255,255,0.22)"
                : "linear-gradient(135deg,#ef4444,#f97316)",
              color:        "#fff",
              flexShrink:   0,
              minWidth:     "20px",
              textAlign:    "center",
            }}>
              {item.badge > 99 ? "99+" : item.badge}
            </span>
          )}

          {active && (
            <span className="nk-pulse" style={{
              width:        "6px",
              height:       "6px",
              borderRadius: "50%",
              background:   "rgba(255,255,255,0.85)",
              flexShrink:   0,
            }} />
          )}
        </div>
      </div>
    );
  };

  // ── Analytics MenuItem — unique animated card ─────────────
  const AnalyticsMenuItem = ({
    item, index,
  }: { item: Menu; index: number }) => {
    const active        = isActive(item.path);
    const [hov, setHov] = React.useState(false);
    const cfg = ANALYTICS_CONFIG.find(c => c.path === item.path) ??
      { accent: "#6366f1", glow: "rgba(99,102,241,0.3)", emoji: "📊", tag: "New" };

    return (
      <div
        className="nk-analytics-item"
        style={{
          padding:           "3px 8px",
          cursor:            "pointer",
          animationDelay:    `${index * 80}ms`,
          animationFillMode: "both",
        }}
        onClick={handleClick(item)}
      >
        {/* Outer glow wrapper */}
        <div
          className={!active && !hov ? "nk-glow" : ""}
          style={{
            // @ts-ignore
            "--glow-color": cfg.glow,
            borderRadius:   "14px",
          }}
        >
          <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
              display:      "flex",
              alignItems:   "center",
              gap:          "10px",
              padding:      "10px 12px",
              borderRadius: "14px",
              position:     "relative",
              overflow:     "hidden",
              transition:   "all 0.22s cubic-bezier(.4,0,.2,1)",
              background:   active
                ? `linear-gradient(135deg, ${cfg.accent}, ${cfg.accent}bb)`
                : hov
                ? isDark
                  ? `${cfg.accent}18`
                  : `${cfg.accent}12`
                : isDark
                ? `${cfg.accent}08`
                : `${cfg.accent}06`,
              border:       active
                ? `1px solid ${cfg.accent}80`
                : hov
                ? `1px solid ${cfg.accent}50`
                : `1px solid ${cfg.accent}25`,
              boxShadow:    active
                ? `0 6px 20px ${cfg.glow}`
                : hov
                ? `0 4px 14px ${cfg.glow}`
                : "none",
              transform:    hov && !active ? "translateX(3px) scale(1.01)" : "none",
            }}
          >
            {/* Active shimmer */}
            {active && (
              <div className="nk-shimmer" style={{
                position:      "absolute",
                top:           0, left: 0,
                width:         "50%", height: "100%",
                background:    "linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)",
                pointerEvents: "none",
              }} />
            )}

            {/* Left active bar with gradient */}
            {active && (
              <span style={{
                position:     "absolute",
                left:         0,
                top:          "50%",
                transform:    "translateY(-50%)",
                width:        "3px",
                height:       "60%",
                background:   `linear-gradient(180deg, ${cfg.accent}, ${cfg.accent}44)`,
                borderRadius: "0 3px 3px 0",
                boxShadow:    `0 0 6px ${cfg.glow}`,
              }} />
            )}

            {/* Floating emoji icon */}
            <span
              className={!active ? "nk-icon-float" : ""}
              style={{
                fontSize:   "18px",
                display:    "flex",
                flexShrink: 0,
                filter:     active
                  ? "drop-shadow(0 0 6px rgba(255,255,255,0.5))"
                  : hov
                  ? `drop-shadow(0 0 4px ${cfg.glow})`
                  : "none",
                transition: "filter 0.2s",
              }}
            >
              {cfg.emoji}
            </span>

            {/* Label + tag */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{
                fontSize:     "12.5px",
                fontWeight:   active ? 700 : 600,
                display:      "block",
                whiteSpace:   "nowrap",
                overflow:     "hidden",
                textOverflow: "ellipsis",
                color:        active
                  ? "#fff"
                  : hov
                  ? cfg.accent
                  : textC,
                transition:   "color 0.2s",
              }}>
                {item.name}
              </span>
            </div>

            {/* Tag pill */}
            <span style={{
              fontSize:     "9px",
              fontWeight:   800,
              padding:      "2px 6px",
              borderRadius: "999px",
              background:   active
                ? "rgba(255,255,255,0.2)"
                : `${cfg.accent}20`,
              color:        active ? "#fff" : cfg.accent,
              flexShrink:   0,
              letterSpacing: "0.5px",
              transition:   "all 0.2s",
            }}>
              {cfg.tag}
            </span>

            {/* Active pulse dot */}
            {active && (
              <span className="nk-pulse" style={{
                width:        "5px",
                height:       "5px",
                borderRadius: "50%",
                background:   "rgba(255,255,255,0.9)",
                flexShrink:   0,
              }} />
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── Analytics Section Header ──────────────────────────────
  const AnalyticsSectionHeader = () => {
    const [tick, setTick] = React.useState(0);

    React.useEffect(() => {
      const t = setInterval(() => setTick(p => p + 1), 2000);
      return () => clearInterval(t);
    }, []);

    const dots = ["·", "··", "···"];

    return (
      <div style={{
        margin:  "12px 8px 6px",
        padding: "10px 14px",
        borderRadius: "14px",
        background: isDark
          ? "linear-gradient(135deg,#0d1117,#1a1a2e)"
          : "linear-gradient(135deg,#f8fafc,#eef2ff)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Animated border */}
        <div
          className="nk-analytics-border"
          style={{
            position:     "absolute",
            inset:        0,
            borderRadius: "14px",
            padding:      "1.5px",
            WebkitMask:   "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Live indicator */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width:        "8px",
              height:       "8px",
              borderRadius: "50%",
              background:   "#10b981",
            }} />
            <div style={{
              position:     "absolute",
              inset:        "-3px",
              borderRadius: "50%",
              background:   "#10b98130",
              animation:    "nk-pulse 1.5s ease-in-out infinite",
            }} />
          </div>

          <div style={{ flex: 1 }}>
            <p style={{
              fontSize:      "10px",
              fontWeight:    800,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color:         isDark ? "#818cf8" : "#6366f1",
              margin:        "0 0 1px",
            }}
              className="nk-sparkle"
            >
              Analytics
            </p>
            <p style={{
              fontSize:  "9px",
              color:     isDark ? "#4b5563" : "#9ca3af",
              margin:    0,
            }}>
              Live insights{dots[tick % 3]}
            </p>
          </div>

          {/* Mini chart bars decoration */}
          <div style={{
            display:    "flex",
            alignItems: "flex-end",
            gap:        "2px",
            height:     "16px",
          }}>
            {[6, 10, 7, 14, 9, 16, 11].map((h, i) => (
              <div
                key={i}
                style={{
                  width:        "3px",
                  height:       `${h}px`,
                  borderRadius: "2px",
                  background:   `linear-gradient(180deg, #6366f1, #a855f7)`,
                  opacity:      0.4 + (i / 7) * 0.6,
                  animation:    `nk-icon-float ${1.5 + i * 0.2}s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      height:        "100%",
      width:         "260px",
      display:       "flex",
      flexDirection: "column",
      background:    bg,
      borderRight:   `1px solid ${border}`,
    }}>

      {/* ── Brand header ── */}
      <div style={{
        padding:        "16px 20px",
        borderBottom:   `1px solid ${border}`,
        flexShrink:     0,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width:          "38px",
            height:         "38px",
            borderRadius:   "11px",
            background:     "linear-gradient(135deg, #6366f1, #a855f7)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            boxShadow:      "0 4px 14px rgba(99,102,241,0.45)",
            flexShrink:     0,
            position:       "relative",
            overflow:       "hidden",
          }}>
            <span style={{ color:"#fff", fontSize:"16px", fontWeight:900, zIndex:1 }}>N</span>
            <div style={{
              position:     "absolute",
              top:          "-10px",
              left:         "-10px",
              width:        "28px",
              height:       "28px",
              borderRadius: "50%",
              background:   "rgba(255,255,255,0.15)",
            }} />
          </div>
          <div>
            <p style={{
              fontSize:      "15px",
              fontWeight:    900,
              letterSpacing: "-0.5px",
              color:         isDark ? "#fff" : "#111827",
              margin:        0,
              lineHeight:    1,
            }}>
              Nexkart
            </p>
            <p style={{
              fontSize:      "9px",
              fontWeight:    700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color:         isDark ? "#6366f1" : "#818cf8",
              margin:        0,
            }}>
              Admin Panel
            </p>
          </div>
        </div>

        {onCollapse && (
          <button
            className="nk-collapse-btn"
            onClick={onCollapse}
            title="Collapse sidebar"
            style={{
              width:          "28px",
              height:         "28px",
              borderRadius:   "8px",
              border:         "none",
              cursor:         "pointer",
              background:     isDark ? "#1f2937" : "#f1f5f9",
              color:          isDark ? "#9ca3af" : "#6b7280",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              fontSize:       "14px",
              flexShrink:     0,
            }}
          >
            ◀
          </button>
        )}
      </div>

      {/* ── Scrollable menu ── */}
      <div
        className="nk-sidebar-scroll"
        style={{ flex:1, overflowY:"auto", overflowX:"hidden", padding:"8px 0" }}
      >
        {/* Main menu */}
        <SectionLabel label="Main Menu" />
        <div style={{ display:"flex", flexDirection:"column", gap:"1px" }}>
          {enrichedRegular.map((item, i) => (
            <MenuItem key={item.name} item={item} index={i} />
          ))}
        </div>

        {/* ── Analytics section ── */}
        {analyticsMenu.length > 0 && (
          <div className="nk-analytics-section">
            <AnalyticsSectionHeader />
            <div style={{ display:"flex", flexDirection:"column", gap:"3px", padding:"0 0 4px" }}>
              {analyticsMenu.map((item, i) => (
                <AnalyticsMenuItem key={item.name} item={item} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{
          height:     "1px",
          margin:     "10px 16px",
          background: isDark
            ? "linear-gradient(90deg,transparent,#1f2937,transparent)"
            : "linear-gradient(90deg,transparent,#e5e7eb,transparent)",
        }} />
      </div>

      {/* ── Account / Logout ── */}
      <div style={{
        flexShrink: 0,
        borderTop:  `1px solid ${border}`,
        padding:    "8px 0 4px",
      }}>
        <SectionLabel label="Account" />
        <div style={{ display:"flex", flexDirection:"column", gap:"1px" }}>
          {menu2.map((item, i) => (
            <MenuItem key={item.name} item={item} index={i} />
          ))}
        </div>

        {/* Version */}
        <div style={{
          padding:    "8px 20px 6px",
          display:    "flex",
          alignItems: "center",
          gap:        "6px",
        }}>
          <div style={{
            width:        "6px",
            height:       "6px",
            borderRadius: "50%",
            background:   "#10b981",
            animation:    "nk-pulse 2s ease-in-out infinite",
          }} />
          <p style={{
            fontSize: "10px",
            color:    isDark ? "#374151" : "#9ca3af",
            margin:   0,
          }}>
            Nexkart Admin v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default DrawerList;