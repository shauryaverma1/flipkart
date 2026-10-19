// Filter Sidebar Component for Catalog View
(function () {
    function renderFilterSidebar(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const state = window.Store.state;
        const products = window.FLIPKART_PRODUCTS || [];

        // Get unique brands for current category or all products
        let relevantProducts = products;
        if (state.selectedCategory && state.selectedCategory !== "all") {
            relevantProducts = products.filter(p => p.category === state.selectedCategory);
        }
        const brands = [...new Set(relevantProducts.map(p => p.brand))].sort();

        container.innerHTML = `
            <div class="fk-filter-sidebar">
                <div class="fk-filter-header">
                    <span class="fk-filter-title">Filters</span>
                    <button class="fk-filter-clear-btn" onclick="window.Store.resetFilters()">CLEAR ALL</button>
                </div>

                <!-- CATEGORIES -->
                <div class="fk-filter-section">
                    <div class="fk-filter-sec-title">Category</div>
                    <div class="fk-checkbox-group">
                        <label class="fk-checkbox-item">
                            <input type="radio" name="cat_filter" value="all" ${state.selectedCategory === 'all' ? 'checked' : ''} onchange="window.Store.setCategory('all')">
                            All Categories
                        </label>
                        ${window.FLIPKART_CATEGORIES.filter(c => c.id !== 'all').map(cat => `
                            <label class="fk-checkbox-item">
                                <input type="radio" name="cat_filter" value="${cat.id}" ${state.selectedCategory === cat.id ? 'checked' : ''} onchange="window.Store.setCategory('${cat.id}')">
                                ${cat.name}
                            </label>
                        `).join("")}
                    </div>
                </div>

                <!-- PRICE RANGE SLIDER -->
                <div class="fk-filter-section">
                    <div class="fk-filter-sec-title">Price Range</div>
                    <div class="fk-price-range-wrapper">
                        <input type="range" class="fk-range-slider" min="500" max="100000" step="1000" value="${state.filters.maxPrice}" 
                            oninput="document.getElementById('price-val-label').textContent = '₹' + Number(this.value).toLocaleString('en-IN');"
                            onchange="window.Store.setFilters({ maxPrice: Number(this.value) })">
                        <div class="fk-price-labels">
                            <span>Min: ₹500</span>
                            <span id="price-val-label">₹${Number(state.filters.maxPrice).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>

                <!-- FLIPKART ASSURED -->
                <div class="fk-filter-section">
                    <label class="fk-checkbox-item" style="font-weight: 600;">
                        <input type="checkbox" ${state.filters.assuredOnly ? 'checked' : ''} onchange="window.Store.setFilters({ assuredOnly: this.checked })">
                        <span class="fk-assured-logo" style="margin-left: 0;">⚡Assured</span> Only
                    </label>
                </div>

                <!-- BRAND FILTER -->
                <div class="fk-filter-section">
                    <div class="fk-filter-sec-title">Brand</div>
                    <div class="fk-checkbox-group">
                        ${brands.map(brand => {
                            const isChecked = state.filters.brands.includes(brand);
                            return `
                                <label class="fk-checkbox-item">
                                    <input type="checkbox" value="${brand}" ${isChecked ? 'checked' : ''} onchange="window.FilterSidebar.toggleBrand('${brand}', this.checked)">
                                    ${brand}
                                </label>
                            `;
                        }).join("")}
                    </div>
                </div>

                <!-- CUSTOMER RATINGS -->
                <div class="fk-filter-section">
                    <div class="fk-filter-sec-title">Customer Ratings</div>
                    <div class="fk-checkbox-group">
                        <label class="fk-checkbox-item">
                            <input type="radio" name="rating_filter" value="4" ${state.filters.minRating === 4 ? 'checked' : ''} onchange="window.Store.setFilters({ minRating: 4 })">
                            4★ & above
                        </label>
                        <label class="fk-checkbox-item">
                            <input type="radio" name="rating_filter" value="3" ${state.filters.minRating === 3 ? 'checked' : ''} onchange="window.Store.setFilters({ minRating: 3 })">
                            3★ & above
                        </label>
                        <label class="fk-checkbox-item">
                            <input type="radio" name="rating_filter" value="0" ${state.filters.minRating === 0 ? 'checked' : ''} onchange="window.Store.setFilters({ minRating: 0 })">
                            All Ratings
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    function toggleBrand(brand, isChecked) {
        const state = window.Store.state;
        let brands = [...state.filters.brands];
        if (isChecked) {
            if (!brands.includes(brand)) brands.push(brand);
        } else {
            brands = brands.filter(b => b !== brand);
        }
        window.Store.setFilters({ brands });
    }

    window.FilterSidebar = {
        render: renderFilterSidebar,
        toggleBrand
    };
})();
