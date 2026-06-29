import { prisma } from "@/lib/prisma";

export const defaultSavings = {
  POKOK: 500_000,
  WAJIB: 300_000,
  SUKARELA: 200_000,
} as const;

export async function ensureDefaultSavingsForMember(anggotaId: string) {
  await ensureDefaultSavingsForActiveMembers();
}

export async function ensureDefaultSavingsForActiveMembers() {
  await normalizeDefaultSavingsTransactionIds();

  await prisma.$executeRaw`
    WITH active_members AS (
      SELECT id, created_at
      FROM anggota
      WHERE status = 'AKTIF'::"AccountStatus"
    ),
    default_types AS (
      SELECT
        1 AS type_order,
        'POKOK'::"JenisSimpanan" AS jenis_simpanan,
        ${defaultSavings.POKOK}::numeric AS nominal
      UNION ALL
      SELECT
        2,
        'WAJIB'::"JenisSimpanan",
        ${defaultSavings.WAJIB}::numeric
      UNION ALL
      SELECT
        3,
        'SUKARELA'::"JenisSimpanan",
        ${defaultSavings.SUKARELA}::numeric
    ),
    missing_default_rows AS (
      SELECT
        a.id AS anggota_id,
        d.jenis_simpanan,
        d.nominal,
        a.created_at,
        d.type_order
      FROM active_members a
      CROSS JOIN default_types d
      WHERE NOT EXISTS (
        SELECT 1
        FROM simpanan s
        WHERE s.anggota_id = a.id
          AND s.jenis_simpanan = d.jenis_simpanan
      )
    ),
    current_sequence AS (
      SELECT COALESCE(MAX(RIGHT(id, 4)::int), 0) AS last_number
      FROM simpanan
      WHERE id ~ ('^TRX' || TO_CHAR(CURRENT_DATE, 'YY') || '[0-9]{4}$')
    ),
    numbered_rows AS (
      SELECT
        'TRX' || TO_CHAR(CURRENT_DATE, 'YY') ||
          LPAD(
            (
              current_sequence.last_number +
              ROW_NUMBER() OVER (
                ORDER BY missing_default_rows.created_at ASC,
                  missing_default_rows.anggota_id ASC,
                  missing_default_rows.type_order ASC
              )
            )::text,
            4,
            '0'
          ) AS id,
        missing_default_rows.anggota_id,
        missing_default_rows.jenis_simpanan,
        missing_default_rows.nominal
      FROM missing_default_rows
      CROSS JOIN current_sequence
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
    FROM numbered_rows
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
