import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip,
} from '@mui/material';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { fetchTransactionsBySeller } from '../../../Redux Toolkit/Seller/transactionSlice';

export default function TransactionTable() {
  const { transactions, loading } = useAppSelector((s) => s.transaction);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchTransactionsBySeller(localStorage.getItem("jwt") || ""));
  }, [dispatch]);

  if (loading) {
    return (
      <div style={{
        padding: 40, textAlign: "center",
        color: "#94a3b8", fontSize: 13,
      }}>
        Loading transactions...
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div style={{
        padding: 60, textAlign: "center",
        background: "#fff", borderRadius: 12,
        border: "1px solid #e5e7eb",
      }}>
        <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>
          No transactions yet
        </p>
        <p style={{ fontSize: 12, color: "#cbd5e1", margin: "4px 0 0" }}>
          Transactions will appear here once customers place orders
        </p>
      </div>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        boxShadow: "none",
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ background: "#f9fafb" }}>
            <TableCell sx={{ fontWeight: 700, fontSize: 12, color: "#64748b" }}>
              DATE
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 12, color: "#64748b" }}>
              CUSTOMER
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 12, color: "#64748b" }}>
              ORDER ID
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 12, color: "#64748b" }}>
              STATUS
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12, color: "#64748b" }}>
              AMOUNT
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((item: any) => {
            const date = new Date(item.date || item.createdAt);
            return (
              <TableRow key={item._id} hover>
                <TableCell>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>
                      {date.toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>
                      {date.toLocaleTimeString("en-IN", {
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>
                      {item.customer?.fullName || "—"}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748b" }}>
                      {item.customer?.email}
                    </p>
                    {item.customer?.mobile && (
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>
                        📞 {item.customer.mobile}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`#${String(item.order?._id || "").slice(-8).toUpperCase()}`}
                    size="small"
                    sx={{
                      fontFamily: "monospace",
                      fontWeight: 700,
                      fontSize: 11,
                      background: "#f3f4f6",
                      color: "#374151",
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.order?.orderStatus || "PENDING"}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: 10,
                      background:
                        item.order?.orderStatus === "DELIVERED" ? "#dcfce7" :
                        item.order?.orderStatus === "CANCELLED" ? "#fee2e2" :
                        "#fef3c7",
                      color:
                        item.order?.orderStatus === "DELIVERED" ? "#15803d" :
                        item.order?.orderStatus === "CANCELLED" ? "#dc2626" :
                        "#a16207",
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <p style={{
                    margin: 0,
                    fontWeight: 800,
                    fontSize: 14,
                    color: "#10b981",
                  }}>
                    ₹{(item.order?.totalSellingPrice || 0).toLocaleString()}
                  </p>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}