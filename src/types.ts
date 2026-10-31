export type CameraAnglePreset = 'iso' | 'side' | 'front';

export interface ProtocolItem {
  code: string;
  title: string;
  metric: string;
  desc: string;
}

export interface PitchStage {
  start: number;
  end: number;
  scene: string;
  script: string;
  targetSection: string;
  camera: CameraAnglePreset;
  immersion: number;
}
