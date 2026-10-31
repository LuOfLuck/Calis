import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Play, Pause } from 'lucide-react';

interface DigitalTwin3DProps {
  immersion: number; // 0 to 100
  onImmersionChange: (val: number) => void;
  externalCameraAngle?: 'iso' | 'side' | 'front';
}

// Reusable procedural texture generators (100% zero external file dependencies)
function createPoolTileTexture(maxAnisotropy: number): {
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  // Grout background
  cCtx.fillStyle = '#cbe7f0';
  cCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#404040';
  bCtx.fillRect(0, 0, size, size);

  const tiles = 16;
  const step = size / tiles;
  const gap = 2.5;

  const palette = [
    '#0284c7',
    '#0369a1',
    '#0ea5e9',
    '#00b4d8',
    '#38bdf8',
    '#0096c7',
    '#48cae4'
  ];

  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let y = 0; y < tiles; y++) {
    for (let x = 0; x < tiles; x++) {
      const px = x * step + gap;
      const py = y * step + gap;
      const w = step - gap * 2;
      const h = step - gap * 2;

      const baseColor = palette[Math.floor(rand() * palette.length)];
      cCtx.fillStyle = baseColor;
      cCtx.beginPath();
      cCtx.roundRect(px, py, w, h, 3);
      cCtx.fill();

      // Subtle glossy highlight inside each glass mosaic tile
      const grad = cCtx.createLinearGradient(px, py, px + w, py + h);
      grad.addColorStop(0, 'rgba(255,255,255,0.28)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.0)');
      grad.addColorStop(1, 'rgba(0,25,50,0.22)');
      cCtx.fillStyle = grad;
      cCtx.fillRect(px, py, w, h);

      // Bump map tile elevation
      bCtx.fillStyle = '#ececec';
      bCtx.beginPath();
      bCtx.roundRect(px, py, w, h, 3);
      bCtx.fill();
    }
  }

  const colorMap = new THREE.CanvasTexture(colorCanvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;
  colorMap.repeat.set(3.5, 3);
  colorMap.anisotropy = maxAnisotropy;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(3.5, 3);
  bumpMap.anisotropy = maxAnisotropy;

  return { colorMap, bumpMap };
}

function createDeckStoneTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, size, size);

  let seed = 101;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let i = 0; i < 3500; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const alpha = 0.02 + rand() * 0.04;
    ctx.fillStyle = rand() > 0.5 ? `rgba(148,163,184,${alpha})` : `rgba(255,255,255,${alpha * 1.5})`;
    ctx.fillRect(x, y, 2 + rand() * 6, 1 + rand() * 2);
  }

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  const slabs = 4;
  const step = size / slabs;
  for (let i = 0; i <= slabs; i++) {
    ctx.beginPath();
    ctx.moveTo(i * step, 0);
    ctx.lineTo(i * step, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * step);
    ctx.lineTo(size, i * step);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 3);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createAntiSlipGripTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#334155';
  const rows = 8;
  const cols = 4;
  const cellW = size / cols;
  const cellH = size / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.beginPath();
      ctx.roundRect(c * cellW + 6, r * cellH + 5, cellW - 12, cellH - 10, 4);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createRoundedBoxGeo(w: number, h: number, d: number, radius = 0.03, bevel = 0.015): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const hw = w / 2 - bevel;
  const hh = h / 2 - bevel;
  const r = Math.min(radius, hw, hh);

  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
  shape.lineTo(hw, hh - r);
  shape.quadraticCurveTo(hw, hh, hw - r, hh);
  shape.lineTo(-hw + r, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
  shape.lineTo(-hw, -hh + r);
  shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: d - bevel * 2,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: bevel,
    bevelThickness: bevel
  });
  geo.center();
  return geo;
}

interface StepAssembly {
  pivotGroup: THREE.Group;
  treadGroup: THREE.Group;
}

export const DigitalTwin3D: React.FC<DigitalTwin3DProps> = ({
  immersion,
  onImmersionChange,
  externalCameraAngle
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isAutoCycle, setIsAutoCycle] = useState(false);
  const autoCycleRef = useRef<number | null>(null);

  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    carriageGroup: THREE.Group;
    pistonRodLeft: THREE.Mesh;
    pistonRodRight: THREE.Mesh;
    parallelBarsGroup: THREE.Group;
    overheadPortalGroup: THREE.Group;
    waterSurfaceGeo: THREE.PlaneGeometry;
    waterSurfaceBasePos: Float32Array;
    bubblesSystem: THREE.Points;
    bubbleVelocities: Float32Array;
    stepAssemblies: StepAssembly[];
    stringerBarLeft: THREE.Mesh;
    stringerBarRight: THREE.Mesh;
    handrailLeft: THREE.Mesh;
    handrailRight: THREE.Mesh;
    causticLight: THREE.PointLight;
    targetCamAngle: { theta: number; phi: number; dist: number; lookY: number };
    currentCamAngle: { theta: number; phi: number; dist: number; lookY: number };
    targetImmersion: number;
    currentImmersion: number;
  } | null>(null);

  const setCameraAngle = (preset: 'iso' | 'side' | 'front') => {
    if (!threeRef.current) return;
    if (preset === 'iso') {
      threeRef.current.targetCamAngle = { theta: 0.68, phi: 1.08, dist: 11.4, lookY: 0.1 };
    } else if (preset === 'side') {
      threeRef.current.targetCamAngle = { theta: 0.02, phi: 1.36, dist: 10.8, lookY: 0.0 };
    } else if (preset === 'front') {
      threeRef.current.targetCamAngle = { theta: 1.48, phi: 1.16, dist: 10.6, lookY: 0.1 };
    }
  };

  useEffect(() => {
    if (externalCameraAngle) {
      setCameraAngle(externalCameraAngle);
    }
  }, [externalCameraAngle]);

  useEffect(() => {
    if (threeRef.current) {
      threeRef.current.targetImmersion = immersion / 100;
    }
  }, [immersion]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 540;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.015);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Environment Map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const { colorMap: poolTileMap, bumpMap: poolTileBump } = createPoolTileTexture(maxAnisotropy);
    const deckStoneMap = createDeckStoneTexture(maxAnisotropy);
    const antiSlipMap = createAntiSlipGripTexture(maxAnisotropy);

    // ============================================================================
    // STUDIO & AQUATIC LIGHTING RIG
    // ============================================================================
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbae6fd, 0.85);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
    keyLight.position.set(7, 14, 9);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -7;
    keyLight.shadow.camera.right = 7;
    keyLight.shadow.camera.top = 7;
    keyLight.shadow.camera.bottom = -7;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
    rimLight.position.set(-9, 8, -7);
    scene.add(rimLight);

    const causticLight = new THREE.PointLight(0x00f2fe, 2.4, 14, 1.5);
    causticLight.position.set(1.8, -0.5, 0.5);
    scene.add(causticLight);

    const underwaterWallLight1 = new THREE.PointLight(0x38bdf8, 1.6, 10, 1.5);
    underwaterWallLight1.position.set(-1.7, -1.6, -1.6);
    scene.add(underwaterWallLight1);

    const underwaterWallLight2 = new THREE.PointLight(0x38bdf8, 1.6, 10, 1.5);
    underwaterWallLight2.position.set(-1.7, -1.6, 1.6);
    scene.add(underwaterWallLight2);

    // ============================================================================
    // HYPER-REALISTIC PBR MATERIALS
    // ============================================================================
    const deckStoneMat = new THREE.MeshStandardMaterial({
      map: deckStoneMap,
      roughness: 0.42,
      metalness: 0.05
    });

    const copingMarbleMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      roughness: 0.22,
      metalness: 0.05,
      clearcoat: 0.35,
      clearcoatRoughness: 0.2
    });

    const poolTileMat = new THREE.MeshPhysicalMaterial({
      map: poolTileMap,
      bumpMap: poolTileBump,
      bumpScale: 0.015,
      roughness: 0.14,
      metalness: 0.05,
      clearcoat: 0.85,
      clearcoatRoughness: 0.1
    });

    const concreteCutMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.75,
      metalness: 0.05
    });

    const brushedSteelMat = new THREE.MeshPhysicalMaterial({
      color: 0xdbeafe,
      metalness: 0.92,
      roughness: 0.22,
      clearcoat: 0.25
    });

    const polishedChromeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.98,
      roughness: 0.06,
      clearcoat: 0.5
    });

    const darkTitaniumMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      metalness: 0.82,
      roughness: 0.32
    });

    const nonSlipPlatformMat = new THREE.MeshStandardMaterial({
      map: antiSlipMap,
      roughness: 0.55,
      metalness: 0.25
    });

    const medicalUpholsteryMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      roughness: 0.35,
      metalness: 0.02,
      clearcoat: 0.25,
      clearcoatRoughness: 0.4,
      sheen: 0.4,
      sheenColor: new THREE.Color(0xe0f2fe)
    });

    const cyanAccentTrimMat = new THREE.MeshPhysicalMaterial({
      color: 0x00d4ea,
      emissive: 0x00a8c6,
      emissiveIntensity: 0.28,
      roughness: 0.2,
      metalness: 0.3,
      clearcoat: 0.8
    });

    const goldCalisthenicsGripMat = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.18,
      roughness: 0.28,
      metalness: 0.65,
      clearcoat: 0.4
    });

    const safetyStrapMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.7,
      metalness: 0.1
    });

    // ============================================================================
    // 1. ARCHITECTURAL CUTAWAY POOL & DECK STRUCTURE
    // Pool vertical wall face is at X = -2.35
    // ============================================================================
    const poolEnvironment = new THREE.Group();

    // Left Dry Pool Deck Block
    const deckBlock = new THREE.Mesh(new THREE.BoxGeometry(3.6, 5.2, 6.4), deckStoneMat);
    deckBlock.position.set(-4.2, -0.4, 0);
    deckBlock.receiveShadow = true;
    poolEnvironment.add(deckBlock);

    // Bullnose Marble Pool Coping Edge (Overhangs up to X = -2.28, Top at Y = 2.32)
    const copingStone = new THREE.Mesh(createRoundedBoxGeo(0.76, 0.22, 6.44, 0.06, 0.03), copingMarbleMat);
    copingStone.position.set(-2.66, 2.24, 0);
    copingStone.castShadow = true;
    copingStone.receiveShadow = true;
    poolEnvironment.add(copingStone);

    // Stainless Steel Drainage Gutter Channel along deck
    const gutterChannel = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 6.4), brushedSteelMat);
    gutterChannel.position.set(-3.16, 2.34, 0);
    poolEnvironment.add(gutterChannel);

    // Pool Inner Tiled Wall (Vertical Drop Wall at X = -2.35)
    const innerLeftWall = new THREE.Mesh(new THREE.BoxGeometry(0.18, 5.1, 6.2), poolTileMat);
    innerLeftWall.position.set(-2.35, -0.42, 0);
    innerLeftWall.receiveShadow = true;
    poolEnvironment.add(innerLeftWall);

    // Pool Tiled Floor Slab
    const poolFloor = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.35, 6.2), poolTileMat);
    poolFloor.position.set(1.4, -2.85, 0);
    poolFloor.receiveShadow = true;
    poolEnvironment.add(poolFloor);

    // Back Tiled Pool Wall
    const backPoolWall = new THREE.Mesh(new THREE.BoxGeometry(7.7, 5.1, 0.25), poolTileMat);
    backPoolWall.position.set(1.45, -0.42, -3.05);
    backPoolWall.receiveShadow = true;
    poolEnvironment.add(backPoolWall);

    // Right End Cutaway Wall
    const rightWallCurb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 6.4), concreteCutMat);
    rightWallCurb.position.set(5.15, -2.4, 0);
    poolEnvironment.add(rightWallCurb);

    // Tempered Architectural Viewing Window on Front Cutaway Side (Z = +3.06)
    const frontGlassCurb = new THREE.Mesh(new THREE.BoxGeometry(7.7, 0.55, 0.28), concreteCutMat);
    frontGlassCurb.position.set(1.45, -2.75, 3.06);
    poolEnvironment.add(frontGlassCurb);

    const glassWindowMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f7fa,
      transparent: true,
      opacity: isSoftwareGl ? 0.22 : 0.32,
      roughness: 0.05,
      metalness: 0.05,
      ior: 1.52,
      clearcoat: 1.0,
      depthWrite: false
    });
    const frontGlassPanel = new THREE.Mesh(new THREE.BoxGeometry(7.4, 3.8, 0.08), glassWindowMat);
    frontGlassPanel.position.set(1.4, -0.6, 3.06);
    frontGlassPanel.renderOrder = 3;
    poolEnvironment.add(frontGlassPanel);

    [-1.4, 0.4, 2.2, 4.0].forEach((xClamp) => {
      const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.35, 0.18), brushedSteelMat);
      clamp.position.set(xClamp, -2.45, 3.08);
      poolEnvironment.add(clamp);
    });

    // Recessed Underwater Pool Wall LED Luminaires
    [-1.6, 1.6].forEach((zLamp) => {
      const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 24), polishedChromeMat);
      bezel.rotation.z = Math.PI / 2;
      bezel.position.set(-2.25, -1.6, zLamp);
      poolEnvironment.add(bezel);

      const lens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.21, 0.21, 0.07, 24),
        new THREE.MeshBasicMaterial({ color: 0x7dd3fc })
      );
      lens.rotation.z = Math.PI / 2;
      lens.position.set(-2.24, -1.6, zLamp);
      poolEnvironment.add(lens);
    });

    // Pool Floor Drain Grates
    [0.6, 3.3].forEach((xDrain) => {
      const drainFrame = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.03, 0.55), brushedSteelMat);
      drainFrame.position.set(xDrain, -2.67, -1.5);
      poolEnvironment.add(drainFrame);
    });

    scene.add(poolEnvironment);

    // ============================================================================
    // 2. 45° INCLINED LINEAR GUIDE RAILS & HYDRAULIC TELE-CYLINDERS
    // Aligned precisely with the rear roller bogies of the carriage:
    // Bogie world coords:
    //   At imm = 0: (-2.14, 1.98)
    //   At imm = 1: (+0.91, -1.07)
    //   Line equation: X - (-2.14) = -(Y - 1.98)  =>  X + Y = -0.16
    // ============================================================================
    const trackGroup = new THREE.Group();
    const railStartX = -2.32;
    const railStartY = 2.16;
    const railEndX = 2.40;
    const railEndY = -2.56;
    const trackCenterX = (railStartX + railEndX) * 0.5; // 0.04
    const trackCenterY = (railStartY + railEndY) * 0.5; // -0.20
    const trackLength = Math.hypot(railEndX - railStartX, railEndY - railStartY);

    [-1.22, 1.22].forEach((zRail) => {
      // Main Upper 45° Guide Tube
      const upperRail = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, trackLength, 20), brushedSteelMat);
      upperRail.position.set(trackCenterX, trackCenterY, zRail);
      upperRail.rotation.z = Math.PI / 4;
      upperRail.castShadow = true;
      trackGroup.add(upperRail);

      // Lower Secondary Structural Tube
      const lowerRail = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, trackLength, 20), darkTitaniumMat);
      lowerRail.position.set(trackCenterX - 0.14, trackCenterY - 0.14, zRail);
      lowerRail.rotation.z = Math.PI / 4;
      trackGroup.add(lowerRail);

      // Top Deck Mounting Stanchion Anchor
      const topAnchor = new THREE.Mesh(createRoundedBoxGeo(0.44, 0.22, 0.28, 0.03, 0.01), brushedSteelMat);
      topAnchor.position.set(-2.42, 2.25, zRail);
      trackGroup.add(topAnchor);

      // Pool Floor Anchor Baseplate
      const bottomAnchor = new THREE.Mesh(createRoundedBoxGeo(0.52, 0.14, 0.36, 0.03, 0.01), brushedSteelMat);
      bottomAnchor.position.set(2.38, -2.62, zRail);
      trackGroup.add(bottomAnchor);
    });

    // Hydraulic Actuator Outer Barrels (Mounted parallel to upper rails at z = ±1.31)
    const barrelLength = 2.75;
    [-1.31, 1.31].forEach((zHyd) => {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, barrelLength, 20), darkTitaniumMat);
      barrel.position.set(-1.35, 1.19, zHyd);
      barrel.rotation.z = Math.PI / 4;
      trackGroup.add(barrel);
    });

    // Telescoping Chrome Piston Rods (Animated to follow carriage bogies)
    const pistonGeo = new THREE.CylinderGeometry(0.036, 0.036, 3.2, 20);
    const pistonRodLeft = new THREE.Mesh(pistonGeo, polishedChromeMat);
    pistonRodLeft.rotation.z = Math.PI / 4;
    trackGroup.add(pistonRodLeft);

    const pistonRodRight = new THREE.Mesh(pistonGeo, polishedChromeMat);
    pistonRodRight.rotation.z = Math.PI / 4;
    trackGroup.add(pistonRodRight);

    // Cross-members tying the two diagonal rails together underneath
    for (let i = 0; i < 5; i++) {
      const f = (i + 0.5) / 5;
      const cx = railStartX + (railEndX - railStartX) * f - 0.16;
      const cy = railStartY + (railEndY - railStartY) * f - 0.16;
      const tieBar = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 2.44, 12), darkTitaniumMat);
      tieBar.rotation.x = Math.PI / 2;
      tieBar.position.set(cx, cy, 0);
      trackGroup.add(tieBar);
    }

    scene.add(trackGroup);

    // ============================================================================
    // 3. ARTICULATING PARALLELOGRAM STAIRCASE ("ESCALERA AUTOMÁTICA")
    // Strictly spans between Deck Edge (-2.32, 2.20) and Platform Rear Edge!
    // ============================================================================
    const stepAssemblies: StepAssembly[] = [];
    const numSteps = 6;

    for (let i = 0; i < numSteps; i++) {
      const pivotGroup = new THREE.Group();
      const treadGroup = new THREE.Group();

      // Main Structural Step Plate (Depth 0.44m so half-depth is 0.22m)
      const stepFrame = new THREE.Mesh(createRoundedBoxGeo(0.44, 0.06, 2.02, 0.02, 0.01), brushedSteelMat);
      stepFrame.castShadow = true;
      stepFrame.receiveShadow = true;
      treadGroup.add(stepFrame);

      // Non-Slip Dark Polymer Grip Insert on Top of Step
      const gripPad = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.016, 1.90), nonSlipPlatformMat);
      gripPad.position.set(0, 0.035, 0);
      treadGroup.add(gripPad);

      // Glowing Cyan Safety Leading-Edge Strip
      const edgeLed = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.024, 1.92), cyanAccentTrimMat);
      edgeLed.position.set(0.205, 0.018, 0);
      treadGroup.add(edgeLed);

      // Side Pivot Brackets & Pins
      [-1.03, 1.03].forEach((zSide) => {
        const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.04), darkTitaniumMat);
        bracket.position.set(0, -0.04, zSide);
        treadGroup.add(bracket);

        const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.08, 12), polishedChromeMat);
        pin.rotation.x = Math.PI / 2;
        pin.position.set(0, -0.045, zSide);
        treadGroup.add(pin);
      });

      pivotGroup.add(treadGroup);
      scene.add(pivotGroup);
      stepAssemblies.push({ pivotGroup, treadGroup });
    }

    // Articulating Parallelogram Side Stringer Bars (Unit length 1.0 along X, scaled dynamically)
    const stringerGeo = new THREE.BoxGeometry(1.0, 0.075, 0.045);
    const stringerBarLeft = new THREE.Mesh(stringerGeo, brushedSteelMat);
    const stringerBarRight = new THREE.Mesh(stringerGeo, brushedSteelMat);
    scene.add(stringerBarLeft);
    scene.add(stringerBarRight);

    // Telescoping Staircase Handrails (Unit length 1.0 along X, spanning strictly over stairs)
    const handrailGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.0, 16);
    handrailGeo.rotateZ(Math.PI / 2); // Align cylinder along X axis so scaling X scales length cleanly
    const handrailLeft = new THREE.Mesh(handrailGeo, polishedChromeMat);
    const handrailRight = new THREE.Mesh(handrailGeo, polishedChromeMat);
    scene.add(handrailLeft);
    scene.add(handrailRight);

    // ============================================================================
    // 4. SUBMERSIBLE CARRIAGE, ERGONOMIC CHAIR & CALISTHENICS STATION
    // Platform spans local X from -1.08 (rear edge) to +1.08 (front edge)
    // ============================================================================
    const carriageGroup = new THREE.Group();

    // --- 4A. Submersible Hydro-Platform Base ---
    const platformOuterFrame = new THREE.Mesh(
      createRoundedBoxGeo(2.16, 0.18, 2.34, 0.07, 0.025),
      brushedSteelMat
    );
    platformOuterFrame.castShadow = true;
    platformOuterFrame.receiveShadow = true;
    carriageGroup.add(platformOuterFrame);

    // Recessed Slotted Anti-Slip Floor Deck
    const platformDeckFloor = new THREE.Mesh(
      new THREE.BoxGeometry(1.96, 0.04, 2.12),
      nonSlipPlatformMat
    );
    platformDeckFloor.position.set(0, 0.085, 0);
    platformDeckFloor.receiveShadow = true;
    carriageGroup.add(platformDeckFloor);

    // Perimeter Cyan Bio-Illumination Bumper Strip
    const perimeterGlow = new THREE.Mesh(
      createRoundedBoxGeo(2.20, 0.055, 2.38, 0.07, 0.01),
      cyanAccentTrimMat
    );
    perimeterGlow.position.set(0, 0.0, 0);
    carriageGroup.add(perimeterGlow);

    // Under-Platform Cantilever Subframe & Roller Bogies (at local X = -0.92, Y = -0.14, Z = ±1.22)
    const subframeWedge = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.32, 2.18), darkTitaniumMat);
    subframeWedge.position.set(-0.28, -0.22, 0);
    carriageGroup.add(subframeWedge);

    [-1.22, 1.22].forEach((zRoller) => {
      const bogieHousing = new THREE.Mesh(createRoundedBoxGeo(0.52, 0.22, 0.15, 0.03, 0.01), cyanAccentTrimMat);
      bogieHousing.position.set(-0.92, -0.14, zRoller);
      bogieHousing.rotation.z = Math.PI / 4;
      carriageGroup.add(bogieHousing);

      [-0.16, 0.16].forEach((offset) => {
        const rollerWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.17, 16), polishedChromeMat);
        rollerWheel.rotation.x = Math.PI / 2;
        rollerWheel.position.set(-0.92 + offset * 0.7, -0.14 - offset * 0.7, zRoller);
        carriageGroup.add(rollerWheel);
      });
    });

    // --- 4B. Ergonomic Medical Postural Chair ("Silla Postural") ---
    // Positioned at local X = -0.02 so its backrest (local X = -0.42) is 0.66m ahead of rear edge (-1.08)!
    const chairGroup = new THREE.Group();
    chairGroup.position.set(-0.02, 0.09, 0);

    // Magnetic Docking Base & Telescopic Shock-Absorbing Pedestal
    const dockBase = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.08, 24), darkTitaniumMat);
    dockBase.position.set(0, 0.04, 0);
    chairGroup.add(dockBase);

    const dockGlowRing = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.015, 12, 32), cyanAccentTrimMat);
    dockGlowRing.rotation.x = Math.PI / 2;
    dockGlowRing.position.set(0, 0.05, 0);
    chairGroup.add(dockGlowRing);

    const pedestalOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.34, 24), brushedSteelMat);
    pedestalOuter.position.set(-0.05, 0.22, 0);
    pedestalOuter.rotation.z = 0.08;
    chairGroup.add(pedestalOuter);

    const pedestalInner = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.28, 24), polishedChromeMat);
    pedestalInner.position.set(-0.07, 0.38, 0);
    pedestalInner.rotation.z = 0.08;
    chairGroup.add(pedestalInner);

    // Under-Seat Structural Cradle Chassis
    const seatChassis = new THREE.Mesh(createRoundedBoxGeo(0.76, 0.08, 0.74, 0.03, 0.01), darkTitaniumMat);
    seatChassis.position.set(-0.02, 0.50, 0);
    chairGroup.add(seatChassis);

    // Sculpted Anatomical Seat Cushion + Side Thigh Bolsters
    const seatCushion = new THREE.Mesh(createRoundedBoxGeo(0.84, 0.13, 0.80, 0.05, 0.03), medicalUpholsteryMat);
    seatCushion.position.set(0.02, 0.58, 0);
    seatCushion.rotation.z = -0.04;
    seatCushion.castShadow = true;
    chairGroup.add(seatCushion);

    [-0.37, 0.37].forEach((zBolster) => {
      const thighBolster = new THREE.Mesh(createRoundedBoxGeo(0.80, 0.08, 0.13, 0.03, 0.02), medicalUpholsteryMat);
      thighBolster.position.set(0.02, 0.64, zBolster);
      thighBolster.rotation.z = -0.04;
      chairGroup.add(thighBolster);

      const cyanPiping = new THREE.Mesh(createRoundedBoxGeo(0.81, 0.02, 0.03, 0.01, 0.005), cyanAccentTrimMat);
      cyanPiping.position.set(0.02, 0.67, zBolster * 1.12);
      cyanPiping.rotation.z = -0.04;
      chairGroup.add(cyanPiping);
    });

    // Dual Curved Spine Frame Tubes behind Backrest
    [-0.22, 0.22].forEach((zSpine) => {
      const spineTube = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.038, 1.25, 16), brushedSteelMat);
      spineTube.position.set(-0.44, 1.15, zSpine);
      spineTube.rotation.z = 0.14;
      chairGroup.add(spineTube);
    });

    // Contoured Thoracic & Lumbar Backrest Cushion
    const backrestMain = new THREE.Mesh(createRoundedBoxGeo(0.14, 1.08, 0.76, 0.05, 0.035), medicalUpholsteryMat);
    backrestMain.position.set(-0.36, 1.18, 0);
    backrestMain.rotation.z = 0.14;
    backrestMain.castShadow = true;
    chairGroup.add(backrestMain);

    // Lumbar Support Pillow
    const lumbarPad = new THREE.Mesh(createRoundedBoxGeo(0.09, 0.28, 0.60, 0.04, 0.025), medicalUpholsteryMat);
    lumbarPad.position.set(-0.27, 0.88, 0);
    lumbarPad.rotation.z = 0.14;
    chairGroup.add(lumbarPad);

    // Lateral Trunk Support Wings
    [-0.40, 0.40].forEach((zWing) => {
      const lateralWing = new THREE.Mesh(createRoundedBoxGeo(0.24, 0.62, 0.11, 0.03, 0.02), medicalUpholsteryMat);
      lateralWing.position.set(-0.30, 1.25, zWing);
      lateralWing.rotation.z = 0.14;
      lateralWing.rotation.y = zWing > 0 ? -0.28 : 0.28;
      chairGroup.add(lateralWing);

      const wingTrim = new THREE.Mesh(createRoundedBoxGeo(0.25, 0.63, 0.025, 0.02, 0.005), cyanAccentTrimMat);
      wingTrim.position.set(-0.30, 1.25, zWing * 1.12);
      wingTrim.rotation.z = 0.14;
      chairGroup.add(wingTrim);
    });

    // 4-Point Neoprene Chest Harness & Center Buckle
    [-0.16, 0.16].forEach((zStrap) => {
      const vStrap = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.95, 0.085), safetyStrapMat);
      vStrap.position.set(-0.28, 1.18, zStrap);
      vStrap.rotation.z = 0.14;
      chairGroup.add(vStrap);
    });
    const centerBuckle = new THREE.Mesh(createRoundedBoxGeo(0.05, 0.14, 0.16, 0.02, 0.01), cyanAccentTrimMat);
    centerBuckle.position.set(-0.26, 1.15, 0);
    centerBuckle.rotation.z = 0.14;
    chairGroup.add(centerBuckle);

    // Cervical Headrest with Twin Chrome Guide Rods
    [-0.14, 0.14].forEach((zRod) => {
      const headRod = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.28, 12), polishedChromeMat);
      headRod.position.set(-0.45, 1.78, zRod);
      headRod.rotation.z = 0.14;
      chairGroup.add(headRod);
    });

    const headrestCushion = new THREE.Mesh(createRoundedBoxGeo(0.16, 0.26, 0.46, 0.04, 0.025), medicalUpholsteryMat);
    headrestCushion.position.set(-0.46, 1.92, 0);
    headrestCushion.rotation.z = 0.10;
    chairGroup.add(headrestCushion);

    const headrestAccent = new THREE.Mesh(createRoundedBoxGeo(0.17, 0.08, 0.48, 0.02, 0.01), cyanAccentTrimMat);
    headrestAccent.position.set(-0.47, 1.92, 0);
    headrestAccent.rotation.z = 0.10;
    chairGroup.add(headrestAccent);

    // Flip-Up Contoured Armrests + Waterproof Control Module
    [-0.47, 0.47].forEach((zArm, idx) => {
      const armSupport = new THREE.Mesh(createRoundedBoxGeo(0.12, 0.38, 0.05, 0.02, 0.01), brushedSteelMat);
      armSupport.position.set(-0.26, 0.76, zArm);
      armSupport.rotation.z = -0.18;
      chairGroup.add(armSupport);

      const armPad = new THREE.Mesh(createRoundedBoxGeo(0.66, 0.075, 0.11, 0.025, 0.015), darkTitaniumMat);
      armPad.position.set(0.04, 0.94, zArm);
      chairGroup.add(armPad);

      const armCyanStrip = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.018, 0.115), cyanAccentTrimMat);
      armCyanStrip.position.set(0.04, 0.94, zArm);
      chairGroup.add(armCyanStrip);

      if (idx === 1) {
        const ctrlBox = new THREE.Mesh(createRoundedBoxGeo(0.22, 0.06, 0.13, 0.02, 0.01), brushedSteelMat);
        ctrlBox.position.set(0.42, 0.95, zArm);
        chairGroup.add(ctrlBox);

        const joystick = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.012, 0.08, 12), cyanAccentTrimMat);
        joystick.position.set(0.44, 1.01, zArm);
        chairGroup.add(joystick);
      }
    });

    // Articulated Footrest Hanger, Calf Pad & Non-Slip Footplate
    [-0.23, 0.23].forEach((zLeg) => {
      const legTube = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.022, 0.56, 12), brushedSteelMat);
      legTube.position.set(0.52, 0.34, zLeg);
      legTube.rotation.z = -0.42;
      chairGroup.add(legTube);
    });

    const calfPad = new THREE.Mesh(createRoundedBoxGeo(0.07, 0.22, 0.50, 0.02, 0.015), medicalUpholsteryMat);
    calfPad.position.set(0.49, 0.36, 0);
    calfPad.rotation.z = -0.42;
    chairGroup.add(calfPad);

    const footplate = new THREE.Mesh(createRoundedBoxGeo(0.30, 0.04, 0.54, 0.02, 0.01), darkTitaniumMat);
    footplate.position.set(0.70, 0.11, 0);
    footplate.rotation.z = 0.08;
    chairGroup.add(footplate);

    carriageGroup.add(chairGroup);

    // --- 4C. Deployable Aquatic Calisthenics Station (Parallel Bars + Overhead Pull-Up Portal) ---
    const parallelBarsGroup = new THREE.Group();
    [-0.88, 0.88].forEach((zBar) => {
      [-0.28, 0.86].forEach((xPost) => {
        const baseSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.35, 16), darkTitaniumMat);
        baseSleeve.position.set(xPost, 0.25, zBar);
        parallelBarsGroup.add(baseSleeve);

        const chromeStanchion = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.05, 16), polishedChromeMat);
        chromeStanchion.position.set(xPost, 0.62, zBar);
        parallelBarsGroup.add(chromeStanchion);

        const lockingCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.06, 16), cyanAccentTrimMat);
        lockingCollar.position.set(xPost, 0.42, zBar);
        parallelBarsGroup.add(lockingCollar);
      });

      const dipBar = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 1.48, 20), brushedSteelMat);
      dipBar.rotation.z = Math.PI / 2;
      dipBar.position.set(0.29, 1.15, zBar);
      dipBar.castShadow = true;
      parallelBarsGroup.add(dipBar);

      const gripSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.74, 20), goldCalisthenicsGripMat);
      gripSleeve.rotation.z = Math.PI / 2;
      gripSleeve.position.set(0.38, 1.15, zBar);
      parallelBarsGroup.add(gripSleeve);
    });
    carriageGroup.add(parallelBarsGroup);

    // Overhead Pull-Up / Suspension Portal Arch ("Pórtico Superior")
    const overheadPortalGroup = new THREE.Group();
    [-0.88, 0.88].forEach((zPortal) => {
      const upperMast = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.042, 1.35, 16), brushedSteelMat);
      upperMast.position.set(0.86, 1.78, zPortal);
      overheadPortalGroup.add(upperMast);

      const topGusset = new THREE.Mesh(createRoundedBoxGeo(0.28, 0.14, 0.08, 0.02, 0.01), darkTitaniumMat);
      topGusset.position.set(0.79, 2.42, zPortal);
      overheadPortalGroup.add(topGusset);
    });

    const mainPullupBar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.92, 20), polishedChromeMat);
    mainPullupBar.rotation.x = Math.PI / 2;
    mainPullupBar.position.set(0.74, 2.45, 0);
    mainPullupBar.castShadow = true;
    overheadPortalGroup.add(mainPullupBar);

    [-0.52, 0.52].forEach((zGrip) => {
      const pullupGrip = new THREE.Mesh(new THREE.CylinderGeometry(0.054, 0.054, 0.42, 20), goldCalisthenicsGripMat);
      pullupGrip.rotation.x = Math.PI / 2;
      pullupGrip.position.set(0.74, 2.45, zGrip);
      overheadPortalGroup.add(pullupGrip);
    });

    const centerAnchorCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 16), cyanAccentTrimMat);
    centerAnchorCollar.rotation.x = Math.PI / 2;
    centerAnchorCollar.position.set(0.74, 2.45, 0);
    overheadPortalGroup.add(centerAnchorCollar);

    carriageGroup.add(overheadPortalGroup);
    scene.add(carriageGroup);

    // ============================================================================
    // 5. REALISTIC MULTI-LAYER ANIMATED WATER VOLUME & WAVE SURFACE
    // ============================================================================
    const waterVolumeGeo = new THREE.BoxGeometry(7.35, 3.55, 5.95);
    const waterVolumeMat = new THREE.MeshPhysicalMaterial({
      color: 0x00b4d8,
      transparent: true,
      opacity: 0.24,
      roughness: 0.1,
      metalness: 0.0,
      ior: 1.333,
      depthWrite: false
    });
    const waterVolumeMesh = new THREE.Mesh(waterVolumeGeo, waterVolumeMat);
    waterVolumeMesh.position.set(1.42, -0.92, 0);
    waterVolumeMesh.renderOrder = 1;
    scene.add(waterVolumeMesh);

    const waterSurfaceGeo = new THREE.PlaneGeometry(7.35, 5.95, 56, 48);
    waterSurfaceGeo.rotateX(-Math.PI / 2);
    const waterSurfaceBasePos = new Float32Array(waterSurfaceGeo.attributes.position.array);

    const waterSurfaceMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.12,
      transparent: true,
      opacity: isSoftwareGl ? 0.45 : 0.62,
      roughness: 0.06,
      metalness: 0.08,
      ior: 1.333,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const waterSurfaceMesh = new THREE.Mesh(waterSurfaceGeo, waterSurfaceMat);
    waterSurfaceMesh.position.set(1.42, 0.86, 0);
    waterSurfaceMesh.renderOrder = 2;
    scene.add(waterSurfaceMesh);

    // ============================================================================
    // 6. HYDROTHERAPY MICRO-BUBBLES PARTICLE STREAM
    // ============================================================================
    const bubbleCount = 110;
    const bubbleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(bubbleCount * 3);
    const bubbleVelocities = new Float32Array(bubbleCount);

    for (let i = 0; i < bubbleCount; i++) {
      positions[i * 3] = -1.6 + Math.random() * 6.0;
      positions[i * 3 + 1] = -2.6 + Math.random() * 3.3;
      positions[i * 3 + 2] = -2.4 + Math.random() * 4.8;
      bubbleVelocities[i] = 0.012 + Math.random() * 0.022;
    }
    bubbleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 64;
    spriteCanvas.height = 64;
    const sCtx = spriteCanvas.getContext('2d')!;
    const sGrad = sCtx.createRadialGradient(28, 24, 2, 32, 32, 28);
    sGrad.addColorStop(0, 'rgba(255,255,255,0.95)');
    sGrad.addColorStop(0.5, 'rgba(125,211,252,0.65)');
    sGrad.addColorStop(0.85, 'rgba(0,242,254,0.35)');
    sGrad.addColorStop(1, 'rgba(0,242,254,0)');
    sCtx.fillStyle = sGrad;
    sCtx.beginPath();
    sCtx.arc(32, 32, 28, 0, Math.PI * 2);
    sCtx.fill();
    const bubbleTex = new THREE.CanvasTexture(spriteCanvas);
    bubbleTex.colorSpace = THREE.SRGBColorSpace;

    const bubbleMat = new THREE.PointsMaterial({
      map: bubbleTex,
      size: 0.16,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const bubblesSystem = new THREE.Points(bubbleGeo, bubbleMat);
    bubblesSystem.renderOrder = 2;
    scene.add(bubblesSystem);

    threeRef.current = {
      scene,
      camera,
      renderer,
      carriageGroup,
      pistonRodLeft,
      pistonRodRight,
      parallelBarsGroup,
      overheadPortalGroup,
      waterSurfaceGeo,
      waterSurfaceBasePos,
      bubblesSystem,
      bubbleVelocities,
      stepAssemblies,
      stringerBarLeft,
      stringerBarRight,
      handrailLeft,
      handrailRight,
      causticLight,
      targetCamAngle: { theta: 0.68, phi: 1.08, dist: 11.4, lookY: 0.1 },
      currentCamAngle: { theta: 0.68, phi: 1.08, dist: 11.4, lookY: 0.1 },
      targetImmersion: immersion / 100,
      currentImmersion: immersion / 100
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // ============================================================================
    // INTERACTIVE ORBIT CONTROLS
    // ============================================================================
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    const domElem = renderer.domElement;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !threeRef.current) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      threeRef.current.targetCamAngle.theta -= dx * 0.0075;
      threeRef.current.targetCamAngle.phi = Math.max(
        0.38,
        Math.min(1.48, threeRef.current.targetCamAngle.phi - dy * 0.006)
      );
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1 || !threeRef.current) return;
      const dx = e.touches[0].clientX - prevMouse.x;
      const dy = e.touches[0].clientY - prevMouse.y;
      threeRef.current.targetCamAngle.theta -= dx * 0.0075;
      threeRef.current.targetCamAngle.phi = Math.max(
        0.38,
        Math.min(1.48, threeRef.current.targetCamAngle.phi - dy * 0.006)
      );
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    domElem.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    const onResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ============================================================================
    // ANIMATION LOOP (ZERO COLLISION KINEMATICS + SOFTWARE WEBGL GUARD)
    // ============================================================================
    let frameId = 0;
    let isRunning = false;
    let isVisible = true;
    let frameCounter = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || !gl.fenceSync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      if (!isVisible) {
        isRunning = false;
        return;
      }
      isRunning = true;
      const state = threeRef.current;
      if (!state) return;

      frameCounter++;
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      state.currentImmersion = THREE.MathUtils.damp(
        state.currentImmersion,
        state.targetImmersion,
        5.5,
        dt
      );

      const imm = state.currentImmersion;

      // 1. Carriage Position along 45° Diagonal Guide Rails:
      // At imm = 0 (Borde): carriageX = -1.22, carriageY = 2.12
      //   -> Platform Rear Edge (carriageX - 1.08) is at X = -2.30, right at the pool coping edge (-2.28)!
      // At imm = 1 (Sumergido): carriageX = +1.83, carriageY = -0.93
      //   -> Platform Rear Edge (carriageX - 1.08) is at X = +0.75, Y = -0.93!
      const carriageX = -1.22 + imm * 3.05;
      const carriageY = 2.12 - imm * 3.05;
      state.carriageGroup.position.set(carriageX, carriageY, 0);

      // Rear edge of the platform where the staircase terminates (never crosses onto the platform!)
      const platformRearX = carriageX - 1.08;
      const platformRearY = carriageY + 0.04;

      // Update Telescoping Chrome Hydraulic Piston Rods (from top barrel at (-1.35, 1.19) to carriage bogie at (carriageX - 0.92, carriageY - 0.14))
      const bogieX = carriageX - 0.92;
      const bogieY = carriageY - 0.14;
      const rodMidX = (-1.35 + bogieX) * 0.5;
      const rodMidY = (1.19 + bogieY) * 0.5;
      state.pistonRodLeft.position.set(rodMidX, rodMidY, -1.31);
      state.pistonRodRight.position.set(rodMidX, rodMidY, 1.31);

      // 2. Telescopic Deployment of Calisthenics Parallel Bars & Overhead Portal
      const parallelDeploy = THREE.MathUtils.smoothstep(imm, 0.18, 0.65);
      state.parallelBarsGroup.position.y = -0.58 * (1 - parallelDeploy);
      state.parallelBarsGroup.scale.set(1, 0.35 + 0.65 * parallelDeploy, 1);

      const portalDeploy = THREE.MathUtils.smoothstep(imm, 0.35, 0.85);
      state.overheadPortalGroup.position.y = -0.95 * (1 - portalDeploy);
      state.overheadPortalGroup.scale.set(1, 0.25 + 0.75 * portalDeploy, 1);

      // 3. Articulating Parallelogram Staircase Kinematics (Zero-Overlap Guarantee!)
      // Deck anchor is at (-2.34, 2.18). Staircase ends strictly at (platformRearX, platformRearY).
      const deckAnchorX = -2.34;
      const deckAnchorY = 2.18;
      const spanX = Math.max(0.02, platformRearX - deckAnchorX);
      const spanY = Math.max(0.02, deckAnchorY - platformRearY);

      const totalSteps = state.stepAssemblies.length;
      state.stepAssemblies.forEach((stepObj, idx) => {
        const ratio = (idx + 0.5) / totalSteps;
        const idealX = deckAnchorX + spanX * ratio;
        // Guarantee the step center never gets closer than 0.25m behind platformRearX
        // Since step half-depth is 0.22m, its front edge is always >= 3cm behind the platform rear edge!
        const safeX = Math.min(platformRearX - 0.25, idealX);
        const sy = deckAnchorY - spanY * ratio;

        stepObj.pivotGroup.position.set(safeX, sy, 0);
        stepObj.treadGroup.rotation.z = (1 - imm) * 0.03;

        // Smoothly tuck steps that are retracted inside the deck coping cassette (safeX < -2.36)
        const visibleScale = THREE.MathUtils.smoothstep(safeX, -2.55, -2.32);
        stepObj.pivotGroup.visible = visibleScale > 0.02;
        const s = 0.2 + 0.8 * visibleScale;
        stepObj.treadGroup.scale.set(s, 1, 1);
      });

      // Position side parallelogram stringer bars & handrails strictly between Deck Anchor and Platform Rear Edge
      const strMidX = (deckAnchorX + platformRearX) * 0.5;
      const strMidY = (deckAnchorY + platformRearY) * 0.5;
      const dx = platformRearX - deckAnchorX;
      const dy = platformRearY - deckAnchorY;
      const strLen = Math.max(0.05, Math.hypot(dx, dy));
      const strAngle = Math.atan2(dy, dx);

      [state.stringerBarLeft, state.stringerBarRight].forEach((bar, i) => {
        bar.visible = imm > 0.03;
        bar.position.set(strMidX, strMidY - 0.05, i === 0 ? -1.05 : 1.05);
        bar.scale.set(strLen, 1, 1);
        bar.rotation.set(0, 0, strAngle);
      });

      [state.handrailLeft, state.handrailRight].forEach((rail, i) => {
        rail.visible = imm > 0.05;
        rail.position.set(strMidX, strMidY + 0.72, i === 0 ? -1.08 : 1.08);
        rail.scale.set(strLen, 1, 1);
        rail.rotation.set(0, 0, strAngle);
      });

      // 4. Dynamic 3D Water Surface Waves + Interactive Entry Ripple
      const surfAttr = state.waterSurfaceGeo.attributes.position as THREE.BufferAttribute;
      const surfArr = surfAttr.array as Float32Array;
      const baseArr = state.waterSurfaceBasePos;

      const submersionProximity = Math.exp(-Math.pow((carriageY - 0.5) * 1.1, 2));

      for (let i = 0; i < surfArr.length; i += 3) {
        const bx = baseArr[i];
        const bz = baseArr[i + 2];
        const worldX = bx + 1.42;

        let waveY =
          Math.sin(bx * 1.6 + elapsed * 2.1) * 0.028 +
          Math.cos(bz * 1.9 - elapsed * 1.7) * 0.024 +
          Math.sin((bx + bz) * 2.8 + elapsed * 3.2) * 0.012;

        const distToCarriage = Math.hypot(worldX - carriageX, bz);
        if (distToCarriage < 2.8) {
          const wake =
            Math.sin(distToCarriage * 5.5 - elapsed * 5.0) *
            Math.exp(-distToCarriage * 0.85) *
            0.048 *
            (0.4 + submersionProximity);
          waveY += wake;
        }

        surfArr[i + 1] = waveY;
      }
      surfAttr.needsUpdate = true;
      if (frameCounter % 3 === 0) {
        state.waterSurfaceGeo.computeVertexNormals();
      }

      state.causticLight.position.x = 1.6 + Math.sin(elapsed * 1.5) * 0.6;
      state.causticLight.position.z = Math.cos(elapsed * 1.2) * 0.6;
      state.causticLight.intensity = 2.1 + Math.sin(elapsed * 3.5) * 0.35;

      // 5. Hydrotherapy Micro-Bubbles Rising Stream
      const bAttr = state.bubblesSystem.geometry.attributes.position as THREE.BufferAttribute;
      const bArr = bAttr.array as Float32Array;
      for (let i = 0; i < bubbleCount; i++) {
        const idx3 = i * 3;
        bArr[idx3 + 1] += state.bubbleVelocities[i];
        bArr[idx3] += Math.sin(elapsed * 2.5 + i) * 0.003;

        if (bArr[idx3 + 1] > 0.82) {
          if (imm > 0.35 && i % 2 === 0) {
            bArr[idx3] = carriageX + (Math.random() - 0.5) * 2.0;
            bArr[idx3 + 1] = Math.max(-2.6, carriageY - 0.15);
            bArr[idx3 + 2] = (Math.random() - 0.5) * 2.0;
          } else {
            bArr[idx3] = -1.6 + Math.random() * 6.0;
            bArr[idx3 + 1] = -2.65;
            bArr[idx3 + 2] = -2.4 + Math.random() * 4.8;
          }
        }
      }
      bAttr.needsUpdate = true;

      // 6. Smooth Camera Damping
      state.currentCamAngle.theta = THREE.MathUtils.damp(
        state.currentCamAngle.theta,
        state.targetCamAngle.theta,
        6.5,
        dt
      );
      state.currentCamAngle.phi = THREE.MathUtils.damp(
        state.currentCamAngle.phi,
        state.targetCamAngle.phi,
        6.5,
        dt
      );
      state.currentCamAngle.dist = THREE.MathUtils.damp(
        state.currentCamAngle.dist,
        state.targetCamAngle.dist,
        6.5,
        dt
      );
      state.currentCamAngle.lookY = THREE.MathUtils.damp(
        state.currentCamAngle.lookY,
        state.targetCamAngle.lookY,
        6.5,
        dt
      );

      state.camera.position.x =
        state.currentCamAngle.dist *
        Math.sin(state.currentCamAngle.phi) *
        Math.sin(state.currentCamAngle.theta);
      state.camera.position.y =
        state.currentCamAngle.dist * Math.cos(state.currentCamAngle.phi);
      state.camera.position.z =
        state.currentCamAngle.dist *
        Math.sin(state.currentCamAngle.phi) *
        Math.cos(state.currentCamAngle.theta);
      state.camera.lookAt(0, state.currentCamAngle.lookY, 0);

      state.renderer.render(state.scene, state.camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        isVisible = entry.isIntersecting;
        if (isVisible && !isRunning) {
          clock.getDelta();
          tick();
        }
      },
      { rootMargin: '150px' }
    );
    visibilityObserver.observe(container);

    tick();

    return () => {
      visibilityObserver.disconnect();
      isVisible = false;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      domElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      domElem.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', onResize);
      envTexture.dispose();
      poolTileMap.dispose();
      poolTileBump.dispose();
      deckStoneMap.dispose();
      antiSlipMap.dispose();
      bubbleTex.dispose();
      renderer.dispose();
    };
  }, []);

  // Auto-Cycle Toggle
  const toggleAutoCycle = () => {
    if (isAutoCycle) {
      if (autoCycleRef.current) clearInterval(autoCycleRef.current);
      autoCycleRef.current = null;
      setIsAutoCycle(false);
    } else {
      setIsAutoCycle(true);
      let dir = 1;
      let val = immersion;
      autoCycleRef.current = window.setInterval(() => {
        val += dir * 2;
        if (val >= 100) {
          val = 100;
          dir = -1;
        }
        if (val <= 0) {
          val = 0;
          dir = 1;
        }
        onImmersionChange(val);
      }, 55);
    }
  };

  useEffect(() => {
    return () => {
      if (autoCycleRef.current) clearInterval(autoCycleRef.current);
    };
  }, []);

  // Compute live biomechanical metrics
  const depthMeters = ((immersion / 100) * 1.2).toFixed(2);
  const buoyancyPct = Math.min(85, Math.round(immersion * 0.85));

  return (
    <div className="grid lg:grid-cols-12 gap-6 items-stretch w-full min-w-0">
      {/* 3D Viewport (8 Columns) */}
      <div className="lg:col-span-8 rounded-3xl overflow-hidden flex flex-col justify-between min-h-[400px] sm:min-h-[550px] relative border border-slate-200 shadow-sm w-full min-w-0 bg-gradient-to-b from-slate-50 to-sky-50/40">
        {/* Top Camera Preset Bar */}
        <div className="relative z-20 p-4 sm:p-5 flex items-center justify-end gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => setCameraAngle('iso')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#00f2fe] hover:text-slate-900 border border-slate-200 font-mono text-xs text-slate-700 transition-colors cursor-pointer"
            >
              Isométrica
            </button>
            <button
              type="button"
              onClick={() => setCameraAngle('side')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#00f2fe] hover:text-slate-900 border border-slate-200 font-mono text-xs text-slate-700 transition-colors cursor-pointer"
            >
              Corte Lateral
            </button>
            <button
              type="button"
              onClick={() => setCameraAngle('front')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#00f2fe] hover:text-slate-900 border border-slate-200 font-mono text-xs text-slate-700 transition-colors cursor-pointer"
            >
              Frente
            </button>
          </div>
        </div>

        {/* Dedicated Isolated Three.js WebGL Mount Container */}
        <div
          ref={containerRef}
          id="three-canvas-container"
          className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing w-full h-full"
        />

        {/* Bottom Dock Telemetry inside 3D Viewport */}
        <div className="relative z-20 p-3 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none">
          <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs">
            <div>
              <span className="text-slate-500 block text-[9px] sm:text-[10px]">PROFUNDIDAD</span>
              <span className="text-[#0891b2] font-bold text-sm sm:text-base">{depthMeters} m</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] sm:text-[10px]">INGRAVIDEZ</span>
              <span className="text-emerald-600 font-bold text-sm sm:text-base">-{buoyancyPct}%</span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleAutoCycle}
            className={`pointer-events-auto px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              isAutoCycle
                ? 'bg-amber-400 text-slate-900 border-amber-400'
                : 'bg-white hover:bg-[#00f2fe] text-[#0891b2] hover:text-slate-900 border-slate-200'
            }`}
          >
            {isAutoCycle ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoCycle ? 'Detener' : 'Simulación'}</span>
          </button>
        </div>
      </div>

      {/* Control Deck & Biomechanical Breakdown (4 Columns) */}
      <div className="lg:col-span-4 bento-card rounded-3xl p-5 sm:p-7 flex flex-col justify-between space-y-6 w-full min-w-0 bg-white border-slate-200 shadow-sm">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-[#0891b2] font-semibold">
              PANEL DE CONTROL
            </span>
            <span className="font-mono font-bold text-lg text-[#0891b2] bg-[#00f2fe]/10 border border-[#00f2fe]/30 px-3 py-0.5 rounded-lg">
              {immersion}%
            </span>
          </div>

          {/* Tactile Immersion Slider */}
          <div className="space-y-2">
            <label htmlFor="slider-3d" className="text-xs text-slate-600 font-medium block">
              Deslizá para controlar el descenso hidromecánico:
            </label>
            <input
              id="slider-3d"
              type="range"
              min={0}
              max={100}
              value={immersion}
              onChange={(e) => {
                if (isAutoCycle) toggleAutoCycle();
                onImmersionChange(parseInt(e.target.value, 10));
              }}
              className="w-full hud-slider"
            />
            <div className="flex justify-between font-mono text-[10px] text-slate-400 pt-1">
              <span>0% BORDE</span>
              <span>50% TRANSICIÓN</span>
              <span>100% CALISTENIA</span>
            </div>
          </div>

          {/* Quick Phase Selector Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                if (isAutoCycle) toggleAutoCycle();
                onImmersionChange(0);
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                immersion < 25
                  ? 'border-[#00d4ea] bg-[#00f2fe]/15'
                  : 'border-slate-200 bg-slate-50/80 hover:border-slate-300'
              }`}
            >
              <span className="font-mono text-[10px] text-[#0891b2] block font-semibold">01</span>
              <span className="font-['Syne'] font-bold text-xs text-slate-900">Borde</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (isAutoCycle) toggleAutoCycle();
                onImmersionChange(50);
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                immersion >= 25 && immersion < 80
                  ? 'border-[#00d4ea] bg-[#00f2fe]/15'
                  : 'border-slate-200 bg-slate-50/80 hover:border-slate-300'
              }`}
            >
              <span className="font-mono text-[10px] text-slate-400 block font-semibold">02</span>
              <span className="font-['Syne'] font-bold text-xs text-slate-900">Descenso</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (isAutoCycle) toggleAutoCycle();
                onImmersionChange(100);
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                immersion >= 80
                  ? 'border-[#00d4ea] bg-[#00f2fe]/15'
                  : 'border-slate-200 bg-slate-50/80 hover:border-slate-300'
              }`}
            >
              <span className="font-mono text-[10px] text-slate-400 block font-semibold">03</span>
              <span className="font-['Syne'] font-bold text-xs text-slate-900">Ejercicio</span>
            </button>
          </div>

          {/* Dynamic Engineering Explanation Box */}
          <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-2">
            <h3 className="font-['Syne'] font-bold text-base text-[#0891b2]">
              {immersion < 25
                ? '1. Transferencia Segura y Autónoma'
                : immersion < 80
                ? '2. Descenso Hidromecánico Progresivo'
                : '3. Hidrocinesiterapia y Fuerza Adaptada'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-['Plus_Jakarta_Sans']">
              {immersion < 25
                ? 'La plataforma se nivela a ras del borde de la pileta. La silla postural permanece anclada magnéticamente para que el usuario ingrese sin escalones ni esfuerzo físico.'
                : immersion < 80
                ? 'Los peldaños emergen y se articulan detrás de la plataforma a medida que los cilindros hidráulicos descienden, manteniendo la silla 100% despejada.'
                : 'A 1.20m de profundidad, las barras paralelas y el pórtico superior quedan activos. El agua alivia el 85% del peso corporal, permitiendo ejercitar con libertad y dignidad.'}
            </p>
          </div>
        </div>

        {/* Component Legend */}
        <div className="space-y-2.5 pt-4 border-t border-slate-200 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
              Silla Ergonómica Postural
            </span>
            <span className="font-mono text-[11px] text-emerald-600 font-semibold">Estable</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00d4ea] inline-block" />
              Escalera Automática Sumergible
            </span>
            <span className="font-mono text-[11px] text-[#0891b2] font-semibold">
              {immersion < 25 ? 'Plegada en Borde' : immersion < 80 ? 'En Transición' : 'Sumergida Fija'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              Barras de Calistenia Acuática
            </span>
            <span className="font-mono text-[11px] text-amber-600 font-semibold">
              {immersion < 25 ? 'Replegadas' : immersion < 80 ? 'Desplegando...' : '100% Activas'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
