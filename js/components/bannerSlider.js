// Banner Slider Component for Hero Carousel
(function () {
    let currentSlide = 0;
    let autoSlideInterval = null;

    function initSlider() {
        const container = document.getElementById("hero-carousel");
        if (!container) return;

        const banners = window.FLIPKART_BANNERS || [];
        if (banners.length === 0) return;

        let slidesHtml = "";
        let dotsHtml = "";

        banners.forEach((banner, idx) => {
            slidesHtml += `
                <div class="fk-carousel-slide ${idx === 0 ? 'active' : ''}" style="background: ${banner.bgGradient};" data-slide-index="${idx}">
                    <div class="fk-slide-content">
                        <span class="fk-slide-tag">${banner.discount}</span>
                        <h2 class="fk-slide-title">${banner.title}</h2>
                        <p class="fk-slide-subtitle">${banner.subtitle}</p>
                        <button class="fk-slide-btn" onclick="window.Store.setCategory('${banner.category}')">${banner.btnText} →</button>
                    </div>
                    <div class="fk-slide-image-wrapper">
                        <img src="${banner.image}" alt="${banner.title}" class="fk-slide-img" onerror="this.style.display='none'">
                    </div>
                </div>
            `;
            dotsHtml += `<div class="fk-dot ${idx === 0 ? 'active' : ''}" onclick="window.BannerSlider.goToSlide(${idx})"></div>`;
        });

        container.innerHTML = `
            ${slidesHtml}
            <button class="fk-carousel-nav prev" onclick="window.BannerSlider.prevSlide()" aria-label="Previous Slide">‹</button>
            <button class="fk-carousel-nav next" onclick="window.BannerSlider.nextSlide()" aria-label="Next Slide">›</button>
            <div class="fk-carousel-dots">${dotsHtml}</div>
        `;

        startAutoSlide();

        container.addEventListener("mouseenter", stopAutoSlide);
        container.addEventListener("mouseleave", startAutoSlide);
    }

    function showSlide(index) {
        const banners = window.FLIPKART_BANNERS || [];
        if (banners.length === 0) return;

        if (index >= banners.length) currentSlide = 0;
        else if (index < 0) currentSlide = banners.length - 1;
        else currentSlide = index;

        const slides = document.querySelectorAll(".fk-carousel-slide");
        const dots = document.querySelectorAll(".fk-dot");

        slides.forEach((slide, idx) => {
            slide.classList.toggle("active", idx === currentSlide);
        });

        dots.forEach((dot, idx) => {
            dot.classList.toggle("active", idx === currentSlide);
        });
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    function goToSlide(index) {
        showSlide(index);
    }

    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(nextSlide, 4500);
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    window.BannerSlider = {
        init: initSlider,
        nextSlide,
        prevSlide,
        goToSlide
    };
})();
