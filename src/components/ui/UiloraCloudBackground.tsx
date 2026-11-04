"use client";

import React, { useEffect, useRef } from 'react';
import { Renderer, Geometry, Program, Mesh, Vec2, Color } from 'ogl';

interface UiloraProps {
  baseColor?: string;     // The dark background tone
  cloudColor?: string;    // The color of the bright swirling veins
  speed?: number;         // Animation flow speed
  intensity?: number;     // Contrast/Brightness of the marble veins
  className?: string;
}

const VERTEX_SHADER = `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0, 1);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform vec3 uBaseColor;
  uniform vec3 uCloudColor;
  uniform float uSpeed;
  uniform float uIntensity;

  varying vec2 vUv;

  // Simple noise helper
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  // Fractal Brownian Motion for layered detail
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 6; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 p = uv * 3.0;
    p.x *= aspect;

    float t = uTime * uSpeed;

    // Mouse Interaction: Distort the coordinate space
    float mouseDist = distance(uv, uMouse);
    float influence = smoothstep(0.5, 0.0, mouseDist);
    p += (uv - uMouse) * influence * 0.5;

    // Domain Warping: The key to the "marble" look
    // We feed noise into the coordinates of other noise functions
    vec2 q = vec2(
      fbm(p + vec2(0.0, 0.0) + t * 0.2),
      fbm(p + vec2(5.2, 1.3) + t * 0.15)
    );

    vec2 r = vec2(
      fbm(p + 4.0 * q + vec2(1.7, 9.2) + t * 0.3),
      fbm(p + 4.0 * q + vec2(8.3, 2.8) + t * 0.1)
    );

    // Final warped noise value
    float f = fbm(p + 4.0 * r);

    // Sharpen the noise to create the "vein" look from the image
    float marble = pow(f, 3.0) * uIntensity;
    marble = clamp(marble, 0.0, 1.0);

    // Color mixing
    vec3 color = mix(uBaseColor, uCloudColor, marble);

    // Subtle Vignette
    float vignette = 1.0 - smoothstep(0.5, 1.5, length(vUv - 0.5));
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const UiloraCloudBackground: React.FC<UiloraProps> = ({
  baseColor = "#000000",
  cloudColor = "#ffffff",
  speed = 0.2,
  intensity = 1.8,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef(new Vec2(0.5, 0.5));
  const targetMousePos = useRef(new Vec2(0.5, 0.5));

  useEffect(() => {
    if (!containerRef.current) return;

    const renderer = new Renderer({ alpha: false, antialias: true });
    const gl = renderer.gl;
    gl.canvas.style.display = 'block';
    containerRef.current.appendChild(gl.canvas);

    // Full screen triangle geometry
    const geometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
      uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
    });

    const program = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vec2() },
        uMouse: { value: mousePos.current },
        uBaseColor: { value: new Color(baseColor) },
        uCloudColor: { value: new Color(cloudColor) },
        uSpeed: { value: speed },
        uIntensity: { value: intensity },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      program.uniforms.uResolution.value.set(w, h);
    };
    window.addEventListener('resize', resize);
    resize();

    const onMouseMove = (e: MouseEvent) => {
      targetMousePos.current.set(e.clientX / window.innerWidth, 1.0 - e.clientY / window.innerHeight);
    };
    window.addEventListener('mousemove', onMouseMove);

    let requestId: number;
    const update = (t: number) => {
      requestId = requestAnimationFrame(update);

      // Smooth mouse following
      mousePos.current.lerp(targetMousePos.current, 0.05);

      program.uniforms.uTime.value = t * 0.001;
      renderer.render({ scene: mesh });
    };
    requestId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(requestId);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      if (containerRef.current?.contains(gl.canvas)) containerRef.current.removeChild(gl.canvas);
    };
  }, [baseColor, cloudColor, speed, intensity]);

  return <div ref={containerRef} className={`fixed inset-0 z-[-1] w-full h-full bg-black ${className}`} />;
};

export default UiloraCloudBackground;