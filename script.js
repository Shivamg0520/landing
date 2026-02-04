// 1. DATA LOADING
window.onload = function() {
    loadBatchData(1);
    loadBatchData(2);
    loadBatchData(3);
    startOfferTimer();
    setupStickyOffer();
    setupBatchStatusToggles();
    loadPaymentSettings();
    
    // Only run scroll reveal if on index page
    if(document.querySelector('.reveal')) {
        setupScrollReveal();
    }
}

function loadBatchData(i) {
    const saved = localStorage.getItem(`cryptoBatch_${i}`);
    if (saved) {
        const data = JSON.parse(saved);
        if(document.getElementById(`b${i}-title`)) {
            document.getElementById(`b${i}-title`).innerText = data.title;
            document.getElementById(`b${i}-badge`).innerText = data.badge;
            document.getElementById(`b${i}-date`).innerText = data.date;
            document.getElementById(`b${i}-time`).innerText = data.time;
            document.getElementById(`b${i}-old`).innerText = data.oldPrice;
            document.getElementById(`b${i}-new`).innerText = data.newPrice;
            document.getElementById(`b${i}-desc`).innerText = data.desc;
            applyBatchStatus(i, data.isOpen !== false);
        }
    } else {
        applyBatchStatus(i, true);
    }
}

function startOfferTimer() {
    const timer = document.getElementById("offerTimer");
    if (!timer) return;

    const minutesEl = timer.querySelector('[data-timer="minutes"]');
    const secondsEl = timer.querySelector('[data-timer="seconds"]');
    const stickyTimer = document.getElementById("stickyTimer");

    const initialSeconds = 15 * 60 + 25;
    let remaining = initialSeconds;

    function pad(num) {
        return String(num).padStart(2, "0");
    }

    function tick() {
        if (remaining <= 0) {
            remaining = initialSeconds;
        }
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;

        minutesEl.textContent = pad(mins);
        secondsEl.textContent = pad(secs);
        if (stickyTimer) {
            stickyTimer.textContent = `${pad(mins)}:${pad(secs)}`;
        }
        remaining -= 1;
    }

    tick();
    setInterval(tick, 1000);
}

function setupStickyOffer() {
    const sticky = document.getElementById("stickyOffer");
    if (!sticky) return;

    function onScroll() {
        const shouldShow = window.scrollY > 220;
        sticky.classList.toggle("active", shouldShow);
        sticky.setAttribute("aria-hidden", shouldShow ? "false" : "true");
    }

    window.addEventListener("scroll", onScroll);
    onScroll();
}

// 2. ADMIN LOGIC - IMPROVED SECURITY
function checkAdminPassword() {
    const pin = document.getElementById("adminPin").value;
    
    // Using a more secure hash (SHA-256 would be better in production)
    // Current PIN: 144340
    // This is still base64 but in production you should use proper hashing
    const correctHash = "MTQ0MzQw";
    
    // Add rate limiting
    const attempts = parseInt(localStorage.getItem('loginAttempts') || '0');
    const lastAttempt = parseInt(localStorage.getItem('lastAttempt') || '0');
    const now = Date.now();
    
    // Reset attempts after 5 minutes
    if (now - lastAttempt > 300000) {
        localStorage.setItem('loginAttempts', '0');
    }
    
    if (attempts >= 5) {
        const timeLeft = Math.ceil((300000 - (now - lastAttempt)) / 60000);
        alert(`Too many failed attempts. Please wait ${timeLeft} minutes.`);
        return;
    }

    if (btoa(pin) === correctHash) {
        document.getElementById("adminLogin").style.display = "none";
        document.getElementById("adminSelect").style.display = "block";
        localStorage.setItem('loginAttempts', '0');
        document.getElementById("adminPin").value = "";
    } else {
        const newAttempts = attempts + 1;
        localStorage.setItem('loginAttempts', newAttempts.toString());
        localStorage.setItem('lastAttempt', now.toString());
        
        alert(`Wrong PIN! (${5 - newAttempts} attempts remaining)`);
        document.getElementById("adminPin").value = "";
        
        if (newAttempts >= 5) {
            alert("Too many failed attempts. Please wait 5 minutes.");
        }
    }
}

let currentBatch = 0;

function loadBatchEditor(batchId) {
    currentBatch = batchId;
    document.getElementById("adminSelect").style.display = "none";
    document.getElementById("adminEditor").style.display = "block";
    document.getElementById("editingTitle").innerText = "Editing Batch " + batchId;

    const saved = localStorage.getItem(`cryptoBatch_${batchId}`);
    if (saved) {
        const data = JSON.parse(saved);
        document.getElementById("editTitle").value = data.title;
        document.getElementById("editBadge").value = data.badge;
        document.getElementById("editDate").value = data.date;
        document.getElementById("editTime").value = data.time;
        document.getElementById("editOldPrice").value = data.oldPrice;
        document.getElementById("editNewPrice").value = data.newPrice;
        document.getElementById("editDesc").value = data.desc;
        const statusToggle = document.getElementById("editStatus");
        if (statusToggle) {
            statusToggle.checked = data.isOpen !== false;
        }
    } else {
        // Load defaults if no data exists
        loadDefaultBatch(batchId);
    }
}

function loadDefaultBatch(batchId) {
    const defaults = {
        1: {
            title: "Evening Batch",
            badge: "Filling Fast",
            date: "15 Feb",
            time: "8:00 PM IST",
            oldPrice: "₹20000",
            newPrice: "₹4999",
            desc: "Perfect for students & job holders."
        },
        2: {
            title: "Weekend Pro",
            badge: "Best Seller",
            date: "20 Feb",
            time: "11:00 AM IST",
            oldPrice: "₹20000",
            newPrice: "₹4999",
            desc: "Intensive learning for professionals."
        },
        3: {
            title: "Morning Batch",
            badge: "New",
            date: "01 March",
            time: "9:00 AM IST",
            oldPrice: "₹20000",
            newPrice: "₹4999",
            desc: "Fresh mind trading sessions."
        }
    };
    
    const data = defaults[batchId];
    document.getElementById("editTitle").value = data.title;
    document.getElementById("editBadge").value = data.badge;
    document.getElementById("editDate").value = data.date;
    document.getElementById("editTime").value = data.time;
    document.getElementById("editOldPrice").value = data.oldPrice;
    document.getElementById("editNewPrice").value = data.newPrice;
    document.getElementById("editDesc").value = data.desc;
    const statusToggle = document.getElementById("editStatus");
    if (statusToggle) {
        statusToggle.checked = data.isOpen !== false;
    }
}

function saveBatchChanges() {
    const b = currentBatch;
    const data = {
        title: document.getElementById("editTitle").value,
        badge: document.getElementById("editBadge").value,
        date: document.getElementById("editDate").value,
        time: document.getElementById("editTime").value,
        oldPrice: document.getElementById("editOldPrice").value,
        newPrice: document.getElementById("editNewPrice").value,
        desc: document.getElementById("editDesc").value,
        isOpen: document.getElementById("editStatus") ? document.getElementById("editStatus").checked : true
    };
    
    // Validate data
    if (!data.title || !data.date || !data.time || !data.newPrice) {
        alert("Please fill all required fields!");
        return;
    }
    
    localStorage.setItem(`cryptoBatch_${b}`, JSON.stringify(data));
    alert("✅ Saved successfully! Changes will appear on the main page.");
    backToSelect();
}

function backToSelect() {
    document.getElementById("adminEditor").style.display = "none";
    const paymentPanel = document.getElementById("adminPayment");
    if (paymentPanel) {
        paymentPanel.style.display = "none";
    }
    document.getElementById("adminSelect").style.display = "block";
}

function loadPaymentEditor() {
    const select = document.getElementById("adminSelect");
    const editor = document.getElementById("adminEditor");
    const payment = document.getElementById("adminPayment");
    if (select) select.style.display = "none";
    if (editor) editor.style.display = "none";
    if (payment) payment.style.display = "block";

    const saved = localStorage.getItem("cryptoPayment");
    const amountInput = document.getElementById("editPayAmount");
    if (amountInput) {
        amountInput.value = saved ? JSON.parse(saved).amount : "₹15,999";
    }
}

function savePaymentSettings() {
    const amountInput = document.getElementById("editPayAmount");
    if (!amountInput) return;
    const data = { amount: amountInput.value || "₹15,999" };
    localStorage.setItem("cryptoPayment", JSON.stringify(data));
    alert("✅ Saved successfully! Changes will appear on the main page.");
    backToSelect();
}

function loadPaymentSettings() {
    const amountEl = document.getElementById("payAmount");
    if (!amountEl) return;
    const saved = localStorage.getItem("cryptoPayment");
    if (saved) {
        const data = JSON.parse(saved);
        amountEl.textContent = data.amount || "₹15,999";
    } else {
        amountEl.textContent = "₹15,999";
    }
}

function applyBatchStatus(batchId, isOpen) {
    const card = document.querySelector(`.card-3d[data-batch="${batchId}"]`);
    const cta = document.getElementById(`b${batchId}-cta`);
    if (!card || !cta) return;
    card.classList.toggle("is-closed", !isOpen);
    cta.textContent = isOpen ? "Enroll Now" : "Enroll Closed";
}

function setupBatchStatusToggles() {
    const select = document.getElementById("adminSelect");
    if (!select) return;
    for (let i = 1; i <= 3; i++) {
        const toggle = document.getElementById(`toggleBatch${i}`);
        if (!toggle) continue;
        const saved = localStorage.getItem(`cryptoBatch_${i}`);
        if (saved) {
            const data = JSON.parse(saved);
            toggle.checked = data.isOpen !== false;
        } else {
            toggle.checked = true;
        }
        toggle.addEventListener("change", () => {
            const existing = localStorage.getItem(`cryptoBatch_${i}`);
            const data = existing ? JSON.parse(existing) : loadDefaultBatchData(i);
            data.isOpen = toggle.checked;
            localStorage.setItem(`cryptoBatch_${i}`, JSON.stringify(data));
        });
    }
}

function loadDefaultBatchData(batchId) {
    const defaults = {
        1: {
            title: "Evening Batch",
            badge: "Filling Fast",
            date: "15 Feb",
            time: "8:00 PM IST",
            oldPrice: "â‚¹20000",
            newPrice: "â‚¹4999",
            desc: "Perfect for students & job holders.",
            isOpen: true
        },
        2: {
            title: "Weekend Pro",
            badge: "Best Seller",
            date: "20 Feb",
            time: "11:00 AM IST",
            oldPrice: "â‚¹20000",
            newPrice: "â‚¹4999",
            desc: "Intensive learning for professionals.",
            isOpen: true
        },
        3: {
            title: "Morning Batch",
            badge: "New",
            date: "01 March",
            time: "9:00 AM IST",
            oldPrice: "â‚¹20000",
            newPrice: "â‚¹4999",
            desc: "Fresh mind trading sessions.",
            isOpen: true
        }
    };
    return defaults[batchId];
}

// 3. CURSOR, SCROLL & MENU
const cursor = document.querySelector(".cursor");
if(cursor) {
    document.addEventListener("mousemove", function(e){
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
    });
    
    // Add cursor effects on buttons and links
    const interactiveElements = document.querySelectorAll('a, button, .card-3d');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursor.style.borderColor = 'var(--neon-purple)';
        });
        element.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.borderColor = 'var(--neon-green)';
        });
    });
}

// Enhanced Scroll Reveal
function setupScrollReveal() {
    window.addEventListener('scroll', reveal);
    function reveal(){
        var reveals = document.querySelectorAll('.reveal');
        for(var i = 0; i < reveals.length; i++){
            var windowheight = window.innerHeight;
            var revealtop = reveals[i].getBoundingClientRect().top;
            var revealpoint = 120;
            if(revealtop < windowheight - revealpoint){
                reveals[i].classList.add('active');
            }
        }
    }
    reveal(); 
}

// Burger Menu Toggle
const menu = document.getElementById("mobileMenu");
const hamburgerBtn = document.querySelector(".hamburger-btn");
const closeBtn = menu ? menu.querySelector(".close-btn") : null;
const menuBackdrop = document.querySelector(".menu-backdrop");

function setMenuState(isOpen) {
    if (!menu || !hamburgerBtn) return;
    menu.classList.toggle("open", isOpen);
    if (menuBackdrop) {
        menuBackdrop.classList.toggle("open", isOpen);
    }
    document.body.classList.toggle("menu-open", isOpen);
    hamburgerBtn.classList.toggle("is-open", isOpen);
    hamburgerBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    menu.setAttribute("aria-hidden", isOpen ? "false" : "true");
}

if (menu && hamburgerBtn) {
    hamburgerBtn.addEventListener("click", () => {
        const isOpen = menu.classList.contains("open");
        setMenuState(!isOpen);
    });

    if (closeBtn) {
        closeBtn.addEventListener("click", () => setMenuState(false));
    }

    menu.addEventListener("click", (e) => {
        if (e.target === menu) {
            setMenuState(false);
        }
    });
    if (menuBackdrop) {
        menuBackdrop.addEventListener("click", () => setMenuState(false));
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && menu.classList.contains("open")) {
            setMenuState(false);
        }
    });
}

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (menu && menu.classList.contains("open")) {
            setMenuState(false);
        }
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add parallax effect to hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    const heroImage = document.querySelector('.hero-image-wrapper');
    
    if (heroContent) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
    if (heroImage) {
        heroImage.style.transform = `translateY(${scrolled * 0.2}px)`;
    }
});
