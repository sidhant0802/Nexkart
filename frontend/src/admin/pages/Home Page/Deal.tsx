import { useState }       from "react";
import DealsTable         from "./DealsTable";
import DealsCategoryTable from "./DealsCategoryTable";
import CreateDealForm     from "./CreateDealForm";

// ✅ NO useAdminTheme import - space in folder name breaks Vite resolution

const tabs = [
  { name: "Deals",       emoji: "⚡" },
  { name: "Categories",  emoji: "📁" },
  { name: "Create Deal", emoji: "➕" },
];

const Deal = () => {
  const [activeTab, setActiveTab] = useState("Deals");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Header */}
      <div
        style={{
          borderRadius: "16px",
          padding:      "20px 24px",
          background:   "#ffffff",
          border:       "1px solid #f1f5f9",
          boxShadow:    "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <h1
          style={{
            fontSize:   "20px",
            fontWeight: 900,
            color:      "#111827",
            margin:     "0 0 4px",
          }}
        >
          ⚡ Deal Management
        </h1>
        <p
          style={{
            fontSize: "13px",
            color:    "#9ca3af",
            margin:   0,
          }}
        >
          Create and manage deals shown on the home page
        </p>

        {/* Tabs */}
        <div
          style={{
            display:   "flex",
            gap:       "8px",
            marginTop: "16px",
            flexWrap:  "wrap",
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                style={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "6px",
                  padding:      "8px 16px",
                  borderRadius: "10px",
                  border:       "none",
                  cursor:       "pointer",
                  fontSize:     "13px",
                  fontWeight:   700,
                  transition:   "all 0.2s ease",
                  background:   isActive
                    ? "linear-gradient(135deg, #6366f1, #a855f7)"
                    : "#f8fafc",
                  color:        isActive ? "#ffffff" : "#6b7280",
                  boxShadow:    isActive
                    ? "0 4px 12px rgba(99,102,241,0.35)"
                    : "none",
                  transform:    isActive ? "scale(1.02)" : "scale(1)",
                }}
              >
                <span>{tab.emoji}</span>
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === "Deals"       && <DealsTable />}
        {activeTab === "Categories"  && <DealsCategoryTable />}
        {activeTab === "Create Deal" && (
          <div
            style={{
              borderRadius:    "16px",
              padding:         "24px",
              background:      "#ffffff",
              border:          "1px solid #f1f5f9",
              display:         "flex",
              justifyContent:  "center",
            }}
          >
            <CreateDealForm />
          </div>
        )}
      </div>
    </div>
  );
};

export default Deal;