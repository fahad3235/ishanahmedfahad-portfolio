// Project Card Canvas & Holographic HUD Texture Generator
// Creates 1280x720 crisp, high-DPI procedural textures for 3D monolith panels & modal previews
// Built for Ishan Ahmed Fahad's Portfolio

export function createProjectCardCanvas(p) {
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const hexToRgb = (hex) => {
    let c = hex.replace("#", "");
    if (c.length === 3) c = c.split("").map((x) => x + x).join("");
    const num = parseInt(c, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const primaryRgb = hexToRgb(p.color || "#ff3a26");
  const pCol = p.color || "#ff3a26";

  // 1. Deep Obsidian Gradient Base
  const bgGrad = ctx.createLinearGradient(0, 0, 1280, 720);
  bgGrad.addColorStop(0, "#080a10");
  bgGrad.addColorStop(0.5, "#0b0e17");
  bgGrad.addColorStop(1, "#040508");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1280, 720);

  // 2. Glowing Colored Ambient Flares
  const flareTopLeft = ctx.createRadialGradient(80, 80, 0, 80, 80, 480);
  flareTopLeft.addColorStop(0, `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.22)`);
  flareTopLeft.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = flareTopLeft;
  ctx.fillRect(0, 0, 1280, 720);

  const flareBottomRight = ctx.createRadialGradient(1160, 620, 0, 1160, 620, 420);
  flareBottomRight.addColorStop(0, `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.16)`);
  flareBottomRight.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = flareBottomRight;
  ctx.fillRect(0, 0, 1280, 720);

  // 3. Subterranean River / Grand Line Grid & Caustic Grid Lines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
  ctx.lineWidth = 1;
  for (let x = 40; x < 1280; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 720);
    ctx.stroke();
  }
  for (let y = 40; y < 720; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1280, y);
    ctx.stroke();
  }

  // Grand Line wave curves in background
  ctx.strokeStyle = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.12)`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let x = 0; x <= 1280; x += 20) {
    const y = 360 + Math.sin(x * 0.012) * 45 + Math.cos(x * 0.006) * 30;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // 4. Outer Porcelain Hallmark Border
  ctx.strokeStyle = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.35)`;
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, 1208, 648);

  // Decorative Corner Marks
  ctx.strokeStyle = pCol;
  ctx.lineWidth = 3;
  const corners = [
    [36, 36, 1, 1],
    [1244, 36, -1, 1],
    [36, 684, 1, -1],
    [1244, 684, -1, -1],
  ];
  for (const [cx, cy, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + dy * 24);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + dx * 24, cy);
    ctx.stroke();
  }

  // 5. Header Kicker Row
  ctx.font = "600 13px 'Geist', monospace, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.letterSpacing = "2px";
  ctx.fillText("ISHAN AHMED FAHAD // AI ENGINEER", 64, 82);

  ctx.fillStyle = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.9)`;
  ctx.fillText("● " + (p.tag || "FULL-STACK AI").toUpperCase(), 480, 82);

  ctx.fillStyle = "rgba(16, 185, 129, 0.95)";
  ctx.fillText("✓ ZERO-MISTAKE VERIFIED", 1020, 82);

  // 6. Project Title
  ctx.font = "700 52px 'Geist', 'Helvetica Neue', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(p.name, 64, 154);

  // 7. Award & Hackathon Badge Pill (Golden/Emerald Celebration for 2nd Place / National Runner-Up)
  if (p.award) {
    const isHonored = p.award.includes("2nd") || p.award.includes("Runner-Up");
    const badgeText = (isHonored ? "🏆 " : "★ ") + p.award;
    ctx.font = isHonored
      ? "700 15px 'Geist', monospace, sans-serif"
      : "600 14px 'Geist', monospace, sans-serif";
    const textWidth = ctx.measureText(badgeText).width;

    const badgeX = 64;
    const badgeY = 176;
    const badgeW = textWidth + (isHonored ? 32 : 28);
    const badgeH = isHonored ? 36 : 32;

    if (isHonored) {
      // Golden/Emerald gradient fill
      const grad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH);
      grad.addColorStop(0, "rgba(16, 185, 129, 0.32)"); // Vibrant Emerald
      grad.addColorStop(0.5, "rgba(245, 184, 46, 0.28)"); // Rich Gold
      grad.addColorStop(1, "rgba(16, 185, 129, 0.36)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 18);
      ctx.fill();

      // Outer golden glow border
      ctx.strokeStyle = "#f5b82e";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 18);
      ctx.stroke();

      // Text with golden sheen
      ctx.fillStyle = "#fef08a";
      ctx.fillText(badgeText, badgeX + 16, badgeY + 23);
    } else {
      ctx.fillStyle = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.18)`;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 16);
      ctx.fill();

      ctx.strokeStyle = pCol;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 16);
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.fillText(badgeText, badgeX + 14, badgeY + 21);
    }
  }

  // 8. Role & Competition Detail
  ctx.font = "500 16px 'Geist', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.fillText("Role: " + (p.role || "Lead System Developer"), 64, 246);

  // 9. Short Summary / Narrative
  ctx.font = "400 15px 'Geist', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  const descWords = (p.desc || "").split(" ");
  let line = "";
  let descY = 282;
  const maxLineW = 620;
  for (let n = 0; n < descWords.length; n++) {
    const testLine = line + descWords[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxLineW && n > 0) {
      ctx.fillText(line, 64, descY);
      line = descWords[n] + " ";
      descY += 24;
      if (descY > 380) {
        ctx.fillText(line.trim() + "...", 64, descY);
        break;
      }
    } else {
      line = testLine;
    }
  }
  if (descY <= 380 && line) {
    ctx.fillText(line, 64, descY);
  }

  // 10. Right-Side Holographic Interactive HUD Schematic
  const hudX = 760;
  const hudY = 120;
  const hudW = 440;
  const hudH = 340;

  // HUD Glass Box
  ctx.fillStyle = "rgba(10, 14, 22, 0.75)";
  ctx.beginPath();
  ctx.roundRect(hudX, hudY, hudW, hudH, 12);
  ctx.fill();

  ctx.strokeStyle = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.4)`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(hudX, hudY, hudW, hudH, 12);
  ctx.stroke();

  // HUD Header
  ctx.font = "600 12px 'Geist', monospace";
  ctx.fillStyle = pCol;
  ctx.fillText("SYSTEM TELEMETRY // AI ARCHITECTURE", hudX + 20, hudY + 30);

  // Radar / Concentric Rings inside HUD
  const radarCx = hudX + hudW / 2;
  const radarCy = hudY + 180;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  for (const r of [35, 70, 105]) {
    ctx.beginPath();
    ctx.arc(radarCx, radarCy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Crosshairs
  ctx.beginPath();
  ctx.moveTo(radarCx - 115, radarCy);
  ctx.lineTo(radarCx + 115, radarCy);
  ctx.moveTo(radarCx, radarCy - 115);
  ctx.lineTo(radarCx, radarCy + 115);
  ctx.stroke();

  // Glowing Telemetry Data Polygon
  ctx.fillStyle = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.22)`;
  ctx.strokeStyle = pCol;
  ctx.lineWidth = 2;
  ctx.beginPath();
  const polyAngles = [0, 1.1, 2.3, 3.4, 4.5, 5.6];
  const polyRadii = [88, 62, 95, 78, 85, 72];
  for (let i = 0; i < polyAngles.length; i++) {
    const a = polyAngles[i];
    const r = polyRadii[i];
    const px = radarCx + Math.cos(a) * r;
    const py = radarCy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Telemetry Metric Pills
  ctx.font = "700 14px 'Geist', monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(p.metric || "ACTIVE", hudX + 24, hudY + hudH - 24);

  ctx.font = "500 12px 'Geist', monospace";
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.fillText(p.metricLabel || "DIU CIS DEV ENGINE", hudX + 160, hudY + hudH - 24);

  // 11. Tech Stack Badges Row at Bottom
  ctx.font = "600 13px 'Geist', monospace";
  let pillX = 64;
  const pillY = 530;
  const stack = p.stack || ["Python", "FastAPI", "React", "Three.js", "AI Copilot"];
  for (const tech of stack.slice(0, 6)) {
    const tw = ctx.measureText(tech).width;
    const pw = tw + 20;

    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pw, 28, 6);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pw, 28, 6);
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fillText(tech, pillX + 10, pillY + 19);

    pillX += pw + 10;
  }

  // 12. Bottom Link / Navigation Indicators
  ctx.font = "500 13px 'Geist', monospace";
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.fillText("🔗 GITHUB: " + (p.repoUrl || "https://github.com/fahad3235"), 64, 620);

  if (p.liveUrl) {
    ctx.fillStyle = pCol;
    ctx.fillText("↗ LIVE DEMO: " + p.liveUrl, 64, 646);
  }

  // Watermark
  ctx.font = "700 12px 'Geist', monospace";
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.fillText("GRAND LINE DEVIL ABYSS // FAHAD3235", 940, 646);

  return canvas;
}
