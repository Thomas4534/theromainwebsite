const photos = Array.from(
    document.querySelectorAll(
        ".landscape-grid img, .portrait-grid img"
    )
);

const lightbox = document.querySelector(".photo-lightbox");

const expandedPhoto = document.getElementById("expanded-photo");

const closeButton = document.querySelector(".close-photo");

const previousButton = document.querySelector(".previous-photo");

const nextButton = document.querySelector(".next-photo");


let currentPhotoIndex = 0;


/* ============================================================
   SHOW PHOTO
   ============================================================ */

function showPhoto(index) {

    currentPhotoIndex = index;

    expandedPhoto.src = photos[currentPhotoIndex].src;

}


/* ============================================================
   OPEN PHOTO
   ============================================================ */

photos.forEach((photo, index) => {

    photo.addEventListener("click", function () {

        showPhoto(index);

        lightbox.classList.add("active");

    });

});


/* ============================================================
   NEXT PHOTO
   ============================================================ */

nextButton.addEventListener("click", function (event) {

    event.stopPropagation();

    currentPhotoIndex =
        (currentPhotoIndex + 1) % photos.length;

    showPhoto(currentPhotoIndex);

});


/* ============================================================
   PREVIOUS PHOTO
   ============================================================ */

previousButton.addEventListener("click", function (event) {

    event.stopPropagation();

    currentPhotoIndex =
        (currentPhotoIndex - 1 + photos.length) % photos.length;

    showPhoto(currentPhotoIndex);

});


/* ============================================================
   CLOSE WITH X
   ============================================================ */

closeButton.addEventListener("click", function () {

    lightbox.classList.remove("active");

    expandedPhoto.src = "";

});


/* ============================================================
   CLOSE WHEN CLICKING BACKGROUND
   ============================================================ */

lightbox.addEventListener("click", function (event) {

    if (event.target === lightbox) {

        lightbox.classList.remove("active");

        expandedPhoto.src = "";

    }

});


/* ============================================================
   KEYBOARD CONTROLS
   ============================================================ */

document.addEventListener("keydown", function (event) {

    if (!lightbox.classList.contains("active")) return;


    if (event.key === "ArrowRight") {

        currentPhotoIndex =
            (currentPhotoIndex + 1) % photos.length;

        showPhoto(currentPhotoIndex);

    }


    if (event.key === "ArrowLeft") {

        currentPhotoIndex =
            (currentPhotoIndex - 1 + photos.length) % photos.length;

        showPhoto(currentPhotoIndex);

    }


    if (event.key === "Escape") {

        lightbox.classList.remove("active");

        expandedPhoto.src = "";

    }

});