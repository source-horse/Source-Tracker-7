// DOM Elements
const contactForm = document.getElementById('contactForm');
const messageInput = document.getElementById('message');
const charCount = document.getElementById('charCount');
const fileInput = document.getElementById('file');
const loadingSpinner = document.getElementById('loadingSpinner');
const toastContainer = document.getElementById('toastContainer');
const mobileMenuButton = document.querySelector('.mobile-menu-button');
const navLinks = document.querySelector('.nav-links');

// Mobile Menu Toggle
mobileMenuButton.addEventListener('click', () => {
    navLinks.classList.toggle('show');
});

// Character Counter
messageInput.addEventListener('input', () => {
    const currentLength = messageInput.value.length;
    charCount.textContent = currentLength;
    
    // Visual feedback when approaching limit
    if (currentLength >= 900) {
        charCount.style.color = '#e74c3c';
    } else {
        charCount.style.color = 'inherit';
    }
});

// File Size Validation
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            showToast('File size exceeds 5MB limit', 'error');
            fileInput.value = ''; // Clear the input
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            showToast('Invalid file type. Please upload JPG, PNG, or PDF', 'error');
            fileInput.value = '';
            return;
        }
    }
});

// Form Validation
function validateForm() {
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address', 'error');
        return false;
    }

    // Subject validation
    if (!subject) {
        showToast('Please select a subject', 'error');
        return false;
    }

    // Message validation
    if (!message.trim()) {
        showToast('Please enter your message', 'error');
        return false;
    }

    return true;
}

// Show Toast Message
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Rate Limiting
const submissionTimestamps = [];
const MAX_SUBMISSIONS = 5;
const TIME_WINDOW = 3600000; // 1 hour in milliseconds

function checkRateLimit() {
    const now = Date.now();
    // Remove timestamps older than the time window
    while (submissionTimestamps.length > 0 && submissionTimestamps[0] < now - TIME_WINDOW) {
        submissionTimestamps.shift();
    }
    
    if (submissionTimestamps.length >= MAX_SUBMISSIONS) {
        showToast('Too many submissions. Please try again later.', 'error');
        return false;
    }
    
    return true;
}

// Form Submission
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm() || !checkRateLimit()) {
        return;
    }

    // Show loading spinner
    loadingSpinner.classList.remove('hidden');

    try {
        // Simulate API call (replace with actual API endpoint)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Record submission timestamp for rate limiting
        submissionTimestamps.push(Date.now());

        // Success handling
        showToast('Your message has been sent! Check your email for confirmation.');
        contactForm.reset();
        charCount.textContent = '0';

        // Optional: Trigger email confirmation
        // await sendConfirmationEmail(email);

    } catch (error) {
        console.error('Form submission error:', error);
        showToast('Failed to send message. Please try again or email us directly.', 'error');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
});

// Form Field Validation Feedback
const formInputs = contactForm.querySelectorAll('input, select, textarea');
formInputs.forEach(input => {
    input.addEventListener('invalid', (e) => {
        e.preventDefault();
        input.classList.add('error');
        
        let message = 'This field is required';
        if (input.type === 'email') {
            message = 'Please enter a valid email address';
        }
        
        showToast(message, 'error');
    });

    input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
            input.classList.remove('error');
        }
    });
});

// Help Center Search Suggestions
const subjectSelect = document.getElementById('subject');
const helpCenterLink = document.querySelector('.help-center-link');

const helpArticles = {
    'account': '/help/account-issues',
    'feature': '/help/features-guide',
    'billing': '/help/billing-faq',
    'bug': '/help/known-issues',
    'other': '/help'
};

subjectSelect.addEventListener('change', () => {
    const selected = subjectSelect.value;
    if (selected && helpArticles[selected]) {
        helpCenterLink.href = helpArticles[selected];
    }
});

// Accessibility Enhancements
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('show')) {
        navLinks.classList.remove('show');
    }
});

// Add aria-expanded attribute to mobile menu button
mobileMenuButton.setAttribute('aria-expanded', 'false');
mobileMenuButton.addEventListener('click', () => {
    const isExpanded = navLinks.classList.contains('show');
    mobileMenuButton.setAttribute('aria-expanded', isExpanded.toString());
}); 