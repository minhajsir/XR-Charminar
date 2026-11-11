import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class ModelImporter {
  private fbxLoader: FBXLoader;
  private gltfLoader: GLTFLoader;

  constructor() {
    this.fbxLoader = new FBXLoader();
    this.gltfLoader = new GLTFLoader();
  }

  /**
   * Loads an FBX or GLTF/GLB model from a browser File object (e.g. from file input or drag-and-drop).
   */
  public async loadFromFile(file: File): Promise<THREE.Group> {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const arrayBuffer = await file.arrayBuffer();

    if (extension === 'fbx') {
      return this.loadFBXFromArrayBuffer(arrayBuffer);
    } else if (extension === 'glb' || extension === 'gltf') {
      return this.loadGLTFFromArrayBuffer(arrayBuffer);
    } else {
      throw new Error(`Unsupported model format .${extension}. Please provide an .fbx, .glb, or .gltf file.`);
    }
  }

  public async loadFBXFromArrayBuffer(buffer: ArrayBuffer): Promise<THREE.Group> {
    const group = this.fbxLoader.parse(buffer, '');
    this.optimizeAndNormalizeModel(group);
    return group;
  }

  public async loadGLTFFromArrayBuffer(buffer: ArrayBuffer): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.parse(
        buffer,
        '',
        (gltf) => {
          const group = gltf.scene || new THREE.Group();
          this.optimizeAndNormalizeModel(group);
          resolve(group);
        },
        reject
      );
    });
  }

  /**
   * Centers the model pivot, scales it to match tabletop size (~0.45m), and optimizes materials for XR rendering.
   */
  public optimizeAndNormalizeModel(model: THREE.Group, targetHeight: number = 0.48): void {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const scaleFactor = targetHeight / maxDim;
      model.scale.multiplyScalar(scaleFactor);

      // Re-center horizontally and align bottom to y = 0
      const updatedBox = new THREE.Box3().setFromObject(model);
      const updatedCenter = updatedBox.getCenter(new THREE.Vector3());
      model.position.x -= updatedCenter.x;
      model.position.z -= updatedCenter.z;
      model.position.y -= updatedBox.min.y;
    }

    // Traverse and optimize meshes & materials for high FPS
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.geometry) {
          mesh.geometry.computeVertexNormals();
        }

        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.roughness = 0.7;
              mat.metalness = 0.15;
            }
          });
        }
      }
    });
  }
}
