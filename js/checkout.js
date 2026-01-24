/**
 * GIRLHUB CHECKOUT - Complete Payment Integration
 * Supports: Paystack, Mobile Money, Card Payments
 */

// =========================================
// 1. CONFIGURATION & STATE
// =========================================

const PAYSTACK_PUBLIC_KEY = 'pk_test_your_paystack_public_key_here'; // Replace with your actual key
const FREE_SHIPPING_THRESHOLD = 500;
const TAX_RATE = 0.0; // 0% tax for now, adjust as needed

const checkoutState = {
    currentStep: 1,
    cart: [],
    user: null,
    shippingInfo: {},
    selectedAddress: null,
    paymentMethod: 'card',
    orderSummary: {
        subtotal: 0,
        shipping: 0,
        tax: 0,
        discount: 0,
        total: 0
    }
};

// =========================================
// 2. INITIALIZATION
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    checkAuthentication();
    
    // Load cart from localStorage
    loadCart();
    
    // Load user data
    loadUserData();
    
    // Load saved addresses
    loadAddresses();
    
    // Calculate totals
    calculateTotals();
    
    // Render cart items
    renderCartItems();
    
    // Initialize form handlers
    initializeFormHandlers();
    
    // Initialize step navigation
    initializeStepNavigation();
});

// =========================================
// 3. AUTHENTICATION CHECK
// =========================================

function checkAuthentication() {
    const user = localStorage.getItem('girlhub_user');
    
    if (!user) {
        showNotification('Please sign in to continue checkout');
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 2000);
        return;
    }
    
    checkoutState.user = JSON.parse(user);
}

// =========================================
// 4. LOAD CART DATA
// =========================================

function loadCart() {
    const savedCart = localStorage.getItem('girlhub_cart');
    
    if (!savedCart) {
        showEmptyCartMessage();
        return;
    }
    
    checkoutState.cart = JSON.parse(savedCart);
    
    if (checkoutState.cart.length === 0) {
        showEmptyCartMessage();
    }
}

function showEmptyCartMessage() {
    const container = document.getElementById('checkout-container');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 100px 20px;">
                <i class="fas fa-shopping-bag" style="font-size: 5rem; color: #ddd; margin-bottom: 20px;"></i>
                <h2>Your cart is empty</h2>
                <p style="color: #666; margin: 20px 0;">Add some items to get started</p>
                <a href="products.html" class="btn btn-gold">Start Shopping</a>
            </div>
        `;
    }
}

// =========================================
// 5. LOAD USER DATA
// =========================================

function loadUserData() {
    if (!checkoutState.user) return;
    
    // Pre-fill contact information
    const emailInput = document.getElementById('checkout-email');
    const nameInput = document.getElementById('checkout-name');
    const phoneInput = document.getElementById('checkout-phone');
    
    if (emailInput) emailInput.value = checkoutState.user.email || '';
    if (nameInput) nameInput.value = checkoutState.user.name || '';
    if (phoneInput) phoneInput.value = checkoutState.user.phone || '';
}

// =========================================
// 6. LOAD SAVED ADDRESSES
// =========================================

function loadAddresses() {
    const addresses = JSON.parse(localStorage.getItem('girlhub_addresses') || '[]');
    const addressSelect = document.getElementById('saved-addresses');
    
    if (!addressSelect) return;
    
    if (addresses.length === 0) {
        addressSelect.style.display = 'none';
        return;
    }
    
    addressSelect.innerHTML = '<option value="">Use a saved address...</option>';
    
    addresses.forEach(addr => {
        const option = document.createElement('option');
        option.value = addr.id;
        option.textContent = `${addr.label} - ${addr.street}, ${addr.city}`;
        option.dataset.address = JSON.stringify(addr);
        addressSelect.appendChild(option);
    });
    
    addressSelect.style.display = 'block';
    
    // Handle address selection
    addressSelect.addEventListener('change', (e) => {
        if (e.target.value) {
            const addressData = JSON.parse(e.target.selectedOptions[0].dataset.address);
            fillAddressForm(addressData);
        }
    });
}

function fillAddressForm(addressData) {
    document.getElementById('checkout-name').value = addressData.name || '';
    document.getElementById('checkout-phone').value = addressData.phone || '';
    document.getElementById('checkout-address').value = addressData.street || '';
    document.getElementById('checkout-city').value = addressData.city || '';
    document.getElementById('checkout-region').value = addressData.region || '';
    
    checkoutState.selectedAddress = addressData;
}

// =========================================
// 7. CALCULATE TOTALS
// =========================================

function calculateTotals() {
    let subtotal = 0;
    
    checkoutState.cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 25;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + shipping + tax - checkoutState.orderSummary.discount;
    
    checkoutState.orderSummary = {
        subtotal,
        shipping,
        tax,
        discount: checkoutState.orderSummary.discount,
        total
    };
    
    updateOrderSummary();
}

function updateOrderSummary() {
    const currency = getCurrencySymbol();
    const summary = checkoutState.orderSummary;
    
    const subtotalEl = document.getElementById('summary-subtotal');
    const shippingEl = document.getElementById('summary-shipping');
    const taxEl = document.getElementById('summary-tax');
    const discountEl = document.getElementById('summary-discount');
    const totalEl = document.getElementById('summary-total');
    
    if (subtotalEl) subtotalEl.textContent = formatPrice(summary.subtotal);
    if (shippingEl) shippingEl.textContent = summary.shipping === 0 ? 'FREE' : formatPrice(summary.shipping);
    if (taxEl) taxEl.textContent = formatPrice(summary.tax);
    if (discountEl && summary.discount > 0) {
        discountEl.textContent = `-${formatPrice(summary.discount)}`;
        discountEl.parentElement.style.display = 'flex';
    }
    if (totalEl) totalEl.textContent = formatPrice(summary.total);
}

// =========================================
// 8. RENDER CART ITEMS
// =========================================

function renderCartItems() {
    const container = document.getElementById('cart-items-review');
    if (!container) return;
    
    container.innerHTML = '';
    
    checkoutState.cart.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'checkout-item';
        itemEl.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>Quantity: ${item.quantity}</p>
            </div>
            <div class="item-price">${formatPrice(item.price * item.quantity)}</div>
        `;
        container.appendChild(itemEl);
    });
}

// =========================================
// 9. STEP NAVIGATION
// =========================================

function initializeStepNavigation() {
    const nextButtons = document.querySelectorAll('[data-next-step]');
    const prevButtons = document.querySelectorAll('[data-prev-step]');
    
    nextButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const nextStep = parseInt(btn.dataset.nextStep);
            if (validateCurrentStep()) {
                goToStep(nextStep);
            }
        });
    });
    
    prevButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const prevStep = parseInt(btn.dataset.prevStep);
            goToStep(prevStep);
        });
    });
}

function goToStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.checkout-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show target step
    const targetStep = document.getElementById(`step-${stepNumber}`);
    if (targetStep) {
        targetStep.classList.add('active');
        checkoutState.currentStep = stepNumber;
    }
    
    // Update progress indicators
    updateStepIndicators(stepNumber);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStepIndicators(activeStep) {
    const indicators = document.querySelectorAll('.step-indicator');
    
    indicators.forEach((indicator, index) => {
        const stepNum = index + 1;
        
        if (stepNum < activeStep) {
            indicator.classList.add('completed');
            indicator.classList.remove('active');
        } else if (stepNum === activeStep) {
            indicator.classList.add('active');
            indicator.classList.remove('completed');
        } else {
            indicator.classList.remove('active', 'completed');
        }
    });
}

function validateCurrentStep() {
    const step = checkoutState.currentStep;
    
    if (step === 1) {
        // Validate shipping information
        const name = document.getElementById('checkout-name').value.trim();
        const email = document.getElementById('checkout-email').value.trim();
        const phone = document.getElementById('checkout-phone').value.trim();
        const address = document.getElementById('checkout-address').value.trim();
        const city = document.getElementById('checkout-city').value.trim();
        const region = document.getElementById('checkout-region').value.trim();
        
        if (!name || !email || !phone || !address || !city || !region) {
            showNotification('Please fill in all shipping details');
            return false;
        }
        
        if (!validateEmail(email)) {
            showNotification('Please enter a valid email address');
            return false;
        }
        
        // Save shipping info
        checkoutState.shippingInfo = {
            name, email, phone, address, city, region
        };
        
        return true;
    }
    
    if (step === 2) {
        // Validate payment method selection
        const selectedMethod = document.querySelector('input[name="payment-method"]:checked');
        
        if (!selectedMethod) {
            showNotification('Please select a payment method');
            return false;
        }
        
        checkoutState.paymentMethod = selectedMethod.value;
        return true;
    }
    
    return true;
}

// =========================================
// 10. FORM HANDLERS
// =========================================

function initializeFormHandlers() {
    // Coupon code
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', applyCoupon);
    }
    
    // Payment method selection
    const paymentRadios = document.querySelectorAll('input[name="payment-method"]');
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', handlePaymentMethodChange);
    });
    
    // Final checkout button
    const checkoutBtn = document.getElementById('final-checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', processCheckout);
    }
    
    // Save address checkbox
    const saveAddressCheckbox = document.getElementById('save-address');
    if (saveAddressCheckbox) {
        saveAddressCheckbox.addEventListener('change', (e) => {
            checkoutState.saveAddress = e.target.checked;
        });
    }
}

function applyCoupon() {
    const input = document.getElementById('coupon-code');
    const code = input.value.trim().toUpperCase();
    
    if (!code) {
        showNotification('Please enter a coupon code');
        return;
    }
    
    // Predefined coupons
    const coupons = {
        'WELCOME10': { discount: 0.10, type: 'percentage' },
        'STUDENT15': { discount: 0.15, type: 'percentage' },
        'FREESHIP': { discount: 25, type: 'fixed', shippingOnly: true },
        'GIRLHUB50': { discount: 50, type: 'fixed' }
    };
    
    if (coupons[code]) {
        const coupon = coupons[code];
        let discountAmount = 0;
        
        if (coupon.type === 'percentage') {
            discountAmount = checkoutState.orderSummary.subtotal * coupon.discount;
        } else if (coupon.type === 'fixed') {
            if (coupon.shippingOnly) {
                checkoutState.orderSummary.shipping = 0;
                showNotification('Free shipping applied! 🎉');
                calculateTotals();
                return;
            } else {
                discountAmount = coupon.discount;
            }
        }
        
        checkoutState.orderSummary.discount = discountAmount;
        calculateTotals();
        
        showNotification(`Coupon applied! You saved ${formatPrice(discountAmount)} 🎉`);
        input.value = '';
        input.disabled = true;
        document.getElementById('apply-coupon-btn').disabled = true;
    } else {
        showNotification('Invalid coupon code');
    }
}

function handlePaymentMethodChange(e) {
    const method = e.target.value;
    
    // Hide all payment details
    document.querySelectorAll('.payment-details').forEach(detail => {
        detail.style.display = 'none';
    });
    
    // Show selected payment details
    const detailSection = document.getElementById(`${method}-details`);
    if (detailSection) {
        detailSection.style.display = 'block';
    }
}

// =========================================
// 11. PROCESS CHECKOUT & PAYMENT
// =========================================

async function processCheckout() {
    const btn = document.getElementById('final-checkout-btn');
    const originalText = btn.innerHTML;
    
    // Disable button and show loading
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    try {
        // Validate one more time
        if (!validateCurrentStep()) {
            throw new Error('Please complete all required fields');
        }
        
        // Create order object
        const order = createOrderObject();
        
        // Process based on payment method
        if (checkoutState.paymentMethod === 'card' || checkoutState.paymentMethod === 'mobile-money') {
            await processPaystackPayment(order);
        } else if (checkoutState.paymentMethod === 'bank-transfer') {
            processBankTransfer(order);
        } else if (checkoutState.paymentMethod === 'cash-on-delivery') {
            processCashOnDelivery(order);
        }
        
    } catch (error) {
        console.error('Checkout error:', error);
        showNotification(error.message || 'Payment failed. Please try again.');
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

function createOrderObject() {
    const orderNumber = generateOrderNumber();
    
    return {
        orderNumber,
        user: checkoutState.user,
        items: checkoutState.cart,
        shipping: checkoutState.shippingInfo,
        payment: {
            method: checkoutState.paymentMethod,
            amount: checkoutState.orderSummary.total
        },
        summary: checkoutState.orderSummary,
        timestamp: new Date().toISOString()
    };
}

function generateOrderNumber() {
    const prefix = 'GH';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
}

// =========================================
// 12. PAYSTACK PAYMENT INTEGRATION
// =========================================

async function processPaystackPayment(order) {
    // Convert to smallest currency unit (pesewas for GHS, kobo for NGN)
    const amountInMinorUnits = Math.round(order.payment.amount * 100);
    
    const handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: order.shipping.email,
        amount: amountInMinorUnits,
        currency: getCurrencyCode(),
        ref: order.orderNumber,
        
        metadata: {
            custom_fields: [
                {
                    display_name: "Customer Name",
                    variable_name: "customer_name",
                    value: order.shipping.name
                },
                {
                    display_name: "Phone Number",
                    variable_name: "phone",
                    value: order.shipping.phone
                }
            ]
        },
        
        callback: function(response) {
            handlePaymentSuccess(order, response);
        },
        
        onClose: function() {
            const btn = document.getElementById('final-checkout-btn');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-lock"></i> Complete Payment';
            showNotification('Payment cancelled');
        }
    });
    
    handler.openIframe();
}

function handlePaymentSuccess(order, paymentResponse) {
    // Save order to localStorage
    saveOrder(order, paymentResponse);
    
    // Clear cart
    localStorage.removeItem('girlhub_cart');
    
    // Save address if requested
    if (checkoutState.saveAddress) {
        saveShippingAddress(order.shipping);
    }
    
    // Redirect to success page
    localStorage.setItem('last_order', JSON.stringify({
        ...order,
        paymentReference: paymentResponse.reference
    }));
    
    window.location.href = 'order-success.html';
}

// =========================================
// 13. ALTERNATIVE PAYMENT METHODS
// =========================================

function processBankTransfer(order) {
    // Save order as pending
    order.payment.status = 'pending';
    saveOrder(order);
    
    // Show bank details
    showBankTransferInstructions(order);
}

function showBankTransferInstructions(order) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay open';
    modal.innerHTML = `
        <div class="modal-card" style="max-width: 500px;">
            <h3>Bank Transfer Details</h3>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <p><strong>Bank Name:</strong> Access Bank</p>
                <p><strong>Account Name:</strong> Girlhub by Debbs</p>
                <p><strong>Account Number:</strong> 0123456789</p>
                <p><strong>Amount:</strong> ${formatPrice(order.payment.amount)}</p>
                <p><strong>Reference:</strong> ${order.orderNumber}</p>
            </div>
            <p style="color: #666; margin-bottom: 20px;">
                Please include the reference number in your transfer description. 
                Your order will be processed once payment is confirmed.
            </p>
            <button class="btn btn-gold btn-block" onclick="window.location.href='order-pending.html'">
                I've Made the Transfer
            </button>
        </div>
    `;
    document.body.appendChild(modal);
}

function processCashOnDelivery(order) {
    // Save order
    order.payment.status = 'cod';
    saveOrder(order);
    
    // Clear cart
    localStorage.removeItem('girlhub_cart');
    
    // Redirect to success page
    localStorage.setItem('last_order', JSON.stringify(order));
    window.location.href = 'order-success.html';
}

// =========================================
// 14. SAVE ORDER & ADDRESS
// =========================================

function saveOrder(order, paymentResponse = null) {
    // Get existing orders
    const orders = JSON.parse(localStorage.getItem('girlhub_orders') || '[]');
    
    // Add payment reference if available
    if (paymentResponse) {
        order.payment.reference = paymentResponse.reference;
        order.payment.status = 'paid';
    }
    
    // Add order
    orders.unshift(order);
    
    // Save
    localStorage.setItem('girlhub_orders', JSON.stringify(orders));
}

function saveShippingAddress(shippingInfo) {
    const addresses = JSON.parse(localStorage.getItem('girlhub_addresses') || '[]');
    
    const newAddress = {
        id: Date.now(),
        label: 'Home',
        name: shippingInfo.name,
        phone: shippingInfo.phone,
        street: shippingInfo.address,
        city: shippingInfo.city,
        region: shippingInfo.region,
        isDefault: addresses.length === 0
    };
    
    addresses.push(newAddress);
    localStorage.setItem('girlhub_addresses', JSON.stringify(addresses));
}

// =========================================
// 15. UTILITY FUNCTIONS
// =========================================

function getCurrencyCode() {
    const savedCurrency = localStorage.getItem('girlhub_currency');
    if (savedCurrency) {
        const currency = JSON.parse(savedCurrency);
        return currency.code === 'GH' ? 'GHS' : 
               currency.code === 'NG' ? 'NGN' :
               currency.code === 'US' ? 'USD' : 'GHS';
    }
    return 'GHS';
}

function getCurrencySymbol() {
    const savedCurrency = localStorage.getItem('girlhub_currency');
    if (savedCurrency) {
        return JSON.parse(savedCurrency).symbol;
    }
    return '₵';
}

function formatPrice(amount) {
    const savedCurrency = localStorage.getItem('girlhub_currency');
    let rate = 1;
    let symbol = '₵';
    
    if (savedCurrency) {
        const currency = JSON.parse(savedCurrency);
        rate = currency.rate;
        symbol = currency.symbol;
    }
    
    const converted = amount * rate;
    return `${symbol}${converted.toFixed(2)}`;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: #111;
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        font-size: 0.9rem;
        z-index: 10000;
        animation: slideUp 0.3s ease;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translate(-50%, 20px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translate(-50%, 20px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }
`;
document.head.appendChild(style);

// =========================================
// 16. LOAD PAYSTACK SCRIPT
// =========================================

// Load Paystack inline script
const paystackScript = document.createElement('script');
paystackScript.src = 'https://js.paystack.co/v1/inline.js';
document.head.appendChild(paystackScript);