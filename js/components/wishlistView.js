// Wishlist View Component
(function () {
    function renderWishlist(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const wishlistIds = window.Store.state.wishlist || [];
        const products = (window.FLIPKART_PRODUCTS || []).filter(p => wishlistIds.includes(p.id));

        if (products.length === 0) {
            container.innerHTML = `
                <div class="fk-no-results">
                    <div class="fk-no-results-icon">❤️</div>
                    <h2>Empty Wishlist</h2>
                    <p style="color: var(--fk-text-secondary); margin: 10px 0 20px;">You have no items saved to your wishlist yet.</p>
                    <button class="fk-btn-shop-now" onclick="window.Store.setView('home')">Explore Products</button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="fk-orders-header">
                My Wishlist (${products.length})
            </div>

            <div class="fk-catalog-grid" style="margin-top: 16px;">
                ${products.map(p => window.ProductCard.render(p)).join("")}
            </div>
        `;
    }

    window.WishlistView = {
        render: renderWishlist
    };
})();
