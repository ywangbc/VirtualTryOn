import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { LookBlob } from "@/look/look-store";
import { tryOnResultUrl, type TryOnJob } from "./tryon";

export type TryOnStore = {
  get(lookId: string, garmentId: string): Promise<TryOnJob | undefined>;
  list(lookId: string): Promise<readonly TryOnJob[]>;
  markQueued(lookId: string, garmentId: string): Promise<TryOnJob>;
  markReady(lookId: string, garmentId: string, result: LookBlob): Promise<TryOnJob>;
  markFailed(lookId: string, garmentId: string, error: string): Promise<TryOnJob>;
  getResult(lookId: string, garmentId: string): Promise<LookBlob | undefined>;
};

type JobRecord = {
  status: TryOnJob["status"];
  error?: string;
  resultMimeType?: string;
};

function toJob(lookId: string, garmentId: string, record: JobRecord): TryOnJob {
  return {
    lookId,
    garmentId,
    status: record.status,
    error: record.error,
    resultUrl:
      record.status === "ready" ? tryOnResultUrl(lookId, garmentId) : undefined,
  };
}

function jobKey(lookId: string, garmentId: string): string {
  return `${lookId}\0${garmentId}`;
}

export function createMemoryTryOnStore(): TryOnStore {
  const records = new Map<string, JobRecord>();
  const results = new Map<string, LookBlob>();

  return {
    async get(lookId, garmentId) {
      const record = records.get(jobKey(lookId, garmentId));
      return record ? toJob(lookId, garmentId, record) : undefined;
    },
    async list(lookId) {
      const jobs: TryOnJob[] = [];
      for (const [key, record] of records) {
        const sep = key.indexOf("\0");
        if (key.slice(0, sep) !== lookId) {
          continue;
        }
        jobs.push(toJob(lookId, key.slice(sep + 1), record));
      }
      return jobs;
    },
    async markQueued(lookId, garmentId) {
      const record: JobRecord = { status: "queued" };
      records.set(jobKey(lookId, garmentId), record);
      return toJob(lookId, garmentId, record);
    },
    async markReady(lookId, garmentId, result) {
      const record: JobRecord = { status: "ready", resultMimeType: result.mimeType };
      records.set(jobKey(lookId, garmentId), record);
      results.set(jobKey(lookId, garmentId), result);
      return toJob(lookId, garmentId, record);
    },
    async markFailed(lookId, garmentId, error) {
      const record: JobRecord = { status: "failed", error };
      records.set(jobKey(lookId, garmentId), record);
      return toJob(lookId, garmentId, record);
    },
    async getResult(lookId, garmentId) {
      return results.get(jobKey(lookId, garmentId));
    },
  };
}

function jobDir(root: string, lookId: string, garmentId: string): string {
  return path.join(root, lookId, encodeURIComponent(garmentId));
}

export function createFsTryOnStore(root: string): TryOnStore {
  async function readRecord(
    lookId: string,
    garmentId: string,
  ): Promise<JobRecord | undefined> {
    try {
      const raw = await readFile(path.join(jobDir(root, lookId, garmentId), "meta.json"), "utf8");
      return JSON.parse(raw) as JobRecord;
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        return undefined;
      }
      throw error;
    }
  }

  async function writeRecord(
    lookId: string,
    garmentId: string,
    record: JobRecord,
  ): Promise<void> {
    const dir = jobDir(root, lookId, garmentId);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, "meta.json"), JSON.stringify(record));
  }

  return {
    async get(lookId, garmentId) {
      const record = await readRecord(lookId, garmentId);
      return record ? toJob(lookId, garmentId, record) : undefined;
    },
    async list(lookId) {
      let names: string[] = [];
      try {
        names = await readdir(path.join(root, lookId));
      } catch (error) {
        if (error instanceof Error && "code" in error && error.code === "ENOENT") {
          return [];
        }
        throw error;
      }
      const jobs: TryOnJob[] = [];
      for (const name of names) {
        const garmentId = decodeURIComponent(name);
        const record = await readRecord(lookId, garmentId);
        if (record) {
          jobs.push(toJob(lookId, garmentId, record));
        }
      }
      return jobs;
    },
    async markQueued(lookId, garmentId) {
      const record: JobRecord = { status: "queued" };
      await writeRecord(lookId, garmentId, record);
      return toJob(lookId, garmentId, record);
    },
    async markReady(lookId, garmentId, result) {
      const record: JobRecord = { status: "ready", resultMimeType: result.mimeType };
      await writeRecord(lookId, garmentId, record);
      await writeFile(path.join(jobDir(root, lookId, garmentId), "result"), result.bytes);
      return toJob(lookId, garmentId, record);
    },
    async markFailed(lookId, garmentId, error) {
      const record: JobRecord = { status: "failed", error };
      await writeRecord(lookId, garmentId, record);
      return toJob(lookId, garmentId, record);
    },
    async getResult(lookId, garmentId) {
      const record = await readRecord(lookId, garmentId);
      if (!record || record.status !== "ready" || !record.resultMimeType) {
        return undefined;
      }
      const bytes = await readFile(path.join(jobDir(root, lookId, garmentId), "result"));
      return { mimeType: record.resultMimeType, bytes: new Uint8Array(bytes) };
    },
  };
}
