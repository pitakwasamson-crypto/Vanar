/* ==========================================================================
   Vanar OCP — mobile image header

   Five full-viewport portrait stills, swipeable, with a keyframe rail. No
   <video>, no MP4 — this is the phone counterpart to ocp-video-scroller.js,
   which stays desktop-only.

   Adapted from the standalone bundle with three departures:

   1. Mobile guard up front, mirroring the inverse guard in index.astro. On
      desktop this file parses and returns, so no image is ever fetched.
   2. The bundle fetched chapters.json + narrative.json. Both now arrive as
      frozen constants from ./mobile-chapters-data.js, which must load first —
      two blocking round trips removed from in front of mobile LCP.
   3. Slide copy tracks the live desktop narrative, not the bundle's, so both
      headers tell one story. Keep the two in step when either changes.

   Asset URLs resolve against this file's own location, so the nine platform
   SVGs under assets/logos/ are the ones the desktop header already ships.
   ========================================================================== */

(function() {
    "use strict";

    // Load-time decision, same as the desktop scroller's (min-width: 721px)
    // mount guard. A resize across the breakpoint needs a reload either way.
    if (!window.matchMedia("(max-width: 720px)").matches) return;

    const data = window.__VANAR_MOBILE_CHAPTERS;
    if (!data) return;
    const CHAPTERS = data.chapters;
    const NARRATIVE = data.narrative;

    const track = document.querySelector("#mobile-header-track");
    const keyframeRail = document.querySelector(".mc-keyframes");
    const previousButton = document.querySelector(".mc-arrow--previous");
    const nextButton = document.querySelector(".mc-arrow--next");
    const status = document.querySelector(".mc-status");
    if (!track || !keyframeRail || !previousButton || !nextButton || !status) return;

    const packageRoot = new URL("./", new URL(document.currentScript.src, window.location.href));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const states = [];
    let activeIndex = 0;
    let scrollFrame = 0;

    build();

    function build() {
        const sceneById = new Map(NARRATIVE.map((scene) => [scene.id, scene]));
        // index.html seeds the five slides so the header paints complete on the
        // first frame instead of showing raw headings until this file runs. Adopt
        // them when they are all there: rebuilding would discard identical DOM,
        // re-decode five images and reset the track to slide 0 under anyone who
        // already swiped. Falling back to building keeps this file usable on a page
        // that seeds nothing.
        const seeded = Array.from(track.querySelectorAll("[data-mc-static-slide]"));
        const adopt = seeded.length === CHAPTERS.length &&
            seeded.every((node, i) => node.dataset.mcStaticSlide === CHAPTERS[i].id);
        if (!adopt) track.replaceChildren();
        keyframeRail.replaceChildren();

        CHAPTERS.forEach((chapter, chapterIndex) => {
            const scene = sceneById.get(chapter.id);
            const slide = adopt ? seeded[chapterIndex] : document.createElement("article");
            slide.id = `mobile-header-slide-${chapter.id}`;
            // Owned here, not by the seeded markup: role=tabpanel only means anything
            // once the keyframe tablist below exists, which it does not before JS.
            slide.setAttribute("role", "tabpanel");
            slide.setAttribute("aria-roledescription", "slide");

            if (adopt) {
                // The seeded images ship loading="lazy" so that on desktop, where
                // .mc-mobile-entry is display:none, they are never fetched — an eager
                // <img> in a hidden subtree still downloads, which would have put two
                // phone-sized headers on every desktop load. This file only runs below
                // 720px, so restoring the prefetch here cannot leak upward.
                const hero = slide.querySelector(".mc-hero-image");
                if (hero) {
                    hero.loading = chapterIndex < 2 ? "eager" : "lazy";
                    hero.fetchPriority = chapterIndex === 0 ? "high" : "auto";
                }
            } else {
                slide.className = "mc-slide";
                slide.style.setProperty("--chapter-accent", chapter.accent);

                const hero = document.createElement("img");
                hero.className = "mc-hero-image";
                hero.src = asset(`assets/headers/${chapter.image}-hero.webp`);
                hero.alt = chapter.focus;
                hero.decoding = "async";
                hero.loading = chapterIndex < 2 ? "eager" : "lazy";
                hero.fetchPriority = chapterIndex === 0 ? "high" : "auto";

                const shade = document.createElement("div");
                shade.className = "mc-image-shade";
                shade.setAttribute("aria-hidden", "true");

                const mediaNumber = document.createElement("span");
                mediaNumber.className = "mc-media-number";
                mediaNumber.textContent = `${scene.railNumber} · ${scene.railLabel}`;

                const heading = chapterIndex === 0 ? "h1" : "h2";
                const copy = document.createElement("div");
                copy.className = "mc-copy";
                copy.innerHTML = `
          <${heading}>
            <span class="mc-line">${titleMarkup(scene.title, scene.accentPhrase)}</span>
            <span class="mc-line">${titleMarkup(scene.titleLineTwo, scene.accentPhrase)}</span>
          </${heading}>
          ${scene.detailLead ? `<p class="mc-lead">${escapeHtml(scene.detailLead)}</p>` : ""}
          <p class="mc-detail">${escapeHtml(scene.detail)}</p>
          ${platformMarkup(scene.platforms)}
        `;

                slide.append(hero, shade, mediaNumber, copy);
                track.appendChild(slide);
            }

            const keyframeButton = document.createElement("button");
            keyframeButton.className = "mc-keyframe";
            keyframeButton.type = "button";
            keyframeButton.id = `mobile-header-tab-${chapter.id}`;
            keyframeButton.setAttribute("role", "tab");
            keyframeButton.setAttribute("aria-controls", slide.id);
            // Lead with the visible "<num> <label>" text (the <strong> below) so the
            // accessible name CONTAINS it — WCAG 2.5.3 Label in Name. Without the
            // number prefix axe flags label-content-name-mismatch on every tab.
            keyframeButton.setAttribute("aria-label", `${scene.railNumber} ${scene.railLabel}: ${scene.title.replace(/\n/g, " ")} ${scene.titleLineTwo}`);
            keyframeButton.style.setProperty("--chapter-accent", chapter.accent);
            keyframeButton.innerHTML = `
        <span class="mc-keyframe-image"><img src="${escapeHtml(asset(`assets/headers/${chapter.image}-keyframe.webp`))}" alt="" loading="eager" decoding="async"></span>
        <strong>${escapeHtml(scene.railNumber)} ${escapeHtml(scene.railLabel)}</strong>
      `;
            keyframeButton.addEventListener("click", () => setActive(chapterIndex, {
                scroll: true,
                announce: true
            }));
            keyframeRail.appendChild(keyframeButton);
            slide.setAttribute("aria-labelledby", keyframeButton.id);

            states.push({
                scene,
                slide,
                keyframeButton
            });
        });

        track.addEventListener("scroll", requestTrackUpdate, {
            passive: true
        });
        track.addEventListener("keydown", handleTrackKeydown);
        previousButton.addEventListener("click", () => setActive(activeIndex - 1, {
            scroll: true,
            announce: true
        }));
        nextButton.addEventListener("click", () => setActive(activeIndex + 1, {
            scroll: true,
            announce: true
        }));
        window.addEventListener("resize", handleResize, {
            passive: true
        });
        window.addEventListener("orientationchange", handleResize, {
            passive: true
        });

        // Start from whatever slide is on screen, not slide 0: the seeded track is a
        // working CSS scroll-snap carousel, so a visitor can swipe before this runs.
        const startIndex = track.clientWidth > 0 ?
            clamp(Math.round(track.scrollLeft / track.clientWidth), 0, states.length - 1) :
            0;
        setActive(startIndex, {
            scroll: false,
            announce: false
        });
        status.textContent = "Full-screen mobile image headers ready";
    }

    function platformMarkup(platforms) {
        if (!platforms || !platforms.length) return "";
        return `<div class="mc-platforms" aria-label="Compatible build platforms">${platforms
      .map(
        ([file, label]) =>
          `<img src="${escapeHtml(asset(`assets/logos/${file}`))}" alt="${escapeHtml(label)}" title="${escapeHtml(label)}">`,
      )
      .join("")}</div>`;
    }

    function asset(relativePath) {
        return new URL(relativePath, packageRoot).href;
    }

    function requestTrackUpdate() {
        if (scrollFrame) return;
        scrollFrame = requestAnimationFrame(updateFromTrack);
    }

    function updateFromTrack() {
        scrollFrame = 0;
        if (!states.length || track.clientWidth < 1) return;
        const nextIndex = clamp(Math.round(track.scrollLeft / track.clientWidth), 0, states.length - 1);
        if (nextIndex !== activeIndex) setActive(nextIndex, {
            scroll: false,
            announce: true
        });
    }

    function setActive(nextIndex, options) {
        if (!states.length) return;
        const settings = options || {};
        activeIndex = clamp(nextIndex, 0, states.length - 1);

        states.forEach((state, stateIndex) => {
            const active = stateIndex === activeIndex;
            state.slide.classList.toggle("is-active", active);
            state.slide.setAttribute("aria-hidden", active ? "false" : "true");
            state.slide.inert = !active;
            state.keyframeButton.setAttribute("aria-selected", active ? "true" : "false");
            state.keyframeButton.tabIndex = active ? 0 : -1;
        });

        previousButton.disabled = activeIndex === 0;
        nextButton.disabled = activeIndex === states.length - 1;

        if (settings.scroll) {
            track.scrollTo({
                left: states[activeIndex].slide.offsetLeft,
                behavior: reducedMotion ? "auto" : "smooth",
            });
        }

        keepActiveKeyframeVisible(states[activeIndex].keyframeButton);
        if (settings.announce) status.textContent = `${states[activeIndex].scene.railLabel} image header`;
    }

    function keepActiveKeyframeVisible(button) {
        const targetLeft = button.offsetLeft - (keyframeRail.clientWidth - button.offsetWidth) / 2;
        keyframeRail.scrollTo({
            left: Math.max(0, targetLeft),
            behavior: reducedMotion ? "auto" : "smooth"
        });
    }

    function handleTrackKeydown(event) {
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            setActive(activeIndex - 1, {
                scroll: true,
                announce: true
            });
        }
        if (event.key === "ArrowRight") {
            event.preventDefault();
            setActive(activeIndex + 1, {
                scroll: true,
                announce: true
            });
        }
    }

    function handleResize() {
        cancelAnimationFrame(scrollFrame);
        scrollFrame = requestAnimationFrame(() => {
            scrollFrame = 0;
            track.scrollTo({
                left: states[activeIndex] ? states[activeIndex].slide.offsetLeft : 0,
                behavior: "auto"
            });
        });
    }

    function clamp(value, minimum, maximum) {
        return Math.min(maximum, Math.max(minimum, value));
    }

    /* Scene titles carry hard line breaks (the desktop header renders them the
       same way), so escape first and only then promote \n to <br>. The accent
       phrase is matched against the already-escaped string, which is why the
       phrase itself is escaped too rather than compared raw. */
    function titleMarkup(value, accentPhrase) {
        const escaped = escapeHtml(value).replaceAll("\n", "<br>");
        if (!accentPhrase) return escaped;
        const needle = escapeHtml(accentPhrase);
        const at = escaped.toLowerCase().indexOf(needle.toLowerCase());
        if (at < 0) return escaped;
        const hit = escaped.slice(at, at + needle.length);
        return `${escaped.slice(0, at)}<span class="mc-hl">${hit}</span>${escaped.slice(at + needle.length)}`;
    }

    function escapeHtml(value) {
        return String(value ? ? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
})();