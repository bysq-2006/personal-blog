import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '../../.glbtools/node_modules/@gltf-transform/core/dist/index.js';
import { prune, dedup, weld } from '../../.glbtools/node_modules/@gltf-transform/functions/dist/index.js';
import { KHRONOS_EXTENSIONS } from '../../.glbtools/node_modules/@gltf-transform/extensions/dist/index.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const io = new NodeIO().registerExtensions(KHRONOS_EXTENSIONS);

const jobs = [
  ['assets/models/plants/houseplant.src.glb', 'assets/models/plants/houseplant.glb'],
  ['assets/models/plants/potted-plant.src.glb', 'assets/models/plants/potted-plant.glb'],
  ['assets/models/plants/succulent.src.glb', 'assets/models/plants/succulent.glb'],
  ['assets/models/props/laptop.src.glb', 'assets/models/props/laptop.glb'],
];

for (const [src, dst] of jobs) {
  const doc = await io.read(path.join(root, '..', src));
  for (const mat of doc.getRoot().listMaterials()) {
    mat.setBaseColorTexture(null);
    mat.setNormalTexture(null);
    mat.setMetallicRoughnessTexture(null);
    mat.setOcclusionTexture(null);
    mat.setEmissiveTexture(null);
    mat.setBaseColorFactor([0.953, 0.925, 0.882, 1]);
    mat.setMetallicFactor(0);
    mat.setRoughnessFactor(1);
  }
  for (const tex of doc.getRoot().listTextures()) tex.dispose();
  await doc.transform(weld(), dedup(), prune());
  await io.write(path.join(root, '..', dst), doc);
  console.log('wrote', dst);
}
