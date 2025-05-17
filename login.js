// Constants
const API_BASE_URL = 'https://api.budgettracker.com';
const AUTH_TOKEN_KEY = 'auth_token';
const REMEMBER_ME_KEY = 'remember_me';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const tabBtns = document.querySelectorAll('.tab-btn');
const passwordInputs = document.querySelectorAll('.password-input input');
const togglePasswordBtns = document.querySelectorAll('.toggle-password');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const demoButton = document.getElementById('demoButton');
const loadingSpinner = document.getElementById('loadingSpinner');
const signupPassword = document.getElementById('signupPassword');
const passwordRequirements = document.querySelectorAll('.password-requirements li');

// Rate Limiting
let loginAttempts = 0;
let lastLoginAttempt = 0;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkRememberMe();
});

// Event Listeners Setup
function setupEventListeners() {
    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Password Visibility Toggle
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', (e) => togglePasswordVisibility(e));
    });

    // Form Submissions
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);

    // Password Validation
    signupPassword.addEventListener('input', validatePassword);

    // Forgot Password
    forgotPasswordLink.addEventListener('click', handleForgotPassword);

    // Demo Access
    demoButton.addEventListener('click', handleDemoAccess);

    // Social Login
    document.querySelectorAll('.btn-social').forEach(btn => {
        btn.addEventListener('click', (e) => handleSocialLogin(e.target.closest('button').classList));
    });
}

// Tab Switching
function switchTab(tab) {
    const activeForm = document.querySelector('.auth-form.active');
    const targetForm = document.getElementById(`${tab}Form`);
    
    if (activeForm === targetForm) return;

    // Update tab buttons
    tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Animate form transition
    if (activeForm) {
        activeForm.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => {
            activeForm.classList.remove('active');
            activeForm.style.animation = '';
            targetForm.classList.add('active');
            // Reset form and error states
            resetForm(activeForm);
        }, 300);
    } else {
        targetForm.classList.add('active');
    }
}

// Password Visibility Toggle
function togglePasswordVisibility(e) {
    const btn = e.target.closest('.toggle-password');
    const input = btn.previousElementSibling;
    const icon = btn.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Login Handler
async function handleLogin(e) {
    e.preventDefault();

    // Check rate limiting
    if (isRateLimited()) {
        showToast(`Too many login attempts. Please try again in ${Math.ceil((LOCKOUT_DURATION - (Date.now() - lastLoginAttempt)) / 60000)} minutes.`, 'error');
        return;
    }

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const rememberMe = formData.get('rememberMe') === 'on';

    try {
        showLoading();
        const response = await login(email, password);
        
        if (response.success) {
            handleSuccessfulLogin(response.token, rememberMe);
        } else {
            handleFailedLogin();
        }
    } catch (error) {
        showToast(error.message || 'An error occurred during login.', 'error');
    } finally {
        hideLoading();
    }
}

// Signup Handler
async function handleSignup(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const fullName = formData.get('fullName');
    const currency = formData.get('currency');
    const termsAgree = formData.get('termsAgree') === 'on';
    const marketingConsent = formData.get('marketingConsent') === 'on';

    // Validate form
    if (!validateSignupForm(formData)) {
        return;
    }

    try {
        showLoading();
        const response = await signup({
            email,
            password,
            fullName,
            currency,
            marketingConsent
        });

        if (response.success) {
            showToast('Account created successfully! Please check your email for verification.', 'success');
            switchTab('login');
        } else {
            showToast(response.message || 'Failed to create account.', 'error');
        }
    } catch (error) {
        showToast(error.message || 'An error occurred during signup.', 'error');
    } finally {
        hideLoading();
    }
}

// Form Validation
function validateSignupForm(formData) {
    let isValid = true;
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const termsAgree = formData.get('termsAgree') === 'on';

    // Reset previous states
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error', 'success');
    });

    // Email validation
    const emailGroup = document.getElementById('signupEmail').closest('.form-group');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('signupEmailError', 'Please enter a valid email address.');
        emailGroup.classList.add('error');
        isValid = false;
    } else {
        emailGroup.classList.add('success');
    }

    // Password validation
    const passwordGroup = signupPassword.closest('.form-group');
    if (!validatePassword()) {
        showError('signupPasswordError', 'Please meet all password requirements.');
        passwordGroup.classList.add('error');
        isValid = false;
    } else {
        passwordGroup.classList.add('success');
    }

    // Confirm password
    const confirmPasswordGroup = document.getElementById('confirmPassword').closest('.form-group');
    if (password !== confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match.');
        confirmPasswordGroup.classList.add('error');
        isValid = false;
    } else if (confirmPassword) {
        confirmPasswordGroup.classList.add('success');
    }

    // Terms agreement
    const termsGroup = document.getElementById('termsAgree').closest('.form-group');
    if (!termsAgree) {
        showError('termsError', 'You must agree to the Terms of Service and Privacy Policy.');
        termsGroup.classList.add('error');
        isValid = false;
    } else {
        termsGroup.classList.add('success');
    }

    return isValid;
}

// Rate Limiting
function isRateLimited() {
    const now = Date.now();
    if (now - lastLoginAttempt < LOCKOUT_DURATION && loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        return true;
    }
    if (now - lastLoginAttempt >= LOCKOUT_DURATION) {
        loginAttempts = 0;
    }
    return false;
}

// API Calls
async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        return data;
    } catch (error) {
        throw new Error('Login failed. Please check your credentials and try again.');
    }
}

async function signup(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Signup failed');
        }

        return data;
    } catch (error) {
        throw new Error('Signup failed. Please try again later.');
    }
}

// Social Login Handlers
async function handleSocialLogin(classList) {
    let provider = '';
    if (classList.contains('google')) provider = 'google';
    else if (classList.contains('apple')) provider = 'apple';
    else if (classList.contains('facebook')) provider = 'facebook';

    try {
        showLoading();
        // Initialize the appropriate OAuth provider
        const auth = await initializeOAuth(provider);
        const result = await auth.signIn();

        if (result.success) {
            handleSuccessfulLogin(result.token, false);
        } else {
            showToast(`${provider} login failed.`, 'error');
        }
    } catch (error) {
        showToast(`Error during ${provider} login.`, 'error');
    } finally {
        hideLoading();
    }
}

// Forgot Password Handler
async function handleForgotPassword(e) {
    e.preventDefault();
    const email = prompt('Please enter your email address:');

    if (!email) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
    }

    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Password reset instructions have been sent to your email.', 'success');
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        showToast(error.message || 'Failed to process password reset request.', 'error');
    } finally {
        hideLoading();
    }
}

// Demo Access Handler
function handleDemoAccess() {
    window.location.href = '/demo';
}

// Success/Error Handlers
function handleSuccessfulLogin(token, rememberMe) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    if (rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, 'true');
    }
    window.location.href = '/dashboard';
}

function handleFailedLogin() {
    loginAttempts++;
    lastLoginAttempt = Date.now();
    showToast(`Login failed. ${MAX_LOGIN_ATTEMPTS - loginAttempts} attempts remaining.`, 'error');
}

// Utility Functions
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('visible');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Create icon based on type
    const icon = document.createElement('i');
    switch (type) {
        case 'success':
            icon.className = 'fas fa-check-circle';
            break;
        case 'error':
            icon.className = 'fas fa-exclamation-circle';
            break;
        case 'warning':
            icon.className = 'fas fa-exclamation-triangle';
            break;
        default:
            icon.className = 'fas fa-info-circle';
    }
    
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(messageSpan);

    const container = document.getElementById('toastContainer');
    container.appendChild(toast);

    // Remove old toasts if there are too many
    const toasts = container.getElementsByClassName('toast');
    if (toasts.length > 3) {
        container.removeChild(toasts[0]);
    }

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.5s ease-out forwards';
        setTimeout(() => container.removeChild(toast), 500);
    }, 3000);
}

function showLoading() {
    loadingSpinner.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent scrolling while loading
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
    document.body.style.overflow = ''; // Restore scrolling
}

function checkRememberMe() {
    if (localStorage.getItem(REMEMBER_ME_KEY) === 'true') {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
            window.location.href = '/dashboard';
        }
    }
}

// OAuth Initialization
async function initializeOAuth(provider) {
    // Implementation would depend on the specific OAuth provider libraries
    switch (provider) {
        case 'google':
            return initializeGoogleOAuth();
        case 'apple':
            return initializeAppleOAuth();
        case 'facebook':
            return initializeFacebookOAuth();
        default:
            throw new Error('Unsupported OAuth provider');
    }
}

// OAuth Provider Initializations
function initializeGoogleOAuth() {
    // Google OAuth implementation
    return {
        signIn: () => {
            // Implementation details would go here
            return Promise.resolve({ success: true, token: 'google_token' });
        }
    };
}

function initializeAppleOAuth() {
    // Apple OAuth implementation
    return {
        signIn: () => {
            // Implementation details would go here
            return Promise.resolve({ success: true, token: 'apple_token' });
        }
    };
}

function initializeFacebookOAuth() {
    // Facebook OAuth implementation
    return {
        signIn: () => {
            // Implementation details would go here
            return Promise.resolve({ success: true, token: 'facebook_token' });
        }
    };
}

// Form Reset Enhancement
function resetForm(form) {
    form.reset();
    form.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error', 'success');
    });
    form.querySelectorAll('.error-message').forEach(error => {
        error.textContent = '';
        error.classList.remove('visible');
    });
    form.querySelectorAll('.password-requirements li').forEach(req => {
        req.classList.remove('valid');
    });
}

// Enhanced Social Button Interactions
document.querySelectorAll('.btn-social').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        const icon = btn.querySelector('i');
        icon.style.transform = 'scale(1.2)';
    });
    
    btn.addEventListener('mouseleave', () => {
        const icon = btn.querySelector('i');
        icon.style.transform = '';
    });
});

// Enhanced Password Validation
function validatePassword() {
    const password = signupPassword.value;
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[@$!%*?&]/.test(password)
    };

    Object.keys(requirements).forEach((req, index) => {
        const li = passwordRequirements[index];
        const isValid = requirements[req];
        
        if (isValid && !li.classList.contains('valid')) {
            li.classList.add('valid');
            li.style.animation = 'slideInRight 0.3s ease-out';
        } else if (!isValid && li.classList.contains('valid')) {
            li.classList.remove('valid');
            li.style.animation = 'shake 0.5s ease-out';
        }
    });

    return Object.values(requirements).every(Boolean);
} 