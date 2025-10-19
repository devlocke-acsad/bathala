# 🐳 Dockerized Procedural Level Generator

**A Production-Ready Containerized Game Server Architecture**

Transform your TypeScript + Phaser.js procedural level generator into a scalable, containerized application with intelligent auto-scaling capabilities. This project demonstrates enterprise-grade Docker implementation patterns for game server deployment.

## 🚀 **Docker-First Architecture**

### **Multi-Container Game Server Cluster**
- 🏗️ **Intelligent Load Balancer**: Routes traffic with auto-scaling logic
- 🎮 **Persistent Game Server**: Always-available core instance  
- ⚡ **Dynamic Auto-Scaling**: Creates/destroys servers based on demand
- 📊 **Real-time Monitoring**: Live dashboard for cluster management
- 🔧 **Container Orchestration**: Full lifecycle management

### **Production Features**
- **Multi-stage Docker builds** with optimized layer caching
- **Auto-scaling game servers** (10s inactivity → shutdown, 30s → cleanup)
- **Health checks** and graceful shutdowns
- **Nginx reverse proxy** with security headers and gzip compression
- **Development & production environments** with hot reloading
- **Resource monitoring** and performance metrics

## 🐳 **Container Architecture**

### **1. Multi-Stage Docker Pipeline**
```dockerfile
# Stage 1: Build Environment (Node.js + TypeScript)
FROM node:18-alpine AS builder
# - Install dependencies
# - Compile TypeScript → JavaScript
# - Bundle with Webpack

# Stage 2: Production Environment (Nginx)
FROM nginx:alpine AS production  
# - Copy built assets
# - Configure reverse proxy
# - Set security headers
```

### **2. Auto-Scaling Server Cluster**
```
┌─────────────────────────────────────────────────┐
│              🌐 Load Balancer                   │
│           http://localhost:80                   │
│    ┌─────────────────────────────────────────┐  │
│    │  Smart Routing + Auto-Scaling Logic     │  │
│    └─────────────┬───────────────────────────┘  │
└──────────────────┼─────────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌─────────┐ ┌─────────────┐ ┌─────────────┐
│Server 1 │ │Auto-Server-1│ │Auto-Server-2│
│(Always) │ │(On Demand)  │ │(On Demand)  │
│Port:8080│ │Port:8081+   │ │Port:8082+   │
└─────────┘ └─────────────┘ └─────────────┘
```

### **3. Intelligent Lifecycle Management**
- **Demand Detection**: Traffic monitoring triggers server creation
- **Resource Optimization**: Unused servers shutdown after 10s inactivity  
- **Clean Termination**: Container cleanup after 30s graceful shutdown
- **Persistent Core**: Server 1 provides guaranteed availability

## 🚀 **Quick Start - Docker Deployment**

### **Prerequisites**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- 8GB RAM recommended for full cluster deployment

### **Option 1: Single Container (Simple)**
```bash
# Build and run single game server
docker build -t procgen-game .
docker run -d -p 8080:80 --name procgen-simple procgen-game

# Access: http://localhost:8080
```

### **Option 2: Auto-Scaling Cluster (Recommended)**
```bash
# Start intelligent auto-scaling cluster
docker-compose -f docker-compose.cluster.yml up --build -d

# Access Points:
# 🎮 Main Game (Load Balanced): http://localhost:80
# 🏠 Persistent Server: http://localhost:8080  
# 📊 Admin API: http://localhost:8090/api/servers
```

### **Option 3: Full Monitoring Stack**
```bash
# Start cluster with monitoring dashboard
docker-compose -f docker-compose.cluster.yml --profile monitoring up --build -d

# Additional Access:
# 📈 Live Dashboard: http://localhost:3001
```

## Developer Notes (moved)

If you're working on the generator itself (development or debugging), the original project information is still relevant and is kept below. The primary focus for this repository has now been moved to Docker-first deployment and cluster operation.

### Local Development (non-Docker)

1. Install Node.js (v16+)
2. Install dependencies:
```bash
npm install
```

Development server (hot reload):
```bash
npm run dev
```

Production build:
```bash
npm run build
```

### Key Files (dev-focused)

```
src/
├── main.ts              # Entry point and game initialization
├── game-scene.ts        # Main Phaser scene with rendering logic
├── level-generator.ts   # Core level generation algorithm
├── data-structures.ts   # Point, Edge, PathNode, and IntGrid classes
├── index.html           # HTML template with UI controls
├── phaser.d.ts          # TypeScript declarations for Phaser
└── delaunator.d.ts      # TypeScript declarations for Delaunator
```

### Generation Pipeline (high level)

1. Seed Placement: region seeds with min-distance rules
2. Delaunay triangulation: region connectivity
3. A* Pathfinding: carve corridors between seeds
4. Post-processing: remove double-wide paths and fix dead ends


## Performance Optimizations

### Viewport Culling
The application implements intelligent viewport culling that only renders tiles visible on screen plus a small buffer. This provides:

- **Massive performance gains** for large grids (100x100+ tiles)
- **Smooth zooming and panning** even with complex layouts
- **Real-time performance metrics** showing tiles rendered vs total tiles
- **Toggle option** to compare performance with/without culling

### Smart Rendering
- **Throttled updates**: Limits redraw frequency during camera movement to ~60 FPS
- **Efficient bounds calculation**: Uses camera viewport to determine visible area
- **Buffer zone**: Renders slightly beyond viewport to prevent pop-in during movement
- **Performance tracking**: Real-time display of rendering efficiency

Example performance improvement:
- **Without culling**: 50x50 grid = 2,500 tiles rendered every frame
- **With culling**: 50x50 grid = ~200-400 tiles rendered (80-90% reduction!)

## Customization

### Tile Types
The generator uses different tile types:
- **PATH_TILE (1)**: Green paths connecting regions
- **REGION_TILE (2)**: Brown solid areas representing rooms/regions
- **REGION_CENTER_TILE (3)**: Red centers (currently unused in display)

### Visual Styling
Colors can be modified in `game-scene.ts`:
```typescript
if (tileType === this.generator.PATH_TILE) {
    color = 0x90EE90; // Light green
} else if (tileType === this.generator.REGION_TILE) {
    color = 0x8B4513; // Brown
}
```

### Generation Parameters
Modify default values in `level-generator.ts`:
```typescript
public levelSize: [number, number] = [50, 50];
public regionCount: number = 15;
public minRegionDistance: number = 4;
```

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**
   - Run `npm install` to ensure all dependencies are installed

2. **Blank screen**
   - Check browser console for errors
   - Ensure you're running `npm run dev` and accessing `http://localhost:3000`

3. **Generation fails**
   - Try different parameter values
   - Check that regions count isn't too high for the grid size

4. **Performance issues**
   - Reduce grid size for better performance
   - Lower region count for simpler layouts

## License

MIT License - Feel free to modify and distribute.
