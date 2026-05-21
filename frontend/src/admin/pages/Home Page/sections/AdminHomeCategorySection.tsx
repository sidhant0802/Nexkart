import { useEffect, useState } from "react";
import {
  Box, Button, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Modal, styled, tableCellClasses,
} from "@mui/material";
import EditIcon   from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon    from "@mui/icons-material/Add";
import { useAppDispatch, useAppSelector } from "../../../../Redux Toolkit/Store";
import { fetchHomePageData } from "../../../../Redux Toolkit/Customer/Customer/AsyncThunk";
import { api } from "../../../../Config/Api";
import type { HomeCategory } from "../../../../types/homeDataTypes";
import UpdateHomeCategoryForm from "../UpdateHomeCategoryForm";
import AddHomeCategoryForm    from "../forms/AddHomeCategoryForm";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": { backgroundColor: theme.palette.action.hover },
  "&:last-child td, &:last-child th": { border: 0 },
}));

const modalStyle = {
  position: "absolute" as const,
  top: "50%", left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  maxHeight: "90vh",
  overflowY: "auto" as const,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

interface Props {
  // dataKey = the key in homePageData object (grid, shopByCategories, dealCategories)
  dataKey:       string;
  // dbSection = the actual section value stored in DB (GRID, SHOP_BY_CATEGORIES, DEALS)
  dbSection:     string;
  title:         string;
  description:   string;
}

const AdminHomeCategorySection = ({ dataKey, dbSection, title, description }: Props) => {
  const dispatch = useAppDispatch();
  const homePage = useAppSelector((s) => s.homePage);

  const [editOpen,    setEditOpen]    = useState(false);
  const [addOpen,     setAddOpen]     = useState(false);
  const [selectedCat, setSelectedCat] = useState<HomeCategory | undefined>();

  // Get categories using the correct dataKey
  const categories: HomeCategory[] =
    (homePage.homePageData as any)?.[dataKey] || [];

  useEffect(() => {
    dispatch(fetchHomePageData());
  }, [dispatch]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/home/home-category/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
      });
      // Refresh data
      dispatch(fetchHomePageData());
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed. Check console.");
    }
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setSelectedCat(undefined);
    dispatch(fetchHomePageData());
  };

  const handleAddClose = () => {
    setAddOpen(false);
    dispatch(fetchHomePageData());
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h6" fontWeight="bold">{title}</Typography>
          <Typography variant="body2" color="text.secondary">{description}</Typography>
          <Typography variant="caption" color="text.secondary">
            {categories.length} items • DB section: <code>{dbSection}</code>
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddOpen(true)}
          sx={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
        >
          Add Category
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>#</StyledTableCell>
              <StyledTableCell>Image</StyledTableCell>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Category ID</StyledTableCell>
              <StyledTableCell>Section</StyledTableCell>
              <StyledTableCell>Edit</StyledTableCell>
              <StyledTableCell>Delete</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No categories found for this section.
                    Click "Add Category" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat, i) => (
                <StyledTableRow key={cat._id || i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>
                    <img loading="lazy" decoding="async"
                      src={cat.image}
                      alt={cat.name || cat.categoryId}
                      style={{
                        width: 70, height: 70,
                        objectFit: "cover", borderRadius: 8,
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/70x70/6366f1/white?text=?";
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="bold">
                      {cat.name || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "monospace",
                        background: "#f3f4f6",
                        px: 1, py: 0.5,
                        borderRadius: 1,
                        display: "inline-block",
                      }}
                    >
                      {cat.categoryId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{
                      background: "#e0e7ff",
                      px: 1, py: 0.5,
                      borderRadius: 1,
                      fontFamily: "monospace",
                      fontSize: "10px",
                    }}>
                      {(cat as any).section || dbSection}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => {
                      setSelectedCat(cat);
                      setEditOpen(true);
                    }}>
                      <EditIcon className="text-orange-400" />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDelete(String(cat._id))}>
                      <DeleteIcon className="text-red-500" />
                    </IconButton>
                  </TableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={handleEditClose}>
        <Box sx={modalStyle}>
          <UpdateHomeCategoryForm
            category={selectedCat}
            handleClose={handleEditClose}
          />
        </Box>
      </Modal>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={handleAddClose}>
        <Box sx={modalStyle}>
          <AddHomeCategoryForm
            section={dbSection}
            onClose={handleAddClose}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default AdminHomeCategorySection;