import { Box, Alert } from "@mui/material";
import AddProductForm from "./AddProductForm";

const AddNewProduct = () => {
  return (
    <Box>
      <Box sx={{
        background: "linear-gradient(135deg,#fef3c7,#ffffff)",
        borderRadius: 3, p: 3, mb: 3, border: "1px solid #fde68a",
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#92400e", margin: 0 }}>
          ➕ Add a New Product
        </h1>
        <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 0" }}>
          Create a brand new product listing not yet in the catalog
        </p>
      </Box>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        💡 <strong>Tip:</strong> Before adding a new product, check the{" "}
        <a href="/seller/marketplace" style={{ color: "#2563eb", fontWeight: 700 }}>
          Marketplace
        </a>{" "}
        — your product may already exist. Selling existing products is faster and gets more views!
      </Alert>

      <Box sx={{
        background: "#fff",
        borderRadius: 3,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        p: 3,
      }}>
        <AddProductForm />
      </Box>
    </Box>
  );
};

export default AddNewProduct;