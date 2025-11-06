// Nexhivra site interactions
// Colors (for reference):
// charcoal: #73787C, grayx: #C5C6C7, paleblue: #D7E5F0, beige: #C9AD93

// AOS init
// Performance and error monitoring
const monitoring = {
  errors: [],
  init() {
    // Monitor resource loading errors
    window.addEventListener('error', (e) => {
      if (e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK') {
        this.errors.push({
          type: 'resource',
          source: e.target.src || e.target.href,
          timestamp: new Date().toISOString()
        });
        console.warn(`Resource failed to load: ${e.target.src || e.target.href}`);
      }
    }, true);

    // Monitor performance
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log(`LCP: ${entry.startTime}ms`);
          }
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  },
  getErrors() {
    return this.errors;
  }
};

// Cookie consent handling
const cookieConsent = {
  init() {
    if (!this.hasConsent()) {
      setTimeout(() => {
        const banner = document.getElementById('cookie-consent');
        if (banner) {
          banner.classList.remove('translate-y-full');
        }
      }, 1000);
    }
  },
  hasConsent() {
    return localStorage.getItem('cookieConsent') === 'accepted';
  },
  setConsent(accepted) {
    localStorage.setItem('cookieConsent', accepted ? 'accepted' : 'rejected');
    const banner = document.getElementById('cookie-consent');
    if (banner) {
      banner.classList.add('translate-y-full');
    }
  }
};

// Cookie consent button handlers
window.acceptCookies = () => cookieConsent.setConsent(true);
window.rejectCookies = () => cookieConsent.setConsent(false);

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(error => {
        console.warn('ServiceWorker registration failed:', error);
      });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  // Initialize monitoring
  monitoring.init();
  
  // Initialize cookie consent
  cookieConsent.init();
  
  // Initialize AOS
  if (window.AOS) {
    AOS.init({ once: true, duration: 700, easing: 'ease-out-cubic' });
  }

  // Year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile menu toggle
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    }));
  }

  // Debounce helper function
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Sticky navbar style on scroll
  const navbar = document.getElementById('navbar');
  const navbarInner = document.getElementById('navbar-inner');
  const onScroll = () => {
    const scrolled = window.scrollY > 10;
    if (scrolled) {
      navbar.classList.add('bg-white/80','backdrop-blur-6','shadow');
      navbar.classList.remove('bg-transparent');
      if (navbarInner) navbarInner.classList.add('py-3');
    } else {
      navbar.classList.remove('bg-white/80','backdrop-blur-6','shadow');
      if (navbarInner) navbarInner.classList.remove('py-3');
    }
  };
  onScroll();
  window.addEventListener('scroll', debounce(onScroll, 150), { passive: true });

  // Back to top button
  const backToTop = document.getElementById('backToTop');
  const toggleBackToTop = () => {
    if (!backToTop) return;
    if (window.scrollY > 400) backToTop.classList.remove('hidden');
    else backToTop.classList.add('hidden');
  };
  toggleBackToTop();
  window.addEventListener('scroll', toggleBackToTop);
  if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Smooth scroll for in-page anchors with offset for fixed header
  const headerOffset = 70; // approx navbar height
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId.length === 1) return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  // FAQ accordion
  const faqToggles = document.querySelectorAll('.faq-toggle');
  faqToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const container = btn.parentElement;
      const content = container.querySelector('.faq-content');
      const icon = btn.querySelector('svg');
      const isOpen = !content.classList.contains('hidden');

      // close others (optional)
      document.querySelectorAll('#faq .faq-content').forEach(c => {
        if (c !== content) c.classList.add('hidden');
      });

      if (isOpen) {
        content.classList.add('hidden');
        btn.querySelector('span').classList.remove('text-charcoal');
      } else {
        content.classList.remove('hidden');
        btn.querySelector('span').classList.add('text-charcoal');
      }

      if (icon) icon.classList.toggle('rotate-180');
    });
  });

    // Attach contact form submit handler (kept — not part of WhatsApp integration)
    const contactForm = document.querySelector('form[action*="web3forms"]');
    if (contactForm) {
      // Real-time trim and required checks
      const requiredFields = contactForm.querySelectorAll('input[required], textarea[required], select[required]');
      requiredFields.forEach(el => {
        el.addEventListener('input', () => {
          if (typeof el.value === 'string') el.value = el.value.replace(/^\s+|\s+$/g, '');
          el.setCustomValidity('');
        });
        el.addEventListener('invalid', () => {
          if (el.validity.valueMissing) el.setCustomValidity('This field is required');
        });
      });

      contactForm.addEventListener('submit', handleContactForm);
    }
});


// Form handling with rate limiting and validation
const handleContactForm = (() => {
  let lastSubmissionTime = 0;
  const SUBMISSION_DELAY = 2000; // 2 seconds between submissions

  return async (event) => {
    const now = Date.now();
    
    if (now - lastSubmissionTime < SUBMISSION_DELAY) {
      event.preventDefault();
      alert('Please wait a moment before submitting again.');
      return;
    }

    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    
    // Check if redirect is configured
    const redirectInput = form.querySelector('input[name="redirect"]');
    const redirectUrl = redirectInput ? redirectInput.value : null;
    
    // Validate required fields (trim and ensure not empty)
    const requiredFields = form.querySelectorAll('input[required], textarea[required], select[required]');
    for (const el of requiredFields) {
      if (typeof el.value === 'string') el.value = el.value.replace(/^\s+|\s+$/g, '');
      if (!el.value) {
        event.preventDefault();
        el.reportValidity();
        return;
      }
    }

    // If redirect is configured, allow native form submission for better compatibility
    if (redirectUrl) {
      // Just update button state and let form submit naturally
      submitButton.disabled = true;
      submitButton.innerHTML = 'Sending...';
      lastSubmissionTime = now;
      // Don't prevent default - let form submit naturally with redirect
      return;
    }
    
    // If no redirect, use fetch API for better control
    event.preventDefault();
    
    try {
      // Disable button and show loading state
      submitButton.disabled = true;
      submitButton.innerHTML = 'Sending...';
      
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // Try to parse as JSON, but handle non-JSON responses
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // If not JSON, check if response is ok
        if (response.ok) {
          data = { success: true };
        } else {
          throw new Error('Submission failed');
        }
      }
      
      if (!response.ok || (data.success === false)) {
        throw new Error(data.message || 'Submission failed');
      }
      
      // Success handling
      form.reset();
      alert('Thank you! We will get back to you soon.');
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
      lastSubmissionTime = now;
      
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Sorry, there was a problem sending your message. Please try again later.');
      
      // Reset button state on error
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
    }
  };
})();

// End of file (WhatsApp integration removed)