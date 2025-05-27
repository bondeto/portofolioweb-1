// DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    initializePortfolio();
});

// Initialize all portfolio functionality
function initializePortfolio() {
    setupMobileNavigation();
    setupSmoothScrolling();
    setupContactForm();
    setupScrollAnimations();
    fetchProjects();
    setupActiveNavigation();
}

// Mobile Navigation Toggle
function setupMobileNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }
}

// Smooth Scrolling for Navigation Links
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link, .btn[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 70; // Account for fixed navbar
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Active Navigation Highlighting
function setupActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveNav() {
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav(); // Initial call
}

// Contact Form Handling
function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const formObject = Object.fromEntries(formData);
            
            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            try {
                // Simulate form submission (replace with actual endpoint)
                await simulateFormSubmission(formObject);
                
                // Show success message
                showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
                contactForm.reset();
                
            } catch (error) {
                console.error('Form submission error:', error);
                showNotification('Failed to send message. Please try again.', 'error');
            } finally {
                // Reset button state
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// Simulate form submission (replace with actual API call)
async function simulateFormSubmission(formData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate success/failure
            if (Math.random() > 0.1) { // 90% success rate
                resolve(formData);
            } else {
                reject(new Error('Submission failed'));
            }
        }, 2000);
    });
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;

    // Add to DOM
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Scroll Animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.stat, .skill-category, .project, .contact-item');
    animateElements.forEach(el => observer.observe(el));
}

// Fetch and Display Projects
async function fetchProjects() {
    try {
        const response = await fetch('/projects');
        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }
        const projects = await response.json();
        displayProjects(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        displayFallbackProjects();
    }
}

// Display Projects
function displayProjects(projects) {
    const projectsContainer = document.getElementById('projects-container');
    if (!projectsContainer) return;

    projectsContainer.innerHTML = '';

    projects.forEach((project, index) => {
        const projectElement = createProjectElement(project, index);
        projectsContainer.appendChild(projectElement);
    });
}

// Create Project Element
function createProjectElement(project, index) {
    const projectDiv = document.createElement('div');
    projectDiv.classList.add('project');
    projectDiv.style.animationDelay = `${index * 0.1}s`;

    projectDiv.innerHTML = `
        <div class="project-image">
            <img src="${project.imageUrl || 'https://via.placeholder.com/400x200?text=Project+Image'}" 
                 alt="${project.title}" 
                 loading="lazy"
                 onerror="this.src='https://via.placeholder.com/400x200?text=Project+Image'">
        </div>
        <div class="project-content">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="project-tech">
                ${project.technologies ? project.technologies.map(tech => 
                    `<span class="tech-tag">${tech}</span>`
                ).join('') : ''}
            </div>
            <div class="project-links">
                ${project.liveUrl ? `<a href="${project.liveUrl}" target="_blank" class="project-link">
                    <i class="fas fa-external-link-alt"></i> Live Demo
                </a>` : ''}
                ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" class="project-link">
                    <i class="fab fa-github"></i> Source Code
                </a>` : ''}
            </div>
        </div>
    `;

    return projectDiv;
}

// Fallback Projects (when server is not available)
function displayFallbackProjects() {
    const fallbackProjects = [
        {
            title: "E-Commerce Platform",
            description: "A full-stack e-commerce solution built with React, Node.js, and MongoDB. Features include user authentication, payment processing, and admin dashboard.",
            imageUrl: "https://via.placeholder.com/400x200?text=E-Commerce+Platform",
            technologies: ["React", "Node.js", "MongoDB", "Stripe"],
            liveUrl: "#",
            githubUrl: "#"
        },
        {
            title: "Task Management App",
            description: "A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.",
            imageUrl: "https://via.placeholder.com/400x200?text=Task+Management+App",
            technologies: ["Vue.js", "Express.js", "Socket.io", "PostgreSQL"],
            liveUrl: "#",
            githubUrl: "#"
        },
        {
            title: "Weather Dashboard",
            description: "A responsive weather dashboard that displays current conditions and forecasts using external APIs with beautiful data visualizations.",
            imageUrl: "https://via.placeholder.com/400x200?text=Weather+Dashboard",
            technologies: ["JavaScript", "Chart.js", "OpenWeather API", "CSS3"],
            liveUrl: "#",
            githubUrl: "#"
        }
    ];

    displayProjects(fallbackProjects);
}

// Navbar Background on Scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Typing Effect for Hero Title (Optional Enhancement)
function setupTypingEffect() {
    const titleElement = document.querySelector('.hero-title');
    if (!titleElement) return;

    const originalText = titleElement.innerHTML;
    const textToType = "Hi, I'm John Doe";
    
    titleElement.innerHTML = 'Hi, I\'m <span class="highlight"></span>';
    const highlightSpan = titleElement.querySelector('.highlight');
    
    let i = 0;
    const typingSpeed = 100;
    
    function typeWriter() {
        if (i < "John Doe".length) {
            highlightSpan.textContent += "John Doe".charAt(i);
            i++;
            setTimeout(typeWriter, typingSpeed);
        }
    }
    
    // Start typing effect after a delay
    setTimeout(typeWriter, 1000);
}

// Performance Optimization: Lazy Loading Images
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Error Handling for Images
document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
    }
}, true);

// Add CSS for additional project styling
const additionalStyles = `
    .project-tech {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin: 1rem 0;
    }
    
    .tech-tag {
        background: #e2e8f0;
        color: #475569;
        padding: 0.25rem 0.75rem;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .project-links {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .project-link {
        color: #2563eb;
        text-decoration: none;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: color 0.3s ease;
    }
    
    .project-link:hover {
        color: #1d4ed8;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }
    
    .nav-link.active {
        color: #2563eb;
    }
    
    .nav-link.active::after {
        width: 100%;
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
