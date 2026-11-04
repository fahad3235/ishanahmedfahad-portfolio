// Broken Pirate Galleon & Grand Line Subterranean River Module
// Crafted to match the 3D Pirate Galleon reference renders with continuous curved hull planking,
// jagged splintered plank breaches, square gunports with open lids, baroque golden beakhead rails
// and ball finials, bowsprit with tattered spritsail, 3 stepped masts with crow's nests, chainwales,
// shroud/ratline rope ladders, tattered billowing canvas sails, protruding quarter gallery window bays,
// two-tier sterncastle cabin bulkhead, high flat transom stern with 3 lanterns, and massive stern rudder.

export function createDevilFruitMesh(T, uniforms) {
  const THREE = T.THREE || (typeof window !== "undefined" && window.__THREE) || {};
  const Group = T.yr || THREE.Group;
  const Mesh = T.J || THREE.Mesh;
  const SphereGeometry = T.Lc || THREE.SphereGeometry;
  const TorusGeometry = T.zc || THREE.TorusGeometry;
  const TubeGeometry = T.Vc || THREE.TubeGeometry;
  const CatmullRomCurve3 = T.Ss || THREE.CatmullRomCurve3;
  const Vector3 = T.U || THREE.Vector3;
  const Color = T.G || THREE.Color;
  const MeshStandardMaterial = T.nl || THREE.MeshStandardMaterial;

  const fruitGroup = new Group();
  fruitGroup.name = "devil-fruit-nika";

  const devilMat = new MeshStandardMaterial({
    color: "#5b148a",
    roughness: 0.35,
    metalness: 0.15,
  });

  // Note: T.$g already injects rg (uTime, hash*), sg (snoise, fbm*), cg, lg into #include <common>
  if (T.$g && T.Q) {
    T.$g(devilMat, {
      key: "devil-fruit-skin-v2",
      uniforms,
      vertex: (e) => (
        (e = T.Q(e, "#include <common>", "varying vec3 vFruitP;")),
        T.Q(e, "#include <begin_vertex>", "vFruitP = position;")
      ),
      fragment: (e) => (
        (e = T.Q(
          e,
          "#include <common>",
          `
            varying vec3 vFruitP;
            uniform float uCharge, uNika, uShade;
          `
        )),
        (e = T.Q(
          e,
          "#include <color_fragment>",
          `
            vec3 p = vFruitP * 9.0;
            float ang = atan(p.z, p.x);
            float rad = length(p.xz);
            float spiral = sin(ang * 4.0 + rad * 3.5 + p.y * 3.0 + uTime * 0.8);
            float cells = fbm3(p * 1.8 + vec3(0.0, uTime * 0.2, 0.0)) * 0.5 + 0.5;
            float pattern = smoothstep(-0.2, 0.6, spiral * 0.7 + cells * 0.6);

            vec3 basePurple = vec3(0.38, 0.08, 0.62) * uShade;
            vec3 devilCrimson = vec3(0.88, 0.12, 0.35) * uShade;
            vec3 nikaGold = vec3(1.0, 0.82, 0.28) * uShade;

            float devilMix = clamp(uNika * 0.7 + uCharge * 0.6, 0.0, 1.0);
            vec3 skin = mix(basePurple, devilCrimson, pattern * 0.75);
            diffuseColor.rgb = mix(skin, nikaGold, devilMix * pattern * 0.8);
          `
        )),
        T.Q(
          e,
          "#include <emissivemap_fragment>",
          `
            float rim = pow(1.0 - saturate(abs(dot(normal, normalize(vViewPosition)))), 2.5);
            float pulse = 0.5 + 0.5 * sin(uTime * 3.2);
            vec3 auraCol = mix(vec3(0.65, 0.12, 0.95), vec3(1.0, 0.35, 0.15), uNika);
            totalEmissiveRadiance += auraCol * rim * (0.45 + pulse * 0.45 + uNika * 0.6) * uShade;
          `
        )
      ),
    });
  }

  const bodyGeo = new SphereGeometry(0.24, 32, 28);
  const pos = bodyGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, y, z) || 1;
    const ang = Math.atan2(z, x);
    const lobe = 1.0 + 0.06 * Math.sin(ang * 5.0) * Math.cos(y * 12.0);
    pos.setXYZ(i, (x / r) * 0.24 * lobe, y * 1.05, (z / r) * 0.24 * lobe);
  }
  bodyGeo.computeVertexNormals();
  const body = new Mesh(bodyGeo, devilMat);
  body.castShadow = true;
  body.receiveShadow = true;
  fruitGroup.add(body);

  const stemMat = new MeshStandardMaterial({
    color: "#28542c",
    roughness: 0.6,
    metalness: 0.05,
  });

  const stemCurve = new CatmullRomCurve3([
    new Vector3(0, 0.22, 0),
    new Vector3(0.04, 0.29, 0.02),
    new Vector3(0.09, 0.34, -0.03),
    new Vector3(0.06, 0.38, -0.08),
    new Vector3(0.01, 0.37, -0.06),
    new Vector3(-0.02, 0.34, -0.02),
  ]);
  const stemGeo = new TubeGeometry(stemCurve, 28, 0.016, 8, false);
  const stem = new Mesh(stemGeo, stemMat);
  stem.castShadow = true;
  fruitGroup.add(stem);

  const auraTorus = new Mesh(
    new TorusGeometry(0.32, 0.008, 8, 36),
    new MeshStandardMaterial({
      color: "#ff3a6e",
      emissive: new Color("#ff245a"),
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.75,
    })
  );
  auraTorus.rotation.x = Math.PI / 2;
  fruitGroup.add(auraTorus);

  return fruitGroup;
}

// Helper math functions for parametric hull construction
function smoothstepJS(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Evaluates the exact 3D surface coordinates (x, y, z) of the Pirate Galleon hull
 * for longitudinal parameter u in [0, 1] (0 = stern, 1 = bow)
 * and vertical parameter v in [0, 1] (0 = keel, 1 = upper bulwark rail).
 */
function evalGalleonHullPoint(u, v, side, scaleX = 1.0, addWales = true) {
  // 1. Longitudinal Z coordinate with raked sternpost/transom and curved bow cutwater
  const zStern = -15.2 - 3.0 * Math.pow(v, 0.88);
  const zBow = 14.4 + 4.4 * Math.pow(v, 0.68);
  const z = zStern + (zBow - zStern) * u;

  // 2. Vertical Y coordinate: curved sheer line + stepped forecastle & poop sterncastle
  let yKeel = 0.0;
  if (u > 0.80) {
    yKeel += 1.55 * Math.pow((u - 0.80) / 0.20, 2.0);
  } else if (u < 0.12) {
    yKeel += 0.35 * Math.pow((0.12 - u) / 0.12, 1.6);
  }

  // Sweeping galleon sheer line (lowest at midships u = 0.55)
  let ySheer = 4.95;
  if (u < 0.55) {
    ySheer += 3.35 * Math.pow((0.55 - u) / 0.55, 1.52);
  } else {
    ySheer += 1.55 * Math.pow((u - 0.55) / 0.45, 1.42);
  }
  // Architectural deck steps at sterncastle and forecastle
  ySheer += 0.48 * (1.0 - smoothstepJS(0.22, 0.30, u));
  ySheer += 0.38 * smoothstepJS(0.73, 0.79, u);

  const y = yKeel + (ySheer - yKeel) * v;

  // 3. Transverse Half-Beam X coordinate (apple-cheeked bow, round bilge, tumblehome, flat transom)
  const fwdEnv = Math.pow(
    Math.max(0.0, 1.0 - Math.pow(Math.max(0.0, (u - 0.44) / 0.56), 2.25)),
    0.48
  );
  const aftLowerEnv = 0.06 + 0.94 * Math.pow(Math.min(1.0, u / 0.48), 0.68);
  const aftUpperEnv = 0.64 + 0.36 * Math.sin(Math.min(1.0, u / 0.50) * Math.PI * 0.5);
  const aftBlend = smoothstepJS(0.18, 0.46, v);
  const aftEnv = aftLowerEnv * (1.0 - aftBlend) + aftUpperEnv * aftBlend;

  // Pinch cleanly to stempost at u = 1.0
  const bowPinch = 1.0 - 0.985 * Math.pow(u, 15.0);
  const longEnv = (u < 0.48 ? aftEnv : fwdEnv) * bowPinch;

  // Cross-sectional curve: garboard -> full bilge belly -> inward tumblehome
  const bilgeCurve = Math.sin(Math.pow(v, 0.58) * Math.PI * 0.72);
  const tumblehome = 1.0 - 0.18 * Math.pow(Math.max(0.0, (v - 0.48) / 0.52), 1.35);
  const flareBow = u > 0.72 && v > 0.55 ? 0.14 * ((u - 0.72) / 0.28) * ((v - 0.55) / 0.45) : 0.0;
  const vertSec = 0.04 + 0.96 * bilgeCurve * tumblehome + flareBow;

  // Raised horizontal wales (thick outer rubbing strakes) & 28 plank strake bevels
  let waleOffset = 0.0;
  if (addWales) {
    const w1 = Math.exp(-Math.pow((v - 0.43) / 0.016, 2.0)) * 0.15;
    const w2 = Math.exp(-Math.pow((v - 0.61) / 0.016, 2.0)) * 0.15;
    const w3 = Math.exp(-Math.pow((v - 0.78) / 0.014, 2.0)) * 0.12;
    const w4 = Math.exp(-Math.pow((v - 0.97) / 0.016, 2.0)) * 0.14;
    const plankBevel = Math.abs(Math.sin(v * 28.0 * Math.PI)) * 0.022;
    waleOffset = (w1 + w2 + w3 + w4 + plankBevel) * Math.min(1.0, longEnv * 1.4);
  }

  const halfBeam = (4.65 * vertSec * longEnv + waleOffset) * scaleX;
  const x = side * halfBeam;

  return { x, y, z, halfBeam, ySheer, yKeel };
}

/**
 * Builds the complete Broken 3-Masted Pirate Galleon matching the reference renders.
 */
export function createSubmergedPirateGalleon(T, uniforms = {}) {
  const THREE = T.THREE || (typeof window !== "undefined" && window.__THREE) || T || {};
  const Group = T.yr || THREE.Group;
  const Mesh = T.J || THREE.Mesh;
  const BoxGeometry = T.ts || THREE.BoxGeometry;
  const CylinderGeometry = T.is || THREE.CylinderGeometry;
  const SphereGeometry = T.Lc || THREE.SphereGeometry;
  const PlaneGeometry = T.Nc || THREE.PlaneGeometry;
  const TorusGeometry = T.zc || THREE.TorusGeometry;
  const TubeGeometry = T.Vc || THREE.TubeGeometry;
  const CatmullRomCurve3 = T.Ss || THREE.CatmullRomCurve3;
  const Vector3 = T.U || THREE.Vector3;
  const Color = T.G || THREE.Color;
  const MeshStandardMaterial = T.nl || THREE.MeshStandardMaterial;
  const ShaderMaterial = T.el || THREE.ShaderMaterial;

  const Q = T.Q || ((s, k, v) => s.replace(k, `${k}\n${v}`));
  const $g =
    T.$g ||
    ((m, o) => {
      m.customProgramCacheKey = () => o.key;
      m.onBeforeCompile = (sh) => {
        if (o.uniforms) Object.assign(sh.uniforms, o.uniforms);
        if (o.vertex) sh.vertexShader = o.vertex(sh.vertexShader);
        if (o.fragment) sh.fragmentShader = o.fragment(sh.fragmentShader);
      };
    });

  const galleon = new Group();
  galleon.name = "sunken-ghost-pirate-galleon";

  const timeUniform = (T.tg && T.tg.uTime) || uniforms.uTime || { value: 0 };
  const nikaUniform = uniforms.uNika || { value: 1.0 };
  const shadeUniform = uniforms.uShade || { value: 1.0 };
  const mergedUniforms = {
    uTime: timeUniform,
    uNika: nikaUniform,
    uShade: shadeUniform,
    ...uniforms,
  };

  // ============================================================================
  // 1. MATERIALS (Studio-lit PBR + Shader procedural detail, zero duplicate GLSL)
  // ============================================================================

  // 1a. Outer Curved Hull Planking Material (with 28 horizontal plank strakes, wales,
  //     moss/waterline weathering, 7 square gunport cutouts, and jagged splintered plank breaches)
  const hullSkinMat = new MeshStandardMaterial({
    color: "#7c583e",
    roughness: 0.82,
    metalness: 0.08,
    side: 2,
  });

  if ($g && Q) {
    $g(hullSkinMat, {
      key: "galleon-hull-skin-v3",
      uniforms: {
        ...mergedUniforms,
      },
      vertex: (e) => (
        (e = Q(
          e,
          "#include <common>",
          "varying vec3 vShipL; varying vec3 vShipN; varying vec2 vHullUv;"
        )),
        Q(
          e,
          "#include <begin_vertex>",
          "vShipL = position; vShipN = normal; vHullUv = uv;"
        )
      ),
      fragment: (e) => (
        (e = Q(
          e,
          "#include <common>",
          `
            varying vec3 vShipL;
            varying vec3 vShipN;
            varying vec2 vHullUv;
            uniform float uNika, uShade;

            // Evaluates a horizontal plank-quantized jagged hull breach
            float hullBreachMask(vec2 uv, float uMin, float uMax, float vMin, float vMax, float seed) {
              if (uv.y < vMin || uv.y > vMax) return 0.0;
              float plankId = floor(uv.y * 28.0);
              float plankF = fract(uv.y * 28.0);
              float rL = hash11(plankId * 13.7 + seed * 29.3);
              float rR = hash11(plankId * 19.1 + seed * 41.7);
              // Some individual planks survive Further into the breach for realistic splinter teeth
              float toothL = abs(fract(plankF * 3.0 + rL) * 2.0 - 1.0) * 0.026;
              float toothR = abs(fract(plankF * 3.0 + rR) * 2.0 - 1.0) * 0.026;
              float actualMin = uMin + (rL - 0.5) * 0.055 + toothL;
              float actualMax = uMax + (rR - 0.5) * 0.055 - toothR;
              return (uv.x > actualMin && uv.x < actualMax) ? 1.0 : 0.0;
            }
          `
        )),
        (e = Q(
          e,
          "#include <color_fragment>",
          `
            vec2 huv = vHullUv;
            float plankCount = 28.0;
            float plankCoord = huv.y * plankCount;
            float plankRow = floor(plankCoord);
            float plankF = fract(plankCoord);

            // 1. 7 Square Gunport Cutouts along the battery band (v in [0.465, 0.575])
            bool inGunport = false;
            for (int gi = 0; gi < 7; gi++) {
              float gu = 0.19 + float(gi) * 0.10;
              if (abs(huv.x - gu) < 0.023 && huv.y > 0.468 && huv.y < 0.572) {
                inGunport = true;
              }
            }
            if (inGunport) discard;

            // 2. Jagged Broken Plank Breaches matching the reference renders:
            // Breach A: Long jagged lower-hull breach below forward/midships gunports
            float brA = hullBreachMask(huv, 0.52, 0.78, 0.15, 0.34, 1.0);
            // Breach B: Secondary lower hull hole aft of main breach
            float brB = hullBreachMask(huv, 0.34, 0.45, 0.16, 0.26, 2.0);
            // Breach C: Jagged hole right in front of the 1st (foremost) square gunport
            float brC = hullBreachMask(huv, 0.825, 0.905, 0.43, 0.56, 3.0);
            // Breach D: Upper bulwark hole under forecastle & small holes between gunports
            float brD = hullBreachMask(huv, 0.785, 0.835, 0.67, 0.75, 4.0);
            float brE = hullBreachMask(huv, 0.635, 0.665, 0.58, 0.64, 5.0);
            float brF = hullBreachMask(huv, 0.235, 0.265, 0.20, 0.27, 6.0);

            if (brA + brB + brC + brD + brE + brF > 0.5) discard;

            // 3. Weathered Horizontal Wood Plank Strakes, Butt Joints & Raised Wales
            float seamY = smoothstep(0.0, 0.09, plankF) * smoothstep(1.0, 0.91, plankF);
            float buttX = fract(huv.x * 9.0 + hash11(plankRow * 7.13));
            float seamX = smoothstep(0.0, 0.025, buttX) * smoothstep(1.0, 0.975, buttX);
            float plankVar = hash11(plankRow * 3.7 + floor(huv.x * 9.0 + hash11(plankRow * 7.13)) * 11.3);

            // Fine longitudinal wood grain fibers
            float grain = 0.82 + 0.18 * sin(huv.x * 260.0 + snoise(vec3(huv.x * 28.0, huv.y * 85.0, plankRow)) * 4.5);

            // Raised wale bands (darker oiled oak timber straps)
            float isWale = smoothstep(0.022, 0.008, abs(huv.y - 0.43))
                         + smoothstep(0.022, 0.008, abs(huv.y - 0.61))
                         + smoothstep(0.018, 0.006, abs(huv.y - 0.78))
                         + smoothstep(0.022, 0.008, abs(huv.y - 0.97));
            isWale = clamp(isWale, 0.0, 1.0);

            // Jagged fracture crack lines across the lower & forward planking
            float crackNoise = snoise(vec3(huv.x * 22.0, huv.y * 65.0, 2.5));
            float crackLine = (1.0 - smoothstep(0.0, 0.045, abs(crackNoise))) * smoothstep(0.68, 0.20, huv.y);

            // Palette matching the reference renders:
            // Warm weathered oak/cedar upper hull, dark charcoal-brown wales, greenish-grey mossy bilge
            vec3 warmTimber = mix(vec3(0.42, 0.29, 0.20), vec3(0.58, 0.42, 0.29), plankVar) * grain;
            vec3 lowerBilge = mix(vec3(0.28, 0.29, 0.24), vec3(0.18, 0.22, 0.17), smoothstep(0.42, 0.08, huv.y)) * grain;
            vec3 waleTimber = vec3(0.18, 0.12, 0.08) * grain;

            float bilgeMix = smoothstep(0.44, 0.18, huv.y) * (0.65 + 0.35 * snoise(vec3(huv * 14.0, 1.0)));
            vec3 woodCol = mix(warmTimber, lowerBilge, bilgeMix);
            woodCol = mix(woodCol, waleTimber, isWale * 0.78);

            // Darken plank seams, treenail bolts, and fracture cracks
            woodCol *= (0.22 + 0.78 * seamY * seamX);
            woodCol *= (1.0 - crackLine * 0.75);

            // Darken around gunports and breach borders for weathered depth
            float breachProx = smoothstep(0.40, 0.15, huv.y) * smoothstep(0.35, 0.65, huv.x) * 0.28;
            woodCol *= (1.0 - breachProx);

            diffuseColor.rgb = woodCol * uShade;
          `
        )),
        Q(
          e,
          "#include <emissivemap_fragment>",
          `
            // Studio 3-point virtual lighting so every plank, wale, gunport & breach is crystal clear
            vec3 N = normalize(vShipN);
            vec3 keyDir = normalize(vec3(0.62, 0.68, 0.38));
            vec3 fillDir = normalize(vec3(-0.55, 0.35, 0.65));
            vec3 rimDir = normalize(vec3(0.0, 0.45, -0.88));
            float keyL = max(0.0, dot(N, keyDir)) * 0.52;
            float fillL = max(0.0, dot(N, fillDir)) * 0.28;
            float rimL = pow(max(0.0, dot(N, rimDir)), 2.0) * 0.25;
            float studioLit = 0.24 + keyL + fillL + rimL;
            totalEmissiveRadiance += diffuseColor.rgb * studioLit * 0.88;
          `
        )
      ),
    });
  }

  // 1b. Solid Structural Timber Material (masts, yardarms, decks, rudder, bulkheads, gunport lids, ribs)
  const timberMat = new MeshStandardMaterial({
    color: "#6b4c35",
    roughness: 0.84,
    metalness: 0.08,
  });

  if ($g && Q) {
    $g(timberMat, {
      key: "galleon-structural-timber-v3",
      uniforms: {
        ...mergedUniforms,
      },
      vertex: (e) => (
        (e = Q(e, "#include <common>", "varying vec3 vTimP; varying vec3 vTimN;")),
        Q(e, "#include <begin_vertex>", "vTimP = position; vTimN = normal;")
      ),
      fragment: (e) => (
        (e = Q(
          e,
          "#include <common>",
          "varying vec3 vTimP; varying vec3 vTimN; uniform float uShade;"
        )),
        (e = Q(
          e,
          "#include <color_fragment>",
          `
            float g = 0.82 + 0.18 * sin(vTimP.y * 28.0 + vTimP.z * 18.0 + snoise(vTimP * 4.5) * 2.5);
            float bands = smoothstep(0.04, 0.12, fract(vTimP.y * 1.8));
            vec3 baseWood = mix(vec3(0.28, 0.19, 0.13), vec3(0.48, 0.34, 0.23), g) * (0.78 + 0.22 * bands);
            diffuseColor.rgb = baseWood * uShade;
          `
        )),
        Q(
          e,
          "#include <emissivemap_fragment>",
          `
            vec3 N = normalize(vTimN);
            float keyL = max(0.0, dot(N, normalize(vec3(0.58, 0.72, 0.38)))) * 0.50;
            float fillL = max(0.0, dot(N, normalize(vec3(-0.55, 0.40, 0.65)))) * 0.26;
            totalEmissiveRadiance += diffuseColor.rgb * (0.25 + keyL + fillL) * 0.85;
          `
        )
      ),
    });
  }

  // 1c. Antique Baroque Gold Material (beakhead rails, ball finials, prow medallion, quarter gallery trim)
  const agedGoldMat = new MeshStandardMaterial({
    color: "#dfb14b",
    roughness: 0.32,
    metalness: 0.84,
    emissive: new Color("#6e5014"),
    emissiveIntensity: 0.55,
  });

  if ($g && Q) {
    $g(agedGoldMat, {
      key: "galleon-baroque-gold-v3",
      uniforms: {
        ...mergedUniforms,
      },
      vertex: (e) => (
        (e = Q(e, "#include <common>", "varying vec3 vGoldN; varying vec3 vGoldP;")),
        Q(e, "#include <begin_vertex>", "vGoldN = normal; vGoldP = position;")
      ),
      fragment: (e) => (
        (e = Q(
          e,
          "#include <common>",
          "varying vec3 vGoldN; varying vec3 vGoldP; uniform float uShade;"
        )),
        (e = Q(
          e,
          "#include <color_fragment>",
          `
            float patina = 0.78 + 0.22 * snoise(vGoldP * 6.0);
            diffuseColor.rgb = mix(vec3(0.55, 0.40, 0.12), vec3(0.92, 0.74, 0.28), patina) * uShade;
          `
        )),
        Q(
          e,
          "#include <emissivemap_fragment>",
          `
            vec3 N = normalize(vGoldN);
            float spec = pow(max(0.0, dot(N, normalize(vec3(0.5, 0.75, 0.45)))), 3.0);
            float fill = max(0.0, dot(N, normalize(vec3(-0.4, 0.5, 0.6))));
            totalEmissiveRadiance += vec3(0.95, 0.76, 0.30) * (0.30 + spec * 0.65 + fill * 0.25) * uShade;
          `
        )
      ),
    });
  }

  // 1d. Dark Forged Iron & Hemp Rigging Material (shrouds, ratlines, woolding bands, cannons, anchor)
  const darkIronMat = new MeshStandardMaterial({
    color: "#2c2824",
    roughness: 0.72,
    metalness: 0.45,
    emissive: new Color("#1d1a17"),
    emissiveIntensity: 0.45,
  });

  // 1e. Pitch-Dark Interior Hold Material (creates crisp dark contrast inside gunports and hull breaches)
  const darkHoldMat = new MeshStandardMaterial({
    color: "#050404",
    roughness: 0.98,
    metalness: 0.0,
    side: 2,
  });

  // 1f. Multi-pane Leaded Glass Window Material for Quarter Galleries & Stern Lanterns
  const windowGlassMat = new ShaderMaterial({
    uniforms: {
      uTime: timeUniform,
      uNika: nikaUniform,
      uShade: shadeUniform,
    },
    transparent: true,
    side: 2,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime, uNika, uShade;
      void main() {
        // Multi-pane leaded glass lattice matching the reference quarter gallery windows
        vec2 grid = fract(vUv * vec2(4.0, 6.0));
        float mullion = step(0.10, grid.x) * step(0.08, grid.y);
        float diag = step(0.06, abs(fract(vUv.x * 8.0 + vUv.y * 8.0) - 0.5));
        float pane = mullion * (0.75 + 0.25 * diag);
        float shimmer = 0.88 + 0.12 * sin(uTime * 2.5 + vUv.x * 10.0);
        vec3 glassCol = mix(vec3(0.22, 0.18, 0.14), vec3(0.76, 0.74, 0.68), pane) * shimmer * uShade;
        gl_FragColor = vec4(glassCol, 0.95);
      }
    `,
  });

  // 1g. Weathered Tattered Canvas Sail Material (matching the ragged beige/grey sails in the renders)
  const tatteredSailMat = new ShaderMaterial({
    uniforms: {
      uTime: timeUniform,
      uNika: nikaUniform,
      uShade: shadeUniform,
    },
    transparent: true,
    side: 2,
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vSailN;
      varying vec3 vSailP;
      uniform float uTime;
      void main() {
        vUv = uv;
        vec3 p = position;
        // Subtle cloth billow and ragged bottom edge flutter
        float bottomFree = smoothstep(0.85, 0.0, uv.y);
        float billow = sin(uv.x * 3.14159) * sin(uv.y * 3.14159) * 0.42;
        float flutter = sin(uTime * 1.8 + p.x * 0.9 + p.y * 0.6) * 0.08 * bottomFree;
        p.z += billow + flutter;
        vSailP = p;
        vSailN = normalize(normal + vec3(0.0, 0.0, 0.35));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying vec3 vSailN;
      varying vec3 vSailP;
      uniform float uTime, uNika, uShade;

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }
      float vnoise2(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash21(i);
        float b = hash21(i + vec2(1.0, 0.0));
        float c = hash21(i + vec2(0.0, 1.0));
        float d = hash21(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      float fbmSail(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
          v += a * vnoise2(p);
          p *= 2.04;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = vUv;

        // Deep jagged V-shaped rips & ragged tattered bottom silhouette matching reference images
        float shredWave = abs(fract(uv.x * 5.5 + 0.2) * 2.0 - 1.0) * 0.28
                        + abs(fract(uv.x * 13.0) * 2.0 - 1.0) * 0.12
                        + (fbmSail(uv * vec2(14.0, 8.0)) - 0.5) * 0.22;
        // Center V-split tear & side tatters
        float centerSplit = exp(-pow((uv.x - 0.46) / 0.09, 2.0)) * 0.38
                          + exp(-pow((uv.x - 0.74) / 0.06, 2.0)) * 0.28;
        float bottomCutoff = 0.14 + shredWave + centerSplit;
        if (uv.y < bottomCutoff) discard;

        // Side edge fraying
        float sideTear = fbmSail(uv * vec2(10.0, 18.0)) * 0.06;
        if (uv.x < sideTear || uv.x > 1.0 - sideTear) discard;

        // Internal tattered holes near the lower half of the sail
        float holeField = fbmSail(uv * vec2(9.0, 11.0) + vec2(2.3, 1.7));
        if (uv.y < 0.62 && holeField > 0.74) discard;

        // Vertical stitched canvas cloth seams & weave texture
        float panelSeam = smoothstep(0.0, 0.03, abs(fract(uv.x * 8.0) - 0.5));
        float weave = 0.92 + 0.08 * sin(uv.x * 180.0) * sin(uv.y * 180.0);
        float stain = fbmSail(uv * 5.5);

        // Aged parchment / weathered grey-beige canvas colors from reference renders
        vec3 canvasLight = vec3(0.74, 0.70, 0.62);
        vec3 canvasDark = vec3(0.46, 0.43, 0.38);
        vec3 col = mix(canvasDark, canvasLight, stain * 0.7 + 0.25) * weave * (0.88 + 0.12 * panelSeam);

        // Darken frayed edges around tears
        float tearEdge = smoothstep(bottomCutoff, bottomCutoff + 0.08, uv.y);
        col *= (0.55 + 0.45 * tearEdge);

        // 3D drape & fold shading
        float foldShade = 0.72 + 0.28 * sin(uv.x * 18.0 + sin(uv.y * 6.0) * 1.5);
        col *= foldShade * uShade;

        gl_FragColor = vec4(col, 0.98);
      }
    `,
  });

  // ============================================================================
  // 2. CONTINUOUS CURVED HULL PLANKING, INNER HOLD, RIBS, KEEL & BREACH SPLINTERS
  // ============================================================================
  const hullGroup = new Group();
  hullGroup.name = "galleon-hull";

  // 2a. Outer Continuous Curved Planked Hull Shells (Starboard +1 and Port -1)
  const uSegs = 128;
  const vSegs = 48;
  for (const side of [-1, 1]) {
    const shellGeo = new PlaneGeometry(1, 1, uSegs, vSegs);
    const pos = shellGeo.attributes.position;
    const uvs = shellGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const u = uvs.getX(i);
      const v = uvs.getY(i);
      const pt = evalGalleonHullPoint(u, v, side, 1.0, true);
      pos.setXYZ(i, pt.x, pt.y, pt.z);
    }
    shellGeo.computeVertexNormals();
    const shellMesh = new Mesh(shellGeo, hullSkinMat);
    shellMesh.castShadow = true;
    shellMesh.receiveShadow = true;
    hullGroup.add(shellMesh);

    // 2b. Solid Pitch-Dark Inner Hold Liner right behind the hull planking (so gunports and
    //     jagged breaches reveal a deep dark interior cavity rather than seeing through the ship)
    const innerGeo = new PlaneGeometry(1, 1, 48, 24);
    const iPos = innerGeo.attributes.position;
    const iUvs = innerGeo.attributes.uv;
    for (let i = 0; i < iPos.count; i++) {
      const u = iUvs.getX(i);
      const v = iUvs.getY(i);
      const pt = evalGalleonHullPoint(u, v, side, 0.90, false);
      iPos.setXYZ(i, pt.x, pt.y, pt.z);
    }
    innerGeo.computeVertexNormals();
    const innerMesh = new Mesh(innerGeo, darkHoldMat);
    hullGroup.add(innerMesh);
  }

  // 2c. Internal Curved Wooden Hull Ribs (visible inside the jagged plank breaches!)
  for (let ri = 0; ri < 16; ri++) {
    const u = 0.14 + (ri / 15) * 0.76;
    for (const side of [-1, 1]) {
      const ribPts = [];
      for (let vi = 0; vi <= 8; vi++) {
        const v = vi / 8;
        const pt = evalGalleonHullPoint(u, v, side, 0.95, false);
        ribPts.push(new Vector3(pt.x, pt.y, pt.z));
      }
      const ribCurve = new CatmullRomCurve3(ribPts);
      const ribMesh = new Mesh(new TubeGeometry(ribCurve, 14, 0.13, 6, false), timberMat);
      hullGroup.add(ribMesh);
    }
  }

  // 2d. 3D Jagged Splintered Plank Ends sticking into the lower & forward hull breaches
  const breachSplinters = [
    // Lower starboard main breach splinters
    { u: 0.53, v: 0.22, len: 1.35, tiltY: 0.08, tiltZ: 0.04 },
    { u: 0.52, v: 0.27, len: 1.65, tiltY: -0.06, tiltZ: -0.05 },
    { u: 0.54, v: 0.31, len: 1.15, tiltY: 0.12, tiltZ: 0.02 },
    { u: 0.77, v: 0.20, len: 1.45, tiltY: -0.09, tiltZ: -0.04 },
    { u: 0.76, v: 0.25, len: 1.75, tiltY: 0.05, tiltZ: 0.06 },
    { u: 0.78, v: 0.30, len: 1.25, tiltY: -0.11, tiltZ: -0.03 },
    // Forward bow breach splinters (in front of 1st gunport)
    { u: 0.83, v: 0.47, len: 1.10, tiltY: 0.14, tiltZ: 0.05 },
    { u: 0.82, v: 0.52, len: 1.30, tiltY: -0.08, tiltZ: -0.04 },
    { u: 0.89, v: 0.49, len: 1.05, tiltY: -0.12, tiltZ: 0.03 },
  ];
  for (const sp of breachSplinters) {
    for (const side of [-1, 1]) {
      const pt = evalGalleonHullPoint(sp.u, sp.v, side, 1.0, false);
      const plankShard = new Mesh(new BoxGeometry(0.11, 0.16, sp.len), timberMat);
      plankShard.position.set(pt.x, pt.y, pt.z);
      plankShard.rotation.set(sp.tiltZ, side * sp.tiltY, 0);
      hullGroup.add(plankShard);
    }
  }

  // 2e. Heavy Curved Bow Stempost (Cutwater) & Longitudinal Keel Timber
  const stemCurve = new CatmullRomCurve3([
    new Vector3(0, -0.2, -15.5),
    new Vector3(0, -0.25, -5.0),
    new Vector3(0, -0.2, 6.0),
    new Vector3(0, 0.1, 13.8),
    new Vector3(0, 1.6, 16.5),
    new Vector3(0, 3.8, 18.2),
    new Vector3(0, 6.4, 19.1),
  ]);
  const stemMesh = new Mesh(new TubeGeometry(stemCurve, 48, 0.32, 8, false), timberMat);
  stemMesh.castShadow = true;
  hullGroup.add(stemMesh);

  // 2f. High Flat Transom Stern Planking Panel (u = 0)
  const transomGeo = new PlaneGeometry(1, 1, 24, 28);
  const tPos = transomGeo.attributes.position;
  const tUvs = transomGeo.attributes.uv;
  for (let i = 0; i < tPos.count; i++) {
    const sx = (tUvs.getX(i) - 0.5) * 2.0; // -1 to +1
    const v = tUvs.getY(i);
    const edgePt = evalGalleonHullPoint(0.0, v, 1, 1.0, false);
    const archCrown = Math.cos(sx * Math.PI * 0.5) * 0.48 * smoothstepJS(0.65, 1.0, v);
    const tuck = smoothstepJS(0.15, 0.42, v);
    tPos.setXYZ(
      i,
      sx * edgePt.halfBeam * (0.35 + 0.65 * tuck),
      edgePt.y + archCrown,
      edgePt.z - 0.12 * Math.cos(sx * Math.PI * 0.5)
    );
  }
  transomGeo.computeVertexNormals();
  const transomMesh = new Mesh(transomGeo, timberMat);
  transomMesh.castShadow = true;
  hullGroup.add(transomMesh);

  // 2g. Multi-level Wooden Decks (Waist Deck, Stepped Forecastle Deck, Quarterdeck & Poop Deck)
  const waistDeck = new Mesh(new BoxGeometry(8.2, 0.24, 16.5), timberMat);
  waistDeck.position.set(0, 4.4, 0.5);
  hullGroup.add(waistDeck);

  const foreDeck = new Mesh(new BoxGeometry(6.4, 0.24, 7.8), timberMat);
  foreDeck.position.set(0, 5.55, 12.6);
  hullGroup.add(foreDeck);

  const quarterDeck = new Mesh(new BoxGeometry(7.2, 0.24, 7.5), timberMat);
  quarterDeck.position.set(0, 5.75, -9.2);
  hullGroup.add(quarterDeck);

  const poopDeck = new Mesh(new BoxGeometry(6.0, 0.24, 6.8), timberMat);
  poopDeck.position.set(0, 7.25, -14.6);
  hullGroup.add(poopDeck);

  // ============================================================================
  // 3. ROW OF 7 SQUARE GUNPORTS PER SIDE WITH PROPPED-OPEN WOODEN PORT LIDS
  // ============================================================================
  const gunportsGroup = new Group();
  gunportsGroup.name = "galleon-gunports";

  for (let gi = 0; gi < 7; gi++) {
    const gu = 0.19 + gi * 0.10;
    for (const side of [-1, 1]) {
      const pt = evalGalleonHullPoint(gu, 0.52, side, 1.0, false);
      const ptNext = evalGalleonHullPoint(gu + 0.02, 0.52, side, 1.0, false);
      const yaw = Math.atan2(ptNext.x - pt.x, ptNext.z - pt.z);

      const portUnit = new Group();
      portUnit.position.set(pt.x, pt.y, pt.z);
      portUnit.rotation.y = yaw + (side === 1 ? Math.PI / 2 : -Math.PI / 2);

      // Recessed wooden gunport sill & frame
      const frameBox = new Mesh(new BoxGeometry(0.95, 0.88, 0.36), timberMat);
      frameBox.position.set(0, 0, -0.14);
      portUnit.add(frameBox);

      const darkOpening = new Mesh(new BoxGeometry(0.78, 0.72, 0.40), darkHoldMat);
      darkOpening.position.set(0, 0, -0.14);
      portUnit.add(darkOpening);

      // Propped-open wooden gunport lid above the opening (matching reference images 2, 3, 4)
      const lidPivot = new Group();
      lidPivot.position.set(0, 0.44, 0.06);
      lidPivot.rotation.x = -1.05; // Propped open outward at ~60 degrees

      const lidBoard = new Mesh(new BoxGeometry(0.88, 0.76, 0.11), timberMat);
      lidBoard.position.set(0, 0.36, 0);
      lidBoard.castShadow = true;
      lidPivot.add(lidBoard);

      // Iron hinge straps on lid
      for (const hx of [-0.26, 0.26]) {
        const strap = new Mesh(new BoxGeometry(0.06, 0.64, 0.03), darkIronMat);
        strap.position.set(hx, 0.34, 0.06);
        lidPivot.add(strap);
      }
      portUnit.add(lidPivot);

      // Recessed dark iron cannon barrel inside gunport
      const cannonBarrel = new Mesh(new CylinderGeometry(0.10, 0.15, 1.15, 8), darkIronMat);
      cannonBarrel.rotation.x = Math.PI / 2;
      cannonBarrel.position.set(0, -0.08, 0.15);
      portUnit.add(cannonBarrel);

      gunportsGroup.add(portUnit);
    }
  }
  hullGroup.add(gunportsGroup);

  // ============================================================================
  // 4. ORNATE BAROQUE GOLDEN BEAKHEAD RAILS, BALL FINIALS & PROW MEDALLION
  //    (Direct match to reference image 2: media_1793737976730_5aa3a67a.jpg)
  // ============================================================================
  const bowGroup = new Group();
  bowGroup.name = "forecastle-and-golden-beakhead";

  // 4a. Large Golden Prow Medallion / Orb Figurehead with Upper Ball Finial & Volute Scrolls
  const prowOrnament = new Group();
  prowOrnament.position.set(0, 5.45, 19.15);

  // Main embossed golden medallion sphere
  const mainOrb = new Mesh(new SphereGeometry(0.62, 20, 16), agedGoldMat);
  mainOrb.scale.set(0.88, 1.0, 1.0);
  mainOrb.castShadow = true;
  prowOrnament.add(mainOrb);

  // Embossed concentric gold collar ring on the medallion
  const orbCollar = new Mesh(new TorusGeometry(0.56, 0.09, 10, 24), agedGoldMat);
  orbCollar.rotation.y = Math.PI / 2;
  prowOrnament.add(orbCollar);

  // Upper crowning golden sphere finial right on top of the prow medallion (Image 2!)
  const crownBall = new Mesh(new SphereGeometry(0.34, 16, 14), agedGoldMat);
  crownBall.position.set(0, 0.82, 0.08);
  crownBall.castShadow = true;
  prowOrnament.add(crownBall);

  const crownNeck = new Mesh(new CylinderGeometry(0.18, 0.26, 0.28, 12), agedGoldMat);
  crownNeck.position.set(0, 0.54, 0.04);
  prowOrnament.add(crownNeck);

  // Lower S-curved Baroque Golden Volute Scrolls beneath the prow medallion
  for (const side of [-1, 1]) {
    const scrollCurve = new CatmullRomCurve3([
      new Vector3(side * 0.32, -0.35, -0.15),
      new Vector3(side * 0.42, -0.85, 0.12),
      new Vector3(side * 0.30, -1.35, -0.25),
      new Vector3(side * 0.18, -1.75, -0.65),
    ]);
    const scrollMesh = new Mesh(new TubeGeometry(scrollCurve, 20, 0.13, 8, false), agedGoldMat);
    prowOrnament.add(scrollMesh);
  }

  // Hanging bow cable loop below the prow medallion (visible on left of Image 2)
  const bowLoopCurve = new CatmullRomCurve3([
    new Vector3(0, -0.55, 0.35),
    new Vector3(0, -1.25, 0.65),
    new Vector3(0, -1.55, 0.15),
    new Vector3(0, -1.15, -0.35),
  ]);
  const bowLoop = new Mesh(new TubeGeometry(bowLoopCurve, 18, 0.045, 6, false), darkIronMat);
  prowOrnament.add(bowLoop);

  bowGroup.add(prowOrnament);

  // 4b. Double Sweeping Curved Golden Beakhead Rails (Port & Starboard) with Vertical Struts
  for (const side of [-1, 1]) {
    const upperRailPts = [
      new Vector3(side * 2.85, 6.25, 13.8),
      new Vector3(side * 2.45, 5.55, 15.4),
      new Vector3(side * 1.75, 5.15, 17.0),
      new Vector3(side * 0.68, 5.35, 18.7),
    ];
    const lowerRailPts = [
      new Vector3(side * 2.75, 5.45, 13.6),
      new Vector3(side * 2.30, 4.78, 15.3),
      new Vector3(side * 1.58, 4.48, 16.9),
      new Vector3(side * 0.52, 4.82, 18.6),
    ];
    const upperCurve = new CatmullRomCurve3(upperRailPts);
    const lowerCurve = new CatmullRomCurve3(lowerRailPts);

    const upperRail = new Mesh(new TubeGeometry(upperCurve, 28, 0.14, 8, false), agedGoldMat);
    const lowerRail = new Mesh(new TubeGeometry(lowerCurve, 28, 0.12, 8, false), agedGoldMat);
    upperRail.castShadow = true;
    lowerRail.castShadow = true;
    bowGroup.add(upperRail, lowerRail);

    // 7 Vertical carved golden struts connecting the upper and lower beakhead rails
    for (let si = 1; si <= 7; si++) {
      const t = si / 8;
      const pTop = upperCurve.getPoint(t);
      const pBtm = lowerCurve.getPoint(t);
      const strutCurve = new CatmullRomCurve3([pTop, pBtm]);
      const strut = new Mesh(new TubeGeometry(strutCurve, 6, 0.065, 6, false), agedGoldMat);
      bowGroup.add(strut);
    }

    // Large Golden Sphere Finial at the top aft end of the beakhead rail (prominent in Image 2!)
    const cornerFinial = new Mesh(new SphereGeometry(0.34, 16, 14), agedGoldMat);
    cornerFinial.position.set(side * 2.85, 6.62, 13.8);
    cornerFinial.castShadow = true;
    bowGroup.add(cornerFinial);

    const cornerPedestal = new Mesh(new CylinderGeometry(0.16, 0.22, 0.28, 10), agedGoldMat);
    cornerPedestal.position.set(side * 2.85, 6.32, 13.8);
    bowGroup.add(cornerPedestal);
  }

  // 4c. Forecastle Front Bulkhead Wall (with recessed timber panels) & Golden Ball Finial Railing
  const foreBulkhead = new Mesh(new BoxGeometry(5.4, 1.5, 0.35), timberMat);
  foreBulkhead.position.set(0, 5.6, 13.6);
  bowGroup.add(foreBulkhead);

  for (let pi = -2; pi <= 2; pi++) {
    const panel = new Mesh(new BoxGeometry(0.75, 1.05, 0.42), darkHoldMat);
    panel.position.set(pi * 1.0, 5.6, 13.6);
    bowGroup.add(panel);
  }

  // Forecastle upper railing with Golden Ball Finials on wooden posts (visible in Image 2)
  const foreRailBar = new Mesh(new BoxGeometry(5.5, 0.14, 0.18), timberMat);
  foreRailBar.position.set(0, 6.55, 13.6);
  bowGroup.add(foreRailBar);

  for (let fi = -2; fi <= 2; fi++) {
    const fx = fi * 1.05;
    const post = new Mesh(new CylinderGeometry(0.06, 0.07, 0.45, 8), timberMat);
    post.position.set(fx, 6.35, 13.6);
    bowGroup.add(post);

    const ball = new Mesh(new SphereGeometry(0.14, 12, 10), agedGoldMat);
    ball.position.set(fx, 6.72, 13.6);
    bowGroup.add(ball);
  }

  // Side forecastle rails with golden ball finials
  for (const side of [-1, 1]) {
    for (let zi = 0; zi < 3; zi++) {
      const fz = 10.2 + zi * 1.4;
      const pt = evalGalleonHullPoint(0.74 + zi * 0.04, 1.0, side, 1.0, false);
      const post = new Mesh(new CylinderGeometry(0.06, 0.07, 0.42, 8), timberMat);
      post.position.set(pt.x, pt.y + 0.2, fz);
      bowGroup.add(post);

      const ball = new Mesh(new SphereGeometry(0.13, 10, 8), agedGoldMat);
      ball.position.set(pt.x, pt.y + 0.46, fz);
      bowGroup.add(ball);
    }
  }

  // 4d. Long Angled Wooden Bowsprit with Iron Woolding Bands, Spritsail Yard & Tattered Spritsail
  const bowspritCurve = new CatmullRomCurve3([
    new Vector3(0, 5.0, 15.5),
    new Vector3(0, 7.1, 21.8),
    new Vector3(0, 9.6, 28.8),
  ]);
  const bowspritSpar = new Mesh(new TubeGeometry(bowspritCurve, 28, 0.28, 10, false), timberMat);
  bowspritSpar.castShadow = true;
  bowGroup.add(bowspritSpar);

  // Dark rope/iron woolding bands along the bowsprit
  for (let wi = 1; wi <= 5; wi++) {
    const wp = bowspritCurve.getPoint(wi / 6);
    const band = new Mesh(new CylinderGeometry(0.31, 0.31, 0.22, 10), darkIronMat);
    band.position.copy(wp);
    band.rotation.x = Math.PI / 2 - 0.34;
    bowGroup.add(band);
  }

  // Cross Spritsail Yardarm & Draped Tattered Spritsail underneath the bowsprit (Image 2 & 3)
  const spritYard = new Mesh(new CylinderGeometry(0.11, 0.11, 7.8, 10), timberMat);
  spritYard.rotation.z = Math.PI / 2;
  spritYard.position.set(0, 7.15, 22.4);
  bowGroup.add(spritYard);

  const spritSailGeo = new PlaneGeometry(7.2, 2.2, 24, 12);
  const sPos = spritSailGeo.attributes.position;
  for (let i = 0; i < sPos.count; i++) {
    const sx = sPos.getX(i);
    const sy = sPos.getY(i);
    const swag = Math.cos((sx / 3.6) * Math.PI) * 0.35 * (0.5 - sy / 2.2);
    sPos.setY(i, sy - swag);
  }
  spritSailGeo.computeVertexNormals();
  const spritSail = new Mesh(spritSailGeo, tatteredSailMat);
  spritSail.position.set(0, 6.1, 22.4);
  bowGroup.add(spritSail);

  hullGroup.add(bowGroup);

  // ============================================================================
  // 5. TWO-TIER STERNCASTLE BULKHEAD, QUARTER GALLERIES, TRANSOM & RUDDER
  //    (Direct match to Reference Images 2, 3, and 4!)
  // ============================================================================
  const sternGroup = new Group();
  sternGroup.name = "sterncastle-and-quarter-galleries";

  // 5a. Forward-facing Two-Tier Sterncastle Cabin Bulkhead (visible in Image 2!)
  // Lower tier wall with open dark cabin doorway
  const lowerCabinWall = new Mesh(new BoxGeometry(6.8, 1.8, 0.4), timberMat);
  lowerCabinWall.position.set(0, 5.1, -6.2);
  sternGroup.add(lowerCabinWall);

  const cabinDoorway = new Mesh(new BoxGeometry(1.65, 1.45, 0.48), darkHoldMat);
  cabinDoorway.position.set(0, 4.95, -6.2);
  sternGroup.add(cabinDoorway);

  // Upper tier poop cabin bulkhead with 3 Gold-Framed Arched Windows (Image 2!)
  const upperCabinWall = new Mesh(new BoxGeometry(6.2, 1.65, 0.4), timberMat);
  upperCabinWall.position.set(0, 6.6, -9.6);
  sternGroup.add(upperCabinWall);

  for (const wx of [-1.35, 0, 1.35]) {
    // Gold window frame
    const wFrame = new Mesh(new BoxGeometry(0.82, 0.92, 0.46), agedGoldMat);
    wFrame.position.set(wx, 6.62, -9.6);
    sternGroup.add(wFrame);

    // Dark recessed cabin glass
    const wHole = new Mesh(new BoxGeometry(0.64, 0.74, 0.50), darkHoldMat);
    wHole.position.set(wx, 6.62, -9.6);
    sternGroup.add(wHole);
  }

  // Balustraded wooden railing above the 3 cabin windows (Image 2)
  const poopFrontRail = new Mesh(new BoxGeometry(6.2, 0.14, 0.18), timberMat);
  poopFrontRail.position.set(0, 7.85, -9.6);
  sternGroup.add(poopFrontRail);

  for (let bi = -4; bi <= 4; bi++) {
    const bPost = new Mesh(new CylinderGeometry(0.055, 0.065, 0.48, 8), timberMat);
    bPost.position.set(bi * 0.68, 7.6, -9.6);
    sternGroup.add(bPost);
  }

  // 5b. PROTRUDING QUARTER GALLERY BAY WINDOW TURRETS (Port & Starboard Stern Quarters)
  //     Matches Images 2, 3, 4: 3 leaded-glass windows framed in gold, domed dark wood roof,
  //     carved gold lower corbel, and tall gold scroll crest rising to the stern lantern!
  for (const side of [-1, 1]) {
    const gallery = new Group();
    gallery.position.set(side * 3.35, 5.55, -14.8);

    // Tiered Golden Lower Corbel Bracket tapering down into the hull
    const corbelTop = new Mesh(new CylinderGeometry(0.92, 0.55, 0.55, 8), agedGoldMat);
    corbelTop.position.set(0, -1.05, 0);
    gallery.add(corbelTop);

    const corbelBtm = new Mesh(new CylinderGeometry(0.55, 0.18, 0.65, 8), agedGoldMat);
    corbelBtm.position.set(0, -1.60, 0.1);
    gallery.add(corbelBtm);

    // Golden sill & cornice molding bands above and below the 3 gallery windows
    const goldSill = new Mesh(new CylinderGeometry(1.02, 0.96, 0.22, 8), agedGoldMat);
    goldSill.position.set(0, -0.68, 0);
    gallery.add(goldSill);

    const goldCornice = new Mesh(new CylinderGeometry(1.04, 1.00, 0.22, 8), agedGoldMat);
    goldCornice.position.set(0, 0.68, 0);
    gallery.add(goldCornice);

    // Multi-pane leaded glass bay window drum
    const glassDrum = new Mesh(new CylinderGeometry(0.92, 0.92, 1.18, 8), windowGlassMat);
    gallery.add(glassDrum);

    // Golden vertical pilasters framing the 3 outer bay windows
    for (let pi = 0; pi < 5; pi++) {
      const ang = (side === 1 ? -0.35 : 0.65) * Math.PI + (pi / 4) * Math.PI * 0.75;
      const pilaster = new Mesh(new BoxGeometry(0.14, 1.24, 0.14), agedGoldMat);
      pilaster.position.set(Math.cos(ang) * 0.94, 0, Math.sin(ang) * 0.94);
      pilaster.rotation.y = -ang;
      gallery.add(pilaster);
    }

    // Domed dark-wood ogee canopy roof above the quarter gallery
    const domeLower = new Mesh(new CylinderGeometry(0.68, 1.04, 0.65, 8), timberMat);
    domeLower.position.set(0, 1.10, 0);
    gallery.add(domeLower);

    const domeUpper = new Mesh(new CylinderGeometry(0.16, 0.68, 0.55, 8), timberMat);
    domeUpper.position.set(0, 1.65, 0.08);
    gallery.add(domeUpper);

    // Tall Carved Golden Scroll Crest rising from the gallery roof up the stern bulwark (Image 2 & 4)
    const crestCurve = new CatmullRomCurve3([
      new Vector3(0, 1.75, -0.1),
      new Vector3(-side * 0.18, 2.35, -0.65),
      new Vector3(-side * 0.35, 2.95, -1.25),
      new Vector3(-side * 0.45, 3.35, -1.85),
    ]);
    const crestScroll = new Mesh(new TubeGeometry(crestCurve, 18, 0.16, 8, false), agedGoldMat);
    gallery.add(crestScroll);

    sternGroup.add(gallery);
  }

  // 5c. High Transom Golden Moldings & 3 Stern Lanterns (Left, Center, Right - Image 4)
  const taffrailCurve = new CatmullRomCurve3([
    new Vector3(-2.85, 8.25, -18.1),
    new Vector3(-1.45, 8.65, -18.2),
    new Vector3(0, 8.85, -18.25),
    new Vector3(1.45, 8.65, -18.2),
    new Vector3(2.85, 8.25, -18.1),
  ]);
  const taffrailMolding = new Mesh(new TubeGeometry(taffrailCurve, 24, 0.15, 8, false), agedGoldMat);
  sternGroup.add(taffrailMolding);

  const lanternCoords = [
    [-2.75, 8.75, -18.1],
    [0.0, 9.25, -18.25],
    [2.75, 8.75, -18.1],
  ];
  for (const [lx, ly, lz] of lanternCoords) {
    const lantern = new Group();
    lantern.position.set(lx, ly, lz);

    const post = new Mesh(new CylinderGeometry(0.06, 0.08, 0.42, 8), darkIronMat);
    post.position.set(0, -0.35, 0);
    lantern.add(post);

    const baseCup = new Mesh(new CylinderGeometry(0.24, 0.12, 0.22, 6), agedGoldMat);
    baseCup.position.set(0, -0.12, 0);
    lantern.add(baseCup);

    const glassBody = new Mesh(new CylinderGeometry(0.32, 0.24, 0.58, 6), windowGlassMat);
     glassBody.position.set(0, 0.26, 0);
    lantern.add(glassBody);

    const topRoof = new Mesh(new CylinderGeometry(0.05, 0.36, 0.28, 6), agedGoldMat);
    topRoof.position.set(0, 0.68, 0);
    lantern.add(topRoof);

    sternGroup.add(lantern);
  }

  // 5d. MASSIVE WOODEN STERN RUDDER (Directly visible below transom in Images 3 & 4)
  const rudderGroup = new Group();
  rudderGroup.position.set(0, 2.1, -15.6);

  const rudderBlade = new Mesh(new BoxGeometry(0.34, 4.2, 2.35), timberMat);
  rudderBlade.position.set(0, -0.2, -1.15);
  rudderBlade.castShadow = true;
  rudderGroup.add(rudderBlade);

  for (let pi = 0; pi < 4; pi++) {
    const pintle = new Mesh(new BoxGeometry(0.40, 0.14, 2.45), darkIronMat);
    pintle.position.set(0, -1.6 + pi * 1.05, -1.15);
    rudderGroup.add(pintle);
  }
  sternGroup.add(rudderGroup);
  hullGroup.add(sternGroup);

  // ============================================================================
  // 6. THREE STEPPED WOODEN MASTS, CROW'S NESTS, CHAINWALES, SHROUD LADDERS & SAILS
  //    (Direct match to Reference Images 2, 3, 4!)
  // ============================================================================
  const riggingGroup = new Group();
  riggingGroup.name = "masts-sails-and-rigging";

  const mastSpecs = [
    {
      name: "foremast",
      u: 0.72,
      z: 8.2,
      baseY: 4.8,
      lowerH: 10.5,
      topH: 7.5,
      rBase: 0.42,
      rTop: 0.24,
      crowsNestY: 9.8,
      yards: [
        { y: 7.8, width: 10.8, sailType: "draped-fore" },
        { y: 13.8, width: 7.2, sailType: "shred-top" },
      ],
    },
    {
      name: "mainmast",
      u: 0.48,
      z: -0.6,
      baseY: 4.2,
      lowerH: 12.2,
      topH: 8.8,
      rBase: 0.48,
      rTop: 0.26,
      crowsNestY: 11.4,
      yards: [
        { y: 8.8, width: 13.6, sailType: "tattered-main" },
        { y: 15.6, width: 8.6, sailType: "none" },
      ],
    },
    {
      name: "mizzenmast",
      u: 0.23,
      z: -9.6,
      baseY: 5.5,
      lowerH: 8.6,
      topH: 6.4,
      rBase: 0.34,
      rTop: 0.18,
      crowsNestY: 8.0,
      yards: [
        { y: 9.2, width: 8.2, sailType: "furled-mizzen" },
      ],
    },
  ];

  // Helper to create a rigging line between two 3D points
  const addRopeLine = (parent, pA, pB, radius = 0.022) => {
    const curve = new CatmullRomCurve3([pA, pB]);
    const mesh = new Mesh(new TubeGeometry(curve, 6, radius, 4, false), darkIronMat);
    parent.add(mesh);
  };

  for (const spec of mastSpecs) {
    const mastUnit = new Group();
    mastUnit.position.set(0, spec.baseY, spec.z);

    // 6a. Lower Mast Spar + Iron/Rope Woolding Bands
    const lowerSpar = new Mesh(
      new CylinderGeometry(spec.rBase * 0.78, spec.rBase, spec.lowerH, 14),
      timberMat
    );
    lowerSpar.position.set(0, spec.lowerH / 2, 0);
    lowerSpar.castShadow = true;
    mastUnit.add(lowerSpar);

    for (let bi = 1; bi <= 5; bi++) {
      const by = (bi / 6) * spec.crowsNestY;
      const band = new Mesh(
        new CylinderGeometry(spec.rBase * 0.92, spec.rBase * 0.92, 0.22, 12),
        darkIronMat
      );
      band.position.set(0, by, 0);
      mastUnit.add(band);
    }

    // 6b. Stepped Topmast Spar (offset slightly forward of lower masthead)
    const topSpar = new Mesh(
      new CylinderGeometry(spec.rTop * 0.55, spec.rTop, spec.topH, 12),
      timberMat
    );
    topSpar.position.set(0, spec.crowsNestY + spec.topH / 2 - 0.5, 0.22);
    topSpar.castShadow = true;
    mastUnit.add(topSpar);

    // 6c. Round Wooden Crow's Nest / Fighting Top Platform with Rim & Brackets
    const nestGroup = new Group();
    nestGroup.position.set(0, spec.crowsNestY, 0.1);

    const nestFloor = new Mesh(new CylinderGeometry(1.35, 1.15, 0.24, 16), timberMat);
    nestFloor.castShadow = true;
    nestGroup.add(nestFloor);

    const nestRim = new Mesh(new TorusGeometry(1.38, 0.10, 8, 20), timberMat);
    nestRim.rotation.x = Math.PI / 2;
    nestRim.position.set(0, 0.32, 0);
    nestGroup.add(nestRim);

    // Support struts & futtock shrouds under crow's nest
    for (let ri = 0; ri < 8; ri++) {
      const ang = (ri / 8) * Math.PI * 2;
      const pRim = new Vector3(Math.cos(ang) * 1.25, 0, Math.sin(ang) * 1.25);
      const pMast = new Vector3(Math.cos(ang) * spec.rBase * 0.85, -1.35, Math.sin(ang) * spec.rBase * 0.85);
      addRopeLine(nestGroup, pRim, pMast, 0.032);
    }
    mastUnit.add(nestGroup);

    // Upper Crosstrees / Topgallant cap
    const upperCapY = spec.crowsNestY + spec.topH * 0.52;
    const upperCap = new Mesh(new CylinderGeometry(0.75, 0.62, 0.22, 12), timberMat);
    upperCap.position.set(0, upperCapY, 0.22);
    mastUnit.add(upperCap);

    // 6d. Horizontal Yardarms & Custom Sculpted Tattered Sails
    for (const ySpec of spec.yards) {
      const yardGroup = new Group();
      yardGroup.position.set(0, ySpec.y, 0.36);

      // Tapered wooden yardarm spar
      const yardHalf = ySpec.width / 2;
      const yardCurve = new CatmullRomCurve3([
        new Vector3(-yardHalf, 0, 0),
        new Vector3(0, 0.08, 0.08),
        new Vector3(yardHalf, 0, 0),
      ]);
      const yardSpar = new Mesh(new TubeGeometry(yardCurve, 20, 0.15, 8, false), timberMat);
      yardSpar.castShadow = true;
      yardGroup.add(yardSpar);

      // Diagonal yardarm lifts up to masthead
      addRopeLine(
        mastUnit,
        new Vector3(-yardHalf * 0.92, ySpec.y, 0.36),
        new Vector3(0, ySpec.y + 2.6, 0.15),
        0.02
      );
      addRopeLine(
        mastUnit,
        new Vector3(yardHalf * 0.92, ySpec.y, 0.36),
        new Vector3(0, ySpec.y + 2.6, 0.15),
        0.02
      );

      // Sculpted Tattered Sail Geometry matching the exact shapes in Images 2, 3, 4
      if (ySpec.sailType === "draped-fore") {
        // Foremast draped swag sail with long ragged triangular side tails (Image 2 & 3!)
        const sW = ySpec.width * 0.90;
        const sH = 4.6;
        const sGeo = new PlaneGeometry(sW, sH, 36, 20);
        const sPos = sGeo.attributes.position;
        const sUvs = sGeo.attributes.uv;
        for (let i = 0; i < sPos.count; i++) {
          const u = sUvs.getX(i); // 0 to 1 across width
          const v = sUvs.getY(i); // 0 (bottom) to 1 (top at yardarm)
          // Two gathered festoon swags in the middle, longer hanging tattered wings on left & right
          const gatherProfile =
            0.42 +
            0.58 * Math.pow(Math.abs(u - 0.5) * 2.0, 1.4) +
            0.22 * Math.sin(u * Math.PI * 3.0);
          const actualDrop = (1.0 - v) * sH * Math.min(1.15, gatherProfile);
          const billowZ = Math.sin((1.0 - v) * Math.PI) * (0.45 + 0.35 * Math.sin(u * Math.PI * 2.0));
          sPos.setXYZ(i, (u - 0.5) * sW, -actualDrop, billowZ);
        }
        sGeo.computeVertexNormals();
        const sailMesh = new Mesh(sGeo, tatteredSailMat);
        yardGroup.add(sailMesh);
      } else if (ySpec.sailType === "tattered-main") {
        // Mainmast massive square course sail with deep V-tears and ragged bottom (Image 2, 3, 4!)
        const sW = ySpec.width * 0.92;
        const sH = 6.2;
        const sGeo = new PlaneGeometry(sW, sH, 42, 24);
        const sPos = sGeo.attributes.position;
        const sUvs = sGeo.attributes.uv;
        for (let i = 0; i < sPos.count; i++) {
          const u = sUvs.getX(i);
          const v = sUvs.getY(i);
          const drop = (1.0 - v) * sH * (0.85 + 0.20 * Math.sin(u * Math.PI * 2.5));
          const billowZ = Math.sin((1.0 - v) * Math.PI * 0.85) * 0.68 * Math.sin(u * Math.PI);
          sPos.setXYZ(i, (u - 0.5) * sW, -drop, billowZ);
        }
        sGeo.computeVertexNormals();
        const sailMesh = new Mesh(sGeo, tatteredSailMat);
        yardGroup.add(sailMesh);
      } else if (ySpec.sailType === "shred-top") {
        // Upper fore-topsail torn triangular shred on one side (Image 2!)
        const sW = ySpec.width * 0.45;
        const sH = 3.4;
        const sGeo = new PlaneGeometry(sW, sH, 18, 14);
        const sPos = sGeo.attributes.position;
        const sUvs = sGeo.attributes.uv;
        for (let i = 0; i < sPos.count; i++) {
          const u = sUvs.getX(i);
          const v = sUvs.getY(i);
          const taper = 1.0 - u * 0.65;
          sPos.setXYZ(i, (u - 0.5) * sW - 1.2, -(1.0 - v) * sH * taper, Math.sin((1.0 - v) * Math.PI) * 0.3);
        }
        sGeo.computeVertexNormals();
        const sailMesh = new Mesh(sGeo, tatteredSailMat);
        yardGroup.add(sailMesh);
      } else if (ySpec.sailType === "furled-mizzen") {
        // Mizzen narrow furled/tattered sail strip beneath yardarm (Images 2, 3, 4)
        const sW = ySpec.width * 0.86;
        const sH = 2.1;
        const sGeo = new PlaneGeometry(sW, sH, 24, 10);
        const sPos = sGeo.attributes.position;
        const sUvs = sGeo.attributes.uv;
        for (let i = 0; i < sPos.count; i++) {
          const u = sUvs.getX(i);
          const v = sUvs.getY(i);
          const drop = (1.0 - v) * sH * (0.45 + 0.55 * Math.abs(Math.sin(u * Math.PI * 2.0)));
          sPos.setXYZ(i, (u - 0.5) * sW, -drop, Math.sin((1.0 - v) * Math.PI) * 0.24);
        }
        sGeo.computeVertexNormals();
        const sailMesh = new Mesh(sGeo, tatteredSailMat);
        yardGroup.add(sailMesh);
      }

      mastUnit.add(yardGroup);
    }

    // 6e. Projecting Chainwales (Channels), Deadeyes & Lower + Upper Shroud Ratline Ladders
    const hullPtPort = evalGalleonHullPoint(spec.u, 0.84, -1, 1.0, false);
    const hullWidthAtMast = Math.abs(hullPtPort.x);

    for (const side of [-1, 1]) {
      const chainwaleY = hullPtPort.y - spec.baseY;
      const chainwaleX = side * (hullWidthAtMast + 0.42);
      const spreadZ = 2.55;

      // Projecting wooden chainwale ledge on the outer hull
      const ledge = new Mesh(new BoxGeometry(0.75, 0.22, spreadZ + 0.7), timberMat);
      ledge.position.set(side * (hullWidthAtMast + 0.25), chainwaleY, 0);
      ledge.castShadow = true;
      mastUnit.add(ledge);

      // 5 Lower Shroud Ropes + Deadeyes on the Chainwale
      const numShrouds = 5;
      for (let si = 0; si < numShrouds; si++) {
        const sz = ((si / (numShrouds - 1)) - 0.5) * spreadZ;
        // Deadeye disc & chainplate strap
        const deadeye = new Mesh(new CylinderGeometry(0.14, 0.14, 0.09, 10), timberMat);
        deadeye.rotation.z = Math.PI / 2;
        deadeye.position.set(chainwaleX, chainwaleY + 0.22, sz);
        mastUnit.add(deadeye);

        const chainplate = new Mesh(new BoxGeometry(0.06, 0.85, 0.06), darkIronMat);
        chainplate.position.set(chainwaleX - side * 0.12, chainwaleY - 0.35, sz);
        chainplate.rotation.z = side * 0.18;
        mastUnit.add(chainplate);

        // Shroud rope angling from deadeye up to the crow's nest
        const pBottom = new Vector3(chainwaleX, chainwaleY + 0.25, sz);
        const pTop = new Vector3(side * 0.85, spec.crowsNestY - 0.1, sz * 0.22);
        addRopeLine(mastUnit, pBottom, pTop, 0.028);
      }

      // 20 Horizontal Ratline Rungs across the lower shrouds (forming the iconic rope ladders)
      const numRatlines = 20;
      for (let ri = 1; ri < numRatlines; ri++) {
        const t = ri / numRatlines;
        const ry = chainwaleY + 0.25 + (spec.crowsNestY - 0.1 - (chainwaleY + 0.25)) * t;
        const rx = chainwaleX + (side * 0.85 - chainwaleX) * t;
        const curZSpan = spreadZ * (1.0 - t * 0.78);
        const rung = new Mesh(new BoxGeometry(0.03, 0.024, curZSpan), darkIronMat);
        rung.position.set(rx, ry, 0);
        mastUnit.add(rung);
      }

      // Upper Topmast Shroud Ladders (from crow's nest rim up to upper crosstrees)
      const topSpanZ = 1.25;
      for (let tsi = 0; tsi < 3; tsi++) {
        const tsz = ((tsi / 2) - 0.5) * topSpanZ;
        const pNest = new Vector3(side * 1.18, spec.crowsNestY + 0.15, tsz + 0.1);
        const pUpper = new Vector3(side * 0.35, upperCapY, tsz * 0.2 + 0.22);
        addRopeLine(mastUnit, pNest, pUpper, 0.020);
      }
      for (let tri = 1; tri < 12; tri++) {
        const tt = tri / 12;
        const tryPos = spec.crowsNestY + 0.15 + (upperCapY - (spec.crowsNestY + 0.15)) * tt;
        const trxPos = side * (1.18 + (0.35 - 1.18) * tt);
        const trSpan = topSpanZ * (1.0 - tt * 0.8);
        const tRung = new Mesh(new BoxGeometry(0.024, 0.020, trSpan), darkIronMat);
        tRung.position.set(trxPos, tryPos, 0.15);
        mastUnit.add(tRung);
      }
    }

    riggingGroup.add(mastUnit);
  }

  // 6f. Inter-Mast Stays, Forestays & Braces (the rich web of diagonal ropes in Images 2, 3, 4)
  const stayLines = [
    // Foremast stays to bowsprit
    [new Vector3(0, 14.6, 8.2), new Vector3(0, 7.2, 22.0)],
    [new Vector3(0, 20.5, 8.4), new Vector3(0, 9.2, 27.8)],
    // Mainmast stays to foremast base & crow's nest
    [new Vector3(0, 15.6, -0.6), new Vector3(0, 6.2, 8.2)],
    [new Vector3(0, 22.8, -0.4), new Vector3(0, 14.6, 8.2)],
    // Mizzenmast stays to mainmast
    [new Vector3(0, 13.5, -9.6), new Vector3(0, 6.5, -0.6)],
    [new Vector3(0, 18.2, -9.4), new Vector3(0, 15.6, -0.6)],
    // Yardarm braces
    [new Vector3(5.4, 12.6, 8.5), new Vector3(3.4, 5.8, -0.6)],
    [new Vector3(-5.4, 12.6, 8.5), new Vector3(-3.4, 5.8, -0.6)],
    [new Vector3(6.8, 13.0, -0.3), new Vector3(3.2, 6.8, -9.6)],
    [new Vector3(-6.8, 13.0, -0.3), new Vector3(-3.2, 6.8, -9.6)],
  ];
  for (const [pA, pB] of stayLines) {
    addRopeLine(riggingGroup, pA, pB, 0.024);
  }

  galleon.add(riggingGroup);
  galleon.add(hullGroup);

  return galleon;
}

/**
 * Installs the Broken Pirate Galleon in Chapter 02 ("Engineered from First Principles")
 * and Chapter 04 ("The Work"), plus the Devil Fruit Shrine in Chapter 01.
 */
export function installSunkenPirateShip(T, chapters) {
  if (!chapters || !chapters.length) return;

  // Guard against duplicate installation if called more than once
  if (chapters[1] && chapters[1].group && chapters[1].group.getObjectByName("sunken-ghost-pirate-galleon")) {
    return;
  }

  const THREE = T.THREE || (typeof window !== "undefined" && window.__THREE) || {};
  const Group = T.yr || THREE.Group;

  const sharedUniforms = {
    uShade: { value: 1.15 },
    uCharge: { value: 0.75 },
    uChargeT: { value: 0.0 },
    uNika: { value: 1.0 },
  };

  // 1. Chapter 01 (Origin): Devil Fruit Shrine
  const originChap = chapters[0];
  if (originChap) {
    try {
      const shrine = new Group();
      shrine.name = "origin-pirate-devil-shrine";

      const fruit = createDevilFruitMesh(T, sharedUniforms);
      fruit.position.set(1.85, 0.45, 1.2);
      fruit.scale.setScalar(2.2);
      shrine.add(fruit);

      shrine.position.set(-1.2, 0.2, 1.4);
      originChap.group.add(shrine);

      originChap.onUpdate(({ t }) => {
        sharedUniforms.uChargeT.value = t;
        fruit.rotation.y = t * 0.45;
        fruit.position.y = 0.45 + Math.sin(t * 1.4) * 0.08;
      });
    } catch (err) {
      console.warn("[pirate-ship] error installing chapter 01 shrine:", err);
    }
  }

  // 2. Chapter 02 (Memory / "Engineered from First Principles"):
  //    Heroic broken 3-masted pirate galleon positioned prominently right in the riverbed
  //    at the exact 3/4 starboard-bow angle from the user's reference renders!
  const memoryChap = chapters[1];
  if (memoryChap) {
    try {
      const riverGalleon = createSubmergedPirateGalleon(T, sharedUniforms);
      // Positioned in the centerpiece foreground of Chapter 02 so the entire hull,
      // bowsprit, 3 masts with tattered sails, open gunports, hull breaches, and
      // quarter gallery are framed clearly across the Chapter 02 camera path.
      riverGalleon.position.set(0.35, 0.35, -1.1);
      riverGalleon.rotation.set(0.04, 1.05, -0.05);
      riverGalleon.scale.setScalar(0.36);
      memoryChap.group.add(riverGalleon);

      // Boost Chapter 02's existing 3 active light slots so warm sunlight/amber highlights
      // illuminate the weathered wooden hull planking and golden carvings
      if (Array.isArray(memoryChap.lights) && memoryChap.lights.length >= 2) {
        memoryChap.lights[0].intensity = 780;
        memoryChap.lights[0].distance = 55;
        memoryChap.lights[1].intensity = 820;
        memoryChap.lights[1].distance = 48;
      }

      memoryChap.onUpdate(({ t }) => {
        sharedUniforms.uChargeT.value = t;
        riverGalleon.rotation.z = -0.05 + Math.sin(t * 0.45) * 0.008;
        riverGalleon.rotation.x = 0.04 + Math.cos(t * 0.35) * 0.006;
      });
    } catch (err) {
      console.warn("[pirate-ship] error installing chapter 02 galleon:", err);
    }
  }

  // 3. Chapter 04 (The Work / The Grand Line):
  //    Second broken pirate galleon resting beneath the project pedestals
  const workChap = chapters[3];
  if (workChap) {
    try {
      const workGalleon = createSubmergedPirateGalleon(T, sharedUniforms);
      workGalleon.position.set(-2.2, -5.8, -3.5);
      workGalleon.rotation.set(0.03, 1.02, -0.05);
      workGalleon.scale.setScalar(0.50);
      workChap.group.add(workGalleon);

      workChap.onUpdate(({ t }) => {
        sharedUniforms.uChargeT.value = t;
        workGalleon.rotation.z = -0.05 + Math.sin(t * 0.5) * 0.008;
        workGalleon.rotation.x = 0.03 + Math.cos(t * 0.4) * 0.006;
      });
    } catch (err) {
      console.warn("[pirate-ship] error installing chapter 04 galleon:", err);
    }
  }
}

export { createSubmergedPirateGalleon as createPirateGalleon };

