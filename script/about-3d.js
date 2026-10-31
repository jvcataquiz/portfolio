import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const section = document.getElementById("about");
const stage = document.getElementById("about-stage");
const rig = document.getElementById("stage-3d");
const canvas = document.getElementById("about-3d-bg");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Change this to restyle the glowing nodes (e.g. 0x38bdf8 for the blue look from the video) */
const NODE_COLOR = 0xe50914;

/* ---------- 1. pointer depth: the whole stage rotates, layers sit at different Z ---------- */
let px = 0, py = 0; // -0.5 .. 0.5
if (stage && rig) {
    const MAX = 7; // degrees
    let sx = 0, sy = 0;
    stage.addEventListener("pointermove", (e) => {
        const r = stage.getBoundingClientRect();
        px = (e.clientX - r.left) / r.width - 0.5;
        py = (e.clientY - r.top) / r.height - 0.5;
    });
    stage.addEventListener("pointerleave", () => { px = 0; py = 0; });

    if (!reduceMotion) {
        const t0 = performance.now();
        let on = false, raf = null;
        const tick = (now) => {
            // idle sway when no pointer (also what phones see)
            const idle = (px === 0 && py === 0);
            const tx = idle ? Math.cos((now - t0) / 2200) * 0.25 : px;
            const ty = idle ? Math.sin((now - t0) / 2800) * 0.15 : py;
            sx += (tx - sx) * 0.08; sy += (ty - sy) * 0.08;
            rig.style.transform = `rotateY(${sx * MAX * 2}deg) rotateX(${-sy * MAX * 2}deg)`;
            raf = on ? requestAnimationFrame(tick) : null;
        };
        new IntersectionObserver(([en]) => {
            on = en.isIntersecting;
            if (on && !raf) raf = requestAnimationFrame(tick);
        }).observe(stage);
    }

    // scroll-linked fade of the giant name (like the video): --p goes 0 -> 1 as the stage leaves
    const onScroll = () => {
        const r = stage.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (innerHeight * 0.55 - r.top) / (innerHeight * 0.9)));
        stage.style.setProperty("--p", reduceMotion ? 0 : p.toFixed(3));
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
}

/* ---------- 2. bio depth reveal ---------- */
const text = document.querySelector(".about-text");
if (text) {
    text.classList.add("depth-reveal");
    new IntersectionObserver((entries, obs) => {
        entries.forEach((en) => {
            if (en.isIntersecting) { text.classList.add("in-view"); obs.disconnect(); }
        });
    }, { threshold: 0.1 }).observe(text);
}

/* ---------- 3. Three.js: glowing hexagon + dot nodes joined by lines ---------- */
function makeSprite(draw) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    draw(c.getContext("2d"));
    return new THREE.CanvasTexture(c);
}
const glowTex = makeSprite((g) => {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.3, "rgba(255,255,255,0.85)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
const hexTex = makeSprite((g) => {
    g.strokeStyle = "#fff"; g.lineWidth = 7; g.shadowColor = "#fff"; g.shadowBlur = 14;
    g.beginPath();
    for (let i = 0; i < 6; i++) {
        const a = Math.PI / 6 + i * Math.PI / 3;
        const x = 64 + Math.cos(a) * 44, y = 64 + Math.sin(a) * 44;
        i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.closePath(); g.stroke();
});

if (canvas && stage) {
    let renderer = null;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch (err) { /* no WebGL: page still works without the background */ }

    if (renderer) {
        const mobile = innerWidth < 768;
        const GLOW = mobile ? 28 : 55;
        const HEX = mobile ? 10 : 18;
        const N = GLOW + HEX;
        const LINK = mobile ? 6 : 6.5;

        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
        camera.position.z = 16;

        const nodes = [];
        for (let i = 0; i < N; i++) {
            const p = new THREE.Vector3((Math.random() - .5) * 40, (Math.random() - .5) * 20, (Math.random() - .5) * 18);
            p.vel = new THREE.Vector3((Math.random() - .5) * .01, (Math.random() - .5) * .01, (Math.random() - .5) * .008);
            nodes.push(p);
        }

        const mkPoints = (count, tex, size, opacity) => {
            const geo = new THREE.BufferGeometry();
            const arr = new Float32Array(count * 3);
            geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
            const pts = new THREE.Points(geo, new THREE.PointsMaterial({
                color: NODE_COLOR, size, map: tex, transparent: true, opacity,
                depthWrite: false, sizeAttenuation: true, blending: THREE.AdditiveBlending
            }));
            return { geo, arr, pts };
        };
        const glow = mkPoints(GLOW, glowTex, 0.55, 0.95);
        const hex = mkPoints(HEX, hexTex, 1.1, 0.9);

        const lineGeo = new THREE.BufferGeometry();
        const lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
            color: NODE_COLOR, transparent: true, opacity: 0.28, depthWrite: false, blending: THREE.AdditiveBlending
        }));

        const group = new THREE.Group();
        group.add(glow.pts, hex.pts, lines);
        scene.add(group);

        const resize = () => {
            const w = stage.clientWidth, h = stage.clientHeight;
            renderer.setSize(w, h, false);
            camera.aspect = w / h; camera.updateProjectionMatrix();
        };
        addEventListener("resize", resize); resize();

        const BX = 20, BY = 10, BZ = 9;
        const step = (now) => {
            const seg = [];
            for (let i = 0; i < N; i++) {
                const p = nodes[i];
                if (!reduceMotion) p.add(p.vel);
                if (Math.abs(p.x) > BX) p.vel.x *= -1;
                if (Math.abs(p.y) > BY) p.vel.y *= -1;
                if (Math.abs(p.z) > BZ) p.vel.z *= -1;
                const t = i < GLOW ? glow : hex, k = i < GLOW ? i : i - GLOW;
                t.arr[k * 3] = p.x; t.arr[k * 3 + 1] = p.y; t.arr[k * 3 + 2] = p.z;
                for (let j = i + 1; j < N; j++) {
                    if (p.distanceTo(nodes[j]) < LINK) seg.push(p.x, p.y, p.z, nodes[j].x, nodes[j].y, nodes[j].z);
                }
            }
            glow.geo.attributes.position.needsUpdate = true;
            hex.geo.attributes.position.needsUpdate = true;
            lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(seg, 3));

            // camera-like parallax from the pointer (shared with the CSS layers)
            group.rotation.y += (px * 0.6 + Math.sin(now / 7000) * 0.12 - group.rotation.y) * 0.05;
            group.rotation.x += (py * 0.35 - group.rotation.x) * 0.05;
            renderer.render(scene, camera);
        };

        if (reduceMotion) {
            step(0);
        } else {
            let on = false, raf = null;
            const loop = (now) => { step(now); raf = on ? requestAnimationFrame(loop) : null; };
            new IntersectionObserver(([en]) => {
                on = en.isIntersecting;
                if (on && !raf) raf = requestAnimationFrame(loop);
            }).observe(stage);
        }
    }
}
