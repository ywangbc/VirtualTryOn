import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  isLookPhotoType,
  isLookVideoType,
  lookPhotoUrl,
  lookVideoUrl,
  type Look,
  type LookMedia,
} from "./look";

export type CreateLookInput = {
  photo: LookMedia;
  video?: LookMedia;
};

export type LookBlob = {
  mimeType: string;
  bytes: Uint8Array;
};

export type LookStore = {
  create(input: CreateLookInput): Promise<Look>;
  get(id: string): Promise<Look | undefined>;
  getPhoto(id: string): Promise<LookBlob | undefined>;
  getVideo(id: string): Promise<LookBlob | undefined>;
};

export type LookStoreOptions = {
  createId?: () => string;
};

type LookRecord = {
  photoMimeType: string;
  videoMimeType: string | null;
};

function toLook(id: string, record: LookRecord): Look {
  return {
    id,
    photoUrl: lookPhotoUrl(id),
    videoUrl: record.videoMimeType === null ? null : lookVideoUrl(id),
  };
}

function assertPhoto(photo: LookMedia): void {
  if (photo.bytes.byteLength === 0) {
    throw new Error("Photo is empty");
  }
  if (!isLookPhotoType(photo.mimeType)) {
    throw new Error(`Unsupported photo type: ${photo.mimeType}`);
  }
}

function assertVideo(video: LookMedia): void {
  if (video.bytes.byteLength === 0) {
    throw new Error("Video is empty");
  }
  if (!isLookVideoType(video.mimeType)) {
    throw new Error(`Unsupported video type: ${video.mimeType}`);
  }
}

function createIdDefault(): string {
  return crypto.randomUUID();
}

export function createMemoryLookStore(options: LookStoreOptions = {}): LookStore {
  const createId = options.createId ?? createIdDefault;
  const records = new Map<string, LookRecord>();
  const photos = new Map<string, LookBlob>();
  const videos = new Map<string, LookBlob>();

  return {
    async create(input) {
      assertPhoto(input.photo);
      if (input.video) {
        assertVideo(input.video);
      }
      const id = createId();
      records.set(id, {
        photoMimeType: input.photo.mimeType,
        videoMimeType: input.video?.mimeType ?? null,
      });
      photos.set(id, { mimeType: input.photo.mimeType, bytes: input.photo.bytes });
      if (input.video) {
        videos.set(id, { mimeType: input.video.mimeType, bytes: input.video.bytes });
      }
      return toLook(id, records.get(id)!);
    },
    async get(id) {
      const record = records.get(id);
      return record ? toLook(id, record) : undefined;
    },
    async getPhoto(id) {
      return photos.get(id);
    },
    async getVideo(id) {
      return videos.get(id);
    },
  };
}

export function createFsLookStore(root: string, options: LookStoreOptions = {}): LookStore {
  const createId = options.createId ?? createIdDefault;

  async function readRecord(id: string): Promise<LookRecord | undefined> {
    try {
      const raw = await readFile(path.join(root, id, "meta.json"), "utf8");
      return JSON.parse(raw) as LookRecord;
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        return undefined;
      }
      throw error;
    }
  }

  return {
    async create(input) {
      assertPhoto(input.photo);
      if (input.video) {
        assertVideo(input.video);
      }
      const id = createId();
      const dir = path.join(root, id);
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, "photo"), input.photo.bytes);
      if (input.video) {
        await writeFile(path.join(dir, "video"), input.video.bytes);
      }
      const record: LookRecord = {
        photoMimeType: input.photo.mimeType,
        videoMimeType: input.video?.mimeType ?? null,
      };
      await writeFile(path.join(dir, "meta.json"), JSON.stringify(record));
      return toLook(id, record);
    },
    async get(id) {
      const record = await readRecord(id);
      return record ? toLook(id, record) : undefined;
    },
    async getPhoto(id) {
      const record = await readRecord(id);
      if (!record) {
        return undefined;
      }
      const bytes = await readFile(path.join(root, id, "photo"));
      return { mimeType: record.photoMimeType, bytes: new Uint8Array(bytes) };
    },
    async getVideo(id) {
      const record = await readRecord(id);
      if (!record || record.videoMimeType === null) {
        return undefined;
      }
      const bytes = await readFile(path.join(root, id, "video"));
      return { mimeType: record.videoMimeType, bytes: new Uint8Array(bytes) };
    },
  };
}
