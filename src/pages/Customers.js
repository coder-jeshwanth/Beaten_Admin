import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  InputAdornment,
  Card,
  CardContent,
  Stack,
  Badge,
  Avatar,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Rating,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  ShoppingCart as CartIcon,
  Star as StarIcon,
  Add as AddIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
} from "@mui/icons-material";
import { customersAPI, ordersAPI } from "../api/axiosAdmin";

const DEFAULT_AVATAR = "/avatars/default.jpg";

const statuses = ["All", "VIP", "Regular"];
const sortOptions = [
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "join_desc", label: "Newest First" },
  { value: "join_asc", label: "Oldest First" },
  { value: "orders_desc", label: "Most Orders" },
  { value: "spent_desc", label: "Highest Spent" },
  { value: "rating_desc", label: "Highest Rating" },
];

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [sortBy, setSortBy] = useState("join_desc");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [spentRange, setSpentRange] = useState({ min: "", max: "" });

  useEffect(() => {
    const fetchCustomersAndOrders = async () => {
      try {
        const [customersRes, ordersRes] = await Promise.all([
          customersAPI.getCustomers(),
          ordersAPI.getOrders(),
        ]);
        let fetchedCustomers =
          customersRes.data.data || customersRes.data.customers || [];
        const fetchedOrders =
          ordersRes.data.data || ordersRes.data.orders || [];
        console.log("Fetched Orders:", fetchedOrders);
        // Remove unwanted fields and set avatar, attach order stats
        fetchedCustomers = fetchedCustomers.map((customer) => {
          const { status, notes, rating, reviews, tags, ...rest } = customer;
          // Find orders for this customer (by _id or email)
          const customerOrders = fetchedOrders.filter((order) => {
            // Debug matching logic
            // order.user can be an object or a string (ObjectId)
            const orderUserId =
              order.user && typeof order.user === "object"
                ? order.user._id
                : order.user;
            if (
              orderUserId &&
              customer._id &&
              String(orderUserId) === String(customer._id)
            ) {
              console.log("Matched by _id:", orderUserId, customer._id);
              return true;
            }
            return false;
          });
          // Calculate order stats
          const totalOrders = customerOrders.length;
          const totalSpent = customerOrders.reduce(
            (sum, order) => sum + (order.totalPrice || 0),
            0
          );
          const lastOrder =
            customerOrders.length > 0
              ? customerOrders.reduce((latest, order) => {
                  const orderDate = new Date(order.createdAt);
                  return orderDate > new Date(latest)
                    ? order.createdAt
                    : latest;
                }, customerOrders[0].createdAt)
              : null;
          const isVIP =
            customer.subscription && customer.subscription.isSubscribed;
          return {
            ...rest,
            avatar: DEFAULT_AVATAR,
            orders: customerOrders,
            totalOrders,
            totalSpent,
            lastOrder,
            tags: isVIP ? ["VIP"] : ["Regular"],
            rating: typeof rating === "number" ? rating : 0,
            reviews: typeof reviews === "number" ? reviews : 0,
            status: typeof status === "string" ? status : "Active",
            joinDate:
              customer.createdAt ||
              rest.joinDate ||
              (customerOrders[0]?.createdAt ?? new Date().toISOString()),
            address: rest.address || "",
            notes: typeof notes === "string" ? notes : "",
          };
        });
        console.log(fetchedCustomers);

        setCustomers(fetchedCustomers);
      } catch (err) {
        setCustomers([]);
      }
    };
    fetchCustomersAndOrders();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
    setPage(0);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPage(0);
  };

  const handleOpenDialog = (customer = null) => {
    setSelectedCustomer(customer);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCustomer(null);
  };

  const handleExport = () => {
    const csvContent = customers
      .map(
        (customer) =>
          `${customer.name},${customer.email},${customer.phone},${customer.status},${customer.totalOrders},${customer.totalSpent}`
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredCustomers = customers
    .filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm);
      const matchesStatus =
        selectedStatus === "All" ||
        (customer.tags && customer.tags[0] === selectedStatus);
      const matchesDate =
        (!dateRange.start ||
          new Date(customer.joinDate) >= new Date(dateRange.start)) &&
        (!dateRange.end ||
          new Date(customer.joinDate) <= new Date(dateRange.end));
      const matchesSpent =
        (!spentRange.min ||
          customer.totalSpent >= parseFloat(spentRange.min)) &&
        (!spentRange.max || customer.totalSpent <= parseFloat(spentRange.max));
      return matchesSearch && matchesStatus && matchesDate && matchesSpent;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "join_desc":
          return new Date(b.joinDate) - new Date(a.joinDate);
        case "join_asc":
          return new Date(a.joinDate) - new Date(b.joinDate);
        case "orders_desc":
          return b.totalOrders - a.totalOrders;
        case "spent_desc":
          return b.totalSpent - a.totalSpent;
        case "rating_desc":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  // Calculate VIP and Regular counts
  const vipCount = customers.filter(
    (c) => c.tags && c.tags[0] === "VIP"
  ).length;
  const regularCount = customers.filter(
    (c) => c.tags && c.tags[0] === "Regular"
  ).length;

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "success";
      case "Inactive":
        return "warning";
      case "Blocked":
        return "error";
      default:
        return "default";
    }
  };

  const CustomerDetails = ({ customer }) => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Avatar
                  src={customer.avatar}
                  sx={{ width: 100, height: 100, mb: 2 }}
                />
                <Typography variant="h6">{customer.name}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {customer.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      color={tag === "VIP" ? "primary" : "default"}
                    />
                  ))}
                </Stack>
              </Box>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <EmailIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="Email" secondary={customer.email} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <PhoneIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="Phone" secondary={customer.phone} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <LocationIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Address"
                    secondary={customer.address}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Customer Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Orders
                    </Typography>
                    <Typography variant="h4">{customer.totalOrders}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last order:{" "}
                      {new Date(customer.lastOrder).toLocaleDateString()}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Spent
                    </Typography>
                    <Typography variant="h4">
                      ₹{customer.totalSpent.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average: ₹
                      {(customer.totalSpent / customer.totalOrders).toFixed(2)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Customer Rating
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Rating
                        value={customer.rating}
                        precision={0.1}
                        readOnly
                      />
                      <Typography variant="body2" color="text.secondary">
                        ({customer.reviews} reviews)
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          {customer.notes && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notes
                </Typography>
                <Typography variant="body1">{customer.notes}</Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box
      sx={{
        width: "calc(100vw - 240px)",
        minHeight: "100vh",
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
          mb: 3,
        }}
      >
        <Typography variant="h4">Customers</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            EXPORT
          </Button>
        </Box>
      </Box>
      {/* VIP/Regular counts summary */}
      <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
        <Typography variant="subtitle1" color="primary">
          VIP: {vipCount}
        </Typography>
        <Typography variant="subtitle1" color="secondary">
          Regular: {regularCount}
        </Typography>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search customers..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={handleStatusChange}
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={handleSortChange}
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}></Grid>
        </Grid>

        {showFilters && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Join Date From"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="Join Date To"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Min Spent"
                  type="number"
                  value={spentRange.min}
                  onChange={(e) =>
                    setSpentRange((prev) => ({ ...prev, min: e.target.value }))
                  }
                  InputProps={{ startAdornment: <CartIcon /> }}
                  fullWidth
                />
                <TextField
                  label="Max Spent"
                  type="number"
                  value={spentRange.max}
                  onChange={(e) =>
                    setSpentRange((prev) => ({ ...prev, max: e.target.value }))
                  }
                  InputProps={{ startAdornment: <CartIcon /> }}
                  fullWidth
                />
              </Box>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Customers Table */}
      <Paper
        sx={{
          width: "calc(100vw - 240px)",
          overflowX: "auto",
          boxSizing: "border-box",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Contact</TableCell>
                {/* <TableCell>Status</TableCell> */}
                <TableCell>Join Date</TableCell>
                <TableCell>Orders</TableCell>
                <TableCell>Total Spent</TableCell>
                {/* <TableCell>Rating</TableCell> */}
                {/* <TableCell>Actions</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar src={customer.avatar} />
                        <Box>
                          <Typography variant="body2">
                            {customer.name}
                          </Typography>
                          <Stack direction="row" spacing={0.5}>
                            {customer.tags.map((tag, index) => (
                              <Chip
                                key={index}
                                label={tag}
                                size="small"
                                color={tag === "VIP" ? "primary" : "default"}
                              />
                            ))}
                          </Stack>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                          {customer.email}
                        </Typography>
                        <Typography variant="body2">
                          <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                          {customer.phone}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      {new Date(customer.joinDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CartIcon fontSize="small" />
                        <Typography variant="body2">
                          {customer.totalOrders}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>₹{customer.totalSpent.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCustomers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Customer Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedCustomer ? "Customer Details" : "Add New Customer"}
        </DialogTitle>
        <DialogContent>
          {selectedCustomer ? (
            <CustomerDetails customer={selectedCustomer} />
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  placeholder="Enter customer name"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  placeholder="Enter email address"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  placeholder="Enter phone number"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Address"
                  placeholder="Enter address"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={4}
                  placeholder="Enter any additional notes"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {selectedCustomer ? "Close" : "Cancel"}
          </Button>
          {!selectedCustomer && (
            <Button variant="contained">Add Customer</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Customers;
