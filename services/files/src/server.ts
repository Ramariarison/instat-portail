import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import multipart from "@fastify/multipart";
import { idParams } from "../../shared/crud.ts";
import { createApp, HttpError, notFound, requirePermission, requireUser, start } from "../../shared/http.ts";
import { newId } from "../../shared/ids.ts";

/**
 * Service Fichiers : images (pictos, image de titre) et documents des publications.
 *   POST   /files       envoi multipart d'UN fichier (champ « file »), utilisateur connecté → { id, name, size, type, url }
 *   GET    /files/:id   téléchargement (public : les documents publiés sont publics) ; /files/:id/meta : métadonnées
 *   DELETE /files/:id   droit « publications / delete »
 * Stockage : un volume disque (FILES_DIR), avec pour chaque fichier un .json de métadonnées.
 * La réponse de POST contient les champs de PublicationDoc (id, name, size).
 */

const FILES_DIR = process.env.FILES_DIR ?? "/data/files";
const MAX_BYTES = Number(process.env.FILES_MAX_BYTES ?? 50 * 1024 * 1024);
const PUBLIC_PREFIX = process.env.FILES_PUBLIC_PREFIX ?? "/api/files";

/** Types acceptés. Pas de SVG ni de HTML : servis depuis le domaine du site, ils pourraient exécuter du script. */
const allowedTypes: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "application/pdf": ".pdf",
  "application/zip": ".zip",
  "text/csv": ".csv",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
};

/** Affichés dans le navigateur ; les autres types sont proposés au téléchargement. */
const inlineTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf"]);

interface StoredFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
}

// Les identifiants sont générés ici (« file-<hex> ») : on refuse tout le reste, ce qui interdit « ../ ».
const ID_PATTERN = /^file-[a-f0-9]{16}$/;
const blobPath = (id: string) => path.join(FILES_DIR, id);
const metaPath = (id: string) => path.join(FILES_DIR, `${id}.json`);

async function readMeta(id: string): Promise<StoredFile> {
  if (!ID_PATTERN.test(id)) throw notFound("Fichier");
  try {
    return JSON.parse(await readFile(metaPath(id), "utf8")) as StoredFile;
  } catch {
    throw notFound("Fichier");
  }
}

const present = (file: StoredFile) => ({
  id: file.id,
  name: file.name,
  size: file.size,
  type: file.type,
  url: `${PUBLIC_PREFIX}/${file.id}`,
});

await mkdir(FILES_DIR, { recursive: true });

const app = createApp("files");
await app.register(multipart, { limits: { fileSize: MAX_BYTES, files: 1, fields: 0 } });

app.post("/files", { preHandler: requireUser }, async (request, reply) => {
  const upload = await request.file();
  if (!upload) throw new HttpError(400, "NO_FILE", "Aucun fichier reçu (champ « file »).");
  if (!(upload.mimetype in allowedTypes)) {
    upload.file.resume();
    throw new HttpError(415, "UNSUPPORTED_TYPE", "Type de fichier non accepté (images, PDF, documents bureautiques, CSV ou ZIP).");
  }

  const id = newId("file");
  try {
    await pipeline(upload.file, createWriteStream(blobPath(id), { flags: "wx" }));
    if (upload.file.truncated) {
      throw new HttpError(413, "FILE_TOO_LARGE", `Fichier trop volumineux (maximum ${Math.round(MAX_BYTES / 1024 / 1024)} Mo).`);
    }
    const stored: StoredFile = {
      id,
      name: path.basename(upload.filename).slice(0, 255) || `fichier${allowedTypes[upload.mimetype]}`,
      size: (await stat(blobPath(id))).size,
      type: upload.mimetype,
      uploadedBy: request.user!.sub,
      uploadedAt: new Date().toISOString(),
    };
    await writeFile(metaPath(id), JSON.stringify(stored), { flag: "wx" });
    return reply.code(201).send(present(stored));
  } catch (error) {
    await rm(blobPath(id), { force: true });
    throw error;
  }
});

app.get<{ Params: { id: string } }>("/files/:id/meta", { schema: { params: idParams } }, async (request) =>
  present(await readMeta(request.params.id)),
);

app.get<{ Params: { id: string } }>("/files/:id", { schema: { params: idParams } }, async (request, reply) => {
  const file = await readMeta(request.params.id);
  const disposition = inlineTypes.has(file.type) ? "inline" : "attachment";
  return reply
    .header("Content-Type", file.type)
    .header("Content-Length", file.size)
    .header("Content-Disposition", `${disposition}; filename*=UTF-8''${encodeURIComponent(file.name)}`)
    .header("X-Content-Type-Options", "nosniff")
    .header("Cache-Control", "public, max-age=31536000, immutable")
    .send(createReadStream(blobPath(file.id)));
});

app.delete<{ Params: { id: string } }>(
  "/files/:id",
  { preHandler: requirePermission("publications", "delete"), schema: { params: idParams } },
  async (request, reply) => {
    const file = await readMeta(request.params.id);
    await rm(blobPath(file.id), { force: true });
    await rm(metaPath(file.id), { force: true });
    return reply.code(204).send();
  },
);

await start(app);
