const PDFDocument = require('pdfkit');

const HEADER_COLOR = '#2563eb'; // Tailwind blue-600
const SECTION_BG = '#f1f5f9';   // Tailwind slate-100
const SECTION_LINE = '#cbd5e1'; // Tailwind slate-300
const PAGE_MARGIN = 60;
const COL_GAP = 30;
const LABEL_WIDTH = 90;
const VALUE_WIDTH = 180;

function addHeader(doc) {
    doc.save();
    doc.rect(0, 0, doc.page.width, 40).fill(HEADER_COLOR);
    doc.fillColor('white').fontSize(18).font('Helvetica-Bold').text('LogiTrack - Shipment Details', 0, 10, { align: 'center', width: doc.page.width });
    doc.restore();
    doc.moveDown(2);
}

function addSectionLine(doc) {
    doc.moveDown(0.5);
    doc.save();
    doc.moveTo(PAGE_MARGIN, doc.y).lineTo(doc.page.width - PAGE_MARGIN, doc.y).strokeColor(SECTION_LINE).lineWidth(1).stroke();
    doc.restore();
    doc.moveDown(1);
}

function addFooter(doc) {
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(9).fillColor('#64748b').text(`Page ${i + 1} of ${range.count}`, 0, doc.page.height - 30, {
            align: 'center',
            width: doc.page.width
        });
    }
}

function drawLabelValueColumn(doc, label, value, x, y) {
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#222');
    const labelText = label;
    const valueText = value;
    const labelHeight = doc.heightOfString(labelText, { width: LABEL_WIDTH });
    const valueHeight = doc.heightOfString(valueText, { width: VALUE_WIDTH });
    doc.text(labelText, x, y, { width: LABEL_WIDTH });
    doc.font('Helvetica').fontSize(11).fillColor('#222').text(valueText, x + LABEL_WIDTH, y, { width: VALUE_WIDTH });
    return Math.max(labelHeight, valueHeight, 15) + 2;
}

function drawLabelValueRow(doc, label1, value1, label2, value2, x1, x2, y) {
    // Render left column and measure height
    const leftHeight = drawLabelValueColumn(doc, label1, value1, x1, y);
    // Render right column and measure height
    const rightHeight = drawLabelValueColumn(doc, label2, value2, x2, y);
    // Advance y by the max
    return Math.max(leftHeight, rightHeight);
}

function drawSingleLabelValue(doc, label, value, x, y) {
    return drawLabelValueColumn(doc, label, value, x, y);
}

const generateShipmentPDF = (shipment, res) => {
    const doc = new PDFDocument({ margin: PAGE_MARGIN, bufferPages: true });

    res.setHeader("content-type", "application/pdf");
    res.setHeader("content-disposition", `attachment; filename=shipment-${shipment.id}.pdf`);
    doc.pipe(res);

    // Header Bar
    addHeader(doc);

    // Bill Info (single row, two columns)
    let y = doc.y;
    const col1x = PAGE_MARGIN;
    const col2x = doc.page.width / 2 + COL_GAP / 2;
    let rowHeight = drawLabelValueRow(
        doc,
        "Bill Number:", shipment.billNo,
        "Date:", new Date(shipment.date).toLocaleDateString(),
        col1x, col2x, y
    );
    y += rowHeight;
    rowHeight = drawLabelValueRow(
        doc,
        "Transport Name:", shipment.transportName,
        "Payment Method:", shipment.paymentMethod.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        col1x, col2x, y
    );
    y += rowHeight;
    doc.y = y;
    addSectionLine(doc);

    // Consignor/Consignee (side by side)
    y = doc.y;
    doc.fontSize(13).font('Helvetica-Bold').fillColor(HEADER_COLOR).text("Consignor Details", col1x, y);
    doc.fontSize(13).font('Helvetica-Bold').fillColor(HEADER_COLOR).text("Consignee Details", col2x, y);
    y += 22; // More space after heading
    rowHeight = drawLabelValueRow(doc, "Name:", shipment.consignorName, "Name:", shipment.consigneeName, col1x, col2x, y);
    y += rowHeight;
    rowHeight = drawLabelValueRow(doc, "GST No:", shipment.consignorGstNo, "GST No:", shipment.consigneeGstNo, col1x, col2x, y);
    y += rowHeight;
    rowHeight = drawLabelValueRow(doc, "Address:", shipment.consignorAddress, "Address:", shipment.consigneeAddress, col1x, col2x, y);
    y += rowHeight;
    doc.y = y;
    addSectionLine(doc);

    // Goods/Route (side by side)
    y = doc.y;
    doc.fontSize(13).font('Helvetica-Bold').fillColor(HEADER_COLOR).text("Goods Information", col1x, y);
    doc.fontSize(13).font('Helvetica-Bold').fillColor(HEADER_COLOR).text("Route Information", col2x, y);
    y += 22; // More space after heading
    rowHeight = drawLabelValueRow(doc, "Goods Type:", shipment.goodsType, "Source:", shipment.source, col1x, col2x, y);
    y += rowHeight;
    rowHeight = drawLabelValueRow(doc, "Goods Desc:", shipment.goodsDescription, "Destination:", shipment.destination, col1x, col2x, y);
    y += rowHeight;
    rowHeight = drawLabelValueRow(doc, "Weight:", `${shipment.weight} kg`, "E-Way Bill:", shipment.ewayBillNumber || 'N/A', col1x, col2x, y);
    y += rowHeight;
    rowHeight = drawSingleLabelValue(doc, "Private Mark:", shipment.privateMark || 'N/A', col1x, y);
    y += rowHeight;
    doc.y = y;
    addSectionLine(doc);

    // Driver & Vehicle (single row, two columns)
    y = doc.y;
    doc.fontSize(13).font('Helvetica-Bold').fillColor(HEADER_COLOR).text("Driver & Vehicle", col1x, y);
    y += 22; // More space after heading
    rowHeight = drawLabelValueRow(doc, "Driver:", shipment.driver?.name || 'N/A', "Vehicle:", shipment.vehicle?.number || 'N/A', col1x, col2x, y);
    y += rowHeight;
    doc.y = y;
    addSectionLine(doc);

    // Charges (full width, two columns)
    y = doc.y;
    doc.fontSize(13).font('Helvetica-Bold').fillColor(HEADER_COLOR).text("Charges Breakdown", col1x, y);
    y += 22; // More space after heading
    rowHeight = drawLabelValueRow(doc, "Freight Charges:", `INR ${shipment.freightCharges.toFixed(2)}`, "Local Cartage:", `INR ${shipment.localCartageCharges.toFixed(2)}`, col1x, col2x, y);
    y += rowHeight;
    rowHeight = drawLabelValueRow(doc, "Hamali Charges:", `INR ${shipment.hamaliCharges.toFixed(2)}`, "Stationary:", `INR ${shipment.stationaryCharges.toFixed(2)}`, col1x, col2x, y);
    y += rowHeight;
    rowHeight = drawLabelValueRow(doc, "Door Delivery:", `INR ${shipment.doorDeliveryCharges.toFixed(2)}`, "Other Charges:", `INR ${shipment.otherCharges.toFixed(2)}`, col1x, col2x, y);
    y += rowHeight;
    y += 18; // Extra space before grand total
    // Ensure the first argument to doc.text is a string, not a number
    doc.fontSize(13).font('Helvetica-Bold').fillColor(HEADER_COLOR);
    const grandTotalText = `Grand Total: INR ${shipment.grandTotal.toFixed(2)}`;
    doc.text(grandTotalText, col2x, y, { align: 'right', width: doc.page.width / 2 - PAGE_MARGIN - COL_GAP / 2 });

    // Footer
    doc.end();
    doc.on('end', () => addFooter(doc));
};

module.exports = {
    generateShipmentPDF
};