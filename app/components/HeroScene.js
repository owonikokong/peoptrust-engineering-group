"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/**
 * Procedural gear train built entirely from code — no model files.
 *
 * Three involute-ish spur gears whose teeth counts set the gear ratios, so
 * angular speeds are inversely proportional to tooth counts (real meshing
 * kinematics). Tooth phases are aligned at the mesh points so teeth
 * interleave instead of colliding.
 *
 * Rendering follows the threejs-scene skill principles, adapted for a
 * background hero: ACES tone mapping, DPR capped at 2, one warm shadow-
 * casting sun (PCFSoft), IBL from a PMREM RoomEnvironment for believable
 * metal, transparent canvas over the site's navy gradient, rendering paused
 * offscreen / when the tab is hidden, and prefers-reduced-motion honoured
 * with a single static frame. If WebGL is unavailable we render nothing and
 * the CSS gradient carries the hero.
 */

const MODULE = 0.32; // gear module: pitch radius = MODULE * teeth / 2
const GEAR_DEPTH = 0.55;

/** Build a spur-gear outline (THREE.Shape) with a centre bore. */
function gearShape(teeth, pitchRadius) {
  const addendum = MODULE * 0.9;
  const dedendum = MODULE * 1.1;
  const rOuter = pitchRadius + addendum;
  const rRoot = pitchRadius - dedendum;
  const step = (Math.PI * 2) / teeth;
  // Fractions of one tooth pitch: root land, rise, tip land, fall.
  const fRoot = 0.32;
  const fRise = 0.16;
  const fTip = 0.2;

  const shape = new THREE.Shape();
  const pts = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const aRootEnd = a + step * fRoot;
    const aTipStart = aRootEnd + step * fRise;
    const aTipEnd = aTipStart + step * fTip;
    const aNext = a + step;
    pts.push([Math.cos(a) * rRoot, Math.sin(a) * rRoot]);
    pts.push([Math.cos(aRootEnd) * rRoot, Math.sin(aRootEnd) * rRoot]);
    pts.push([Math.cos(aTipStart) * rOuter, Math.sin(aTipStart) * rOuter]);
    pts.push([Math.cos(aTipEnd) * rOuter, Math.sin(aTipEnd) * rOuter]);
    pts.push([Math.cos(aNext) * rRoot, Math.sin(aNext) * rRoot]);
  }
  shape.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], pts[i][1]);
  shape.closePath();

  const bore = new THREE.Path();
  bore.absarc(0, 0, pitchRadius * 0.16, 0, Math.PI * 2, true);
  shape.holes.push(bore);
  return { shape, rOuter, rRoot };
}

function makeGear({ teeth, material, phase = 0 }) {
  const pitchRadius = (MODULE * teeth) / 2;
  const { shape } = gearShape(teeth, pitchRadius);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: GEAR_DEPTH,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.045,
    bevelSegments: 2,
    curveSegments: 6,
  });
  geometry.translate(0, 0, -GEAR_DEPTH / 2);
  geometry.computeVertexNormals();

  const group = new THREE.Group();
  const body = new THREE.Mesh(geometry, material);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Hub + shaft through the bore.
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(pitchRadius * 0.3, pitchRadius * 0.3, GEAR_DEPTH + 0.36, 32),
    material
  );
  hub.rotation.x = Math.PI / 2;
  hub.castShadow = true;
  group.add(hub);

  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(pitchRadius * 0.13, pitchRadius * 0.13, GEAR_DEPTH + 1.5, 24),
    material
  );
  shaft.rotation.x = Math.PI / 2;
  shaft.castShadow = true;
  group.add(shaft);

  group.rotation.z = phase;
  return { group, pitchRadius, teeth };
}

export default function HeroScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let renderer = null;
    let raf = 0;
    let disposed = false;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      return undefined; // No WebGL: the CSS gradient remains.
    }

    try {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const isTouch = window.matchMedia("(pointer: coarse)").matches;

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.9;

      const scene = new THREE.Scene();

      // Image-based light so the metals reflect believably.
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(0, 1.4, 11.5);
      camera.lookAt(0, 0, 0);

      // One warm directional "sun" with soft shadows + hemisphere fill.
      const sun = new THREE.DirectionalLight(0xffe3b3, 2.6);
      sun.position.set(5, 7, 6);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.left = -7;
      sun.shadow.camera.right = 7;
      sun.shadow.camera.top = 7;
      sun.shadow.camera.bottom = -7;
      sun.shadow.camera.near = 1;
      sun.shadow.camera.far = 30;
      sun.shadow.bias = -0.0004;
      sun.shadow.normalBias = 0.02;
      scene.add(sun);
      scene.add(new THREE.HemisphereLight(0xbcd7ea, 0x0a2438, 0.55));

      // Invisible ground plane that only catches the gears' shadows.
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40),
        new THREE.ShadowMaterial({ opacity: 0.22 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -2.9;
      ground.receiveShadow = true;
      scene.add(ground);

      const steel = new THREE.MeshStandardMaterial({
        color: 0x9fb4c4,
        metalness: 0.85,
        roughness: 0.35,
      });
      const navySteel = new THREE.MeshStandardMaterial({
        color: 0x51718c,
        metalness: 0.85,
        roughness: 0.38,
      });
      const brandGreen = new THREE.MeshStandardMaterial({
        color: 0x0e7a4f,
        metalness: 0.85,
        roughness: 0.32,
      });

      // Gear train: 24T driver -> 36T idler -> 16T output.
      // Mesh phases: a tooth of the driver centred on the line of centres
      // must meet a gap of the driven gear, hence the half-pitch offsets.
      const driver = makeGear({ teeth: 24, material: steel });
      const idler = makeGear({
        teeth: 36,
        material: navySteel,
        phase: Math.PI / 36 + Math.PI / 2,
      });
      const output = makeGear({
        teeth: 16,
        material: brandGreen,
        phase: Math.PI / 16 - Math.PI / 2,
      });

      driver.group.position.set(0, 0.55, 0);
      idler.group.position.set(
        driver.group.position.x + driver.pitchRadius + idler.pitchRadius,
        driver.group.position.y,
        -0.35
      );
      // Output meshes with the idler up-and-to-the-right at ~55 degrees.
      const meshAngle = THREE.MathUtils.degToRad(55);
      const centreDist = idler.pitchRadius + output.pitchRadius;
      output.group.position.set(
        idler.group.position.x + Math.cos(meshAngle) * centreDist,
        idler.group.position.y + Math.sin(meshAngle) * centreDist,
        0.3
      );
      // Recompute the output phase for its actual mesh direction: tooth of
      // the idler pointing along -meshAngle meets a gap of the output.
      output.group.rotation.z = meshAngle + Math.PI + Math.PI / output.teeth;

      const train = new THREE.Group();
      train.add(driver.group, idler.group, output.group);
      // Tilt the whole train slightly for depth.
      train.rotation.set(-0.12, -0.35, 0.06);
      scene.add(train);

      const BASE_SPEED = 0.12; // rad/s on the driver — slow and stately.
      const layout = () => {
        const w = canvas.clientWidth || canvas.parentElement.clientWidth;
        const h = canvas.clientHeight || canvas.parentElement.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        if (w >= 900) {
          // Wide screens: composition sits right of the headline.
          train.position.set(2.5, 0.1, 0);
          renderer.toneMappingExposure = 0.9;
        } else {
          // Narrow screens: centred, further back and dimmer behind text.
          train.position.set(0, 0.35, -1.2);
          renderer.toneMappingExposure = 0.65;
        }
        camera.updateProjectionMatrix();
      };
      layout();
      window.addEventListener("resize", layout);

      // Pointer parallax (skipped for reduced motion / touch).
      const parallax = { x: 0, y: 0, tx: 0, ty: 0 };
      const onPointer = (e) => {
        if (reducedMotion || isTouch) return;
        parallax.tx = (e.clientX / window.innerWidth - 0.5) * 0.14;
        parallax.ty = (e.clientY / window.innerHeight - 0.5) * 0.1;
      };
      window.addEventListener("pointermove", onPointer);

      // Pause when offscreen or the tab is hidden.
      let inView = true;
      let pageVisible = !document.hidden;
      const observer = new IntersectionObserver(
        ([entry]) => {
          inView = entry.isIntersecting;
        },
        { threshold: 0.02 }
      );
      observer.observe(canvas);
      const onVisibility = () => {
        pageVisible = !document.hidden;
      };
      document.addEventListener("visibilitychange", onVisibility);

      const clock = new THREE.Clock();
      const renderFrame = () => {
        const t = clock.getElapsedTime();
        const angle = t * BASE_SPEED;
        driver.group.rotation.z = angle;
        idler.group.rotation.z =
          Math.PI / 36 + Math.PI / 2 - angle * (driver.teeth / idler.teeth);
        output.group.rotation.z =
          meshAngle +
          Math.PI +
          Math.PI / output.teeth +
          angle * (driver.teeth / output.teeth);
        parallax.x += (parallax.tx - parallax.x) * 0.05;
        parallax.y += (parallax.ty - parallax.y) * 0.05;
        train.rotation.y = -0.35 + parallax.x;
        train.rotation.x = -0.12 + parallax.y;
        renderer.render(scene, camera);
      };

      if (reducedMotion) {
        renderFrame(); // One static frame, no rotation.
      } else {
        const loop = () => {
          raf = requestAnimationFrame(loop);
          if (disposed || !inView || !pageVisible) return;
          renderFrame();
        };
        loop();
      }

      return () => {
        disposed = true;
        cancelAnimationFrame(raf);
        observer.disconnect();
        window.removeEventListener("resize", layout);
        window.removeEventListener("pointermove", onPointer);
        document.removeEventListener("visibilitychange", onVisibility);
        scene.traverse((o) => {
          if (o.isMesh) {
            o.geometry?.dispose();
            if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
            else o.material?.dispose();
          }
        });
        scene.environment?.dispose();
        pmrem.dispose();
        renderer.dispose();
      };
    } catch {
      // Any init failure: leave the gradient hero untouched.
      renderer?.dispose();
      return undefined;
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
