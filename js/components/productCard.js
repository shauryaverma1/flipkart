// Product Card Component - Renders Flipkart-style authentic product card
(function () {
    function formatRupee(amount) {
        return "₹" + Number(amount).toLocaleString("en-IN");
    }

    function renderProductCard(product) {
        const isWishlisted = window.Store.isInWishlist(product.id);
        const wishlistClass = isWishlisted ? "active" : "";

        return `
            <div class="fk-card" data-product-id="${product.id}">
                ${product.badge ? `<div class="fk-card-badge">${product.badge}</div>` : ""}
                
                <button class="fk-card-wishlist ${wishlistClass}" title="Add to Wishlist" data-wishlist-id="${product.id}" onclick="event.stopPropagation(); window.App.toggleWishlist('${product.id}')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWishlisted ? '#ff4343' : 'currentColor'}">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                </button>

                <div class="fk-card-img-container">
                    <img src="${product.image}" alt="${product.title}" class="fk-card-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'">
                </div>

                <div class="fk-card-title" title="${product.title}">${product.title}</div>

                <div class="fk-card-rating-row">
                    <div class="fk-rating-pill">
                        ${product.rating} ★
                    </div>
                    <span class="fk-rating-count">(${product.ratingsCount.toLocaleString("en-IN")})</span>
                    ${product.isAssured ? `<span class="fk-assured-logo">⚡Assured</span>` : ""}
                </div>

                <div class="fk-card-price-row">
                    <span class="fk-card-price">${formatRupee(product.price)}</span>
                    <span class="fk-card-original">${formatRupee(product.originalPrice)}</span>
                    <span class="fk-card-discount">${product.discount}% off</span>
                </div>

                <div class="fk-card-delivery">${product.deliveryInfo}</div>

                <button class="fk-card-btn-add" onclick="event.stopPropagation(); window.App.addToCart('${product.id}')">
                    Add to Cart
                </button>
            </div>
        `;
    }

    window.ProductCard = {
        render: renderProductCard,
        formatRupee: formatRupee
    };
})();
