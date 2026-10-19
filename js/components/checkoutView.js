// Checkout View Component - Multi-step Flipkart Checkout Flow
(function () {
    let currentStep = 2; // 1: Login, 2: Address, 3: Order Summary, 4: Payment
    let selectedPayment = "upi";
    let generatedCaptcha = "8429";

    function generateRandomCaptcha() {
        generatedCaptcha = Math.floor(1000 + Math.random() * 9000).toString();
        const captchaEl = document.getElementById("cod-captcha-display");
        if (captchaEl) captchaEl.textContent = generatedCaptcha;
    }

    function setStep(stepNum) {
        currentStep = stepNum;
        renderCheckout("main-view-container");
    }

    function selectPaymentMethod(method) {
        selectedPayment = method;
        document.querySelectorAll(".fk-payment-item").forEach(item => {
            item.classList.toggle("active", item.dataset.method === method);
        });
        if (method === "cod") {
            generateRandomCaptcha();
        }
    }

    function renderCheckout(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const state = window.Store.state;
        const cart = state.cart;
        const totals = window.Store.getCartTotals();
        const user = state.user || { name: "Guest User", phone: "9876543210" };
        const selectedAddress = state.addresses.find(a => a.id === state.selectedAddressId) || state.addresses[0];

        if (cart.length === 0) {
            container.innerHTML = `
                <div class="fk-no-results">
                    <h2>Your cart is empty!</h2>
                    <p style="color: var(--fk-text-secondary); margin: 10px 0 20px;">Please add items to cart before proceeding to checkout.</p>
                    <button class="fk-btn-shop-now" onclick="window.Store.setView('home')">Return to Shopping</button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="fk-checkout-layout">
                <!-- Left: Multi-step Accordion -->
                <div class="fk-checkout-steps">
                    
                    <!-- STEP 1: LOGIN -->
                    <div class="fk-step-card">
                        <div class="fk-step-header ${currentStep === 1 ? 'active' : ''}">
                            <div class="fk-step-num">1</div>
                            <div class="fk-step-title">LOGIN</div>
                            <div class="fk-step-summary">✓ ${user.name} (${user.phone})</div>
                        </div>
                    </div>

                    <!-- STEP 2: DELIVERY ADDRESS -->
                    <div class="fk-step-card">
                        <div class="fk-step-header ${currentStep === 2 ? 'active' : ''}" onclick="window.CheckoutView.setStep(2)" style="cursor: pointer;">
                            <div class="fk-step-num">2</div>
                            <div class="fk-step-title">DELIVERY ADDRESS</div>
                            ${currentStep > 2 && selectedAddress ? `<div class="fk-step-summary">✓ ${selectedAddress.name}, ${selectedAddress.pincode}</div>` : ''}
                        </div>

                        ${currentStep === 2 ? `
                            <div class="fk-step-body">
                                <div class="fk-address-list">
                                    ${state.addresses.map(addr => `
                                        <div class="fk-address-radio-card ${addr.id === state.selectedAddressId ? 'selected' : ''}" onclick="window.Store.setSelectedAddress('${addr.id}'); window.CheckoutView.setStep(2);">
                                            <input type="radio" name="checkout_addr" ${addr.id === state.selectedAddressId ? 'checked' : ''}>
                                            <div style="flex: 1;">
                                                <div style="font-weight: 700; margin-bottom: 4px;">
                                                    ${addr.name} 
                                                    <span class="fk-addr-type-pill">${addr.type}</span>
                                                    <span style="font-weight: 500; margin-left: 10px;">${addr.phone}</span>
                                                </div>
                                                <div style="font-size: 13px; color: var(--fk-text-primary); line-height: 1.4;">
                                                    ${addr.address}, ${addr.locality}, ${addr.city}, ${addr.state} - <strong>${addr.pincode}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    `).join("")}
                                </div>

                                <div style="display: flex; gap: 12px; margin-top: 16px;">
                                    <button class="fk-btn-continue" style="margin-bottom: 0;" onclick="window.CheckoutView.setStep(3)">
                                        DELIVER HERE
                                    </button>
                                    <button class="fk-btn-change-addr" onclick="window.App.openAddressModal()">
                                        + Add New Address
                                    </button>
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <!-- STEP 3: ORDER SUMMARY -->
                    <div class="fk-step-card">
                        <div class="fk-step-header ${currentStep === 3 ? 'active' : ''}" onclick="window.CheckoutView.setStep(3)" style="cursor: pointer;">
                            <div class="fk-step-num">3</div>
                            <div class="fk-step-title">ORDER SUMMARY</div>
                            ${currentStep > 3 ? `<div class="fk-step-summary">✓ ${cart.length} ${cart.length === 1 ? 'item' : 'items'}</div>` : ''}
                        </div>

                        ${currentStep === 3 ? `
                            <div class="fk-step-body">
                                ${cart.map(item => `
                                    <div class="fk-order-item-row" style="margin-bottom: 12px; padding-bottom: 12px;">
                                        <img src="${item.product.image}" class="fk-order-item-img" alt="${item.product.title}">
                                        <div style="flex: 1;">
                                            <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">${item.product.title}</div>
                                            <div style="font-size: 12px; color: var(--fk-text-secondary); margin-bottom: 6px;">
                                                Qty: ${item.quantity} • Seller: SuperComNet
                                            </div>
                                            <div style="font-size: 15px; font-weight: 700;">
                                                ${window.ProductCard.formatRupee(item.product.price * item.quantity)}
                                                <span style="font-size: 12px; color: var(--fk-green); margin-left: 8px;">${item.product.discount}% Off</span>
                                            </div>
                                        </div>
                                        <div style="font-size: 12px; color: var(--fk-green); font-weight: 600;">
                                            Delivery by Tomorrow, 11 PM
                                        </div>
                                    </div>
                                `).join("")}

                                <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
                                    <button class="fk-btn-continue" style="margin-bottom: 0;" onclick="window.CheckoutView.setStep(4)">
                                        CONTINUE TO PAYMENT
                                    </button>
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <!-- STEP 4: PAYMENT OPTIONS -->
                    <div class="fk-step-card">
                        <div class="fk-step-header ${currentStep === 4 ? 'active' : ''}">
                            <div class="fk-step-num">4</div>
                            <div class="fk-step-title">PAYMENT OPTIONS</div>
                        </div>

                        ${currentStep === 4 ? `
                            <div class="fk-step-body">
                                <div class="fk-payment-options">
                                    
                                    <!-- UPI Option -->
                                    <div class="fk-payment-item ${selectedPayment === 'upi' ? 'active' : ''}" data-method="upi" onclick="window.CheckoutView.selectPaymentMethod('upi')">
                                        <div class="fk-payment-label-row">
                                            <input type="radio" name="pay_method" ${selectedPayment === 'upi' ? 'checked' : ''}>
                                            <span>UPI (Google Pay, PhonePe, Paytm, QR)</span>
                                            <span style="margin-left: auto; font-size: 12px; color: var(--fk-green); font-weight: 700;">Instant Offer</span>
                                        </div>
                                        <div class="fk-payment-content">
                                            <div class="fk-upi-qr-box">
                                                <p style="font-size: 13px; font-weight: 600;">Scan QR Code using any UPI App</p>
                                                <!-- High quality demo QR image -->
                                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=flipkartdemo@bank&pn=Flipkart&am=${totals.finalAmount}&cu=INR" alt="UPI QR Code" class="fk-qr-code-img">
                                                <p style="font-size: 12px; color: var(--fk-text-secondary);">or enter your UPI ID (e.g. yourname@okaxis)</p>
                                                <input type="text" placeholder="username@upi" style="padding: 8px 12px; border: 1px solid var(--fk-border); border-radius: 4px; width: 220px; font-size: 13px;">
                                                <button class="fk-btn-continue" style="margin-top: 10px; width: 220px;" onclick="window.CheckoutView.confirmOrder('UPI')">
                                                    PAY ${window.ProductCard.formatRupee(totals.finalAmount)}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Credit / Debit Card Option -->
                                    <div class="fk-payment-item ${selectedPayment === 'card' ? 'active' : ''}" data-method="card" onclick="window.CheckoutView.selectPaymentMethod('card')">
                                        <div class="fk-payment-label-row">
                                            <input type="radio" name="pay_method" ${selectedPayment === 'card' ? 'checked' : ''}>
                                            <span>Credit / Debit / ATM Card</span>
                                        </div>
                                        <div class="fk-payment-content">
                                            <div style="max-width: 380px; display: flex; flex-direction: column; gap: 12px;">
                                                <input type="text" placeholder="Card Number (XXXX XXXX XXXX XXXX)" maxlength="19" value="4532 8921 7842 1092" style="padding: 10px; border: 1px solid var(--fk-border); border-radius: 4px;">
                                                <div style="display: flex; gap: 10px;">
                                                    <input type="text" placeholder="MM/YY" maxlength="5" value="12/28" style="flex: 1; padding: 10px; border: 1px solid var(--fk-border); border-radius: 4px;">
                                                    <input type="password" placeholder="CVV" maxlength="3" value="789" style="flex: 1; padding: 10px; border: 1px solid var(--fk-border); border-radius: 4px;">
                                                </div>
                                                <button class="fk-btn-continue" style="margin-top: 6px;" onclick="window.CheckoutView.confirmOrder('Credit Card')">
                                                    PAY ${window.ProductCard.formatRupee(totals.finalAmount)}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Net Banking Option -->
                                    <div class="fk-payment-item ${selectedPayment === 'netbanking' ? 'active' : ''}" data-method="netbanking" onclick="window.CheckoutView.selectPaymentMethod('netbanking')">
                                        <div class="fk-payment-label-row">
                                            <input type="radio" name="pay_method" ${selectedPayment === 'netbanking' ? 'checked' : ''}>
                                            <span>Net Banking (SBI, HDFC, ICICI, Axis)</span>
                                        </div>
                                        <div class="fk-payment-content">
                                            <div style="display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap;">
                                                <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer;">
                                                    <input type="radio" name="bank" checked> HDFC Bank
                                                </label>
                                                <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer;">
                                                    <input type="radio" name="bank"> State Bank of India
                                                </label>
                                                <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer;">
                                                    <input type="radio" name="bank"> ICICI Bank
                                                </label>
                                            </div>
                                            <button class="fk-btn-continue" onclick="window.CheckoutView.confirmOrder('Net Banking (HDFC)')">
                                                PAY ${window.ProductCard.formatRupee(totals.finalAmount)}
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Cash on Delivery (COD) Option -->
                                    <div class="fk-payment-item ${selectedPayment === 'cod' ? 'active' : ''}" data-method="cod" onclick="window.CheckoutView.selectPaymentMethod('cod')">
                                        <div class="fk-payment-label-row">
                                            <input type="radio" name="pay_method" ${selectedPayment === 'cod' ? 'checked' : ''}>
                                            <span>Cash on Delivery (COD)</span>
                                        </div>
                                        <div class="fk-payment-content">
                                            <p style="font-size: 13px; color: var(--fk-text-secondary); margin-bottom: 10px;">
                                                Enter characters shown below to confirm your Cash on Delivery order:
                                            </p>
                                            <div class="fk-captcha-row">
                                                <div id="cod-captcha-display" class="fk-captcha-badge">${generatedCaptcha}</div>
                                                <button type="button" onclick="window.CheckoutView.generateRandomCaptcha()" style="background: none; font-size: 13px; color: var(--fk-blue); font-weight: 600;">🔄 Reload</button>
                                            </div>
                                            <div style="display: flex; gap: 10px; max-width: 300px;">
                                                <input type="text" id="cod-captcha-input" placeholder="Enter Captcha Code" maxlength="4" style="padding: 10px; border: 1px solid var(--fk-border); border-radius: 4px; width: 140px; font-size: 14px;">
                                                <button class="fk-btn-continue" style="margin-bottom: 0;" onclick="window.CheckoutView.validateCOD()">
                                                    CONFIRM ORDER
                                                </button>
                                            </div>
                                            <div id="cod-err-msg" style="color: #d32f2f; font-size: 12px; margin-top: 6px; display: none;">Invalid captcha code. Please try again.</div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ` : ''}
                    </div>

                </div>

                <!-- Right: Price Details -->
                <div class="fk-cart-right">
                    <div class="fk-price-details-card">
                        <div class="fk-price-details-header">Price Details</div>
                        <div class="fk-price-breakdown">
                            <div class="fk-price-row">
                                <span>Price (${totals.totalItems} items)</span>
                                <span>${window.ProductCard.formatRupee(totals.totalMRP)}</span>
                            </div>
                            <div class="fk-price-row discount-row">
                                <span>Discount</span>
                                <span>-${window.ProductCard.formatRupee(totals.discount)}</span>
                            </div>
                            <div class="fk-price-row ${totals.deliveryCharge === 0 ? 'free-row' : ''}">
                                <span>Delivery Charges</span>
                                <span>${totals.deliveryCharge === 0 ? 'FREE' : '₹40'}</span>
                            </div>
                            <div class="fk-price-row">
                                <span>Secured Packaging Fee</span>
                                <span>₹${totals.packagingFee}</span>
                            </div>
                        </div>

                        <div class="fk-price-total-row">
                            <span>Total Payable</span>
                            <span>${window.ProductCard.formatRupee(totals.finalAmount)}</span>
                        </div>

                        <div class="fk-savings-banner">
                            You will save ${window.ProductCard.formatRupee(totals.totalSavings)} on this order
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function validateCOD() {
        const input = document.getElementById("cod-captcha-input");
        const errMsg = document.getElementById("cod-err-msg");
        if (!input) return;

        if (input.value.trim() === generatedCaptcha) {
            confirmOrder("Cash on Delivery");
        } else {
            if (errMsg) errMsg.style.display = "block";
            generateRandomCaptcha();
        }
    }

    function confirmOrder(paymentMethod) {
        const order = window.Store.placeOrder(paymentMethod);
        if (!order) return;

        renderSuccessScreen(order);
    }

    function renderSuccessScreen(order) {
        const container = document.getElementById("main-view-container");
        if (!container) return;

        container.innerHTML = `
            <div class="fk-order-success-card">
                <div class="fk-success-icon">✓</div>
                <h1 class="fk-success-title">Order Placed Successfully!</h1>
                <p style="color: var(--fk-text-secondary); margin-bottom: 12px;">Confirmation SMS and invoice have been sent to your registered details.</p>
                
                <div class="fk-order-id-badge">Order ID: <strong>${order.id}</strong></div>

                <div style="background: #f7f9fa; border: 1px solid var(--fk-border-light); border-radius: 4px; padding: 20px; text-align: left; margin-bottom: 24px;">
                    <div style="font-weight: 700; margin-bottom: 8px;">Delivery Details:</div>
                    <div style="font-size: 13px; line-height: 1.5; color: var(--fk-text-primary);">
                        <strong>${order.address.name}</strong> • ${order.address.phone}<br>
                        ${order.address.address}, ${order.address.locality}, ${order.address.city} - ${order.address.pincode}<br>
                        <strong>Payment Method:</strong> ${order.paymentMethod}<br>
                        <strong>Total Amount Paid:</strong> ${window.ProductCard.formatRupee(order.totalAmount)}
                    </div>
                </div>

                <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
                    <button class="fk-btn-continue" style="margin-bottom: 0;" onclick="window.Store.setView('orders')">
                        📦 Track Order in "My Orders"
                    </button>
                    <button class="fk-btn-change-addr" onclick="window.print()">
                        🖨️ Print / Download Invoice
                    </button>
                    <button class="fk-btn-change-addr" onclick="window.Store.setView('home')">
                        Continue Shopping
                    </button>
                </div>
            </div>
        `;
    }

    window.CheckoutView = {
        render: renderCheckout,
        setStep,
        selectPaymentMethod,
        generateRandomCaptcha,
        validateCOD,
        confirmOrder
    };
})();
