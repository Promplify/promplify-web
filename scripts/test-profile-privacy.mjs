// Disposable PostgreSQL tests: no credentials, network, production data, or ports.
// Requires an already-present postgres:17-alpine image and a working local Docker daemon.
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { setTimeout } from "node:timers/promises";

const name = `promplify-profile-privacy-${process.pid}`;
const image = "postgres:17-alpine";
function docker(args, input) {
  const result = spawnSync("docker", args, { input, encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || result.error?.message || "Docker command failed");
  return result.stdout;
}
function sql(input) {
  return docker(["exec", "-i", name, "psql", "-U", "postgres", "-v", "ON_ERROR_STOP=1"], input);
}

docker(["image", "inspect", image]);
try {
  docker(["run", "--detach", "--name", name, "--network", "none", "--env", "POSTGRES_HOST_AUTH_METHOD=trust", image]);
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    const status = spawnSync("docker", ["exec", name, "pg_isready", "-h", "127.0.0.1", "-U", "postgres"], { stdio: "ignore" });
    if (status.status === 0) {
      ready = true;
      break;
    }
    await setTimeout(200);
  }
  if (!ready) throw new Error("Isolated PostgreSQL did not become ready");
  // Minimal local Supabase Auth stand-in; this does not test GoTrue/PostgREST.
  sql(`CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE SCHEMA auth;
CREATE SCHEMA extensions;
CREATE TABLE auth.users(id uuid PRIMARY KEY, raw_user_meta_data jsonb DEFAULT '{}'::jsonb, created_at timestamptz DEFAULT now());
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
GRANT USAGE ON SCHEMA auth, public TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated, service_role;`);
  const directory = new URL("../supabase/migrations/", import.meta.url);
  const files = readdirSync(directory)
    .filter((file) => file.endsWith(".sql"))
    .sort();
  const privacyMigration = files.find((file) => file.endsWith("_restrict_profile_visibility.sql"));
  if (!privacyMigration) throw new Error("Profile privacy migration not found");
  for (const file of files.filter((file) => file < privacyMigration)) sql(readFileSync(new URL(file, directory), "utf8"));
  sql(`BEGIN;
INSERT INTO auth.users(id) VALUES ('00000000-0000-0000-0000-000000000099');
UPDATE public.profiles SET company='synthetic private company';
SET LOCAL ROLE anon;
DO $$ BEGIN ASSERT (SELECT company='synthetic private company' FROM public.profiles WHERE id='00000000-0000-0000-0000-000000000099'); END $$;
ROLLBACK;
GRANT ALL ON public.profiles TO anon, authenticated;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);`);
  console.log("PASS: baseline anonymous private-field read reproduced with synthetic data");
  sql(readFileSync(new URL(privacyMigration, directory), "utf8"));
  for (const file of files.filter((file) => file > privacyMigration)) sql(readFileSync(new URL(file, directory), "utf8"));
  sql(readFileSync(new URL("../supabase/tests/profile_privacy.sql", import.meta.url), "utf8"));
  sql(readFileSync(new URL("../supabase/tests/security_contracts.sql", import.meta.url), "utf8"));
  console.log("PASS: migration, legacy-policy removal, access matrix, author lifecycle, share/template RPC controls");
} finally {
  docker(["rm", "--force", name]);
}
