# 🛰️ S2 Tile Orchestrator

[![GitHub](https://img.shields.io/badge/GitHub-s2--tile--orchestrator-181717?style=flat-square&logo=github)](https://github.com/karuna24s/s2-tile-orchestrator)
[![Go](https://img.shields.io/badge/Go-00ADD8?style=flat-square&logo=go&logoColor=white)](https://go.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Protobuf](https://img.shields.io/badge/Protobuf-4285F4?style=flat-square)](https://protobuf.dev/)
[![S2](https://img.shields.io/badge/S2%20Geometry-sphere%20indexing-2ea043?style=flat-square)](https://s2geometry.io/)

**Repository:** [github.com/karuna24s/s2-tile-orchestrator](https://github.com/karuna24s/s2-tile-orchestrator)

A high-performance geospatial discovery engine demonstrating the mapping of 2D coordinates to a 1D Hilbert Curve (S2 Geometry) for planetary-scale sharding and sub-second tile delivery.

## 🏛️ Architectural Philosophy

This project is built on the Five Geospatial Invariants that define high-integrity infrastructure:

- **Precision:** Dynamic truncation of coordinates based on viewport LOD (Level of Detail) to protect the event loop and optimize network bandwidth.
- **Locality:** Leveraging S2 Cell IDs to ensure data physically close on Earth is numerically close in the database, enabling efficient 1D range scans instead of expensive 2D index lookups.
- **Efficiency:** Using Go's concurrency primitives (Goroutines and Channels) to mask I/O (Input/Output) latency during tile retrieval from distributed storage.
- **Integrity:** Contract-first development using Protocol Buffers (Protobuf) to prevent schema drift between the Go infrastructure and the TypeScript discovery layer.
- **Human Robustness:** A design philosophy that minimizes cognitive load for maintainers through deterministic state machines and uncomfortably obvious logic. I build systems that support us during the "weakest version of ourselves," ensuring reliability when human heroics aren't available.

## 🛠️ The Tech Stack

| Area | Choice | Rationale |
|------|--------|-----------|
| **Backend** | Go (Golang) | Optimized for bitwise S2 operations and high-concurrency binary serialization. |
| **Frontend** | React + TypeScript | Type-safe viewport orchestration and reactive state management for complex coordinate bounds. |
| **Transport** | Protobuf (PBF) | Binary packing (Protocol Buffer Format) to minimize the "Data Tax" on mobile and low-bandwidth clients. |
| **Geometry** | S2 Geometry | Mathematical mapping of a sphere to a 1D Hilbert Curve (a space-filling curve) for spatial locality. |

## 🚀 Technical Features

### The "Hot Path" (Go)

The backend service handles the high-magnitude coordinate-to-cell mapping required to transform Latitude and Longitude into a 64-bit integer ID.

- **Concurrent streaming:** Fetches a 3×3 grid of neighboring cells in parallel so the API (Application Programming Interface) stays responsive during high-density discovery.
- **LOD controller:** Responds to zoom levels by masking bits of the S2 ID to return parent or child tiles dynamically based on the required resolution.

### The Viewport Orchestrator (TypeScript)

The client acts as the intelligent requester, calculating bounding boxes and only requesting high-precision data when the user's zoom level justifies the computational cost.

- **Request coalescing:** Implements the DataLoader pattern to batch individual tile requests, preventing "Thundering Herds" (systemic stress from simultaneous requests) on the backend storage layer.

## 🛡️ Senior Engineering Notes

- **Sharding strategy:** Designed for Spanner-style sharding (Google's globally distributed database) where CellID is the primary key, minimizing cross-shard transactions.
- **Data integrity:** Employs transactional logic and idempotency (ensuring an operation can be repeated without side effects) for POI (Point of Interest) updates, ensuring a single "Source of Truth" across distributed regions.
- **Performance:** Targets sub-second discovery by trading microseconds of execution for milliseconds of query efficiency.

## 📖 Glossary

| Term | Definition |
|------|------------|
| **S2 Geometry** | A mathematical library that projects a sphere (Earth) onto a cube and indexes it using a space-filling curve. |
| **Hilbert Curve** | A 1D line that folds into 2D space, ensuring that points close together on the line are geographically close on the map. |
| **LOD (Level of Detail)** | A technique where data resolution increases only as the user zooms in, reducing initial load times. |
| **Protobuf (PBF)** | Protocol Buffer Format; a binary serialization method that is faster and smaller than JSON. |
| **I/O (Input/Output)** | Operations that involve data transfer (like reading from a database or sending data over a network). |
| **Idempotency** | A property where multiple identical requests have the same effect as a single request, preventing duplicate data. |

---

**Author:** Karuna Sehgal · **GitHub:** [@karuna24s](https://github.com/karuna24s)

**Objective:** Infrastructure for the Planet.
