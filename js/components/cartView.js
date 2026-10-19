// Cart View Component
(function () {
    function formatRupee(amount) {
        return "₹" + Number(amount).toLocaleString("en-IN");
    }

    function renderCart(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const cart = window.Store.state.cart;
        const totals = window.Store.getCartTotals();
        const address = window.Store.state.addresses.find(a => a.id === window.Store.state.selectedAddressId) || window.Store.state.addresses[0];

        if (cart.length === 0) {
            container.innerHTML = `
                <div class="fk-empty-cart">
                    <img src="https://rukminim2.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png?q=90" alt="Empty Cart" class="fk-empty-cart-img" onerror="this.src='https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=300&auto=format&fit=crop&q=80'">
                    <h2>Your cart is empty!</h2>
                    <p style="color: var(--fk-text-secondary); margin-top: 6px;">Explore our categories and add items to your cart now.</p>
                    <button class="fk-btn-shop-now" onclick="window.Store.setView('home')">Shop Now</button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="fk-cart-layout">
                <!-- Left: Items List -->
                <div class="fk-cart-left">
                    <div class="fk-cart-card">
                        <!-- Address Banner -->
                        <div class="fk-cart-address-banner">
                            <div>
                                <span class="deliver-to">From Saved Addresses:</span>
                                <span class="user-addr-badge">${address ? address.name + ', ' + address.pincode : 'Delhi - 110001'}</span>
                            </div>
                            <button class="fk-btn-change-addr" onclick="window.App.openAddressModal()">Change</button>
                        </div>

                        <!-- Cart Items -->
                        ${cart.map(item => `
                            <div class="fk-cart-item">
                                <div class="fk-cart-item-img-col">
                                    <img src="${item.product.image}" alt="${item.product.title}" class="fk-cart-item-img" onclick="window.Store.setView('detail', { productId: '${item.product.id}' })">
                                    <div class="fk-qty-stepper">
                                        <button class="fk-qty-btn" onclick="window.Store.updateCartQuantity('${item.product.id}', ${item.quantity - 1})">-</button>
                                        <div class="fk-qty-val">${item.quantity}</div>
                                        <button class="fk-qty-btn" onclick="window.Store.updateCartQuantity('${item.product.id}', ${item.quantity + 1})">+</button>
                                    </div>
                                </div>

                                <div class="fk-cart-item-details">
                                    <div class="fk-cart-item-title" onclick="window.Store.setView('detail', { productId: '${item.product.id}' })">
                                        ${item.product.title}
                                    </div>
                                    <div class="fk-cart-seller">
                                        Seller: SuperComNet ${item.product.isAssured ? '• <span class="fk-assured-logo">⚡Assured</span>' : ''}
                                    </div>
                                    
                                    <div class="fk-cart-price-row">
                                        <span class="fk-cart-price">${formatRupee(item.product.price * item.quantity)}</span>
                                        <span class="fk-cart-original">${formatRupee(item.product.originalPrice * item.quantity)}</span>
                                        <span class="fk-cart-discount">${item.product.discount}% Off</span>
                                    </div>

                                    <div class="fk-cart-actions">
                                        <button class="fk-cart-action-btn" onclick="window.App.saveForLater('${item.product.id}')">SAVE FOR LATER</button>
                                        <button class="fk-cart-action-btn" onclick="window.Store.removeFromCart('${item.product.id}')">REMOVE</button>
                                    </div>
                                </div>
                            </div>
                        `).join("")}

                        <!-- Place Order Sticky Footer -->
                        <div class="fk-cart-place-order-bar">
                            <button class="fk-btn-place-order" onclick="window.Store.setView('checkout')">
                                PLACE ORDER
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Right: Price Details Sticky Card -->
                <div class="fk-cart-right">
                    <div class="fk-price-details-card">
                        <div class="fk-price-details-header">Price Details</div>
                        <div class="fk-price-breakdown">
                            <div class="fk-price-row">
                                <span>Price (${totals.totalItems} ${totals.totalItems === 1 ? 'item' : 'items'})</span>
                                <span>${formatRupee(totals.totalMRP)}</span>
                            </div>
                            <div class="fk-price-row discount-row">
                                <span>Discount</span>
                                <span>-${formatRupee(totals.discount)}</span>
                            </div>
                            <div class="fk-price-row ${totals.deliveryCharge === 0 ? 'free-row' : ''}">
                                <span>Delivery Charges</span>
                                <span>${totals.deliveryCharge === 0 ? '<span style="text-decoration: line-through; color: #878787; margin-right: 4px;">₹40</span> FREE' : '₹40'}</span>
                            </div>
                            <div class="fk-price-row">
                                <span>Secured Packaging Fee</span>
                                <span>₹${totals.packagingFee}</span>
                            </div>
                        </div>

                        <div class="fk-price-total-row">
                            <span>Total Amount</span>
                            <span>${formatRupee(totals.finalAmount)}</span>
                        </div>

                        <div class="fk-savings-banner">
                            You will save ${formatRupee(totals.totalSavings)} on this order
                        </div>
                    </div>

                    <div class="fk-trust-badge">
                        <span>🛡️</span>
                        <span>Safe and Secure Payments. Easy returns. 100% Authentic products.</span>
                    </div>
                </div>
            </div>
        `;
    }

    window.CartView = {
        render: renderCart
    };
})();
