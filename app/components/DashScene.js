"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/**
 * Compact 3D gear cluster for the dashboard banner: three meshing extruded
 * gears (steel, brand green, amber) with IBL, slow rotation and a gentle
 * pointer parallax. Pauses offscreen / when the tab hides, honours
 * prefers-reduced-motion with a static frame, and quietly gives up if
 * WebGL is unavailable (the banner gradient stays).
 */

const MODULE = 0.32;
const DEPTH = 0.55;

function gearShape(teeth, pitchRadius) {
  const rOuter = pitchRadius + MODULE * 0.85;
  const rRoot = pitchRadius - MODULE * 0.7;
  const step = (Math.PI * 2) / teeth;
  const shape = new THREE.Shape();
  const pts = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    pts.push([Math.cos(a) * rRoot, Math.sin(a) * rRoot]);
    pts.push([
      Math.cos(a + step * 0.22) * rRoot,
      Math.sin(a + step * 0.22) * rRoot,
    ]);
    pts.push([
      Math.cos(a + step * 0.34) * rOuter,
      Math.sin(a + step * 0.34) * rOuter,
    ]);
    pts.push([
      Math.cos(a + step * 0.62) * rOuter,
      Math.sin(a + step * 0.62) * rOuter,
    ]);
    pts.push([
      Math.cos(a + step * 0.74) * rRoot,
      Math.sin(a + step * 0.74) * rRoot,
    ]);
  }
  shape.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], pts[i][1]);
  shape.closePath();
  const bore = new THREE.Path();
  bore.absarc(0, 0, pitchRadius * 0.17, 0, Math.PI * 2, true);
  shape.holes.push(bore);
  return shape;
}

function makeGear(teeth, material) {
  const pitchRadius = (MODULE * teeth) / 2;
  const geometry = new THREE.ExtrudeGeometry(gearShape(teeth, pitchRadius), {
    depth: DEPTH,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.035,
    bevelSegments: 2,
    curveSegments: 5,
  });
  geometry.translate(0, 0, -DEPTH / 2);
  geometry.computeVertexNormals();
  const group = new THREE.Group();
  group.add(new THREE.Mesh(geometry, material));
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(
      pitchRadius * 0.3,
      pitchRadius * 0.3,
      DEPTH + 0.3,
      28,
    ),
    material,
  );
  hub.rotation.x = Math.PI / 2;
  group.add(hub);
  return { group, pitchRadius, teeth };
}

export default function DashScene() {
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
      return undefined;
    }

    try {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.95;
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
      camera.position.set(0, 0.6, 10.5);
      camera.lookAt(0, 0, 0);

      const key = new THREE.DirectionalLight(0xffe3b3, 2.2);
      key.position.set(4, 6, 6);
      scene.add(key);
      scene.add(new THREE.HemisphereLight(0xbcd7ff, 0x1a2b1a, 0.5));

      const steel = new THREE.MeshStandardMaterial({
        color: 0xd7dee6,
        metalness: 0.9,
        roughness: 0.32,
      });
      const green = new THREE.MeshStandardMaterial({
        color: 0x0e7a4f,
        metalness: 0.55,
        roughness: 0.38,
      });
      const amber = new THREE.MeshStandardMaterial({
        color: 0xf2a81d,
        metalness: 0.6,
        roughness: 0.35,
      });

      const rig = new THREE.Group();
      const a = makeGear(18, steel);
      const b = makeGear(12, green);
      const c = makeGear(14, amber);
      const distAB = a.pitchRadius + b.pitchRadius;
      const distAC = a.pitchRadius + c.pitchRadius;
      const angB = THREE.MathUtils.degToRad(205);
      const angC = THREE.MathUtils.degToRad(-28);
      b.group.position.set(
        Math.cos(angB) * distAB,
        Math.sin(angB) * distAB,
        -0.1,
      );
      c.group.position.set(
        Math.cos(angC) * distAC,
        Math.sin(angC) * distAC,
        0.12,
      );
      rig.add(a.group, b.group, c.group);
      rig.scale.setScalar(0.68);
      rig.position.x = 0.4;
      scene.add(rig);

      let targetRX = 0;
      let targetRY = 0;
      const onPointer = (e) => {
        const r = canvas.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / Math.max(r.width, 1)) * 2 - 1;
        const ny = ((e.clientY - r.top) / Math.max(r.height, 1)) * 2 - 1;
        targetRY = nx * 0.16;
        targetRX = -ny * 0.1;
      };
      const parent = canvas.parentElement;
      if (parent && !reducedMotion)
        parent.addEventListener("pointermove", onPointer);

      let visible = true;
      const io = new IntersectionObserver(
        (entries) => {
          visible = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0.05 },
      );
      io.observe(canvas);

      const layout = () => {
        const w = canvas.clientWidth || parent?.clientWidth || 300;
        const h = canvas.clientHeight || parent?.clientHeight || 200;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      layout();
      const ro = new ResizeObserver(layout);
      if (parent) ro.observe(parent);

      const speed = 0.12;
      const clock = new THREE.Clock();
      const render = () => {
        const t = clock.getElapsedTime();
        a.group.rotation.z = -t * speed;
        b.group.rotation.z = t * speed * (a.teeth / b.teeth) + 0.2;
        c.group.rotation.z = t * speed * (a.teeth / c.teeth) + 0.5;
        rig.position.y = Math.sin(t * 0.7) * 0.07;
        rig.rotation.x += (targetRX - rig.rotation.x) * 0.05;
        rig.rotation.y += (targetRY - rig.rotation.y) * 0.05;
        renderer.render(scene, camera);
      };

      if (reducedMotion) {
        render();
      } else {
        const loop = () => {
          if (disposed) return;
          raf = requestAnimationFrame(loop);
          if (!visible || document.hidden) return;
          render();
        };
        loop();
      }

      return () => {
        disposed = true;
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        if (parent) parent.removeEventListener("pointermove", onPointer);
        scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) obj.material.dispose();
        });
        pmrem.dispose();
        renderer.dispose();
      };
    } catch {
      renderer.dispose();
      return undefined;
    }
  }, []);

  return <canvas ref={canvasRef} className="dash2-scene" aria-hidden="true" />;
}
