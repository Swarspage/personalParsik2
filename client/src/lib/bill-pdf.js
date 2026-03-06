import jsPDF from "jspdf";
import { format } from "date-fns";

export function generateBillPDF(order, allOrders) {
    // 1. Consolidate orders
    // Find all unpaid orders for the same customer (match name & phone ignoring case/spacing)
    const isSameCustomer = (a, b) =>
        a.customerName.trim().toLowerCase() === b.customerName.trim().toLowerCase() &&
        a.phoneNumber.trim() === b.phoneNumber.trim();

    // We filter from `allOrders` rather than fetching afresh to rely on local state
    // Only combine orders that are NOT yet completed/paid and belong to this customer
    // (Including the target `order` because its status might not be officially updated in allOrders list yet during generation)
    const customerOrders = allOrders.filter(o =>
        isSameCustomer(o, order) &&
        (o.status !== "completed" || o.id === order.id)
    );

    // Fallback if allOrders isn't fully loaded, just use the single order
    const ordersToBill = customerOrders.length > 0 ? customerOrders : [order];

    // Merge items and calculate totals
    const allItems = [];
    let subtotal = 0;
    let tax = 0;
    let totalAmount = 0;

    ordersToBill.forEach(o => {
        allItems.push(...o.items);
        subtotal += Number(o.subtotal);
        tax += Number(o.tax);
        totalAmount += Number(o.totalAmount);
    });

    // Consolidate identical items
    const consolidatedItems = [];
    allItems.forEach(item => {
        const existing = consolidatedItems.find(i => i.dishId === item.dishId);
        if (existing) {
            existing.quantity += item.quantity;
        } else {
            consolidatedItems.push({ ...item });
        }
    });

    // 2. Generate PDF
    // size: 80mm thermal receipt format width. Using standard A5 for premium look as requested.
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a5"
    });

    // Helper for centering text
    const centerText = (text, y, size = 10, isBold = false) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        const textWidth = doc.getStringUnitWidth(text) * size / doc.internal.scaleFactor;
        const x = (148 - textWidth) / 2; // A5 width is 148mm
        doc.text(text, x, y);
    };

    const leftX = 15;
    const rightX = 133;
    let currentY = 20;

    // Header Title
    centerText("PARSIK CAFE", currentY, 22, true);
    currentY += 6;
    centerText("— Artisanal Dining Experience —", currentY, 10, false);
    currentY += 12;

    // Invoice Details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const dateStr = format(new Date(), "dd/MM/yyyy");
    const timeStr = format(new Date(), "HH:mm");

    doc.text(`Date: ${dateStr}`, leftX, currentY);
    doc.text(`Time: ${timeStr}`, rightX - doc.getTextWidth(`Time: ${timeStr}`), currentY);
    currentY += 6;

    const billNo = `INV-${order.id.toString().padStart(4, '0')}`;
    doc.text(`Bill #: ${billNo}`, leftX, currentY);
    const tableText = order.tableNumber ? `Table: ${order.tableNumber}` : "Express/Takeaway";
    doc.text(tableText, rightX - doc.getTextWidth(tableText), currentY);

    currentY += 4;
    doc.setLineWidth(0.5);
    doc.line(leftX, currentY, rightX, currentY); // divider
    currentY += 6;

    // Customer Details
    doc.setFont("helvetica", "bold");
    doc.text("Customer:", leftX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(order.customerName, leftX + 22, currentY);
    currentY += 6;

    doc.setFont("helvetica", "bold");
    doc.text("Phone:", leftX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(order.phoneNumber, leftX + 22, currentY);

    currentY += 4;
    doc.line(leftX, currentY, rightX, currentY); // divider
    currentY += 8;

    // Items Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("ITEM", leftX, currentY);
    doc.text("QTY", 90, currentY);
    doc.text("AMOUNT", rightX - doc.getTextWidth("AMOUNT"), currentY);

    currentY += 3;
    doc.setLineWidth(0.2);
    doc.line(leftX, currentY, rightX, currentY); // divider
    currentY += 6;

    // Items List
    doc.setFont("helvetica", "normal");
    consolidatedItems.forEach(item => {
        // Truncate long names slightly
        const name = item.dishName.length > 25 ? item.dishName.substring(0, 23) + "..." : item.dishName;
        const qty = item.quantity.toString();
        const amt = `Rs.${(item.price * item.quantity).toFixed(2)}`;

        doc.setFont("helvetica", "bold");
        doc.text(name, leftX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(qty, 92, currentY);
        doc.text(amt, rightX - doc.getTextWidth(amt), currentY);

        currentY += 5;

        // Display applied offer if exists
        if (item.appliedOfferTitle) {
            doc.setFontSize(7);
            doc.setTextColor(200, 50, 50); // Red accent for discount
            const offerText = `↳ Offer: ${item.appliedOfferTitle}`;
            doc.text(offerText, leftX + 2, currentY);
            doc.setTextColor(0, 0, 0); // Reset to black
            doc.setFontSize(9);
            currentY += 4;
        } else {
            currentY += 1;
        }
    });

    currentY += 2;
    doc.setLineWidth(0.5);
    doc.line(leftX, currentY, rightX, currentY); // divider
    currentY += 6;

    // Totals
    doc.setFontSize(10);
    const subTx = `Rs.${subtotal.toFixed(2)}`;
    doc.text("Subtotal:", 90, currentY);
    doc.text(subTx, rightX - doc.getTextWidth(subTx), currentY);
    currentY += 6;

    const taxTx = `Rs.${tax.toFixed(2)}`;
    doc.text("Taxes (5%):", 90, currentY);
    doc.text(taxTx, rightX - doc.getTextWidth(taxTx), currentY);
    currentY += 6;

    // Grand Total
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const totalTx = `Rs.${totalAmount.toFixed(2)}`;
    doc.text("TOTAL:", 90, currentY);
    doc.text(totalTx, rightX - doc.getTextWidth(totalTx), currentY);

    currentY += 8;
    doc.setLineWidth(0.2);
    doc.line(leftX, currentY, rightX, currentY); // divider
    currentY += 8;

    // Footer / Status
    doc.setFontSize(10);
    doc.text("Payment:", leftX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(order.paymentMethod.toUpperCase(), leftX + 20, currentY);
    currentY += 6;

    doc.setFont("helvetica", "bold");
    doc.text("Status:", leftX, currentY);
    doc.setTextColor(0, 150, 0); // Green
    doc.text("PAID ✓", leftX + 16, currentY);
    doc.setTextColor(0, 0, 0); // Reset to black

    currentY += 15;
    centerText("Thank you for dining with us!", currentY, 12, true);
    currentY += 6;
    centerText("parsik.cafe  •  @parsikelite", currentY, 9, false);

    // Save the PDF
    const filename = `Parsik_Bill_${billNo}.pdf`;
    doc.save(filename);
}
