// Static behaviours for the OnVanar site (replaces the DC runtime).
(function() {
    // 1) apply [style-hover] on hover/focus
    document.querySelectorAll("[style-hover]").forEach(function(el) {
        var base = el.getAttribute("style") || "";
        var hov = el.getAttribute("style-hover");

        function on() {
            el.setAttribute("style", base + ";" + hov);
        }

        function off() {
            el.setAttribute("style", base);
        }
        el.addEventListener("mouseenter", on);
        el.addEventListener("mouseleave", off);
        el.addEventListener("focus", on);
        el.addEventListener("blur", off);
    });

    // 2) tab groups: [data-tabs] containing .ot-tab[data-tab=i] and .ot-panel[data-panel=i]
    var otGroupSeq = 0;
    document.querySelectorAll("[data-tabs]").forEach(function(group) {
        var tabs = Array.prototype.slice.call(group.querySelectorAll(".ot-tab"));
        var panels = Array.prototype.slice.call(group.querySelectorAll(".ot-panel"));
        var timer = null;
        var delay = parseInt(group.getAttribute("data-autorotate"), 10);
        if (isNaN(delay)) delay = 10000;
        otGroupSeq++;

        // ARIA wiring, applied here rather than in the page markup. aria-selected is
        // only valid on role=tab (and option/row/gridcell/treeitem); on a bare
        // <button> it is dropped from the accessibility tree, so a screen reader —
        // or an agent reading the tree to decide what to click — cannot tell which
        // tab is active. select() below already writes aria-selected on every group,
        // and only some strips shipped the matching roles: a live audit found 15 of
        // 19 aria-selected elements with no role=tab, all of them .ot-tab. Doing it
        // where the state is written keeps the role and the state travelling
        // together across all five pages, including groups added later.
        var list = tabs.length ? tabs[0].parentElement : null;
        var listOwnsTabsOnly = !!list && list.children.length === tabs.length &&
            tabs.every(function(t) {
                return t.parentElement === list;
            });
        if (listOwnsTabsOnly && !list.getAttribute("role")) list.setAttribute("role", "tablist");
        tabs.forEach(function(t, i) {
            if (!t.id) t.id = "ot-tab-" + otGroupSeq + "-" + i;
            var panel = panels[i];
            if (!panel) return;
            panel.setAttribute("role", "tabpanel");
            if (!panel.id) panel.id = "ot-panel-" + otGroupSeq + "-" + i;
            t.setAttribute("aria-controls", panel.id);
            panel.setAttribute("aria-labelledby", t.id);
        });

        function select(i) {
            tabs.forEach(function(t, k) {
                // Reasserted every time, next to the state it qualifies, so the two
                // cannot drift apart.
                t.setAttribute("role", "tab");
                t.setAttribute("aria-selected", k === i ? "true" : "false");
            });
            panels.forEach(function(p, k) {
                p.classList.toggle("is-active", k === i);
            });
        }

        function current() {
            for (var k = 0; k < tabs.length; k++) {
                if (tabs[k].getAttribute("aria-selected") === "true") return k;
            }
            return 0;
        }

        function start() {
            if (group.hasAttribute("data-autorotate")) timer = setInterval(function() {
                select((current() + 1) % tabs.length);
            }, delay);
        }

        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }
        tabs.forEach(function(t, i) {
            t.addEventListener("click", function() {
                stop();
                select(i);
            });
            if (!group.hasAttribute("data-no-hover-stop")) t.addEventListener("mouseenter", stop);
        });
        select(0);
        start();
    });

    // 3) use-case carousel: #uc-track (horizontal scroll-snap) + #uc-dots
    document.querySelectorAll("#uc-track").forEach(function(track) {
        var inner = track.firstElementChild;
        var cards = inner ? Array.prototype.slice.call(inner.children) : [];
        var dotsWrap = document.getElementById("uc-dots");
        var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.querySelectorAll("button")) : [];
        if (!cards.length) return;

        function base() {
            return cards[0].offsetLeft;
        }

        function setActive(i) {
            dots.forEach(function(d, k) {
                var on = k === i;
                // the button is the 44px tap target; the thin bar inside it is the visual
                var bar = d.firstElementChild || d;
                bar.style.width = on ? "34px" : "22px";
                bar.style.background = on ? "var(--accent-deep)" : "rgba(11,19,14,0.16)";
            });
        }

        function nearest() {
            var x = track.scrollLeft,
                best = 0,
                bd = Infinity;
            cards.forEach(function(c, k) {
                var d = Math.abs((c.offsetLeft - base()) - x);
                if (d < bd) {
                    bd = d;
                    best = k;
                }
            });
            return best;
        }
        dots.forEach(function(d, i) {
            d.addEventListener("click", function() {
                var left = cards[i].offsetLeft - base();
                var from = track.scrollLeft;
                track.scrollTo({
                    left: left,
                    behavior: "smooth"
                });
                setActive(i);
                // Browsers with smooth scrolling switched off (Windows "animation
                // effects" disabled, some reduced-motion setups) ignore the call above
                // and leave the carousel where it was. If nothing has moved by the time
                // an animation would be under way, jump straight to the card.
                setTimeout(function() {
                    if (track.scrollLeft === from && from !== left) track.scrollLeft = left;
                }, 120);
            });
        });
        var raf = null;
        track.addEventListener("scroll", function() {
            if (raf) return;
            raf = requestAnimationFrame(function() {
                raf = null;
                setActive(nearest());
            });
        });
        dragScroll(track);
        setActive(0);
    });

    // 3b) drag-to-scroll for any horizontal overflow region.
    // Touch is left to the browser's native panning; this covers mouse/pen only.
    // scroll-snap must be suspended mid-drag or every step snaps straight back.
    function dragScroll(el) {
        var down = false,
            moved = false,
            sx = 0,
            sl = 0,
            snap = "";
        el.addEventListener("pointerdown", function(e) {
            if (e.pointerType === "touch") return;
            down = true;
            moved = false;
            sx = e.clientX;
            sl = el.scrollLeft;
            snap = el.style.scrollSnapType;
            el.style.scrollSnapType = "none";
            el.style.cursor = "grabbing";
        });
        el.addEventListener("pointermove", function(e) {
            if (!down) return;
            var dx = e.clientX - sx;
            if (Math.abs(dx) > 3) moved = true;
            el.scrollLeft = sl - dx;
            e.preventDefault();
        });

        function release() {
            if (!down) return;
            down = false;
            el.style.scrollSnapType = snap;
            el.style.cursor = "";
        }
        window.addEventListener("pointerup", release);
        window.addEventListener("pointercancel", release);
        // a drag that ended on a link must not also follow it
        el.addEventListener("click", function(e) {
            if (moved) {
                e.preventDefault();
                e.stopPropagation();
                moved = false;
            }
        }, true);
    }

    document.querySelectorAll("[data-drag-scroll]").forEach(dragScroll);

    // 4) hero pullquote cycler: [data-hero-quote] with .hero-quote-slide + .hero-quote-dot
    document.querySelectorAll("[data-hero-quote]").forEach(function(root) {
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-quote-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-quote-dot"));
        if (slides.length < 2) return;
        var idx = 0,
            timer = null,
            halted = false;
        var INTERVAL = 4000;
        var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        function show(n) {
            idx = (n + slides.length) % slides.length;
            slides.forEach(function(s, i) {
                var on = i === idx;
                s.classList.toggle("is-active", on);
                s.style.opacity = on ? "1" : "0";
                s.style.pointerEvents = on ? "auto" : "none";
            });
            dots.forEach(function(d, i) {
                var on = i === idx;
                d.style.width = on ? "34px" : "22px";
                d.style.background = on ? "var(--accent-deep)" : "rgba(11,19,14,0.16)";
            });
        }

        function start() {
            if (reduce || halted) return;
            stop();
            timer = setInterval(function() {
                show(idx + 1);
            }, INTERVAL);
        }

        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        function halt() {
            halted = true;
            stop();
        }
        dots.forEach(function(d) {
            d.addEventListener("click", function() {
                halt();
                show(parseInt(d.getAttribute("data-idx"), 10) || 0);
            });
        });
        // hovering or clicking the quote stops auto-rotate for good, so the reader can finish
        root.addEventListener("mouseenter", halt);
        root.addEventListener("click", halt);
        document.addEventListener("visibilitychange", function() {
            if (document.hidden) stop();
            else start();
        });
        show(0);
        start();
    });

    // 5) demo video poster plate: click to play, restore plate when ended
    document.querySelectorAll("[data-demo]").forEach(function(demo) {
        var btn = demo.querySelector("[data-demo-play]");
        var video = demo.querySelector("[data-demo-video]");
        if (!btn || !video) return;
        btn.addEventListener("click", function() {
            demo.classList.add("is-playing");
            try {
                var p = video.play();
                if (p && typeof p.catch === "function") {
                    p.catch(function() {
                        video.muted = true;
                        video.play().catch(function() {});
                    });
                }
            } catch (e) { /* noop */ }
            try {
                video.focus({
                    preventScroll: true
                });
            } catch (e) {}
        });
        video.addEventListener("ended", function() {
            demo.classList.remove("is-playing");
            try {
                video.currentTime = 0;
            } catch (e) {}
        });
    });

    // 6) nav dropdown menus: .nav-dd with .nav-dd-trigger + .nav-dd-panel[role=menu]
    document.querySelectorAll(".nav-dd").forEach(function(dd) {
        var trigger = dd.querySelector(".nav-dd-trigger");
        var panel = dd.querySelector(".nav-dd-panel");
        if (!trigger || !panel) return;
        // only enabled items participate in keyboard roving focus
        var items = Array.prototype.slice.call(panel.querySelectorAll('[role="menuitem"]'))
            .filter(function(it) {
                return it.getAttribute("aria-disabled") !== "true";
            });
        var closeTimer = null;

        function open() {
            clearTimeout(closeTimer);
            dd.classList.add("is-open");
            trigger.setAttribute("aria-expanded", "true");
        }

        function close() {
            dd.classList.remove("is-open");
            trigger.setAttribute("aria-expanded", "false");
        }

        function focusItem(i) {
            if (!items.length) return;
            items[(i + items.length) % items.length].focus();
        }

        // pointer: open on hover; a short delay on leave lets the cursor cross to the panel
        dd.addEventListener("mouseenter", open);
        dd.addEventListener("mouseleave", function() {
            closeTimer = setTimeout(close, 120);
        });

        trigger.addEventListener("click", function(e) {
            e.preventDefault();
            dd.classList.contains("is-open") ? close() : open();
        });
        trigger.addEventListener("keydown", function(e) {
            if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open();
                focusItem(0);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                open();
                focusItem(-1);
            } else if (e.key === "Escape") {
                close();
            }
        });
        panel.addEventListener("keydown", function(e) {
            var idx = items.indexOf(document.activeElement);
            if (e.key === "ArrowDown") {
                e.preventDefault();
                focusItem(idx + 1);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                focusItem(idx - 1);
            } else if (e.key === "Home") {
                e.preventDefault();
                focusItem(0);
            } else if (e.key === "End") {
                e.preventDefault();
                focusItem(-1);
            } else if (e.key === "Escape") {
                e.preventDefault();
                close();
                trigger.focus();
            }
        });

        // close when focus leaves the menu entirely (e.g. Tab out) or on outside click
        dd.addEventListener("focusout", function(e) {
            if (!dd.contains(e.relatedTarget)) close();
        });
        document.addEventListener("click", function(e) {
            if (!dd.contains(e.target)) close();
        });
    });

    // prompt suggestion chips: click fills the input in the same panel
    document.querySelectorAll("[data-fill]").forEach(function(chip) {
        chip.addEventListener("click", function() {
            var scope = chip.closest(".ot-panel") || document;
            // the panel's first input is the hidden `door` field -- target the visible one
            var input = scope.querySelector(".run-input textarea, .run-input input");
            if (input) {
                var box = chip.closest(".run-chips");
                var val = chip.getAttribute("data-fill");
                if (box && box.hasAttribute("data-append") && input.value.trim()) {
                    input.value = input.value.trim() + " " + val;
                } else {
                    input.value = val;
                }
                input.focus();
            }
        });
    });

    // typing placeholder: optional prefix + rotating chip phrases with a blinking cursor
    document.querySelectorAll("input[data-typing], textarea[data-typing]").forEach(function(input) {
        var panel = input.closest(".ot-panel");
        var chips = panel ? Array.prototype.slice.call(panel.querySelectorAll(".run-chip")).map(function(c) {
            return c.getAttribute("data-fill");
        }).filter(Boolean) : [];
        if (!chips.length) return;
        var prefix = input.getAttribute("data-typing") || "";
        var pi = 0,
            ci = 0,
            deleting = false,
            typed = "",
            cursorOn = true;
        var blinkTimer = null,
            tickTimer = null;
        // a phrase reads as a continuation of the prefix, so drop its leading capital
        function phrase() {
            var t = chips[pi];
            return prefix ? t.charAt(0).toLowerCase() + t.slice(1) : t;
        }

        function render() {
            input.setAttribute("placeholder", prefix + typed + (cursorOn ? "|" : ""));
        }

        function tick() {
            var ph = phrase();
            if (!deleting) {
                ci++;
                typed = ph.slice(0, ci);
                cursorOn = true;
                render();
                if (ci >= ph.length) {
                    deleting = true;
                    tickTimer = setTimeout(tick, 1800);
                } else {
                    tickTimer = setTimeout(tick, 55);
                }
            } else {
                if (ci > 0) {
                    ci--;
                    typed = ph.slice(0, ci);
                    cursorOn = true;
                    render();
                    tickTimer = setTimeout(tick, 28);
                } else {
                    deleting = false;
                    pi = (pi + 1) % chips.length;
                    tickTimer = setTimeout(tick, 350);
                }
            }
        }
        // Only the active panel animates. Every tick calls setAttribute("placeholder"),
        // so leaving all four panels typing meant three invisible inputs churning paint
        // work forever. tick() always reschedules, so a non-null tickTimer == running.
        function start() {
            if (tickTimer !== null) return;
            blinkTimer = setInterval(function() {
                cursorOn = !cursorOn;
                render();
            }, 530);
            tickTimer = setTimeout(tick, 600);
        }

        function stop() {
            if (blinkTimer !== null) {
                clearInterval(blinkTimer);
                blinkTimer = null;
            }
            if (tickTimer !== null) {
                clearTimeout(tickTimer);
                tickTimer = null;
            }
            cursorOn = false;
            render(); // park without a stranded blinking caret
        }

        function sync() {
            if (!panel || panel.classList.contains("is-active")) start();
            else stop();
        }
        render();
        if (panel) new MutationObserver(sync).observe(panel, {
            attributes: true,
            attributeFilter: ["class"]
        });
        sync();
    });
})();