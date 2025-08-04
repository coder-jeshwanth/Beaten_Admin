import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import { useLocation } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import AdminForm from "../components/AdminForm";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import InvoiceTemplate from "../components/InvoiceTemplate";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
// Import any admin UI components as needed (e.g., AdminCard, AdminTable, AdminButton, etc.)
const BASE_URL = "http://localhost:8000";
function Analytics() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [filterDays, setFilterDays] = useState(0); // For filter input
  const [filteredSubs, setFilteredSubs] = useState([]); // For filtered subscriptions
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'

  // Monthly sales filter state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Dummy Add Member dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState("");
  const [addError, setAddError] = useState("");

  // Real Add Member handlers
  const handleOpenAddDialog = () => {
    setAddDialogOpen(true);
    setAddEmail("");
    setAddSuccess("");
    setAddError("");
  };

  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
    setAddEmail("");
    setAddSuccess("");
    setAddError("");
  };

  // Real submit handler
  const handleAddMember = async () => {
    if (!addEmail.trim()) {
      setAddError("Email is required");
      return;
    }

    setAddLoading(true);
    setAddError("");
    setAddSuccess("");

    try {
      const response = await axios.post(
        `${BASE_URL}/api/admin/dashboard/add-member`,
        {
          email: addEmail.trim(),
          subscriptionType: "yearly",
          subscriptionCost: 249,
        }
      );

      if (response.data.success) {
        setAddSuccess(response.data.message);
        // Refresh the subscription list
        const subsResponse = await axios.get(
          `${BASE_URL}/api/admin/dashboard/subscription-list`
        );
        if (subsResponse.data.success) {
          setSubscriptions(subsResponse.data.data || []);
        }
        setTimeout(() => {
          setAddDialogOpen(false);
          setAddSuccess("");
        }, 2000);
      } else {
        setAddError(response.data.message || "Failed to add member");
      }
    } catch (error) {
      console.error("Error adding member:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to add member. Please try again.";
      setAddError(errorMessage);
    } finally {
      setAddLoading(false);
    }
  };

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/orders`)
      .then((res) => {
        console.log("Orders API Response:", res.data.data);
        setOrders(res.data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
      });

    // Fetch subscription data from the new endpoint
    axios
      .get(`${BASE_URL}/api/admin/dashboard/subscription-list`)
      .then((res) => {
        const subs = res.data.data || [];
        setSubscriptions(subs);
        setLoadingSubs(false);
      })
      .catch(() => setLoadingSubs(false));
  }, []);

  useEffect(() => {
    setFilteredSubs(subscriptions); // By default, show all
  }, [subscriptions]);

  // Map orders to your table format
  const gstTable = orders.map((order) => ({
    id: order.orderId || order._id, // Use custom orderId if available, fallback to _id
    date: new Date(order.createdAt).toLocaleDateString(),
    customer: order.user?.name || "N/A",
    product: order.orderItems.map((i) => i.name).join(", "),
    gst: order.totalGstForOrder,
    total: order.totalPrice,
  }));

  // For chart data, aggregate GST by date for the past 7 days
  const chartDays = 7;
  const chartDates = [];
  const todayDate = new Date();
  for (let i = chartDays - 1; i >= 0; i--) {
    const d = new Date(todayDate);
    d.setDate(todayDate.getDate() - i);
    chartDates.push(d.toLocaleDateString());
  }
  const gstByDate = {};
  orders.forEach((order) => {
    const date = new Date(order.createdAt).toLocaleDateString();
    gstByDate[date] = (gstByDate[date] || 0) + (order.totalGstForOrder || 0);
  });
  const gstData = chartDates.map((date) => ({
    date,
    value: gstByDate[date] || 0,
  }));

  console.log(orders);

  // Calculate today's date string for comparison
  const today = new Date();
  const todayStr = today.toLocaleDateString();

  // Flatten all order items from today's orders
  const todaySales = orders
    .filter(
      (order) => new Date(order.createdAt).toLocaleDateString() === todayStr
    )
    .flatMap((order) =>
      order.orderItems.map((item) => ({
        user: order.user?.name || "N/A",
        date: todayStr,
        id: order._id,
        product: item.name,
        amount: +(item.price * item.quantity - item.totalGstForItem).toFixed(2), // Excl. GST
        gst: item.totalGstForItem,
        total: +(item.price * item.quantity).toFixed(2), // Incl. GST
      }))
    );

  // Use selected month and year for filtering
  const selectedMonthName = new Date(
    selectedYear,
    selectedMonth
  ).toLocaleString("default", { month: "long" });
  const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  // Function to calculate GST based on state
  const calculateGST = (gstAmount, state) => {
    const isTelangana = state && state.toLowerCase() === "telangana";

    if (isTelangana) {
      // For Telangana: Divide GST into CGST and SGST
      const halfGST = gstAmount / 2;
      return {
        cgst: halfGST,
        sgst: halfGST,
        igst: 0,
      };
    } else {
      // For other states: Full GST goes to IGST
      return {
        cgst: 0,
        sgst: 0,
        igst: gstAmount,
      };
    }
  };

  // Group orders by order (not by individual products)
  const monthlySales = orders
    .filter((order) => {
      const d = new Date(order.createdAt);
      return (
        d.getMonth() === selectedMonth &&
        d.getFullYear() === selectedYear &&
        order.status === "delivered"
      );
    })
    .map((order) => {
      // Calculate total amounts for the entire order
      const orderTotalAmount = order.orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const orderTotalGst = order.orderItems.reduce(
        (sum, item) => sum + item.totalGstForItem,
        0
      );
      const orderAmountExclGst = orderTotalAmount - orderTotalGst;

      // Calculate GST based on state for the entire order
      const gstCalculation = calculateGST(
        orderTotalGst,
        order.shippingAddress?.state
      );

      // Get the first product for display (or create a summary)
      const firstItem = order.orderItems[0];
      const productCount = order.orderItems.length;
      const productSummary =
        productCount > 1
          ? `${firstItem.name} + ${productCount - 1} more items`
          : firstItem.name;

      return {
        id: order.orderId || order._id, // Use custom orderId if available, fallback to _id
        invoiceId: order.invoiceId, // Invoice ID from database
        name: order.user?.name || "N/A",
        type: order.user?.type || "Normal",
        date: new Date(order.createdAt).toLocaleDateString(),
        amount: +orderAmountExclGst.toFixed(2), // Total amount excluding GST for entire order
        total: +orderTotalAmount.toFixed(2), // Total amount including GST for entire order
        product: productSummary, // Show first product + count of additional items
        sku: firstItem.sku || "BT-TS BLK-OS-L",
        quantity: order.orderItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        ), // Total quantity
        price: firstItem.price, // Price of first item (for display)
        gst: orderTotalGst, // Total GST for entire order
        hsn: firstItem.hsn || "6109",
        paymentMethod: order.paymentMethod || "ONLINE",
        awbNumber: order.awbNumber || "AWB-000000000000000",
        // GST calculations for entire order
        cgst: gstCalculation.cgst,
        sgst: gstCalculation.sgst,
        igst: gstCalculation.igst,
        shippingAddress: order.shippingAddress || {
          address: "Plot NO 91, Block B",
          city: "Rajhmundry",
          state: "Andhra Pradesh",
          postalCode: "533125",
          country: "India",
          name: "Customer Name",
          phone: "9398334115",
        },
        // Store all order items for invoice generation
        orderItems: order.orderItems,
      };
    });

  // Log the processed data for debugging
  console.log("Processed monthlySales data:", monthlySales);
  console.log("Sample order ID from monthlySales:", monthlySales[0]?.id);

  // --- Today Sales Summary ---
  const totalOrdersToday = todaySales.length;
  const totalSalesTodayInclGst = todaySales.reduce(
    (sum, row) => sum + (row.total || 0),
    0
  );
  const totalGstToday = todaySales.reduce(
    (sum, row) => sum + (row.gst || 0),
    0
  );
  const totalSalesTodayExclGst = todaySales.reduce(
    (sum, row) => sum + (row.amount || 0),
    0
  );

  // --- Monthly Sales Summary ---
  const totalOrdersMonth = monthlySales.length;
  const totalSalesMonthInclGst = monthlySales.reduce(
    (sum, row) => sum + (row.total || 0),
    0
  );
  const totalGstMonth = monthlySales.reduce(
    (sum, row) => sum + ((row.total || 0) - (row.amount || 0)),
    0
  );
  const totalSalesMonthExclGst = monthlySales.reduce(
    (sum, row) => sum + (row.amount || 0),
    0
  );

  const cardStyle = {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    padding: 32,
    marginBottom: 40,
    maxWidth: 1100,
    marginLeft: "auto",
    marginRight: "auto",
  };
  const sectionTitleStyle = {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 24,
    letterSpacing: 0.2,
  };
  const tableStyle = {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    background: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  };
  const thStyle = {
    background: "#f7f8fa",
    fontWeight: 600,
    fontSize: 16,
    padding: "14px 16px",
    borderBottom: "1px solid #e5e7eb",
    textAlign: "left",
  };
  const tdStyle = {
    padding: "12px 16px",
    borderBottom: "1px solid #f0f0f0",
    fontSize: 15,
  };
  const totalRowStyle = {
    background: "#f7f8fa",
    fontWeight: 700,
    fontSize: 16,
  };
  const summaryStyle = {
    display: "flex",
    justifyContent: "space-between",
    fontWeight: 600,
    fontSize: 16,
    marginTop: 16,
    color: "#222",
  };
  const buttonStyle = {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "8px 20px",
    borderRadius: 6,
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  };

  const getDaysLeft = (endDate) => {
    const end = new Date(endDate);
    return Math.max(0, Math.ceil((end - today) / (1000 * 60 * 60 * 24)));
  };

  // Send subscription reminder handler
  const handleSendReminder = async (sub) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/admin/dashboard/send-subscription-reminder`,
        {
          email: sub.email,
          name: sub.name,
          subscriptionEnd: sub.subscriptionEnd,
        }
      );
      if (res.data.success) {
        alert("Reminder email sent successfully to " + sub.name);
      } else {
        alert("Failed to send reminder email.");
      }
    } catch (error) {
      alert("Failed to send reminder email.");
    }
  };

  const handleFilter = () => {
    let subs = subscriptions;
    if (filterDays && filterDays > 0) {
      subs = subs.filter((sub) => {
        const days = getDaysLeft(
          sub.subscriptionEnd || sub.endDate || sub.subscriptionEndDate
        );
        return days <= filterDays;
      });
    }
    // Sort after filtering
    subs = [...subs].sort((a, b) => {
      const daysA = getDaysLeft(
        a.subscriptionEnd || a.endDate || a.subscriptionEndDate
      );
      const daysB = getDaysLeft(
        b.subscriptionEnd || b.endDate || b.subscriptionEndDate
      );
      return sortOrder === "asc" ? daysA - daysB : daysB - daysA;
    });
    setFilteredSubs(subs);
  };

  // Update sort order and re-filter
  const handleSortOrderChange = (order) => {
    setSortOrder(order);
    // Re-apply filter and sort
    let subs = subscriptions;
    if (filterDays && filterDays > 0) {
      subs = subs.filter((sub) => {
        const days = getDaysLeft(
          sub.subscriptionEnd || sub.endDate || sub.subscriptionEndDate
        );
        return days <= filterDays;
      });
    }
    subs = [...subs].sort((a, b) => {
      const daysA = getDaysLeft(
        a.subscriptionEnd || a.endDate || a.subscriptionEndDate
      );
      const daysB = getDaysLeft(
        b.subscriptionEnd || b.endDate || b.subscriptionEndDate
      );
      return order === "asc" ? daysA - daysB : daysB - daysA;
    });
    setFilteredSubs(subs);
  };

  // Remove Add Member dialog logic and API calls except subscription fetch
  // Remove: addDialogOpen, addEmail, addLoading, addError, addSuccess, handleOpenAddDialog, handleCloseAddDialog, handleAddMember, and related dialog rendering
  // Keep: fetching subscriptions and displaying them

  // Ref for the invoice component
  const invoiceRef = React.useRef();

  // State to hold current order data for PDF generation
  const [currentOrderData, setCurrentOrderData] = useState(null);

  // Function to download the invoice as PDF using html2canvas and InvoiceTemplate
  const handleDownloadInvoice = async (orderData) => {
    try {
      // Set the current order data to update the visible template
      setCurrentOrderData(orderData);

      // Wait a bit for the component to re-render with new data
      setTimeout(async () => {
        const input = invoiceRef.current;
        if (!input) {
          console.error("Invoice template ref not found");
          return;
        }

        const canvas = await html2canvas(input, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          width: 595,
          height: 842,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "pt",
          format: "a4",
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
        pdf.save(`invoice-${orderData?.id || "template"}.pdf`);
      }, 200);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  // Function to download monthly sales report as PDF
  const handleDownloadMonthlySalesReport = async () => {
    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const tableWidth = pageWidth - margin * 2;
      // Define custom column widths for better text fitting
      const colWidths = [
        tableWidth * 0.11, // Order ID
        tableWidth * 0.11, // Invoice ID
        tableWidth * 0.13, // Customer Name
        tableWidth * 0.08, // User Type
        tableWidth * 0.11, // Date of Purchase
        tableWidth * 0.11, // Amount (Excl. GST)
        tableWidth * 0.11, // Total Amount (Incl. GST)
        tableWidth * 0.14, // Payment Method
      ];

      // Header
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Monthly Sales Report", pageWidth / 2, margin, {
        align: "center",
      });

      // Subtitle with month and year
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `${selectedMonthName} ${selectedYear}`,
        pageWidth / 2,
        margin + 30,
        { align: "center" }
      );

      // Date range
      pdf.setFontSize(12);
      pdf.text(
        `Period: ${selectedMonthName} 1, ${selectedYear} → ${selectedMonthName} ${lastDayOfMonth}, ${selectedYear}`,
        margin,
        margin + 50
      );

      // Table headers
      const headers = [
        "Order ID",
        "Invoice ID",
        "Customer Name",
        "User Type",
        "Date of Purchase",
        "Amount (Excl. GST)",
        "Total Amount (Incl. GST)",
        "Payment Method",
      ];

      let yPosition = margin + 80;

      // Draw table header
      pdf.setFillColor(247, 248, 250);
      pdf.rect(margin, yPosition - 20, tableWidth, 25, "F");

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      let headerX = margin;
      headers.forEach((header, index) => {
        // Truncate long headers to fit in column
        let displayText = header;
        if (header === "Payment Method") {
          displayText = "Payment";
        } else if (header === "Amount (Excl. GST)") {
          displayText = "Amount (Excl)";
        } else if (header === "Total Amount (Incl. GST)") {
          displayText = "Total (Incl)";
        }
        pdf.text(displayText, headerX + 5, yPosition - 5);
        headerX += colWidths[index];
      });

      yPosition += 10;

      // Draw table rows
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");

      monthlySales.forEach((row, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 100) {
          pdf.addPage();
          yPosition = margin + 80;

          // Redraw header on new page
          pdf.setFillColor(247, 248, 250);
          pdf.rect(margin, yPosition - 20, tableWidth, 25, "F");
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");
          let newPageHeaderX = margin;
          headers.forEach((header, headerIndex) => {
            // Truncate long headers to fit in column
            let displayText = header;
            if (header === "Payment Method") {
              displayText = "Payment";
            } else if (header === "Amount (Excl. GST)") {
              displayText = "Amount (Excl)";
            } else if (header === "Total Amount (Incl. GST)") {
              displayText = "Total (Incl)";
            }
            pdf.text(displayText, newPageHeaderX + 5, yPosition - 5);
            newPageHeaderX += colWidths[headerIndex];
          });
          yPosition += 10;
        }

        const rowData = [
          row.id || "N/A",
          row.invoiceId || "N/A",
          row.name || "N/A",
          row.type || "Normal",
          row.date || "N/A",
          `Rs. ${row.amount?.toLocaleString() || "0"}`,
          `Rs. ${row.total?.toLocaleString() || "0"}`,
          row.paymentMethod || "ONLINE",
        ];

        // Draw row background (alternating colors)
        if (index % 2 === 0) {
          pdf.setFillColor(255, 255, 255);
        } else {
          pdf.setFillColor(248, 250, 252);
        }
        pdf.rect(margin, yPosition - 15, tableWidth, 20, "F");

        // Draw row data
        let rowX = margin;
        rowData.forEach((cell, cellIndex) => {
          pdf.text(cell, rowX + 5, yPosition);
          rowX += colWidths[cellIndex];
        });

        yPosition += 25;
      });

      // Draw totals row
      yPosition += 10;
      pdf.setFillColor(37, 99, 235);
      pdf.rect(margin, yPosition - 15, tableWidth, 25, "F");

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255);

      const totalsData = [
        `Total Orders: ${totalOrdersMonth}`,
        "",
        "",
        "",
        "",
        `Rs. ${totalSalesMonthExclGst.toLocaleString()}`,
        `Rs. ${totalSalesMonthInclGst.toLocaleString()}`,
        "",
      ];

      let totalsX = margin;
      totalsData.forEach((cell, cellIndex) => {
        pdf.text(cell, totalsX + 5, yPosition);
        totalsX += colWidths[cellIndex];
      });

      // Reset text color
      pdf.setTextColor(0, 0, 0);

      // Summary section
      yPosition += 50;
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Summary:", margin, yPosition);

      yPosition += 20;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`• Total Orders: ${totalOrdersMonth}`, margin, yPosition);
      yPosition += 15;
      pdf.text(
        `• Total Sales (Incl. GST): Rs. ${totalSalesMonthInclGst.toLocaleString()}`,
        margin,
        yPosition
      );
      yPosition += 15;
      pdf.text(
        `• Total GST Collected: Rs. ${totalGstMonth.toLocaleString()}`,
        margin,
        yPosition
      );
      yPosition += 15;
      pdf.text(
        `• Total Sales (Excl. GST): Rs. ${totalSalesMonthExclGst.toLocaleString()}`,
        margin,
        yPosition
      );

      // Footer
      pdf.setFontSize(8);
      pdf.text(
        `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        margin,
        pageHeight - 20
      );

      pdf.save(
        `monthly-sales-report-${selectedMonthName.toLowerCase()}-${selectedYear}.pdf`
      );
    } catch (error) {
      console.error("Error generating monthly sales PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  // Function to download today's sales report as PDF
  const handleDownloadTodaySalesReport = async () => {
    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const tableWidth = pageWidth - margin * 2;
      // Define custom column widths for today's sales (7 columns, no invoice ID)
      const colWidths = [
        tableWidth * 0.12, // User Type
        tableWidth * 0.12, // Date of Purchase
        tableWidth * 0.12, // Order ID
        tableWidth * 0.18, // Product(s)
        tableWidth * 0.12, // Amount (Excl. GST)
        tableWidth * 0.12, // GST
        tableWidth * 0.12, // Total Amount
      ];

      // Header
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Today's Sales Report", pageWidth / 2, margin, {
        align: "center",
      });

      // Subtitle with today's date
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "normal");
      pdf.text(todayStr, pageWidth / 2, margin + 30, { align: "center" });

      // Date range
      pdf.setFontSize(12);
      pdf.text(`Period: ${todayStr}`, margin, margin + 50);

      // Table headers
      const headers = [
        "User Type",
        "Date of Purchase",
        "Order ID",
        "Product(s)",
        "Amount (Excl. GST)",
        "GST",
        "Total Amount",
      ];

      let yPosition = margin + 80;

      // Draw table header
      pdf.setFillColor(247, 248, 250);
      pdf.rect(margin, yPosition - 20, tableWidth, 25, "F");

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      let headerX = margin;
      headers.forEach((header, index) => {
        // Truncate long headers to fit in column
        let displayText = header;
        if (header === "Amount (Excl. GST)") {
          displayText = "Amount (Excl)";
        } else if (header === "Total Amount") {
          displayText = "Total";
        }
        pdf.text(displayText, headerX + 5, yPosition - 5);
        headerX += colWidths[index];
      });

      yPosition += 10;

      // Draw table rows
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");

      todaySales.forEach((row, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 100) {
          pdf.addPage();
          yPosition = margin + 80;

          // Redraw header on new page
          pdf.setFillColor(247, 248, 250);
          pdf.rect(margin, yPosition - 20, tableWidth, 25, "F");
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");
          let newPageHeaderX = margin;
          headers.forEach((header, headerIndex) => {
            // Truncate long headers to fit in column
            let displayText = header;
            if (header === "Amount (Excl. GST)") {
              displayText = "Amount (Excl)";
            } else if (header === "Total Amount") {
              displayText = "Total";
            }
            pdf.text(displayText, newPageHeaderX + 5, yPosition - 5);
            newPageHeaderX += colWidths[headerIndex];
          });
          yPosition += 10;
        }

        const rowData = [
          row.user || "N/A",
          row.date || "N/A",
          row.id || "N/A",
          row.product || "N/A",
          `Rs. ${row.amount?.toLocaleString() || "0"}`,
          `Rs. ${row.gst?.toLocaleString() || "0"}`,
          `Rs. ${row.total?.toLocaleString() || "0"}`,
        ];

        // Draw row background (alternating colors)
        if (index % 2 === 0) {
          pdf.setFillColor(255, 255, 255);
        } else {
          pdf.setFillColor(248, 250, 252);
        }
        pdf.rect(margin, yPosition - 15, tableWidth, 20, "F");

        // Draw row data
        let rowX = margin;
        rowData.forEach((cell, cellIndex) => {
          pdf.text(cell, rowX + 5, yPosition);
          rowX += colWidths[cellIndex];
        });

        yPosition += 25;
      });

      // Draw totals row
      yPosition += 10;
      pdf.setFillColor(37, 99, 235);
      pdf.rect(margin, yPosition - 15, tableWidth, 25, "F");

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255);

      const totalsData = [
        `Total Orders: ${totalOrdersToday}`,
        "",
        "",
        "",
        `Rs. ${totalSalesTodayExclGst.toLocaleString()}`,
        `Rs. ${totalGstToday.toLocaleString()}`,
        `Rs. ${totalSalesTodayInclGst.toLocaleString()}`,
      ];

      let totalsX = margin;
      totalsData.forEach((cell, cellIndex) => {
        pdf.text(cell, totalsX + 5, yPosition);
        totalsX += colWidths[cellIndex];
      });

      // Reset text color
      pdf.setTextColor(0, 0, 0);

      // Summary section
      yPosition += 50;
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Summary:", margin, yPosition);

      yPosition += 20;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`• Total Orders Today: ${totalOrdersToday}`, margin, yPosition);
      yPosition += 15;
      pdf.text(
        `• Total Sales (Incl. GST): Rs. ${totalSalesTodayInclGst.toLocaleString()}`,
        margin,
        yPosition
      );
      yPosition += 15;
      pdf.text(
        `• Total GST Collected: Rs. ${totalGstToday.toLocaleString()}`,
        margin,
        yPosition
      );
      yPosition += 15;
      pdf.text(
        `• Total Sales (Excl. GST): Rs. ${totalSalesTodayExclGst.toLocaleString()}`,
        margin,
        yPosition
      );

      // Footer
      pdf.setFontSize(8);
      pdf.text(
        `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        margin,
        pageHeight - 20
      );

      pdf.save(`today-sales-report-${todayStr.replace(/\//g, "-")}.pdf`);
    } catch (error) {
      console.error("Error generating today's sales PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  // Test function to verify API data structure
  const testAPIData = () => {
    console.log("=== API Data Test ===");
    console.log("Total orders:", orders.length);
    if (orders.length > 0) {
      const firstOrder = orders[0];
      console.log("First order structure:", {
        id: firstOrder._id,
        user: firstOrder.user,
        orderItems: firstOrder.orderItems,
        paymentMethod: firstOrder.paymentMethod,
        awbNumber: firstOrder.awbNumber,
        shippingAddress: firstOrder.shippingAddress,
      });

      if (firstOrder.orderItems.length > 0) {
        const firstItem = firstOrder.orderItems[0];
        console.log("First order item structure:", {
          name: firstItem.name,
          sku: firstItem.sku,
          hsn: firstItem.hsn,
          quantity: firstItem.quantity,
          price: firstItem.price,
          gst: firstItem.gst,
          totalGstForItem: firstItem.totalGstForItem,
        });
      }
    }
    console.log("Monthly sales count:", monthlySales.length);
    if (monthlySales.length > 0) {
      console.log("First monthly sale:", monthlySales[0]);
    }
    console.log("=== End API Data Test ===");
  };

  // Call test function when orders change
  useEffect(() => {
    if (orders.length > 0) {
      testAPIData();
    }
  }, [orders]);

  // Handle navigation from dashboard
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const section = searchParams.get("section");

    if (section) {
      // Wait for the component to render, then scroll to the section
      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          // Add a highlight effect
          element.style.transition = "box-shadow 0.3s ease";
          element.style.boxShadow = "0 0 20px rgba(37, 99, 235, 0.3)";
          setTimeout(() => {
            element.style.boxShadow = "";
          }, 2000);
        }
      }, 500);
    }
  }, [location.search, orders, subscriptions]);

  // Add this handler inside the Analytics component
  const handleDeleteSubscription = async (sub) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the subscription for ${
          sub.name || sub.user?.name || sub.email
        }?`
      )
    )
      return;
    try {
      const res = await axios.delete(
        `${BASE_URL}/api/orders/subscription/${sub.email}`,
        {
          headers: {
            // Add your auth headers if needed
          },
        }
      );
      alert(res.data.message || "Subscription deleted!");
      // Refresh the subscription list
      const subsResponse = await axios.get(
        `${BASE_URL}/api/admin/dashboard/subscription-list`
      );
      if (subsResponse.data.success) {
        setSubscriptions(subsResponse.data.data || []);
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete subscription. Please try again."
      );
    }
  };

  return (
    <div
      style={{ background: "#f5f6fa", minHeight: "100vh", padding: "40px 0" }}
    >
      {/* GST Analytics Section */}
      <section id="gst-analytics" style={cardStyle}>
        <div style={sectionTitleStyle}>GST Analytics</div>
        {/* Chart visualization */}
        <div
          style={{
            background: "#f7f8fa",
            height: 220,
            marginBottom: 24,
            borderRadius: 12,
            padding: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ResponsiveContainer width="100%" height={180}>
            <LineChart
              data={gstData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 13 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 13 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 5, fill: "#2563eb" }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Date range and download */}
        {/* <div
          style={{ display: "flex", alignItems: "center", marginBottom: 20 }}
        >
          <input
            type="date"
            value="2024-01-11"
            style={{
              marginRight: 8,
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              background: "#f7f8fa",
            }}
            readOnly
          />
          <input
            type="date"
            value="2024-03-31"
            style={{
              marginRight: 16,
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              background: "#f7f8fa",
            }}
            readOnly
          />
          <button style={{ ...buttonStyle, marginRight: 8 }}>
            Download GST Report
          </button>
          <span style={{ color: "#888", fontWeight: 500 }}>CSV | PDF</span>
        </div> */}
        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: "center" }}>Loading...</div>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Order ID</th>
                  <th style={thStyle}>Order Date</th>
                  <th style={thStyle}>Customer Name</th>
                  <th style={thStyle}>Product(s)</th>
                  <th style={thStyle}>GST Amount</th>
                  <th style={thStyle}>Total</th>
                </tr>
              </thead>
              <tbody>
                {gstTable.map((row) => (
                  <tr key={row.id}>
                    <td style={tdStyle}>{row.id}</td>
                    <td style={tdStyle}>{row.date}</td>
                    <td style={tdStyle}>{row.customer}</td>
                    <td style={tdStyle}>{row.product}</td>
                    <td style={tdStyle}>₹ {row.gst?.toLocaleString()}</td>
                    <td style={tdStyle}>₹ {row.total?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div
          style={{
            textAlign: "right",
            fontWeight: 700,
            fontSize: 16,
            marginTop: 10,
          }}
        >
          Total: ₹{" "}
          {gstTable
            .reduce((sum, row) => sum + (row.gst || 0), 0)
            .toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
      </section>

      {/* Today's Sales Section */}
      <section id="today-sales" style={cardStyle}>
        <div style={sectionTitleStyle}>Today's Sales</div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 12,
          }}
        >
          <button style={buttonStyle} onClick={handleDownloadTodaySalesReport}>
            Download Today's Sales Report
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>User Type</th>
                <th style={thStyle}>Date of Purchase</th>
                <th style={thStyle}>Order ID</th>
                <th style={thStyle}>Product(s)</th>
                <th style={thStyle}>Amount (Excl. GST)</th>
                <th style={thStyle}>GST</th>
                <th style={thStyle}>Total Amount</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {todaySales.map((row, idx) => (
                <tr key={idx}>
                  <td style={tdStyle}>{row.user}</td>
                  <td style={tdStyle}>{row.date}</td>
                  <td style={tdStyle}>{row.id}</td>
                  <td style={tdStyle}>{row.product}</td>
                  <td style={tdStyle}>₹ {row.amount?.toLocaleString()}</td>
                  <td style={tdStyle}>₹ {row.gst?.toLocaleString()}</td>
                  <td style={tdStyle}>₹ {row.total?.toLocaleString()}</td>
                  <td style={tdStyle}>
                    <button
                      style={{
                        ...buttonStyle,
                        padding: "4px 12px",
                        fontSize: 14,
                      }}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={summaryStyle}>
          <div>Total Orders Today: {totalOrdersToday}</div>
          <div>
            Total Sales (Incl. GST): ₹ {totalSalesTodayInclGst.toLocaleString()}
          </div>
          <div>Total GST Collected: ₹ {totalGstToday.toLocaleString()}</div>
          <div>
            Total Sales (Excl. GST): ₹ {totalSalesTodayExclGst.toLocaleString()}
          </div>
        </div>
      </section>

      {/* Monthly Sales Section */}
      <section id="monthly-sales" style={cardStyle}>
        <div style={sectionTitleStyle}>
          Monthly Sales (Delivered Orders Only)
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 12,
          }}
        >
          <button
            style={buttonStyle}
            onClick={handleDownloadMonthlySalesReport}
          >
            Download Monthly Sales Report
          </button>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontWeight: 600, fontSize: 15 }}>Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                background: "#f7f8fa",
                fontWeight: 600,
                minWidth: 120,
              }}
            >
              <option value={0}>January</option>
              <option value={1}>February</option>
              <option value={2}>March</option>
              <option value={3}>April</option>
              <option value={4}>May</option>
              <option value={5}>June</option>
              <option value={6}>July</option>
              <option value={7}>August</option>
              <option value={8}>September</option>
              <option value={9}>October</option>
              <option value={10}>November</option>
              <option value={11}>December</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontWeight: 600, fontSize: 15 }}>Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                background: "#f7f8fa",
                fontWeight: 600,
                minWidth: 100,
              }}
            >
              {Array.from({ length: 10 }, (_, i) => {
                const year = new Date().getFullYear() - 5 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
          <div
            style={{
              color: "#555",
              fontWeight: 500,
              fontSize: 15,
              marginLeft: 16,
            }}
          >
            {selectedMonthName} 1, {selectedYear} → {selectedMonthName}{" "}
            {lastDayOfMonth}, {selectedYear}
          </div>
        </div>
        <div
          style={{
            color: "#2563eb",
            fontWeight: 600,
            fontSize: 14,
            marginBottom: 16,
            fontStyle: "italic",
          }}
        >
          Showing only delivered orders
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Customer Name</th>
                <th style={thStyle}>User Type</th>
                <th style={thStyle}>Date of Purchase</th>
                <th style={thStyle}>Amount (Excl. GST)</th>
                <th style={thStyle}>Total Amount (Incl. GST)</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {monthlySales.map((row, idx) => (
                <tr key={idx}>
                  <td style={tdStyle}>{row.name}</td>
                  <td style={tdStyle}>{row.type}</td>
                  <td style={tdStyle}>{row.date}</td>
                  <td style={tdStyle}>₹ {row.amount?.toLocaleString()}</td>
                  <td style={tdStyle}>₹ {row.total?.toLocaleString()}</td>
                  <td style={tdStyle}>
                    <button
                      style={{
                        ...buttonStyle,
                        padding: "4px 12px",
                        fontSize: 14,
                      }}
                      onClick={() => handleDownloadInvoice(row)}
                    >
                      Download Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={summaryStyle}>
          <div>Total Orders: {totalOrdersMonth}</div>
          <div>
            Total Sales (Incl. GST): ₹ {totalSalesMonthInclGst.toLocaleString()}
          </div>
          <div>Total GST Collected: ₹ {totalGstMonth.toLocaleString()}</div>
          <div>
            Total Sales (Excl. GST): ₹ {totalSalesMonthExclGst.toLocaleString()}
          </div>
        </div>
      </section>

      {/* Subscription Management Section */}
      <section
        id="subscription-management"
        style={{
          ...cardStyle,
          marginTop: 32,
          padding: 24,
          borderRadius: 16,
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          maxWidth: 1100,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <div
          style={{
            ...sectionTitleStyle,
            marginBottom: 18,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 0.2,
          }}
        >
          Subscription Management
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 18,
            flexWrap: "wrap",
          }}
        >
          <button
            style={{
              ...buttonStyle,
              background: "#f15bb5",
              marginRight: 8,
              minWidth: 120,
            }}
            onClick={handleOpenAddDialog}
          >
            + Add Member
          </button>
          <button
            style={{
              ...buttonStyle,
              minWidth: 140,
            }}
          >
            Send Reminder
          </button>

          <select
            value={sortOrder}
            onChange={(e) => handleSortOrderChange(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              background: "#f7f8fa",
              width: 140,
              fontWeight: 600,
            }}
          >
            <option value="asc">Sort: Days Left Ascending</option>
            <option value="desc">Sort: Days Left Descending</option>
          </select>
        </div>
        <div style={{ overflowX: "auto" }}>
          {loadingSubs ? (
            <div style={{ padding: 20, textAlign: "center" }}>Loading...</div>
          ) : (
            <table
              style={{
                ...tableStyle,
                minWidth: 600,
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                background: "#fff",
              }}
            >
              <thead>
                <tr>
                  <th style={{ ...thStyle, minWidth: 180 }}>Member</th>
                  <th style={thStyle}>Subscription End</th>
                  <th style={thStyle}>Days Left</th>
                  <th style={thStyle}></th>
                  <th style={thStyle}></th> {/* New column for delete icon */}
                </tr>
              </thead>
              <tbody>
                {filteredSubs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{ ...tdStyle, textAlign: "center", color: "#888" }}
                    >
                      No subscriptions found.
                    </td>
                  </tr>
                ) : (
                  filteredSubs.map((sub, idx) => (
                    <tr key={idx}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>
                        {sub.name || sub.user?.name || "N/A"}
                        <span
                          style={{
                            marginLeft: 8,
                            color: "#888",
                            fontWeight: 400,
                            fontSize: 14,
                          }}
                        >
                          {sub.type || "Premium"}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {sub.subscriptionEnd ||
                          sub.endDate ||
                          sub.subscriptionEndDate ||
                          "N/A"}
                      </td>
                      <td style={tdStyle}>
                        {getDaysLeft(
                          sub.subscriptionEnd ||
                            sub.endDate ||
                            sub.subscriptionEndDate
                        )}
                      </td>
                      <td style={tdStyle}>
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 20,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={() => handleSendReminder(sub)}
                          title="Send Reminder"
                        >
                          <span role="img" aria-label="remind">
                            ✉️
                          </span>
                        </button>
                      </td>
                      <td style={tdStyle}>
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 20,
                            color: "#e53e3e",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={() => handleDeleteSubscription(sub)}
                          title="Delete Subscription"
                        >
                          <DeleteOutlineIcon />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Dummy Add Member Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={handleCloseAddDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            letterSpacing: 0.2,
            pb: 1,
            textAlign: "center",
          }}
        >
          Add Member to Subscription
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              p: 2,
              background: "#f7f8fa",
              borderRadius: 2,
              boxShadow: 1,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              minWidth: 320,
              mt: 1,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                mb: 1,
                color: "#222",
                textAlign: "center",
              }}
            >
              Enter the email of the user to add a subscription
            </Typography>
            <AdminForm
              fields={[
                {
                  name: "email",
                  label: "User Email",
                  type: "text",
                  required: true,
                  placeholder: "Enter user email",
                  sx: { background: "#fff", borderRadius: 1, minWidth: 280 },
                },
              ]}
              values={{ email: addEmail }}
              errors={addError ? { email: addError } : {}}
              onChange={(name, value) => {
                setAddEmail(value);
                if (addError) setAddError(""); // Clear error when user starts typing
              }}
            />
            {addLoading && (
              <Box sx={{ textAlign: "center", mt: 1 }}>
                <CircularProgress size={28} />
              </Box>
            )}
            {addSuccess && (
              <Typography
                color="success.main"
                sx={{ mt: 1, textAlign: "center", fontWeight: 600 }}
              >
                {addSuccess}
              </Typography>
            )}
            {addError && (
              <Typography
                color="error.main"
                sx={{ mt: 1, textAlign: "center", fontWeight: 600 }}
              >
                {addError}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2, pt: 1 }}>
          <Button
            onClick={handleCloseAddDialog}
            disabled={addLoading}
            sx={{ minWidth: 100, borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddMember}
            disabled={addLoading || !addEmail}
            sx={{ minWidth: 120, borderRadius: 2, fontWeight: 600 }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
      {/* Hidden invoice template for PDF generation */}
      <div
        style={{
          position: "absolute",
          left: -9999,
          top: 0,
          width: "595px",
          height: "842px",
          overflow: "hidden",
          visibility: "hidden",
        }}
      >
        <InvoiceTemplate ref={invoiceRef} />
      </div>
    </div>
  );
}

export default Analytics;
