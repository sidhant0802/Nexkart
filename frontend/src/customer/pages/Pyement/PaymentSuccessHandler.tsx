import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { useAppDispatch } from "../../../Redux Toolkit/Store";
import { fetchUserCart } from "../../../Redux Toolkit/Customer/CartSlice";

const PaymentSuccessHandler = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) dispatch(fetchUserCart(jwt));

    // Extract orderId from path: /payment-success/:orderId
    const parts   = window.location.pathname.split("/");
    const orderId = parts[parts.length - 1] || "";

    // Redirect to unified success page
    navigate(
      `/checkout/success?orderId=${orderId}&method=RAZORPAY`,
      { replace: true }
    );
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#0a0a0f",
      gap: 16,
    }}>
      <CircularProgress sx={{ color: "#6366f1" }} size={48} />
      <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>
        Verifying your payment...
      </p>
    </div>
  );
};

export default PaymentSuccessHandler;