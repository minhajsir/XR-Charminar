export interface HotspotData {
  id: string;
  title: string;
  subtitle: string;
  category: 'Architecture' | 'History' | 'Culture' | 'Folklore';
  position: [number, number, number]; // relative to monument center
  description: string;
  audioNarration: string;
  architecturalDetails: string[];
  dimensionsOrYear: string;
}

export type DisplayMode = 'tabletop' | 'floor';
export type LightingMode = 'goldenHour' | 'nightIllumination';

export interface MonumentSettings {
  scale: number;
  rotationY: number;
  lightingMode: LightingMode;
  wireframe: boolean;
  displayMode: DisplayMode;
  hotspotsVisible: boolean;
  waterEffect: boolean;
}
