/* ==========================================================================
   newVanar — portable OCP homepage video scroller

   Usage:
     const controller = mountOcpVideoScroller("#ocp-video-header", {
       assetBase: "/ocp-video-header/assets/",
       navOffset: 72
     });

   The default narrative and timing match the current Vanar homepage header.
   ========================================================================== */

(function(global) {
    "use strict";

    const SCRIPT_BASE = (() => {
        if (typeof document === "undefined") return "";
        const script = document.currentScript;
        return script && script.src ? new URL(".", script.src).href : document.baseURI;
    })();

    const DEFAULT_DURATION = 44.208333;
    const DEFAULT_TIMES = [0, 3.35, 12.25, 24.75, 36.75];
    const DEFAULT_ACCENTS = ["#84f7c7", "#ff5a52", "#f2aa37", "#5b83ff", "#32dbe8"];
    const DEFAULT_CHAPTERS = Object.freeze([
        Object.freeze({
            scene: 0,
            start: 0,
            end: 3.35,
            scroll: 1.35,
            linger: 0.35
        }),
        Object.freeze({
            scene: 1,
            start: 3.35,
            end: 12.25,
            scroll: 2.1,
            linger: 0.25
        }),
        Object.freeze({
            scene: 2,
            start: 12.25,
            end: 24.75,
            scroll: 2.45,
            linger: 0.35
        }),
        Object.freeze({
            scene: 3,
            start: 24.75,
            end: 36.75,
            scroll: 2.45,
            linger: 0.3
        }),
        Object.freeze({
            scene: 4,
            start: 36.75,
            end: DEFAULT_DURATION,
            scroll: 1.9,
            linger: 0.35
        }),
    ]);
    const DEFAULT_SEGMENTS = Object.freeze([
        Object.freeze({
            id: "00-ocp",
            scene: 0,
            start: 0,
            end: 3.35,
            mediaStart: 0
        }),
        Object.freeze({
            id: "01-idea-a",
            scene: 1,
            start: 3.35,
            end: 7.75,
            mediaStart: 2.95
        }),
        Object.freeze({
            id: "02-idea-b",
            scene: 1,
            start: 7.75,
            end: 12.25,
            mediaStart: 7.35
        }),
        Object.freeze({
            id: "03-service-a",
            scene: 2,
            start: 12.25,
            end: 18.75,
            mediaStart: 11.85
        }),
        Object.freeze({
            id: "04-service-b",
            scene: 2,
            start: 18.75,
            end: 24.75,
            mediaStart: 18.35
        }),
        Object.freeze({
            id: "05-app-a",
            scene: 3,
            start: 24.75,
            end: 30.75,
            mediaStart: 24.35
        }),
        Object.freeze({
            id: "06-app-b",
            scene: 3,
            start: 30.75,
            end: 36.75,
            mediaStart: 30.35
        }),
        Object.freeze({
            id: "07-team",
            scene: 4,
            start: 36.75,
            end: DEFAULT_DURATION,
            mediaStart: 36.35
        }),
    ]);

    const DEFAULT_NARRATIVE = Object.freeze([
        Object.freeze({
            id: "ocp",
            railNumber: "00",
            railLabel: "OCP",
            kicker: "Vanar OCP · The agentic company primitive",
            title: "Launch an AI\nOrganization.\nHire One.",
            titleLineTwo: "Back the Best.",
            accentPhrase: "Back the Best.",
            detailLead: "Chatbots answer. Agents do tasks. Vanar Orgs run the Organization.",
            detail: "The AI Organization has arrived, a real Organization with an AI workforce and a treasury, marketing, selling, supporting, and growing as one. Stand up the whole thing in one place. Settled in USDC on Base.",
            still: "stills/00-ocp.jpg",
        }),
        Object.freeze({
            id: "idea",
            railNumber: "01",
            railLabel: "Idea",
            railAria: "Idea to company, London",
            kicker: "01 · Idea → Organization · Voidsec, London",
            title: "Your idea becomes",
            titleLineTwo: "a running Organization.",
            accentPhrase: "Your idea",
            detail: "Describe what you want to build. Turn it into a live Organization with a product, AI workforce, payments, and the tools to market, sell, support, and grow from day one.",
            still: "stills/01-idea.jpg",
        }),
        Object.freeze({
            id: "service",
            railNumber: "02",
            railLabel: "Service",
            railAria: "Service to platform, Bengaluru",
            kicker: "02 · Service → Organization · ChainCharter, Bengaluru",
            title: "Your service becomes",
            titleLineTwo: "a scalable Organization.",
            accentPhrase: "Your service",
            detail: "Turn the service you already offer into a structured Organization buyers can order from. Package your expertise, handle intake, manage payments, and add AI workers for marketing, support, delivery, and follow-up.",
            still: "stills/02-service.jpg",
        }),
        Object.freeze({
            id: "app",
            railNumber: "03",
            railLabel: "App",
            railAria: "App to business, Dubai",
            kicker: "03 · App → Organization · Flowstate Pay, Dubai",
            title: "Your vibe-coded app",
            titleLineTwo: "becomes a business.",
            accentPhrase: "vibe-coded app",
            detail: "You built the app. Now build the business around it. Add payments, support, marketing, growth workflows, and an AI workforce that helps turn users into customers.",
            still: "stills/03-app.jpg",
            platforms: [
                ["base44-wordmark.webp", "Base44"],
                ["codex.webp", "OpenAI Codex"],
                ["claude-wordmark.webp", "Claude"],
                ["cursor.webp", "Cursor"],
                ["lovable-wordmark.webp", "Lovable"],
                ["bolt-wordmark.webp", "Bolt.new"],
                ["replit-wordmark.webp", "Replit"],
            ],
        }),
        Object.freeze({
            id: "team",
            railNumber: "04",
            railLabel: "Team",
            railAria: "Team to AI workforce, Manila",
            kicker: "04 · Team → AI workforce · Tideline, Manila",
            title: "Give your team",
            titleLineTwo: "an AI workforce.",
            accentPhrase: "your team",
            detail: "Scale beyond your current headcount. Add specialist AI workers for marketing, sales, support, SEO, business development, reporting, and more, all learning from your Organization and working alongside your team.",
            still: "stills/04-team.jpg",
        }),
    ]);

    function mountOcpVideoScroller(target, options) {
        const root = typeof target === "string" ? document.querySelector(target) : target;
        if (!root) throw new Error("mountOcpVideoScroller: target element was not found");
        if (root.__ocpVideoScroller) root.__ocpVideoScroller.destroy();

        options = options || {};
        const assetBase = new URL(options.assetBase || "assets/", SCRIPT_BASE || document.baseURI).href;
        const asset = (path) => new URL(path, assetBase).href;
        // The heavy .mp4 segments can be served from a CDN via videoBase; posters,
        // logos and stills stay on assetBase (local). Falls back to assetBase.
        const videoBase = new URL(options.videoBase || options.assetBase || "assets/", SCRIPT_BASE || document.baseURI).href;
        const videoAsset = (path) => new URL(path, videoBase).href;
        const narrative = (options.narrative || DEFAULT_NARRATIVE).map((scene) => ({
            ...scene,
            platforms: scene.platforms ? scene.platforms.map((item) => [...item]) : undefined,
        }));
        const sceneTimes = options.sceneTimes || DEFAULT_TIMES;
        const sceneAccents = options.sceneAccents || DEFAULT_ACCENTS;
        const fallbackDuration = Number(options.duration) || DEFAULT_DURATION;
        const navOffset = Math.max(0, Number(options.navOffset) || 0);
        const mobileScrollFactor = Math.max(1, Number(options.mobileScrollFactor) || 1.2);
        const chapterSource =
            options.chapters ||
            DEFAULT_CHAPTERS.map((chapter, index) => ({
                ...chapter,
                start: Number(sceneTimes[index] ? ? chapter.start),
                end: Number(sceneTimes[index + 1] ? ? fallbackDuration),
            }));
        const chapters = chapterSource.map((chapter, index) => ({
            scene: Number.isFinite(chapter.scene) ? chapter.scene : index,
            start: Number(chapter.start ? ? sceneTimes[index] ? ? 0),
            end: Number(chapter.end ? ? sceneTimes[index + 1] ? ? fallbackDuration),
            scroll: Math.max(0.5, Number(chapter.scroll) || 1.5),
            linger: Math.min(0.6, Math.max(0, Number(chapter.linger) || 0)),
        }));
        const segments = (options.segments || DEFAULT_SEGMENTS).map((segment, index) => ({
            ...segment,
            id: String(segment.id || `segment-${index}`),
            scene: Number(segment.scene) || 0,
            start: Number(segment.start) || 0,
            end: Number(segment.end) || fallbackDuration,
            mediaStart: Number(segment.mediaStart) || 0,
        }));
        const previewMode = new URLSearchParams(window.location.search);
        const reducedMotion =
            window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
            previewMode.get("motion") === "reduce";
        const saveData =
            Boolean(navigator.connection && navigator.connection.saveData) ||
            previewMode.get("data") === "save";
        let staticMode = reducedMotion || saveData || options.video === false;
        const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
        const smallViewport = window.matchMedia("(max-width: 880px)");
        const isMobileBehavior = () => coarsePointer || smallViewport.matches;
        const phoneClass =
            Math.min(window.screen.width, window.screen.height) < 600 || window.innerWidth <= 600;
        const connection = navigator.connection;
        const slowNetwork = Boolean(
            connection && /^(slow-2g|2g|3g)$/.test(connection.effectiveType || ""),
        );
        // Segments are normally fetched whole and handed to the element as a blob,
        // which keeps `currentTime` scrubbing exact but shows nothing until 100% has
        // arrived. ?blob=off swaps in the direct-URL path (range requests, progressive
        // decode, no ~30MB of retained object URLs) so the scrub tradeoff can be
        // compared side by side.
        //
        // A cross-origin videoBase (the CDN) cannot be read as a blob unless it sends
        // Access-Control-Allow-Origin. Without that header every fetch() throws CORS
        // and loadLayer() falls back to the direct <video src> path anyway — but only
        // after a wasted, console-erroring request per segment. So blob loading now
        // defaults OFF whenever the video origin differs from the page origin; the
        // direct path plays the same media without CORS. Pass blobLoading:true to
        // force blobs back on once the CDN is serving CORS headers.
        let crossOriginVideo = false;
        try {
            crossOriginVideo = new URL(videoBase).origin !== window.location.origin;
        } catch {}
        const blobLoading =
            previewMode.get("blob") === "off" ?
            false :
            typeof options.blobLoading === "boolean" ?
            options.blobLoading :
            !crossOriginVideo;

        injectStyles();
        const previousHeight = root.style.height;
        const customProperties = [
            "--ocp-vs-nav-offset",
            "--ocp-vs-accent",
            "--ocp-vs-bg",
            "--ocp-vs-display",
            "--ocp-vs-body",
            "--ocp-vs-mono",
        ];
        const previousCustomProperties = Object.fromEntries(
            customProperties.map((name) => [name, root.style.getPropertyValue(name)]),
        );
        const hadRootClass = root.classList.contains("ocp-vs-root");
        const hadAriaLabel = root.hasAttribute("aria-label");
        root.classList.add("ocp-vs-root");
        root.style.setProperty("--ocp-vs-nav-offset", `${navOffset}px`);
        root.style.setProperty("--ocp-vs-accent", sceneAccents[0]);
        root.style.setProperty("--ocp-vs-bg", options.background || "#0a3528");
        root.style.setProperty("--ocp-vs-display", options.displayFont || "'Big Shoulders Display', Impact, sans-serif");
        root.style.setProperty("--ocp-vs-body", options.bodyFont || "'Inter Tight', Inter, system-ui, sans-serif");
        root.style.setProperty("--ocp-vs-mono", options.monoFont || "'JetBrains Mono', ui-monospace, monospace");
        root.setAttribute("data-ocp-video-scroller", "");
        if (!root.hasAttribute("aria-label")) {
            root.setAttribute("aria-label", "Four ways to build an agentic company with OCP");
        }

        // Everything the mounted stage supersedes: the crawler fallback, and the
        // pre-mount hero (.vs-pre) that paints chapter 0 from static markup so the
        // first frame is not a blank stage. Hidden rather than removed, and their
        // prior state is recorded so destroy() restores what the page shipped
        // instead of force-revealing both. Hidden only here — if mounting throws
        // before this line, the static hero stays up and carries the page.
        const supersededNodes = Array.from(
            root.querySelectorAll("[data-ocp-video-seo],[data-ocp-static-hero]"),
        ).map((node) => {
            const wasHidden = node.hidden;
            node.hidden = true;
            return {
                node,
                wasHidden
            };
        });

        const stage = element("div", "ocp-vs-stage");
        stage.dataset.scene = "0";

        const media = element("div", "ocp-vs-media");
        media.setAttribute("aria-hidden", "true");
        const mediaLayers = segments.map((segment, index) => {
            const layer = element("div", "ocp-vs-media-scene");
            layer.dataset.mediaSegment = segment.id;
            const image = element("img", "ocp-vs-still");
            const tier = phoneClass ? "mobile" : "desktop";
            const stillSrc =
                staticMode && narrative[segment.scene] ? .still ?
                asset(narrative[segment.scene].still) :
                asset(`segments/posters/${tier}/${segment.id}.webp`);
            image.alt = "";
            image.decoding = "async";
            // Only the first still belongs on the critical path. The other seven are
            // parked on dataset.src and assigned once the page is idle (prefetchStills).
            // loading="lazy" cannot defer them: every layer sits at inset:0 inside the
            // in-viewport stage, and opacity:0 does not hold back a lazy image that
            // intersects. In staticMode the stills are the entire experience, so they
            // stay eager there.
            if (index === 0 || staticMode) {
                image.src = stillSrc;
            } else {
                image.dataset.src = stillSrc;
                image.fetchPriority = "low";
            }
            const video = element("video", "ocp-vs-video");
            // Deliberately no video.poster. The element is opacity:0 until .has-video,
            // and by the time it is opaque it paints real frames, so the poster has no
            // visible state at any point — but it is fetched regardless, even under
            // preload="none".
            video.muted = true;
            video.playsInline = true;
            video.preload = "none";
            video.setAttribute("muted", "");
            video.setAttribute("playsinline", "");
            layer.appendChild(image);
            layer.appendChild(video);
            media.appendChild(layer);
            return {
                ...segment,
                el: layer,
                image,
                video,
                loading: false,
                ready: false,
                failed: false,
                painted: false,
                visible: index === 0,
                target: 0,
                current: 0,
                objectUrl: "",
                abortController: null,
            };
        });
        media.appendChild(element("div", "ocp-vs-grade"));
        media.appendChild(element("div", "ocp-vs-scrim"));
        stage.appendChild(media);

        const status = element("div", "ocp-vs-status");
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");
        status.textContent = staticMode ?
            saveData ?
            "Data saver · stills" :
            "Reduced motion · stills" :
            "Loading film";
        stage.appendChild(status);

        const copyLayer = element("div", "ocp-vs-copy");
        copyLayer.setAttribute("aria-live", "polite");
        const cards = narrative.map((scene, index) => {
            const card = element("article", `ocp-vs-card${index === 0 ? " ocp-vs-card--hero" : ""}`);
            card.dataset.copyScene = String(index);
            card.classList.toggle("is-active", index === 0);
            card.setAttribute("aria-hidden", index === 0 ? "false" : "true");
            card.innerHTML = cardMarkup(scene, index, asset, options);
            copyLayer.appendChild(card);
            return card;
        });
        stage.appendChild(copyLayer);

        const rail = element("nav", "ocp-vs-rail");
        rail.setAttribute("aria-label", "Film chapters");

        const railEyebrow = element("p", "ocp-vs-rail-eyebrow");
        railEyebrow.textContent = options.railHeading || "Four ways in";
        rail.appendChild(railEyebrow);

        const railList = element("div", "ocp-vs-rail-list");
        const chapterButtons = narrative.map((scene, index) => {
            const button = element("button", "ocp-vs-rail-item");
            button.type = "button";
            button.dataset.sceneJump = String(index);
            button.classList.toggle("is-active", index === 0);
            button.setAttribute("aria-label", scene.railAria || scene.railLabel);
            button.innerHTML =
                `<span class="ocp-vs-rail-num">${escapeHtml(scene.railNumber)}</span>` +
                `<span class="ocp-vs-rail-label">${escapeHtml(scene.railLabel)}</span>`;
            railList.appendChild(button);
            return button;
        });
        rail.appendChild(railList);

        // Footer call-to-action. ctaHref is supplied by the host (Foundry URL);
        // it falls back to a hash so the markup is still valid if omitted.
        const railFoot = element("div", "ocp-vs-rail-foot");
        const railCta = element("a", "ocp-vs-rail-cta");
        railCta.href = options.ctaHref || "#";
        railCta.textContent = options.ctaLabel || "Launch an org";
        railFoot.appendChild(railCta);
        rail.appendChild(railFoot);

        if (options.rail !== false) stage.appendChild(rail);

        const progress = element("div", "ocp-vs-progress");
        progress.setAttribute("aria-hidden", "true");
        const progressFill = element("span");
        progress.appendChild(progressFill);
        stage.appendChild(progress);

        const cue = element("div", "ocp-vs-cue");
        cue.setAttribute("aria-hidden", "true");
        cue.innerHTML = `<span>${escapeHtml(options.scrollLabel || "Scroll to walk")}</span><i></i>`;
        stage.appendChild(cue);

        root.appendChild(stage);

        let currentScene = -1;
        let currentMedia = -1;
        let loadingStarted = false;
        let userReady = false;
        let destroyed = false;
        let frame = 0;
        let readFrame = 0;
        let observer = null;
        let laidOutWidth = window.innerWidth;
        let stagePixels = 1;
        let totalTravel = 1;
        let timelineTime = 0;
        let progressValue = 0;

        function clamp(value, minimum = 0, maximum = 1) {
            return Math.min(maximum, Math.max(minimum, value));
        }

        function smooth(value) {
            const x = clamp(value);
            return x * x * (3 - 2 * x);
        }

        function lingerEase(value, linger) {
            const x = clamp(value);
            const center = x - 0.5;
            return (1 - linger) * x + linger * (4 * center * center * center + 0.5);
        }

        function stageHeight() {
            return Math.max(1, window.innerHeight - navOffset);
        }

        function layout() {
            if (destroyed) return;
            stagePixels = stageHeight();
            const factor = isMobileBehavior() ? mobileScrollFactor : 1;
            let offset = 0;
            chapters.forEach((chapter) => {
                chapter.startPx = offset * stagePixels;
                offset += chapter.scroll * factor;
                chapter.endPx = offset * stagePixels;
            });
            totalTravel = Math.max(1, offset * stagePixels);
            root.style.height = `${totalTravel + stagePixels}px`;
            read();
        }

        function sectionTop() {
            return root.getBoundingClientRect().top + window.scrollY - navOffset;
        }

        function localScrollY() {
            return clamp(window.scrollY - sectionTop(), 0, totalTravel);
        }

        function setScene(scene) {
            if (scene === currentScene) return;
            currentScene = scene;
            stage.dataset.scene = String(scene);
            stage.style.setProperty("--ocp-vs-accent", sceneAccents[scene] || sceneAccents[0]);
            cards.forEach((card, index) => {
                const active = index === scene;
                card.classList.toggle("is-active", active);
                card.setAttribute("aria-hidden", active ? "false" : "true");
            });
            chapterButtons.forEach((button, index) => {
                button.classList.toggle("is-active", index === scene);
            });
        }

        function updateCopy(y) {
            const fade = Math.max(1, (Number(options.copyCrossfade) || 0.14) * stagePixels);
            chapters.forEach((chapter, index) => {
                const fadeIn =
                    index === 0 ? 1 : smooth((y - (chapter.startPx - fade)) / (fade * 2));
                const fadeOut =
                    index === chapters.length - 1 ?
                    1 :
                    smooth((chapter.endPx + fade - y) / (fade * 2));
                const opacity = Math.min(fadeIn, fadeOut);
                const local = clamp((y - chapter.startPx) / Math.max(1, chapter.endPx - chapter.startPx));
                const card = cards[chapter.scene];
                if (!card) return;
                card.classList.toggle("is-visible", opacity > 0.001);
                card.style.opacity = String(opacity);
                card.style.transform = reducedMotion ? "none" : `translateY(${(0.5 - local) * 18}px)`;
                card.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
            });
        }

        function mediaForTime(time) {
            let index = 0;
            mediaLayers.forEach((segment, candidate) => {
                if (time >= segment.start) index = candidate;
            });
            return index;
        }

        function updateMedia(time) {
            const fade = Math.max(0.04, Number(options.mediaCrossfadeSeconds) || 0.22);
            const active = mediaForTime(time);
            currentMedia = active;
            mediaLayers.forEach((layer, index) => {
                const fadeIn =
                    index === 0 ? 1 : smooth((time - (layer.start - fade)) / (fade * 2));
                const fadeOut =
                    index === mediaLayers.length - 1 ?
                    1 :
                    smooth((layer.end + fade - time) / (fade * 2));
                const opacity = Math.min(fadeIn, fadeOut);
                layer.visible = opacity > 0.001;
                layer.target = Math.max(0, time - layer.mediaStart);
                layer.el.style.opacity = String(opacity);
                layer.el.style.zIndex = String(index === active ? 2 : 1);
            });
            if (loadingStarted && !staticMode) {
                const radius = slowNetwork ? 0 : 1;
                for (let index = active - radius; index <= active + 1; index += 1) {
                    loadLayer(index);
                }
            }
            const activeLayer = mediaLayers[active];
            stage.classList.toggle("is-ready", staticMode || Boolean(activeLayer ? .painted || activeLayer ? .failed));
            status.textContent = activeLayer ? .failed ? "Using scene still" : "Film ready";
        }

        function sourceFor(layer) {
            const tier = phoneClass ? "mobile" : "desktop";
            return videoAsset(`segments/${tier}/${layer.id}.mp4`);
        }

        function paintLayer(layer) {
            if (destroyed || layer.painted) return;
            layer.painted = true;
            layer.el.classList.add("has-video");
            if (layer === mediaLayers[currentMedia]) {
                stage.classList.add("is-ready");
                status.textContent = "Film ready";
            }
        }

        function primeVideo(video) {
            if (!isMobileBehavior() || staticMode || video.readyState < 1) return;
            try {
                const playback = video.play();
                if (playback && typeof playback.then === "function") {
                    playback.then(() => video.pause()).catch(() => enterStaticMode("Film unavailable · stills"));
                } else {
                    video.pause();
                }
            } catch {
                enterStaticMode("Film unavailable · stills");
            }
        }

        function onFirstGesture() {
            if (userReady) return;
            userReady = true;
            mediaLayers.forEach((layer) => primeVideo(layer.video));
        }

        function enterStaticMode(label) {
            if (staticMode && stage.classList.contains("is-static")) return;
            staticMode = true;
            stage.classList.add("is-static", "is-ready");
            status.textContent = label || "Stills mode";
            mediaLayers.forEach((layer) => {
                layer.abortController ? .abort();
                try {
                    layer.video.pause();
                    layer.video.removeAttribute("src");
                    layer.video.load();
                } catch {}
                if (layer.objectUrl) URL.revokeObjectURL(layer.objectUrl);
                layer.objectUrl = "";
                layer.ready = false;
                layer.painted = false;
                layer.el.classList.remove("has-video");
                const still = narrative[layer.scene] ? .still;
                if (still) layer.image.src = asset(still);
            });
            read();
        }

        function installVideoSource(layer, source) {
            if (destroyed || staticMode) return;
            const video = layer.video;
            video.preload = "auto";
            video.addEventListener(
                "loadedmetadata",
                () => {
                    if (destroyed) return;
                    layer.ready = true;
                    const safeTime = clamp(layer.target, 0, Math.max(0, video.duration - 0.025));
                    layer.current = safeTime;
                    if (safeTime <= 0.025) {
                        paintLayer(layer);
                    } else {
                        try {
                            video.currentTime = safeTime;
                        } catch {}
                    }
                }, {
                    once: true
                },
            );
            video.addEventListener("seeked", () => paintLayer(layer), {
                once: true
            });
            video.addEventListener(
                "loadeddata",
                () => {
                    if (layer.target <= 0.025) paintLayer(layer);
                    if (userReady) primeVideo(video);
                }, {
                    once: true
                },
            );
            video.addEventListener(
                "error",
                () => {
                    layer.failed = true;
                    layer.el.classList.remove("has-video");
                    if (layer === mediaLayers[currentMedia]) {
                        stage.classList.add("is-ready");
                        status.textContent = "Using scene still";
                    }
                }, {
                    once: true
                },
            );
            video.src = source;
            video.load();
        }

        async function loadLayer(index) {
            const layer = mediaLayers[index];
            if (!layer || staticMode || layer.loading || layer.ready || layer.failed) return;
            layer.loading = true;
            layer.abortController = new AbortController();
            const url = sourceFor(layer);
            if (layer === mediaLayers[currentMedia]) status.textContent = "Loading film";
            if (!blobLoading) {
                installVideoSource(layer, url);
                return;
            }
            try {
                const response = await fetch(url, {
                    signal: layer.abortController.signal
                });
                if (!response.ok) throw new Error(`Media request failed: ${response.status}`);
                const blob = await response.blob();
                if (destroyed || staticMode) return;
                layer.objectUrl = URL.createObjectURL(blob);
                installVideoSource(layer, layer.objectUrl);
            } catch (error) {
                if (destroyed || staticMode || error ? .name === "AbortError") return;
                installVideoSource(layer, url);
            }
        }

        function applyScrollPosition(y) {
            let activeChapter = chapters[0];
            chapters.forEach((chapter) => {
                if (y >= chapter.startPx) activeChapter = chapter;
            });
            const local = clamp(
                (y - activeChapter.startPx) /
                Math.max(1, activeChapter.endPx - activeChapter.startPx),
            );
            const eased = lingerEase(local, activeChapter.linger);
            timelineTime =
                activeChapter.start + eased * Math.max(0, activeChapter.end - activeChapter.start);
            progressValue = clamp(y / totalTravel);
            setScene(activeChapter.scene);
            updateCopy(y);
            updateMedia(timelineTime);
            progressFill.style.transform = `scaleX(${progressValue})`;
            stage.classList.toggle("has-started", progressValue > 0.015);
            cue.style.opacity = String(clamp(1 - y / Math.max(1, stagePixels * 0.5)));
        }

        function read() {
            if (destroyed) return;
            applyScrollPosition(localScrollY());
        }

        function scheduleRead() {
            if (readFrame || destroyed) return;
            readFrame = window.requestAnimationFrame(() => {
                readFrame = 0;
                read();
            });
        }

        function render() {
            if (destroyed) return;
            const threshold = isMobileBehavior() ? 0.02 : 0.008;
            mediaLayers.forEach((layer) => {
                const video = layer.video;
                if (!layer.ready || layer.failed || video.seeking) return;
                if (!layer.visible && Math.abs(layer.current - layer.target) < 0.002) return;
                layer.current += (layer.target - layer.current) * (reducedMotion ? 1 : 0.18);
                const safeTime = clamp(layer.current, 0, Math.max(0, video.duration - 0.025));
                if (Math.abs(video.currentTime - safeTime) > threshold) {
                    try {
                        video.currentTime = safeTime;
                    } catch {}
                }
            });
            frame = window.requestAnimationFrame(render);
        }

        // Run a task once the page has finished its own loading, then once the main
        // thread is idle. requestIdleCallback is absent in Safari before 17, hence
        // the timeout fallback.
        function whenIdle(task) {
            const schedule = () => {
                if (destroyed) return;
                if (typeof window.requestIdleCallback === "function") {
                    window.requestIdleCallback(task, {
                        timeout: 2000
                    });
                } else {
                    window.setTimeout(task, 200);
                }
            };
            if (document.readyState === "complete") schedule();
            else window.addEventListener("load", schedule, {
                once: true
            });
        }

        // Assign the stills held back at build time. Runs off the critical path but
        // still unprompted, so a slow connection keeps its head start and never hits
        // a scene transition with an empty layer.
        function prefetchStills() {
            mediaLayers.forEach((layer) => {
                const src = layer.image.dataset.src;
                if (!src) return;
                delete layer.image.dataset.src;
                layer.image.src = src;
            });
        }

        function loadFilm() {
            if (loadingStarted || staticMode) return;
            loadingStarted = true;
            status.textContent = "Loading film";
            const first = currentMedia < 0 ? 0 : currentMedia;
            loadLayer(first);
            // Segment two is prefetch, not critical path: scene 1 starts ~15% into a
            // ~11,000px hero. Deferring it past the load event keeps it out of the LCP
            // window while still starting it long before the user can scroll to it.
            whenIdle(() => loadLayer(first + 1));
        }

        function jumpTo(index, behavior) {
            const scene = clamp(Number(index) || 0, 0, narrative.length - 1);
            const chapter = chapters.find((item) => item.scene === scene) || chapters[scene];
            const inset = scene === 0 ? 0 : Math.min(stagePixels * 0.2, (chapter.endPx - chapter.startPx) * 0.16);
            window.scrollTo({
                top: Math.max(0, sectionTop() + chapter.startPx + inset),
                behavior: behavior || "auto",
            });
            scheduleRead();
        }

        function onResize() {
            if (coarsePointer && window.innerWidth === laidOutWidth) return;
            laidOutWidth = window.innerWidth;
            layout();
        }

        function onOrientationChange() {
            laidOutWidth = window.innerWidth;
            layout();
        }

        chapterButtons.forEach((button, index) => {
            button.addEventListener("click", () => jumpTo(index));
        });

        if (staticMode) {
            stage.classList.add("is-static", "is-ready");
        } else if ("IntersectionObserver" in window) {
            observer = new IntersectionObserver(
                (entries) => {
                    if (entries.some((entry) => entry.isIntersecting)) {
                        loadFilm();
                        observer.disconnect();
                    }
                }, {
                    rootMargin: "120% 0px"
                },
            );
            observer.observe(root);
        } else {
            loadFilm();
        }

        // Not gated on the observer: the stills are the fallback for every scene, so
        // they are wanted even when the film never loads.
        whenIdle(prefetchStills);

        window.addEventListener("scroll", scheduleRead, {
            passive: true
        });
        window.addEventListener("pointerdown", onFirstGesture, {
            once: true,
            passive: true
        });
        window.addEventListener("touchstart", onFirstGesture, {
            once: true,
            passive: true
        });
        window.addEventListener("resize", onResize);
        window.addEventListener("orientationchange", onOrientationChange);

        setScene(0);
        layout();
        frame = window.requestAnimationFrame(render);

        function destroy() {
            if (destroyed) return;
            destroyed = true;
            window.cancelAnimationFrame(frame);
            window.cancelAnimationFrame(readFrame);
            observer ? .disconnect();
            window.removeEventListener("scroll", scheduleRead);
            window.removeEventListener("pointerdown", onFirstGesture);
            window.removeEventListener("touchstart", onFirstGesture);
            window.removeEventListener("resize", onResize);
            window.removeEventListener("orientationchange", onOrientationChange);
            mediaLayers.forEach((layer) => {
                layer.abortController ? .abort();
                try {
                    layer.video.pause();
                    layer.video.removeAttribute("src");
                    layer.video.load();
                } catch {}
                if (layer.objectUrl) URL.revokeObjectURL(layer.objectUrl);
            });
            stage.remove();
            supersededNodes.forEach(({
                node,
                wasHidden
            }) => {
                node.hidden = wasHidden;
            });
            if (!hadRootClass) root.classList.remove("ocp-vs-root");
            root.removeAttribute("data-ocp-video-scroller");
            if (!hadAriaLabel) root.removeAttribute("aria-label");
            root.style.height = previousHeight;
            customProperties.forEach((name) => {
                const previousValue = previousCustomProperties[name];
                if (previousValue) root.style.setProperty(name, previousValue);
                else root.style.removeProperty(name);
            });
            delete root.__ocpVideoScroller;
        }

        const controller = {
            destroy,
            refresh: layout,
            jumpTo,
            getScene: () => currentScene,
            setProgress(value) {
                applyScrollPosition(clamp(Number(value) || 0) * totalTravel);
            },
        };
        root.__ocpVideoScroller = controller;
        return controller;
    }

    function cardMarkup(scene, index, asset, options) {
        options = options || {};
        const proofMarkup = scene.proof ?
            `<p class="ocp-vs-proof">${escapeHtml(scene.proof)}</p>` :
            "";
        const companyMarkup = scene.company ?
            `<p class="ocp-vs-company">${escapeHtml(scene.company)}</p>` :
            "";
        const enablerMarkup = scene.enablerLabel || scene.enabler ?
            `<p class="ocp-vs-enabler"><strong>${escapeHtml(scene.enablerLabel || "")}</strong> ${escapeHtml(scene.enabler || "")}</p>` :
            "";
        const outcomeMarkup = scene.outcome ?
            `<p class="ocp-vs-outcome">${escapeHtml(scene.outcome)}</p>` :
            "";
        const platformMarkup = scene.platforms ?
            `<div class="ocp-vs-platforms" aria-label="Compatible vibe-coding starting points">${scene.platforms
          .map(
            ([icon, label]) =>
              `<span tabindex="0"><img src="${escapeHtml(asset(`logos/${icon}`))}" alt="${escapeHtml(label)}"></span>`,
          )
          .join("")}</div>` :
            "";

        if (index === 0) {
            const heroCta = `
        <div class="ocp-vs-hero-cta">
          <a class="ocp-vs-hero-cta--primary" href="${escapeHtml(options.ctaHref || "#")}"${/^https?:/i.test(options.ctaHref || "") ? ' target="_blank" rel="noopener"' : ""}>Launch an organization <span aria-hidden="true">→</span></a>
          <a class="ocp-vs-hero-cta--secondary" href="${escapeHtml(options.marketplaceHref || "#")}">Explore the Marketplace</a>
        </div>`;
            return `
        <p class="ocp-vs-kicker">${escapeHtml(scene.kicker)}</p>
        <h1>${headingMarkup(scene.title, scene.accentPhrase)}<br><span>${headingMarkup(scene.titleLineTwo, scene.accentPhrase)}</span></h1>
        <p class="ocp-vs-detail">${scene.detailLead ? `<strong>${escapeHtml(scene.detailLead)}</strong> ` : ""}${escapeHtml(scene.detail)}</p>
        ${proofMarkup}
        ${heroCta}
      `;
        }

        return `
      <p class="ocp-vs-kicker">${escapeHtml(scene.kicker)}</p>
      ${companyMarkup}
      <h2>${headingMarkup(scene.title, scene.accentPhrase)}<br>${headingMarkup(scene.titleLineTwo, scene.accentPhrase)}</h2>
      <p class="ocp-vs-detail">${escapeHtml(scene.detail)}</p>
      ${enablerMarkup}
      ${outcomeMarkup}
      ${platformMarkup}
    `;
    }

    function element(tag, className) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        return node;
    }

    /* Wrap the scene's accent phrase in a span so it can take the mint-to-violet
       gradient, leaving the rest of the heading white. Matched against the
       already-escaped string, so the needle is escaped too rather than compared
       raw. A phrase that spans the title / titleLineTwo break will not match —
       keep each one inside a single line. Mirrors titleMarkup() in
       mobile-chapters.js; the two headers share this treatment. */
    function headingMarkup(value, accentPhrase) {
        const escaped = escapeHtml(value).replace(/\n/g, "<br>");
        if (!accentPhrase) return escaped;
        const needle = escapeHtml(accentPhrase);
        const at = escaped.toLowerCase().indexOf(needle.toLowerCase());
        if (at < 0) return escaped;
        const hit = escaped.slice(at, at + needle.length);
        return `${escaped.slice(0, at)}<span class="ocp-vs-hl">${hit}</span>${escaped.slice(at + needle.length)}`;
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value).replace(
            /[&<>"]/g,
            (character) => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;"
            })[character],
        );
    }

    function injectStyles() {
        if (document.getElementById("ocp-vs-styles")) return;
        const style = document.createElement("style");
        style.id = "ocp-vs-styles";
        style.textContent = `@layer ocp-video-scroller {
      .ocp-vs-root{--ocp-vs-accent:#84f7c7;position:relative;width:100%;min-height:100vh;background:var(--ocp-vs-bg,#0a3528);color:#fff;font-family:var(--ocp-vs-body);isolation:isolate}
      .ocp-vs-root,.ocp-vs-root *{box-sizing:border-box}
      .ocp-vs-stage{position:sticky;top:var(--ocp-vs-nav-offset,0px);height:calc(100vh - var(--ocp-vs-nav-offset,0px));height:calc(100svh - var(--ocp-vs-nav-offset,0px));min-height:560px;overflow:hidden;isolation:isolate;background:var(--ocp-vs-bg,#0a3528)}
      .ocp-vs-media,.ocp-vs-media-scene,.ocp-vs-still,.ocp-vs-video,.ocp-vs-grade,.ocp-vs-scrim{position:absolute;inset:0;width:100%;height:100%}
      .ocp-vs-media-scene{opacity:0;overflow:hidden;will-change:opacity}
      .ocp-vs-still,.ocp-vs-video{object-fit:cover;object-position:center}
      .ocp-vs-still{opacity:1}.ocp-vs-video{z-index:2;opacity:0}
      .ocp-vs-media-scene.has-video .ocp-vs-video{opacity:1}.ocp-vs-media-scene.has-video .ocp-vs-still{opacity:0}
      .ocp-vs-grade{z-index:3;pointer-events:none;background:linear-gradient(180deg,rgba(4,18,14,.08),rgba(5,36,27,.14));mix-blend-mode:multiply}
      .ocp-vs-scrim{z-index:4;pointer-events:none;background:linear-gradient(90deg,rgba(5,36,27,.84) 0%,rgba(5,36,27,.42) 47%,transparent 73%),linear-gradient(0deg,rgba(5,36,27,.84) 0%,transparent 52%)}
      .ocp-vs-status{position:absolute;z-index:12;top:34px;right:clamp(20px,3vw,46px);padding:7px 10px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(5,36,27,.42);color:rgba(255,255,255,.74);font:500 8px/1 var(--ocp-vs-mono);letter-spacing:.14em;text-transform:uppercase;transition:opacity .3s ease;backdrop-filter:blur(12px)}
      .ocp-vs-stage.is-ready .ocp-vs-status{opacity:0;pointer-events:none}
      .ocp-vs-copy{position:absolute;z-index:8;inset:0;pointer-events:none}
      .ocp-vs-card{position:absolute;left:clamp(26px,5vw,76px);bottom:clamp(34px,5vh,56px);visibility:hidden;width:min(860px,calc(100vw - 190px));opacity:0;pointer-events:none;will-change:opacity,transform}
      .ocp-vs-card.is-visible{visibility:visible}
      .ocp-vs-kicker,.ocp-vs-company,.ocp-vs-proof,.ocp-vs-outcome{font-family:var(--ocp-vs-mono);letter-spacing:.15em;text-transform:uppercase}
      .ocp-vs-kicker{margin:0 0 11px;color:#7CE7B0;font-size:clamp(10px,.78vw,12px);font-weight:400;transition:color .3s ease}
      .ocp-vs-company{display:inline-flex;margin:0 0 13px;padding:8px 11px;border:1px solid rgba(255,255,255,.26);border-radius:2px;background:rgba(5,36,27,.4);color:rgba(255,255,255,.92);font-size:10px;backdrop-filter:blur(10px)}
      .ocp-vs-card h2{max-width:820px;margin:0;color:#fff;font-family:var(--ocp-vs-display);font-size:clamp(60px,5.2vw,82px);font-weight:900;letter-spacing:-.028em;line-height:.86;text-transform:uppercase;text-wrap:balance}
      .ocp-vs-detail{max-width:780px;margin:18px 0 0;color:rgba(255,255,255,.98);font-size:clamp(17px,1.3vw,20px);line-height:1.43;text-wrap:pretty}
      .ocp-vs-detail strong{font-weight:700;color:#fff}
      .ocp-vs-enabler{max-width:800px;margin:14px 0 0;padding:13px 16px 14px;border-left:3px solid var(--ocp-vs-accent);background:rgba(5,36,27,.58);color:rgba(255,255,255,.96);font-size:clamp(15px,1.12vw,17px);line-height:1.46;backdrop-filter:blur(12px)}
      .ocp-vs-enabler strong{color:#fff;font-family:var(--ocp-vs-mono);font-size:.7em;letter-spacing:.1em;text-transform:uppercase}
      .ocp-vs-outcome{display:inline-flex;margin:11px 0 0;padding:8px 11px;border:1px solid rgba(132,247,199,.55);background:rgba(5,36,27,.58);color:#d9fff0;font-size:10px;font-weight:600;line-height:1.3;backdrop-filter:blur(10px)}
      .ocp-vs-card--hero{top:clamp(104px,15vh,168px);bottom:auto;max-width:860px;width:min(830px,calc(100vw - 190px))}
      .ocp-vs-card--hero h1{max-width:860px;margin:0;color:#fff;font-family:var(--ocp-vs-display);font-size:clamp(50px,8.4vw,140px);font-weight:900;letter-spacing:-.014em;line-height:.82;text-transform:uppercase;text-wrap:balance;text-shadow:0 2px 28px rgba(5,36,27,.34)}
      .ocp-vs-card--hero h1 span{color:#fff;font-style:normal;font-weight:900}
      /* Accent phrase: the mint-to-violet ramp the closing CTA cards run on
         their headline (--glow-grad-on under .card-dark). Declared after the
         white h1 span rule above so it wins the tie, and -webkit-text-fill-color
         beats the color property regardless. text-shadow has to go — a
         transparent fill lets it smear through the glyphs — so drop-shadow
         paints the clipped result. box-decoration-break restarts the ramp per
         line box. NOTE: this whole stylesheet is a JS template literal, so no
         backticks in these comments. */
      .ocp-vs-card h1 .ocp-vs-hl,.ocp-vs-card h2 .ocp-vs-hl{background:linear-gradient(92deg,#7CE7B0 0%,#B6A8F2 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;text-shadow:none;filter:drop-shadow(0 2px 18px rgba(5,36,27,.42));-webkit-box-decoration-break:clone;box-decoration-break:clone}
      .ocp-vs-card--hero .ocp-vs-detail{max-width:760px;margin-top:23px;font-size:clamp(17px,1.28vw,19px);line-height:1.48}
      .ocp-vs-hero-cta{display:flex;flex-wrap:wrap;gap:13px;margin-top:28px;pointer-events:auto}
      .ocp-vs-hero-cta a{display:inline-flex;align-items:center;gap:9px;height:56px;padding:0 30px;border-radius:999px;font-family:var(--ocp-vs-display);font-size:18px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;text-decoration:none;transition:transform .15s ease,box-shadow .2s ease,background .2s ease,border-color .2s ease}
      .ocp-vs-hero-cta--primary{background:var(--cta-violet-emerald,radial-gradient(120% 85% at 50% 0%,rgba(170,158,255,0.38),transparent 62%),linear-gradient(150deg,#7C6BF0 0%,#5647B4 78%));color:#F4F2FF;box-shadow:0 16px 40px -12px var(--cta-glow,rgba(124,107,240,.55))}
      .ocp-vs-hero-cta--primary:hover{transform:translateY(-2px);box-shadow:0 22px 50px -12px var(--cta-glow,rgba(124,107,240,.62))}
      .ocp-vs-hero-cta--secondary{background:rgba(5,36,27,.34);color:#fff;border:1px solid rgba(255,255,255,.36);backdrop-filter:blur(10px)}
      .ocp-vs-hero-cta--secondary:hover{border-color:#7CE7B0;background:rgba(5,36,27,.52)}
      .ocp-vs-proof{display:inline-flex;max-width:760px;margin:14px 0 0;padding:8px 10px;border:1px solid rgba(255,255,255,.2);background:rgba(5,36,27,.44);color:rgba(255,255,255,.9);font-size:9px;font-weight:600;letter-spacing:.08em;line-height:1.4;backdrop-filter:blur(10px)}
      .ocp-vs-platforms{display:flex;flex-wrap:nowrap;gap:6px;max-width:900px;margin-top:11px}
      .ocp-vs-platforms span{display:inline-flex;align-items:center;gap:7px;min-height:35px;padding:7px 9px;border:1px solid rgba(255,255,255,.2);background:rgba(5,36,27,.52);backdrop-filter:blur(10px)}
      .ocp-vs-platforms img{width:auto;height:19px;max-width:150px;object-fit:contain;display:block}.ocp-vs-platforms b{color:rgba(255,255,255,.9);font:500 8px/1 var(--ocp-vs-mono);letter-spacing:.08em;text-transform:uppercase}
      .ocp-vs-rail{position:absolute;z-index:9;top:50%;right:clamp(20px,2.4vw,40px);width:clamp(196px,15vw,232px);display:flex;flex-direction:column;padding:18px;border:1px solid rgba(255,255,255,.12);border-radius:24px;background:rgba(6,40,30,.72);transform:translateY(-50%);transition:opacity .5s ease;backdrop-filter:blur(16px);box-shadow:0 30px 70px -30px rgba(0,0,0,.55)}
      /* Hidden on the OCP/hero chapter so it does not show on initial load;
         fades in once the walk reaches chapter 1 (Idea) and beyond. */
      .ocp-vs-stage[data-scene="0"] .ocp-vs-rail{opacity:0;pointer-events:none}
      .ocp-vs-rail-eyebrow{margin:2px 0 12px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.5);font:600 9px/1 var(--ocp-vs-mono);letter-spacing:.24em;text-transform:uppercase;text-align:center}
      .ocp-vs-rail-list{display:flex;flex-direction:column}
      /* color/background use !important to beat the host site's unlayered
         button reset (background:transparent;color:inherit) — layered styles
         (this whole sheet is in @layer) always lose to unlayered rules. */
      .ocp-vs-rail-item{display:grid;grid-template-columns:20px 1fr;gap:13px;align-items:center;min-height:56px;padding:0 18px 0 28px!important;border:0;border-radius:16px;background:transparent;color:rgba(255,255,255,.82)!important;text-align:left;cursor:pointer;transition:background .16s ease,color .16s ease}
      .ocp-vs-rail-num{color:rgba(255,255,255,.42);font:600 10px/1 var(--ocp-vs-mono);letter-spacing:.1em}
      .ocp-vs-rail-label{font:600 13px/1 var(--ocp-vs-mono);letter-spacing:.2em;text-transform:uppercase}
      .ocp-vs-rail-item.is-active{background:#C6F7DC!important;color:#07382a!important}
      .ocp-vs-rail-item.is-active .ocp-vs-rail-num{color:rgba(7,56,42,.55)}
      .ocp-vs-rail-item.is-active .ocp-vs-rail-label{font-family:var(--ocp-vs-display);font-size:30px;font-weight:800;letter-spacing:0;line-height:1}
      .ocp-vs-rail-foot{margin-top:14px;padding-top:16px;border-top:1px solid rgba(255,255,255,.12)}
      .ocp-vs-rail-cta{display:block;padding:15px 18px;border-radius:999px;background:var(--cta-violet-emerald,radial-gradient(120% 85% at 50% 0%,rgba(170,158,255,0.38),transparent 62%),linear-gradient(150deg,#7C6BF0 0%,#5647B4 78%));color:#F4F2FF;font-family:var(--ocp-vs-display);font-size:18px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;text-align:center;text-decoration:none;box-shadow:0 12px 30px -14px var(--cta-glow,rgba(124,107,240,.5));transition:transform .15s ease,box-shadow .2s ease}
      .ocp-vs-rail-cta:hover{transform:translateY(-1px);box-shadow:0 16px 36px -12px var(--cta-glow,rgba(124,107,240,.5))}
      .ocp-vs-progress{position:absolute;z-index:10;right:0;bottom:0;left:0;height:3px;background:rgba(255,255,255,.13)}
      .ocp-vs-progress span{display:block;width:100%;height:100%;background:var(--ocp-vs-accent);transform:scaleX(0);transform-origin:left center;transition:background-color .3s ease;will-change:transform}
      .ocp-vs-cue{position:absolute;z-index:9;right:32px;bottom:30px;display:flex;align-items:center;gap:12px;color:rgba(255,255,255,.64);font:500 8px/1 var(--ocp-vs-mono);letter-spacing:.13em;text-transform:uppercase;transition:opacity .22s ease}
      .ocp-vs-stage.has-started .ocp-vs-cue{opacity:0}.ocp-vs-cue i{display:block;width:30px;height:1px;overflow:hidden;background:rgba(255,255,255,.28)}.ocp-vs-cue i::after{content:"";display:block;width:12px;height:1px;background:#fff;animation:ocp-vs-cue 1.6s ease-in-out infinite}
      @keyframes ocp-vs-cue{0%,100%{transform:translateX(-12px)}50%{transform:translateX(30px)}}
      @media(max-width:880px){
        .ocp-vs-stage{min-height:0}.ocp-vs-video,.ocp-vs-still{object-position:62% 50%}.ocp-vs-stage[data-scene="0"] .ocp-vs-video,.ocp-vs-stage[data-scene="0"] .ocp-vs-still{object-position:53% 50%}
        .ocp-vs-status{display:none}.ocp-vs-card{right:20px;bottom:92px;left:20px;width:auto}
        .ocp-vs-card h2{max-width:670px;font-size:clamp(46px,12.2vw,68px);line-height:.87}.ocp-vs-detail{max-width:96%;margin-top:13px;font-size:clamp(14px,3.4vw,16px);line-height:1.38}
        .ocp-vs-enabler{max-width:96%;margin-top:10px;padding:10px 12px;font-size:clamp(12px,3vw,14px);line-height:1.38}.ocp-vs-outcome{margin-top:9px;padding:6px 8px;font-size:8px}
        .ocp-vs-card--hero{top:41px;right:20px;bottom:auto;left:20px;width:auto}.ocp-vs-card--hero h1{font-size:clamp(58px,15.6vw,88px);line-height:.84}
        .ocp-vs-card--hero .ocp-vs-detail{max-width:640px;margin-top:17px;font-size:clamp(14px,3.4vw,16px);line-height:1.4}.ocp-vs-proof{max-width:640px;margin-top:10px;font-size:7px}
        .ocp-vs-hero-cta{gap:10px;margin-top:20px}.ocp-vs-hero-cta a{height:48px;padding:0 22px;font-size:15px}
        .ocp-vs-platforms{max-width:96%}.ocp-vs-platforms span{min-height:30px;padding:5px 7px}.ocp-vs-platforms img{width:auto;height:19px;max-width:140px}.ocp-vs-platforms b{font-size:7px}
        .ocp-vs-rail{top:auto;right:18px;bottom:47px;left:18px;width:auto;flex-direction:column;padding:0;border:0;border-radius:0;background:transparent;transform:none;backdrop-filter:none;box-shadow:none}
        .ocp-vs-rail-eyebrow,.ocp-vs-rail-foot{display:none}
        .ocp-vs-rail-list{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
        .ocp-vs-rail-item{display:block;min-height:0;overflow:hidden;padding:8px 0;border-top:1px solid rgba(255,255,255,.22);border-radius:0;white-space:nowrap;color:rgba(255,255,255,.7)}
        .ocp-vs-rail-num{display:block;margin-bottom:4px}
        .ocp-vs-rail-label{font-size:7px;letter-spacing:.1em}
        .ocp-vs-rail-item.is-active{background:transparent;color:#fff;border-top-color:var(--ocp-vs-accent)}
        .ocp-vs-rail-item.is-active .ocp-vs-rail-num{color:var(--ocp-vs-accent)}
        .ocp-vs-rail-item.is-active .ocp-vs-rail-label{font-family:var(--ocp-vs-mono);font-size:7px;font-weight:600;letter-spacing:.1em}
        .ocp-vs-cue{right:18px;bottom:22px}
      }
      @media(max-width:520px){
        .ocp-vs-card{bottom:104px}.ocp-vs-card--hero{bottom:auto}.ocp-vs-kicker,.ocp-vs-company{font-size:9.5px;line-height:1.4}.ocp-vs-card h2{font-size:clamp(42px,12vw,58px)}
        .ocp-vs-detail{font-size:14px;line-height:1.42}.ocp-vs-enabler{padding:10px 11px;font-size:12.5px;line-height:1.42}.ocp-vs-outcome{font-size:9px}
        .ocp-vs-platforms{gap:5px}.ocp-vs-platforms span{min-width:0;min-height:28px;padding:4px 6px}.ocp-vs-platforms b{font-size:6.25px}.ocp-vs-platforms img{width:auto;height:17px;max-width:125px}
        .ocp-vs-card--hero h1{font-size:clamp(54px,15vw,72px)}
      }
      @media(max-height:760px) and (min-width:761px){
        .ocp-vs-card{bottom:28px}.ocp-vs-card--hero{top:48px;bottom:auto}.ocp-vs-card h2{font-size:clamp(55px,5vw,74px)}.ocp-vs-card--hero h1{font-size:clamp(72px,7vw,94px)}
        .ocp-vs-detail{margin-top:13px;font-size:16px}.ocp-vs-enabler{margin-top:10px;padding:10px 13px;font-size:14px}.ocp-vs-outcome{margin-top:8px}.ocp-vs-platforms{margin-top:8px}
      }
      @media(prefers-reduced-motion:reduce){.ocp-vs-still,.ocp-vs-card{transition:none}.ocp-vs-cue i::after{animation:none}}
    }`;
        document.head.appendChild(style);
    }

    global.OCP_VIDEO_SCROLLER_NARRATIVE = DEFAULT_NARRATIVE;
    global.mountOcpVideoScroller = mountOcpVideoScroller;
    if (typeof module !== "undefined" && module.exports) {
        module.exports = {
            mountOcpVideoScroller,
            OCP_VIDEO_SCROLLER_NARRATIVE: DEFAULT_NARRATIVE
        };
    }
})(typeof window !== "undefined" ? window : globalThis);