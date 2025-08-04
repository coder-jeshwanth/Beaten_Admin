import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Skeleton,
} from "@mui/material";
import {
  People as PeopleIcon,
  ShoppingCart as OrdersIcon,
  Inventory as ProductsIcon,
  AttachMoney as RevenueIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Circle as CircleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Campaign as CampaignIcon,
  Web as WebIcon,
  LocalOffer as DiscountIcon,
  WhatsApp as WhatsAppIcon,
  Campaign as CampaignsIcon,
  Receipt as TaxIcon,
  LocalShipping as ShippingIcon,
  Security as AccessIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { dashboardAPI } from "../api/axiosAdmin";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  // Main dashboard state
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Section-wise loading states
  const [sectionLoading, setSectionLoading] = useState({
    sales: false,
    orders: false,
    products: false,
    customers: false,
    subscriptions: false,
  });

  // Section-wise error states
  const [sectionErrors, setSectionErrors] = useState({
    sales: null,
    orders: null,
    products: null,
    customers: null,
    subscriptions: null,
  });

  // Manual refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const navigate = useNavigate();

  // Primary approach: Load all dashboard data in one call
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call all dashboard endpoints to get complete data
      const [
        mainResponse,
        ordersResponse,
        salesResponse,
        subscriptionResponse,
      ] = await Promise.all([
        dashboardAPI.getDashboardAnalytics(),
        dashboardAPI.getOrdersAnalytics(),
        dashboardAPI.getSalesAnalytics(),
        dashboardAPI.getSubscriptionAnalytics(),
      ]);

      const mainData = mainResponse.data.data;
      const ordersData = ordersResponse.data.data;
      const salesData = salesResponse.data.data;
      const subscriptionData = subscriptionResponse.data.data;

      // Transform API data to match our dashboard structure
      const transformedData = {
        // Sales data from sales endpoint
        todaySales: salesData.todaySales || 0,
        monthlySales: salesData.monthlySales || 0,
        paid: salesData.paid || 0,
        gst: salesData.gst || 0,
        totalRevenue: salesData.totalRevenue || 0,

        // Orders data from orders endpoint
        totalOrders: ordersData.totalOrders || 0,
        newOrders: ordersData.newOrders || 0,
        processingOrders: ordersData.processingOrders || 0,
        deliveredOrders: ordersData.deliveredOrders || 0,
        cancelledOrders: ordersData.cancelledOrders || 0,

        // Product data from main endpoint
        totalProducts: mainData.totalProducts || 0,

        // Customer data from main endpoint
        totalCustomers: mainData.totalUsers || 0,

        // Subscription data from subscription endpoint
        beatenClub: subscriptionData?.beatenClub || 0,
        totalSavings: subscriptionData?.totalSavings || 0,

        // Additional data from main endpoint
        categoryStats: mainData.categoryStats || [],
        recentActivities: mainData.recentActivities || [],
      };

      setDashboardData(transformedData);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      console.error("Error details:", {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers,
      });

      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadDashboardData();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Skeleton loading component
  const SkeletonCard = ({ height = 140 }) => (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        height: height,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="40%" height={16} />
    </Paper>
  );

  // Skeleton for orders card
  const SkeletonOrdersCard = () => (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        height: "100%",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
        <Skeleton variant="text" width="60%" height={28} />
      </Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={6} key={item}>
            <Box sx={{ textAlign: "center", p: 1 }}>
              <Skeleton
                variant="text"
                width="100%"
                height={32}
                sx={{ mb: 1 }}
              />
              <Skeleton variant="text" width="60%" height={16} />
            </Box>
          </Grid>
        ))}
      </Grid>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Skeleton variant="text" width="40%" height={24} />
        <Skeleton variant="text" width="30%" height={16} />
      </Box>
    </Paper>
  );

  // Enhanced StatCard with skeleton loading
  const StatCard = ({
    title,
    value,
    subtitle,
    gradient,
    loading = false,
    onClick,
  }) => {
    if (loading) {
      return <SkeletonCard />;
    }

    return (
      <Paper
        sx={{
          p: 2,
          background: gradient,
          color: "white",
          borderRadius: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          transition: "transform 0.2s ease-in-out",
          cursor: onClick ? "pointer" : "default",
          "&:hover": {
            transform: onClick ? "translateY(-2px)" : "none",
            boxShadow: onClick
              ? "0 6px 25px rgba(0,0,0,0.15)"
              : "0 4px 20px rgba(0,0,0,0.1)",
          },
        }}
        onClick={onClick}
      >
        <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 0.5 }}>
          ₹{value?.toLocaleString() || "0"}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {subtitle}
          </Typography>
        )}
        {onClick && (
          <Typography variant="caption" sx={{ opacity: 0.8, mt: 1 }}>
            Click to view details →
          </Typography>
        )}
      </Paper>
    );
  };

  // Enhanced OrdersCard with skeleton loading
  const OrdersCard = ({ gradient, loading = false }) => {
    if (loading) {
      return <SkeletonOrdersCard />;
    }

    return (
      <Paper
        sx={{
          p: 3,
          background: gradient,
          color: "white",
          borderRadius: 2,
          height: "100%",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          transition: "transform 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 25px rgba(0,0,0,0.15)",
          },
        }}
        onClick={() => navigate("/orders")}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <OrdersIcon sx={{ mr: 2, fontSize: "2rem" }} />
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Orders Management
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Box
              sx={{
                textAlign: "center",
                p: 1,
                bgcolor: "rgba(255,255,255,0.1)",
                borderRadius: 1,
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", color: "#4CAF50" }}
              >
                {dashboardData?.newOrders || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                New Orders
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              sx={{
                textAlign: "center",
                p: 1,
                bgcolor: "rgba(255,255,255,0.1)",
                borderRadius: 1,
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", color: "#FF9800" }}
              >
                {dashboardData?.processingOrders || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Processing
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              sx={{
                textAlign: "center",
                p: 1,
                bgcolor: "rgba(255,255,255,0.1)",
                borderRadius: 1,
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", color: "#2196F3" }}
              >
                {dashboardData?.deliveredOrders || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Delivered
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              sx={{
                textAlign: "center",
                p: 1,
                bgcolor: "rgba(255,255,255,0.1)",
                borderRadius: 1,
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", color: "#F44336" }}
              >
                {dashboardData?.cancelledOrders || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Cancelled
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Total Orders: {dashboardData?.totalOrders || 0}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Click to manage →
          </Typography>
        </Box>
      </Paper>
    );
  };

  // ManagementCard component (unchanged)
  const ManagementCard = ({ title, items, icon: Icon, gradient }) => (
    <Paper
      sx={{
        p: 2,
        background: gradient,
        color: "white",
        borderRadius: 2,
        height: "100%",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 6px 25px rgba(0,0,0,0.15)",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Icon sx={{ mr: 1, fontSize: "1.5rem" }} />
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {title}
        </Typography>
      </Box>
      <List dense sx={{ p: 0 }}>
        {items.map((item, index) => (
          <ListItem
            key={index}
            sx={{
              p: 0,
              mb: 1,
              cursor: "pointer",
              borderRadius: 1,
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.1)",
                transform: "translateX(4px)",
                transition: "all 0.2s ease-in-out",
              },
            }}
            onClick={() => item.onClick && item.onClick()}
          >
            <ListItemText
              primary={
                <Typography variant="body2" sx={{ fontWeight: "500" }}>
                  {item.label}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  // SubscriptionCard component with loading support
  const SubscriptionCard = ({
    title,
    value,
    subtitle,
    gradient,
    loading = false,
    onClick,
  }) => {
    if (loading) {
      return <SkeletonCard />;
    }

    return (
      <Paper
        sx={{
          p: 2,
          background: gradient,
          color: "white",
          borderRadius: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          transition: "transform 0.2s ease-in-out",
          cursor: onClick ? "pointer" : "default",
          "&:hover": {
            transform: onClick ? "translateY(-2px)" : "none",
            boxShadow: onClick
              ? "0 6px 25px rgba(0,0,0,0.15)"
              : "0 4px 20px rgba(0,0,0,0.1)",
          },
        }}
        onClick={onClick}
      >
        <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 0.5 }}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {subtitle}
          </Typography>
        )}
        {onClick && (
          <Typography variant="caption" sx={{ opacity: 0.8, mt: 1 }}>
            Click to view details →
          </Typography>
        )}
      </Paper>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          width: "calc(100vw - 240px)",
          minHeight: "100vh",
          bgcolor: "#f5f5f5",
          p: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="rectangular" width={120} height={40} />
        </Box>

        <Grid container spacing={3}>
          {/* Sales Reports Section */}
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" width={150} height={28} sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((item) => (
                <Grid item xs={6} key={item}>
                  <SkeletonCard />
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Orders Section */}
          <Grid item xs={12} md={6}>
            <SkeletonOrdersCard />
          </Grid>

          {/* Other sections */}
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} md={6} key={item}>
              <SkeletonCard height={200} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error && !dashboardData) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 4,
          bgcolor: "#f5f5f5",
          minHeight: "100vh",
        }}
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={loadDashboardData}
          startIcon={<RefreshIcon />}
          sx={{ mr: 2 }}
        >
          Retry Loading Dashboard
        </Button>
        <Typography variant="h6" sx={{ color: "#666", mt: 2 }}>
          Please check your connection and try again
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "calc(100vw - 240px)",
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
        color: "#333",
        p: 3,
        m: 0,
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ color: "#1976d2", fontWeight: "bold" }}>
          Dashboard
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {lastUpdate && (
            <Typography variant="caption" sx={{ color: "#666" }}>
              Last update: {lastUpdate.toLocaleTimeString()}
            </Typography>
          )}
          <Button
            variant="outlined"
            onClick={handleRefresh}
            startIcon={<RefreshIcon />}
            disabled={isRefreshing}
            sx={{
              minWidth: "auto",
              px: 2,
              "&:disabled": { opacity: 0.6 },
            }}
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Sales Reports Section */}
        <Grid item xs={12} md={6}>
          <Typography
            variant="h6"
            sx={{ color: "#1976d2", mb: 2, fontWeight: "bold" }}
          >
            Sales Reports
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <StatCard
                title="Today's Sales"
                value={dashboardData?.todaySales || 0}
                gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                loading={loading}
                onClick={() => navigate("/analytics?section=today-sales")}
              />
            </Grid>
            <Grid item xs={6}>
              <StatCard
                title="Monthly Sales"
                value={dashboardData?.monthlySales || 0}
                gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                loading={loading}
                onClick={() => navigate("/analytics?section=monthly-sales")}
              />
            </Grid>
            <Grid item xs={6}>
              <StatCard
                title="Paid"
                value={dashboardData?.paid || 0}
                gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                loading={loading}
                onClick={() => navigate("/analytics?section=gst-analytics")}
              />
            </Grid>
            <Grid item xs={6}>
              <StatCard
                title="GST"
                value={dashboardData?.gst || 0}
                gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                loading={loading}
                onClick={() => navigate("/analytics?section=gst-analytics")}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Full Orders Section */}
        <Grid item xs={12} md={6}>
          <OrdersCard
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            loading={loading}
          />
        </Grid>

        {/* Product Management Section */}
        <Grid item xs={12} md={6}>
          <ManagementCard
            title="Product Management"
            icon={ProductsIcon}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            items={[
              {
                label: "Add Product",
                onClick: () => navigate("/products?action=add"),
              },
              { label: "Edit Products", onClick: () => navigate("/products") },
              //   { label: "Stock Control", onClick: () => navigate("/products") },
            ]}
          />
        </Grid>

        {/* Subscription Management Section */}
        <Grid item xs={12} md={6}>
          <Typography
            variant="h6"
            sx={{ color: "#1976d2", mb: 2, fontWeight: "bold" }}
          >
            Subscription Management
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <SubscriptionCard
                title="Beaten Club Members"
                value={dashboardData?.beatenClub || 0}
                gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                loading={loading}
                onClick={() =>
                  navigate("/analytics?section=subscription-management")
                }
              />
            </Grid>
            <Grid item xs={6}>
              <SubscriptionCard
                title="Total Savings"
                value={`₹${dashboardData?.totalSavings || 0}`}
                gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                loading={loading}
                onClick={() =>
                  navigate("/analytics?section=subscription-management")
                }
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Analytics Section */}
        {/* <Grid item xs={12} md={4}>
          <ManagementCard
            title="Analytics"
            icon={AnalyticsIcon}
            gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
            items={[
              {
                label: "Product-wise Sales",
                onClick: () => navigate("/analytics"),
              },
              {
                label: "Conversion Rate",
                onClick: () => navigate("/analytics"),
              },
              {
                label: "Cart Abandonment",
                onClick: () => navigate("/analytics"),
              },
            ]}
          />
        </Grid> */}

        {/* Marketing & Promotions Section */}
        <Grid item xs={12} md={4}>
          <ManagementCard
            title="Marketing & Promotions"
            icon={CampaignIcon}
            gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
            items={[
              {
                label: "Discount Codes",
                onClick: () => navigate("/promotions"),
              },
              {
                label: "WhatsApp Broadcast",
                onClick: () => navigate("/marketing"),
              },
              { label: "Campaigns", onClick: () => navigate("/marketing") },
            ]}
          />
        </Grid>

        {/* Website Content Control Section */}
        {/* <Grid item xs={12} md={4}>
          <ManagementCard
            title="Website Content Control"
            icon={WebIcon}
            gradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
            items={[
              { label: "Tax", onClick: () => navigate("/settings") },
              { label: "Shipping", onClick: () => navigate("/settings") },
              { label: "Access", onClick: () => navigate("/settings") },
            ]}
          />
        </Grid> */}
      </Grid>
    </Box>
  );
}

export default Dashboard;
