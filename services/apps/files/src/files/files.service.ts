import { createReadStream, createWriteStream, type ReadStream } from "node:fs";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import type { MultipartFile } from "@fastify/multipart";
import { Injectable, type OnModuleInit } from "@nestjs/common";
import { ApiException, newId } from "@app/common";
import { ALLOWED_TYPES } from "./allowed-types";
import { filesConfig } from "./files.config";
import type { FileInfo, StoredFile } from "./stored-file";

// Les identifiants sont générés ici (« file-<hex> ») : on refuse tout le reste, ce qui interdit « ../ ».
const ID_PATTERN = /^file-[a-f0-9]{16}$/;

/** Stockage sur disque (volume Docker) : le fichier sous son identifiant, ses métadonnées dans <id>.json. */
@Injectable()
export class FilesService implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await mkdir(filesConfig.directory, { recursive: true });
  }

  async store(upload: MultipartFile, uploadedBy: string): Promise<FileInfo> {
    if (!(upload.mimetype in ALLOWED_TYPES)) {
      upload.file.resume();
      throw new ApiException(415, "UNSUPPORTED_TYPE", "Type de fichier non accepté (images, PDF, documents bureautiques, CSV ou ZIP).");
    }

    const id = newId("file");
    try {
      await pipeline(upload.file, createWriteStream(this.blobPath(id), { flags: "wx" }));
      if (upload.file.truncated) {
        const megabytes = Math.round(filesConfig.maxBytes / 1024 / 1024);
        throw new ApiException(413, "FILE_TOO_LARGE", `Fichier trop volumineux (maximum ${megabytes} Mo).`);
      }
      const stored: StoredFile = {
        id,
        name: path.basename(upload.filename).slice(0, 255) || `fichier${ALLOWED_TYPES[upload.mimetype]}`,
        size: (await stat(this.blobPath(id))).size,
        type: upload.mimetype,
        uploadedBy,
        uploadedAt: new Date().toISOString(),
      };
      await writeFile(this.metaPath(id), JSON.stringify(stored), { flag: "wx" });
      return this.present(stored);
    } catch (error) {
      await rm(this.blobPath(id), { force: true });
      throw error;
    }
  }

  async info(id: string): Promise<FileInfo> {
    return this.present(await this.readMeta(id));
  }

  async open(id: string): Promise<{ file: StoredFile; stream: ReadStream }> {
    const file = await this.readMeta(id);
    return { file, stream: createReadStream(this.blobPath(file.id)) };
  }

  async remove(id: string): Promise<void> {
    const file = await this.readMeta(id);
    await rm(this.blobPath(file.id), { force: true });
    await rm(this.metaPath(file.id), { force: true });
  }

  private async readMeta(id: string): Promise<StoredFile> {
    if (!ID_PATTERN.test(id)) throw ApiException.notFound("Fichier");
    try {
      return JSON.parse(await readFile(this.metaPath(id), "utf8")) as StoredFile;
    } catch {
      throw ApiException.notFound("Fichier");
    }
  }

  private present(file: StoredFile): FileInfo {
    return { id: file.id, name: file.name, size: file.size, type: file.type, url: `${filesConfig.publicPrefix}/${file.id}` };
  }

  private blobPath(id: string): string {
    return path.join(filesConfig.directory, id);
  }

  private metaPath(id: string): string {
    return path.join(filesConfig.directory, `${id}.json`);
  }
}
