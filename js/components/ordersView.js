// Orders View Component - Flipkart My Orders Dashboard with Interactive Delivery Tracker
(function () {
    function renderOrders(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const orders = window.Store.state.orders || [];

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="fk-no-results">
                    <div class="fk-no-results-icon">📦</div>
                    <h2>No Orders Found</h2>
                    <p style="color: var(--fk-text-secondary); margin: 10px 0 20px;">You haven't placed any orders yet.</p>
                    <button class="fk-btn-shop-now" onclick="window.Store.setView('home')">Start Shopping</button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="fk-orders-header">
                My Orders (${orders.length})
            </div>

            <div class="fk-orders-list">
                ${orders.map(order => {
                    const statusCode = order.statusCode || 1;
                    const fillPercentage = statusCode === 1 ? 0 : statusCode === 2 ? 33 : statusCode === 3 ? 66 : 100;

                    return `
                        <div class="fk-order-card" data-order-id="${order.id}">
                            <div class="fk-order-card-top">
                                <div>
                                    <span style="color: var(--fk-text-secondary);">Order ID:</span>
                                    <strong>${order.id}</strong>
                                    <span style="color: var(--fk-text-secondary); margin-left: 12px;">Placed on: ${order.date}</span>
                                </div>
                                <div>
                                    <span style="color: var(--fk-text-secondary);">Total:</span>
                                    <strong style="color: var(--fk-blue);">${window.ProductCard.formatRupee(order.totalAmount)}</strong>
                                    <span style="color: var(--fk-text-secondary); margin-left: 8px;">(${order.paymentMethod})</span>
                                </div>
                            </div>

                            <div class="fk-order-card-body">
                                <!-- Order Items List -->
                                ${order.items.map(item => `
                                    <div class="fk-order-item-row">
                                        <img src="${item.product.image}" class="fk-order-item-img" alt="${item.product.title}" onclick="window.Store.setView('detail', { productId: '${item.product.id}' })" style="cursor: pointer;">
                                        <div style="flex: 1;">
                                            <div style="font-weight: 600; font-size: 15px; margin-bottom: 4px; cursor: pointer;" onclick="window.Store.setView('detail', { productId: '${item.product.id}' })">
                                                ${item.product.title}
                                            </div>
                                            <div style="font-size: 13px; color: var(--fk-text-secondary);">
                                                Qty: ${item.quantity} • Price: ${window.ProductCard.formatRupee(item.product.price * item.quantity)}
                                            </div>
                                            <div style="font-size: 12px; color: var(--fk-green); font-weight: 600; margin-top: 4px;">
                                                Status: ${order.status}
                                            </div>
                                        </div>
                                    </div>
                                `).join("")}

                                <!-- Visual Delivery Tracker -->
                                <div class="fk-tracker-container">
                                    <div class="fk-tracker-title">
                                        <span>Delivery Tracker</span>
                                        <span style="color: var(--fk-blue); font-weight: 600;">Current Stage: ${order.status}</span>
                                    </div>

                                    <div class="fk-tracker-stepper">
                                        <div class="fk-tracker-line">
                                            <div class="fk-tracker-line-fill" style="width: ${fillPercentage}%;"></div>
                                        </div>

                                        <div class="fk-tracker-step ${statusCode >= 1 ? 'completed' : ''}">
                                            <div class="fk-step-circle">1</div>
                                            <div class="fk-step-name">Ordered</div>
                                            <div class="fk-step-date">Confirmed</div>
                                        </div>

                                        <div class="fk-tracker-step ${statusCode >= 2 ? 'completed' : statusCode === 1 ? 'active' : ''}">
                                            <div class="fk-step-circle">2</div>
                                            <div class="fk-step-name">Packed</div>
                                            <div class="fk-step-date">${statusCode >= 2 ? 'Done' : 'Processing'}</div>
                                        </div>

                                        <div class="fk-tracker-step ${statusCode >= 3 ? 'completed' : statusCode === 2 ? 'active' : ''}">
                                            <div class="fk-step-circle">3</div>
                                            <div class="fk-step-name">Shipped</div>
                                            <div class="fk-step-date">${statusCode >= 3 ? 'In Transit' : 'Pending'}</div>
                                        </div>

                                        <div class="fk-tracker-step ${statusCode >= 4 ? 'completed' : statusCode === 3 ? 'active' : ''}">
                                            <div class="fk-step-circle">4</div>
                                            <div class="fk-step-name">Delivered</div>
                                            <div class="fk-step-date">${statusCode >= 4 ? 'Delivered' : 'Expected'}</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Action Buttons & College Demo Trigger -->
                                <div class="fk-order-card-actions">
                                    <div style="font-size: 13px; color: var(--fk-text-secondary);">
                                        Deliver to: <strong>${order.address ? order.address.name : 'Resident'}</strong> (${order.address ? order.address.pincode : '110001'})
                                    </div>

                                    <div style="display: flex; gap: 10px; align-items: center;">
                                        ${statusCode < 4 ? `
                                            <button class="fk-btn-simulate-step" onclick="window.Store.advanceOrderStatus('${order.id}'); window.OrdersView.render('main-view-container');" title="Advance status for presentation">
                                                ⚡ Simulate Next Stage (${statusCode === 1 ? 'Pack' : statusCode === 2 ? 'Ship' : 'Deliver'})
                                            </button>
                                        ` : `
                                            <span style="font-size: 12px; color: var(--fk-green); font-weight: 700;">✓ Delivered</span>
                                        `}
                                        <button class="fk-btn-change-addr" onclick="window.OrdersView.showInvoice('${order.id}')">
                                            📄 View Invoice
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    }

    function showInvoice(orderId) {
        const order = window.Store.state.orders.find(o => o.id === orderId);
        if (!order) return;

        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            alert("Please allow popups to view the invoice.");
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Flipkart Tax Invoice - ${order.id}</title>
                <style>
                    body { font-family: 'Roboto', sans-serif, Arial; padding: 40px; color: #212121; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2874f0; padding-bottom: 20px; }
                    .logo { font-size: 28px; font-weight: 800; font-style: italic; color: #2874f0; }
                    .table { width: 100%; border-collapse: collapse; margin: 30px 0; }
                    .table th, .table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    .table th { background: #f5f5f5; }
                    .totals { float: right; width: 300px; }
                    .totals div { display: flex; justify-content: space-between; padding: 6px 0; }
                    .grand { font-size: 18px; font-weight: 800; border-top: 2px solid #000; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="logo">Flipkart <i>Plus</i></div>
                        <p style="margin-top: 4px; font-size: 13px;">Retail India Pvt Ltd - Tax Invoice</p>
                    </div>
                    <div style="text-align: right; font-size: 13px;">
                        <strong>Invoice / Order ID:</strong> ${order.id}<br>
                        <strong>Order Date:</strong> ${order.date}<br>
                        <strong>Payment:</strong> ${order.paymentMethod}
                    </div>
                </div>

                <div style="margin: 20px 0; font-size: 13px;">
                    <strong>Billing & Delivery Address:</strong><br>
                    ${order.address.name}<br>
                    ${order.address.address}, ${order.address.locality}<br>
                    ${order.address.city}, ${order.address.state} - ${order.address.pincode}<br>
                    Phone: ${order.address.phone}
                </div>

                <table class="table">
                    <thead>
                        <tr>
                            <th>Item Description</th>
                            <th>Qty</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.product.title}</td>
                                <td>${item.quantity}</td>
                                <td>${window.ProductCard.formatRupee(item.product.price)}</td>
                                <td>${window.ProductCard.formatRupee(item.product.price * item.quantity)}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>

                <div class="totals">
                    <div><span>Subtotal:</span> <span>${window.ProductCard.formatRupee(order.totalAmount)}</span></div>
                    <div><span>Shipping:</span> <span style="color: green;">FREE</span></div>
                    <div class="grand"><span>Total Paid:</span> <span>${window.ProductCard.formatRupee(order.totalAmount)}</span></div>
                </div>

                <div style="clear: both; margin-top: 60px; font-size: 12px; color: #777; text-align: center;">
                    This is a computer generated invoice for Flipkart Clone College Project demo.
                </div>

                <script>window.onload = function() { window.print(); };</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    window.OrdersView = {
        render: renderOrders,
        showInvoice
    };
})();
