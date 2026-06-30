import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

type UploadDirectory = "pembayaran-pinjaman" | "pinjaman" | "simpanan";

type UploadPublicFileOptions = {
  directory: UploadDirectory;
  file: File;
};

export async function uploadPublicFile({
  directory,
  file,
}: UploadPublicFileOptions) {
  const extension = getFileExtension(file);
  const fileName = `${randomUUID()}.${extension}`;
  const pathname = `uploads/${directory}/${fileName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(pathname, buffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });

    return blob.url;
  }

  if (process.env.VERCEL === "1") {
    return `data:${file.type};base64,${buffer.toString("base64")}`;
  }

  const uploadDirectory = path.join(process.cwd(), "public", "uploads", directory);

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, fileName), buffer);

  return `/${pathname}`;
}

function getFileExtension(file: File) {
  if (file.type === "image/png") {
    return "png";
  }

  return "jpg";
}
