// Razorpay script loader + popup launcher
declare global {
  interface Window { Razorpay: any }
}

export const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export interface RazorpayOpenOptions {
  razorpayOrderId: string;
  amount:          number;
  currency:        string;
  key:             string;
  nexkartOrderId:  string;
  userName?:       string;
  userEmail?:      string;
  userMobile?:     string;
  onSuccess: (data: {
    razorpay_order_id:   string;
    razorpay_payment_id: string;
    razorpay_signature:  string;
  }) => void;
  onDismiss?: () => void;
}

export const openRazorpayCheckout = async (opts: RazorpayOpenOptions) => {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    alert("Failed to load payment gateway. Check your internet.");
    return;
  }

  const options = {
    key:        opts.key,
    amount:     opts.amount,
    currency:   opts.currency,
    name:       "Nexkart",
    description: "Order Payment",
    order_id:   opts.razorpayOrderId,
    image:      "/vite.svg",
    handler: (response: any) => {
      opts.onSuccess({
        razorpay_order_id:   response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature:  response.razorpay_signature,
      });
    },
    prefill: {
      name:    opts.userName  || "",
      email:   opts.userEmail || "",
      contact: opts.userMobile || "",
    },
    theme: { color: "#6366f1" },
    modal: {
      ondismiss: () => { opts.onDismiss?.(); },
    },
  };

  const rzp = new window.Razorpay(options);

  rzp.on("payment.failed", (resp: any) => {
    console.error("Payment failed:", resp.error);
    alert(`Payment failed: ${resp.error.description || "Unknown error"}`);
    opts.onDismiss?.();
  });

  rzp.open();
};