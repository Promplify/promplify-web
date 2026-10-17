// Starts a disposable real GoTrue/PostgREST stack, runs synthetic HTTP checks,
// and removes its containers/network. No production connections or credentials.
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { setTimeout } from "node:timers/promises";

const dbImage = "postgres:17-alpine";
const authImage = "public.ecr.aws/supabase/gotrue:v2.186.0";
const restImage = "postgrest/postgrest:v13.0.7";
const prefix = `promplify-privacy-e2e-${process.pid}`;
const database = `${prefix}-db`;
const auth = `${prefix}-auth`;
const rest = `${prefix}-rest`;
const network = `${prefix}-network`;
const secret = randomBytes(32).toString("hex");
function docker(args, input) {
  const result = spawnSync("docker", args, { input, encoding: "utf8" });
  if (result.status !== 0)
    throw new Error((result.stderr || result.error?.message || "Docker operation failed").replaceAll(secret, "[local test signing secret]"));
  return result.stdout;
}
function sql(text) {
  docker(["exec", "-i", database, "psql", "-U", "postgres", "-v", "ON_ERROR_STOP=1"], text);
}
async function waitFor(check, description) {
  for (let i = 0; i < 150; i++) {
    if (await check()) return;
    await setTimeout(200);
  }
  throw new Error(`Local ${description} did not become ready`);
}
async function healthy(url) {
  try {
    return (await fetch(url)).ok;
  } catch {
    return false;
  }
}
for (const image of [dbImage, authImage, restImage]) docker(["image", "inspect", image]);
try {
  docker(["network", "create", "--internal", network]);
  docker(["run", "--detach", "--name", database, "--network", network, "--network-alias", "database", "--env", "POSTGRES_HOST_AUTH_METHOD=trust", dbImage]);
  await waitFor(
    () => spawnSync("docker", ["exec", database, "pg_isready", "-h", "127.0.0.1", "-U", "postgres"], { stdio: "ignore" }).status === 0,
    "PostgreSQL"
  );
  // GoTrue creates real auth tables. The helper matches production auth.uid().
  sql(`CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE ROLE authenticator LOGIN NOINHERIT;
GRANT anon, authenticated, service_role TO authenticator;
CREATE SCHEMA auth;
CREATE SCHEMA extensions;
ALTER ROLE postgres SET search_path=auth,public;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''), nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'sub')::uuid $$;
GRANT USAGE ON SCHEMA auth,public TO anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon,authenticated,service_role;`);
  const authEnvironment = {
    GOTRUE_API_HOST: "0.0.0.0",
    GOTRUE_API_PORT: "9999",
    API_EXTERNAL_URL: "http://127.0.0.1:59999",
    GOTRUE_DB_DRIVER: "postgres",
    GOTRUE_DB_DATABASE_URL: "postgres://postgres@database:5432/postgres?sslmode=disable",
    GOTRUE_DB_NAMESPACE: "auth",
    GOTRUE_SITE_URL: "http://127.0.0.1:8088",
    GOTRUE_JWT_SECRET: secret,
    GOTRUE_JWT_EXP: "3600",
    GOTRUE_JWT_AUD: "authenticated",
    GOTRUE_JWT_DEFAULT_GROUP_NAME: "authenticated",
    GOTRUE_JWT_ADMIN_ROLES: "service_role",
    GOTRUE_DISABLE_SIGNUP: "false",
    GOTRUE_EXTERNAL_EMAIL_ENABLED: "true",
    GOTRUE_MAILER_AUTOCONFIRM: "true",
  };
  docker([
    "create",
    "--name",
    auth,
    "--network",
    "bridge",
    "--publish",
    "127.0.0.1:59999:9999",
    ...Object.entries(authEnvironment).flatMap(([key, value]) => ["--env", `${key}=${value}`]),
    authImage,
  ]);
  docker(["network", "connect", network, auth]);
  docker(["start", auth]);
  await waitFor(() => healthy("http://127.0.0.1:59999/health"), "GoTrue");
  const migrations = new URL("../supabase/migrations/", import.meta.url);
  sql(
    "SET search_path=public,extensions;\n" +
      readdirSync(migrations)
        .filter((file) => file.endsWith(".sql"))
        .sort()
        .map((file) => readFileSync(new URL(file, migrations), "utf8"))
        .join("\n")
  );
  const restEnvironment = {
    PGRST_DB_URI: "postgres://authenticator@database:5432/postgres",
    PGRST_DB_SCHEMAS: "public",
    PGRST_DB_ANON_ROLE: "anon",
    PGRST_JWT_SECRET: secret,
    PGRST_SERVER_HOST: "0.0.0.0",
    PGRST_SERVER_PORT: "3000",
  };
  docker([
    "create",
    "--name",
    rest,
    "--network",
    "bridge",
    "--publish",
    "127.0.0.1:53000:3000",
    ...Object.entries(restEnvironment).flatMap(([key, value]) => ["--env", `${key}=${value}`]),
    restImage,
  ]);
  docker(["network", "connect", network, rest]);
  docker(["start", rest]);
  await waitFor(() => healthy("http://127.0.0.1:53000/public_authors?select=id"), "PostgREST");
  console.log("PASS: PostgreSQL 17 + real GoTrue + PostgREST started; all application migrations executed");
  await import("./test-profile-http.mjs");
} finally {
  for (const name of [rest, auth, database]) spawnSync("docker", ["rm", "--force", name], { stdio: "ignore" });
  spawnSync("docker", ["network", "rm", network], { stdio: "ignore" });
}
