import { prisma } from "@/lib/prisma";

export async function connectToDatabase() {
  try {
    await prisma.$connect();
    return true;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return false;
  }
}

export { prisma as mongodb };
