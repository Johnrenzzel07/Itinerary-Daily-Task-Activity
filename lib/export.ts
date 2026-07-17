import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx-js-style";
import { formatActivityDate, formatActivityTime } from "@/lib/utils";
import { formatPhilippinesNowLabel } from "@/lib/philippines-time";
import type { ActivityWithRelations } from "@/types";

type ExportEmployee = {
  name: string;
  position: string;
};

type ExportOptions = {
  title?: string;
  employee?: ExportEmployee | null;
};

const HEADER_FILL = "4F46E5";
const HEADER_TEXT = "FFFFFF";
const LABEL_FILL = "EEF2FF";
const ALT_ROW_FILL = "F8FAFC";
const BORDER_COLOR = "CBD5E1";

function cellStyle(
  overrides: XLSX.CellObject["s"] = {}
): XLSX.CellObject["s"] {
  return {
    font: { name: "Calibri", sz: 11, color: { rgb: "1E293B" } },
    alignment: { vertical: "center", wrapText: true },
    border: {
      top: { style: "thin", color: { rgb: BORDER_COLOR } },
      bottom: { style: "thin", color: { rgb: BORDER_COLOR } },
      left: { style: "thin", color: { rgb: BORDER_COLOR } },
      right: { style: "thin", color: { rgb: BORDER_COLOR } },
    },
    ...overrides,
  };
}

function styledCell(value: string | number, style: XLSX.CellObject["s"]): XLSX.CellObject {
  return { v: value, t: "s", s: style };
}

function resolveEmployee(
  activities: ActivityWithRelations[],
  employee?: ExportEmployee | null
): ExportEmployee | null {
  if (employee?.name) return employee;
  if (activities[0]?.employee) {
    return {
      name: activities[0].employee.name,
      position: activities[0].employee.position,
    };
  }
  return null;
}

export function exportActivitiesToPDF(
  activities: ActivityWithRelations[],
  title = "Daily Work Itinerary"
) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(title, 14, 20);

  if (activities[0]?.employee) {
    doc.setFontSize(11);
    doc.text(`Name: ${activities[0].employee.name}`, 14, 30);
    doc.text(`Position: ${activities[0].employee.position}`, 14, 36);
  }

  autoTable(doc, {
    startY: 44,
    head: [["Date", "Time", "Activity", "Status", "Remarks"]],
    body: activities.map((a) => [
      formatActivityDate(a.createdAt),
      formatActivityTime(a.createdAt),
      a.activity,
      a.status.name,
      a.remarks || "-",
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 0, 0] },
  });

  doc.save(`itinerary-${new Date().toISOString().split("T")[0]}.pdf`);
}

export function exportActivitiesToExcel(
  activities: ActivityWithRelations[],
  options: ExportOptions = {}
) {
  const title = options.title ?? "Daily Work Itinerary";
  const employee = resolveEmployee(activities, options.employee);
  const exportedAt = formatPhilippinesNowLabel("MMMM d, yyyy h:mm a");

  const sheetData: XLSX.CellObject[][] = [
    [styledCell(title.toUpperCase(), cellStyle({
      font: { name: "Calibri", bold: true, sz: 16, color: { rgb: HEADER_TEXT } },
      fill: { fgColor: { rgb: HEADER_FILL } },
      alignment: { horizontal: "center", vertical: "center" },
    }))],
    [
      styledCell("Name", cellStyle({
        font: { name: "Calibri", bold: true, sz: 11, color: { rgb: "312E81" } },
        fill: { fgColor: { rgb: LABEL_FILL } },
      })),
      styledCell(employee?.name ?? "—", cellStyle({
        fill: { fgColor: { rgb: "FFFFFF" } },
      })),
      styledCell("", cellStyle()),
      styledCell("", cellStyle()),
      styledCell("", cellStyle()),
    ],
    [
      styledCell("Position", cellStyle({
        font: { name: "Calibri", bold: true, sz: 11, color: { rgb: "312E81" } },
        fill: { fgColor: { rgb: LABEL_FILL } },
      })),
      styledCell(employee?.position ?? "—", cellStyle({
        fill: { fgColor: { rgb: "FFFFFF" } },
      })),
      styledCell("", cellStyle()),
      styledCell("", cellStyle()),
      styledCell("", cellStyle()),
    ],
    [
      styledCell(`Exported: ${exportedAt}`, cellStyle({
        font: { name: "Calibri", italic: true, sz: 10, color: { rgb: "64748B" } },
        fill: { fgColor: { rgb: "FFFFFF" } },
      })),
      styledCell("", cellStyle()),
      styledCell("", cellStyle()),
      styledCell("", cellStyle()),
      styledCell("", cellStyle()),
    ],
    [
      styledCell("Date", cellStyle({
        font: { name: "Calibri", bold: true, sz: 11, color: { rgb: HEADER_TEXT } },
        fill: { fgColor: { rgb: HEADER_FILL } },
        alignment: { horizontal: "center" },
      })),
      styledCell("Time", cellStyle({
        font: { name: "Calibri", bold: true, sz: 11, color: { rgb: HEADER_TEXT } },
        fill: { fgColor: { rgb: HEADER_FILL } },
        alignment: { horizontal: "center" },
      })),
      styledCell("Activity", cellStyle({
        font: { name: "Calibri", bold: true, sz: 11, color: { rgb: HEADER_TEXT } },
        fill: { fgColor: { rgb: HEADER_FILL } },
        alignment: { horizontal: "center" },
      })),
      styledCell("Status", cellStyle({
        font: { name: "Calibri", bold: true, sz: 11, color: { rgb: HEADER_TEXT } },
        fill: { fgColor: { rgb: HEADER_FILL } },
        alignment: { horizontal: "center" },
      })),
      styledCell("Remarks", cellStyle({
        font: { name: "Calibri", bold: true, sz: 11, color: { rgb: HEADER_TEXT } },
        fill: { fgColor: { rgb: HEADER_FILL } },
        alignment: { horizontal: "center" },
      })),
    ],
  ];

  activities.forEach((activity, index) => {
    const rowFill = index % 2 === 1 ? ALT_ROW_FILL : "FFFFFF";
    sheetData.push([
      styledCell(formatActivityDate(activity.createdAt), cellStyle({
        fill: { fgColor: { rgb: rowFill } },
        alignment: { horizontal: "left" },
      })),
      styledCell(formatActivityTime(activity.createdAt), cellStyle({
        fill: { fgColor: { rgb: rowFill } },
        alignment: { horizontal: "left" },
      })),
      styledCell(activity.activity, cellStyle({
        fill: { fgColor: { rgb: rowFill } },
        alignment: { horizontal: "left", wrapText: true },
      })),
      styledCell(activity.status.name, cellStyle({
        fill: { fgColor: { rgb: rowFill } },
        alignment: { horizontal: "center" },
        font: { name: "Calibri", bold: true, sz: 11, color: { rgb: "1E293B" } },
      })),
      styledCell(activity.remarks || "-", cellStyle({
        fill: { fgColor: { rgb: rowFill } },
        alignment: { horizontal: "left", wrapText: true },
      })),
    ]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
    { s: { r: 1, c: 1 }, e: { r: 1, c: 4 } },
    { s: { r: 2, c: 1 }, e: { r: 2, c: 4 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 4 } },
  ];

  worksheet["!cols"] = [
    { wch: 18 },
    { wch: 14 },
    { wch: 52 },
    { wch: 16 },
    { wch: 34 },
  ];

  worksheet["!rows"] = [
    { hpt: 30 },
    { hpt: 22 },
    { hpt: 22 },
    { hpt: 20 },
    { hpt: 24 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Itinerary");
  XLSX.writeFile(workbook, `itinerary-${new Date().toISOString().split("T")[0]}.xlsx`);
}

export function printActivities(activities: ActivityWithRelations[]) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const employee = activities[0]?.employee;
  const rows = activities
    .map(
      (a) => `
    <tr>
      <td>${formatActivityDate(a.createdAt)}</td>
      <td>${formatActivityTime(a.createdAt)}</td>
      <td>${a.activity}</td>
      <td>${a.status.name}</td>
      <td>${a.remarks || "-"}</td>
    </tr>`
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Daily Work Itinerary</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          h1 { font-size: 20px; margin-bottom: 8px; }
          .meta { margin-bottom: 20px; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background: #000; color: #fff; }
          tr:nth-child(even) { background: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>Daily Work Itinerary</h1>
        ${employee ? `<div class="meta"><div><strong>NAME:</strong> ${employee.name}</div><div><strong>POSITION:</strong> ${employee.position}</div></div>` : ""}
        <table>
          <thead>
            <tr><th>Date</th><th>Time</th><th>Activity</th><th>Status</th><th>Remarks</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}
