// Import necessary modules
const Razorpay = require('razorpay');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PaymentOrder = require('../models/PaymentOrder'); // Assuming you have Mongoose models defined
const Order = require('../models/Order');
const User = require('../models/User');
const PaymentStatus = require('../domain/PaymentStatus');
const PaymentOrderStatus = require('../domain/PaymentOrderStatus');
const razorpay = require("../config/razorpayClient");
const OrderStatus = require('../domain/OrderStatus');

class PaymentService {


    async createOrder(user, orders) {
        const amount = orders.reduce((sum, order) => sum + order.totalSellingPrice, 0);

        const paymentOrder = new PaymentOrder({
            amount,
            user: user._id,
            orders: orders.map(order => order._id) // Saving order IDs
        });

        return await paymentOrder.save();
    }

    async getPaymentOrderById(orderId) {
        const paymentOrder = await PaymentOrder.findById(orderId);
        if (!paymentOrder) {
            throw new Error('Payment order not found');
        }
        return paymentOrder;
    }

    async getPaymentOrderByPaymentId(paymentId) {
        const paymentOrder = await PaymentOrder.findOne({ paymentLinkId: paymentId });
        if (!paymentOrder) {
            throw new Error('Payment order not found with provided payment link id');
        }
        return paymentOrder;
    }

    async proceedPaymentOrder(paymentOrder, paymentId, paymentLinkId) {

        if (paymentOrder.status === PaymentOrderStatus.PENDING ) {
            const payment = await razorpay.payments.fetch(paymentId);

            

            if (payment.status === 'captured') {
                // Update each order's payment status
                await Promise.all(paymentOrder.orders.map(async (orderId) => {
                    const order = await Order.findById(orderId);
                    order.paymentStatus = PaymentStatus.COMPLETED;
                    order.orderStatus = OrderStatus.PLACED;
                    await order.save();
                }));

                paymentOrder.status = PaymentOrderStatus.SUCCESS;
                
                await paymentOrder.save();

                return true;
            } else {
                paymentOrder.status = PaymentOrderStatus.FAILED;
                await paymentOrder.save();
                return false;
            }
        }
        return false;
    }

    async createRazorpayPaymentLink(user, amount, orderId) {
        apiKey="rzp_test_qDW9D1tYhFewoL"
        apiSecret="LeqKpXR90ieK6v"
        
        
        const razorpays = new Razorpay({
            key_id: apiKey,
            key_secret: apiSecret,
          });
        try {
            const paymentLinkRequest = {
                amount: amount * 100,
                currency: 'INR',
                customer: {
                    name: user.fullName,
                    email: user.email
                },
                notify: {
                    email: true
                },
                callback_url: `http://localhost:5173/payment-success/${orderId}`,
                callback_method: 'get'
            };

         
          
              const paymentLink = await razorpays.paymentLink.create(paymentLinkRequest);
          console.log("payment link",paymentLink);
             
            return paymentLink;
        } catch (err) {
            console.error("razorr pay errror ", err);
            throw new Error(err.message);
        }
    }

    async createStripePaymentLink(user, amount, orderId) {
        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                success_url: `http://localhost:5173/payment-success/${orderId}`,
                cancel_url: 'http://localhost:5173/payment-cancel',
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        unit_amount: amount * 100,
                        product_data: {
                            name: 'zosh bazaar payment'
                        }
                    },
                    quantity: 1
                }]
            });

            return session.url;
        } catch (err) {
            throw new Error(err.message);
        }
    }
}

module.exports = new PaymentService();
