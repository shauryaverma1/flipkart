// Address Modal Component - Add / Manage Delivery Addresses
(function () {
    function openModal() {
        const modal = document.getElementById("address-modal-overlay");
        if (modal) modal.classList.add("active");
    }

    function closeModal() {
        const modal = document.getElementById("address-modal-overlay");
        if (modal) modal.classList.remove("active");
    }

    function handleSaveAddress(e) {
        if (e) e.preventDefault();

        const name = document.getElementById("addr-name").value.trim();
        const phone = document.getElementById("addr-phone").value.trim();
        const pincode = document.getElementById("addr-pincode").value.trim();
        const locality = document.getElementById("addr-locality").value.trim();
        const address = document.getElementById("addr-street").value.trim();
        const city = document.getElementById("addr-city").value.trim();
        const state = document.getElementById("addr-state").value.trim();
        const type = document.querySelector('input[name="addr_type"]:checked') ? document.querySelector('input[name="addr_type"]:checked').value : "Home";

        if (!name || !phone || !pincode || !address) {
            window.App.showToast("Please fill in all required address fields.");
            return;
        }

        window.Store.addAddress({
            name,
            phone,
            pincode,
            locality: locality || "Central",
            address,
            city: city || "New Delhi",
            state: state || "Delhi",
            type,
            isDefault: true
        });

        closeModal();
        window.App.showToast("New delivery address saved!");

        // If currently in checkout, refresh step 2
        if (window.Store.state.currentView === "checkout") {
            window.CheckoutView.render("main-view-container");
        } else if (window.Store.state.currentView === "cart") {
            window.CartView.render("main-view-container");
        }
    }

    window.AddressModal = {
        open: openModal,
        close: closeModal,
        save: handleSaveAddress
    };
})();
