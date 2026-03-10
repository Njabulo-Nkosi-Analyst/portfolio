/**
 * Njabulo Nkosi Portfolio - Theme Logic
 * Handles Dark/Light mode switching and local storage persistence.
 */

// 1. Select the checkbox input from the HTML
const toggleSwitch = document.querySelector('#checkbox');

// 2. Check for a saved theme in the browser's local storage
const currentTheme = localStorage.getItem('theme');

// 3. If a theme was previously saved, apply it immediately
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);

    // If the saved theme is light, make sure the toggle switch is "ON"
    if (currentTheme === 'light') {
        toggleSwitch.checked = true;
    }
}

/**
 * Function: switchTheme
 * Triggered whenever the user clicks the toggle slider.
 */
function switchTheme(e) {
    if (e.target.checked) {
        // Switch to Light Mode
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light'); // Save preference
    } else {
        // Switch to Dark Mode (Default)
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark'); // Save preference
    }    
}

// 4. Listen for the "change" event on the checkbox
toggleSwitch.addEventListener('change', switchTheme, false);

/**
 * Professional Note: 
 * Using 'document.documentElement' allows the CSS to update 
 * variables globally, which is the most efficient way to handle themes.
 */