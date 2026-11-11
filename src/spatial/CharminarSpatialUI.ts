import * as xb from 'xrblocks';
import { CHARMINAR_HOTSPOTS } from '../monument/Hotspots.ts';
import { HotspotData, LightingMode, DisplayMode } from '../types.ts';
import { VoiceTourManager, TourState } from '../audio/VoiceTourManager.ts';

export interface SpatialUICallbacks {
  onScaleChange: (scale: number) => void;
  onRotationChange: (rotationY: number) => void;
  onLightingToggle: () => void;
  onWireframeToggle: () => void;
  onHotspotsToggle: () => void;
  onDisplayModeToggle: () => void;
  onRecenter: () => void;
  onImportTrigger: () => void;
}

export class CharminarSpatialUI {
  public tourCard: xb.UICard;
  public controlsCard: xb.UICard;
  public unityGuideCard: xb.UICard;

  // Tour UI elements
  private tourTitle: xb.UIText;
  private tourCategoryBadge: xb.UIText;
  private tourDimensions: xb.UIText;
  private tourDescription: xb.UIText;
  private tourArchDetail1: xb.UIText;
  private tourArchDetail2: xb.UIText;
  private playPauseButton: xb.UIButton;
  private tourProgressText: xb.UIText;

  // Control UI elements
  private scaleValueText: xb.UIText;
  private lightingButton: xb.UIButton;
  private wireframeButton: xb.UIButton;
  private displayModeButton: xb.UIButton;
  private hotspotsButton: xb.UIButton;

  private voiceTour: VoiceTourManager;
  private callbacks: SpatialUICallbacks;

  constructor(voiceTour: VoiceTourManager, callbacks: SpatialUICallbacks) {
    this.voiceTour = voiceTour;
    this.callbacks = callbacks;

    // Build Cards
    const initialStop = CHARMINAR_HOTSPOTS[0];

    // 1. TOUR CARD
    this.tourTitle = new xb.UIText({
      text: initialStop.title,
      style: { fontSize: 24, fontWeight: 'bold' },
    });

    this.tourCategoryBadge = new xb.UIText({
      text: initialStop.category.toUpperCase(),
      style: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#e6b840',
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 3,
        paddingBottom: 3,
        backgroundColor: 'rgba(230, 184, 64, 0.18)',
        borderRadius: 6,
      },
    });

    this.tourDimensions = new xb.UIText({
      text: initialStop.dimensionsOrYear,
      style: { fontSize: 14, color: '#94a3b8' },
    });

    this.tourDescription = new xb.UIText({
      text: initialStop.description,
      style: { fontSize: 15, lineHeight: 1.4, color: '#e2e8f0' },
    });

    this.tourArchDetail1 = new xb.UIText({
      text: `• ${initialStop.architecturalDetails[0] || ''}`,
      style: { fontSize: 13, color: '#cbd5e1' },
    });

    this.tourArchDetail2 = new xb.UIText({
      text: `• ${initialStop.architecturalDetails[1] || ''}`,
      style: { fontSize: 13, color: '#cbd5e1' },
    });

    this.tourProgressText = new xb.UIText({
      text: `Stop 1 of ${CHARMINAR_HOTSPOTS.length}`,
      style: { fontSize: 14, color: '#94a3b8', textAlign: 'center' },
    });

    this.playPauseButton = new xb.UIButton({
      label: 'Play Audio',
      icon: 'volume_up',
      style: { flexGrow: 1 },
      onClick: () => this.voiceTour.togglePlayPause(),
    });

    const prevButton = new xb.UIButton({
      icon: 'skip_previous',
      ariaLabel: 'Previous Stop',
      style: { width: 50 },
      onClick: () => this.voiceTour.prevStop(),
    });

    const nextButton = new xb.UIButton({
      icon: 'skip_next',
      ariaLabel: 'Next Stop',
      style: { width: 50 },
      onClick: () => this.voiceTour.nextStop(),
    });

    this.tourCard = new xb.UICard({
      size: { width: 0.52, height: 'auto' },
      manipulation: true,
      edge: true,
      style: {
        flexDirection: 'column',
        gap: 12,
        padding: 18,
        borderRadius: 20,
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
      },
      children: [
        new xb.UIPanel({
          style: {
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
          children: [
            new xb.UIPanel({
              style: { flexDirection: 'row', alignItems: 'center', gap: 8 },
              children: [
                new xb.UIIcon({
                  icon: 'account_balance',
                  style: { width: 28, height: 28, color: '#e6b840' },
                }),
                new xb.UIText({
                  text: 'CHARMINAR HERITAGE',
                  style: { fontSize: 16, fontWeight: 'bold', color: '#e6b840' },
                }),
              ],
            }),
            this.tourCategoryBadge,
          ],
        }),
        this.tourTitle,
        this.tourDimensions,
        this.tourDescription,
        new xb.UIPanel({
          style: {
            width: '100%',
            flexDirection: 'column',
            gap: 4,
            padding: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 10,
          },
          children: [this.tourArchDetail1, this.tourArchDetail2],
        }),
        new xb.UIPanel({
          style: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 8 },
          children: [prevButton, this.playPauseButton, nextButton],
        }),
        this.tourProgressText,
      ],
    });

    // 2. CONTROLS CARD
    this.scaleValueText = new xb.UIText({
      text: '1.0x',
      style: { fontSize: 16, fontWeight: 'bold' },
    });

    const scaleSlider = new xb.UISlider({
      ariaLabel: 'Monument scale',
      min: 40,
      max: 220,
      step: 10,
      value: 100,
      style: { width: '100%', height: 36 },
      onInput: (val) => {
        const factor = val / 100;
        this.scaleValueText.text = `${factor.toFixed(1)}x`;
        this.callbacks.onScaleChange(factor);
      },
    });

    this.lightingButton = new xb.UIButton({
      label: 'Night Illumination',
      icon: 'nightlight',
      style: { flexGrow: 1 },
      onClick: () => this.callbacks.onLightingToggle(),
    });

    this.wireframeButton = new xb.UIButton({
      label: 'Blueprint X-Ray',
      icon: 'architecture',
      style: { flexGrow: 1 },
      onClick: () => this.callbacks.onWireframeToggle(),
    });

    this.displayModeButton = new xb.UIButton({
      label: 'Tabletop Mode',
      icon: 'table_restaurant',
      style: { flexGrow: 1 },
      onClick: () => this.callbacks.onDisplayModeToggle(),
    });

    this.hotspotsButton = new xb.UIButton({
      label: 'Toggle Hotspots',
      icon: 'location_on',
      style: { flexGrow: 1 },
      onClick: () => this.callbacks.onHotspotsToggle(),
    });

    const recenterButton = new xb.UIButton({
      label: 'Re-center On Surface',
      icon: 'center_focus_strong',
      style: { width: '100%' },
      onClick: () => this.callbacks.onRecenter(),
    });

    const importButton = new xb.UIButton({
      label: 'Load Custom FBX / GLTF',
      icon: 'upload_file',
      style: { width: '100%' },
      onClick: () => this.callbacks.onImportTrigger(),
    });

    const unityGuideButton = new xb.UIButton({
      label: 'Unity & AR Foundation Guide',
      icon: 'devices',
      style: { width: '100%' },
      onClick: () => {
        this.unityGuideCard.visible = !this.unityGuideCard.visible;
      },
    });

    this.controlsCard = new xb.UICard({
      size: { width: 0.50, height: 'auto' },
      manipulation: true,
      edge: true,
      style: {
        flexDirection: 'column',
        gap: 12,
        padding: 18,
        borderRadius: 20,
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
      },
      children: [
        new xb.UIPanel({
          style: {
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
          children: [
            new xb.UIText({
              text: 'MONUMENT CONTROLS',
              style: { fontSize: 16, fontWeight: 'bold', color: '#38bdf8' },
            }),
            this.scaleValueText,
          ],
        }),
        scaleSlider,
        new xb.UIPanel({
          style: { width: '100%', flexDirection: 'row', gap: 8 },
          children: [this.lightingButton, this.wireframeButton],
        }),
        new xb.UIPanel({
          style: { width: '100%', flexDirection: 'row', gap: 8 },
          children: [this.displayModeButton, this.hotspotsButton],
        }),
        recenterButton,
        importButton,
        unityGuideButton,
      ],
    });

    // 3. UNITY & AR FOUNDATION GUIDE CARD
    this.unityGuideCard = new xb.UICard({
      size: { width: 0.62, height: 'auto' },
      manipulation: true,
      edge: true,
      style: {
        flexDirection: 'column',
        gap: 12,
        padding: 20,
        borderRadius: 20,
        backgroundColor: 'rgba(10, 18, 36, 0.94)',
      },
      children: [
        new xb.UIPanel({
          style: {
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
          children: [
            new xb.UIText({
              text: 'UNITY & AR FOUNDATION ARCHITECTURE',
              style: { fontSize: 18, fontWeight: 'bold', color: '#10b981' },
            }),
            new xb.UIButton({
              icon: 'close',
              style: { width: 36, height: 36 },
              onClick: () => {
                this.unityGuideCard.visible = false;
              },
            }),
          ],
        }),
        new xb.UIText({
          text: 'Comprehensive Architecture for iOS (ARKit) & Android (ARCore):',
          style: { fontSize: 15, fontWeight: 'bold', color: '#f8fafc' },
        }),
        new xb.UIText({
          text:
            '1. Packages: Install AR Foundation (5.1+), Apple ARKit XR Plugin, and Google ARCore XR Plugin.\n' +
            '2. Scene Hierarchy: Add XR Origin with AR Camera, AR Session, AR Plane Manager (Detection Mode: Horizontal), and AR Raycast Manager.\n' +
            '3. FBX Model Optimization: In Unity Model Import Inspector, set Mesh Compression = High, Read/Write = Disabled, Generate Colliders = False, and convert materials to Universal Render Pipeline (URP) Lit.\n' +
            '4. Smooth Interactions: Attach LeanTouch or an AR Placement Manager script supporting single-finger drag rotation, two-finger pinch-to-scale, and raycast placement on detected plane polygon meshes.\n' +
            '5. Voice Guided Tour: Trigger AudioSource clips with subtitle events at each architectural POI beacon.\n' +
            '6. Cross-Platform Build: iOS requires Camera Usage Description in Player Settings; Android requires ARCore Supported / Optional manifest flag.',
          style: { fontSize: 13, lineHeight: 1.45, color: '#cbd5e1' },
        }),
        new xb.UIButton({
          label: 'Got It / Dismiss',
          icon: 'check',
          style: { width: '100%' },
          onClick: () => {
            this.unityGuideCard.visible = false;
          },
        }),
      ],
    });
    this.unityGuideCard.visible = false;

    // Connect voice tour manager state updates
    this.voiceTour.onStateChange = (state, stop, index, total) => {
      this.updateTourState(state, stop, index, total);
    };

    // Position cards in space
    this.tourCard.position.set(-0.52, 1.35, -0.9);
    this.tourCard.rotation.y = 0.25;

    this.controlsCard.position.set(0.50, 1.35, -0.9);
    this.controlsCard.rotation.y = -0.25;

    this.unityGuideCard.position.set(0, 1.45, -0.85);
  }

  public updateTourState(state: TourState, stop: HotspotData, index: number, total: number): void {
    this.tourTitle.text = stop.title;
    this.tourCategoryBadge.text = stop.category.toUpperCase();
    this.tourDimensions.text = stop.dimensionsOrYear;
    this.tourDescription.text = stop.description;
    this.tourArchDetail1.text = `• ${stop.architecturalDetails[0] || ''}`;
    this.tourArchDetail2.text = `• ${stop.architecturalDetails[1] || ''}`;
    this.tourProgressText.text = `Stop ${index + 1} of ${total}`;

    if (state === 'playing') {
      this.playPauseButton.label = 'Pause Audio';
      this.playPauseButton.icon = 'pause';
    } else {
      this.playPauseButton.label = 'Play Audio';
      this.playPauseButton.icon = 'volume_up';
    }
  }

  public updateLightingUI(mode: LightingMode): void {
    if (mode === 'nightIllumination') {
      this.lightingButton.label = 'Day Golden Hour';
      this.lightingButton.icon = 'wb_sunny';
    } else {
      this.lightingButton.label = 'Night Illumination';
      this.lightingButton.icon = 'nightlight';
    }
  }

  public updateWireframeUI(enabled: boolean): void {
    this.wireframeButton.label = enabled ? 'Realistic Stone' : 'Blueprint X-Ray';
    this.wireframeButton.icon = enabled ? 'view_in_ar' : 'architecture';
  }

  public updateDisplayModeUI(mode: DisplayMode): void {
    this.displayModeButton.label = mode === 'tabletop' ? 'Floor/Plaza Scale' : 'Tabletop Mode';
    this.displayModeButton.icon = mode === 'tabletop' ? 'apartment' : 'table_restaurant';
  }

  public updateHotspotsUI(visible: boolean): void {
    this.hotspotsButton.label = visible ? 'Hide Hotspots' : 'Show Hotspots';
  }
}
