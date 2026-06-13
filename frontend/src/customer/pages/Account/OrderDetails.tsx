import { Box, Button, Divider, CircularProgress } from '@mui/material'
import { useEffect } from 'react'
import PaymentsIcon from '@mui/icons-material/Payments';
import OrderStepper from './OrderStepper';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { cancelOrder, fetchOrderById, fetchOrderItemById } from '../../../Redux Toolkit/Customer/OrderSlice';
import { useNavigate, useParams } from 'react-router-dom';

const OrderDetails = () => {
  const dispatch = useAppDispatch();
  const { orders } = useAppSelector(store => store);
  const { orderItemId, orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
  const jwt = localStorage.getItem("jwt") || "";
  if (orderItemId) dispatch(fetchOrderItemById({ orderItemId, jwt }));
  if (orderId)     dispatch(fetchOrderById({ orderId, jwt }));
}, [orderItemId, orderId]);// ✅ correct dependencies

  // ✅ loading state
  if (orders.loading) {
    return (
      <div className='h-[80vh] flex justify-center items-center'>
        <CircularProgress />
      </div>
    );
  }

  if (!orders.orderItem) {
    return (
      <div className='h-[80vh] flex flex-col justify-center items-center gap-4'>
        <p className='text-gray-500'>Order item not found</p>
        <Button variant="outlined" onClick={() => navigate('/account/orders')}>
          Back to Orders
        </Button>
      </div>
    );
  }

  const handleCancelOrder = () => {
    if (orderId) dispatch(cancelOrder(orderId));
  };

  return (
    <Box className='space-y-5'>

      <section className='flex flex-col gap-5 justify-center items-center'>
        <img
          className='w-[100px]'
          src={orders.orderItem?.product?.images?.[0]}
          alt=""
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/100x100/6366f1/ffffff?text=?";
          }}
        />
        <div className='text-sm space-y-1 text-center'>
          <h1 className='font-bold'>
            {orders.orderItem?.product?.seller?.businessDetails?.businessName}
          </h1>
          <p>{orders.orderItem?.product?.title}</p>
          <p><strong>Size:</strong> {orders.orderItem?.size || "M"}</p>
        </div>
        <div>
          <Button
            onClick={() =>
              navigate(`/write-review/${orders.orderItem?.product?._id}`)
            }
          >
            Write Review
          </Button>
        </div>
      </section>

      <section className='border p-5'>
        <OrderStepper orderStatus={orders.currentOrder?.orderStatus} />
      </section>

      <div className='border p-5'>
        <h1 className='font-bold pb-3'>Delivery Address</h1>
        <div className='text-sm space-y-2'>
          <div className='flex gap-5 font-medium'>
            <p>{orders.currentOrder?.shippingAddress?.name}</p>
            <Divider flexItem orientation='vertical' />
            <p>{orders.currentOrder?.shippingAddress?.mobile}</p>
          </div>
          <p>
            {orders.currentOrder?.shippingAddress?.address},{" "}
            {orders.currentOrder?.shippingAddress?.city},{" "}
            {orders.currentOrder?.shippingAddress?.state} -{" "}
            {orders.currentOrder?.shippingAddress?.pinCode}
          </p>
        </div>
      </div>

      <div className='border space-y-4'>
        <div className='flex justify-between text-sm pt-5 px-5'>
          <div className='space-y-1'>
            <p className='font-bold'>Total Item Price</p>
            <p>
              You saved{" "}
              <span className='text-green-500 font-medium text-xs'>
                ₹{(orders.orderItem?.mrpPrice || 0) - (orders.orderItem?.sellingPrice || 0)}
              </span>{" "}
              on this item
            </p>
          </div>
          <p className='font-medium'>
            ₹{orders.orderItem?.sellingPrice?.toLocaleString()}
          </p>
        </div>

        <div className='px-5'>
          <div className='bg-teal-50 px-5 py-2 text-xs font-medium flex items-center gap-3'>
            <PaymentsIcon />
            <p>Pay On Delivery</p>
          </div>
        </div>

        <Divider />

        <div className='px-5 pb-5'>
          <p className='text-xs'>
            <strong>Sold by: </strong>
            {orders.orderItem?.product?.seller?.businessDetails?.businessName}
          </p>
        </div>

        <div className='p-10'>
          <Button
            disabled={orders.currentOrder?.orderStatus === "CANCELLED"}
            onClick={handleCancelOrder}
            color='error'
            sx={{ py: "0.7rem" }}
            variant='outlined'
            fullWidth
          >
            {orders.currentOrder?.orderStatus === "CANCELLED"
              ? "Order Canceled"
              : "Cancel Order"}
          </Button>
        </div>
      </div>
    </Box>
  );
};

export default OrderDetails;