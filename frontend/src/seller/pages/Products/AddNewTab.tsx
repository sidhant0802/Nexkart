import { Box, Alert } from "@mui/material";
import AddProductForm from "./AddProductForm";

const AddNewTab = () => {
  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Use this form only if the product is <strong>not already in our catalog</strong>.
        Otherwise, use the <strong>Browse Catalog</strong> tab to start selling existing products faster.
      </Alert>
      <AddProductForm />
    </Box>
  );
};

export default AddNewTab;