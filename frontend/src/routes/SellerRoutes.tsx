import { Route, Routes }   from 'react-router-dom'
import { useEffect }       from 'react'
import HomePage            from '../seller/pages/SellerDashboard/HomePage'
import Products            from '../seller/pages/Products/Products'
import Marketplace         from '../seller/pages/Products/Marketplace'
import AddNewProduct       from '../seller/pages/Products/AddNewProduct'
import Orders              from '../seller/pages/Orders/Orders'
import Profile             from '../seller/pages/Account/Profile'
import Payment             from '../seller/pages/Payment/Payment'
import TransactionTable    from '../seller/pages/Payment/TransactionTable'
import { initSocket }      from '../config/socket' // ✅ NEW

const SellerRoutes = () => {

  // ✅ Init socket for seller real-time
  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    if (jwt) initSocket(jwt);
  }, []);

  return (
    <Routes>
      <Route path='/'            element={<HomePage />}         />
      <Route path='/products'    element={<Products />}         />
      <Route path='/marketplace' element={<Marketplace />}      />
      <Route path='/add-product' element={<AddNewProduct />}    />
      <Route path='/orders'      element={<Orders />}           />
      <Route path='/account'     element={<Profile />}          />
      <Route path='/payment'     element={<Payment />}          />
      <Route path='/transaction' element={<TransactionTable />} />
    </Routes>
  );
};

export default SellerRoutes;