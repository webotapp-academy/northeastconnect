import "dotenv/config";
import { db } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth";

async function main() {
  console.log("Setting up Master Admin account...");

  const username = "admin";
  const email = "admin@northeastconnect.in";
  const password = "Admin@123456";
  const passwordHash = await hashPassword(password);

  const existing = await db.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existing) {
    const updated = await db.user.update({
      where: { id: existing.id },
      data: {
        username,
        email,
        passwordHash,
        role: "ADMIN",
        fullName: "Master Admin",
        xpPoints: 10000,
        rankTier: "Brahmaputra Legend",
      },
    });
    console.log("✅ Master Admin account updated successfully:", updated.email);
  } else {
    const created = await db.user.create({
      data: {
        username,
        email,
        passwordHash,
        fullName: "Master Admin",
        role: "ADMIN",
        xpPoints: 10000,
        rankTier: "Brahmaputra Legend",
        status: "Active",
      },
    });
    console.log("✅ Master Admin account created successfully:", created.email);
  }

  // Also seed into AdminUser table if needed
  try {
    const existingAdmin = await db.adminUser.findUnique({ where: { email } });
    if (existingAdmin) {
      await db.adminUser.update({
        where: { email },
        data: { passwordHash, role: "admin", status: "active" },
      });
    } else {
      await db.adminUser.create({
        data: {
          name: "Master Admin",
          email,
          passwordHash,
          role: "admin",
          status: "active",
        },
      });
    }
    console.log("✅ AdminUser table synced.");
  } catch (e: any) {
    console.log("AdminUser table note:", e?.message);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
