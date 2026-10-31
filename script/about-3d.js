import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const section = document.getElementById("about");
const canvas = document.getElementById("about-3d-bg");
const tilt = document.getElementById("about-tilt");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. 3D tilt on the photo ---------- */
if (tilt) {
    const MAX = 16; // degrees
    let idleRaf = null;

    const apply = (rx, ry, gx, gy) => {
        tilt.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        tilt.style.setProperty("--gx", gx + "%");
        tilt.style.setProperty("--gy", gy + "%");
    };

    const onMove = (e) => {
        const r = tilt.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        apply((0.5 - y) * MAX * 2, (x - 0.5) * MAX * 2, x * 100, y * 100);
    };

    tilt.addEventListener("pointerenter", () => tilt.classList.add("is-active"));
    tilt.addEventListener("pointermove", onMove);
    tilt.addEventListener("pointerleave", () => {
        tilt.classList.remove("is-active");
        tilt.style.transform = "";
    });

    // gentle idle sway so the depth is visible without a mouse (e.g. on phones)
    if (!reduceMotion) {
        const t0 = performance.now();
        const sway = (now) => {
            if (!tilt.classList.contains("is-active")) {
                const t = (now - t0) / 1000;
                apply(Math.sin(t * 0.9) * 4, Math.cos(t * 0.7) * 7, 50 + Math.cos(t * 0.7) * 30, 20);
            }
            idleRaf = requestAnimationFrame(sway);
        };
        // only run while the section is on screen
        new IntersectionObserver(([en]) => {
            if (en.isIntersecting && !idleRaf) idleRaf = requestAnimationFrame(sway);
            else if (!en.isIntersecting && idleRaf) { cancelAnimationFrame(idleRaf); idleRaf = null; }
        }).observe(section);
    }
}

/* ---------- 2. text depth reveal ---------- */
const text = document.querySelector(".about-text");
if (text) {
    text.classList.add("depth-reveal");
    new IntersectionObserver((entries, obs) => {
        entries.forEach((en) => {
            if (en.isIntersecting) { text.classList.add("in-view"); obs.disconnect(); }
        });
    }, { threshold: 0.15 }).observe(text);
}

/* ---------- 3. Three.js floating node network ---------- */
if (canvas && section && !reduceMotion) {
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch (err) {
        renderer = null; // no WebGL: the page still works, just without the 3D background
    }

    if (renderer) {
        const isMobile = window.innerWidth < 768;
        const NODES = isMobile ? 45 : 85;
        const LINK_DIST = isMobile ? 4.5 : 5;
        const COLOR = 0xe50914;

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
        camera.position.z = 16;

        const nodes = [];
        const positions = new Float32Array(NODES * 3);
        for (let i = 0; i < NODES; i++) {
            const p = new THREE.Vector3(
                (Math.random() - 0.5) * 34,
                (Math.random() - 0.5) * 24,
                (Math.random() - 0.5) * 16
            );
            p.vel = new THREE.Vector3(
                (Math.random() - 0.5) * 0.012,
                (Math.random() - 0.5) * 0.012,
                (Math.random() - 0.5) * 0.012
            );
            nodes.push(p);
        }

        const dotGeo = new THREE.BufferGeometry();
        dotGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        // soft round sprite so nodes look like glowing dots instead of squares
        const sprite = document.createElement("canvas");
        sprite.width = sprite.height = 64;
        const sctx = sprite.getContext("2d");
        const grad = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, "rgba(255,255,255,1)");
        grad.addColorStop(0.35, "rgba(255,255,255,0.9)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        sctx.fillStyle = grad;
        sctx.fillRect(0, 0, 64, 64);
        const dots = new THREE.Points(
            dotGeo,
            new THREE.PointsMaterial({
                color: COLOR, size: 0.5, map: new THREE.CanvasTexture(sprite),
                transparent: true, opacity: 0.95, depthWrite: false, sizeAttenuation: true
            })
        );

        const lineGeo = new THREE.BufferGeometry();
        const lines = new THREE.LineSegments(
            lineGeo,
            new THREE.LineBasicMaterial({ color: COLOR, transparent: true, opacity: 0.22, depthWrite: false })
        );

        const group = new THREE.Group();
        group.add(dots, lines);
        scene.add(group);

        const resize = () => {
            const w = section.clientWidth, h = section.clientHeight;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        window.addEventListener("resize", resize);
        resize();

        // mouse parallax (relative to the section)
        let tx = 0, ty = 0;
        section.addEventListener("pointermove", (e) => {
            const r = section.getBoundingClientRect();
            tx = (e.clientX - r.left) / r.width - 0.5;
            ty = (e.clientY - r.top) / r.height - 0.5;
        });

        let visible = false, raf = null;
        const BOUND = { x: 17, y: 12, z: 8 };
        const frame = (now) => {
            const seg = [];
            for (let i = 0; i < NODES; i++) {
                const p = nodes[i];
                p.add(p.vel);
                if (Math.abs(p.x) > BOUND.x) p.vel.x *= -1;
                if (Math.abs(p.y) > BOUND.y) p.vel.y *= -1;
                if (Math.abs(p.z) > BOUND.z) p.vel.z *= -1;
                positions[i * 3] = p.x; positions[i * 3 + 1] = p.y; positions[i * 3 + 2] = p.z;
                for (let j = i + 1; j < NODES; j++) {
                    if (p.distanceTo(nodes[j]) < LINK_DIST) {
                        seg.push(p.x, p.y, p.z, nodes[j].x, nodes[j].y, nodes[j].z);
                    }
                }
            }
            dotGeo.attributes.position.needsUpdate = true;
            lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(seg, 3));

            group.rotation.y += (tx * 0.7 + Math.sin(now / 6000) * 0.15 - group.rotation.y) * 0.04;
            group.rotation.x += (ty * 0.45 - group.rotation.x) * 0.04;

            renderer.render(scene, camera);
            raf = visible ? requestAnimationFrame(frame) : null;
        };

        // render only while the About section is on screen
        new IntersectionObserver(([en]) => {
            visible = en.isIntersecting;
            if (visible && !raf) raf = requestAnimationFrame(frame);
        }).observe(section);
    }
}
