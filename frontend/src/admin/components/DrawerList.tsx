import DrawerList                  from "../../admin seller/components/drawerList/DrawerList";
import DashboardIcon               from "@mui/icons-material/Dashboard";
import LocalOfferIcon              from "@mui/icons-material/LocalOffer";
import HomeIcon                    from "@mui/icons-material/Home";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import LogoutIcon                  from "@mui/icons-material/Logout";
import Inventory2Icon              from "@mui/icons-material/Inventory2";
import StorefrontIcon              from "@mui/icons-material/Storefront";
import BrandingWatermarkIcon       from "@mui/icons-material/BrandingWatermark";
import BarChartIcon                from "@mui/icons-material/BarChart";
import PieChartIcon                from "@mui/icons-material/PieChart";
import InventoryIcon               from "@mui/icons-material/Inventory";

const menu = [
  {
    name:       "Dashboard",
    path:       "/admin/dashboard",
    icon:       <DashboardIcon fontSize="small" />,
    activeIcon: <DashboardIcon fontSize="small" />,
  },
  {
    name:       "Products",
    path:       "/admin/products",
    icon:       <Inventory2Icon fontSize="small" />,
    activeIcon: <Inventory2Icon fontSize="small" />,
  },
  {
    name:       "Brands",
    path:       "/admin/brands",
    icon:       <BrandingWatermarkIcon fontSize="small" />,
    activeIcon: <BrandingWatermarkIcon fontSize="small" />,
  },
  {
    name:       "Sellers",
    path:       "/admin/sellers",
    icon:       <StorefrontIcon fontSize="small" />,
    activeIcon: <StorefrontIcon fontSize="small" />,
  },
  {
    name:       "Coupons",
    path:       "/admin/coupon",
    icon:       <IntegrationInstructionsIcon fontSize="small" />,
    activeIcon: <IntegrationInstructionsIcon fontSize="small" />,
  },
  {
    name:       "Home Page",
    path:       "/admin/home-grid",
    icon:       <HomeIcon fontSize="small" />,
    activeIcon: <HomeIcon fontSize="small" />,
  },
  {
    name:       "Deals",
    path:       "/admin/deals",
    icon:       <LocalOfferIcon fontSize="small" />,
    activeIcon: <LocalOfferIcon fontSize="small" />,
  },
  // ── Analytics ── (marked with section tag)
  {
    name:       "Stock Sold",
    path:       "/admin/stock-sold",
    icon:       <InventoryIcon fontSize="small" />,
    activeIcon: <InventoryIcon fontSize="small" />,
    section:    "analytics",
  },
  {
    name:       "Seller Revenue",
    path:       "/admin/seller-revenue",
    icon:       <PieChartIcon fontSize="small" />,
    activeIcon: <PieChartIcon fontSize="small" />,
    section:    "analytics",
  },
  {
    name:       "Product Analytics",
    path:       "/admin/product-analytics",
    icon:       <BarChartIcon fontSize="small" />,
    activeIcon: <BarChartIcon fontSize="small" />,
    section:    "analytics",
  },
];

const menu2 = [
  {
    name:       "Logout",
    path:       "/",
    icon:       <LogoutIcon fontSize="small" />,
    activeIcon: <LogoutIcon fontSize="small" />,
  },
];

interface DrawerListProps {
  toggleDrawer?: any;
  onCollapse?:   () => void;
}

const AdminDrawerList = ({ toggleDrawer, onCollapse }: DrawerListProps) => {
  return (
    <DrawerList
      toggleDrawer={toggleDrawer}
      menu={menu}
      menu2={menu2}
      onCollapse={onCollapse}
    />
  );
};

export default AdminDrawerList;