import { Card, Divider } from '@mui/material';
import { useEffect } from 'react';
import TransactionTable from './TransactionTable';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { fetchTransactionsBySeller } from '../../../Redux Toolkit/Seller/transactionSlice';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Wallet } from 'lucide-react';

const Payment = () => {
  const dispatch = useAppDispatch();
  const { transactions } = useAppSelector((s) => s.transaction);

  useEffect(() => {
    dispatch(fetchTransactionsBySeller(localStorage.getItem("jwt") || ""));
  }, [dispatch]);

  // ✅ Calculate from transactions directly
  const totalEarnings = transactions.reduce(
    (sum: number, t: any) => sum + (t.order?.totalSellingPrice || 0),
    0
  );

  const lastPayment = transactions[0]?.order?.totalSellingPrice || 0;
  const lastDate    = transactions[0]?.date;

  const stats = [
    {
      label:    "Total Earnings",
      value:    `₹${totalEarnings.toLocaleString()}`,
      sub:      `${transactions.length} transactions`,
      icon:     DollarSign,
      gradient: "linear-gradient(135deg, #10b981, #059669)",
      bg:       "rgba(16,185,129,0.1)",
    },
    {
      label:    "Last Payment",
      value:    `₹${lastPayment.toLocaleString()}`,
      sub:      lastDate ? new Date(lastDate).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      }) : "No payments yet",
      icon:     Wallet,
      gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      bg:       "rgba(99,102,241,0.1)",
    },
    {
      label:    "Avg Per Order",
      value:    `₹${transactions.length ? Math.round(totalEarnings / transactions.length).toLocaleString() : 0}`,
      sub:      "Per transaction",
      icon:     TrendingUp,
      gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
      bg:       "rgba(245,158,11,0.1)",
    },
  ];

  return (
    <div style={{ padding: 0 }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 24 }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>
          💰 Payments
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
          Track all your transactions and earnings
        </p>
      </motion.div>

      {/* Stat cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
        marginBottom: 24,
      }}>
        {stats.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 20,
                border: "1px solid #e5e7eb",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute", top: -20, right: -20,
                width: 100, height: 100,
                background: card.bg,
                borderRadius: "50%",
                filter: "blur(20px)",
              }} />
              <div style={{ position: "relative" }}>
                <div style={{
                  width: 44, height: 44,
                  borderRadius: 12,
                  background: card.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}>
                  <Icon size={22} color="#fff" />
                </div>
                <p style={{ fontSize: 12, color: "#64748b", margin: 0, fontWeight: 600 }}>
                  {card.label}
                </p>
                <p style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
                  {card.value}
                </p>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
                  {card.sub}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>
          📋 Recent Transactions
        </h2>
        <TransactionTable />
      </motion.div>
    </div>
  );
};

export default Payment;