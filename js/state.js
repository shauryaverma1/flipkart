// Central State Management for Flipkart Clone with LocalStorage Persistence
(function () {
    const STORAGE_KEYS = {
        CART: "flipkart_cart_items",
        WISHLIST: "flipkart_wishlist_items",
        ORDERS: "flipkart_user_orders",
        USER: "flipkart_user_profile",
        ADDRESSES: "flipkart_saved_addresses"
    };

    // Default sample addresses for smooth college demo
    const DEFAULT_ADDRESSES = [
        {
            id: "addr-1",
            name: "Ananya Verma",
            phone: "9876543210",
            pincode: "110001",
            locality: "Connaught Place",
            address: "Flat 402, Block B, Campus Towers",
            city: "New Delhi",
            state: "Delhi",
            landmark: "Near Central Metro Station",
            type: "Home",
            isDefault: true
        },
        {
            id: "addr-2",
            name: "Ananya Verma (College)",
            phone: "9876543210",
            pincode: "110016",
            locality: "Hauz Khas",
            address: "Department of Computer Science & Engineering, Tech Campus",
            city: "New Delhi",
            state: "Delhi",
            landmark: "Gate No. 3",
            type: "Work",
            isDefault: false
        }
    ];

    // Default mock orders to make the "My Orders" tab look populated right away!
    const DEFAULT_ORDERS = [
        {
            id: "OD" + Math.floor(1000000000 + Math.random() * 9000000000),
            date: "14 Oct 2024, 02:45 PM",
            status: "Delivered",
            statusCode: 4, // 1: Placed, 2: Packed, 3: Shipped, 4: Delivered
            deliveredDate: "Delivered on Sun, 16 Oct 2024",
            items: [
                {
                    product: window.FLIPKART_PRODUCTS.find(p => p.id === "prod-5") || window.FLIPKART_PRODUCTS[4],
                    quantity: 1,
                    price: 26990
                }
            ],
            totalAmount: 26990,
            originalTotal: 34990,
            savings: 8000,
            paymentMethod: "UPI (Google Pay)",
            address: DEFAULT_ADDRESSES[0],
            trackingTimeline: [
                { step: "Order Placed", desc: "Your order has been placed.", date: "14 Oct 2024", done: true },
                { step: "Packed", desc: "Seller has processed your order.", date: "15 Oct 2024", done: true },
                { step: "Shipped", desc: "Ekart Logistics - Shipped from Bengaluru Hub", date: "15 Oct 2024", done: true },
                { step: "Delivered", desc: "Delivered to resident", date: "16 Oct 2024", done: true }
            ]
        }
    ];

    class Store {
        constructor() {
            this.listeners = [];
            this.state = {
                currentView: "home", // home, catalog, detail, cart, checkout, orders, wishlist
                selectedProductId: null,
                searchQuery: "",
                selectedCategory: "all",
                filters: {
                    brands: [],
                    maxPrice: 150000,
                    minRating: 0,
                    assuredOnly: false,
                    sortBy: "relevance"
                },
                cart: this._loadFromStorage(STORAGE_KEYS.CART, []),
                wishlist: this._loadFromStorage(STORAGE_KEYS.WISHLIST, ["prod-1", "prod-8"]),
                orders: this._loadFromStorage(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS),
                user: this._loadFromStorage(STORAGE_KEYS.USER, {
                    name: "Ananya Verma",
                    phone: "9876543210",
                    email: "ananya.verma@college.edu",
                    isPlusMember: true,
                    coins: 145
                }),
                addresses: this._loadFromStorage(STORAGE_KEYS.ADDRESSES, DEFAULT_ADDRESSES),
                selectedAddressId: "addr-1"
            };
        }

        _loadFromStorage(key, fallback) {
            try {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : fallback;
            } catch (e) {
                console.warn("Storage load error:", e);
                return fallback;
            }
        }

        _saveToStorage(key, val) {
            try {
                localStorage.setItem(key, JSON.stringify(val));
            } catch (e) {
                console.warn("Storage save error:", e);
            }
        }

        subscribe(listener) {
            this.listeners.push(listener);
            return () => {
                this.listeners = this.listeners.filter(l => l !== listener);
            };
        }

        notify(eventType, payload) {
            this.listeners.forEach(fn => fn(this.state, eventType, payload));
        }

        // Navigation
        setView(viewName, payload = null) {
            this.state.currentView = viewName;
            if (payload && payload.productId) {
                this.state.selectedProductId = payload.productId;
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
            this.notify("VIEW_CHANGED", { view: viewName, payload });
        }

        // Search & Category
        setSearch(query) {
            this.state.searchQuery = query;
            if (this.state.currentView !== "catalog") {
                this.state.currentView = "catalog";
            }
            this.notify("SEARCH_UPDATED", query);
        }

        setCategory(categoryId) {
            this.state.selectedCategory = categoryId;
            this.state.searchQuery = "";
            this.state.filters.brands = [];
            if (this.state.currentView !== "catalog") {
                this.state.currentView = "catalog";
            }
            this.notify("CATEGORY_UPDATED", categoryId);
        }

        setFilters(newFilters) {
            this.state.filters = { ...this.state.filters, ...newFilters };
            this.notify("FILTERS_UPDATED", this.state.filters);
        }

        resetFilters() {
            this.state.filters = {
                brands: [],
                maxPrice: 150000,
                minRating: 0,
                assuredOnly: false,
                sortBy: "relevance"
            };
            this.notify("FILTERS_RESET", this.state.filters);
        }

        // Cart Actions
        addToCart(productId, quantity = 1) {
            const product = window.FLIPKART_PRODUCTS.find(p => p.id === productId);
            if (!product) return;

            const existingIndex = this.state.cart.findIndex(item => item.product.id === productId);
            if (existingIndex > -1) {
                this.state.cart[existingIndex].quantity += quantity;
            } else {
                this.state.cart.push({
                    product,
                    quantity: quantity,
                    addedAt: new Date().toISOString()
                });
            }
            this._saveToStorage(STORAGE_KEYS.CART, this.state.cart);
            this.notify("CART_UPDATED", this.state.cart);
        }

        updateCartQuantity(productId, quantity) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
                return;
            }
            const item = this.state.cart.find(i => i.product.id === productId);
            if (item) {
                item.quantity = quantity;
                this._saveToStorage(STORAGE_KEYS.CART, this.state.cart);
                this.notify("CART_UPDATED", this.state.cart);
            }
        }

        removeFromCart(productId) {
            this.state.cart = this.state.cart.filter(i => i.product.id !== productId);
            this._saveToStorage(STORAGE_KEYS.CART, this.state.cart);
            this.notify("CART_UPDATED", this.state.cart);
        }

        clearCart() {
            this.state.cart = [];
            this._saveToStorage(STORAGE_KEYS.CART, this.state.cart);
            this.notify("CART_UPDATED", this.state.cart);
        }

        getCartTotals() {
            let totalItems = 0;
            let totalPrice = 0; // selling price sum
            let totalMRP = 0;   // original price sum

            this.state.cart.forEach(item => {
                totalItems += item.quantity;
                totalPrice += item.product.price * item.quantity;
                totalMRP += item.product.originalPrice * item.quantity;
            });

            const discount = totalMRP - totalPrice;
            // Flipkart free delivery for Plus / orders > ₹500
            const deliveryCharge = (totalPrice > 500 || (this.state.user && this.state.user.isPlusMember)) ? 0 : 40;
            const packagingFee = totalPrice > 0 ? 49 : 0;
            const finalAmount = totalPrice + deliveryCharge + packagingFee;

            return {
                totalItems,
                totalPrice,
                totalMRP,
                discount,
                deliveryCharge,
                packagingFee,
                finalAmount,
                totalSavings: discount + (deliveryCharge === 0 && totalPrice > 0 ? 40 : 0)
            };
        }

        // Wishlist Actions
        toggleWishlist(productId) {
            const index = this.state.wishlist.indexOf(productId);
            if (index > -1) {
                this.state.wishlist.splice(index, 1);
            } else {
                this.state.wishlist.push(productId);
            }
            this._saveToStorage(STORAGE_KEYS.WISHLIST, this.state.wishlist);
            this.notify("WISHLIST_UPDATED", this.state.wishlist);
        }

        isInWishlist(productId) {
            return this.state.wishlist.includes(productId);
        }

        // Orders & Checkout
        placeOrder(paymentMethod) {
            const totals = this.getCartTotals();
            if (this.state.cart.length === 0) return null;

            const selectedAddress = this.state.addresses.find(a => a.id === this.state.selectedAddressId) || this.state.addresses[0];

            const newOrder = {
                id: "OD" + Math.floor(1000000000 + Math.random() * 9000000000),
                date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
                status: "Order Placed",
                statusCode: 1, // 1: Placed, 2: Packed, 3: Shipped, 4: Delivered
                expectedDelivery: "Delivery by " + new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" }),
                items: [...this.state.cart],
                totalAmount: totals.finalAmount,
                originalTotal: totals.totalMRP,
                savings: totals.totalSavings,
                paymentMethod: paymentMethod || "Cash on Delivery",
                address: selectedAddress,
                trackingTimeline: [
                    { step: "Order Placed", desc: "Your order has been placed successfully.", date: "Just now", done: true },
                    { step: "Packed", desc: "Item will be inspected and packed.", date: "Expected Tomorrow", done: false },
                    { step: "Shipped", desc: "Will be dispatched via Ekart Express.", date: "Expected in 2 days", done: false },
                    { step: "Delivered", desc: "Delivery to your address.", date: "Expected in 2-3 days", done: false }
                ]
            };

            this.state.orders.unshift(newOrder);
            this._saveToStorage(STORAGE_KEYS.ORDERS, this.state.orders);
            this.clearCart();
            this.notify("ORDER_PLACED", newOrder);
            return newOrder;
        }

        // Advance order tracking stage (demo feature for professor presentation!)
        advanceOrderStatus(orderId) {
            const order = this.state.orders.find(o => o.id === orderId);
            if (!order) return;

            if (order.statusCode < 4) {
                order.statusCode += 1;
                const statusNames = ["Order Placed", "Packed", "Shipped", "Delivered"];
                order.status = statusNames[order.statusCode - 1];
                order.trackingTimeline[order.statusCode - 1].done = true;
                order.trackingTimeline[order.statusCode - 1].date = "Updated Today";
                this._saveToStorage(STORAGE_KEYS.ORDERS, this.state.orders);
                this.notify("ORDER_UPDATED", order);
            }
        }

        // User Auth
        setUser(userData) {
            this.state.user = userData;
            this._saveToStorage(STORAGE_KEYS.USER, userData);
            this.notify("USER_UPDATED", userData);
        }

        logout() {
            this.state.user = null;
            this._saveToStorage(STORAGE_KEYS.USER, null);
            this.notify("USER_UPDATED", null);
        }

        // Addresses
        addAddress(addressData) {
            const id = "addr-" + Date.now();
            const newAddr = { ...addressData, id };
            if (newAddr.isDefault) {
                this.state.addresses.forEach(a => a.isDefault = false);
            }
            this.state.addresses.push(newAddr);
            this.state.selectedAddressId = id;
            this._saveToStorage(STORAGE_KEYS.ADDRESSES, this.state.addresses);
            this.notify("ADDRESSES_UPDATED", this.state.addresses);
        }

        setSelectedAddress(id) {
            this.state.selectedAddressId = id;
            this.notify("ADDRESS_SELECTED", id);
        }
    }

    window.Store = new Store();
})();
