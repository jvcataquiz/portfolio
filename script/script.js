document.addEventListener('DOMContentLoaded', () => {
    const educationCards = document.querySelectorAll('.education-card');

    educationCards.forEach(card => {
        const textElement = card.querySelector('.text');
        const toggleElement = card.querySelector('.toggleRead');
        const fullText = textElement.textContent.trim();
        const truncatedText = fullText.substring(0, 100);

        // Initially truncate the text
        if (fullText.length > 100) {
            textElement.textContent = truncatedText;
            toggleElement.style.display = 'inline';
        } else {
            toggleElement.style.display = 'none';
        }

        toggleElement.addEventListener('click', () => {
            if (textElement.textContent === truncatedText) {
                textElement.textContent = fullText;
                toggleElement.textContent = ' Show less';
            } else {
                textElement.textContent = truncatedText;
                toggleElement.textContent = '... Read more';
            }
        });
    });
});

// Close menu when clicking outside
function closeMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.remove('active');
    document.body.style.overflow = '';
}

document.addEventListener('click', function (event) {
    const navLinks = document.getElementById('navLinks');
    const nav = document.querySelector('nav');

    if (!nav.contains(event.target) && navLinks.classList.contains('active')) {
        closeMenu();
    }
});

// Typing animation
const roles = ['Senior Analyst', 'Software Engineer', 'Java Developer', 'Computer Engineer', 'Spring Boot Specialist', 'Back-End Engineer'];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingElement = document.getElementById('typingText');
const typingSpeed = 100;
const deletingSpeed = 50;
const delayBetweenWords = 2000;

function typeText() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
        typingElement.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingElement.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
    }

    let speed = isDeleting ? deletingSpeed : typingSpeed;
    typingElement.innerHTML += '<span style="visibility: hidden;">|</span>';


    if (!isDeleting && charIndex === currentRole.length) {
        speed = delayBetweenWords;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        speed = 500;
    }

    setTimeout(typeText, speed);
}

// Start typing animation
setTimeout(typeText, 1000);

// Theme toggle
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('.theme-toggle .icon');
    const themeLabel = document.querySelector('.theme-toggle .label');

    body.classList.toggle('light-mode');

    if (body.classList.contains('light-mode')) {
        themeIcon.textContent = '☀️';
        themeLabel.textContent = 'Light Mode';
        localStorage.setItem('theme', 'light');
    } else {
        themeIcon.textContent = '🌙';
        themeLabel.textContent = 'Dark Mode';
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.querySelector('.theme-toggle .icon');
    const themeLabel = document.querySelector('.theme-toggle .label');

    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeIcon.textContent = '☀️';
        themeLabel.textContent = 'Light Mode';
    }
});

// Header scroll effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});


// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});