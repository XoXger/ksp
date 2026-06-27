import { prisma } from "@/lib/prisma";

export const defaultSavings = {
  POKOK: 500_000,
  WAJIB: 300_000,
  SUKARELA: 200_000,
} as const;

export async function ensureDefaultSavingsForMember(anggotaId: string) {
  await ensureDefaultSavingsForActiveMembers();
  await prisma.$executeRaw`
    WITH active_members AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS member_order
      FROM anggota
      WHERE status = 'AKTIF'::"AccountStatus"
    ),
    target_member AS (
      SELECT id, member_order
      FROM active_members
      WHERE id = ${anggotaId}
    ),
    default_rows AS (
      SELECT
        'TRX' || TO_CHAR(CURRENT_DATE, 'YY') || LPAD(((member_order - 1) * 3 + 1)::text, 4, '0') AS id,
        id AS anggota_id,
        'POKOK'::"JenisSimpanan" AS jenis_simpanan,
        ${defaultSavings.POKOK}::numeric AS nominal
      FROM target_member
      UNION ALL
      SELECT
        'TRX' || TO_CHAR(CURRENT_DATE, 'YY') || LPAD(((member_order - 1) * 3 + 2)::text, 4, '0') AS id,
        id AS anggota_id,
        'WAJIB'::"JenisSimpanan" AS jenis_simpanan,
        ${defaultSavings.WAJIB}::numeric AS nominal
      FROM target_member
      UNION ALL
      SELECT
        'TRX' || TO_CHAR(CURRENT_DATE, 'YY') || LPAD(((member_order - 1) * 3 + 3)::text, 4, '0') AS id,
        id AS anggota_id,
        'SUKARELA'::"JenisSimpanan" AS jenis_simpanan,
        ${defaultSavings.SUKARELA}::numeric AS nominal
      FROM target_member
    )
    INSERT INTO simpanan (
      id,
      anggota_id,
      jenis_simpanan,
      nominal,
      tanggal_transfer,
      created_at,
      updated_at
    )
    SELECT id, anggota_id, jenis_simpanan, nominal, CURRENT_DATE, NOW(), NOW()
    FROM default_rows
    WHERE NOT EXISTS (
      SELECT 1
      FROM simpanan s
      WHERE s.anggota_id = default_rows.anggota_id
        AND s.jenis_simpanan = default_rows.jenis_simpanan
        AND s.id LIKE 'TRX%'
    )
    ON CONFLICT (id) DO NOTHING
  `;
}

export async function ensureDefaultSavingsForActiveMembers() {
  await normalizeDefaultSavingsTransactionIds();

  await prisma.$executeRaw`
    WITH active_members AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS member_order
      FROM anggota
      WHERE status = 'AKTIF'::"AccountStatus"
    )
    INSERT INTO simpanan (
      id,
      anggota_id,
      jenis_simpanan,
      nominal,
      tanggal_transfer,
      created_at,
      updated_at
    )
    SELECT
      'TRX' || TO_CHAR(CURRENT_DATE, 'YY') || LPAD(((a.member_order - 1) * 3 + 1)::text, 4, '0'),
      a.id,
      'POKOK'::"JenisSimpanan",
      ${defaultSavings.POKOK},
      CURRENT_DATE,
      NOW(),
      NOW()
    FROM active_members a
    WHERE NOT EXISTS (
        SELECT 1
        FROM simpanan s
        WHERE s.anggota_id = a.id
          AND s.jenis_simpanan = 'POKOK'::"JenisSimpanan"
      )
    ON CONFLICT (id) DO NOTHING
  `;

  await prisma.$executeRaw`
    WITH active_members AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS member_order
      FROM anggota
      WHERE status = 'AKTIF'::"AccountStatus"
    )
    INSERT INTO simpanan (
      id,
      anggota_id,
      jenis_simpanan,
      nominal,
      tanggal_transfer,
      created_at,
      updated_at
    )
    SELECT
      'TRX' || TO_CHAR(CURRENT_DATE, 'YY') || LPAD(((a.member_order - 1) * 3 + 2)::text, 4, '0'),
      a.id,
      'WAJIB'::"JenisSimpanan",
      ${defaultSavings.WAJIB},
      CURRENT_DATE,
      NOW(),
      NOW()
    FROM active_members a
    WHERE NOT EXISTS (
        SELECT 1
        FROM simpanan s
        WHERE s.anggota_id = a.id
          AND s.jenis_simpanan = 'WAJIB'::"JenisSimpanan"
      )
    ON CONFLICT (id) DO NOTHING
  `;

  await prisma.$executeRaw`
    WITH active_members AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS member_order
      FROM anggota
      WHERE status = 'AKTIF'::"AccountStatus"
    )
    INSERT INTO simpanan (
      id,
      anggota_id,
      jenis_simpanan,
      nominal,
      tanggal_transfer,
      created_at,
      updated_at
    )
    SELECT
      'TRX' || TO_CHAR(CURRENT_DATE, 'YY') || LPAD(((a.member_order - 1) * 3 + 3)::text, 4, '0'),
      a.id,
      'SUKARELA'::"JenisSimpanan",
      ${defaultSavings.SUKARELA},
      CURRENT_DATE,
      NOW(),
      NOW()
    FROM active_members a
    WHERE NOT EXISTS (
        SELECT 1
        FROM simpanan s
        WHERE s.anggota_id = a.id
          AND s.jenis_simpanan = 'SUKARELA'::"JenisSimpanan"
      )
    ON CONFLICT (id) DO NOTHING
  `;
}

async function normalizeDefaultSavingsTransactionIds() {
  await prisma.$executeRaw`
    WITH active_members AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS member_order
      FROM anggota
      WHERE status = 'AKTIF'::"AccountStatus"
    ),
    target_rows AS (
      SELECT
        'DEFAULT-POKOK-' || id AS old_id,
        'TRX' || TO_CHAR(CURRENT_DATE, 'YY') || LPAD(((member_order - 1) * 3 + 1)::text, 4, '0') AS new_id
      FROM active_members
      UNION ALL
      SELECT
        'DEFAULT-WAJIB-' || id AS old_id,
        'TRX' || TO_CHAR(CURRENT_DATE, 'YY') || LPAD(((member_order - 1) * 3 + 2)::text, 4, '0') AS new_id
      FROM active_members
      UNION ALL
      SELECT
        'DEFAULT-SUKARELA-' || id AS old_id,
        'TRX' || TO_CHAR(CURRENT_DATE, 'YY') || LPAD(((member_order - 1) * 3 + 3)::text, 4, '0') AS new_id
      FROM active_members
    )
    UPDATE simpanan s
    SET id = target_rows.new_id
    FROM target_rows
    WHERE s.id = target_rows.old_id
      AND NOT EXISTS (
        SELECT 1 FROM simpanan existing WHERE existing.id = target_rows.new_id
      )
  `;
}
