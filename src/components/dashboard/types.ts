export interface TelemetryStats {
  status: string;
  is_suspended?: boolean;
  is_crowd: boolean;
  crowd_probability: number;
  people_count: number;
  density_per_megapixel: number;
  nearest_neighbor_distance: number;
  fps: number;
  capture_fps?: number;
  camera_connected: boolean;
  resolution?: string;
  camera_source?: string;
  zone?: string;
  model_mesh?: string;
  uptime_seconds: number;
}
