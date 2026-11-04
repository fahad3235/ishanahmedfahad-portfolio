# DESIGN.md — Ishan Ahmed Fahad · Grand Line Abyss × Monkey D. Luffy 3D Experience

## 1. Architectural Summary & Vision

- **Identity**: **Ishan Ahmed Fahad** — Web Developer & AI Systems Engineer, Department of CIS @ Daffodil International University (Dhaka, Bangladesh). Lead System Developer at Team Probaho (UPAY Sentinel AI, SightGuide, Probaho Remit). Inter-University AI Dev Fest 2026 2nd of 132 Teams (National Runner-Up).
- **Narrative Theme**: Grand Line Abyss & Submerged Pirate Ship — high-craft WebGL narrative scrollytelling combining an atmospheric dark riverbed/abyss with Monkey D. Luffy, a 3D Submerged Ghost Pirate Galleon, procedural Devil Fruit, caustic river water shaders, and obsidian-porcelain Hallmark editorial UI.
- **Flagship Production Systems**:
  1. **UPAY Sentinel AI** (Lead System Developer): Autonomous financial crime & anti-money laundering (AML) detection engine with 99.2% accuracy and automated SAR filing.
  2. **SightGuide AI** (Vision & Edge AI Engineer): Real-time assistive navigation system for the visually impaired using YOLOv8 edge inference and binaural spatial audio feedback.
  3. **Probaho Remit** (Full-Stack Architect): High-throughput cross-border digital remittance platform with dynamic FX rate arbitration and instant mobile wallet disbursement.
  4. **Green Factory Brain AI** (Lead IoT & AI Architect): Industrial telemetry intelligence platform predicting machine maintenance and reducing carbon emissions by 24%.
  5. **CITYBRAIN AI** (Urban AI Systems Engineer): Live urban traffic flow optimization engine recalculating signal phases across Dhaka arterial corridors.
  6. **LandVault & MUSE Project Factory** (Core Systems & WebGL Developer): Cryptographic land deed registry and procedural 3D WebGL asset generation studio.

---

## 2. 3D WebGL Architecture & Custom Components

1. **Submerged Ghost Pirate Galleon (`src/webgl/PirateShip.js`)**:
   - 38-meter curved ribbed hull with keel, gun ports, poop deck, and stern gallery with stained-glass glowing windows.
   - 3 tall masts with cross spars, standing rigging shrouds, and animated undulating tattered sails with the Straw Hat Jolly Roger skull emblem.
   - Devil Dragon horned bowsprit, heavy iron anchor with chain links resting on the riverbed, soul-fire pirate lanterns casting warm embers, and sunken treasure chests overflowing with gold doubloons.
   - Procedural Devil Fruit (`createDevilFruitMesh`): Swirling flame-engraved whorls with twisted T-stem and luminescent aura.
   - Riverbed bubble particle field rising continuously towards the caustic water surface.

2. **3D Monkey D. Luffy Character (`src/webgl/LuffyCharacter.js`)**:
   - 45,122-vertex rigged skinned mesh (`figure.v2.glb`) with custom rest-pose GLSL fragment shader (`LUFFY_COLOR_FRAGMENT_PATCH`).
   - Confident wide pearlescent anime grin, stitched eye scar, crossed chest scar, open crimson captain's vest, gold buttons, indigo denim shorts with fluffy fur cuffs, woven sandals, and sculpted 3D Straw Hat with ribbon.
   - Dynamic Gear 5 Sun God Nika transformation: Concentric ruby-gold ring eyes, billowing Hagoromo cloud scarf, flame-shaped hair tips, and Conqueror's Haki crackling lightning arcs.

3. **High-DPI Dynamic Project Blueprint Cards (`src/webgl/ProjectCanvasGenerator.js`)**:
   - Procedural 1280x720 2D canvas textures generated for all 6 projects with dark obsidian glass gradients, radar capability diagrams, telemetry polygons, verified live badges, and tech stack pills.
   - Bound directly to WebGL monolith panels via `CanvasTexture` (`Xo`) with 4x anisotropic filtering.

4. **Hallmark Editorial UI & Skills Arsenal (`src/styles/main.css`)**:
   - Porcelain typography and hairline borders.
   - Interactive Project Detail Modal (`#work-modal`) with verified Live Demo (`wm-live-btn`) and GitHub Repo (`wm-repo-btn`) links.
   - Dedicated Skills Arsenal Drawer (`#skills-modal`) highlighting 12 comprehensive engineering disciplines.
