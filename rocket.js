/**
 * SPILIFT — "Uplift with SPILIFT" 3D Rocket Launch Animation
 * ============================================================
 * Self-contained module. Does not read from or write to script.js.
 * Renders into the existing #rocketScene / #rocketCanvas markup
 * inside the hero section.
 *
 * Sections in this file:
 *   1. Setup & guards (reduced motion, missing THREE, missing DOM)
 *   2. Scene / camera / renderer / lighting
 *   3. Rocket construction (lightweight primitive geometry only)
 *   4. Flame, trail and particles
 *   5. Animation timeline (state machine driven by elapsed time)
 *   6. Resize handling (fits the container, not the window)
 *   7. Visibility handling (IntersectionObserver pause/resume)
 *   8. Render loop
 */
(function () {
    "use strict";

    /* ------------------------------------------------------------
       1. SETUP & GUARDS
    ------------------------------------------------------------ */
    var reduceMotion = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var upliftEl = document.getElementById("rocketUplift");
    var fullEl = document.getElementById("rocketFull");

    if (reduceMotion) {
        // No 3D scene at all — just show the final message immediately.
        // The canvas itself is hidden via CSS in this mode.
        if (fullEl) fullEl.classList.add("visible");
        return;
    }

    var container = document.getElementById("rocketScene");
    var canvas = document.getElementById("rocketCanvas");
    if (!container || !canvas) return;

    if (typeof THREE === "undefined") {
        // Three.js failed to load (blocked / offline) — fail gracefully,
        // still show the brand message so the section isn't empty.
        if (fullEl) fullEl.classList.add("visible");
        return;
    }

    var isMobile = window.innerWidth <= 768;

    /* ------------------------------------------------------------
       2. SCENE / CAMERA / RENDERER / LIGHTING
    ------------------------------------------------------------ */
    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.4, 9);
    camera.lookAt(0, 0.6, 0);

    var renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: "low-power"
    });
    renderer.setClearColor(0x000000, 0); // transparent — blends with page bg
    var dprCap = isMobile ? 1.5 : 2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));

    // Soft ambient fill (keeps the dark-navy brand feel, not flat-lit)
    scene.add(new THREE.AmbientLight(0x2a3a55, 0.9));

    // Gentle blue-tinted key light (matches "subtle blue highlights")
    var keyLight = new THREE.DirectionalLight(0x8fb8ff, 0.5);
    keyLight.position.set(-3, 4, 5);
    scene.add(keyLight);

    // Rim light for a bit of glossy edge definition
    var rimLight = new THREE.DirectionalLight(0xffffff, 0.35);
    rimLight.position.set(2, 2, -4);
    scene.add(rimLight);

    // SPILIFT-orange engine glow — intensity is animated with the timeline
    var engineLight = new THREE.PointLight(0xff6b35, 0, 6);
    engineLight.position.set(0, -1.1, 0.6);
    scene.add(engineLight);

    /* ------------------------------------------------------------
       3. ROCKET CONSTRUCTION (lightweight primitives, no external model)
    ------------------------------------------------------------ */
    var rocket = new THREE.Group();

    var bodyMat = new THREE.MeshStandardMaterial({
        color: 0xf4f6fa,
        metalness: 0.55,
        roughness: 0.28
    });
    var navyMat = new THREE.MeshStandardMaterial({
        color: 0x0a2540,
        metalness: 0.5,
        roughness: 0.35
    });
    var orangeMat = new THREE.MeshStandardMaterial({
        color: 0xff6b35,
        metalness: 0.4,
        roughness: 0.3,
        emissive: 0x662a10,
        emissiveIntensity: 0.4
    });
    var glassMat = new THREE.MeshStandardMaterial({
        color: 0x8fd6ff,
        metalness: 0.9,
        roughness: 0.15,
        emissive: 0x1a4a6a,
        emissiveIntensity: 0.6
    });

    // Main body
    var body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.5, 1.9, 20),
        bodyMat
    );
    rocket.add(body);

    // Navy lower band (adds depth/contrast, echoes brand navy)
    var lowerBand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.35, 20),
        navyMat
    );
    lowerBand.position.y = -0.98;
    rocket.add(lowerBand);

    // Orange accent ring
    var accentRing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.505, 0.505, 0.12, 20),
        orangeMat
    );
    accentRing.position.y = -0.55;
    rocket.add(accentRing);

    // Nose cone (orange tip — echoes the logo's rocket accent)
    var noseCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.42, 0.85, 20),
        orangeMat
    );
    noseCone.position.y = 1.35;
    rocket.add(noseCone);

    // Porthole window
    var window1 = new THREE.Mesh(new THREE.CircleGeometry(0.16, 20), glassMat);
    window1.position.set(0, 0.35, 0.505);
    rocket.add(window1);
    var windowRing = new THREE.Mesh(
        new THREE.RingGeometry(0.16, 0.2, 20),
        bodyMat
    );
    windowRing.position.set(0, 0.35, 0.506);
    rocket.add(windowRing);

    // Fins (three thin wedges spaced 120° apart)
    var finShape = new THREE.BoxGeometry(0.06, 0.65, 0.5);
    for (var i = 0; i < 3; i++) {
        var fin = new THREE.Mesh(finShape, navyMat);
        var angle = (i / 3) * Math.PI * 2;
        var r = 0.52;
        fin.position.set(Math.sin(angle) * r, -0.75, Math.cos(angle) * r);
        fin.rotation.y = angle;
        fin.rotation.z = 0.28;
        rocket.add(fin);
    }

    rocket.position.set(0, -1.3, 0);
    rocket.scale.setScalar(0.001); // entrance grows in from ~0
    scene.add(rocket);

    /* ------------------------------------------------------------
       4. FLAME, TRAIL AND PARTICLES
    ------------------------------------------------------------ */
    // Flame — two stacked cones (bright core + soft outer glow)
    var flameGroup = new THREE.Group();
    var flameOuter = new THREE.Mesh(
        new THREE.ConeGeometry(0.32, 0.9, 16, 1, true),
        new THREE.MeshBasicMaterial({
            color: 0xff6b35,
            transparent: true,
            opacity: 0.55,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        })
    );
    var flameInner = new THREE.Mesh(
        new THREE.ConeGeometry(0.16, 0.55, 16, 1, true),
        new THREE.MeshBasicMaterial({
            color: 0xffd8a8,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        })
    );
    flameOuter.rotation.x = Math.PI;
    flameInner.rotation.x = Math.PI;
    flameOuter.position.y = -0.45;
    flameInner.position.y = -0.28;
    flameGroup.add(flameOuter, flameInner);
    flameGroup.position.y = -1.15;
    flameGroup.scale.setScalar(0.001);
    rocket.add(flameGroup);

    // Trail — a soft tapered, semi-transparent cylinder stretched behind
    // the rocket as it climbs. Cheap: one mesh, scaled per-frame.
    var trail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.22, 1, 12, 1, true),
        new THREE.MeshBasicMaterial({
            color: 0xff8c4d,
            transparent: true,
            opacity: 0.22,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        })
    );
    trail.scale.set(1, 0.001, 1);
    scene.add(trail);

    // Particles — deliberately very few, per the brief ("very small number")
    var particleCount = isMobile ? 8 : 16;
    var particleGeo = new THREE.BufferGeometry();
    var positions = new Float32Array(particleCount * 3);
    var seeds = [];
    for (var p = 0; p < particleCount; p++) {
        var a = Math.random() * Math.PI * 2;
        var rad = 0.9 + Math.random() * 0.9;
        positions[p * 3] = Math.cos(a) * rad;
        positions[p * 3 + 1] = -1.5 + Math.random() * 3.2;
        positions[p * 3 + 2] = Math.sin(a) * rad * 0.6;
        seeds.push({ a: a, rad: rad, speed: 0.15 + Math.random() * 0.2, phase: Math.random() * 10 });
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    var particles = new THREE.Points(
        particleGeo,
        new THREE.PointsMaterial({
            color: 0xffb37a,
            size: isMobile ? 0.035 : 0.045,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })
    );
    scene.add(particles);

    /* ------------------------------------------------------------
       5. ANIMATION TIMELINE
    ------------------------------------------------------------ */
    var ROCKET_START_Y = -1.3;
    var ROCKET_END_Y = 1.15;
    var HOLD_UNTIL = 8.5;   // seconds — how long the final state holds
    var LOOP_DURATION = 10.5; // total cycle length before a smooth reset

    var startTime = null;
    var upliftShown = false;
    var upliftHidden = false;
    var fullShown = false;

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    function clamp01(v) {
        return Math.max(0, Math.min(1, v));
    }

    function resetCycle() {
        startTime = null;
        upliftShown = false;
        upliftHidden = false;
        fullShown = false;
        if (upliftEl) upliftEl.classList.remove("visible", "fading");
        if (fullEl) fullEl.classList.remove("visible");
    }

    function updateTimeline(elapsed) {
        // Loop with a brief hold at the end, then reset seamlessly.
        if (elapsed > LOOP_DURATION) {
            resetCycle();
            return;
        }

        // Phase 1 (0–1s): gentle entrance
        var entranceT = clamp01(elapsed / 1);
        var entranceScale = easeOutCubic(entranceT);
        rocket.scale.setScalar(Math.max(0.001, entranceScale));
        rocket.position.y = ROCKET_START_Y + Math.sin(elapsed * 1.6) * 0.03 * entranceT;

        // Phase 2 (1–2s): engine glow ramps up
        var glowT = clamp01((elapsed - 1) / 1);
        engineLight.intensity = glowT * 1.6;
        flameGroup.scale.setScalar(Math.max(0.001, glowT * 0.7));

        // Phase 3 (2–4s): launch upward
        var launchT = clamp01((elapsed - 2) / 2);
        var eased = easeInOutCubic(launchT);
        if (elapsed >= 1) {
            rocket.position.y = ROCKET_START_Y + (ROCKET_END_Y - ROCKET_START_Y) * eased;
        }
        if (elapsed >= 2) {
            var flicker = 1 + Math.sin(elapsed * 24) * 0.08;
            flameGroup.scale.set(flicker, 1 + launchT * 0.6, flicker);
            engineLight.intensity = 1.4 + Math.sin(elapsed * 20) * 0.2;
        }

        // Trail grows behind the rocket as it climbs
        if (elapsed >= 2) {
            var climbed = rocket.position.y - ROCKET_START_Y;
            var trailLen = Math.max(0.001, climbed * 0.9);
            trail.scale.set(1, trailLen, 1);
            trail.position.y = ROCKET_START_Y + (rocket.position.y - ROCKET_START_Y) / 2 - 0.3;
            trail.material.opacity = 0.22 * clamp01(1 - launchT * 0.3);
        }

        // Particles: slow upward drift, minimal motion
        var posAttr = particleGeo.attributes.position;
        for (var pi = 0; pi < particleCount; pi++) {
            var s = seeds[pi];
            var t = elapsed + s.phase;
            posAttr.array[pi * 3] = Math.cos(s.a + t * 0.15) * s.rad;
            posAttr.array[pi * 3 + 1] = -1.6 + ((t * s.speed) % 3.4);
            posAttr.array[pi * 3 + 2] = Math.sin(s.a + t * 0.15) * s.rad * 0.6;
        }
        posAttr.needsUpdate = true;
        particles.material.opacity = 0.5 * clamp01(entranceT);

        // Phase 4 (3–4.5s): "UPLIFT" reveal
        if (elapsed >= 3 && !upliftShown && upliftEl) {
            upliftEl.classList.add("visible");
            upliftShown = true;
        }

        // Phase 5 (4.5–5.5s): swap to full "Uplift with SPILIFT"
        if (elapsed >= 4.5 && !upliftHidden && upliftEl) {
            upliftEl.classList.add("fading");
            upliftHidden = true;
        }
        if (elapsed >= 4.6 && !fullShown && fullEl) {
            fullEl.classList.add("visible");
            fullShown = true;
        }

        // Gentle hold with a very slow drift after launch completes
        if (elapsed > 5.5 && elapsed < HOLD_UNTIL) {
            rocket.position.y = ROCKET_END_Y + Math.sin(elapsed * 0.8) * 0.02;
        }

        // Smooth fade-out just before the loop resets
        if (elapsed >= HOLD_UNTIL) {
            var fadeT = clamp01((elapsed - HOLD_UNTIL) / (LOOP_DURATION - HOLD_UNTIL));
            var fadeScale = Math.max(0.001, 1 - fadeT);
            rocket.scale.setScalar(fadeScale * entranceScale);
            trail.material.opacity *= (1 - fadeT);
            particles.material.opacity *= (1 - fadeT);
            if (fadeT > 0.15 && upliftEl) upliftEl.classList.remove("visible", "fading");
            if (fadeT > 0.15 && fullEl) fullEl.classList.remove("visible");
        }
    }

    /* ------------------------------------------------------------
       6. RESIZE HANDLING (fits the container, not the window)
    ------------------------------------------------------------ */
    function resize() {
        var w = container.clientWidth || 1;
        var h = container.clientHeight || 1;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
        isMobile = window.innerWidth <= 768;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    }
    resize();

    if (typeof ResizeObserver !== "undefined") {
        new ResizeObserver(resize).observe(container);
    } else {
        window.addEventListener("resize", resize);
    }

    /* ------------------------------------------------------------
       7. VISIBILITY HANDLING — pause rendering when scrolled away
    ------------------------------------------------------------ */
    var isVisible = true;
    if (typeof IntersectionObserver !== "undefined") {
        new IntersectionObserver(
            function (entries) {
                isVisible = entries[0].isIntersecting;
                if (isVisible && startTime === null) {
                    // Resume cleanly from the beginning of a cycle
                    startTime = performance.now();
                }
            },
            { threshold: 0.1 }
        ).observe(container);
    }

    /* ------------------------------------------------------------
       8. RENDER LOOP
    ------------------------------------------------------------ */
    function tick(now) {
        requestAnimationFrame(tick);
        if (!isVisible) return;

        if (startTime === null) startTime = now;
        var elapsed = (now - startTime) / 1000;

        updateTimeline(elapsed);
        renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);
})();