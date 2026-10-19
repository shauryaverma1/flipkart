// Product Detail View Component
(function () {
    function formatRupee(amount) {
        return "₹" + Number(amount).toLocaleString("en-IN");
    }

    function renderDetail(productId, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const product = window.FLIPKART_PRODUCTS.find(p => p.id === productId);
        if (!product) {
            container.innerHTML = `<div class="fk-no-results"><h3>Product not found.</h3><button class="fk-btn-shop-now" onclick="window.Store.setView('home')">Return Home</button></div>`;
            return;
        }

        const images = product.images && product.images.length ? product.images : [product.image];
        const isWishlisted = window.Store.isInWishlist(product.id);

        container.innerHTML = `
            <div style="margin-bottom: 12px; font-size: 12px; color: var(--fk-text-secondary);">
                <a href="#" onclick="window.Store.setView('home'); return false;">Home</a> > 
                <a href="#" onclick="window.Store.setCategory('${product.category}'); return false;">${product.category.toUpperCase()}</a> > 
                <span>${product.brand}</span> > 
                <span style="color: var(--fk-text-primary); font-weight: 500;">${product.title.substring(0, 40)}...</span>
            </div>

            <div class="fk-detail-container">
                <!-- Left Image & Action Column -->
                <div class="fk-detail-left">
                    <div class="fk-detail-img-box">
                        <button class="fk-card-wishlist ${isWishlisted ? 'active' : ''}" style="top: 14px; right: 14px;" title="Wishlist" onclick="window.App.toggleWishlist('${product.id}')">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="${isWishlisted ? '#ff4343' : 'currentColor'}">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                        </button>
                        <img id="detail-main-img" src="${images[0]}" alt="${product.title}" class="fk-detail-main-img">
                    </div>

                    <div class="fk-detail-thumbnails">
                        ${images.map((img, i) => `
                            <img src="${img}" class="fk-thumb ${i === 0 ? 'active' : ''}" onclick="window.ProductDetail.switchImage('${img}', this)" alt="Thumbnail ${i + 1}">
                        `).join("")}
                    </div>

                    <div class="fk-detail-actions">
                        <button class="fk-btn-cart-lg" onclick="window.App.addToCart('${product.id}')">
                            🛒 ADD TO CART
                        </button>
                        <button class="fk-btn-buy-lg" onclick="window.App.buyNow('${product.id}')">
                            ⚡ BUY NOW
                        </button>
                    </div>
                </div>

                <!-- Right Information Column -->
                <div class="fk-detail-right">
                    <h1 class="fk-detail-title">${product.title}</h1>

                    <div class="fk-detail-rating-row">
                        <div class="fk-rating-pill">
                            ${product.rating} ★
                        </div>
                        <span class="fk-rating-count">${product.ratingsCount.toLocaleString("en-IN")} Ratings & ${product.reviewsCount.toLocaleString("en-IN")} Reviews</span>
                        ${product.isAssured ? `<span class="fk-assured-logo">⚡Assured</span>` : ""}
                    </div>

                    <div class="fk-detail-price-box">
                        <div class="fk-detail-special-price">Special price</div>
                        <div class="fk-detail-price-row">
                            <span class="fk-detail-price">${formatRupee(product.price)}</span>
                            <span class="fk-detail-original">${formatRupee(product.originalPrice)}</span>
                            <span class="fk-detail-discount">${product.discount}% off</span>
                        </div>
                    </div>

                    <!-- Available Offers -->
                    <div class="fk-detail-offers">
                        <div class="fk-offers-title">Available offers</div>
                        ${(product.bankOffers || []).map(offer => `
                            <div class="fk-offer-item">
                                <span class="fk-offer-tag-icon">🏷️</span>
                                <span>${offer}</span>
                            </div>
                        `).join("")}
                    </div>

                    <!-- Delivery Pincode Checker -->
                    <div class="fk-pincode-section">
                        <div class="fk-pincode-title">Delivery & Pincode Check</div>
                        <div class="fk-pincode-form">
                            <input type="text" id="pincode-input" class="fk-pincode-input" placeholder="Enter Pincode" maxlength="6" value="110001">
                            <button class="fk-pincode-btn" onclick="window.ProductDetail.checkPincode()">Check</button>
                        </div>
                        <div id="pincode-msg" class="fk-pincode-msg">
                            ✓ Delivery by Tomorrow, 11 PM | FREE ₹40
                        </div>
                    </div>

                    <!-- Highlights -->
                    <div class="fk-highlights-section">
                        <div class="fk-highlights-title">Highlights</div>
                        <ul class="fk-highlights-list">
                            ${(product.highlights || []).map(h => `<li>${h}</li>`).join("")}
                        </ul>
                    </div>

                    <!-- Specifications Table -->
                    <div class="fk-specs-section">
                        <div class="fk-specs-title">Specifications</div>
                        <table class="fk-specs-table">
                            <tbody>
                                ${Object.entries(product.specs || {}).map(([key, value]) => `
                                    <tr>
                                        <td>${key}</td>
                                        <td>${value}</td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>

                    <!-- Customer Reviews -->
                    <div class="fk-reviews-section">
                        <div class="fk-reviews-title">Ratings & Reviews</div>
                        <div class="fk-reviews-list">
                            ${(product.reviews || []).map(rev => `
                                <div class="fk-review-card">
                                    <div class="fk-review-top">
                                        <div class="fk-rating-pill">${rev.rating} ★</div>
                                        <strong>${rev.user}</strong>
                                        <span class="fk-review-user">• Verified Buyer • ${rev.date}</span>
                                    </div>
                                    <div class="fk-review-text">${rev.text}</div>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function switchImage(src, element) {
        const mainImg = document.getElementById("detail-main-img");
        if (mainImg) mainImg.src = src;

        document.querySelectorAll(".fk-thumb").forEach(thumb => thumb.classList.remove("active"));
        if (element) element.classList.add("active");
    }

    function checkPincode() {
        const input = document.getElementById("pincode-input");
        const msg = document.getElementById("pincode-msg");
        if (!input || !msg) return;

        const val = input.value.trim();
        if (val.length === 6 && !isNaN(val)) {
            msg.innerHTML = `✓ Available for <strong>${val}</strong>: Fast delivery by Tomorrow, 11 PM | FREE ₹40 for Plus`;
            msg.style.color = "var(--fk-green)";
        } else {
            msg.innerHTML = `✗ Please enter a valid 6-digit postal code`;
            msg.style.color = "#d32f2f";
        }
    }

    window.ProductDetail = {
        render: renderDetail,
        switchImage,
        checkPincode
    };
})();
