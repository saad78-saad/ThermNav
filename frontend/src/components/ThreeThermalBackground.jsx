import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeThermalBackground({ theme = 'light' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    container.innerHTML = '';

    const isLight = theme === 'light';
    const isNetflix = theme === 'netflix';

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 18, 42);
    camera.lookAt(0, 4, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 1. Digital City Microclimate Floor Grid
    const gridCenterColor = isLight ? 0x0284c7 : isNetflix ? 0xe50914 : 0x06b6d4;
    const gridLineColor = isLight ? 0xe2e8f0 : isNetflix ? 0x3f0e13 : 0x1e293b;
    const gridHelper = new THREE.GridHelper(120, 40, gridCenterColor, gridLineColor);
    gridHelper.position.y = -8;
    scene.add(gridHelper);

    // 2. 3D Architectural Tower Skyline Wireframes (The sleek building outlines)
    const towerGroup = new THREE.Group();

    const buildingGeometries = [
      { w: 7, h: 26, d: 7, x: -22, z: -10, color: isLight ? 0x0284c7 : isNetflix ? 0xe50914 : 0x06b6d4 },
      { w: 9, h: 36, d: 9, x: -8, z: -18, color: isLight ? 0x2563eb : isNetflix ? 0xb91c1c : 0x3b82f6 },
      { w: 8, h: 42, d: 8, x: 12, z: -12, color: isLight ? 0x059669 : isNetflix ? 0xef4444 : 0x10b981 },
      { w: 6, h: 22, d: 6, x: 26, z: -6, color: isLight ? 0x0284c7 : isNetflix ? 0xe50914 : 0x06b6d4 },
      { w: 10, h: 18, d: 12, x: 2, z: -25, color: isLight ? 0x4f46e5 : isNetflix ? 0x991b1b : 0x6366f1 }
    ];

    buildingGeometries.forEach((b) => {
      const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const edges = new THREE.EdgesGeometry(geo);
      const lineMat = new THREE.LineBasicMaterial({
        color: b.color,
        transparent: true,
        opacity: isLight ? 0.35 : 0.45
      });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      wireframe.position.set(b.x, -8 + b.h / 2, b.z);
      towerGroup.add(wireframe);

      // Subtle horizontal floor level lines inside towers
      for (let floor = 3; floor < b.h; floor += 4) {
        const floorGeo = new THREE.PlaneGeometry(b.w * 0.96, b.d * 0.96);
        floorGeo.rotateX(-Math.PI / 2);
        const floorEdges = new THREE.EdgesGeometry(floorGeo);
        const floorLineMat = new THREE.LineBasicMaterial({
          color: b.color,
          transparent: true,
          opacity: isLight ? 0.15 : 0.25
        });
        const floorLine = new THREE.LineSegments(floorEdges, floorLineMat);
        floorLine.position.set(b.x, -8 + floor, b.z);
        towerGroup.add(floorLine);
      }
    });

    scene.add(towerGroup);

    // Dynamic Mouse Parallax & Smooth Animation Loop (No raining square particles!)
    let mouseX = 0;
    let mouseY = 0;
    let animationId = null;

    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const onResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Very subtle, calm ambient skyline rotation (non-distracting)
      towerGroup.rotation.y += 0.0003;

      camera.position.x += (mouseX * 4 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 3 + 18 - camera.position.y) * 0.02;
      camera.lookAt(0, 4, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (container && renderer?.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer?.dispose();
    };
  }, [theme]);

  return (
    <div
      ref={mountRef}
      className={`fixed inset-0 pointer-events-none z-0 ${theme === 'light' ? 'opacity-15' : 'opacity-25'}`}
      style={{ overflow: 'hidden' }}
    />
  );
}
