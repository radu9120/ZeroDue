/**
 * Script to clear all user data for fresh start with Supabase Auth
 * Run with: npx tsx scripts/clear-data.ts
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load .env file
config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function clearAllData() {
  console.log("🧹 Clearing all data for fresh start...\n");

  // Order matters due to foreign key constraints
  // Delete child tables first, then parent tables
  const tables = [
    "UserActivityLog",
    "UserActivity",
    "Invoices",
    "Clients",
    "Businesses",
  ];

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).delete().neq("id", 0); // Delete all rows

      if (error) {
        console.log(`⚠️  ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Cleared`);
      }
    } catch (e: any) {
      console.log(`⚠️  ${table}: ${e.message}`);
    }
  }

  console.log("\n✨ Done! Database is ready for new Supabase Auth users.");
  console.log("\nNext steps:");
  console.log("1. Start your dev server: npm run dev");
  console.log("2. Sign up with Google or email at /sign-up");
  console.log("3. New users will have Supabase UUIDs instead of Clerk IDs");
}

clearAllData();
