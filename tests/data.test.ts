import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JsonStore } from '../src/data/store.js';
import { promises as fs } from 'fs';
import { join } from 'path';

const TEST_DIR = join(process.cwd(), 'test-data');

describe('JsonStore', () => {
  let store: JsonStore<{ value: string }>;

  beforeEach(async () => {
    try { await fs.rm(TEST_DIR, { recursive: true, force: true }); } catch {}
    store = new JsonStore<{ value: string }>('test.json');
  });

  afterEach(async () => {
    try { await fs.rm(TEST_DIR, { recursive: true, force: true }); } catch {}
  });

  it('sets and gets values', async () => {
    await store.set('key1', { value: 'hello' });
    const result = await store.get('key1');
    expect(result).toEqual({ value: 'hello' });
  });

  it('returns undefined for missing keys', async () => {
    const result = await store.get('missing');
    expect(result).toBeUndefined();
  });

  it('deletes values', async () => {
    await store.set('key1', { value: 'hello' });
    await store.delete('key1');
    const result = await store.get('key1');
    expect(result).toBeUndefined();
  });

  it('gets all values', async () => {
    await store.set('key1', { value: 'a' });
    await store.set('key2', { value: 'b' });
    const all = await store.getAll();
    expect(all).toEqual({ key1: { value: 'a' }, key2: { value: 'b' } });
  });

  it('clears all values', async () => {
    await store.set('key1', { value: 'a' });
    await store.clear();
    const all = await store.getAll();
    expect(all).toEqual({});
  });

  it('persists across instances', async () => {
    await store.set('key1', { value: 'persist' });
    const store2 = new JsonStore<{ value: string }>('test.json');
    const result = await store2.get('key1');
    expect(result).toEqual({ value: 'persist' });
  });
});