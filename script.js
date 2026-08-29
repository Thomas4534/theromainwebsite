// ============================================================
// PAGE FADE / NAVIGATION
// ============================================================

const pageTransition = document.getElementById("pageTransition");
const homeLink = document.getElementById("homeLink");


// ------------------------------------------------------------
// Fade page in when loaded
// ------------------------------------------------------------

window.addEventListener("load", () => {

    requestAnimationFrame(() => {

        if (pageTransition) {

            pageTransition.style.opacity = "0";

        }

    });

});


// ------------------------------------------------------------
// Fade to another page
// ------------------------------------------------------------

function navigateWithFade(url) {

    if (pageTransition) {

        pageTransition.style.opacity = "1";

    }

    setTimeout(() => {

        window.location.href = url;

    }, 400);

}


// ------------------------------------------------------------
// HOME BUTTON
// ------------------------------------------------------------

if (homeLink) {

    homeLink.addEventListener("click", () => {

        navigateWithFade("index.html");

    });

}


// ------------------------------------------------------------
// FADE NAVIGATION LINKS
// ------------------------------------------------------------

document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", (event) => {

        const href = link.getAttribute("href");


        // Ignore empty links and #
        if (!href || href === "#") {

            return;

        }


        event.preventDefault();

        navigateWithFade(href);

    });

});


// ============================================================
// HOMEPAGE VIDEO ELEMENTS
// ============================================================

const videoGrid = document.getElementById("videoGrid");


// Only run the video code if we are on the homepage
if (videoGrid) {

    const modal = document.getElementById("videoModal");
    const youtubePlayer = document.getElementById("youtubePlayer");
    const closeModal = document.getElementById("closeModal");


    // ============================================================
    // VIDEOS
    // ============================================================

    const videos = [

        {
            file: "assets/tokyo.mp4",
            youtubeID: "-bY9iHjg-4A",
            title: "TOKYO 450",
            startTime: 5
        },

        {
            file: "assets/film.mp4",
            youtubeID: "SIpI3hXHLmU",
            title: "CAPTIF",
            startTime: 0
        },

        {
            file: "assets/scrap.mp4",
            youtubeID: "HakFqYzeoh4",
            title: "La Cour à Scrap",
            startTime: 9
        }

    ];


    // ============================================================
    // CREATE VIDEOS
    // ============================================================

    const videoElements = [];
    const videoCovers = [];

    videos.forEach(data => {

        // ---------------- Container ----------------

        const item = document.createElement("div");

        item.className = "video-item";


        // ---------------- Video Card ----------------

        const card = document.createElement("div");

        card.className = "video-card";

        card.style.position = "relative";


        // ---------------- Video ----------------

        const video = document.createElement("video");

        video.src = data.file;

        video.muted = true;
        video.playsInline = true;

        video.loop = false;
        video.autoplay = false;

        video.preload = "auto";

        video.setAttribute("muted", "");
        video.setAttribute("playsinline", "");


        // --------------------------------------------------------
        // Set individual starting position
        // --------------------------------------------------------

        video.addEventListener("loadedmetadata", () => {

            video.currentTime = data.startTime;

        });


        // --------------------------------------------------------
        // Restart from individual starting position
        // --------------------------------------------------------

        video.addEventListener("ended", () => {

            video.currentTime = data.startTime;

            video.play().catch(error => {

                console.log("Could not restart video:", error);

            });

        });


        videoElements.push(video);


        // ---------------- Black Cover ----------------

        const cover = document.createElement("div");

        cover.style.position = "absolute";
        cover.style.top = "0";
        cover.style.left = "0";
        cover.style.width = "100%";
        cover.style.height = "100%";
        cover.style.backgroundColor = "#000";
        cover.style.zIndex = "10";
        cover.style.pointerEvents = "none";

        videoCovers.push(cover);


        // ---------------- Click Video ----------------

        card.addEventListener("click", () => {

            youtubePlayer.src =
                `https://www.youtube.com/embed/${data.youtubeID}?autoplay=1&rel=0`;

            modal.classList.add("show");

        });


        // ---------------- Add Video ----------------

        card.appendChild(video);

        card.appendChild(cover);


        // ---------------- Title ----------------

        const title = document.createElement("div");

        title.className = "video-title";

        title.textContent = data.title;


        // ---------------- Add To Page ----------------

        item.appendChild(card);

        item.appendChild(title);

        videoGrid.appendChild(item);

    });


    // ============================================================
    // WAIT FOR VIDEO
    // ============================================================

    function waitForVideo(video) {

        return new Promise(resolve => {

            if (video.readyState >= 3) {

                resolve();

                return;

            }


            video.addEventListener(
                "canplay",
                resolve,
                { once: true }
            );

        });

    }


    // ============================================================
    // START ALL VIDEOS TOGETHER
    // ============================================================

    async function startAllVideos() {

        await Promise.all(
            videoElements.map(video => waitForVideo(video))
        );


        // Reset each video

        videoElements.forEach((video, index) => {

            video.pause();

            video.currentTime = videos[index].startTime;

            video.muted = true;

        });


        // Start all videos

        const playPromises = videoElements.map(video => {

            return video.play();

        });


        try {

            await Promise.all(playPromises);

        } catch (error) {

            console.log("Autoplay was blocked:", error);

            return;

        }


        // Remove black covers

        videoCovers.forEach(cover => {

            cover.style.display = "none";

        });

    }


    // ============================================================
    // START VIDEOS
    // ============================================================

    startAllVideos();


    // ============================================================
    // CLOSE YOUTUBE MODAL
    // ============================================================

    function closePlayer() {

        modal.classList.remove("show");

        youtubePlayer.src = "";

    }


    if (closeModal) {

        closeModal.addEventListener("click", closePlayer);

    }


    modal.addEventListener("click", (e) => {

        if (e.target === modal) {

            closePlayer();

        }

    });


    // ============================================================
    // ESC KEY
    // ============================================================

    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape") {

            closePlayer();

        }

    });

}