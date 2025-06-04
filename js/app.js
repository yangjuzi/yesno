// YesNo.Pro - Enhanced JavaScript Functionality

// Common utilities and interactions
class YesNoApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupAnimations();
        this.setupTheme();
        this.setupAccessibility();
    }

    // Navigation functionality
    setupNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.getElementById('navMenu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });

            // Close nav when clicking on links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                });
            });

            // Close nav when clicking outside
            document.addEventListener('click', (e) => {
                if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                    navMenu.classList.remove('active');
                }
            });
        }
    }

    // Animation setup
    setupAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || '0.2s';
                    entry.target.style.animationDelay = delay;
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe all elements with fade-in class
        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });

        // Add entrance animations to cards
        this.animateCards();
    }

    animateCards() {
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.style.setProperty('--delay', `${index * 0.1}s`);
        });
    }

    // Theme management
    setupTheme() {
        // Detect system theme preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Listen for theme changes
        prefersDark.addEventListener('change', (e) => {
            this.updateTheme(e.matches ? 'dark' : 'light');
        });
    }

    updateTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update any theme-dependent elements
        const themeElements = document.querySelectorAll('[data-theme-target]');
        themeElements.forEach(el => {
            el.classList.toggle('dark-theme', theme === 'dark');
        });
    }

    // Accessibility enhancements
    setupAccessibility() {
        // Add keyboard navigation for custom elements
        this.setupKeyboardNavigation();
        
        // Enhance focus management
        this.setupFocusManagement();
        
        // Add aria labels dynamically
        this.setupAriaLabels();
    }

    setupKeyboardNavigation() {
        // Handle Enter/Space key presses on custom buttons
        document.querySelectorAll('[role="button"]').forEach(button => {
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });
    }

    setupFocusManagement() {
        // Trap focus in modals/dropdowns when they're open
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close any open modals/dropdowns
                document.querySelectorAll('.nav-menu.active').forEach(menu => {
                    menu.classList.remove('active');
                });
            }
        });
    }

    setupAriaLabels() {
        // Add descriptive aria-labels to interactive elements
        document.querySelectorAll('button:not([aria-label])').forEach(button => {
            const text = button.textContent.trim();
            if (text) {
                button.setAttribute('aria-label', text);
            }
        });
    }

    // Utility methods
    static showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add styles
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-medium)',
            backgroundColor: type === 'success' ? 'var(--green-primary)' : 
                           type === 'error' ? 'var(--red-primary)' : 'var(--blue-primary)',
            color: 'white',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Remove after delay
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    static copyToClipboard(text) {
        if (navigator.clipboard) {
            return navigator.clipboard.writeText(text).then(() => {
                YesNoApp.showToast('已复制到剪贴板', 'success');
                return true;
            }).catch(() => {
                YesNoApp.showToast('复制失败', 'error');
                return false;
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                YesNoApp.showToast('已复制到剪贴板', 'success');
                return true;
            } catch (err) {
                document.body.removeChild(textArea);
                YesNoApp.showToast('复制失败', 'error');
                return false;
            }
        }
    }

    static share(data) {
        if (navigator.share) {
            return navigator.share(data).catch(err => {
                console.log('分享取消或失败:', err);
            });
        } else {
            // Fallback to copy
            const shareText = `${data.title}\n${data.text}\n${data.url}`;
            return YesNoApp.copyToClipboard(shareText);
        }
    }

    // Enhanced random selection with visual feedback
    static async getRandomChoice(choices, options = {}) {
        const {
            delay = 1000,
            showSpinner = true,
            buttonElement = null
        } = options;

        if (buttonElement && showSpinner) {
            const originalText = buttonElement.textContent;
            buttonElement.textContent = '思考中...';
            buttonElement.disabled = true;
        }

        // Add suspense delay
        await new Promise(resolve => setTimeout(resolve, delay));

        const result = choices[Math.floor(Math.random() * choices.length)];

        if (buttonElement) {
            buttonElement.textContent = buttonElement.dataset.originalText || '获取答案';
            buttonElement.disabled = false;
        }

        return result;
    }

    // Form validation helpers
    static validateForm(formElement) {
        const inputs = formElement.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            const value = input.value.trim();
            if (!value) {
                input.classList.add('error');
                isValid = false;
            } else {
                input.classList.remove('error');
            }
        });

        return isValid;
    }

    // Smooth scroll to element
    static scrollToElement(element, options = {}) {
        const defaultOptions = {
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        };

        element.scrollIntoView({ ...defaultOptions, ...options });
    }
}

// Enhanced Oracle functionality
class OracleEngine {
    constructor() {
        this.answers = ['Yes', 'No'];
        this.wisdom = [
            "相信你内心的声音",
            "有时候最简单的答案就是最好的",
            "每个选择都是通往新体验的门",
            "勇敢面对未知的可能性",
            "相信自己的判断力"
        ];
    }

    async getAnswer(question, options = {}) {
        const {
            includeWisdom = false,
            delay = 1500
        } = options;

        // Simulate thinking time
        await new Promise(resolve => setTimeout(resolve, delay));

        const answer = this.answers[Math.floor(Math.random() * this.answers.length)];
        const result = { answer, question };

        if (includeWisdom) {
            result.wisdom = this.wisdom[Math.floor(Math.random() * this.wisdom.length)];
        }

        return result;
    }

    getRandomWisdom() {
        return this.wisdom[Math.floor(Math.random() * this.wisdom.length)];
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.yesNoApp = new YesNoApp();
    window.oracleEngine = new OracleEngine();
    
    // Add some visual polish
    document.body.classList.add('loaded');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { YesNoApp, OracleEngine };
} 