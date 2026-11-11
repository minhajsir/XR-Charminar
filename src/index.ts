import * as THREE from 'three';
import * as xb from 'xrblocks';

import { CharminarBuilder } from './monument/CharminarBuilder.ts';
import { HotspotVisualizer } from './monument/HotspotVisualizer.ts';
import { CHARMINAR_HOTSPOTS } from './monument/Hotspots.ts';
import { VoiceTourManager } from './audio/VoiceTourManager.ts';
import { CharminarSpatialUI } from './spatial/CharminarSpatialUI.ts';
import { ModelImporter } from './loader/ModelImporter.ts';
import { DisplayMode, LightingMode } from './types.ts';

export class CharminarExperience extends xb.Script {
  private monumentGroup: THREE.Group = new THREE.Group();
  private monumentBuilder: CharminarBuilder;
  private currentMonumentMesh: THREE.Group | null = null;
  private hotspotVisualizer: HotspotVisualizer;
  private voiceTour: VoiceTourManager;
  private spatialUI: CharminarSpatialUI | null = null;
  private modelImporter: ModelImporter;

  // Lighting
  private hemiLight!: THREE.HemisphereLight;
  private sunLight!: THREE.DirectionalLight;
  private nightSpotLights: THREE.SpotLight[] = [];

  // State
  private currentScale = 1.0;
  private lightingMode: LightingMode = 'goldenHour';
  private wireframeEnabled = false;
  private displayMode: DisplayMode = 'tabletop';
  private hotspotsVisible = true;

  // File input
  private fileInput: HTMLInputElement | null = null;

  constructor() {
    super();
    this.monumentBuilder = new CharminarBuilder();
    this.hotspotVisualizer = new HotspotVisualizer();
    this.voiceTour = new VoiceTourManager();
    this.modelImporter = new ModelImporter();
  }

  init(): void {
    this.setupLighting();
    this.setupMonument();
    this.setupSpatialUI();
    this.setupFileInput();
    this.setupDOMOverlaySync();

    // Default placement in front of user
    const userHeight = xb.user?.height || 1.6;
    this.monumentGroup.position.set(0, userHeight - 0.28, -0.95);
    this.add(this.monumentGroup);
  }

  private setupLighting(): void {
    // Hemisphere ambient light
    this.hemiLight = new THREE.HemisphereLight(0xfffaed, 0x555566, 2.8);
    this.add(this.hemiLight);

    // Warm sun light for Golden Hour
    this.sunLight = new THREE.DirectionalLight(0xfff1dc, 2.5);
    this.sunLight.position.set(1.5, 3.5, 1.2);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.add(this.sunLight);

    // Hyderabad Night Festival Architectural Spotlights (upward wash)
    const spotPositions = [
      [0.35, 0.02, 0.35],
      [-0.35, 0.02, 0.35],
      [-0.35, 0.02, -0.35],
      [0.35, 0.02, -0.35],
    ];

    spotPositions.forEach(([x, y, z]) => {
      const spot = new THREE.SpotLight(0xffa834, 0, 1.8, Math.PI / 4, 0.4, 1.2);
      spot.position.set(x, y, z);
      spot.target = this.monumentGroup;
      this.monumentGroup.add(spot);
      this.nightSpotLights.push(spot);
    });
  }

  private setupMonument(): void {
    this.monumentGroup.name = 'CharminarMonumentRoot';
    // Enable XR Blocks spatial manipulation (pinch/drag to translate & rotate)
    (this.monumentGroup as unknown as { xb: { manipulation: boolean } }).xb = { manipulation: true };

    const proceduralMesh = this.monumentBuilder.buildMonument();
    this.currentMonumentMesh = proceduralMesh;
    this.monumentGroup.add(proceduralMesh);

    // Attach 3D hotspots to the monument group so they transform together
    this.monumentGroup.add(this.hotspotVisualizer.group);
  }

  private setupSpatialUI(): void {
    this.spatialUI = new CharminarSpatialUI(this.voiceTour, {
      onScaleChange: (scale) => this.setMonumentScale(scale),
      onRotationChange: (rotY) => {
        this.monumentGroup.rotation.y = rotY;
      },
      onLightingToggle: () => this.toggleLighting(),
      onWireframeToggle: () => this.toggleWireframe(),
      onHotspotsToggle: () => this.toggleHotspots(),
      onDisplayModeToggle: () => this.toggleDisplayMode(),
      onRecenter: () => this.recenterOnSurface(),
      onImportTrigger: () => this.triggerFileInput(),
    });

    this.add(this.spatialUI.tourCard);
    this.add(this.spatialUI.controlsCard);
    this.add(this.spatialUI.unityGuideCard);
  }

  private setupFileInput(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.fbx,.glb,.gltf';
    input.style.display = 'none';
    input.id = 'charminar-model-uploader';

    input.addEventListener('change', async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        await this.loadCustomModelFile(files[0]);
      }
    });

    document.body.appendChild(input);
    this.fileInput = input;
  }

  public triggerFileInput(): void {
    this.fileInput?.click();
  }

  public async loadCustomModelFile(file: File): Promise<void> {
    try {
      this.voiceTour.playChime('select');
      const loadedGroup = await this.modelImporter.loadFromFile(file);

      if (this.currentMonumentMesh) {
        this.monumentGroup.remove(this.currentMonumentMesh);
      }

      this.currentMonumentMesh = loadedGroup;
      this.monumentGroup.add(loadedGroup);

      // Re-apply scale
      this.setMonumentScale(this.currentScale);
    } catch (err) {
      console.error('Failed to load custom model:', err);
    }
  }

  public setMonumentScale(factor: number): void {
    this.currentScale = factor;
    const baseScale = this.displayMode === 'tabletop' ? 1.0 : 3.2;
    this.monumentGroup.scale.setScalar(baseScale * factor);
  }

  public toggleLighting(): void {
    this.lightingMode = this.lightingMode === 'goldenHour' ? 'nightIllumination' : 'goldenHour';
    const isNight = this.lightingMode === 'nightIllumination';

    if (isNight) {
      this.hemiLight.color.setHex(0x223355);
      this.hemiLight.groundColor.setHex(0x111122);
      this.hemiLight.intensity = 1.0;
      this.sunLight.intensity = 0.4;
      this.sunLight.color.setHex(0x6688cc);

      // Turn on night spots
      this.nightSpotLights.forEach((spot) => {
        spot.intensity = 8.5;
      });
    } else {
      this.hemiLight.color.setHex(0xfffaed);
      this.hemiLight.groundColor.setHex(0x555566);
      this.hemiLight.intensity = 2.8;
      this.sunLight.intensity = 2.5;
      this.sunLight.color.setHex(0xfff1dc);

      this.nightSpotLights.forEach((spot) => {
        spot.intensity = 0;
      });
    }

    this.monumentBuilder.setLightingPreset(isNight);
    this.spatialUI?.updateLightingUI(this.lightingMode);

    // Sync 2D HUD button if present
    const hudLightBtn = document.getElementById('hud-btn-lighting');
    if (hudLightBtn) {
      hudLightBtn.innerText = isNight ? 'Day Golden Hour' : 'Night Illumination';
    }
  }

  public toggleWireframe(): void {
    this.wireframeEnabled = !this.wireframeEnabled;
    this.monumentBuilder.setWireframe(this.wireframeEnabled);
    this.spatialUI?.updateWireframeUI(this.wireframeEnabled);

    const hudWireBtn = document.getElementById('hud-btn-wireframe');
    if (hudWireBtn) {
      hudWireBtn.innerText = this.wireframeEnabled ? 'Realistic Stone' : 'Blueprint X-Ray';
    }
  }

  public toggleHotspots(): void {
    this.hotspotsVisible = !this.hotspotsVisible;
    this.hotspotVisualizer.setVisible(this.hotspotsVisible);
    this.spatialUI?.updateHotspotsUI(this.hotspotsVisible);
  }

  public toggleDisplayMode(): void {
    this.displayMode = this.displayMode === 'tabletop' ? 'floor' : 'tabletop';
    const userHeight = xb.user?.height || 1.6;

    if (this.displayMode === 'tabletop') {
      this.monumentGroup.position.set(0, userHeight - 0.28, -0.95);
      this.setMonumentScale(this.currentScale);
    } else {
      // Floor / Room scale
      this.monumentGroup.position.set(0, 0, -1.8);
      this.setMonumentScale(this.currentScale);
    }

    this.spatialUI?.updateDisplayModeUI(this.displayMode);

    const hudModeBtn = document.getElementById('hud-btn-mode');
    if (hudModeBtn) {
      hudModeBtn.innerText = this.displayMode === 'tabletop' ? 'Tabletop Mode' : 'Floor/Plaza Scale';
    }
  }

  public recenterOnSurface(): void {
    const userHeight = xb.user?.height || 1.6;
    this.monumentGroup.position.set(0, userHeight - 0.28, -0.95);
    this.monumentGroup.rotation.set(0, 0, 0);

    // Keep spatial UI comfortably oriented
    if (this.spatialUI) {
      this.spatialUI.tourCard.position.set(-0.52, userHeight - 0.15, -0.9);
      this.spatialUI.controlsCard.position.set(0.50, userHeight - 0.15, -0.9);
    }
  }

  update(): void {
    const time = performance.now() * 0.001;
    this.hotspotVisualizer.update(time);
  }

  onSelectStart(event: xb.SelectEvent): void {
    // 1. Check if user tapped or pinched a 3D hotspot beacon
    const target = event.target as THREE.Object3D;
    let hitObject: THREE.Object3D | null = target;

    while (hitObject && hitObject !== this.monumentGroup) {
      if (hitObject.userData?.isHotspot && hitObject.userData?.hotspotId) {
        const id = hitObject.userData.hotspotId as string;
        this.hotspotVisualizer.setActiveHotspot(id);
        this.voiceTour.goToHotspotId(id);
        event.stopPropagation();
        return;
      }
      hitObject = hitObject.parent;
    }

    // 2. Check surface placement on detected plane or depth mesh
    const depth = xb.core.depth;
    if (depth?.depthMesh && event.surface === depth.depthMesh && event.intersection) {
      const normal = event.intersection.normal ?? event.intersection.face?.normal;
      if (normal && normal.y > 0.6) {
        // Horizontal surface detected (table top or floor)
        this.monumentGroup.position.copy(event.intersection.point);
        event.stopPropagation();
      }
    }
  }

  private setupDOMOverlaySync(): void {
    // Connect 2D HUD buttons in index.html for desktop & mobile preview
    const playBtn = document.getElementById('hud-btn-play');
    if (playBtn) {
      playBtn.addEventListener('click', () => this.voiceTour.togglePlayPause());
    }

    const nextBtn = document.getElementById('hud-btn-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.voiceTour.nextStop());
    }

    const prevBtn = document.getElementById('hud-btn-prev');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.voiceTour.prevStop());
    }

    const lightBtn = document.getElementById('hud-btn-lighting');
    if (lightBtn) {
      lightBtn.addEventListener('click', () => this.toggleLighting());
    }

    const wireBtn = document.getElementById('hud-btn-wireframe');
    if (wireBtn) {
      wireBtn.addEventListener('click', () => this.toggleWireframe());
    }

    const modeBtn = document.getElementById('hud-btn-mode');
    if (modeBtn) {
      modeBtn.addEventListener('click', () => this.toggleDisplayMode());
    }

    const uploadBtn = document.getElementById('hud-btn-upload');
    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => this.triggerFileInput());
    }

    const guideBtn = document.getElementById('hud-btn-guide');
    const modal = document.getElementById('unity-guide-modal');
    const closeGuideBtn = document.getElementById('hud-btn-close-guide');

    if (guideBtn && modal) {
      guideBtn.addEventListener('click', () => {
        modal.classList.toggle('hidden');
      });
    }

    if (closeGuideBtn && modal) {
      closeGuideBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }

    // Drag-and-drop 3D file (.fbx, .glb) onto the window
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', async (e) => {
      e.preventDefault();
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        await this.loadCustomModelFile(e.dataTransfer.files[0]);
      }
    });

    // Update 2D HUD text with current tour state
    this.voiceTour.onStateChange = (state, stop, index, total) => {
      this.spatialUI?.updateTourState(state, stop, index, total);
      this.hotspotVisualizer.setActiveHotspot(stop.id);

      const titleEl = document.getElementById('hud-tour-title');
      const badgeEl = document.getElementById('hud-tour-badge');
      const descEl = document.getElementById('hud-tour-desc');
      const progressEl = document.getElementById('hud-tour-progress');
      const playIcon = document.getElementById('hud-play-icon');

      if (titleEl) titleEl.innerText = stop.title;
      if (badgeEl) badgeEl.innerText = stop.category.toUpperCase();
      if (descEl) descEl.innerText = stop.description;
      if (progressEl) progressEl.innerText = `Stop ${index + 1} of ${total} | ${stop.dimensionsOrYear}`;
      if (playIcon) playIcon.innerText = state === 'playing' ? '⏸' : '▶';
    };
  }

  dispose(): void {
    this.monumentBuilder.dispose();
    this.hotspotVisualizer.dispose();
    this.voiceTour.dispose();
  }
}

// Initialize XR Blocks
document.addEventListener('DOMContentLoaded', async () => {
  const options = new xb.Options();
  options.enableHands();
  options.hands.visualization = true;
  options.world.enablePlaneDetection();
  options.enableDepth();
  options.reticles.enabled = true;
  options.reticles.projectOnDepthMesh = true;
  options.setAppTitle('Charminar XR - Architectural Heritage & Voice Tour');
  options.setAppDescription(
    'Visualize Hyderabad\'s iconic Charminar in augmented reality, explore architectural hotspots, and take an immersive voice-guided tour.'
  );

  const experience = new CharminarExperience();
  xb.add(experience);
  await xb.init(options);
});
