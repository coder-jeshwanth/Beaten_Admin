import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  People as CustomersIcon,
  Logout as LogoutIcon,
  Inventory as ProductsIcon,
  LocalOffer as PromotionsIcon,
  Assessment as AnalyticsIcon,
} from "@mui/icons-material";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import EditNoteIcon from "@mui/icons-material/EditNote";
import InfoIcon from "@mui/icons-material/Info";
import CampaignIcon from "@mui/icons-material/Campaign";
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
  { text: "Analytics", icon: <AnalyticsIcon />, path: "/analytics" },
  { text: "Products", icon: <ProductsIcon />, path: "/products" },
  { text: "Orders", icon: <OrdersIcon />, path: "/orders" },
  { text: "Customers", icon: <CustomersIcon />, path: "/customers" },
  { text: "Coupons", icon: <PromotionsIcon />, path: "/promotions" },
  {
    text: "Returns",
    icon: <AssignmentReturnIcon />,
    path: "/returns",
  },
  {
    text: "Content MGR",
    icon: <EditNoteIcon />,
    path: "/data-entry",
  },
  {
    text: "Footer Info",
    icon: <InfoIcon />,
    path: "/footer-info",
  },
  {
    text: "Marketing",
    icon: <CampaignIcon />,
    path: "/marketing",
  },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2 }}>
        <img
          src="/Logo.png"
          alt="BEATEN"
          style={{ width: "100%", maxWidth: "150px" }}
        />
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
}

export default Sidebar;
