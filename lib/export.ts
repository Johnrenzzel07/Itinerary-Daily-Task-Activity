import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { formatActivityDate, formatActivityTime } from "@/lib/utils";
import type { ActivityWithRelations } from "@/types";

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

export function exportActivitiesToExcel(activities: ActivityWithRelations[]) {
  const rows = activities.map((a) => ({
    Date: formatActivityDate(a.createdAt),
    Time: formatActivityTime(a.createdAt),
    Activity: a.activity,
    Status: a.status.name,
    Remarks: a.remarks || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
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
