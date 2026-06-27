import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { Client } from "pg";
import { fileURLToPath } from "url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const outputDir = path.join(rootDir, "ui-snapshots", "images-current");
const chromePath = findChrome();
const baseUrl = process.env.SNAPSHOT_BASE_URL ?? "http://127.0.0.1:3000";

loadEnv();

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  const context = await loadSnapshotContext();
  const routes = buildRoutes(context);

  for (const route of routes) {
    const outputPath = path.join(outputDir, `${route.name}.png`);
    capture(route.url, outputPath);
    console.log(`${route.name}.png`);
  }

  writeReadme(routes);
}

function capture(url, outputPath) {
  execFileSync(
    chromePath,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-background-networking",
      "--window-size=1366,768",
      "--virtual-time-budget=2500",
      `--screenshot=${outputPath}`,
      url,
    ],
    { stdio: "ignore" },
  );
}

async function loadSnapshotContext() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const memberResult = await client.query(
      "SELECT id FROM anggota WHERE status = 'AKTIF' ORDER BY created_at, id LIMIT 1",
    );
    const savingResult = await client.query(
      "SELECT id FROM simpanan ORDER BY created_at DESC, id DESC LIMIT 1",
    );
    const loanResult = await client.query(
      "SELECT id FROM pinjaman ORDER BY created_at DESC, id DESC LIMIT 1",
    );
    const paymentResult = await client
      .query(
        "SELECT id FROM pembayaran_pinjaman ORDER BY created_at DESC, id DESC LIMIT 1",
      )
      .catch(() => ({ rows: [] }));

    return {
      memberId: memberResult.rows[0]?.id ?? "ANG260001",
      paymentId: paymentResult.rows[0]?.id ?? "BYR260001",
      savingId: savingResult.rows[0]?.id ?? "TRX260001",
      loanId: loanResult.rows[0]?.id ?? "PJ000001",
    };
  } finally {
    await client.end();
  }
}

function buildRoutes({ memberId, paymentId, savingId, loanId }) {
  const memberQuery = `anggotaId=${encodeURIComponent(memberId)}`;

  return [
    route("login", "/login"),
    route("register", "/register"),
    route("member-dashboard", `/anggota?${memberQuery}`),
    route("member-transaction-history", `/anggota/riwayat?${memberQuery}`),
    route("member-profile", `/anggota/profil?${memberQuery}`),
    route("member-savings", `/simpanan?${memberQuery}`),
    route("member-add-savings", `/simpanan/tambah?${memberQuery}`),
    route("member-loan", `/pinjaman?${memberQuery}`),
    route("member-new-loan", `/pinjaman/baru?${memberQuery}`),
    route("member-loan-payment", `/pinjaman/bayar-tagihan?${memberQuery}`),
    route("member-shu", `/shu?${memberQuery}`),
    route("member-shu-simulation", `/shu/simulasi?${memberQuery}`),
    route("member-loan-simulation", `/simulasi-pinjaman?${memberQuery}`),
    route("admin-dashboard", "/dashboard"),
    route("admin-accounts", "/dashboard/akun"),
    route("admin-member-detail", `/dashboard/akun/anggota/${memberId}`),
    route("admin-savings", "/dashboard/simpanan"),
    route("admin-savings-detail", `/dashboard/simpanan/${savingId}`),
    route("admin-loans", "/dashboard/pinjaman"),
    route("admin-loan-detail", `/dashboard/pinjaman/${loanId}`),
    route("admin-loan-payments", "/dashboard/pinjaman/pembayaran"),
    route(
      "admin-loan-payment-detail",
      `/dashboard/pinjaman/pembayaran/${paymentId}`,
    ),
    route("admin-reports", "/dashboard/laporan"),
    route("admin-shu", "/dashboard/shu"),
  ];
}

function route(name, pathname) {
  return {
    name,
    pathname,
    url: new URL(pathname, baseUrl).toString(),
  };
}

function writeReadme(routes) {
  const lines = [
    "# Current UI Snapshots",
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    ...routes.map(
      (routeItem) => `- \`${routeItem.pathname}\` -> \`${routeItem.name}.png\``,
    ),
    "",
  ];

  fs.writeFileSync(path.join(outputDir, "README.md"), lines.join("\n"));
}

function loadEnv() {
  const envPath = path.join(rootDir, ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);

    if (match) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

function findChrome() {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ];

  const found = candidates.find((candidate) => fs.existsSync(candidate));

  if (!found) {
    throw new Error("Chrome or Edge executable not found.");
  }

  return found;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
