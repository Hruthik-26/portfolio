/**
 * Global JavaScript for Kurapati Hruthik's 3D Portfolio
 * Coordinates animations, theme configuration, 3D card tilt effects, and page analytics
 */

document.addEventListener('DOMContentLoaded', () => {
  // Highlight active navbar link
  highlightNavbar();

  // Setup typing effect on hero page
  initTypingEffect();

  // Setup 3D card tilt effect for tilt cards
  init3dTiltEffect();

  // Render dynamic dashboard analytics (only if on admin.html)
  initAnalyticsUpdates();
});

/**
 * Highlights the current active page in the navbar
 */
function highlightNavbar() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.navbar-custom .nav-link');
  
  navLinks.forEach(link => {
    // Get the filename from href
    const hrefAttr = link.getAttribute('href');
    if (currentPath.endsWith(hrefAttr) || (currentPath.endsWith('/') && hrefAttr === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Dynamic typing animation for hero subheadings
 */
function initTypingEffect() {
  const target = document.getElementById('typing-text');
  if (!target) return;

  const roles = [
    'Computer Science Engineer',
    'Software Developer',
    'Full-Stack Developer'
  ];

  let currentRoleIdx = 0;
  let currentCharIdx = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function type() {
    const fullText = roles[currentRoleIdx];
    
    if (isDeleting) {
      target.textContent = fullText.substring(0, currentCharIdx - 1);
      currentCharIdx--;
      typingSpeed = 50; // Deleting is faster
    } else {
      target.textContent = fullText.substring(0, currentCharIdx + 1);
      currentCharIdx++;
      typingSpeed = 100; // Normal typing speed
    }

    // Add cursor spacer
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.innerHTML = '&nbsp;';
    target.appendChild(cursor);

    if (!isDeleting && currentCharIdx === fullText.length) {
      // Pause at full word
      typingSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && currentCharIdx === 0) {
      isDeleting = false;
      // Cycle to next role
      currentRoleIdx = (currentRoleIdx + 1) % roles.length;
      typingSpeed = 500; // Short pause before typing next
    }

    setTimeout(type, typingSpeed);
  }

  // Start typing
  setTimeout(type, 800);
}

/**
 * Premium 3D tilt effect for card layouts
 */
function init3dTiltEffect() {
  const cards = document.querySelectorAll('.tilt-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      // Mouse coordinates relative to card
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Normalize coordinates: center is (0,0), edges are ranges [-0.5, 0.5]
      const normalizedX = (x / rect.width) - 0.5;
      const normalizedY = (y / rect.height) - 0.5;

      // Target maximum rotation in degrees
      const maxRotation = 12;

      // Calculate angles (X rotation depends on relative Y position, Y rotation depends on relative X position)
      const rotateX = -normalizedY * maxRotation;
      const rotateY = normalizedX * maxRotation;

      // Apply transform with smooth style properties
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      
      // Dynamic glare overlay effect
      const brightness = 1 + (normalizedY * 0.1);
      card.style.filter = `brightness(${brightness})`;
    });

    card.addEventListener('mouseleave', () => {
      // Reset animations
      card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.filter = 'brightness(1)';
    });
  });
}

/**
 * Updates analytics dashboards in real-time on admin page
 */
function initAnalyticsUpdates() {
  const viewsEl = document.getElementById('analytics-views');
  const timerEl = document.getElementById('analytics-session-time');
  
  if (!viewsEl && !timerEl) return;

  // Initial update
  if (viewsEl && typeof getPageViewCount === 'function') {
    viewsEl.textContent = getPageViewCount().toString();
  }

  // Session timer update loop (every second)
  if (timerEl && typeof getSessionDuration === 'function') {
    setInterval(() => {
      timerEl.textContent = getSessionDuration();
    }, 1000);
  }
}
