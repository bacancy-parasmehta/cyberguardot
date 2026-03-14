import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

const SEED_FACILITY_ID = "00000000-0000-4000-8000-000000000001";
const ADMIN_EMAIL = "admin@cyberguard.test";
const ADMIN_PASSWORD = "CyberGuard2024!";
const ADMIN_NAME = "CyberGuard Admin";

function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) {
    return;
  }

  const rawContent = readFileSync(filePath, "utf8");

  rawContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['\"]|['\"]$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required to create the test user.`);
  }

  return value;
}

async function findUserByEmail(
  supabase: SupabaseClient,
  email: string,
): Promise<User | null> {
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw error;
    }

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );

    if (match) {
      return match;
    }

    if (data.users.length < 200) {
      return null;
    }

    page += 1;
  }
}

async function main() {
  loadEnvFile(path.resolve(process.cwd(), ".env.local"));

  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  let user = await findUserByEmail(supabase, ADMIN_EMAIL);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: ADMIN_NAME,
        role: "admin",
      },
    });

    if (error) {
      throw error;
    }

    user = data.user;
  } else {
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: ADMIN_NAME,
        role: "admin",
      },
    });

    if (error) {
      throw error;
    }

    user = data.user;
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: ADMIN_EMAIL,
      full_name: ADMIN_NAME,
      role: "admin",
      facility_id: SEED_FACILITY_ID,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    throw profileError;
  }

  console.log(`Test user ready: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  console.log(`Facility: ${SEED_FACILITY_ID}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
