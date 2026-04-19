// ==========================================
// 0. SUPABASE CONFIGURATION (ADD YOUR KEYS HERE)
// ==========================================
// Go to Supabase -> Settings -> API to find these
// 1. The URL you just found
const supabaseUrl = 'https://tafkbiwvzewddlkocysq.supabase.co'; 

// 2. The Key you copied from the "Publishable key" section in your screenshot
const supabaseKey = 'sb_publishable_0ZB23W5Ni4cogAzKpd5Uyg_R38i_KAP';
                      
// 3. This line creates the "Bridge" to your database
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --- Your existing document.addEventListener starts below this line ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. MOBILE MENU
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

    // 3. SCROLL REVEAL
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

    // 4. SUPABASE AUTH & DATA FETCHING
    const loginBtn = document.querySelector('#login-btn');
    const userGreeting = document.querySelector('#user-greeting');

    const handleAuth = async () => {
        // This check works now because 'supabase' is defined at the top
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Logged In State
            const name = user.user_metadata.full_name || 'User';
            if (userGreeting) {
                userGreeting.innerText = `Hi, ${name}`;
                userGreeting.style.display = 'inline-block';
            }

            if (loginBtn) {
                loginBtn.innerHTML = 'Logout';
                loginBtn.onclick = async () => {
                    await supabase.auth.signOut();
                    window.location.reload();
                };
            }
        } else {
            // Logged Out State
            if (userGreeting) userGreeting.style.display = 'none';
            
            if (loginBtn) {
                loginBtn.innerHTML = 'Sign In';
                loginBtn.onclick = async () => {
                    const { error } = await supabase.auth.signInWithOAuth({
                        provider: 'github',
                        options: { redirectTo: window.location.origin }
                    });
                    if (error) console.error("Login Error:", error.message);
                };
            }
        }
    };

    handleAuth();
});