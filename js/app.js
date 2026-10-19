// Main Application Controller & Router for Flipkart Clone
(function () {
    class AppController {
        constructor() {
            this.toastTimeout = null;
            this.dealTimerInterval = null;
        }

        init() {
            console.log("Initializing Flipkart Clone Application...");

            // Subscribe to state changes
            window.Store.subscribe((state, eventType, payload) => {
                this.handleStateChange(state, eventType, payload);
            });

            // Setup Header & Search
            this.setupHeader();
            this.setupSearch();
            this.setupCategoriesBar();
            this.startDealTimer();

            // Initial view render
            this.renderCurrentView();
            this.updateHeaderBadges();
        }

        handleStateChange(state, eventType, payload) {
            this.updateHeaderBadges();

            if (eventType === "VIEW_CHANGED") {
                this.renderCurrentView();
            } else if (eventType === "FILTERS_UPDATED" || eventType === "CATEGORY_UPDATED" || eventType === "SEARCH_UPDATED" || eventType === "FILTERS_RESET") {
                if (state.currentView === "catalog") {
                    this.renderCatalogView();
                }
            } else if (eventType === "CART_UPDATED") {
                if (state.currentView === "cart") {
                    window.CartView.render("main-view-container");
                }
            } else if (eventType === "WISHLIST_UPDATED") {
                if (state.currentView === "wishlist") {
                    window.WishlistView.render("main-view-container");
                }
            } else if (eventType === "USER_UPDATED") {
                this.updateHeaderUser();
            }
        }

        renderCurrentView() {
            const state = window.Store.state;
            const container = document.getElementById("main-view-container");
            if (!container) return;

            // Clear any active search suggestions
            this.closeSearchSuggestions();

            switch (state.currentView) {
                case "home":
                    this.renderHomeView();
                    break;
                case "catalog":
                    this.renderCatalogView();
                    break;
                case "detail":
                    window.ProductDetail.render(state.selectedProductId, "main-view-container");
                    break;
                case "cart":
                    window.CartView.render("main-view-container");
                    break;
                case "checkout":
                    window.CheckoutView.render("main-view-container");
                    break;
                case "orders":
                    window.OrdersView.render("main-view-container");
                    break;
                case "wishlist":
                    window.WishlistView.render("main-view-container");
                    break;
                default:
                    this.renderHomeView();
            }
        }

        renderHomeView() {
            const container = document.getElementById("main-view-container");
            const products = window.FLIPKART_PRODUCTS || [];

            // Slice top deals and trending
            const dealsOfDay = products.filter(p => p.discount >= 20).slice(0, 5);
            const bestElectronics = products.filter(p => p.category === "electronics" || p.category === "mobiles").slice(0, 5);
            const topFashion = products.filter(p => p.category === "fashion").slice(0, 5);

            container.innerHTML = `
                <!-- Hero Carousel -->
                <div id="hero-carousel" class="fk-carousel-container"></div>

                <!-- Deal of the Day Rail -->
                <div class="fk-rail-section">
                    <div class="fk-rail-header">
                        <div class="fk-rail-title-group">
                            <h2 class="fk-rail-title">Deals of the Day</h2>
                            <div class="fk-countdown-timer">
                                <span>⏰ Ends in:</span>
                                <span id="deal-timer-display" class="fk-timer-pill">16h : 42m : 18s</span>
                            </div>
                        </div>
                        <button class="fk-rail-view-all-btn" onclick="window.Store.setCategory('all')">VIEW ALL</button>
                    </div>
                    <div class="fk-rail-grid">
                        ${dealsOfDay.map(p => window.ProductCard.render(p)).join("")}
                    </div>
                </div>

                <!-- Best of Electronics & Mobiles -->
                <div class="fk-rail-section">
                    <div class="fk-rail-header">
                        <div class="fk-rail-title-group">
                            <h2 class="fk-rail-title">Best of Electronics & Smartphones</h2>
                        </div>
                        <button class="fk-rail-view-all-btn" onclick="window.Store.setCategory('electronics')">VIEW ALL</button>
                    </div>
                    <div class="fk-rail-grid">
                        ${bestElectronics.map(p => window.ProductCard.render(p)).join("")}
                    </div>
                </div>

                <!-- Top Fashion & Lifestyle Deals -->
                <div class="fk-rail-section">
                    <div class="fk-rail-header">
                        <div class="fk-rail-title-group">
                            <h2 class="fk-rail-title">Trending in Fashion & Wearables</h2>
                        </div>
                        <button class="fk-rail-view-all-btn" onclick="window.Store.setCategory('fashion')">VIEW ALL</button>
                    </div>
                    <div class="fk-rail-grid">
                        ${topFashion.map(p => window.ProductCard.render(p)).join("")}
                    </div>
                </div>
            `;

            // Initialize banner slider in home view
            window.BannerSlider.init();
        }

        renderCatalogView() {
            const container = document.getElementById("main-view-container");
            const state = window.Store.state;
            const filtered = this.getFilteredProducts();

            container.innerHTML = `
                <div class="fk-catalog-layout">
                    <!-- Filter Sidebar -->
                    <div id="catalog-sidebar-container"></div>

                    <!-- Main Products Grid -->
                    <div class="fk-catalog-main">
                        <div class="fk-catalog-top-bar">
                            <div>
                                <div class="fk-catalog-breadcrumbs">
                                    <span style="cursor: pointer;" onclick="window.Store.setView('home')">Home</span> > 
                                    <span style="font-weight: 600; color: var(--fk-text-primary);">
                                        ${state.selectedCategory === 'all' ? 'All Products' : state.selectedCategory.toUpperCase()}
                                    </span>
                                </div>
                                <div class="fk-catalog-count">
                                    Showing ${filtered.length} products ${state.searchQuery ? `for "<strong>${state.searchQuery}</strong>"` : ''}
                                </div>
                            </div>

                            <!-- Sort Options -->
                            <div class="fk-sort-bar">
                                <span class="fk-sort-label">Sort By</span>
                                <span class="fk-sort-option ${state.filters.sortBy === 'relevance' ? 'active' : ''}" onclick="window.App.setSort('relevance')">Relevance</span>
                                <span class="fk-sort-option ${state.filters.sortBy === 'price-asc' ? 'active' : ''}" onclick="window.App.setSort('price-asc')">Price -- Low to High</span>
                                <span class="fk-sort-option ${state.filters.sortBy === 'price-desc' ? 'active' : ''}" onclick="window.App.setSort('price-desc')">Price -- High to Low</span>
                                <span class="fk-sort-option ${state.filters.sortBy === 'discount-desc' ? 'active' : ''}" onclick="window.App.setSort('discount-desc')">Discount</span>
                            </div>
                        </div>

                        ${filtered.length > 0 ? `
                            <div class="fk-catalog-grid">
                                ${filtered.map(p => window.ProductCard.render(p)).join("")}
                            </div>
                        ` : `
                            <div class="fk-no-results">
                                <div class="fk-no-results-icon">🔍</div>
                                <h2>No matching products found!</h2>
                                <p style="color: var(--fk-text-secondary); margin: 10px 0 20px;">Try adjusting your filters, searching with different terms, or resetting all filters.</p>
                                <button class="fk-btn-shop-now" onclick="window.Store.resetFilters()">Reset All Filters</button>
                            </div>
                        `}
                    </div>
                </div>
            `;

            // Render filter sidebar into container
            window.FilterSidebar.render("catalog-sidebar-container");
        }

        getFilteredProducts() {
            const state = window.Store.state;
            let list = [...(window.FLIPKART_PRODUCTS || [])];

            // Category filter
            if (state.selectedCategory && state.selectedCategory !== "all") {
                list = list.filter(p => p.category === state.selectedCategory);
            }

            // Search query filter
            if (state.searchQuery && state.searchQuery.trim() !== "") {
                const q = state.searchQuery.toLowerCase().trim();
                list = list.filter(p => {
                    return p.title.toLowerCase().includes(q) ||
                        p.brand.toLowerCase().includes(q) ||
                        p.category.toLowerCase().includes(q) ||
                        p.subcategory.toLowerCase().includes(q) ||
                        (p.highlights && p.highlights.some(h => h.toLowerCase().includes(q)));
                });
            }

            // Brands filter
            if (state.filters.brands && state.filters.brands.length > 0) {
                list = list.filter(p => state.filters.brands.includes(p.brand));
            }

            // Price max filter
            if (state.filters.maxPrice) {
                list = list.filter(p => p.price <= state.filters.maxPrice);
            }

            // Min rating filter
            if (state.filters.minRating > 0) {
                list = list.filter(p => p.rating >= state.filters.minRating);
            }

            // Assured filter
            if (state.filters.assuredOnly) {
                list = list.filter(p => p.isAssured === true);
            }

            // Sort
            if (state.filters.sortBy === "price-asc") {
                list.sort((a, b) => a.price - b.price);
            } else if (state.filters.sortBy === "price-desc") {
                list.sort((a, b) => b.price - a.price);
            } else if (state.filters.sortBy === "rating-desc") {
                list.sort((a, b) => b.rating - a.rating);
            } else if (state.filters.sortBy === "discount-desc") {
                list.sort((a, b) => b.discount - a.discount);
            }

            return list;
        }

        setSort(sortType) {
            window.Store.setFilters({ sortBy: sortType });
        }

        // Header and Search Setup
        setupHeader() {
            this.updateHeaderUser();

            // Setup click listeners for cards
            document.addEventListener("click", (e) => {
                const card = e.target.closest(".fk-card");
                if (card && !e.target.closest(".fk-card-wishlist") && !e.target.closest(".fk-card-btn-add")) {
                    const productId = card.dataset.productId;
                    if (productId) {
                        window.Store.setView("detail", { productId });
                    }
                }
            });
        }

        updateHeaderUser() {
            const user = window.Store.state.user;
            const container = document.getElementById("header-user-wrapper");
            if (!container) return;

            if (user) {
                container.innerHTML = `
                    <div class="fk-profile-container">
                        <button class="fk-user-btn">
                            <span>👤 ${user.name.split(" ")[0]} ▾</span>
                        </button>
                        <div class="fk-user-dropdown">
                            <div class="fk-dropdown-item" onclick="window.Store.setView('orders')">
                                📦 My Orders
                            </div>
                            <div class="fk-dropdown-item" onclick="window.Store.setView('wishlist')">
                                ❤️ Wishlist (${window.Store.state.wishlist.length})
                            </div>
                            <div class="fk-dropdown-item" onclick="window.Store.logout()">
                                🚪 Logout
                            </div>
                        </div>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <button class="fk-btn-login" onclick="window.AuthModal.open()">Login</button>
                `;
            }
        }

        updateHeaderBadges() {
            const cartTotals = window.Store.getCartTotals();
            const badge = document.getElementById("header-cart-badge");
            if (badge) {
                badge.textContent = cartTotals.totalItems;
                badge.style.display = cartTotals.totalItems > 0 ? "block" : "none";
            }
        }

        setupSearch() {
            const input = document.getElementById("header-search-input");
            const suggestionsBox = document.getElementById("header-search-suggestions");
            if (!input || !suggestionsBox) return;

            input.addEventListener("input", (e) => {
                const val = e.target.value.trim().toLowerCase();
                if (val.length < 2) {
                    suggestionsBox.classList.remove("active");
                    return;
                }

                const matches = (window.FLIPKART_PRODUCTS || []).filter(p => {
                    return p.title.toLowerCase().includes(val) ||
                        p.brand.toLowerCase().includes(val) ||
                        p.category.toLowerCase().includes(val);
                }).slice(0, 6);

                if (matches.length > 0) {
                    suggestionsBox.innerHTML = matches.map(m => `
                        <div class="fk-suggestion-item" onclick="window.App.handleSuggestionClick('${m.id}')">
                            <span>🔍</span>
                            <span>${m.title}</span>
                            <span style="margin-left: auto; color: var(--fk-green); font-size: 11px; font-weight: 700;">₹${Number(m.price).toLocaleString('en-IN')}</span>
                        </div>
                    `).join("");
                    suggestionsBox.classList.add("active");
                } else {
                    suggestionsBox.classList.remove("active");
                }
            });

            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    this.triggerSearch();
                }
            });

            // Close suggestions when clicking outside
            document.addEventListener("click", (e) => {
                if (!e.target.closest(".fk-search-wrapper")) {
                    suggestionsBox.classList.remove("active");
                }
            });
        }

        closeSearchSuggestions() {
            const suggestionsBox = document.getElementById("header-search-suggestions");
            if (suggestionsBox) suggestionsBox.classList.remove("active");
        }

        handleSuggestionClick(productId) {
            this.closeSearchSuggestions();
            window.Store.setView("detail", { productId });
        }

        triggerSearch() {
            const input = document.getElementById("header-search-input");
            if (!input) return;
            const query = input.value.trim();
            this.closeSearchSuggestions();
            window.Store.setSearch(query);
        }

        setupCategoriesBar() {
            const container = document.getElementById("categories-bar-container");
            if (!container) return;

            const categories = window.FLIPKART_CATEGORIES || [];
            container.innerHTML = categories.map(cat => `
                <div class="fk-cat-item ${window.Store.state.selectedCategory === cat.id ? 'active' : ''}" onclick="window.Store.setCategory('${cat.id}')">
                    <span class="fk-cat-icon">${cat.icon}</span>
                    <span class="fk-cat-name">${cat.name}</span>
                </div>
            `).join("");
        }

        startDealTimer() {
            let totalSeconds = 16 * 3600 + 42 * 60 + 18;
            this.dealTimerInterval = setInterval(() => {
                totalSeconds--;
                if (totalSeconds <= 0) totalSeconds = 24 * 3600;

                const h = Math.floor(totalSeconds / 3600);
                const m = Math.floor((totalSeconds % 3600) / 60);
                const s = totalSeconds % 60;

                const el = document.getElementById("deal-timer-display");
                if (el) {
                    el.textContent = `${h}h : ${m < 10 ? '0' : ''}${m}m : ${s < 10 ? '0' : ''}${s}s`;
                }
            }, 1000);
        }

        // Cart & Wishlist helpers
        addToCart(productId) {
            window.Store.addToCart(productId, 1);
            const product = window.FLIPKART_PRODUCTS.find(p => p.id === productId);
            this.showToast(`✓ Added to Cart: ${product ? product.title.substring(0, 24) + '...' : ''}`);
        }

        buyNow(productId) {
            window.Store.addToCart(productId, 1);
            window.Store.setView("checkout");
        }

        saveForLater(productId) {
            window.Store.removeFromCart(productId);
            window.Store.toggleWishlist(productId);
            this.showToast("Item saved for later in your Wishlist");
        }

        toggleWishlist(productId) {
            window.Store.toggleWishlist(productId);
            const inList = window.Store.isInWishlist(productId);
            this.showToast(inList ? "❤️ Saved to Wishlist" : "Removed from Wishlist");
        }

        openAddressModal() {
            window.AddressModal.open();
        }

        showToast(message) {
            let toast = document.getElementById("fk-global-toast");
            if (!toast) {
                toast = document.createElement("div");
                toast.id = "fk-global-toast";
                toast.className = "fk-toast";
                document.body.appendChild(toast);
            }

            toast.innerHTML = message;
            toast.classList.add("show");

            if (this.toastTimeout) clearTimeout(this.toastTimeout);
            this.toastTimeout = setTimeout(() => {
                toast.classList.remove("show");
            }, 3000);
        }
    }

    window.App = new AppController();
    document.addEventListener("DOMContentLoaded", () => {
        window.App.init();
    });
})();
