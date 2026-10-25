import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const requiredReferences = [
  'approved-homepage.html',
  'goal-visualization.html',
  'brain-visualization.html',
];

/** Checks source availability only, not visual fidelity, safety, or approval. */
export async function inspectReferences(root) {
  return Promise.all(
    requiredReferences.map(async (name) => {
      const candidates = [];
      for (const folder of ['design/stitch', 'reference']) {
        const path = `${folder}/${name}`;
        try {
          const source = await readFile(resolve(root, path), 'utf8');
          candidates.push({
            path,
            status: source.trim() ? 'AVAILABLE' : 'EMPTY',
            bytes: Buffer.byteLength(source),
          });
        } catch (error) {
          if (error.code !== 'ENOENT') throw error;
          candidates.push({ path, status: 'MISSING', bytes: 0 });
        }
      }
      return {
        name,
        available: candidates.some((candidate) => candidate.status === 'AVAILABLE'),
        candidates,
      };
    }),
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const references = await inspectReferences(root);
  for (const reference of references) {
    for (const candidate of reference.candidates) {
      console.log(`${candidate.status}: ${candidate.path} (${candidate.bytes} bytes)`);
    }
  }
  const blocked = references.some((reference) => !reference.available);
  console.log(blocked
    ? 'BLOCKED: Complete the missing or empty approved Stitch exports.'
    : 'Source files are available. Manually inspect their complete design, scripts, and asset provenance.');
  process.exitCode = blocked ? 1 : 0;
}
