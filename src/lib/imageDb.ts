import { openDB } from 'idb';
import { compressToBlob } from './imageUtils';

const DB_NAME = 'kuaizi-images';
const STORE = 'entity-files';
const DB_VERSION = 1;

function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore(STORE);
    },
  });
}

export async function saveImage(id: string, file: File | Blob): Promise<void> {
  const blob = await compressToBlob(file);
  const db = await getDb();
  await db.put(STORE, blob, id);
}

export async function loadAllImages(): Promise<Map<string, File>> {
  const db = await getDb();
  const keys = (await db.getAllKeys(STORE)) as string[];
  const map = new Map<string, File>();
  await Promise.all(
    keys.map(async (key) => {
      const blob = (await db.get(STORE, key)) as Blob | undefined;
      if (blob) map.set(key, new File([blob], key, { type: blob.type }));
    }),
  );
  return map;
}

export async function clearImages(): Promise<void> {
  const db = await getDb();
  await db.clear(STORE);
}
