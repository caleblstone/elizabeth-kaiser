
if (window.innerWidth > 600) { // Only enable carousel on non-mobile screens
 const workImages = Array.from(document.querySelectorAll('.workImages .workImage'));
const workImageImgs = workImages.map(imgDiv => imgDiv.querySelector('img'));

    if (workImages.length > 0) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'imageCarouselOverlay';
        overlay.innerHTML = `
             <button class="carousel-arrow left" aria-label="Previous image">
                <img src="/assets/images/larrow.png" alt="Previous" width="80" height="60">
            </button>
            <img class="carousel-main-img" src="" alt="">
            <button class="carousel-arrow right" aria-label="Next image">
                <img src="/assets/images/rarrow.png" alt="Next" width="80" height="60">
            </button>
            <button class="carousel-close" aria-label="Close carousel">&times;</button>
        `;
        document.body.appendChild(overlay);

        const carouselImg = overlay.querySelector('.carousel-main-img');
        const leftBtn = overlay.querySelector('.carousel-arrow.left');
        const rightBtn = overlay.querySelector('.carousel-arrow.right');
        const closeBtn = overlay.querySelector('.carousel-close');
        let currentIdx = 0;

       function showCarousel(idx) {
            currentIdx = idx;
            carouselImg.src = workImageImgs[idx].src;
            carouselImg.alt = workImageImgs[idx].alt || '';
            overlay.classList.add('active');
        }

        function hideCarousel() {
            overlay.classList.remove('active');
            carouselImg.src = '';
        }

        function showPrev() {
            showCarousel((currentIdx - 1 + workImages.length) % workImages.length);
        }

        function showNext() {
            showCarousel((currentIdx + 1) % workImages.length);
        }

        workImages.forEach((div, idx) => {
            div.style.cursor = 'pointer';
            div.addEventListener('click', e => {
                e.stopPropagation();
                console.log('workImage clicked:', idx, workImageImgs[idx].src);
                showCarousel(idx);
            });
        });

        leftBtn.addEventListener('click', showPrev);
        rightBtn.addEventListener('click', showNext);
        closeBtn.addEventListener('click', hideCarousel);

        overlay.addEventListener('click', e => {
            if (e.target === overlay) hideCarousel();
        });

        // Keyboard navigation
        document.addEventListener('keydown', e => {
            if (!overlay.classList.contains('active')) return;
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'Escape') hideCarousel();
        });
    }
}