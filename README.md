# Vigilo

**Predictive AI Pedestrian Crowd Intelligence & Flow Management**

Designed for railway terminals, metro stations, airports, shopping malls, and mega events. Vigilo leverages existing CCTV infrastructure and computer vision to track density, forecast bottlenecks, and coordinate authorities with commuters in real time.

---

## Capabilities

- **Legacy CCTV Ingestion**: Compatible with standard RTSP & ONVIF camera streams without edge hardware retrofits.
- **Predictive Neural Flow**: Real-time spatiotemporal modeling forecasting congestion bottlenecks 15–30 minutes in advance.
- **Biometric-Free Privacy**: 100% optical density and flow vectoring. Zero facial recognition or PII storage.
- **Closed-Loop Authority & Commuter Coordination**: Direct integration with digital signage, PA systems, and marshal dispatch terminals.

---

## Target Deployments

- **Railway Terminals**: Platform surge containment, footbridge flow regulation, timetable synchronization.
- **Metro Stations**: Concourse choke-point alleviation, turnstile throughput balancing, emergency egress paths.
- **Airports**: Security checkpoint queue mitigation, baggage claim zone distribution, terminal transit pacing.
- **Shopping Malls**: Atrium bottleneck elimination, retail footfall analytics, escalator safety pacing.
- **Mega Events**: Stadium turnstile pressure relief, perimeter crowd guidance, rapid egress coordination.

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router, Turbopack)
- **UI & Styling**: React 19, Tailwind CSS v4
- **Graphics**: WebGL domain-warped noise via `ogl`
- **Typography**: Geist Sans & Geist Mono

---

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to preview the site.

Build for production:

```bash
npm run build
```
