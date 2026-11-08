export interface TelemetryStats {
  status: string;
  is_suspended?: boolean;
  is_crowd: boolean;
  crowd_probability: number;
  people_count: number;
  density_per_megapixel: number;
  nearest_neighbor_distance: number;
  dense_clusters_count?: number;
  gatherings_count?: number;
  isolated_count?: number;
  heatmap_enabled?: boolean;
  clusters_enabled?: boolean;
  fps: number;
  capture_fps?: number;
  camera_connected: boolean;
  resolution?: string;
  camera_source?: string;
  camera_raw_source?: string;
  camera_type?: "webcam" | "ip_camera" | "video_file" | "unknown";
  camera_ip?: string | null;
  camera_port?: number | null;
  zone?: string;
  model_mesh?: string;
  uptime_seconds: number;
}

export interface CameraPreset {
  id: string;
  name: string;
  type: "webcam" | "ip_camera" | "video_file";
  source: string;
  ip?: string;
  port?: number;
  protocol?: string;
  path?: string;
  zone?: string;
  description?: string;
}

export interface CameraSourcesResponse {
  current: {
    source: string;
    display_name: string;
    type: "webcam" | "ip_camera" | "video_file" | "unknown";
    ip?: string | null;
    port?: number | null;
    zone: string;
    connected: boolean;
    is_suspended: boolean;
    resolution?: string;
    capture_fps?: number;
  };
  interfaces: CameraPreset[];
  presets: CameraPreset[];
}

export interface SwitchCameraRequest {
  source?: string;
  ip?: string;
  port?: number;
  protocol?: "rtsp" | "http" | "https";
  path?: string;
  username?: string;
  password?: string;
  name?: string;
  zone?: string;
  auto_resume?: boolean;
}

export interface TestConnectionResponse {
  reachable: boolean;
  ip: string;
  port: number;
  latency_ms: number;
  message: string;
  error?: string;
}

export interface SavedCamera {
  id: string;
  name: string;
  ip: string;
  port: number;
  protocol: "rtsp" | "http" | "https";
  path?: string;
  zone?: string;
}
