// Monkey D. Luffy 3D Character & Gear 5 Nika Awakening Module
// Matches the sculpted 3D Gear 5 Nika reference (spiral forehead bang lock, flame-like white hair
// with spiral tips & crimson-dark Haki shading, spiral-curled white eyebrows, furrowed brow lines,
// wide ringed Nika eyes, ear-to-ear toothy grin, stitched left-eye scar, white cloud-lapel vest,
// thick crimson-illuminated Hagoromo cloud scarf with spiral volutes, and jagged black-crimson Haki lightning).
import { installSunkenPirateShip } from "./PirateShip.js";
export { installSunkenPirateShip } from "./PirateShip.js";

export const LUFFY_FRAGMENT_DECLARATIONS = `
uniform float uNika;
`;

export const LUFFY_COLOR_FRAGMENT_PATCH = `
  diffuseColor.rgb *= uShade;
  {
    vec3 al = diffuseColor.rgb;
    float mx = max(al.r, max(al.g, al.b)), mn = min(al.r, min(al.g, al.b));
    float sat = (mx - mn) / max(mx, 1e-4);
    gSkin = smoothstep(-0.005, 0.02, al.r - al.g) * smoothstep(-0.005, 0.01, al.g - al.b)
          * smoothstep(0.22, 0.42, sat) * smoothstep(0.004 * uShade, 0.03 * uShade, mx);

    // Rest-pose coordinates vObjP: x in [-0.38, 0.38], y in [-0.95, 0.95], z in [-0.20, 0.20]
    vec3 p = vObjP;
    float lum = dot(al, vec3(0.299, 0.587, 0.114));
    float nikaMix = clamp(uNika * 0.85 + smoothstep(0.25, 0.90, uCharge) * 0.75, 0.0, 1.0);

    // Warm anime Luffy skin tone with crimson Haki bounce lighting
    vec3 animeSkin = vec3(0.88, 0.62, 0.48) * (0.54 + 0.66 * clamp(lum / max(0.08, uShade * 0.65), 0.28, 1.35)) * uShade;
    vec3 nikaSkin = vec3(0.93, 0.71, 0.59) * (0.62 + 0.56 * clamp(lum / max(0.08, uShade * 0.65), 0.32, 1.35)) * uShade;
    vec3 skinCol = mix(animeSkin, nikaSkin, nikaMix * 0.65);

    // 1. Face & Head region (y > 0.66)
    if (p.y > 0.66) {
      if (p.z > 0.02 && p.y < 0.838) {
        diffuseColor.rgb = skinCol;
        gSkin = 1.0;

        // Expressive vertical forehead furrow lines between the spiral eyebrows (matching reference)
        if (p.y > 0.784 && p.y < 0.826 && abs(p.x) < 0.019 && p.z > 0.088) {
          float f1 = 1.0 - smoothstep(0.0007, 0.0018, abs(abs(p.x) - 0.0035));
          float f2 = 1.0 - smoothstep(0.0006, 0.0016, abs(abs(p.x) - 0.0095)) * smoothstep(0.818, 0.798, p.y);
          float fY = smoothstep(0.784, 0.792, p.y) * smoothstep(0.826, 0.812, p.y);
          float furrowMask = clamp((f1 + f2) * fY, 0.0, 1.0);
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.14, 0.05, 0.05) * uShade, furrowMask * 0.85);
        }

        // Iconic curved stitched scar under Luffy's left eye (+x is character's left face)
        float scarY = 0.768 - 0.14 * (p.x - 0.038) + 0.9 * (p.x - 0.038) * (p.x - 0.038);
        float inScarX = smoothstep(0.019, 0.023, p.x) * (1.0 - smoothstep(0.056, 0.060, p.x));
        float scarLine = (1.0 - smoothstep(0.0011, 0.0025, abs(p.y - scarY))) * inScarX;
        float stitch1 = (1.0 - smoothstep(0.0009, 0.0020, abs(p.x - 0.031))) * (1.0 - smoothstep(0.004, 0.007, abs(p.y - scarY)));
        float stitch2 = (1.0 - smoothstep(0.0009, 0.0020, abs(p.x - 0.045))) * (1.0 - smoothstep(0.004, 0.007, abs(p.y - scarY)));
        float scarMask = clamp(scarLine + stitch1 + stitch2, 0.0, 1.0) * step(0.088, p.z);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.18, 0.04, 0.05) * uShade, scarMask * 0.92);

        // Wide confident curved ear-to-ear Gear 5 grin with upper & lower teeth rows
        float smileCurveY = 0.731 + 3.2 * p.x * p.x;
        float smileHalfH = 0.0155 * (1.0 - smoothstep(0.012, 0.045, abs(p.x)) * 0.72);
        if (abs(p.x) < 0.045 && abs(p.y - smileCurveY) < smileHalfH && p.z > 0.086) {
          float lipBorder = smoothstep(smileHalfH, smileHalfH - 0.0024, abs(p.y - smileCurveY));
          float rowDivider = smoothstep(0.0006, 0.0016, abs(p.y - smileCurveY));
          float toothSeam = smoothstep(0.04, 0.14, abs(fract(p.x * 135.0) - 0.5));
          vec3 teethCol = vec3(0.97, 0.97, 0.99) * (0.35 + 0.65 * rowDivider) * (0.45 + 0.55 * toothSeam) * uShade;
          vec3 gumOutline = vec3(0.15, 0.05, 0.06) * uShade;
          diffuseColor.rgb = mix(gumOutline, teethCol, lipBorder);
          gSkin = 0.0;
        }

        // Wide intense ringed Nika eyes (white sclera, dark outline, concentric crimson/white/black iris rings)
        for (int eye = -1; eye <= 1; eye += 2) {
          float eyeX = float(eye) * 0.035;
          vec2 eUv = vec2((p.x - eyeX) * 1.05, (p.y - 0.783) * 1.28);
          float eyeDist = length(eUv);
          if (eyeDist < 0.0175 && p.z > 0.088) {
            float eyelidRim = smoothstep(0.0175, 0.0148, eyeDist);
            vec3 sclera = vec3(0.98, 0.96, 0.97);
            // Concentric iris centered slightly inward/upward for fierce gaze
            vec2 irisUv = vec2(p.x - eyeX * 0.93, p.y - 0.783);
            float rIris = length(irisUv);
            vec3 eyeCol = sclera;
            if (rIris < 0.0082) {
              // Outer dark iris ring -> glowing crimson ring -> white ring -> black pupil
              float ringWhite = smoothstep(0.0022, 0.0030, rIris) * (1.0 - smoothstep(0.0046, 0.0054, rIris));
              float ringRed = smoothstep(0.0046, 0.0054, rIris) * (1.0 - smoothstep(0.0070, 0.0078, rIris));
              float pupil = 1.0 - smoothstep(0.0018, 0.0025, rIris);
              eyeCol = vec3(0.06, 0.03, 0.04);
              eyeCol = mix(eyeCol, vec3(0.95, 0.14, 0.22), ringRed * nikaMix);
              eyeCol = mix(eyeCol, vec3(0.98, 0.98, 1.0), ringWhite);
              eyeCol = mix(eyeCol, vec3(0.02, 0.02, 0.03), pupil);
            }
            diffuseColor.rgb = mix(vec3(0.08, 0.03, 0.04), eyeCol, eyelidRim) * uShade;
            gSkin = 0.0;
          }
        }
      }
      // Hair scalp & nape cap (pearlescent white-silver in Gear 5)
      if (p.y > 0.832 || (p.y > 0.695 && p.z <= 0.025)) {
        vec3 blackHair = vec3(0.04, 0.04, 0.055) * uShade;
        vec3 nikaHair = vec3(0.95, 0.94, 0.98) * uShade;
        diffuseColor.rgb = mix(blackHair, nikaHair, nikaMix);
        gSkin = 0.0;
      }
    }

    // 2. Torso: Open White Cloud-Lapel Vest + Muscular Chest + Collarbones & Akainu X-Scar (0.045 < y <= 0.575)
    bool isTorso = (p.y > 0.045 && p.y <= 0.575 && abs(p.x) < 0.168);
    if (isTorso) {
      // Scalloped spiral cloud-scroll lapel edge along the open chest
      float cloudWave = sin(p.y * 58.0) * 0.009 + cos(p.y * 116.0) * 0.004;
      float chestGapWidth = 0.056 + 0.016 * smoothstep(0.15, 0.52, p.y) + cloudWave;
      bool isBareFrontChest = (p.z > 0.015 && abs(p.x) < chestGapWidth);
      if (isBareFrontChest) {
        diffuseColor.rgb = skinCol;
        gSkin = 1.0;

        // Sculpted collarbone & upper pectoral cleavage lines (matching reference image)
        float clavY = 0.488 + abs(p.x) * 0.25;
        float clavLine = (1.0 - smoothstep(0.002, 0.006, abs(p.y - clavY))) * smoothstep(0.012, 0.025, abs(p.x));
        float pecArch = (1.0 - smoothstep(0.002, 0.005, abs(abs(p.x) - 0.014 - (0.43 - p.y) * 0.18)))
                      * smoothstep(0.37, 0.40, p.y) * smoothstep(0.45, 0.43, p.y);
        diffuseColor.rgb *= (1.0 - clamp(clavLine * 0.35 + pecArch * 0.38, 0.0, 0.45));

        // Akainu X-shaped chest scar centered at (0.0, 0.335)
        vec2 sc = vec2(p.x, p.y - 0.335);
        float d1 = abs(sc.y - 1.18 * sc.x);
        float d2 = abs(sc.y + 1.18 * sc.x);
        float rLim = smoothstep(0.054, 0.018, length(sc));
        float xScar = max(
          1.0 - smoothstep(0.004, 0.011, d1),
          1.0 - smoothstep(0.004, 0.011, d2)
        ) * rLim * step(0.04, p.z);
        vec3 scarCol = vec3(0.52, 0.16, 0.19) * uShade;
        diffuseColor.rgb = mix(diffuseColor.rgb, scarCol, xScar * 0.78);
      } else {
        // Open Gear 5 White Vest with crimson-pink cloud-scroll lapel shading
        float clothTex = 0.93 + 0.07 * sin(p.x * 180.0) * sin(p.y * 180.0);
        float lapelDist = abs(abs(p.x) - chestGapWidth);
        float scrollGroove = (1.0 - smoothstep(0.002, 0.005, abs(lapelDist - 0.014))) * step(0.03, p.z);
        vec3 redVest = vec3(0.78, 0.07, 0.10) * clothTex * (0.65 + 0.45 * lum) * uShade;
        vec3 nikaVest = mix(vec3(0.95, 0.93, 0.97), vec3(0.88, 0.56, 0.58), smoothstep(0.14, 0.0, lapelDist) * 0.45)
                      * clothTex * (0.78 + 0.32 * lum) * (1.0 - scrollGroove * 0.28) * uShade;
        diffuseColor.rgb = mix(redVest, nikaVest, nikaMix);
        gSkin = 0.0;
      }
    }

    // 3. Bare Arms, Shoulders & Hands
    if (abs(p.x) >= 0.168 && p.y > 0.045) {
      diffuseColor.rgb = skinCol;
      gSkin = 1.0;
    }

    // 4. Pirate Waist Sash (-0.075 < y <= 0.045)
    if (p.y > -0.075 && p.y <= 0.045) {
      float sashFold = 0.86 + 0.14 * sin(p.y * 160.0 + p.x * 22.0);
      vec3 yellowSash = vec3(0.96, 0.68, 0.12) * sashFold * uShade;
      vec3 purpleSash = vec3(0.46, 0.22, 0.82) * sashFold * uShade;
      diffuseColor.rgb = mix(yellowSash, purpleSash, nikaMix);
      gSkin = 0.0;
    }

    // 5. Shorts (-0.475 < y <= -0.075) & Fluffy White Fur Cuffs (-0.555 < y <= -0.475)
    if (p.y > -0.475 && p.y <= -0.075) {
      float denimWeave = 0.90 + 0.10 * sin((p.x + p.y) * 240.0);
      vec3 blueShorts = vec3(0.10, 0.26, 0.52) * denimWeave * (0.65 + 0.45 * lum) * uShade;
      vec3 nikaShorts = vec3(0.94, 0.93, 0.98) * denimWeave * (0.75 + 0.35 * lum) * uShade;
      diffuseColor.rgb = mix(blueShorts, nikaShorts, nikaMix);
      gSkin = 0.0;
    } else if (p.y > -0.555 && p.y <= -0.475) {
      float fluff = 0.92 + 0.08 * sin(p.x * 90.0) * cos(p.z * 90.0);
      diffuseColor.rgb = vec3(0.94, 0.92, 0.89) * fluff * uShade;
      gSkin = 0.0;
    }

    // 6. Bare Shins (-0.875 < y <= -0.555) & Woven Straw Sandals (y <= -0.875)
    if (p.y > -0.875 && p.y <= -0.555) {
      diffuseColor.rgb = skinCol;
      gSkin = 1.0;
    } else if (p.y <= -0.875) {
      if (p.y < -0.922) {
        float straw = 0.85 + 0.15 * sin(p.x * 220.0) * sin(p.z * 220.0);
        diffuseColor.rgb = vec3(0.82, 0.62, 0.26) * straw * uShade;
        gSkin = 0.0;
      } else if (p.z > 0.01 && abs(p.y + 0.90) < 0.015) {
        diffuseColor.rgb = vec3(0.72, 0.10, 0.12) * uShade;
        gSkin = 0.0;
      } else {
        diffuseColor.rgb = skinCol;
        gSkin = 1.0;
      }
    }
  }
`;

export const LUFFY_EMISSIVE_PATCH = `
  float rim = pow(1.0 - saturate(abs(dot(normal, normalize(vViewPosition)))), 2.6);
  float nikaGlow = max(uCharge, uNika * 0.78);
  // Crimson-red Conqueror's Haki rim & bounce glow matching reference image
  vec3 hakiCol = mix(uRimCol, vec3(0.96, 0.16, 0.22), uNika * 0.75);
  totalEmissiveRadiance += hakiCol * rim * (uRim + uNika * 0.38);
  if (nikaGlow > 0.001) {
    float hy = clamp((vObjP.y - uYRange.x) / max(1e-3, uYRange.y - uYRange.x), 0.0, 1.0);
    float wob = fbm3(vObjP * 6.0 + vec3(0.0, -uChargeT * 0.6, 0.0)) * 0.06;
    float front = fract(uChargeT * 0.12) * 1.2 - 0.1;
    float dh = hy + wob - front;
    float surge = exp(-dh * dh / 0.003);
    float trail = smoothstep(0.0, -0.08, dh) * smoothstep(-0.45, -0.08, dh) * 0.05;
    float veins = pow(1.0 - abs(fbm3(vObjP * 8.0 + vec3(0.0, -uChargeT * 0.9, 0.0))), 24.0);
    float fr = pow(1.0 - saturate(abs(dot(normal, normalize(vViewPosition)))), 2.8);
    vec3 ec = mix(vec3(0.98, 0.12, 0.22), vec3(1.0, 0.45, 0.48), smoothstep(0.2, 0.9, nikaGlow));
    totalEmissiveRadiance += ec * nikaGlow * (fr * 0.52 + surge * (0.35 + veins * 1.8) + trail) * 1.18;
  }
`;

/**
 * Helper: Generates a 3D spiral volute curve (`@` scroll coil) in 3D space.
 */
function buildSpiralCurvePoints(U, center, axisRight, axisUp, axisOut, rStart, rEnd, turns, numPts = 22) {
  const pts = [];
  for (let i = 0; i <= numPts; i++) {
    const t = i / numPts;
    const ang = t * Math.PI * 2.0 * turns;
    const r = rStart * (1.0 - t) + rEnd * t;
    const c = Math.cos(ang) * r;
    const s = Math.sin(ang) * r;
    const zOff = t * 0.004;
    pts.push(
      new U(
        center[0] + axisRight[0] * c + axisUp[0] * s + axisOut[0] * zOff,
        center[1] + axisRight[1] * c + axisUp[1] * s + axisOut[1] * zOff,
        center[2] + axisRight[2] * c + axisUp[2] * s + axisOut[2] * zOff
      )
    );
  }
  return pts;
}

/**
 * Builds the iconic 3D Sculpted Straw Hat (Mugiwara) in rest-pose meters.
 */
export function createStrawHatMesh(T, uniforms) {
  const { yr, J, Lc, Pc, zc, Ss, Vc, U, nl, $g, Q } = T;
  const hatGroup = new yr();
  hatGroup.name = "luffy-straw-hat";

  const makeStrawMat = (baseHex, rough = 0.68, isBand = false) => {
    const mat = new nl({
      color: baseHex,
      roughness: rough,
      metalness: 0.05,
      side: 2,
    });
    $g(mat, {
      key: isBand ? "luffy-hat-band" : "luffy-hat-straw",
      uniforms,
      vertex: (e) => (
        (e = Q(e, "#include <common>", "varying vec3 vHatP;")),
        Q(e, "#include <begin_vertex>", "vHatP = position;")
      ),
      fragment: (e) => (
        (e = Q(
          e,
          "#include <common>",
          "varying vec3 vHatP; uniform float uShade, uCharge, uNika;"
        )),
        (e = Q(
          e,
          "#include <color_fragment>",
          isBand
            ? `
              float weave = 0.9 + 0.1 * sin(vHatP.y * 400.0);
              diffuseColor.rgb *= weave * uShade;
            `
            : `
              float r = length(vHatP.xz);
              float ang = atan(vHatP.z, vHatP.x);
              float weave = 0.86 + 0.14 * sin(r * 380.0 + sin(ang * 28.0) * 1.5) * cos(ang * 48.0);
              diffuseColor.rgb *= weave * uShade;
            `
        )),
        Q(
          e,
          "#include <emissivemap_fragment>",
          `
            float rim = pow(1.0 - saturate(abs(dot(normal, normalize(vViewPosition)))), 2.6);
            float g = max(uCharge, uNika * 0.55);
            totalEmissiveRadiance += vec3(1.0, 0.45, 0.28) * rim * (0.08 + g * 0.45) * uShade;
          `
        )
      ),
    });
    return mat;
  };

  const strawMat = makeStrawMat("#eab338", 0.65, false);
  const bandMat = makeStrawMat("#d91824", 0.5, true);

  const domeGeo = new Lc(0.114, 36, 20, 0, Math.PI * 2, 0, Math.PI * 0.56);
  domeGeo.scale(1.0, 0.82, 1.06);
  const dome = new J(domeGeo, strawMat);
  dome.castShadow = true;
  dome.receiveShadow = true;
  hatGroup.add(dome);

  const bandGeo = new Vc(
    new Ss(
      [
        new U(0.113, 0.012, 0),
        new U(0, 0.012, 0.12),
        new U(-0.113, 0.012, 0),
        new U(0, 0.012, -0.12),
      ],
      true
    ),
    48,
    0.016,
    12,
    false
  );
  const band = new J(bandGeo, bandMat);
  hatGroup.add(band);

  const brimGeo = new Pc(0.106, 0.245, 48, 6);
  brimGeo.rotateX(-Math.PI / 2);
  const pos = brimGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    const t = Math.max(0, (r - 0.106) / (0.245 - 0.106));
    const ang = Math.atan2(z, x);
    const wave =
      Math.sin(ang * 3.0 + 0.5) * 0.008 * t +
      Math.cos(ang * 2.0) * 0.006 * t * t;
    pos.setY(i, 0.004 - 0.012 * t * (1.0 - 0.4 * t) + wave);
  }
  brimGeo.computeVertexNormals();
  const brim = new J(brimGeo, strawMat);
  brim.castShadow = true;
  brim.receiveShadow = true;
  hatGroup.add(brim);

  const rimTorus = new J(new zc(0.242, 0.0045, 8, 48), strawMat);
  rimTorus.rotation.x = Math.PI / 2;
  hatGroup.add(rimTorus);

  return hatGroup;
}

/**
 * Builds Luffy's 3D Sculpted Gear 5 Nika Flame Hair, Central Forehead Spiral Bang Lock,
 * and Thick White Spiral-Curled Eyebrows matching `media_1793740537625_7f9c1717.jpg`.
 */
export function createLuffyHairGroup(T, uniforms) {
  const { yr, J, Ss, Lc, U, nl, $g, Q } = T;
  const hairGroup = new yr();
  hairGroup.name = "luffy-nika-flame-hair";

  // Pearlescent white-silver hair material with dark/crimson Haki shading on upper flame tips
  const hairMat = new nl({
    color: "#f2eff7",
    roughness: 0.36,
    metalness: 0.06,
    side: 2,
  });

  $g(hairMat, {
    key: "luffy-nika-hair-v4",
    uniforms,
    vertex: (e) => (
      (e = Q(
        e,
        "#include <common>",
        "varying vec3 vHairP; varying vec3 vHairN; uniform float uCharge, uChargeT, uNika;"
      )),
      Q(
        e,
        "#include <begin_vertex>",
        `
          vHairP = position;
          vHairN = normal;
          float nika = max(uCharge, uNika * 0.85);
          float tip = smoothstep(0.86, 1.12, position.y);
          transformed.x += sin(uTime * 4.5 + position.y * 22.0 + position.z * 12.0) * 0.0045 * (0.4 + nika) * tip;
          transformed.z += cos(uTime * 3.8 + position.x * 20.0) * 0.0035 * nika * tip;
        `
      )
    ),
    fragment: (e) => (
      (e = Q(
        e,
        "#include <common>",
        "varying vec3 vHairP; varying vec3 vHairN; uniform float uShade, uCharge, uNika;"
      )),
      (e = Q(
        e,
        "#include <color_fragment>",
        `
          // Pearlescent white-silver lower/front locks, dark charcoal & crimson Haki shading on high flame tips
          float hFade = smoothstep(0.92, 1.14, vHairP.y) * smoothstep(0.10, -0.06, vHairP.z);
          float strand = 0.90 + 0.10 * sin(vHairP.x * 160.0 + vHairP.y * 90.0);
          vec3 pureSilverWhite = vec3(0.94, 0.93, 0.97) * strand;
          vec3 hakiTipShade = mix(vec3(0.14, 0.04, 0.05), vec3(0.68, 0.10, 0.14), smoothstep(0.95, 1.10, vHairP.y));
          vec3 baseCol = mix(pureSilverWhite, hakiTipShade, hFade * 0.82);
          diffuseColor.rgb = baseCol * uShade;
        `
      )),
      Q(
        e,
        "#include <emissivemap_fragment>",
        `
          float rim = pow(1.0 - saturate(abs(dot(normal, normalize(vViewPosition)))), 2.1);
          float upperCrimson = smoothstep(0.86, 1.10, vHairP.y);
          vec3 rimGlow = mix(vec3(0.88, 0.84, 0.95), vec3(1.0, 0.14, 0.22), upperCrimson * 0.85 + rim * 0.45);
          totalEmissiveRadiance += rimGlow * (0.18 + rim * 0.72 + upperCrimson * 0.36) * uShade;
        `
      )
    ),
  });

  // Helper to add a thick sculpted lock with an optional spiral-curled tip
  const addSculptedLock = (pts, baseR, tipR = 0.003, radial = 8, segs = 24) => {
    const curve = new Ss(pts.map((p) => (p instanceof U ? p : new U(p[0], p[1], p[2]))));
    const geo = T.y_(curve, {
      segments: segs,
      radial,
      radius: (t) => {
        const swell = Math.sin(Math.PI * Math.min(1.0, t * 1.15)) * 0.35 + 0.65;
        return (baseR * (1.0 - Math.pow(t, 1.4)) + tipR * Math.pow(t, 1.4)) * swell;
      },
    });
    const mesh = new J(geo, hairMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    hairGroup.add(mesh);
  };

  // 0. Sculpted Volumetric Hair Cap Dome (smoothly covers upper skull and blends locks)
  const capGeo = new Lc(0.102, 28, 20);
  capGeo.scale(1.04, 0.96, 1.08);
  const capMesh = new J(capGeo, hairMat);
  capMesh.position.set(0, 0.845, 0.005);
  hairGroup.add(capMesh);

  // 1. ICONIC CENTRAL FOREHEAD SPIRAL BANG LOCK (`@` coil over center forehead matching reference image!)
  const centerLockStem = [
    new U(0.008, 0.905, 0.045),
    new U(0.018, 0.892, 0.108),
    new U(0.022, 0.862, 0.142),
    new U(0.012, 0.830, 0.150),
  ];
  const centerSpiralPts = buildSpiralCurvePoints(
    U,
    [-0.006, 0.834, 0.148],
    [1, 0, 0],
    [0, -1, 0],
    [0, 0, 1],
    0.024,
    0.003,
    1.65,
    24
  );
  addSculptedLock([...centerLockStem, ...centerSpiralPts], 0.024, 0.004, 10, 36);

  // Crown top knot curl right above the central forehead bang lock (seen at top of forehead in reference)
  addSculptedLock(
    [
      [-0.028, 0.912, 0.042],
      [-0.008, 0.928, 0.075],
      [0.018, 0.916, 0.088],
      [0.028, 0.902, 0.068],
      [0.010, 0.896, 0.058],
    ],
    0.018,
    0.005,
    8,
    20
  );

  // 2. FRAMING FOREHEAD & TEMPLE FRINGE LOCKS (sweeping down on both sides of the central spiral bang)
  const frontFringeLocks = [
    // Inner left fringe lock (dips down beside left eye/brow)
    [
      [-0.012, 0.902, 0.055],
      [-0.020, 0.875, 0.125],
      [-0.022, 0.832, 0.140],
      [-0.015, 0.794, 0.136],
      [-0.008, 0.784, 0.132],
    ],
    // Mid left fringe lock (curves down and hooks inward near left brow)
    [
      [-0.032, 0.898, 0.050],
      [-0.046, 0.866, 0.118],
      [-0.048, 0.818, 0.132],
      [-0.038, 0.785, 0.128],
      [-0.028, 0.780, 0.126],
    ],
    // Inner right fringe lock (curves toward right brow)
    [
      [0.024, 0.900, 0.052],
      [0.036, 0.868, 0.122],
      [0.042, 0.825, 0.134],
      [0.052, 0.800, 0.128],
      [0.060, 0.798, 0.122],
    ],
    // Outer left temple lock with curled tip
    [
      [-0.052, 0.892, 0.038],
      [-0.078, 0.862, 0.095],
      [-0.088, 0.822, 0.106],
      [-0.098, 0.805, 0.096],
      [-0.106, 0.814, 0.088],
    ],
    // Outer right temple lock with curled tip
    [
      [0.052, 0.892, 0.038],
      [0.078, 0.862, 0.095],
      [0.088, 0.822, 0.106],
      [0.098, 0.805, 0.096],
      [0.106, 0.814, 0.088],
    ],
    // Sideburn wing locks
    [
      [-0.075, 0.865, 0.015],
      [-0.112, 0.835, 0.045],
      [-0.128, 0.812, 0.058],
      [-0.142, 0.825, 0.052],
    ],
    [
      [0.075, 0.865, 0.015],
      [0.112, 0.835, 0.045],
      [0.128, 0.812, 0.058],
      [0.142, 0.825, 0.052],
    ],
  ];
  for (const pts of frontFringeLocks) {
    addSculptedLock(pts, 0.021, 0.0035, 8, 22);
  }

  // 3. FLOWING FLAME-LIKE RISING HAIR LOCKS WITH SPIRAL-CURLED TIPS (`@` volutes)
  // 26 multi-tiered flame locks rising high above the crown like tongues of fire
  const flameConfigs = [
    // Tier A: Tall central rising flame locks with spiral-curled tips
    { x: 0.0, z: 0.01, h: 0.25, leanX: 0.01, leanZ: -0.02, r: 0.028, curlDir: 1 },
    { x: -0.038, z: 0.005, h: 0.24, leanX: -0.035, leanZ: -0.02, r: 0.026, curlDir: -1 },
    { x: 0.038, z: 0.005, h: 0.24, leanX: 0.035, leanZ: -0.02, r: 0.026, curlDir: 1 },
    { x: -0.072, z: 0.0, h: 0.21, leanX: -0.068, leanZ: -0.015, r: 0.024, curlDir: -1 },
    { x: 0.072, z: 0.0, h: 0.21, leanX: 0.068, leanZ: -0.015, r: 0.024, curlDir: 1 },
    // Tier B: Mid-crown billowing flame locks
    { x: -0.022, z: -0.035, h: 0.27, leanX: -0.02, leanZ: -0.045, r: 0.028, curlDir: 1 },
    { x: 0.022, z: -0.035, h: 0.27, leanX: 0.02, leanZ: -0.045, r: 0.028, curlDir: -1 },
    { x: -0.058, z: -0.03, h: 0.23, leanX: -0.065, leanZ: -0.04, r: 0.025, curlDir: -1 },
    { x: 0.058, z: -0.03, h: 0.23, leanX: 0.065, leanZ: -0.04, r: 0.025, curlDir: 1 },
    { x: -0.092, z: -0.015, h: 0.18, leanX: -0.095, leanZ: -0.02, r: 0.022, curlDir: -1 },
    { x: 0.092, z: -0.015, h: 0.18, leanX: 0.095, leanZ: -0.02, r: 0.022, curlDir: 1 },
    // Tier C: Wide side flame wings (sweeping outward & upward behind ears)
    { x: -0.098, z: 0.015, h: 0.14, leanX: -0.115, leanZ: 0.01, r: 0.022, curlDir: -1 },
    { x: 0.098, z: 0.015, h: 0.14, leanX: 0.115, leanZ: 0.01, r: 0.022, curlDir: 1 },
    { x: -0.105, z: -0.035, h: 0.16, leanX: -0.125, leanZ: -0.03, r: 0.023, curlDir: -1 },
    { x: 0.105, z: -0.035, h: 0.16, leanX: 0.125, leanZ: -0.03, r: 0.023, curlDir: 1 },
    // Tier D: Back crown & nape rising flames
    { x: 0.0, z: -0.068, h: 0.25, leanX: 0.0, leanZ: -0.08, r: 0.028, curlDir: 1 },
    { x: -0.042, z: -0.065, h: 0.22, leanX: -0.05, leanZ: -0.075, r: 0.025, curlDir: -1 },
    { x: 0.042, z: -0.065, h: 0.22, leanX: 0.05, leanZ: -0.075, r: 0.025, curlDir: 1 },
    { x: -0.078, z: -0.058, h: 0.18, leanX: -0.09, leanZ: -0.065, r: 0.022, curlDir: -1 },
    { x: 0.078, z: -0.058, h: 0.18, leanX: 0.09, leanZ: -0.065, r: 0.022, curlDir: 1 },
  ];

  for (let i = 0; i < flameConfigs.length; i++) {
    const fc = flameConfigs[i];
    const y0 = 0.865;
    const sWave = (i % 2 === 0 ? 1 : -1) * 0.014;
    const tipX = fc.x + fc.leanX;
    const tipY = y0 + fc.h;
    const tipZ = fc.z + fc.leanZ;
    const stemPts = [
      new U(fc.x * 0.85, y0 - 0.015, fc.z * 0.85),
      new U(fc.x + fc.leanX * 0.35 + sWave, y0 + fc.h * 0.38, fc.z + fc.leanZ * 0.35),
      new U(fc.x + fc.leanX * 0.75 - sWave * 0.7, y0 + fc.h * 0.76, fc.z + fc.leanZ * 0.75),
      new U(tipX, tipY, tipZ),
    ];
    // Add spiral curl hook (`@`) at the flame tip
    const cDir = fc.curlDir;
    const tipCurl = [
      new U(tipX + cDir * 0.014, tipY + 0.012, tipZ + 0.005),
      new U(tipX + cDir * 0.022, tipY - 0.002, tipZ + 0.010),
      new U(tipX + cDir * 0.012, tipY - 0.014, tipZ + 0.012),
      new U(tipX + cDir * 0.004, tipY - 0.006, tipZ + 0.014),
    ];
    addSculptedLock([...stemPts, ...tipCurl], fc.r, 0.003, 7, 24);
  }

  // 4. THICK WHITE SPIRAL-CURLED EYEBROWS (`@` inner scroll coils above the eyes, matching reference!)
  for (const side of [-1, 1]) {
    // Outer brow arch sweeping down fiercely toward the inner glabella
    const browStem = [
      new U(side * 0.062, 0.808, 0.104),
      new U(side * 0.054, 0.804, 0.114),
      new U(side * 0.036, 0.793, 0.123),
      new U(side * 0.018, 0.788, 0.127),
    ];
    // Tight 1.6-turn spiral coil at the inner end of each eyebrow
    const browSpiral = buildSpiralCurvePoints(
      U,
      [side * 0.016, 0.796, 0.128],
      [-side, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      0.010,
      0.002,
      1.55,
      18
    );
    addSculptedLock([...browStem, ...browSpiral], 0.0085, 0.0022, 8, 26);
  }

  return hairGroup;
}

/**
 * Builds Luffy's 3D Gear 5 Nika Hagoromo Floating Cloud Scarf (with protruding spiral cloud volutes
 * and crimson-red illumination), White Vest Cloud-Scroll Lapels, and Jagged Black-and-Crimson
 * Conqueror's Haki Lightning matching `media_1793740537625_7f9c1717.jpg`.
 */
export function createNikaCloudAndHakiGroup(T, uniforms) {
  const { yr, J, Ss, Lc, U, nl, el, $g, Q, rg, sg } = T;
  const group = new yr();
  group.name = "luffy-nika-hagoromo";

  // 1. Crimson-Illuminated Hagoromo Cloud Scarf Material (matching the red-lit cloud scarf in reference)
  const cloudMat = new nl({
    color: "#f2d6d8",
    roughness: 0.34,
    metalness: 0.04,
    side: 2,
  });

  $g(cloudMat, {
    key: "luffy-nika-cloud-v4",
    uniforms,
    vertex: (e) => (
      (e = Q(
        e,
        "#include <common>",
        "varying vec3 vCloudP; varying vec3 vCloudN; uniform float uCharge, uNika;"
      )),
      Q(
        e,
        "#include <begin_vertex>",
        `
          vCloudP = position;
          vCloudN = normal;
          float wave = sin(uTime * 2.4 + position.x * 10.0 + position.y * 7.0) * 0.010;
          transformed.y += wave;
          transformed.z += cos(uTime * 2.0 + position.x * 9.0) * 0.008;
        `
      )
    ),
    fragment: (e) => (
      (e = Q(
        e,
        "#include <common>",
        "varying vec3 vCloudP; varying vec3 vCloudN; uniform float uShade, uCharge, uNika;"
      )),
      (e = Q(
        e,
        "#include <color_fragment>",
        `
          // Inner chest lapels are pearlescent white-rose; outer billowing Hagoromo arch is rich crimson-red!
          float radialDist = length(vec2(vCloudP.x * 1.4, (vCloudP.y - 0.42) * 0.9));
          float crimsonMix = smoothstep(0.14, 0.36, radialDist);
          vec3 innerLapelCol = vec3(0.94, 0.86, 0.88);
          vec3 outerCrimsonCloud = vec3(0.76, 0.16, 0.19);
          diffuseColor.rgb = mix(innerLapelCol, outerCrimsonCloud, crimsonMix) * uShade;
        `
      )),
      Q(
        e,
        "#include <emissivemap_fragment>",
        `
          float rim = pow(1.0 - saturate(abs(dot(normal, normalize(vViewPosition)))), 1.85);
          float radialDist = length(vec2(vCloudP.x * 1.4, (vCloudP.y - 0.42) * 0.9));
          float crimsonMix = smoothstep(0.12, 0.34, radialDist);
          vec3 cloudGlow = mix(vec3(0.95, 0.55, 0.58), vec3(1.0, 0.14, 0.20), crimsonMix * 0.85 + rim * 0.35);
          totalEmissiveRadiance += cloudGlow * (0.32 + rim * 0.85 + crimsonMix * 0.28) * uShade;
        `
      )
    ),
  });

  // Dark recessed groove material for the etched spiral lines on the cloud volutes
  const grooveMat = new nl({
    color: "#38090d",
    roughness: 0.7,
    metalness: 0.1,
  });

  // Main thick billowing Hagoromo Cloud Ribbon looping from chest lapels around arms and high over head
  const cloudPts = [
    new U(-0.085, 0.34, 0.115),
    new U(-0.145, 0.43, 0.105),
    new U(-0.275, 0.46, 0.065),
    new U(-0.365, 0.56, 0.025),
    new U(-0.345, 0.74, -0.015),
    new U(-0.265, 0.92, -0.045),
    new U(-0.145, 1.05, -0.065),
    new U(0.0, 1.10, -0.075),
    new U(0.145, 1.05, -0.065),
    new U(0.265, 0.92, -0.045),
    new U(0.345, 0.74, -0.015),
    new U(0.365, 0.56, 0.025),
    new U(0.275, 0.46, 0.065),
    new U(0.145, 0.43, 0.105),
    new U(0.085, 0.34, 0.115),
  ];
  const cloudCurve = new Ss(cloudPts);
  const cloudGeo = T.y_(cloudCurve, {
    segments: 96,
    radial: 14,
    radius: (t) => {
      const endTaper = Math.sin(Math.PI * t);
      const billow = 1.0 + 0.22 * Math.sin(t * Math.PI * 11.0);
      return (0.024 + 0.038 * Math.pow(endTaper, 0.55)) * billow;
    },
  });
  const cloudMesh = new J(cloudGeo, cloudMat);
  cloudMesh.castShadow = true;
  group.add(cloudMesh);

  // Add Sculpted 3D Spiral Cloud Volutes (`@` scroll hooks) along the Hagoromo scarf & chest lapels
  const addCloudVolute = (center, side, scaleR = 0.042, rotZ = 0) => {
    const spiralPts = buildSpiralCurvePoints(
      U,
      center,
      [side * Math.cos(rotZ), Math.sin(rotZ), 0],
      [-Math.sin(rotZ), side * Math.cos(rotZ), 0],
      [0, 0, 1],
      scaleR,
      scaleR * 0.14,
      1.65,
      22
    );
    const volCurve = new Ss(spiralPts);
    const volGeo = T.y_(volCurve, {
      segments: 26,
      radial: 10,
      radius: (t) => scaleR * 0.52 * (1.0 - t * 0.68),
    });
    const volMesh = new J(volGeo, cloudMat);
    group.add(volMesh);

    // Etched dark spiral crease line on the front face of the volute (matching reference!)
    const creasePts = buildSpiralCurvePoints(
      U,
      [center[0], center[1], center[2] + scaleR * 0.38],
      [side * Math.cos(rotZ), Math.sin(rotZ), 0],
      [-Math.sin(rotZ), side * Math.cos(rotZ), 0],
      [0, 0, 1],
      scaleR * 0.78,
      scaleR * 0.12,
      1.55,
      18
    );
    const creaseGeo = T.y_(new Ss(creasePts), {
      segments: 20,
      radial: 5,
      radius: (t) => 0.0028 * (1.0 - t * 0.5),
    });
    group.add(new J(creaseGeo, grooveMat));
  };

  // Symmetric spiral cloud volutes matching `media_1793740537625_7f9c1717.jpg`:
  for (const side of [-1, 1]) {
    // Chest lapel spiral curls (bottom left & right of neck/chest)
    addCloudVolute([side * 0.092, 0.365, 0.118], side, 0.034, 0.35);
    addCloudVolute([side * 0.135, 0.395, 0.112], -side, 0.028, -0.25);
    // Outer mid-loop cloud scroll hooks (protruding on left & right of scarf)
    addCloudVolute([side * 0.385, 0.615, 0.022], side, 0.052, 0.2);
    // Inner mid-loop cloud scroll hooks (curling inward toward head/shoulders)
    addCloudVolute([side * 0.255, 0.665, 0.015], -side, 0.044, -0.4);
    // Upper arch cloud scroll hooks
    addCloudVolute([side * 0.235, 0.855, -0.025], -side, 0.042, 0.5);
    addCloudVolute([side * 0.315, 0.965, -0.035], side, 0.038, -0.3);
  }

  // 2. JAGGED BLACK-AND-CRIMSON CONQUEROR'S HAKI LIGHTNING BOLTS (matching reference image!)
  // Inner pitch-black Haki core material + outer blazing neon crimson-red aura material
  const hakiBlackCoreMat = new el({
    uniforms: { ...uniforms, ...T.tg },
    transparent: true,
    depthWrite: false,
    side: 2,
    vertexShader: `
      varying vec2 vUv;
      ${rg}
      void main() {
        vUv = uv;
        vec3 p = position;
        float snap = floor(uTime * 16.0);
        p.x += sin(snap * 7.3 + position.y * 55.0) * 0.0025;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uCharge, uNika, uShade;
      void main() {
        float ends = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x);
        gl_FragColor = vec4(vec3(0.02, 0.005, 0.01), ends * 0.96);
      }
    `,
  });

  const hakiCrimsonAuraMat = new el({
    uniforms: { ...uniforms, ...T.tg },
    transparent: true,
    depthWrite: false,
    blending: 2,
    side: 2,
    vertexShader: `
      varying vec2 vUv;
      ${rg}
      void main() {
        vUv = uv;
        vec3 p = position;
        float snap = floor(uTime * 16.0);
        p.x += sin(snap * 7.3 + position.y * 55.0) * 0.0025;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uCharge, uNika, uShade;
      ${rg}
      ${sg}
      void main() {
        float power = clamp(0.65 + uCharge * 0.5 + uNika * 0.5, 0.0, 1.2) * smoothstep(0.05, 0.35, uShade);
        float pulse = 0.78 + 0.22 * sin(uTime * 28.0 - vUv.x * 18.0);
        float ends = smoothstep(0.0, 0.10, vUv.x) * smoothstep(1.0, 0.90, vUv.x);
        vec3 crimson = vec3(1.0, 0.05, 0.16) * 3.8;
        vec3 hotEdge = vec3(1.0, 0.32, 0.42) * 2.4;
        vec3 col = mix(crimson, hotEdge, pow(sin(vUv.y * 3.14159), 2.0)) * ends * pulse * power;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });

  const addHakiBolt = (pts, baseThickness = 0.0065) => {
    // Use piecewise linear / sharp segments for authentic jagged anime Haki lightning
    const vecPts = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      for (let s = 0; s < 4; s++) {
        const f = s / 4;
        vecPts.push(new U(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f));
      }
    }
    const last = pts[pts.length - 1];
    vecPts.push(new U(last[0], last[1], last[2]));

    const curve = new Ss(vecPts);
    const segs = vecPts.length * 2;
    // Outer blazing crimson aura shell
    const auraGeo = T.y_(curve, {
      segments: segs,
      radial: 6,
      radius: (t) => baseThickness * 1.65 * Math.sin(Math.PI * Math.pow(t, 0.85)),
    });
    const auraMesh = new J(auraGeo, hakiCrimsonAuraMat);
    auraMesh.renderOrder = 34;
    group.add(auraMesh);

    // Inner jet-black Haki core
    const coreGeo = T.y_(curve, {
      segments: segs,
      radial: 5,
      radius: (t) => baseThickness * 0.82 * Math.sin(Math.PI * Math.pow(t, 0.85)),
    });
    const coreMesh = new J(coreGeo, hakiBlackCoreMat);
    coreMesh.renderOrder = 36;
    group.add(coreMesh);
  };

  // Jagged angular Conqueror's Haki lightning paths matching `media_1793740537625_7f9c1717.jpg`:
  const hakiBolts = [
    // Bolt 1: Prominent front-left chest/shoulder jagged bolt surging up into left Hagoromo scarf
    [
      [-0.08, 0.25, 0.14],
      [-0.11, 0.36, 0.14],
      [-0.21, 0.38, 0.13],
      [-0.24, 0.49, 0.11],
      [-0.17, 0.52, 0.10],
      [-0.20, 0.65, 0.08],
      [-0.31, 0.72, 0.06],
      [-0.39, 0.81, 0.04],
    ],
    // Bolt 2: Right shoulder & scarf jagged bolt surging up toward right crown
    [
      [0.14, 0.36, 0.13],
      [0.24, 0.34, 0.11],
      [0.29, 0.56, 0.07],
      [0.23, 0.62, 0.06],
      [0.34, 0.68, 0.04],
      [0.38, 0.82, 0.02],
    ],
    // Bolt 3: Right temple & hair crimson-black lightning fork
    [
      [0.12, 0.76, 0.04],
      [0.23, 0.78, 0.02],
      [0.20, 0.88, 0.01],
      [0.12, 0.96, 0.02],
      [0.22, 1.08, 0.0],
    ],
    // Bolt 4: Left upper hair crown lightning bolt
    [
      [-0.14, 0.86, 0.02],
      [-0.08, 0.95, 0.03],
      [-0.15, 1.04, 0.01],
      [-0.09, 1.14, 0.0],
    ],
    // Bolt 5: Center-top crown Haki fork
    [
      [0.01, 0.92, 0.02],
      [-0.04, 1.02, 0.01],
      [0.03, 1.10, -0.01],
      [-0.02, 1.18, -0.02],
    ],
  ];

  for (const pts of hakiBolts) {
    addHakiBolt(pts, 0.0062);
  }

  return group;
}

/**
 * Attaches all sculpted 3D Monkey D. Luffy Gear 5 Nika accessories directly to the 20-bone skeleton
 * using inverse rest-pose matrices so they animate seamlessly across all chapters and poses.
 */
export function attachLuffyToSkeleton(T, bones, uniforms) {
  const { yr, W } = T;
  uniforms.uNika = uniforms.uNika || { value: 1.0 };

  const createBoneRestAdapter = (bone) => {
    if (!bone) return null;
    const inv = new W().copy(bone.matrixWorld).invert();
    const adapter = new yr();
    inv.decompose(adapter.position, adapter.quaternion, adapter.scale);
    bone.add(adapter);
    return adapter;
  };

  const headAdapter = createBoneRestAdapter(bones.head);
  const chestAdapter = createBoneRestAdapter(bones.chest);

  if (headAdapter) {
    // 1. Sculpted Gear 5 Nika Flame Hair, Central Forehead Spiral Lock & Spiral Eyebrows
    const hair = createLuffyHairGroup(T, uniforms);
    headAdapter.add(hair);

    // 2. Iconic Sculpted Straw Hat slung on the back/nape of Luffy's neck so the full
    //    Gear 5 Nika flame hair & forehead spiral lock are 100% unobstructed from the front!
    const hat = createStrawHatMesh(T, uniforms);
    hat.position.set(0, 0.68, -0.145);
    hat.rotation.x = -1.22;
    headAdapter.add(hat);
  }

  if (chestAdapter) {
    // 3. Gear 5 Nika Crimson-Lit Hagoromo Cloud Scarf, Spiral Volutes & Black-Crimson Haki Lightning
    const cloudAndHaki = createNikaCloudAndHakiGroup(T, uniforms);
    chestAdapter.add(cloudAndHaki);
  }
}

/**
 * Populates Chapter 01 (Origin), Chapter 02 (Memory), Chapter 05 (Threshold), and Chapter 06 (Network)
 * with the 3D Gear 5 Nika Luffy presence and the Sunken Broken Pirate Galleon.
 */
export function installChapterLuffyPresence(T, chapters, heroFigure) {
  const { yr } = T;
  const sharedUniforms = {
    uShade: { value: 1.0 },
    uCharge: { value: 0.85 },
    uChargeT: { value: 0.0 },
    uNika: { value: 1.0 },
  };

  // Install the 3D Sunken Broken Pirate Galleon in Chapter 02 (Memory) and Chapter 06 (Network)
  try {
    installSunkenPirateShip(T, chapters, heroFigure);
  } catch (err) {
    console.warn("[pirate-ship] failed to install sunken galleon:", err);
  }

  // 1. Chapter 01 (Origin): Floating 3D Mugiwara Straw Hat & Nika Cloud/Haki Halo beside the Origin Lock
  const originChap = chapters[0];
  if (originChap) {
    const originShrine = new yr();
    originShrine.name = "origin-luffy-hat";
    const hat = createStrawHatMesh(T, sharedUniforms);
    hat.scale.setScalar(3.4);
    hat.rotation.set(0.32, -0.38, -0.18);
    originShrine.add(hat);

    const cloud = createNikaCloudAndHakiGroup(T, sharedUniforms);
    cloud.position.set(0, -1.65, 0);
    cloud.scale.setScalar(2.6);
    originShrine.add(cloud);

    originShrine.position.set(-2.35, 0.55, 2.6);
    originChap.group.add(originShrine);

    originChap.onUpdate(({ t, input }) => {
      sharedUniforms.uChargeT.value = t;
      originShrine.position.y = 0.55 + Math.sin(t * 1.1) * 0.14;
      originShrine.rotation.y = -0.35 + Math.sin(t * 0.45) * 0.18 + input.ndc.x * 0.15;
      originShrine.rotation.z = Math.cos(t * 0.6) * 0.06;
    });
  }

  // 2. Chapters 01, 02, 05, 06: Clone the rigged 3D Gear 5 Nika Luffy figure into the chapter slots!
  if (heroFigure && heroFigure.ready) {
    heroFigure.ready.then(() => {
      const slotConfigs = [
        { chapIdx: 1, slotName: "person", scale: 0.95, rotY: 0.25, awake: 1.0, fly: 0 },
        { chapIdx: 5, slotName: "figure", scale: 1.0, rotY: -0.4, awake: 1.0, fly: 0 },
      ];
      for (const cfg of slotConfigs) {
        const chap = chapters[cfg.chapIdx];
        const slot = chap && chap.slots && chap.slots[cfg.slotName];
        if (!slot) continue;
        const cloneFig = T.ky({ scale: cfg.scale * 2 });
        cloneFig.ready.then(() => {
          cloneFig.uniforms.uShade.value = 1.0;
          cloneFig.uniforms.uRim.value = 0.35;
          cloneFig.uniforms.uCharge.value = 0.85;
          cloneFig.group.rotation.y = cfg.rotY;
          slot.add(cloneFig.group);
          chap.onUpdate(({ t, dt, raycaster, input, camera }) => {
            cloneFig.uniforms.uChargeT.value = t;
            cloneFig.update({
              t,
              dt,
              raycaster,
              input,
              camera,
              awake: cfg.awake,
              fly: cfg.fly,
              stir: 0.35,
            });
          });
        });
      }
    });
  }
}
