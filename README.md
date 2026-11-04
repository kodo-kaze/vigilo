<div align="center">

# Vigilo

### Predictive AI Pedestrian Crowd Intelligence & Flow Management

**Powered by the Conflux Model**

[![Next.js](https://img.shields.io/badge/Next.js-16.4.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.3.0-20232A?style=for-the-badge&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![WebGL](https://img.shields.io/badge/WebGL-OGL-990000?style=for-the-badge&logo=webgl)](https://github.com/oframe/ogl)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#key-capabilities">Key Capabilities</a> •
  <a href="#system-architecture">System Architecture</a> •
  <a href="#target-deployments">Target Deployments</a> •
  <a href="#visual-computing--shaders">Visual Computing</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#roadmap">Roadmap</a>
</p>

</div>

---

## Overview

**Vigilo** is a high-throughput pedestrian crowd intelligence and predictive flow management platform engineered for complex transit hubs, airports, urban centers, and mega-event venues.

Rather than reacting to hazardous stampedes, surges, and congestion after thresholds are crossed, Vigilo leverages existing optical surveillance infrastructure to forecast bottlenecks **15–30 minutes in advance** using the **Conflux spatiotemporal model**—all while preserving commuter privacy through biometric-free computer vision.

> **Privacy First**: Vigilo operates on optical density estimation and directional flow vectoring. It stores zero facial signatures, PII, or persistent tracking identifiers.

---

## Key Capabilities

| Capability | Description |
| :--- | :--- |
| **Legacy CCTV Ingestion** | Ingests native RTSP & ONVIF video streams without requiring costly hardware retrofits or proprietary sensor pods. |
| **Predictive Neural Flow** | Spatiotemporal neural modeling forecasting congestion chokepoints 15–30 minutes before critical escalation occurs. |
| **Biometric-Free Privacy** | Fully compliant with global privacy frameworks (GDPR, CCPA) using optical mass density and flow vectors with zero facial recognition. |
| **Closed-Loop Coordination** | Integrates directly with digital passenger displays (PIDS), automated PA announcement systems, and marshal dispatch terminals. |
| **Hardware-Accelerated Visuals** | Real-time WebGL shader pipelines powered by `ogl` providing fluid spatial dynamics and visual density simulation. |

---

## System Architecture

Vigilo unifies passive optical sensors with predictive AI and automated dispatch triggers:

```mermaid
flowchart LR
    A["Legacy CCTV Streams<br/>(RTSP / ONVIF)"] --> B["Inference Engine<br/>(Conflux Spatiotemporal Model)"]
    B --> C["Optical Density &<br/>Flow Vectoring"]
    C --> D{"Bottleneck Forecast<br/>(15–30 min window)"}
    D -- Normal Flow --> E["Live Dashboard &<br/>Spatial Analytics"]
    D -- Threshold Exceeded --> F["Automated Response & Dispatch"]
    F --> G["Digital Signage (PIDS)"]
    F --> H["Automated PA Announcements"]
    F --> I["Ground Marshal Terminals"]
```

---

## Target Deployments

* **Railway Terminals**: Platform surge containment, footbridge flow regulation, timetable-driven crowd pacing, and transfer tunnel balancing.
* **Metro Stations**: Concourse choke-point alleviation, turnstile throughput balancing, emergency egress routing, and stairway metering.
* **Airports**: Security checkpoint queue mitigation, customs hall throughput, baggage claim zone distribution, and terminal transit pacing.
* **Shopping Malls**: Multi-level atrium bottleneck elimination, retail footfall analytics, and escalator safety pacing.
* **Mega Events & Stadiums**: Turnstile pressure relief, perimeter crowd guidance, and rapid emergency egress coordination.

---

## Visual Computing & Shaders

Vigilo incorporates a custom hardware-accelerated WebGL rendering pipeline built on [`ogl`](https://github.com/oframe/ogl):

* **`UiloraCloudBackground`**: Custom domain-warped fractional Brownian motion (fBm) shader simulating atmospheric crowd pressure distributions and fluid dynamics on the hero landing page.
* **`UiloraLiquidChrome`**: GPU-driven simplex noise simulation representing molten metallic density surfaces with interactive mouse wake distortion, viscosity modeling, and frame-pause state controls on the dashboard.
* **macOS Liquid Glass UI**: Custom backdrop filter shaders (`blur(28px) saturate(210%)`) with top-edge specular curvature reflections and hover-triggered shimmer sweeps.

---

## Tech Stack

* **Framework**: [Next.js](https://nextjs.org) 16 (App Router, Turbopack)
* **Frontend Library**: [React](https://react.dev) 19
* **Styling**: [Tailwind CSS](https://tailwindcss.com) v4
* **Graphics & Shaders**: WebGL via [`ogl`](https://github.com/oframe/ogl)
* **Typography**: [Geist Sans & Geist Mono](https://vercel.com/font)
* **Language**: [TypeScript](https://www.typescriptlang.org) 5

---

## Getting Started

### Prerequisites

* **Node.js**: `20.x` or higher
* **Package Manager**: `npm`, `pnpm`, or `yarn`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/vigilo.git
   cd vigilo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server with Turbopack:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

* `npm run dev` — Starts the Next.js development server with Turbopack.
* `npm run build` — Compiles and optimizes the application for production.
* `npm run start` — Runs the compiled production build.
* `npm run lint` — Runs ESLint checks across TypeScript and React source files.

---

## Project Structure

```text
vigilo/
├── app/
│   ├── dashboard/
│   │   └── page.tsx              # Interactive dashboard with UiloraLiquidChrome shader
│   ├── globals.css               # Global styles, Tailwind v4 theme, macOS Liquid Glass
│   ├── layout.tsx                # Root layout with Geist font configurations & metadata
│   └── page.tsx                  # Landing page hero with UiloraCloudBackground
├── public/                       # Static public assets and SVGs
├── src/
│   └── components/
│       └── ui/
│           ├── UiloraCloudBackground.tsx   # WebGL domain-warping cloud shader
│           └── UiloraLiquidChrome.tsx      # WebGL molten chrome flow shader with mouse interaction
├── package.json                  # Dependencies, scripts, and package metadata
├── tsconfig.json                 # TypeScript compiler configurations
└── README.md                     # Project documentation
```

---

## Roadmap

- [x] High-performance WebGL ambient fluid & molten chrome shaders
- [x] Minimalist landing experience with macOS liquid glass UI components
- [x] Interactive shader controls (play/pause toggle, mouse wake physics)
- [ ] RTSP / ONVIF camera stream ingestion service & simulated feeds
- [ ] Conflux inference worker integration with density heatmaps
- [ ] Real-time incident alert dispatching & digital signage webhook triggers
- [ ] Multi-zone transit station topology configuration editor

---

## License

Private & Proprietary. All rights reserved.
