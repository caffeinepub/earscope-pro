# Specification

## Summary
**Goal:** Deliver the EarScope Pro web app with core screens, browser-based microcontroller connectivity (plus a simulator), live MJPEG viewing and capture, patient/session management, gallery annotation tools, and export/reporting.

**Planned changes:**
- Create app shell with client-side navigation and routes for Connection, Live Camera, Patients/Sessions, Gallery, and Export/Reports.
- Implement a frontend microcontroller communication layer using browser-supported transports (WebSerial and/or WebUSB) with newline-delimited JSON commands/telemetry, plus a clearly labeled Demo/Simulator Mode.
- Build Connection Screen with transport selection, connect + handshake flow, explicit status states, auto-reconnect with visible status, and manual cancel/retry.
- Build full-screen Live Camera View: live frame rendering, distance guide, zoom controls, LED controls wired to commands, capture + 3s timer, L/R ear toggle, active patient/session display, and a tray of the last 5 captures.
- Implement capture workflow: send capture command, receive/decode PHOTO JPEG payload, auto-save with metadata, and generate thumbnails for UI display; reload saved captures on app start.
- Add Motoko backend (single-actor) models and APIs for Patients, Sessions, and Captures (including persistence in stable storage), and integrate frontend CRUD flows.
- Implement Patient Entry + Session creation/editing UI with session numbering (e.g., #001) and association of live capture operations to the active patient/session.
- Add Batch Mode capture (5 captures at ~2/sec) with progress feedback and clear cancellation/partial results on connection issues.
- Build Gallery screen for a session: capture list/grid, timestamp + L/R labels, editable quality score, basic annotations (freehand + text label), and a per-session calibrated measurement scale overlay; persist and re-render.
- Implement Export features: session ZIP download (images + JSON manifest) and PDF report download (patient/session summary with embedded images and annotations).
- Apply blue/white medical theme with large touch-friendly controls, clear status indicators, and responsive portrait/landscape layouts.
- Add permissions/guidance UX on the Connection screen, including browser/device requirements messaging and fallback to Demo/Simulator Mode.

**User-visible outcome:** Users can connect to a compatible device (or use a simulator), view a live ear camera stream, capture photos (single/timer/batch) tied to a selected patient/session, review and annotate captures in a session gallery with scoring and measurement overlays, and export the session as a ZIP or PDF report.
