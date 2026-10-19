// Auth & Login Modal Component
(function () {
    let mockOTP = "4826";
    let enteredPhone = "";

    function openModal() {
        const modal = document.getElementById("login-modal-overlay");
        if (modal) {
            modal.classList.add("active");
            resetForm();
        }
    }

    function closeModal() {
        const modal = document.getElementById("login-modal-overlay");
        if (modal) modal.classList.remove("active");
    }

    function resetForm() {
        const phoneInput = document.getElementById("login-input-phone");
        const otpBox = document.getElementById("login-otp-section");
        const mainBtn = document.getElementById("login-submit-btn");
        if (phoneInput) {
            phoneInput.value = "";
            phoneInput.disabled = false;
        }
        if (otpBox) otpBox.style.display = "none";
        if (mainBtn) mainBtn.textContent = "Request OTP";
    }

    function handleAuthSubmit() {
        const phoneInput = document.getElementById("login-input-phone");
        const otpInput = document.getElementById("login-input-otp");
        const otpBox = document.getElementById("login-otp-section");
        const mainBtn = document.getElementById("login-submit-btn");

        if (!otpBox || !phoneInput) return;

        // Stage 1: Request OTP
        if (otpBox.style.display === "none") {
            const val = phoneInput.value.trim();
            if (val.length < 10) {
                window.App.showToast("Please enter a valid 10-digit mobile number or email");
                return;
            }
            enteredPhone = val;
            mockOTP = Math.floor(1000 + Math.random() * 9000).toString();
            phoneInput.disabled = true;
            otpBox.style.display = "block";
            document.getElementById("otp-mock-display").textContent = mockOTP;
            mainBtn.textContent = "Verify & Login";
            window.App.showToast(`OTP sent to ${val}: ${mockOTP}`);
            return;
        }

        // Stage 2: Verify OTP
        if (otpInput.value.trim() === mockOTP || otpInput.value.trim() === "1234") {
            const userData = {
                name: enteredPhone.includes("@") ? enteredPhone.split("@")[0] : "Student User",
                phone: enteredPhone,
                email: enteredPhone.includes("@") ? enteredPhone : "student@college.edu",
                isPlusMember: true,
                coins: 200
            };
            window.Store.setUser(userData);
            closeModal();
            window.App.showToast("Logged in successfully! Welcome, " + userData.name);
        } else {
            window.App.showToast("Invalid OTP. Try again with: " + mockOTP);
        }
    }

    window.AuthModal = {
        open: openModal,
        close: closeModal,
        handleSubmit: handleAuthSubmit
    };
})();
