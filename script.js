/**
 * GIRLHUB BY DEBBS - MASTER SCRIPT (V3)
 * Features: Auth Page Logic, Google Sign-In, Smart Cart, Responsive UI
 */

// =========================================
// 1. GLOBAL STATE
// =========================================
const state = {
    currency: { code: 'GH', symbol: '₵', rate: 1 }, 
    cart: [], // Stores objects with { ..., qty: 1 }
    user: JSON.parse(localStorage.getItem('gh_user')) || null // Load user if exists
};

const exchangeRates = {
    'GH': { symbol: '₵', rate: 1 },
    'NG': { symbol: '₦', rate: 105 },
    'UK': { symbol: '£', rate: 0.05 },
    'US': { symbol: '$', rate: 0.06 }
};

// UPDATED DATABASE (Reliable Image Links)
const products = [
    { 
        id: 1, 
        name: "The 'Debbs' Gold Choker", 
        category: "Jewelry", 
        price: 150, 
        image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop",
        desc: "18k gold vermeil, water-resistant, and perfect for layering. A campus essential." 
    },
    { 
        id: 2, 
        name: "Vanilla Oud Essence", 
        category: "Fragrance", 
        price: 200, 
        image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600&auto=format&fit=crop",
        desc: "A warm, spicy scent that lasts all day. Notes of vanilla, oud, and amber."
    },
    { 
        id: 3, 
        name: "The Uni Tote", 
        category: "Accessories", 
        price: 90, 
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop",
        desc: "Canvas tote with reinforced straps. Fits a 15-inch laptop comfortably."
    },
    { 
        id: 4, 
        name: "Aesthetic Tumbler", 
        category: "Lifestyle", 
        price: 85, 
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop",
        desc: "Borosilicate glass with bamboo lid. Keeps your iced coffee cold for 6 hours."
    },
    { 
        id: 5, 
        name: "Pearl Drop Earrings", 
        category: "Jewelry", 
        price: 55, 
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop",
        desc: "Freshwater pearls on gold-plated hoops. Elegant yet understated."
    },
    { 
        id: 6, 
        name: "Digital Vision Planner", 
        category: "Digital", 
        price: 40, 
        image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=600&auto=format&fit=crop",
        desc: "iPad compatible PDF planner with hyperlinks. Get your life organized."
    }
];

// =========================================
// 2. INITIALIZATION
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    // Check which page we are on based on specific element
    const isAuthPage = document.querySelector('.auth-page-wrapper');

    initPreloader();
    
    if (!isAuthPage) {
        // Main Store Pages
        initEntryModal();
        initMobileMenu();
        initSearch();
        initCart();
        initQuickView(); 
        initBundleBuilder();
        initProductButtons(); 
        initCurrencySwitcher();
    } else {
        // Login/Signup Page
        initAuthPageLogic();
    }
    
    updateCurrencyDisplay();
    updateUserUI(); 
});

// =========================================
// 3. AUTHENTICATION LOGIC
// =========================================

function initAuthPageLogic() {
    // Login Form
    const loginForm = document.getElementById('login-form');
    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            performLogin({ name: "Debbs Queen", email: email });
        });
    }

    // Register Form
    const regForm = document.getElementById('register-form');
    if(regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            performLogin({ name: name, email: email });
        });
    }
}

window.handleGoogleLogin = function() {
    const btn = document.querySelector('.btn-google');
    // Visual feedback
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Connecting...';
    btn.style.opacity = "0.7";

    // Simulate API delay
    setTimeout(() => {
        const mockGoogleUser = {
            name: "Lanor Jephthah",
            email: "lanor@google.com",
            method: "google"
        };
        performLogin(mockGoogleUser);
    }, 1500);
};

function performLogin(userObj) {
    state.user = userObj;
    localStorage.setItem('gh_user', JSON.stringify(userObj));
    // Redirect to home
    window.location.href = 'index.html';
}

function logout() {
    state.user = null;
    localStorage.removeItem('gh_user');
    updateUserUI();
    alert("Logged out successfully.");
    // If on account page, reload to reset state
    if(document.querySelector('.auth-page-wrapper')) {
        window.location.reload();
    }
}

function updateUserUI() {
    let userDisplay = document.getElementById('user-display'); // Desktop header name
    let authBtn = document.querySelector('.auth-trigger'); // The icon button
    
    // Inject button if missing (Fixes "no account button" issue)
    if (!authBtn) {
        const container = document.querySelector('.user-actions');
        if (container) {
            const btnHTML = `
                <button class="action-btn auth-trigger">
                    <i class="far fa-user"></i>
                    <span id="user-display" class="user-status hidden-mobile" style="margin-left:5px; font-weight:600; font-size:0.85rem;"></span>
                </button>
            `;
            // Insert before cart button if possible
            const cartBtn = container.querySelector('.cart-trigger');
            if (cartBtn) cartBtn.insertAdjacentHTML('beforebegin', btnHTML);
            else container.insertAdjacentHTML('beforeend', btnHTML);
            
            // Re-select elements
            userDisplay = document.getElementById('user-display');
            authBtn = document.querySelector('.auth-trigger');
        }
    }
    
    if (state.user) {
        // Logged In State: Show Initials
        if(userDisplay) {
            const initials = state.user.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);
            userDisplay.textContent = initials;
        }
        
        // Update click behavior to Logout
        if(authBtn) {
            authBtn.onclick = (e) => {
                e.preventDefault();
                if(confirm(`Signed in as ${state.user.name}. Log out?`)) {
                    logout();
                }
            };
        }
    } else {
        // Logged Out State
        if(userDisplay) userDisplay.textContent = "";
        
        // Update click behavior to Login Page
        if(authBtn) {
            authBtn.onclick = () => window.location.href = 'account.html';
        }
    }
}

// Tab Switcher for Auth Page
window.switchAuth = function(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    if(tab === 'login') {
        document.querySelectorAll('.auth-tab')[0].classList.add('active');
        document.getElementById('login-form').classList.add('active');
    } else {
        document.querySelectorAll('.auth-tab')[1].classList.add('active');
        document.getElementById('register-form').classList.add('active');
    }
};

// =========================================
// 4. SMART CART SYSTEM
// =========================================

function initCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const triggers = document.querySelectorAll('.cart-trigger');
    const closeBtn = sidebar.querySelector('.close-sidebar');
    const checkoutBtn = sidebar.querySelector('.btn-black'); 

    // Open Cart
    triggers.forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault();
        sidebar.classList.add('open');
        if(!document.querySelector('.cart-backdrop')) {
            const backdrop = document.createElement('div');
            backdrop.className = 'cart-backdrop';
            backdrop.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:2000;";
            backdrop.onclick = () => { sidebar.classList.remove('open'); backdrop.remove(); };
            document.body.appendChild(backdrop);
        }
    }));

    closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('open');
        const backdrop = document.querySelector('.cart-backdrop');
        if(backdrop) backdrop.remove();
    });

    // Secure Checkout Logic
    if(checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (!state.user) {
                // Redirect to Login if not authenticated
                window.location.href = 'account.html';
            } else {
                if(state.cart.length === 0) {
                    showNotification("Your bag is empty!");
                } else {
                    showNotification("Redirecting to Payment Gateway...");
                }
            }
        });
    }
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Check if exists
    const existingItem = state.cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.qty++;
        showNotification(`Updated quantity: ${product.name}`);
    } else {
        state.cart.push({ ...product, qty: 1 });
        showNotification(`Added ${product.name} to bag`);
    }

    renderCart();
    // Auto open
    const trigger = document.querySelector('.cart-trigger');
    if(trigger) trigger.click();
}

function updateCartQty(index, change) {
    const item = state.cart[index];
    item.qty += change;

    if (item.qty <= 0) {
        state.cart.splice(index, 1);
    }
    renderCart();
}

function renderCart() {
    const container = document.querySelector('.cart-items-container');
    const badge = document.querySelector('.badge');
    const countSpan = document.querySelector('.cart-count');
    const totalEl = document.querySelector('.cart-total-price');

    if(!container) return;

    // Calc Totals
    const totalItems = state.cart.reduce((acc, item) => acc + item.qty, 0);
    let totalPrice = 0;
    state.cart.forEach(item => totalPrice += (item.price * item.qty));

    // Update UI Elements
    if(badge) badge.innerText = totalItems;
    if(countSpan) countSpan.innerText = totalItems;
    if(totalEl) totalEl.innerText = formatPrice(totalPrice);

    // Render List
    container.innerHTML = '';
    
    if (state.cart.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; margin-top: 50px; color: #999;">
                <i class="far fa-sad-tear" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p>Your bag is empty, bestie!</p>
            </div>
        `;
        return;
    }

    state.cart.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.style.cssText = "display: flex; gap: 15px; margin-bottom: 20px; align-items: center;";
        div.innerHTML = `
            <img src="${item.image}" style="width: 70px; height: 80px; object-fit: cover;">
            <div style="flex: 1;">
                <h4 style="font-size: 0.9rem; margin-bottom: 5px;">${item.name}</h4>
                <div style="color: #666; font-size: 0.85rem;">${formatPrice(item.price)} each</div>
                
                <div class="qty-controls">
                    <div class="qty-btn" onclick="updateCartQty(${index}, -1)">-</div>
                    <div class="qty-val">${item.qty}</div>
                    <div class="qty-btn" onclick="updateCartQty(${index}, 1)">+</div>
                </div>
            </div>
            <div style="text-align:right;">
                <div style="font-weight:700;">${formatPrice(item.price * item.qty)}</div>
            </div>
        `;
        container.appendChild(div);
    });
}

// =========================================
// 5. MODALS & PRELOADER
// =========================================

function initPreloader() {
    window.addEventListener('load', () => {
        setTimeout(() => { 
            document.body.classList.remove('loading'); 
        }, 1500); 
    });
}

function initEntryModal() {
    const modal = document.getElementById('entry-modal');
    // Only run if modal exists on this page
    if(!modal) return;

    const form = document.getElementById('preference-form');
    const closeBtn = modal.querySelector('.close-modal');
    const select = document.getElementById('shipping-loc');
    const hasVisited = localStorage.getItem('girlhub_visited');

    if (!hasVisited) {
        setTimeout(() => {
            modal.classList.add('open');
            document.body.classList.add('no-scroll');
        }, 2500);
    } else {
        const savedCurrency = JSON.parse(localStorage.getItem('girlhub_currency'));
        if (savedCurrency) setCurrency(savedCurrency.code);
    }

    const closeModal = () => {
        modal.classList.remove('open');
        document.body.classList.remove('no-scroll');
        localStorage.setItem('girlhub_visited', 'true');
    };

    if(closeBtn) closeBtn.addEventListener('click', closeModal);

    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const code = select.value;
            setCurrency(code);
            closeModal();
        });
    }
}

function setCurrency(code) {
    if (exchangeRates[code]) {
        state.currency = { code, ...exchangeRates[code] };
        localStorage.setItem('girlhub_currency', JSON.stringify(state.currency));
        updateAllPrices();
        updateCurrencyDisplay();
    }
}

function formatPrice(amount) {
    const val = (amount * state.currency.rate).toFixed(2);
    return `${state.currency.symbol}${val}`;
}

function updateAllPrices() {
    const priceEls = document.querySelectorAll('.price');
    priceEls.forEach((el, index) => {
        if(products[index]) {
            if(el.querySelector('.old-price')) {
                const oldVal = (products[index].price * 1.3).toFixed(2);
                el.innerHTML = `<span class="old-price">${state.currency.symbol}${oldVal}</span> ${formatPrice(products[index].price)}`;
            } else {
                el.innerText = formatPrice(products[index].price);
            }
        }
    });
    renderCart(); // Re-render cart with new currency
}

function updateCurrencyDisplay() {
    const display = document.querySelector('.currency-display');
    if(display) display.innerText = `${state.currency.code} ${state.currency.symbol}`;
}

// =========================================
// 6. UI & SEARCH
// =========================================

function initCurrencySwitcher() {
    const display = document.querySelector('.currency-display');
    if(display) {
        display.style.cursor = 'pointer';
        display.title = "Click to switch currency";
        
        display.addEventListener('click', () => {
            const keys = Object.keys(exchangeRates);
            const currentIdx = keys.indexOf(state.currency.code);
            const nextIdx = (currentIdx + 1) % keys.length;
            const nextCode = keys[nextIdx];
            
            setCurrency(nextCode);
            showNotification(`Currency switched to ${nextCode}`);
        });
    }
}

function initMobileMenu() {
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.desktop-nav');
    const dropdownTrigger = document.querySelector('.has-dropdown > a');
    
    if(!toggle) return;

    toggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        toggle.classList.toggle('active');
    });

    if (dropdownTrigger) {
        dropdownTrigger.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const parent = dropdownTrigger.parentElement;
                parent.classList.toggle('active');
            }
        });
    }
}

function initSearch() {
    const triggers = document.querySelectorAll('.search-trigger');
    const overlay = document.getElementById('search-overlay');
    if(!overlay) return;

    const closeBtn = overlay.querySelector('.close-overlay');
    const input = overlay.querySelector('input');
    const wrapper = overlay.querySelector('.search-wrapper');

    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'search-results-list';
    resultsDiv.style.cssText = "margin-top: 20px; text-align: left; max-height: 50vh; overflow-y: auto;";
    wrapper.appendChild(resultsDiv);

    triggers.forEach(btn => btn.addEventListener('click', () => {
        overlay.classList.add('open');
        input.focus();
    }));

    closeBtn.addEventListener('click', () => overlay.classList.remove('open'));

    input.addEventListener('keyup', (e) => {
        const term = e.target.value.toLowerCase();
        resultsDiv.innerHTML = ''; 

        if (term.length < 2) return;

        const matches = products.filter(p => 
            p.name.toLowerCase().includes(term) || 
            p.category.toLowerCase().includes(term)
        );

        if (matches.length === 0) {
            resultsDiv.innerHTML = '<p style="color:#666; margin-top:10px;">No matches found, queen.</p>';
        } else {
            matches.forEach(p => {
                const item = document.createElement('div');
                item.style.cssText = "display: flex; gap: 15px; padding: 10px; border-bottom: 1px solid #eee; cursor: pointer;";
                item.innerHTML = `
                    <img src="${p.image}" style="width: 50px; height: 50px; object-fit: cover;">
                    <div>
                        <div style="font-weight: 600;">${p.name}</div>
                        <div style="color: #D4AF37;">${formatPrice(p.price)}</div>
                    </div>
                `;
                item.addEventListener('click', () => {
                    addToCart(p.id);
                    overlay.classList.remove('open');
                    input.value = '';
                    resultsDiv.innerHTML = '';
                });
                resultsDiv.appendChild(item);
            });
        }
    });
}

// =========================================
// 7. QUICK VIEW (Responsive Injection)
// =========================================

function initQuickView() {
    // Inject Styles locally to ensure they load
    const style = document.createElement('style');
    style.innerHTML = `
        .qv-container { max-width: 800px; width: 90%; background: white; display: flex; overflow: hidden; position: relative; max-height: 90vh; box-shadow: 0 20px 50px rgba(0,0,0,0.2); }
        .qv-image-wrap { width: 50%; background: #f9f9f9; }
        .qv-content-wrap { width: 50%; padding: 40px; display: flex; flex-direction: column; justify-content: center; }
        .qv-image-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .close-modal-qv { position: absolute; top: 15px; right: 15px; z-index: 10; border: none; font-size: 1.5rem; cursor: pointer; background: rgba(255,255,255,0.8); width: 35px; height: 35px; border-radius: 50%; }
        @media (max-width: 768px) {
            .qv-container { flex-direction: column; overflow-y: auto; height: auto; max-height: 85vh; }
            .qv-image-wrap { width: 100%; height: 250px; flex-shrink: 0; }
            .qv-content-wrap { width: 100%; padding: 20px; }
            .qv-title { font-size: 1.5rem !important; }
        }
    `;
    document.head.appendChild(style);

    const qvHTML = `
        <div id="quick-view-modal" class="modal-overlay">
            <div class="qv-container">
                <button class="close-modal-qv">&times;</button>
                <div class="qv-image-wrap"><img src="" alt="Product"></div>
                <div class="qv-content-wrap">
                    <span class="qv-cat" style="color: #666; text-transform: uppercase; font-size: 0.8rem; letter-spacing:1px;"></span>
                    <h2 class="qv-title" style="margin: 10px 0; font-family: 'Playfair Display', serif; font-size: 2rem;"></h2>
                    <p class="qv-desc" style="color: #555; margin-bottom: 20px; line-height: 1.6;"></p>
                    <h3 class="qv-price" style="color: #D4AF37; margin-bottom: 30px; font-size: 1.5rem;"></h3>
                    <button class="btn btn-black btn-block qv-add">Add to Bag</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', qvHTML);

    const modal = document.getElementById('quick-view-modal');
    const closeBtn = modal.querySelector('.close-modal-qv');

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('open');
        document.body.classList.remove('no-scroll');
    });

    window.openQuickView = (productId) => {
        const p = products.find(x => x.id === productId);
        if(!p) return;

        modal.querySelector('img').src = p.image;
        modal.querySelector('.qv-cat').innerText = p.category;
        modal.querySelector('.qv-title').innerText = p.name;
        modal.querySelector('.qv-desc').innerText = p.desc;
        modal.querySelector('.qv-price').innerText = formatPrice(p.price);
        
        const addBtn = modal.querySelector('.qv-add');
        addBtn.innerText = "Add to Bag";
        addBtn.onclick = () => {
            addToCart(p.id);
            modal.classList.remove('open');
            document.body.classList.remove('no-scroll');
        };

        modal.classList.add('open');
        document.body.classList.add('no-scroll');
    };
}

function initProductButtons() {
    const qvBtns = document.querySelectorAll('.quick-view-btn');
    qvBtns.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.openQuickView(index + 1);
        });
    });

    const atcBtns = document.querySelectorAll('.add-to-cart-btn');
    atcBtns.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            addToCart(index + 1);
        });
    });
}

// =========================================
// 8. BUNDLE & NOTIFICATIONS
// =========================================

function initBundleBuilder() {
    const steps = document.querySelectorAll('.bundle-steps .step');
    const images = document.querySelectorAll('.collage-img');
    const startBtn = document.querySelector('.bundle-section .btn-black'); 

    if(!startBtn) return; 

    steps.forEach((step, index) => {
        step.addEventListener('click', () => {
            steps.forEach(s => s.classList.remove('active'));
            step.classList.add('active');
            images.forEach(img => img.style.opacity = '0.5');
            if(images[index]) images[index].style.opacity = '1';
        });
    });

    startBtn.addEventListener('click', () => {
        showNotification("Launching Bundle Configurator...");
    });
}

function showNotification(msg) {
    const note = document.createElement('div');
    note.innerText = msg;
    note.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: #111; color: #fff; padding: 12px 25px; border-radius: 4px;
        font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;
        z-index: 3000; animation: fadeUp 0.3s ease; box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(note);

    setTimeout(() => {
        note.style.opacity = 0;
        setTimeout(() => note.remove(), 300);
    }, 3000);
}

// Inject CSS animations globally
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    @keyframes fadeUp { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }
`;
document.head.appendChild(styleSheet);
