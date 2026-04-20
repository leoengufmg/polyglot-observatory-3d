import { useEffect, useRef } from "react";
import * as THREE from "three";
import { PipelineStage } from "../types";

interface PipelineCanvasProps {
  stages: PipelineStage[];
}

const statusColors = {
  idle: 0x425466,
  running: 0xffb454,
  success: 0x22c55e,
  error: 0xf43f5e
} as const;

export function PipelineCanvas({ stages }: PipelineCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = mountRef.current;
    if (!host) {
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07111f);
    scene.fog = new THREE.FogExp2(0x07111f, 0.08);

    const width = host.clientWidth;
    const height = Math.max(host.clientHeight, 320);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    host.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.7);
    const rimLight = new THREE.PointLight(0x34d399, 18, 20);
    rimLight.position.set(-2, 4, 4);
    const keyLight = new THREE.PointLight(0xffb454, 14, 20);
    keyLight.position.set(3, 2, 6);
    scene.add(ambientLight, rimLight, keyLight);

    const positions = stages.map((_, index) => new THREE.Vector3(-3 + index * 2, Math.sin(index * 0.75) * 0.6, 0));
    const curve = new THREE.CatmullRomCurve3(positions);

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(100));
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.35 });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);

    const sphereGeometry = new THREE.IcosahedronGeometry(0.38, 1);
    const ringGeometry = new THREE.TorusGeometry(0.56, 0.03, 12, 48);

    const nodes = stages.map((stage, index) => {
      const color = statusColors[stage.status];
      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.18,
        roughness: 0.25,
        metalness: 0.45
      });
      const sphere = new THREE.Mesh(sphereGeometry, material);
      sphere.position.copy(positions[index]);

      const ring = new THREE.Mesh(
        ringGeometry,
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.22
        })
      );
      ring.position.copy(positions[index]);
      ring.rotation.x = Math.PI / 2.4;

      scene.add(sphere, ring);
      return { sphere, ring, offset: index * 0.4 };
    });

    const particleGeometry = new THREE.SphereGeometry(0.09, 16, 16);
    const particles = Array.from({ length: 12 }, (_, index) => {
      const material = new THREE.MeshBasicMaterial({
        color: index % 2 === 0 ? 0xf8fafc : 0x93c5fd
      });
      const particle = new THREE.Mesh(particleGeometry, material);
      scene.add(particle);
      return { particle, offset: index / 12 };
    });

    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 10),
      new THREE.MeshBasicMaterial({
        color: 0x020617,
        transparent: true,
        opacity: 0.88
      })
    );
    backdrop.position.z = -4;
    scene.add(backdrop);

    let frameId = 0;

    const onResize = () => {
      const nextWidth = host.clientWidth;
      const nextHeight = Math.max(host.clientHeight, 320);
      renderer.setSize(nextWidth, nextHeight);
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
    };

    const clock = new THREE.Clock();
    const animate = () => {
      const elapsed = clock.getElapsedTime();

      nodes.forEach((node, index) => {
        node.sphere.rotation.x = elapsed * 0.4 + node.offset;
        node.sphere.rotation.y = elapsed * 0.7 + node.offset;
        node.sphere.position.y = positions[index].y + Math.sin(elapsed * 1.6 + node.offset) * 0.08;
        node.ring.rotation.z = elapsed * 0.3 + node.offset;
      });

      particles.forEach(({ particle, offset }) => {
        const point = curve.getPointAt((elapsed * 0.08 + offset) % 1);
        particle.position.copy(point);
      });

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    window.addEventListener("resize", onResize);
    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      sphereGeometry.dispose();
      ringGeometry.dispose();
      particleGeometry.dispose();
      nodes.forEach(({ sphere, ring }) => {
        (sphere.material as THREE.Material).dispose();
        (ring.material as THREE.Material).dispose();
      });
      particles.forEach(({ particle }) => {
        (particle.material as THREE.Material).dispose();
      });
      if (host.contains(renderer.domElement)) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [stages]);

  return <div className="pipeline-canvas" ref={mountRef} />;
}

