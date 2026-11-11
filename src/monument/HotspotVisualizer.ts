import * as THREE from 'three';
import { HotspotData } from '../types.ts';
import { CHARMINAR_HOTSPOTS } from './Hotspots.ts';

export interface HotspotBeacon {
  data: HotspotData;
  group: THREE.Group;
  coreMesh: THREE.Mesh;
  ringMesh: THREE.Mesh;
  glowMesh: THREE.Mesh;
}

export class HotspotVisualizer {
  public beacons: HotspotBeacon[] = [];
  public group: THREE.Group;
  private activeId: string | null = null;
  private hoveredId: string | null = null;

  private coreMaterial: THREE.MeshStandardMaterial;
  private activeCoreMaterial: THREE.MeshStandardMaterial;
  private ringMaterial: THREE.MeshBasicMaterial;
  private glowMaterial: THREE.MeshBasicMaterial;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'HotspotsGroup';

    // Materials
    this.coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x2bb673,
      emissive: 0x1b7045,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.2,
    });

    this.activeCoreMaterial = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xff7700,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.3,
    });

    this.ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x55dd99,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });

    this.glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.25,
      depthWrite: false,
    });

    this.buildBeacons();
  }

  private buildBeacons(): void {
    const coreGeom = new THREE.OctahedronGeometry(0.015, 0);
    const ringGeom = new THREE.RingGeometry(0.022, 0.026, 32);
    const glowGeom = new THREE.SphereGeometry(0.028, 16, 12);

    CHARMINAR_HOTSPOTS.forEach((data) => {
      const beaconGroup = new THREE.Group();
      beaconGroup.position.set(...data.position);
      beaconGroup.name = `HotspotBeacon_${data.id}`;

      // Core diamond
      const core = new THREE.Mesh(coreGeom, this.coreMaterial.clone());
      core.name = data.id;
      // Mark for XR Blocks interaction
      (core as unknown as { xb: { pointerEvents: string } }).xb = { pointerEvents: 'auto' };
      core.userData = { isHotspot: true, hotspotId: data.id };
      beaconGroup.add(core);

      // Surrounding pulsing ring
      const ring = new THREE.Mesh(ringGeom, this.ringMaterial.clone());
      ring.rotation.x = Math.PI / 2;
      beaconGroup.add(ring);

      // Outer glow halo
      const glow = new THREE.Mesh(glowGeom, this.glowMaterial.clone());
      beaconGroup.add(glow);

      this.group.add(beaconGroup);

      this.beacons.push({
        data,
        group: beaconGroup,
        coreMesh: core,
        ringMesh: ring,
        glowMesh: glow,
      });
    });
  }

  public setActiveHotspot(id: string | null): void {
    this.activeId = id;
    this.beacons.forEach((beacon) => {
      const isActive = beacon.data.id === id;
      if (isActive) {
        beacon.coreMesh.material = this.activeCoreMaterial;
        (beacon.ringMesh.material as THREE.MeshBasicMaterial).color.setHex(0xffaa00);
        (beacon.glowMesh.material as THREE.MeshBasicMaterial).color.setHex(0xffaa00);
        beacon.group.scale.setScalar(1.3);
      } else {
        beacon.coreMesh.material = this.coreMaterial;
        (beacon.ringMesh.material as THREE.MeshBasicMaterial).color.setHex(0x55dd99);
        (beacon.glowMesh.material as THREE.MeshBasicMaterial).color.setHex(0x22c55e);
        beacon.group.scale.setScalar(1.0);
      }
    });
  }

  public setHoveredHotspot(id: string | null): void {
    this.hoveredId = id;
    this.beacons.forEach((beacon) => {
      if (beacon.data.id === id && beacon.data.id !== this.activeId) {
        beacon.group.scale.setScalar(1.2);
      } else if (beacon.data.id !== this.activeId) {
        beacon.group.scale.setScalar(1.0);
      }
    });
  }

  public setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  public update(time: number): void {
    this.beacons.forEach((beacon, i) => {
      // Gentle floating animation
      const offset = i * 1.05;
      beacon.coreMesh.rotation.y = time * 1.5 + offset;
      beacon.coreMesh.rotation.x = Math.sin(time * 2 + offset) * 0.2;

      // Concentric pulsing ring scale and opacity
      const pulse = (Math.sin(time * 3 + offset) + 1) * 0.5;
      const ringScale = 0.9 + pulse * 0.4;
      beacon.ringMesh.scale.setScalar(ringScale);
      (beacon.ringMesh.material as THREE.MeshBasicMaterial).opacity = 0.2 + (1 - pulse) * 0.6;

      beacon.glowMesh.scale.setScalar(0.95 + pulse * 0.15);
    });
  }

  public dispose(): void {
    this.coreMaterial.dispose();
    this.activeCoreMaterial.dispose();
    this.ringMaterial.dispose();
    this.glowMaterial.dispose();
  }
}
