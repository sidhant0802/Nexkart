import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip,
  Switch, Tooltip, CircularProgress, Box,
  Typography, Avatar, Button,
} from "@mui/material";
import DeleteIcon   from "@mui/icons-material/Delete";
import EditIcon     from "@mui/icons-material/Edit";
import AddIcon      from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
  fetchSellerProducts,
  deleteProduct,
  updateListing,
  type SellerListing,
} from "../../../Redux Toolkit/Seller/sellerProductSlice";

const ProductTable = () => {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const { sellerProduct } = useAppSelector((s) => s);
  const jwt = localStorage.getItem("jwt") || "";

  useEffect(() => {
    dispatch(fetchSellerProducts(jwt));
  }, [dispatch]);

  const handleDelete = (productId: string) => {
    if (window.confirm("Delete this product?")) {
      dispatch(deleteProduct(productId)).then(() => {
        dispatch(fetchSellerProducts(jwt));
      });
    }
  };

  const handleToggleActive = (listing: SellerListing) => {
    dispatch(updateListing({
      listingId: listing._id,
      data: { isActive: !listing.isActive },
    }));
  };

  if (sellerProduct.loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress sx={{ color: "#10b981" }} />
      </Box>
    );
  }

  if (sellerProduct.listings.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No products listed yet
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/seller/add-product")}
          sx={{ background: "linear-gradient(135deg,#10b981,#059669)", mt: 2 }}
        >
          Add Your First Product
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={700}>
          My Products ({sellerProduct.listings.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/seller/add-product")}
          sx={{ background: "linear-gradient(135deg,#10b981,#059669)" }}
        >
          Add Product
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: "#f0fdf4" }}>
              <TableCell><strong>Product</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>MRP</strong></TableCell>
              <TableCell><strong>Selling Price</strong></TableCell>
              <TableCell><strong>Discount</strong></TableCell>
              <TableCell><strong>Stock</strong></TableCell>
              <TableCell><strong>Active</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sellerProduct.listings.map((listing: SellerListing) => {
              const product = listing.product;
              if (!product) return null;
              return (
                <TableRow key={listing._id} hover>
                  {/* Product */}
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar
                        src={product.images?.[0]}
                        variant="rounded"
                        sx={{ width: 48, height: 48 }}
                      >
                        {product.title?.[0]}
                      </Avatar>
                      <Box>
                        <Typography fontSize={13} fontWeight={600} noWrap maxWidth={180}>
                          {product.title}
                        </Typography>
                        <Typography fontSize={11} color="text.secondary">
                          {product.brand || "No brand"}
                        </Typography>
                        <Typography fontSize={10} color="text.secondary">
                          {product.color}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <Typography fontSize={12} color="text.secondary">
                      {(product.category as any)?.name || "—"}
                    </Typography>
                  </TableCell>

                  {/* MRP */}
                  <TableCell>
                    <Typography fontSize={13} sx={{ textDecoration: "line-through", color: "text.secondary" }}>
                      ₹{listing.mrpPrice}
                    </Typography>
                  </TableCell>

                  {/* Selling Price */}
                  <TableCell>
                    <Typography fontSize={13} fontWeight={700} color="#059669">
                      ₹{listing.sellingPrice}
                    </Typography>
                  </TableCell>

                  {/* Discount */}
                  <TableCell>
                    <Chip
                      label={`${listing.discountPercent}% off`}
                      size="small"
                      sx={{ background: "#dcfce7", color: "#15803d", fontWeight: 700 }}
                    />
                  </TableCell>

                  {/* Stock */}
                  <TableCell>
                    <Chip
                      label={listing.quantity === 0 ? "Out of Stock" : `${listing.quantity} units`}
                      size="small"
                      color={listing.quantity === 0 ? "error" : listing.quantity < 10 ? "warning" : "success"}
                      variant="outlined"
                    />
                  </TableCell>

                  {/* Active Toggle */}
                  <TableCell>
                    <Tooltip title={listing.isActive ? "Deactivate" : "Activate"}>
                      <Switch
                        checked={listing.isActive}
                        onChange={() => handleToggleActive(listing)}
                        size="small"
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": { color: "#10b981" },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                            backgroundColor: "#10b981",
                          },
                        }}
                      />
                    </Tooltip>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <Box display="flex" gap={0.5}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/seller/add-product`, {
                            state: { listing, mode: "edit" }
                          })}
                          sx={{ color: "#6366f1" }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(product._id)}
                          sx={{ color: "#ef4444" }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ProductTable;