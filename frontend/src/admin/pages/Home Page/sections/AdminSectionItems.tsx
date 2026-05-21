import { useEffect, useState } from "react";
import {
  Box, Button, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Modal, Chip, styled, tableCellClasses, Switch, Tooltip,
  Alert, Divider, TextField,
} from "@mui/material";
import EditIcon          from "@mui/icons-material/Edit";
import DeleteIcon        from "@mui/icons-material/Delete";
import AddIcon           from "@mui/icons-material/Add";
import VisibilityIcon    from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ArrowUpwardIcon   from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { useAppDispatch, useAppSelector } from "../../../../Redux Toolkit/Store";
import {
  fetchSectionItems,
  deleteSectionItem,
  updateSectionItem,
  reorderSectionItems,
} from "../../../../Redux Toolkit/Admin/sectionItemSlice";
import { api } from "../../../../Config/Api";
import type { SectionItem } from "../../../../types/homeDataTypes";
import SectionItemForm from "../forms/SectionItemForm";

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

const SECTION_INFO: Record<string, { emoji: string; color: string }> = {
  men:         { emoji: "👔", color: "#3b82f6" },
  women:       { emoji: "👗", color: "#ec4899" },
  electronics: { emoji: "💻", color: "#6366f1" },
  fashion:     { emoji: "✨", color: "#a855f7" },
  lightning:   { emoji: "⚡", color: "#f97316" },
};

interface Props {
  section:     "men" | "women" | "electronics" | "fashion" | "lightning";
  title:       string;
  description: string;
}

const AdminSectionItems = ({ section, title, description }: Props) => {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.sectionItem);

  const [open,         setOpen]         = useState(false);
  const [selectedItem, setSelectedItem] = useState<SectionItem | null>(null);
  const [renameOpen,   setRenameOpen]   = useState(false);
  const [renameSub,    setRenameSub]    = useState({ oldName: "", newName: "" });

  // Filter + sort
  const sectionItems = items
    .filter((i) => i.section === section)
    .sort((a, b) => a.order - b.order);

  const activeCount = sectionItems.filter((i) => i.isActive).length;
  const hiddenCount = sectionItems.filter((i) => !i.isActive).length;
  const info        = SECTION_INFO[section];

  // Group by subcategory
  const grouped: Record<string, SectionItem[]> = {};
  sectionItems.forEach((item) => {
    const sub = item.subcategory || "General";
    if (!grouped[sub]) grouped[sub] = [];
    grouped[sub].push(item);
  });
  const subcategories = Object.keys(grouped);

  useEffect(() => {
    dispatch(fetchSectionItems(section));
  }, [dispatch, section]);

  const handleAdd = () => { setSelectedItem(null); setOpen(true); };
  const handleEdit = (item: SectionItem) => { setSelectedItem(item); setOpen(true); };

  const handleDelete = (id: string) => {
    if (window.confirm("Permanently delete this item?")) {
      dispatch(deleteSectionItem(id));
    }
  };

  const handleToggleActive = (item: SectionItem) => {
    dispatch(updateSectionItem({
      id: item._id!, data: { isActive: !item.isActive },
    })).then(() => dispatch(fetchSectionItems(section)));
  };

  const handleMove = (allItems: SectionItem[], index: number, direction: "up" | "down") => {
    const newItems = [...allItems];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newItems.length) return;
    [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];
    const ids = newItems.map((i) => i._id!);
    dispatch(reorderSectionItems(ids)).then(() => dispatch(fetchSectionItems(section)));
  };

  const handleRenameSubcategory = async () => {
    if (!renameSub.newName.trim()) return;
    try {
      await api.patch("/admin/section-items/rename-subcategory", {
        section,
        oldName: renameSub.oldName,
        newName: renameSub.newName.trim(),
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });
      setRenameOpen(false);
      setRenameSub({ oldName: "", newName: "" });
      dispatch(fetchSectionItems(section));
    } catch (err) {
      console.error("Rename failed", err);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedItem(null);
    dispatch(fetchSectionItems(section));
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h6" fontWeight="bold">{info?.emoji} {title}</Typography>
          <Typography variant="body2" color="text.secondary">{description}</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}
          sx={{ background: `linear-gradient(135deg, ${info?.color || "#6366f1"}, #a855f7)` }}>
          Add Item
        </Button>
      </Box>

      {/* Stats */}
      <Box sx={{ mb: 2, p: 2, borderRadius: 2, background: "linear-gradient(135deg, #f0f4ff, #faf5ff)", border: "1px solid #e0e7ff", display: "flex", gap: 3, alignItems: "center", flexWrap: "wrap" }}>
        <Typography variant="body2">📊 Total: <strong>{sectionItems.length}</strong></Typography>
        <Chip icon={<VisibilityIcon sx={{ fontSize: 16 }} />} label={`${activeCount} on home`} color="success" size="small" variant="outlined" />
        {hiddenCount > 0 && (
          <Chip icon={<VisibilityOffIcon sx={{ fontSize: 16 }} />} label={`${hiddenCount} hidden`} color="default" size="small" variant="outlined" />
        )}
        <Typography variant="body2">📁 {subcategories.length} subcategories</Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        Items are grouped by <strong>subcategory</strong>. Toggle ON/OFF to control visibility.
        Click the ✏️ icon next to subcategory name to rename it.
      </Alert>

      {/* Grouped Tables */}
      {loading ? (
        <Typography align="center" sx={{ py: 4 }}>Loading...</Typography>
      ) : sectionItems.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>No items yet</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd} size="small">Add First Item</Button>
        </Box>
      ) : (
        subcategories.map((subName) => (
          <Box key={subName} sx={{ mb: 4 }}>
            {/* Subcategory Header */}
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: info?.color }}>
                📁 {subName}
              </Typography>
              <Chip label={`${grouped[subName].length} items`} size="small" variant="outlined" />
              <Chip
                label={`${grouped[subName].filter(i => i.isActive).length} active`}
                size="small" color="success" variant="outlined"
              />
              <Tooltip title={`Rename "${subName}"`}>
                <IconButton size="small" onClick={() => {
                  setRenameSub({ oldName: subName, newName: subName });
                  setRenameOpen(true);
                }}>
                  <DriveFileRenameOutlineIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>

            <TableContainer component={Paper} sx={{ mb: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <StyledTableCell width={40}>#</StyledTableCell>
                    <StyledTableCell width={50}>↕</StyledTableCell>
                    <StyledTableCell width={65}>Image</StyledTableCell>
                    <StyledTableCell>Name</StyledTableCell>
                    <StyledTableCell>Category ID</StyledTableCell>
                    {section === "lightning" && <StyledTableCell>Discount</StyledTableCell>}
                    <StyledTableCell width={130} align="center">Show on Home</StyledTableCell>
                    <StyledTableCell width={45}>Edit</StyledTableCell>
                    <StyledTableCell width={45}>Del</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grouped[subName].map((item, i) => (
                    <StyledTableRow key={item._id}
                      sx={{ opacity: item.isActive ? 1 : 0.5, transition: "opacity 0.3s", "&:hover": { opacity: 1 } }}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>
                        <Box display="flex" flexDirection="column">
                          <IconButton size="small" disabled={i === 0}
                            onClick={() => handleMove(grouped[subName], i, "up")}>
                            <ArrowUpwardIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                          <IconButton size="small" disabled={i === grouped[subName].length - 1}
                            onClick={() => handleMove(grouped[subName], i, "down")}>
                            <ArrowDownwardIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <img loading="lazy" decoding="async" src={item.image} alt={item.name}
                          style={{ width: 45, height: 45, objectFit: "cover", borderRadius: 8,
                            border: item.isActive ? `2px solid ${info?.color}` : "2px solid #e5e7eb" }}
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/45x45"; }} />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold" fontSize={13}>{item.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: "monospace", background: "#f3f4f6", px: 1, py: 0.5, borderRadius: 1, display: "inline-block", fontSize: 11 }}>
                          {item.categoryId}
                        </Typography>
                      </TableCell>
                      {section === "lightning" && (
                        <TableCell><Chip label={item.discount || "—"} color="warning" size="small" /></TableCell>
                      )}
                      <TableCell align="center">
                        <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                          <Switch checked={item.isActive} onChange={() => handleToggleActive(item)} color="success" size="small" />
                          <Typography variant="caption" sx={{ color: item.isActive ? "success.main" : "text.disabled", fontWeight: "bold", fontSize: 10 }}>
                            {item.isActive ? "ON" : "OFF"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(item)} size="small">
                          <EditIcon sx={{ color: "#f59e0b", fontSize: 18 }} />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleDelete(item._id!)} size="small">
                          <DeleteIcon sx={{ color: "#ef4444", fontSize: 18 }} />
                        </IconButton>
                      </TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))
      )}

      {/* Footer */}
      {sectionItems.length > 0 && (
        <Box sx={{ mt: 1, p: 1.5, borderRadius: 1, background: "#fafafa" }}>
          <Typography variant="caption" color="text.secondary">
            🏠 <strong>{activeCount}</strong> items visible on Nexkart home page
            {hiddenCount > 0 && ` • ${hiddenCount} hidden`}
          </Typography>
        </Box>
      )}

      {/* Add/Edit Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <SectionItemForm item={selectedItem} section={section} onClose={handleClose}
            existingSubcategories={subcategories} />
        </Box>
      </Modal>

      {/* Rename Subcategory Modal */}
      <Modal open={renameOpen} onClose={() => setRenameOpen(false)}>
        <Box sx={{ ...modalStyle, width: 400 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            ✏️ Rename Subcategory
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Renaming "<strong>{renameSub.oldName}</strong>" will update all items in this group.
          </Typography>
          <TextField
            fullWidth label="New Name" value={renameSub.newName}
            onChange={(e) => setRenameSub({ ...renameSub, newName: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Box display="flex" gap={2}>
            <Button fullWidth variant="contained" onClick={handleRenameSubcategory}
              sx={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}>
              Rename
            </Button>
            <Button fullWidth variant="outlined" onClick={() => setRenameOpen(false)}>Cancel</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default AdminSectionItems;