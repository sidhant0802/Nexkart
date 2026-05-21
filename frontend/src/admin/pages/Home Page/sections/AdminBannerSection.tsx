import { useEffect, useState } from "react";
import {
  Box, Button, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Modal, Chip, styled, tableCellClasses, Alert,
} from "@mui/material";
import EditIcon   from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon    from "@mui/icons-material/Add";
import { useAppDispatch, useAppSelector } from "../../../../Redux Toolkit/Store";
import {
  fetchBanners, deleteBanner,
} from "../../../../Redux Toolkit/Admin/bannerSlice";
import BannerForm from "../forms/BannerForm";

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
  width: 600,
  maxHeight: "90vh",
  overflowY: "auto" as const,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const AdminBannerSection = () => {
  const dispatch = useAppDispatch();
  const { banners, loading } = useAppSelector((s) => s.banner);

  const [open,           setOpen]           = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  const handleAdd = () => {
    setSelectedBanner(null);
    setOpen(true);
  };

  const handleEdit = (banner: any) => {
    setSelectedBanner(banner);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this banner?")) {
      dispatch(deleteBanner(id));
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedBanner(null);
    dispatch(fetchBanners());
  };

  const activeCount = banners.filter((b) => b.isActive).length;
  const hiddenCount = banners.filter((b) => !b.isActive).length;

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            🎠 Banner Slides
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Control the main banner slider on home page
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
            fontWeight: "bold",
          }}
        >
          Add Banner
        </Button>
      </Box>

      {/* Stats */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <Chip label={`📊 Total: ${banners.length}`} variant="outlined" />
        <Chip
          label={`🟢 ${activeCount} active on home`}
          color="success"
          variant="outlined"
          size="small"
        />
        {hiddenCount > 0 && (
          <Chip
            label={`⚪ ${hiddenCount} hidden`}
            variant="outlined"
            size="small"
          />
        )}
      </Box>

      {/* Info */}
      <Alert severity="info" sx={{ mb: 2 }}>
        Banners appear as full-width slides at the top of the home page.
        Each banner has a title, image, badge, CTA buttons and stats.
        Toggle <strong>Active</strong> to show/hide a banner.
      </Alert>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>#</StyledTableCell>
              <StyledTableCell>Preview</StyledTableCell>
              <StyledTableCell>Title</StyledTableCell>
              <StyledTableCell>Highlight</StyledTableCell>
              <StyledTableCell>Badge</StyledTableCell>
              <StyledTableCell>Primary CTA</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Edit</StyledTableCell>
              <StyledTableCell>Delete</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  Loading banners...
                </TableCell>
              </TableRow>
            ) : banners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <Box>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No banners yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Click "Add Banner" to create your first banner slide
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAdd}
                      size="small"
                    >
                      Add First Banner
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              banners.map((banner, i) => (
                <StyledTableRow key={banner._id}>
                  <TableCell>{i + 1}</TableCell>

                  {/* Preview */}
                  <TableCell>
                    <img loading="lazy" decoding="async"
                      src={banner.image}
                      alt={banner.title}
                      style={{
                        width: 120, height: 60,
                        objectFit: "cover", borderRadius: 8,
                        border: banner.isActive
                          ? "2px solid #6366f1"
                          : "2px solid #e5e7eb",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/120x60/6366f1/white?text=Banner";
                      }}
                    />
                  </TableCell>

                  {/* Title */}
                  <TableCell>
                    <Typography fontWeight="bold" fontSize={14}>
                      {banner.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {banner.subtitle?.slice(0, 40)}
                      {banner.subtitle?.length > 40 ? "..." : ""}
                    </Typography>
                  </TableCell>

                  {/* Highlight */}
                  <TableCell>
                    <Typography
                      sx={{
                        color: banner.accent || "#6366f1",
                        fontWeight: "bold",
                        fontSize: 13,
                      }}
                    >
                      {banner.highlight}
                    </Typography>
                    <Box
                      sx={{
                        width: 16, height: 16,
                        borderRadius: 0.5,
                        background: banner.accent || "#6366f1",
                        display: "inline-block",
                        ml: 1,
                        verticalAlign: "middle",
                      }}
                    />
                  </TableCell>

                  {/* Badge */}
                  <TableCell>
                    <Chip
                      label={banner.badge || "—"}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>

                  {/* CTA */}
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" fontSize={12}>
                      {banner.cta}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: "monospace", fontSize: 10 }}
                    >
                      {banner.ctaLink}
                    </Typography>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Chip
                      label={banner.isActive ? "🟢 Active" : "⚪ Hidden"}
                      color={banner.isActive ? "success" : "default"}
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    />
                  </TableCell>

                  {/* Edit */}
                  <TableCell>
                    <IconButton onClick={() => handleEdit(banner)}>
                      <EditIcon sx={{ color: "#f59e0b" }} />
                    </IconButton>
                  </TableCell>

                  {/* Delete */}
                  <TableCell>
                    <IconButton onClick={() => handleDelete(banner._id!)}>
                      <DeleteIcon sx={{ color: "#ef4444" }} />
                    </IconButton>
                  </TableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <BannerForm banner={selectedBanner} onClose={handleClose} />
        </Box>
      </Modal>
    </Box>
  );
};

export default AdminBannerSection;