import { H as Hls } from "./hls-vendor-dru42stk.js";

const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");

function updateNavState() {
    if (!nav) {
        return;
    }
    nav.classList.toggle("is-scrolled", window.scrollY > 30);
}

updateNavState();
window.addEventListener("scroll", updateNavState, { passive: true });

if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
        nav.classList.toggle("is-open");
        document.body.classList.toggle("nav-open", nav.classList.contains("is-open"));
    });
}

document.querySelectorAll(".mobile-links a, .nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
        if (nav) {
            nav.classList.remove("is-open");
        }
        document.body.classList.remove("nav-open");
    });
});

document.querySelectorAll("[data-hero]").forEach((hero) => {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let active = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
    let timer = null;

    function show(index) {
        if (!slides.length) {
            return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === active);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === active);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(() => show(active + 1), 5200);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach((dot, dotIndex) => {
        dot.addEventListener("click", () => {
            show(dotIndex);
            start();
        });
    });

    if (prev) {
        prev.addEventListener("click", () => {
            show(active - 1);
            start();
        });
    }

    if (next) {
        next.addEventListener("click", () => {
            show(active + 1);
            start();
        });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(active);
    start();
});

function loadVideo(video) {
    const source = video.dataset.src;
    if (!source) {
        return Promise.resolve();
    }

    if (video.dataset.loaded === "true") {
        return video.play();
    }

    video.dataset.loaded = "true";

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsInstance = hls;
        return new Promise((resolve) => {
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                resolve(video.play());
            });
            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (data && data.fatal) {
                    hls.destroy();
                    video.src = source;
                    resolve(video.play());
                }
            });
        });
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return video.play();
    }

    video.src = source;
    return video.play();
}

document.querySelectorAll("[data-player]").forEach((player) => {
    const video = player.querySelector("[data-video]");
    const button = player.querySelector("[data-play-button]");

    if (!video) {
        return;
    }

    const play = () => {
        player.classList.add("is-playing");
        loadVideo(video).catch(() => {
            player.classList.remove("is-playing");
        });
    };

    if (button) {
        button.addEventListener("click", play);
    }

    video.addEventListener("click", () => {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener("play", () => {
        player.classList.add("is-playing");
    });
});

const searchPage = document.querySelector("[data-search-page]");

if (searchPage) {
    const input = searchPage.querySelector("[data-search-input]");
    const title = searchPage.querySelector("[data-search-title]");
    const count = searchPage.querySelector("[data-search-count]");
    const cards = Array.from(searchPage.querySelectorAll(".movie-card"));
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function filterCards(query) {
        const keyword = normalize(query);
        let visible = 0;
        cards.forEach((card) => {
            const haystack = normalize([
                card.dataset.title,
                card.dataset.tags,
                card.dataset.year,
                card.dataset.region,
                card.textContent
            ].join(" "));
            const matched = !keyword || haystack.includes(keyword);
            card.classList.toggle("is-hidden-by-search", !matched);
            if (matched) {
                visible += 1;
            }
        });
        if (title) {
            title.textContent = keyword ? `“${query}”的搜索结果` : "全部影片";
        }
        if (count) {
            count.textContent = keyword ? `当前筛选到 ${visible} 个相关条目。` : "输入关键词后会自动筛选当前列表。";
        }
    }

    if (input) {
        input.value = initialQuery;
        input.addEventListener("input", () => filterCards(input.value));
    }

    filterCards(initialQuery);
}
