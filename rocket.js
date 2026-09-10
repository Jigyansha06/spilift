/**
 * SPILIFT — "Uplift with SPILIFT" 3D Rocket Launch Animation
 * ============================================================
 * Self-contained module. Does not read from or write to script.js.
 * Renders into the existing #rocketScene / #rocketCanvas markup
 * inside the hero section.
 *
 * Sections in this file:
 *   1. Setup & guards (reduced motion, missing THREE, missing DOM)
 *   2. Glow textures (generated on canvas — no external image assets)
 *   3. Scene / camera / renderer / lighting
 *   4. Rocket construction (lightweight primitive geometry only)
 *   5. Flame, trail, atmosphere glow and particles
 *   6. Animation timeline (state machine driven by elapsed time)
 *   7. Resize handling (fits the container, not the window)
 *   8. Visibility handling (IntersectionObserver pause/resume)
 *   9. Render loop
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
        if (fullEl) fullEl.classList.add("visible");
        return;
    }

    var container = document.getElementById("rocketScene");
    var canvas = document.getElementById("rocketCanvas");
    if (!container || !canvas) return;

    if (typeof THREE === "undefined") {
        if (fullEl) fullEl.classList.add("visible");
        return;
    }

    var isMobile = window.innerWidth <= 768;

    /* ------------------------------------------------------------
       2. GLOW TEXTURES — soft radial gradients drawn on an offscreen
          canvas. No external image files; cheap and reusable across
          particles, the flame tip and the ambient backdrop glow.
    ------------------------------------------------------------ */
    function makeRadialTexture(stops, size) {
        size = size || 128;
        var c = document.createElement("canvas");
        c.width = c.height = size;
        var ctx = c.getContext("2d");
        var g = ctx.createRadialGradient(
            size / 2, size / 2, 0,
            size / 2, size / 2, size / 2
        );
        for (var i = 0; i < stops.length; i++) {
            g.addColorStop(stops[i][0], stops[i][1]);
        }
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
        var tex = new THREE.CanvasTexture(c);
        tex.needsUpdate = true;
        return tex;
    }

    var glowTexOrange = makeRadialTexture([
        [0, "rgba(255,240,220,1)"],
        [0.35, "rgba(255,150,70,0.9)"],
        [1, "rgba(255,107,53,0)"]
    ]);
    var glowTexSoft = makeRadialTexture([
        [0, "rgba(255,180,120,0.55)"],
        [1, "rgba(255,107,53,0)"]
    ]);
    var glowTexAtmo = makeRadialTexture([
        [0, "rgba(80,130,255,0.10)"],
        [0.5, "rgba(255,107,53,0.05)"],
        [1, "rgba(10,37,64,0)"]
    ], 256);

    /* ------------------------------------------------------------
       3. SCENE / CAMERA / RENDERER / LIGHTING
    ------------------------------------------------------------ */
    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0.3, 8.5);
    camera.lookAt(0, 0.4, 0);
    var baseCamX = camera.position.x;

    var renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: "low-power"
    });
    renderer.setClearColor(0x000000, 0);
    var dprCap = isMobile ? 1.5 : 2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
    if ("outputColorSpace" in renderer) renderer.outputColorSpace = "srgb";
    if ("toneMapping" in renderer && THREE.ACESFilmicToneMapping) {
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
    }

    scene.add(new THREE.AmbientLight(0x2a3a55, 0.85));

    var keyLight = new THREE.DirectionalLight(0x9fc4ff, 0.55);
    keyLight.position.set(-3, 4, 5);
    scene.add(keyLight);

    var rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(2.5, 2, -4);
    scene.add(rimLight);

    var fillLight = new THREE.DirectionalLight(0xffb37a, 0.18);
    fillLight.position.set(1, -1, 3);
    scene.add(fillLight);

    var engineLight = new THREE.PointLight(0xff6b35, 0, 7);
    engineLight.position.set(0, -1.3, 0.6);
    scene.add(engineLight);

    // Soft atmospheric backdrop glow behind the rocket (billboard sprite)
    var atmoSprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTexAtmo,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }));
    atmoSprite.scale.set(7, 7, 1);
    atmoSprite.position.set(0, 0.2, -2);
    scene.add(atmoSprite);

    /* ------------------------------------------------------------
       4. ROCKET CONSTRUCTION
    ------------------------------------------------------------ */
    var rocket = new THREE.Group();
    var PhysMat = THREE.MeshPhysicalMaterial || THREE.MeshStandardMaterial;

    var bodyMat = new PhysMat({
        color: 0xf4f6fa,
        metalness: 0.5,
        roughness: 0.22,
        clearcoat: 0.6,
        clearcoatRoughness: 0.18
    });
    var navyMat = new PhysMat({
        color: 0x0a2540,
        metalness: 0.55,
        roughness: 0.3,
        clearcoat: 0.4,
        clearcoatRoughness: 0.2
    });
    var orangeMat = new PhysMat({
        color: 0xff6b35,
        metalness: 0.35,
        roughness: 0.25,
        clearcoat: 0.5,
        clearcoatRoughness: 0.2,
        emissive: 0x7a2f10,
        emissiveIntensity: 0.35
    });
    var darkMat = new THREE.MeshStandardMaterial({
        color: 0x111a26,
        metalness: 0.7,
        roughness: 0.35
    });
    var glassMat = new PhysMat({
        color: 0x8fd6ff,
        metalness: 0.85,
        roughness: 0.1,
        clearcoat: 0.9,
        emissive: 0x1a4a6a,
        emissiveIntensity: 0.55
    });

    // Body — smooth lathed profile for a sleeker, more modern silhouette
    // than a plain cylinder.
    var profile = [
        new THREE.Vector2(0.0, -1.05),
        new THREE.Vector2(0.34, -1.02),
        new THREE.Vector2(0.5, -0.85),
        new THREE.Vector2(0.5, 0.55),
        new THREE.Vector2(0.46, 0.95),
        new THREE.Vector2(0.0, 1.35)
    ];
    var body = new THREE.Mesh(
        new THREE.LatheGeometry(profile, 28),
        bodyMat
    );
    rocket.add(body);

    // Nose tip accent (small orange cap at the very top)
    var noseTip = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 12, 12),
        orangeMat
    );
    noseTip.position.y = 1.35;
    rocket.add(noseTip);

    // Orange accent ring
    var accentRing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.505, 0.505, 0.12, 24),
        orangeMat
    );
    accentRing.position.y = -0.55;
    rocket.add(accentRing);

    // Thin detail grooves (greebling — cheap visual richness)
    [0.15, -0.15].forEach(function (y) {
        var groove = new THREE.Mesh(
            new THREE.TorusGeometry(0.503, 0.012, 8, 24),
            navyMat
        );
        groove.position.y = y;
        groove.rotation.x = Math.PI / 2;
        rocket.add(groove);
    });

    // Porthole window
    var portWindow = new THREE.Mesh(new THREE.CircleGeometry(0.16, 24), glassMat);
    portWindow.position.set(0, 0.35, 0.499);
    rocket.add(portWindow);
    var windowRing = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.2, 24), bodyMat);
    windowRing.position.set(0, 0.35, 0.5);
    rocket.add(windowRing);

    // Fins — swept delta-wing shape via ExtrudeGeometry instead of a
    // plain flat box, for a more aerodynamic, modern silhouette.
    var finShapePts = new THREE.Shape();
    finShapePts.moveTo(0, 0.32);
    finShapePts.lineTo(0.46, -0.1);
    finShapePts.lineTo(0.34, -0.34);
    finShapePts.lineTo(0, -0.28);
    finShapePts.closePath();
    var finGeo = new THREE.ExtrudeGeometry(finShapePts, {
        depth: 0.05,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.008,
        bevelSegments: 1
    });
    finGeo.center();
    for (var i = 0; i < 3; i++) {
        var fin = new THREE.Mesh(finGeo, navyMat);
        var angle = (i / 3) * Math.PI * 2;
        var r = 0.5;
        fin.position.set(Math.sin(angle) * r, -0.78, Math.cos(angle) * r);
        fin.rotation.y = -angle + Math.PI / 2;
        fin.rotation.z = Math.PI / 2;
        var finTip = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, 0.46, 8),
            orangeMat
        );
        finTip.position.set(Math.sin(angle) * (r + 0.16), -0.9, Math.cos(angle) * (r + 0.16));
        rocket.add(fin, finTip);
    }

    // Engine nozzle
    var nozzle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.3, 0.32, 20),
        darkMat
    );
    nozzle.position.y = -1.2;
    rocket.add(nozzle);
    var nozzleRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.22, 0.025, 8, 20),
        orangeMat
    );
    nozzleRing.position.y = -1.36;
    nozzleRing.rotation.x = Math.PI / 2;
    rocket.add(nozzleRing);

    rocket.position.set(0, -1.75, 0);
    rocket.scale.setScalar(0.001);
    scene.add(rocket);

    /* ------------------------------------------------------------
       5. FLAME, TRAIL, GLOW AND PARTICLES
    ------------------------------------------------------------ */
    var flameGroup = new THREE.Group();
    var flameOuter = new THREE.Mesh(
        new THREE.ConeGeometry(0.3, 0.9, 18, 1, true),
        new THREE.MeshBasicMaterial({
            color: 0xff6b35, transparent: true, opacity: 0.55,
            blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false
        })
    );
    var flameInner = new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 0.55, 18, 1, true),
        new THREE.MeshBasicMaterial({
            color: 0xffd8a8, transparent: true, opacity: 0.85,
            blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false
        })
    );
    flameOuter.rotation.x = Math.PI;
    flameInner.rotation.x = Math.PI;
    flameOuter.position.y = -0.45;
    flameInner.position.y = -0.28;

    // Soft glow sprite at the flame base — brightens the engine without
    // needing post-processing bloom.
    var flameGlow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTexOrange, transparent: true, depthWrite: false,
        blending: THREE.AdditiveBlending
    }));
    flameGlow.scale.set(1.1, 1.1, 1);
    flameGlow.position.y = -0.05;

    flameGroup.add(flameOuter, flameInner, flameGlow);
    flameGroup.position.y = -1.35;
    flameGroup.scale.setScalar(0.001);
    rocket.add(flameGroup);

    // Trail — soft tapered additive cylinder
    var trail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.24, 1, 14, 1, true),
        new THREE.MeshBasicMaterial({
            color: 0xff8c4d, transparent: true, opacity: 0.32,
            blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false
        })
    );
    trail.scale.set(1, 0.001, 1);
    scene.add(trail);

    // Particles — soft round glow dots (via glow texture), deliberately few
    var particleCount = isMobile ? 9 : 18;
    var particleGeo = new THREE.BufferGeometry();
    var positions = new Float32Array(particleCount * 3);
    var seeds = [];
    for (var p = 0; p < particleCount; p++) {
        var a = Math.random() * Math.PI * 2;
        var rad = 0.9 + Math.random() * 1.0;
        positions[p * 3] = Math.cos(a) * rad;
        positions[p * 3 + 1] = -1.8 + Math.random() * 3.8;
        positions[p * 3 + 2] = Math.sin(a) * rad * 0.6;
        seeds.push({ a: a, rad: rad, speed: 0.15 + Math.random() * 0.2, phase: Math.random() * 10 });
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    var particles = new THREE.Points(
        particleGeo,
        new THREE.PointsMaterial({
            map: glowTexSoft,
            color: 0xffb37a,
            size: isMobile ? 0.14 : 0.18,
            transparent: true,
            opacity: 0.6,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        })
    );
    scene.add(particles);

    /* ------------------------------------------------------------
       6. ANIMATION TIMELINE
    ------------------------------------------------------------ */
    var ROCKET_START_Y = -1.75;
    var ROCKET_END_Y = 1.55;
    var HOLD_UNTIL = 8.5;
    var LOOP_DURATION = 10.5;
    var ROCKET_SCALE = 0.85;

    var startTime = null;
    var upliftShown = false;
    var upliftHidden = false;
    var fullShown = false;

    function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function clamp01(v) { return Math.max(0, Math.min(1, v)); }

    function resetCycle() {
        startTime = null;
        upliftShown = false;
        upliftHidden = false;
        fullShown = false;
        if (upliftEl) upliftEl.classList.remove("visible", "fading");
        if (fullEl) fullEl.classList.remove("visible");
    }

    function updateTimeline(elapsed) {
        if (elapsed > LOOP_DURATION) { resetCycle(); return; }

        // Phase 1 (0–1s): gentle entrance
        var entranceT = clamp01(elapsed / 1);
        var entranceScale = easeOutCubic(entranceT) * ROCKET_SCALE;
        rocket.scale.setScalar(Math.max(0.001, entranceScale));
        rocket.position.y = ROCKET_START_Y + Math.sin(elapsed * 1.6) * 0.03 * entranceT;
        rocket.rotation.z = Math.sin(elapsed * 1.1) * 0.03;

        // Phase 2 (1–2s): engine glow ramps up
        var glowT = clamp01((elapsed - 1) / 1);
        engineLight.intensity = glowT * 1.7;
        flameGroup.scale.setScalar(Math.max(0.001, glowT * 0.7));

        // Phase 3 (2–4s): launch upward, with a light dynamic tilt/roll
        var launchT = clamp01((elapsed - 2) / 2);
        var eased = easeInOutCubic(launchT);
        if (elapsed >= 1) {
            rocket.position.y = ROCKET_START_Y + (ROCKET_END_Y - ROCKET_START_Y) * eased;
        }
        if (elapsed >= 2) {
            var flicker = 1 + Math.sin(elapsed * 24) * 0.08;
            flameGroup.scale.set(flicker, 1 + launchT * 0.6, flicker);
            engineLight.intensity = 1.5 + Math.sin(elapsed * 20) * 0.2;
            rocket.rotation.z = Math.sin(elapsed * 0.9) * 0.05 * (1 - launchT * 0.6);
            rocket.rotation.x = Math.sin(elapsed * 0.7) * 0.025;
        }

        // Trail
        if (elapsed >= 2) {
            var climbed = rocket.position.y - ROCKET_START_Y;
            var trailLen = Math.max(0.001, climbed * 1.05);
            trail.scale.set(1.3, trailLen, 1.3);
            trail.position.y = ROCKET_START_Y + (rocket.position.y - ROCKET_START_Y) / 2 - 0.3;
            trail.material.opacity = 0.32 * clamp01(1 - launchT * 0.25);
        }

        // Particles
        var posAttr = particleGeo.attributes.position;
        for (var pi = 0; pi < particleCount; pi++) {
            var s = seeds[pi];
            var t = elapsed + s.phase;
            posAttr.array[pi * 3] = Math.cos(s.a + t * 0.15) * s.rad;
            posAttr.array[pi * 3 + 1] = -1.9 + ((t * s.speed) % 3.9);
            posAttr.array[pi * 3 + 2] = Math.sin(s.a + t * 0.15) * s.rad * 0.6;
        }
        posAttr.needsUpdate = true;
        particles.material.opacity = 0.6 * clamp01(entranceT);

        // Slow camera parallax drift — adds life without being distracting
        camera.position.x = baseCamX + Math.sin(elapsed * 0.25) * 0.18;
        camera.lookAt(0, 0.4, 0);
        atmoSprite.material.rotation = elapsed * 0.02;

        // Phase 4 (3–4.5s): "UPLIFT" reveal
        if (elapsed >= 3 && !upliftShown && upliftEl) {
            upliftEl.classList.add("visible");
            upliftShown = true;
        }

        // Phase 5: swap to full caption
        if (elapsed >= 4.5 && !upliftHidden && upliftEl) {
            upliftEl.classList.add("fading");
            upliftHidden = true;
        }
        if (elapsed >= 4.6 && !fullShown && fullEl) {
            fullEl.classList.add("visible");
            fullShown = true;
        }

        // Gentle hold with slow drift
        if (elapsed > 5.5 && elapsed < HOLD_UNTIL) {
            rocket.position.y = ROCKET_END_Y + Math.sin(elapsed * 0.8) * 0.02;
            rocket.rotation.z = Math.sin(elapsed * 0.5) * 0.02;
        }

        // Smooth fade-out before loop resets
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
       7. RESIZE HANDLING
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
       8. VISIBILITY HANDLING
    ------------------------------------------------------------ */
    var isVisible = true;
    if (typeof IntersectionObserver !== "undefined") {
        new IntersectionObserver(
            function (entries) {
                isVisible = entries[0].isIntersecting;
                if (isVisible && startTime === null) startTime = performance.now();
            },
            { threshold: 0.1 }
        ).observe(container);
    }

    /* ------------------------------------------------------------
       9. RENDER LOOP
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