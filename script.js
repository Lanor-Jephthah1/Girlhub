/**
 * GIRLHUB BY DEBBS - MASTER SCRIPT
 * Developed for: Lanor Jephthah Kwame
 * Description: Handles all logic including Responsive Quick View, Cart, and Currency.
 */

// =========================================
// 1. GLOBAL STATE & CONFIGURATION
// =========================================

const state = {
    currency: { code: 'GH', symbol: '₵', rate: 1 }, // Default
    cart: [],
    wishlist: [],
    isMobile: window.innerWidth <= 768
};

const exchangeRates = {
    'GH': { symbol: '₵', rate: 1 },
    'NG': { symbol: '₦', rate: 105 },
    'UK': { symbol: '£', rate: 0.05 },
    'US': { symbol: '$', rate: 0.06 }
};

// UPDATED DATABASE (Matches your HTML Images)
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
    initPreloader();
    initEntryModal();
    initMobileMenu();
    initSearch();
    initCart();
    initQuickView(); 
    initBundleBuilder();
    initProductButtons(); 
    updateCurrencyDisplay();
});

// =========================================
// 3. PRELOADER LOGIC
// =========================================

function initPreloader() {
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.body.classList.remove('loading'); 
        }, 1500); 
    });
}

// =========================================
// 4. ENTRY MODAL & CURRENCY
// =========================================

function initEntryModal() {
    const modal = document.getElementById('entry-modal');
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
        if (savedCurrency) {
            setCurrency(savedCurrency.code);
        }
    }

    const closeModal = () => {
        modal.classList.remove('open');
        document.body.classList.remove('no-scroll');
        localStorage.setItem('girlhub_visited', 'true');
    };

    closeBtn.addEventListener('click', closeModal);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = select.value;
        const email = document.getElementById('email-signup').value;
        setCurrency(code);
        showNotification("Welcome to the club! 10% Discount Applied.");
        closeModal();
    });
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
    renderCart();
}

function updateCurrencyDisplay() {
    const display = document.querySelector('.currency-display');
    if(display) display.innerText = `${state.currency.code} ${state.currency.symbol}`;
}

// =========================================
// 5. NAVIGATION & MOBILE MENU
// =========================================

function initMobileMenu() {
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.desktop-nav');
    const dropdownTrigger = document.querySelector('.has-dropdown > a');
    
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

    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        link.addEventListener('click', () => {
            if(!link.parentElement.classList.contains('has-dropdown')) {
                nav.classList.remove('active');
            }
        });
    });
}

// =========================================
// 6. SEARCH ENGINE
// =========================================

function initSearch() {
    const triggers = document.querySelectorAll('.search-trigger');
    const overlay = document.getElementById('search-overlay');
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
// 7. SHOPPING CART LOGIC
// =========================================

function initCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const triggers = document.querySelectorAll('.cart-trigger');
    const closeBtn = sidebar.querySelector('.close-sidebar');

    triggers.forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault();
        sidebar.classList.add('open');
        if(!document.querySelector('.cart-backdrop')) {
            const backdrop = document.createElement('div');
            backdrop.className = 'cart-backdrop';
            backdrop.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:2000;";
            backdrop.onclick = () => {
                sidebar.classList.remove('open');
                backdrop.remove();
            };
            document.body.appendChild(backdrop);
        }
    }));

    closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('open');
        const backdrop = document.querySelector('.cart-backdrop');
        if(backdrop) backdrop.remove();
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    state.cart.push(product);
    renderCart();
    showNotification(`Added ${product.name} to bag`);
    
    document.querySelector('.cart-trigger').click();
}

function removeFromCart(index) {
    state.cart.splice(index, 1);
    renderCart();
}

function renderCart() {
    const container = document.querySelector('.cart-items-container');
    const badge = document.querySelector('.badge');
    const countSpan = document.querySelector('.cart-count');
    const totalEl = document.querySelector('.cart-total-price');

    badge.innerText = state.cart.length;
    countSpan.innerText = state.cart.length;

    let total = 0;
    state.cart.forEach(item => total += item.price);
    totalEl.innerText = formatPrice(total);

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
                <div style="color: #666;">${formatPrice(item.price)}</div>
            </div>
            <button onclick="removeFromCart(${index})" style="color: #999; text-decoration: underline; font-size: 0.8rem;">Remove</button>
        `;
        container.appendChild(div);
    });
}

// =========================================
// 8. RESPONSIVE QUICK VIEW (UPDATED FIXED)
// =========================================

function initQuickView() {
    // 1. Inject Responsive Styles specifically for the modal
    const style = document.createElement('style');
    style.innerHTML = `
        .qv-container {
            max-width: 800px; width: 90%; background: white;
            display: flex; overflow: hidden; position: relative;
            max-height: 90vh; 
        }
        .qv-image-wrap { width: 50%; background: #f9f9f9; }
        .qv-content-wrap { width: 50%; padding: 40px; display: flex; flex-direction: column; justify-content: center; }
        .qv-image-wrap img { width: 100%; height: 100%; object-fit: cover; }
        
        /* MOBILE FIX */
        @media (max-width: 768px) {
            .qv-container { flex-direction: column; overflow-y: auto; }
            .qv-image-wrap { width: 100%; height: 250px; }
            .qv-content-wrap { width: 100%; padding: 20px; }
            .close-modal-qv { background: white; border-radius: 50%; }
        }
    `;
    document.head.appendChild(style);

    // 2. Inject Modal HTML with Classes
    const qvHTML = `
        <div id="quick-view-modal" class="modal-overlay">
            <div class="qv-container">
                <button class="close-modal-qv" style="position:absolute; top:15px; right:15px; z-index:10; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                
                <div class="qv-image-wrap">
                    <img src="" alt="Product">
                </div>
                
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

    // 3. Interaction Logic
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
// 9. BUNDLE BUILDER LOGIC
// =========================================

function initBundleBuilder() {
    const steps = document.querySelectorAll('.bundle-steps .step');
    const images = document.querySelectorAll('.collage-img');
    const startBtn = document.querySelector('.bundle-section .btn-black'); // Corrected Selector
    let currentStep = 0;

    if(!startBtn) return; // Guard clause if section missing

    steps.forEach((step, index) => {
        step.addEventListener('click', () => {
            steps.forEach(s => s.classList.remove('active'));
            step.classList.add('active');
            images.forEach(img => img.style.opacity = '0.5');
            if(images[index]) images[index].style.opacity = '1';
            currentStep = index;
        });
    });

    startBtn.addEventListener('click', () => {
        showNotification("Launching Bundle Configurator...");
    });
}

// =========================================
// 10. UTILITIES
// =========================================

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

const styleSheet = document.createElement("style");
styleSheet.innerText = `
    @keyframes fadeUp { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }
`;
document.head.appendChild(styleSheet);
