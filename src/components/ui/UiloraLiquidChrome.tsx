"use client";

import React, { useEffect, useRef } from 'react';
import { Renderer, Geometry, Program, Mesh, Vec2, Color } from 'ogl';

interface UiloraChromeProps {
    baseColor?: string;      // The deep shadows of the metal (#000000)
    chromeColor?: string;    // The specular highlights (#ffffff)
    speed?: number;          // Rate of the molten flow
    viscosity?: number;      // How "heavy" the liquid feels (0.1 - 1.0)
    distortion?: number;     // Intensity of the mouse "wake"
    isPaused?: boolean;      // Controls play/pause of molten flow
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
  uniform vec3 uChromeColor;
  uniform float uSpeed;
  uniform float uViscosity;
  uniform float uDistortion;

  varying vec2 vUv;

  // --- Uilora High-Fidelity Simplex Noise ---
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 a0 = x - floor(x + 0.5);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Calculate the "Height" of the liquid at any given point
  float getHeight(vec2 uv) {
    float t = uTime * uSpeed;
    float n = snoise(uv * 1.5 + t * 0.2);
    n += snoise(uv * 3.0 - t * 0.1 + n) * 0.5;
    
    // Mouse Interaction
    float dist = distance(uv, uMouse);
    float mouseInfluence = smoothstep(0.6, 0.0, dist) * uDistortion;
    
    return n + mouseInfluence;
  }

  void main() {
    vec2 uv = vUv;
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    
    // 1. Calculate Normals (The secret to Chrome)
    // We sample the height at 3 points to find the slope
    float e = 0.01;
    float h = getHeight(uv);
    float h1 = getHeight(uv + vec2(e, 0.0));
    float h2 = getHeight(uv + vec2(0.0, e));
    
    vec3 normal = normalize(vec3(h - h1, h - h2, uViscosity));

    // 2. Reflection Logic
    // Simulate a virtual "studio light" above the surface
    vec3 lightDir = normalize(vec3(0.5, 0.5, 1.0));
    float reflection = dot(normal, lightDir);
    
    // 3. Chrome Specular (Sharpness)
    float specular = pow(max(0.0, reflection), 12.0);
    float rim = pow(1.0 - max(0.0, normal.z), 3.0);

    // 4. Color Mixing
    vec3 color = mix(uBaseColor, uChromeColor, reflection * 0.4 + 0.2);
    color += uChromeColor * specular * 1.5; // Main highlight
    color += uChromeColor * rim * 0.5;      // Edge glow

    // 5. Uilora Micro-Texture (Fine metallic grain)
    float grain = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453) * 0.04;
    color += grain;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const UiloraLiquidChrome: React.FC<UiloraChromeProps> = ({
    baseColor = "#020202",
    chromeColor = "#ffffff",
    speed = 0.5,
    viscosity = 0.4,
    distortion = 0.8,
    isPaused = true,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mousePos = useRef(new Vec2(0.5, 0.5));
    const targetMousePos = useRef(new Vec2(0.5, 0.5));
    const isPausedRef = useRef(isPaused);

    useEffect(() => {
        isPausedRef.current = isPaused;
    }, [isPaused]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const renderer = new Renderer({ alpha: true, antialias: true });
        const gl = renderer.gl;
        container.appendChild(gl.canvas);

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
                uChromeColor: { value: new Color(chromeColor) },
                uSpeed: { value: speed },
                uViscosity: { value: viscosity },
                uDistortion: { value: distortion },
            },
        });

        const mesh = new Mesh(gl, { geometry, program });

        const resize = () => {
            if (!containerRef.current) return;
            renderer.setSize(window.innerWidth, window.innerHeight);
            program.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', resize);
        resize();

        const onMouseMove = (e: MouseEvent) => {
            targetMousePos.current.set(e.clientX / window.innerWidth, 1.0 - e.clientY / window.innerHeight);
        };
        window.addEventListener('mousemove', onMouseMove);

        let lastTime = performance.now();
        let accumulatedTime = 0;
        let requestId: number;

        const update = (now: number) => {
            requestId = requestAnimationFrame(update);

            const delta = Math.min((now - lastTime) * 0.001, 0.1);
            lastTime = now;

            if (!isPausedRef.current) {
                accumulatedTime += delta;
            }

            // Ultra-smooth viscous lerp
            mousePos.current.lerp(targetMousePos.current, 0.05);
            program.uniforms.uTime.value = accumulatedTime;
            renderer.render({ scene: mesh });
        };
        requestId = requestAnimationFrame(update);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(requestId);
            gl.getExtension('WEBGL_lose_context')?.loseContext();
            if (container?.contains(gl.canvas)) container.removeChild(gl.canvas);
        };
    }, [baseColor, chromeColor, speed, viscosity, distortion]);

    return <div ref={containerRef} className="absolute inset-0 w-full h-full -z-10 pointer-events-none" />;
};

export default UiloraLiquidChrome;
