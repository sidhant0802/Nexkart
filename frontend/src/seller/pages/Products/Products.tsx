import { Box } from "@mui/material";
import MyListingsTab from "./MyListingsTab";
import { useAppSelector } from "../../../Redux Toolkit/Store";

const Products = () => {
  const { listings } = useAppSelector((s) => s.sellerProduct);

  return (
    <Box>
      <Box sx={{
        background: "linear-gradient(135deg,#f0fdf4,#ffffff)",
        borderRadius: 3, p: 3, mb: 3, border: "1px solid #d1fae5",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <Box>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#065f46", margin: 0 }}>
            My Products
          </h1>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 0" }}>
            Manage prices, stock, and visibility for your active listings
          </p>
        </Box>
        <Box sx={{
          padding: "12px 20px",
          background: "linear-gradient(135deg,#10b981,#059669)",
          borderRadius: 2,
          color: "#fff",
          textAlign: "center",
          minWidth: 120,
        }}>
          <p style={{ fontSize: 11, opacity: 0.9, margin: 0, letterSpacing: 1, textTransform: "uppercase" }}>
            Total Listings
          </p>
          <p style={{ fontSize: 28, fontWeight: 800, margin: "2px 0 0", lineHeight: 1 }}>
            {listings.length}
          </p>
        </Box>
      </Box>

      <Box sx={{
        background: "#fff", borderRadius: 3,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        p: 3,
      }}>
        <MyListingsTab />
      </Box>
    </Box>
  );
};

export default Products;