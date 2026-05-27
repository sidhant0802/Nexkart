import * as React from "react";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
  fetchNewSellers,
  markSellerSeen,
  markNotificationSeen,
} from "../../../Redux Toolkit/Admin/adminAnalyticsSlice";
import { useAdminTheme } from "../../context/AdminThemeContext";
import { useSocket, useJoinAdminRoom } from "../../../hooks/useSocket";

export default function SellerNotificationBell() {
  const dispatch   = useAppDispatch();
  const { isDark } = useAdminTheme();
  const { newSellers, pendingCount, notifLoading, notifSeen } =
    useAppSelector((s) => s.adminAnalytics);

  const [open, setOpen]           = React.useState(false);
  const [hasNew, setHasNew]       = React.useState(false);   // ✅ flash on new
  const ref = React.useRef<HTMLDivElement>(null);

  // ✅ Join admin room for real-time
  useJoinAdminRoom();

  // ✅ Listen for real-time new seller notifications
  useSocket("notification:new-seller", (data) => {
    console.log("🆕 Real-time new seller:", data);

    // Refresh seller list
    dispatch(fetchNewSellers());

    // Flash bell animation
    setHasNew(true);
    setTimeout(() => setHasNew(false), 3000);

    // Browser notification
    if (Notification.permission === "granted") {
      new Notification(data.title || "🆕 New Seller", {
        body: data.message || `${data.sellerName} just signed up`,
        icon: "/favicon.ico",
        tag:  "new-seller",
      });
    }

    // Subtle beep
    try {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRl4DAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToDAACBgIB/gn6Cf4F/gn+Bf4F/gn+Bf4F/gn+Bf4F/gn+Bf4F/gX+Bf4F/gX+Bf4F/gX+Bf4F/gX+Bf4F/gX+Bf4F/gX+B"
      );
      audio.volume = 0.25;
      audio.play().catch(() => {});
    } catch {}
  });

  // ✅ Request notification permission once
  React.useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Initial fetch (no more polling — replaced by Socket.IO!)
  React.useEffect(() => {
    dispatch(fetchNewSellers());
  }, []);

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const bg   = isDark ? "#0f1117" : "#ffffff";
  const bdr  = isDark ? "#1f2937" : "#f1f5f9";
  const txt  = isDark ? "#f9fafb" : "#111827";
  const txt2 = isDark ? "#9ca3af" : "#6b7280";

  // ✅ Use array (not Set) — notifSeen is string[]
  const unseen = newSellers.filter((s) => !notifSeen.includes(s._id));
  const badge  = unseen.length;

  const statusColors: Record<string, { color: string; bg: string }> = {
    PENDING_VERIFICATION: { color: "#f59e0b", bg: "#fef3c7" },
    ACTIVE:               { color: "#10b981", bg: "#d1fae5" },
    SUSPENDED:            { color: "#ef4444", bg: "#fee2e2" },
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const m    = Math.floor(diff / 60_000);
    const h    = Math.floor(m / 60);
    const d    = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return "Just now";
  };

  const handleBellClick = () => {
    setOpen((o) => !o);
    setHasNew(false);
    // Mark all as seen (using array via Redux action)
    newSellers.forEach((s) => {
      if (!notifSeen.includes(s._id)) {
        dispatch(markNotificationSeen(s._id));
      }
    });
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* ── Bell Button ── */}
      <button
        onClick={handleBellClick}
        style={{
          position:      "relative",
          width:         "40px",
          height:        "40px",
          borderRadius:  "12px",
          border:        `1px solid ${hasNew ? "#ef4444" : bdr}`,
          background:    bg,
          cursor:        "pointer",
          display:       "flex",
          alignItems:    "center",
          justifyContent:"center",
          fontSize:      "18px",
          transition:    "all .2s",
          boxShadow:     hasNew
            ? "0 0 0 4px rgba(239,68,68,0.2)"
            : isDark
              ? "0 1px 3px rgba(0,0,0,.4)"
              : "0 1px 3px rgba(0,0,0,.06)",
          animation: hasNew ? "bellShake 0.8s ease-in-out" : undefined,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform   = "scale(1.05)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#6366f1";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform   = "scale(1)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = hasNew ? "#ef4444" : bdr;
        }}
      >
        🔔
        {badge > 0 && (
          <span style={{
            position:      "absolute",
            top:           "-4px",
            right:         "-4px",
            minWidth:      "18px",
            height:        "18px",
            background:    "linear-gradient(135deg,#ef4444,#f97316)",
            color:         "#fff",
            borderRadius:  "999px",
            fontSize:      "10px",
            fontWeight:    800,
            display:       "flex",
            alignItems:    "center",
            justifyContent:"center",
            padding:       "0 4px",
            animation:     "pulseBadge 2s infinite",
            boxShadow:     "0 2px 6px rgba(239,68,68,0.4)",
          }}>
            {badge > 9 ? "9+" : badge}
          </span>
        )}

        {/* ✅ Live indicator dot */}
        <span style={{
          position:     "absolute",
          bottom:       "-2px",
          right:        "-2px",
          width:        "8px",
          height:       "8px",
          borderRadius: "50%",
          background:   "#10b981",
          border:       `2px solid ${bg}`,
          boxShadow:    "0 0 6px rgba(16,185,129,0.6)",
          animation:    "livePulse 1.6s ease-in-out infinite",
        }} />

        <style>{`
          @keyframes pulseBadge {
            0%,100% { transform: scale(1); }
            50%      { transform: scale(1.2); }
          }
          @keyframes livePulse {
            0%,100% { opacity: 1;   transform: scale(1); }
            50%      { opacity: 0.5; transform: scale(1.3); }
          }
          @keyframes bellShake {
            0%,100%        { transform: rotate(0deg); }
            10%,30%,50%,70%,90% { transform: rotate(-10deg); }
            20%,40%,60%,80%     { transform: rotate(10deg); }
          }
        `}</style>
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div style={{
          position:     "absolute",
          right:        0,
          top:          "calc(100% + 8px)",
          width:        "360px",
          maxHeight:    "480px",
          background:   bg,
          border:       `1px solid ${bdr}`,
          borderRadius: "16px",
          boxShadow:    isDark
            ? "0 16px 48px rgba(0,0,0,.5)"
            : "0 16px 48px rgba(0,0,0,.12)",
          zIndex:    9999,
          overflow:  "hidden",
          animation: "fadeSlide .2s ease",
        }}>
          <style>{`
            @keyframes fadeSlide {
              from { opacity:0; transform: translateY(-8px); }
              to   { opacity:1; transform: translateY(0); }
            }
          `}</style>

          {/* Header */}
          <div style={{
            padding:        "14px 16px",
            borderBottom:   `1px solid ${bdr}`,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
          }}>
            <div>
              <p style={{ fontSize: "14px", fontWeight: 800, color: txt, margin: "0 0 2px",
                display: "flex", alignItems: "center", gap: "6px" }}>
                🔔 New Sellers
                {/* ✅ Live badge */}
                <span style={{
                  fontSize:     "9px",
                  fontWeight:   800,
                  padding:      "2px 6px",
                  borderRadius: "999px",
                  background:   "#10b98120",
                  color:        "#10b981",
                  letterSpacing:"0.5px",
                }}>
                  ● LIVE
                </span>
              </p>
              <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>
                {pendingCount} pending verification
              </p>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <span style={{
                padding:      "3px 8px",
                borderRadius: "999px",
                background:   "#f59e0b20",
                color:        "#f59e0b",
                fontSize:     "11px",
                fontWeight:   700,
              }}>
                {newSellers.length} new (7d)
              </span>
            </div>
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", maxHeight: "360px" }}>
            {notifLoading ? (
              <div style={{ padding: "40px", textAlign: "center", color: txt2, fontSize: "13px" }}>
                ⏳ Loading...
              </div>
            ) : newSellers.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center" }}>
                <p style={{ fontSize: "32px", margin: "0 0 8px" }}>🎉</p>
                <p style={{ color: txt2, fontSize: "13px", fontWeight: 600 }}>
                  No new sellers this week
                </p>
                <p style={{ color: txt2, fontSize: "10px", marginTop: "8px" }}>
                  You'll see new registrations instantly here ⚡
                </p>
              </div>
            ) : (
              newSellers.map((seller: any) => {
                const st = statusColors[seller.accountStatus] ??
                  { color: "#6b7280", bg: "#f3f4f6" };
                // ✅ Use .includes() — notifSeen is now string[]
                const isSeen = notifSeen.includes(seller._id);
                return (
                  <div key={seller._id} style={{
                    padding:      "12px 16px",
                    borderBottom: `1px solid ${bdr}`,
                    display:      "flex",
                    alignItems:   "flex-start",
                    gap:          "12px",
                    background:   isSeen
                      ? "transparent"
                      : (isDark ? "#6366f108" : "#6366f105"),
                    transition: "background .15s",
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width:          "38px",
                      height:         "38px",
                      borderRadius:   "10px",
                      background:     "linear-gradient(135deg,#6366f1,#a855f7)",
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                      fontSize:       "15px",
                      fontWeight:     900,
                      color:          "#fff",
                      flexShrink:     0,
                    }}>
                      {seller.sellerName?.charAt(0)?.toUpperCase() ?? "S"}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display:        "flex",
                        alignItems:     "center",
                        justifyContent: "space-between",
                        marginBottom:   "2px",
                      }}>
                        <p style={{
                          fontSize:     "13px",
                          fontWeight:   700,
                          color:        txt,
                          margin:       0,
                          overflow:     "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace:   "nowrap",
                        }}>
                          {seller.sellerName}
                          {!isSeen && (
                            <span style={{
                              display:      "inline-block",
                              width:        "6px",
                              height:       "6px",
                              borderRadius: "50%",
                              background:   "#6366f1",
                              marginLeft:   "6px",
                              verticalAlign:"middle",
                            }} />
                          )}
                        </p>
                        <span style={{
                          fontSize:   "10px",
                          color:      txt2,
                          flexShrink: 0,
                          marginLeft: "8px",
                        }}>
                          {timeAgo(seller.createdAt)}
                        </span>
                      </div>
                      <p style={{
                        fontSize:    "11px",
                        color:       txt2,
                        margin:      "0 0 6px",
                        overflow:    "hidden",
                        textOverflow:"ellipsis",
                        whiteSpace:  "nowrap",
                      }}>
                        {seller.email}
                      </p>

                      {/* Status + Action */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                        <span style={{
                          padding:      "2px 7px",
                          borderRadius: "999px",
                          fontSize:     "10px",
                          fontWeight:   700,
                          background:   st.bg,
                          color:        st.color,
                        }}>
                          {seller.accountStatus === "PENDING_VERIFICATION"
                            ? "Pending"
                            : seller.accountStatus}
                        </span>

                        {seller.accountStatus === "PENDING_VERIFICATION" && (
                          <button
                            onClick={() => dispatch(markSellerSeen(seller._id))}
                            style={{
                              padding:      "2px 8px",
                              borderRadius: "6px",
                              border:       "none",
                              cursor:       "pointer",
                              fontSize:     "10px",
                              fontWeight:   700,
                              background:   "linear-gradient(135deg,#10b981,#06b6d4)",
                              color:        "#fff",
                            }}
                          >
                            ✓ Activate
                          </button>
                        )}

                        {seller.businessDetails?.businessName && (
                          <span style={{
                            fontSize:     "10px",
                            color:        txt2,
                            overflow:     "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace:   "nowrap",
                            maxWidth:     "100px",
                          }}>
                            🏪 {seller.businessDetails.businessName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding:      "10px 16px",
            borderTop:    `1px solid ${bdr}`,
            textAlign:    "center",
            display:      "flex",
            alignItems:   "center",
            justifyContent:"space-between",
          }}>
            <span style={{
              fontSize:   "10px",
              color:      txt2,
              display:    "flex",
              alignItems: "center",
              gap:        "4px",
            }}>
              <span style={{
                width:        "6px",
                height:       "6px",
                borderRadius: "50%",
                background:   "#10b981",
                animation:    "livePulse 1.6s ease-in-out infinite",
              }} />
              Real-time updates
            </span>
            <a href="/admin/sellers" style={{
              fontSize:       "12px",
              fontWeight:     700,
              color:          "#6366f1",
              textDecoration: "none",
            }}>
              View All →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}