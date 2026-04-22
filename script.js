import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. MOBILE MENU ---
    const menuToggle = document.querySelector('#mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    }

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks) navLinks.classList.remove('active');
            const icon = menuToggle?.querySelector('i');
            if (icon) {
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            }
        });
    });

    // --- 2. THEME TOGGLE (Light/Dark) ---
    const toggleSwitch = document.querySelector('#checkbox');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'light' && toggleSwitch) {
            toggleSwitch.checked = true;
        }
    }

    if (toggleSwitch) {
        toggleSwitch.addEventListener('change', (e) => {
            const theme = e.target.checked ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        });
    }

    // --- 3. SCROLL REVEAL ANIMATION ---
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
            }
        });
    }, observerOptions);

    const style = document.createElement('style');
    style.innerHTML = `
        .reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s ease-out; }
        .reveal-visible { opacity: 1 !important; transform: translateY(0) !important; }
    `;
    document.head.appendChild(style);

    document.querySelectorAll('section, .project-item, .skill-card').forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });

    // --- 4. SECURITY & ACCESS LOGIC (THE FIX) ---
    async function checkAccess() {
        const { data: { session } } = await supabase.auth.getSession();
        const isGuest = localStorage.getItem('accessMode') === 'guest';
        const path = window.location.pathname;
        
        // Detect if we are on the login page to prevent infinite loops
        const isAtLoginPage = path.includes('login.html');

        // A. If NOT logged in, NOT a guest, and NOT on login page -> Send to login
        if (!session && !isGuest && !isAtLoginPage) {
            window.location.href = 'login.html';
            return;
        }

        // B. If ALREADY logged in and trying to access login page -> Send to index
        if ((session || isGuest) && isAtLoginPage) {
            window.location.href = 'index.html';
            return;
        }

        // C. Project Visibility Logic (On index page)
        if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
            const privateProjects = document.querySelectorAll('.private-project');
            const greeting = document.getElementById('user-greeting');

            if (session) {
                // Member State
                privateProjects.forEach(p => p.style.display = 'block');
                if (greeting) {
                    const name = session.user.user_metadata.full_name || 'Member';
                    greeting.innerText = `Hi, ${name}`;
                    greeting.style.display = 'inline-block';
                }
            } else {
                // Guest State
                privateProjects.forEach(p => p.style.display = 'none');
                if (greeting) greeting.style.display = 'none';
            }
        }
    }

    // --- 5. BUTTON LISTENERS ---

    // Login Button (GitHub)
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            localStorage.removeItem('accessMode'); // Clear guest flag
            await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: { 
                    redirectTo: window.location.origin + '/index.html',
                    queryParams: { prompt: 'select_account' }
                }
            });
        });
    }

    // Guest Button
    const guestBtn = document.getElementById('guest-btn');
    if (guestBtn) {
        guestBtn.addEventListener('click', () => {
            localStorage.setItem('accessMode', 'guest');
            window.location.href = 'index.html';
        });
    }

    // Logout Button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await supabase.auth.signOut();
            localStorage.clear(); 
            window.location.href = 'login.html';
        });
    }

    // Listen for Auth changes
    supabase.auth.onAuthStateChange(() => {
        checkAccess();
    });

    // Run Initial Check
    checkAccess();
});

// --- 6. ACHIEVEMENT SLIDER ---
let slideIndex = 0;
const slides = document.querySelectorAll('.achievement-slide');
const dots = document.querySelectorAll('.dot');

function showSlide(n) {
    if (slides.length === 0) return;
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    
    slides[n].classList.add('active');
    dots[n].classList.add('active');
    slideIndex = n;
}

window.currentSlide = function(n) {
    showSlide(n);
};

if (slides.length > 0) {
    setInterval(() => {
        slideIndex = (slideIndex + 1) % slides.length;
        showSlide(slideIndex);
    }, 6000);
}