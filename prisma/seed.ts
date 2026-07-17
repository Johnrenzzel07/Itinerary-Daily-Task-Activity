import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getDefaultStatusColor } from "../lib/utils";

const prisma = new PrismaClient();

async function main() {
  const statuses = [
    "Pending",
    "Ongoing",
    "Completed",
    "Cancelled",
    "Need Revision",
    "Waiting Approval",
  ];

  for (const name of statuses) {
    await prisma.status.upsert({
      where: { name },
      update: { color: getDefaultStatusColor(name) },
      create: { name, color: getDefaultStatusColor(name) },
    });
  }

  const hashedPassword = await bcrypt.hash("admin123", 12);

  const employee = await prisma.employee.upsert({
    where: { email: "admin@company.com" },
    update: {
      name: "John Renzzel",
      position: "Administrative Officer",
      password: hashedPassword,
    },
    create: {
      name: "John Renzzel",
      position: "Administrative Officer",
      email: "admin@company.com",
      password: hashedPassword,
      avatar: "",
    },
  });

  const completedStatus = await prisma.status.findUnique({
    where: { name: "Completed" },
  });
  const pendingStatus = await prisma.status.findUnique({
    where: { name: "Pending" },
  });
  const ongoingStatus = await prisma.status.findUnique({
    where: { name: "Ongoing" },
  });

  const existingCount = await prisma.activity.count({
    where: { employeeId: employee.id },
  });

  if (existingCount === 0 && completedStatus && pendingStatus && ongoingStatus) {
    const now = new Date();
    const samples = [
      {
        activity:
          "Reviewed and processed incoming correspondence and routed items to appropriate departments.",
        statusId: completedStatus.id,
        remarks: "All items cleared before noon.",
        hoursAgo: 4,
      },
      {
        activity:
          "Prepared daily work itinerary report and updated the public monitoring dashboard.",
        statusId: ongoingStatus.id,
        remarks: "Final review in progress.",
        hoursAgo: 2,
      },
      {
        activity:
          "Coordinated with team leads regarding pending document approvals.",
        statusId: pendingStatus.id,
        remarks: "Awaiting response from finance.",
        hoursAgo: 1,
      },
    ];

    for (const sample of samples) {
      const createdAt = new Date(now.getTime() - sample.hoursAgo * 60 * 60 * 1000);
      await prisma.activity.create({
        data: {
          employeeId: employee.id,
          activity: sample.activity,
          statusId: sample.statusId,
          remarks: sample.remarks,
          createdAt,
        },
      });
    }
  }

  console.log("Seed completed successfully");
  console.log("Admin login: admin@company.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
