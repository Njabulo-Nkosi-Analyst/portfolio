document.addEventListener('DOMContentLoaded', () => {
    // 1. MOBILE MENU
    const menuToggle = document.querySelector('#mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        });
    });

    // 2. THEME TOGGLE
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

    // 3. SCROLL REVEAL (Safe version)
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
            }
        });
    }, observerOptions);

    // To make this work, we add a simple CSS class via JS
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
// 4. SUPABASE AUTH & DATA FETCHING
const loginBtn = document.querySelector('#login-btn');
const userGreeting = document.querySelector('#user-greeting');

const handleAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // 1. Show the greeting
        const name = user.user_metadata.full_name || 'User';
        userGreeting.innerText = `Hi, ${name}`;
        userGreeting.style.display = 'inline-block'; // Make it visible

        // 2. Set button to Logout
        loginBtn.innerHTML = 'Logout';
        loginBtn.onclick = async () => {
            await supabase.auth.signOut();
            window.location.reload();
        };
    } else {
        // 1. Hide the greeting
        userGreeting.style.display = 'none';

        // 2. Set button to Sign In
        loginBtn.innerHTML = 'Sign In';
        loginBtn.onclick = async () => {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: { redirectTo: window.location.origin }
            });
            if (error) console.error("Login Error:", error.message);
        };
    }
};

handleAuth();
});