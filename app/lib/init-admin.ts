import { db } from "@/drizzle/db";
import { users } from "@/drizzle/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function initializeAdminUser() {
  try {
    // Check if admin user already exists
    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.username, "admin"));

    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    // Create admin user
    const passwordHash = await bcrypt.hash("admin", 10);
    await db.insert(users).values({
      username: "admin",
      password_hash: passwordHash,
      is_admin: true,
    });

    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}
