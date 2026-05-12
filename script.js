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

    // --- 2. THEME TOGGLE ---
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

    // --- 3. SCROLL REVEAL ---
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

    // --- 4. HYBRID PROJECT FETCH (The New Feature) ---
    async function loadNewProjects() {
        const container = document.getElementById('dynamic-projects-container');
        if (!container) return;

        try {
            const { data: newProjects, error } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            container.innerHTML = ''; // Clear to prevent duplicates

            if (newProjects && newProjects.length > 0) {
                newProjects.forEach(project => {
                    const projectCard = document.createElement('div');
                    projectCard.className = 'project-card reveal';
                    projectCard.innerHTML = `
                        <div class="project-content">
                            <span class="badge" style="background: #00d2ff; color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold;">NEW</span>
                            <h3>${project.title}</h3>
                            <p>${project.description || ''}</p>
                            <div class="hero-btns">
                                <a href="${project.project_url || '#'}" target="_blank" class="btn primary" style="padding: 8px 15px; font-size: 0.8rem;">View Project</a>
                            </div>
                        </div>
                    `;
                    container.appendChild(projectCard);
                    observer.observe(projectCard); // Apply scroll reveal to new items
                });
            }
        } catch (err) {
            console.warn("Project fetch notice:", err.message);
        }
    }

    // --- 5. SECURITY & ACCESS LOGIC ---
async function checkAccess() {
    const { data: { session } } = await supabase.auth.getSession();
    const isGuest = localStorage.getItem('accessMode') === 'guest';

    // If on login page, redirect away if already logged in
    if (window.location.pathname.includes('login')) {
        if (session || isGuest) window.location.href = 'index.html';
        return;
    }

    // On portfolio page — guard access
    if (!session && !isGuest) {
        window.location.href = 'login.html';
        return;
    }

    // Show/hide content based on session
    const privateProjects = document.querySelectorAll('.private-project');
    const greeting = document.getElementById('user-greeting');
    const logoutBtn = document.getElementById('logout-btn');

  if (session) {
    privateProjects.forEach(p => p.style.display = 'block');
    if (greeting) {
        const name = session.user.user_metadata.full_name || session.user.email || 'Member';
        greeting.innerText = `Hi, ${name}`;
        greeting.style.display = 'inline-block';
    }
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
} else if (isGuest) {
    // Guest — hide private projects but SHOW logout button
    privateProjects.forEach(p => p.style.display = 'none');
    if (greeting) {
        greeting.innerText = 'Guest';
        greeting.style.display = 'inline-block';
    }
    if (logoutBtn) logoutBtn.style.display = 'inline-block'; // ← this was missing
}
}

    // --- 6. AUTH STATE LISTENER ---
   supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    } else if (event === 'SIGNED_OUT') {
        window.location.href = 'login.html';
    }

        checkAccess();
      loadNewProjects();
    });

    // --- 7. BUTTON LISTENERS ---
// --- GITHUB LOGIN ---
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault(); // This stops the "glitch" refresh
        
       const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
        redirectTo: 'https://njabulo-nkosi-analysts.vercel.app/index.html'
    }
});

        if (error) {
            console.error("Login failed:", error.message);
            alert("Check your Supabase Dashboard settings!");
        }
    });
}

// --- FREE VERSION (GUEST) ---
const guestBtn = document.getElementById('guest-btn');
if (guestBtn) {
    guestBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.setItem('accessMode', 'guest');
        window.location.href = 'index.html';
    });
}

    const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        localStorage.clear(); // clears guest mode AND supabase session
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    });
}

    // Initial Runs
    checkAccess();
    loadNewProjects();

}); // END DOMCONTENTLOADED

// --- 8. ACHIEVEMENT SLIDER LOGIC ---
let slideIndex = 0;
const slides = document.querySelectorAll('.achievement-slide');
const dots = document.querySelectorAll('.dot');

function showSlide(n) {
    if (!slides.length) return;
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    if (slides[n]) slides[n].classList.add('active');
    if (dots[n]) dots[n].classList.add('active');
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