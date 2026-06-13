import { Box } from "@mui/material";
import CatalogTab from "./CatalogTab";
import { useAppSelector } from "../../../Redux Toolkit/Store";

const Marketplace = () => {
  const { catalog } = useAppSelector((s) => s.sellerProduct);

  return (
    <Box>
      <Box sx={{
        background: "linear-gradient(135deg,#eff6ff,#ffffff)",
        borderRadius: 3, p: 3, mb: 3, border: "1px solid #bfdbfe",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <Box>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1e40af", margin: 0 }}>
            🏪 Marketplace
          </h1>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 0" }}>
            Browse products in Nexkart catalog and start selling instantly. Set your own price & stock.
          </p>
        </Box>
        <Box sx={{
          padding: "12px 20px",
          background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
          borderRadius: 2,
          color: "#fff",
          textAlign: "center",
          minWidth: 120,
        }}>
          <p style={{ fontSize: 11, opacity: 0.9, margin: 0, letterSpacing: 1, textTransform: "uppercase" }}>
            Available
          </p>
          <p style={{ fontSize: 28, fontWeight: 800, margin: "2px 0 0", lineHeight: 1 }}>
            {catalog.length}
          </p>
        </Box>
      </Box>

      <Box sx={{
        background: "#fff", borderRadius: 3,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        p: 3,
      }}>
        <CatalogTab />
      </Box>
    </Box>
  );
};

export default Marketplace;