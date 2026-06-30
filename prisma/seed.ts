import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding...");

  // Skills
  const [facilitator, logistics, foh] = await Promise.all([
    prisma.skill.upsert({ where: { label: "Facilitator" }, update: {}, create: { label: "Facilitator" } }),
    prisma.skill.upsert({ where: { label: "Logistics/Setup" }, update: {}, create: { label: "Logistics/Setup" } }),
    prisma.skill.upsert({ where: { label: "Front of House" }, update: {}, create: { label: "Front of House" } }),
  ]);

  // Owner user + business
  const ownerPassword = await bcrypt.hash("password123", 10);
  const ownerUser = await prisma.user.upsert({
    where: { email: "owner@craftworkshop.com" },
    update: {},
    create: { email: "owner@craftworkshop.com", password: ownerPassword, role: "owner" },
  });

  const business = await prisma.business.upsert({
    where: { id: "seed-business-1" },
    update: {},
    create: { id: "seed-business-1", name: "Craft Workshop Co.", ownerUserId: ownerUser.id },
  });

  // Part-timer users
  const ptPassword = await bcrypt.hash("password123", 10);

  const ptUser1 = await prisma.user.upsert({
    where: { email: "sarah@example.com" },
    update: {},
    create: { email: "sarah@example.com", password: ptPassword, role: "part_timer" },
  });
  const ptUser2 = await prisma.user.upsert({
    where: { email: "james@example.com" },
    update: {},
    create: { email: "james@example.com", password: ptPassword, role: "part_timer" },
  });

  const pt1 = await prisma.partTimer.upsert({
    where: { userId: ptUser1.id },
    update: {},
    create: { userId: ptUser1.id, name: "Sarah Tan", email: "sarah@example.com", phone: "91234567" },
  });
  const pt2 = await prisma.partTimer.upsert({
    where: { userId: ptUser2.id },
    update: {},
    create: { userId: ptUser2.id, name: "James Lim", email: "james@example.com", phone: "98765432" },
  });

  // Skills for part-timers
  await prisma.partTimerSkill.upsert({
    where: { partTimerId_skillId: { partTimerId: pt1.id, skillId: facilitator.id } },
    update: {},
    create: { partTimerId: pt1.id, skillId: facilitator.id },
  });
  await prisma.partTimerSkill.upsert({
    where: { partTimerId_skillId: { partTimerId: pt2.id, skillId: logistics.id } },
    update: {},
    create: { partTimerId: pt2.id, skillId: logistics.id },
  });
  await prisma.partTimerSkill.upsert({
    where: { partTimerId_skillId: { partTimerId: pt2.id, skillId: foh.id } },
    update: {},
    create: { partTimerId: pt2.id, skillId: foh.id },
  });

  // Roster memberships (active)
  await prisma.rosterMembership.upsert({
    where: { businessId_partTimerId: { businessId: business.id, partTimerId: pt1.id } },
    update: {},
    create: { businessId: business.id, partTimerId: pt1.id, status: "active" },
  });
  await prisma.rosterMembership.upsert({
    where: { businessId_partTimerId: { businessId: business.id, partTimerId: pt2.id } },
    update: {},
    create: { businessId: business.id, partTimerId: pt2.id, status: "active" },
  });

  // Shifts
  const shift1 = await prisma.shift.create({
    data: {
      businessId: business.id,
      title: "Weekend Pottery Workshop",
      shiftDate: new Date("2026-07-05"),
      startTime: "10:00",
      endTime: "13:00",
      payType: "hourly",
      payRate: 25,
      status: "open",
      roles: { create: [{ skillId: facilitator.id, count: 2 }, { skillId: foh.id, count: 1 }] },
    },
  });

  const shift2 = await prisma.shift.create({
    data: {
      businessId: business.id,
      title: "Setup & Teardown — Macrame Night",
      shiftDate: new Date("2026-07-08"),
      startTime: "18:00",
      endTime: "21:00",
      payType: "flat_session",
      payRate: 60,
      status: "filled",
      roles: { create: [{ skillId: logistics.id, count: 1 }] },
    },
  });

  // Assignment for shift2
  await prisma.shiftAssignment.create({
    data: {
      shiftId: shift2.id,
      partTimerId: pt2.id,
      status: "assigned",
    },
  });

  console.log("Done! Seed accounts:");
  console.log("  Owner:      owner@craftworkshop.com / password123");
  console.log("  Part-timer: sarah@example.com / password123");
  console.log("  Part-timer: james@example.com / password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
