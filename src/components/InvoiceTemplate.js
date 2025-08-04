import React from "react";

const InvoiceTemplate = React.forwardRef((props, ref) => {
  // Default values for props
  const {
    customerName = "D srinivasu",
    customerAddress = "Plot NO 91, Block B",
    customerAddress2 = "Road NO 4, Siddhartha Enclave",
    customerAddress3 = "Patelguda, Beeramguda",
    customerPin = "502319",
    customerMobile = "+91 9966111648",
    orderNumber = "ORD-001",
    invoiceId = "INV-001", // New invoice ID prop
    orderDate = "01-01-2025",
    paymentMethod = "NONCOD",
    awbNumber = "195042195657972",
    productName = "Beaten Oversized T-Shirt",
    productSku = "BT-TS BLK-OS-L",
    productHsn = "6109",
    productQuantity = "1",
    productRate = "₹1189",
    productAmount = "₹11.89",
    productTotal = "₹1199",
    cgstAmount = "₹14.98",
    sgstAmount = "₹14.80",
    igstAmount = "₹0",
    totalAmountExclGst = "₹1342",
    totalAmountInclGst = "₹1343",
    orderItems = [], // Array of products for the order
  } = props;

  return (
    <div
      ref={ref}
      style={{
        width: 595, // A4 width in px at 72dpi
        minHeight: 842, // A4 height in px at 72dpi
        background: "#fff",
        color: "#000",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        padding: 32,
        boxSizing: "border-box",
        border: "1px solid #eee",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ fontWeight: 700 }}>
            Seller/Consignor: Beaten apparels
          </div>
          <div style={{ fontSize: 13 }}>
            Plot NO 91, Block B, Road No-4,
            <br />
            Siddhartha Enclave, Patelguda,
            <br />
            Beeramguda, Pincode : 502319
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 900, fontSize: 32, letterSpacing: 2 }}>
            BEATEN
          </div>
          <div style={{ fontSize: 13 }}>
            Customer Support: +91 7799120325
            <br />
            Email: customerSupport@beaten.in
          </div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Dated: {orderDate}</div>
        </div>
      </div>
      <div style={{ fontSize: 13, marginBottom: 8 }}>
        GSTIN: 36AEBFB6155C1ZQ
      </div>
      <div style={{ fontSize: 13, marginBottom: 8 }}>
        <b>Recipient Address:</b> {customerName}
        <br />
        {customerAddress}
        <br />
        {customerAddress2}
        <br />
        {customerAddress3}
        <br />
        Pin : {customerPin}
        <br />
        Mobile NO : {customerMobile}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          marginBottom: 8,
        }}
      >
        <div>
          ORDER NUMBER: {orderNumber}
          <br />
          INVOICE ID: {invoiceId}
          <br />
          Carrier Name: DELHIVERY
        </div>
        <div style={{ textAlign: "right" }}>
          Mode Of Payment: {paymentMethod}
          <br />
          AWB Number: {awbNumber}
        </div>
      </div>
      {/* Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: 12,
          fontSize: 14,
        }}
      >
        <thead>
          <tr style={{ background: "#f7f8fa" }}>
            <th style={{ border: "1px solid #ddd", padding: 6 }}>
              Description
            </th>
            <th style={{ border: "1px solid #ddd", padding: 6 }}>SKU</th>
            <th style={{ border: "1px solid #ddd", padding: 6 }}>HSN</th>
            <th style={{ border: "1px solid #ddd", padding: 6 }}>Qty</th>
            <th style={{ border: "1px solid #ddd", padding: 6 }}>Rate</th>
            <th style={{ border: "1px solid #ddd", padding: 6 }}>Amount</th>
            <th style={{ border: "1px solid #ddd", padding: 6 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {orderItems && orderItems.length > 0 ? (
            // Render each product as a separate row
            orderItems.map((item, index) => (
              <tr key={index}>
                <td style={{ border: "1px solid #ddd", padding: 6 }}>
                  {item.name}
                </td>
                <td style={{ border: "1px solid #ddd", padding: 6 }}>
                  {item.sku || "BT-TS BLK-OS-L"}
                </td>
                <td style={{ border: "1px solid #ddd", padding: 6 }}>
                  {item.hsn || "6109"}
                </td>
                <td style={{ border: "1px solid #ddd", padding: 6 }}>
                  {item.quantity}
                </td>
                <td style={{ border: "1px solid #ddd", padding: 6 }}>
                  ₹{item.price}
                </td>
                <td style={{ border: "1px solid #ddd", padding: 6 }}>
                  ₹
                  {(item.price * item.quantity - item.totalGstForItem).toFixed(
                    2
                  )}
                </td>
                <td style={{ border: "1px solid #ddd", padding: 6 }}>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))
          ) : (
            // Fallback to single product display
            <tr>
              <td style={{ border: "1px solid #ddd", padding: 6 }}>
                {productName}
              </td>
              <td style={{ border: "1px solid #ddd", padding: 6 }}>
                {productSku}
              </td>
              <td style={{ border: "1px solid #ddd", padding: 6 }}>
                {productHsn}
              </td>
              <td style={{ border: "1px solid #ddd", padding: 6 }}>
                {productQuantity}
              </td>
              <td style={{ border: "1px solid #ddd", padding: 6 }}>
                {productRate}
              </td>
              <td style={{ border: "1px solid #ddd", padding: 6 }}>
                {productAmount}
              </td>
              <td style={{ border: "1px solid #ddd", padding: 6 }}>
                {productTotal}
              </td>
            </tr>
          )}
          <tr>
            <td style={{ border: "1px solid #ddd", padding: 6 }}></td>
            <td style={{ border: "1px solid #ddd", padding: 6 }}></td>
            <td style={{ border: "1px solid #ddd", padding: 6 }}></td>
            <td style={{ border: "1px solid #ddd", padding: 6 }}></td>
            <td style={{ border: "1px solid #ddd", padding: 6 }}>CGST</td>
            <td style={{ border: "1px solid #ddd", padding: 6 }}>
              {cgstAmount}
            </td>
            <td style={{ border: "1px solid #ddd", padding: 6 }}>-</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ddd", padding: 6 }}></td>
            <td style={{ border: "1px solid #ddd", padding: 6 }}></td>
            <td style={{ border: "1px solid #ddd", padding: 6 }}></td>
            <td style={{ border: "1px solid #ddd", padding: 6 }}></td>
            <td style={{ border: "1px solid #ddd", padding: 6 }}>SGST</td>
            <td style={{ border: "1px solid #ddd", padding: 6 }}>
              {sgstAmount}
            </td>
            <td style={{ border: "1px solid #ddd", padding: 6 }}>-</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ddd", padding: 6 }}></td>
            <td style={{ border: "1px solid #ddd", padding: 6 }}></td>
            <td style={{ border: "1px solid #ddd", padding: 6 }}></td>
            <td style={{ border: "1px solid #ddd", padding: 6 }}></td>
            <td style={{ border: "1px solid #ddd", padding: 6 }}>IGST</td>
            <td style={{ border: "1px solid #ddd", padding: 6 }}>
              {igstAmount}
            </td>
            <td style={{ border: "1px solid #ddd", padding: 6 }}>Total</td>
          </tr>
          <tr style={{ fontWeight: 700, background: "#f7f8fa" }}>
            <td style={{ border: "1px solid #ddd", padding: 6 }} colSpan={5}>
              Total Amount
            </td>
            <td style={{ border: "1px solid #ddd", padding: 6 }}>
              {totalAmountExclGst}
            </td>
            <td style={{ border: "1px solid #ddd", padding: 6 }}>
              {totalAmountInclGst}
            </td>
          </tr>
        </tbody>
      </table>
      {/* QR and Footer */}

      <div style={{ fontWeight: 600, fontSize: 16, margin: "16px 0 8px 0" }}>
        Thank You For shopping with BEATEN
      </div>
      <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>
        Products being sent under this invoice are for personal consumption of
        the customer and not for re-sale or commercial purposes.
        <br />
        This is an electronically generated document issued in accordance with
        the provisions of the Information Technology Act, 2000 (21 of 2000) and
        does not require a physical signature.
      </div>
      <div style={{ fontSize: 12, color: "#555" }}>
        Regd Office: Beaten Apparels Plot NO 91,Block B,Road NO-4,Siddhartha
        Enclave,Patelguda,Beeramguda,Pincode : 502319
      </div>
      <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
        Elevate your look with BEATEN... www.beaten.in
      </div>
    </div>
  );
});

export default InvoiceTemplate;
