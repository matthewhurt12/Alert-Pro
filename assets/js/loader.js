// Component Loader for Alert Pro Solutions Website
// Loads header and footer components and handles navigation highlighting

class ComponentLoader {
    constructor() {
        this.init();
    }

    async init() {
        console.log('ComponentLoader: Initializing from path:', window.location.pathname);
        await this.loadComponents();
        this.fixNavigationPaths();
        this.highlightCurrentPage();
        this.initMobileMenu();
    }

    // Load header and footer components
    async loadComponents() {
        await Promise.all([
            this.loadHeader(),
            this.loadFooter()
        ]);
    }

    // Get the correct path to components based on current location
    getComponentPath() {
        const path = window.location.pathname;
        console.log('ComponentLoader: Current pathname:', path);
        
        // Detect if we're on GitHub Pages by checking if path starts with a repo name
        const isGitHubPages = path.startsWith('/Alert-Pro/') || window.location.hostname.includes('github.io');
        
        // Check if we're in a subdirectory (solutions/, products/, industries/)
        const isInSubdirectory = path.includes('/solutions/') || path.includes('/products/') || path.includes('/industries/');
        
        let componentPath;
        if (isGitHubPages && !isInSubdirectory) {
            // On GitHub Pages root, use relative path with repo name
            componentPath = './components/';
        } else if (isInSubdirectory) {
            // In subdirectories, go up one level
            componentPath = '../components/';
        } else {
            // Local development or other hosting
            componentPath = 'components/';
        }
        
        console.log('ComponentLoader: Using component path:', componentPath, 'for current path:', path, 'isGitHubPages:', isGitHubPages, 'isInSubdirectory:', isInSubdirectory);
        return componentPath;
    }

    // Load header component
    async loadHeader() {
        try {
            const componentPath = this.getComponentPath();
            const response = await fetch(`${componentPath}header.html`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const headerHTML = await response.text();
            const headerContainer = document.getElementById('header');
            if (headerContainer) {
                headerContainer.innerHTML = headerHTML;
            } else {
                console.warn('Header container (#header) not found');
            }
        } catch (error) {
            console.error('Error loading header:', error);
        }
    }

    // Load footer component
    async loadFooter() {
        try {
            const componentPath = this.getComponentPath();
            const response = await fetch(`${componentPath}footer.html`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const footerHTML = await response.text();
            const footerContainer = document.getElementById('footer');
            if (footerContainer) {
                footerContainer.innerHTML = footerHTML;
            } else {
                console.warn('Footer container (#footer) not found');
            }
        } catch (error) {
            console.error('Error loading footer:', error);
        }
    }

    // Fix navigation paths based on current directory
    fixNavigationPaths() {
        // Wait for components to be fully loaded
        setTimeout(() => {
            const currentPath = window.location.pathname;
            const isInSubdirectory = currentPath.includes('/solutions/') || currentPath.includes('/products/') || currentPath.includes('/industries/');
            
            if (isInSubdirectory) {
                // We're in a subdirectory, so we need to adjust paths
                const allLinks = document.querySelectorAll('a[href]');
                allLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    
                    if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                        return; // Skip external links, anchors, and special protocols
                    }
                    
                    // Fix solution page links - remove the solutions/ prefix since we're already in solutions/
                    if (href.startsWith('solutions/') && currentPath.includes('/solutions/')) {
                        const newHref = href.replace('solutions/', '');
                        link.setAttribute('href', newHref);
                        console.log(`Fixed solution link: ${href} -> ${newHref}`);
                    }
                    // Fix product page links - remove the products/ prefix since we're already in products/
                    else if (href.startsWith('products/') && currentPath.includes('/products/')) {
                        const newHref = href.replace('products/', '');
                        link.setAttribute('href', newHref);
                        console.log(`Fixed product link: ${href} -> ${newHref}`);
                    }
                    // Fix cross-directory links - add ../ prefix when navigating between subdirectories
                    else if (href.startsWith('solutions/') && currentPath.includes('/products/')) {
                        const newHref = '../' + href;
                        link.setAttribute('href', newHref);
                        console.log(`Fixed cross-directory solution link: ${href} -> ${newHref}`);
                    }
                    else if (href.startsWith('products/') && currentPath.includes('/solutions/')) {
                        const newHref = '../' + href;
                        link.setAttribute('href', newHref);
                        console.log(`Fixed cross-directory product link: ${href} -> ${newHref}`);
                    }
                    // Fix industries page links - remove the industries/ prefix since we're already in industries/
                    else if (href.startsWith('industries/') && currentPath.includes('/industries/')) {
                        const newHref = href.replace('industries/', '');
                        link.setAttribute('href', newHref);
                        console.log(`Fixed industry link: ${href} -> ${newHref}`);
                    }
                    // Fix cross-directory links for industries
                    else if (href.startsWith('industries/') && (currentPath.includes('/solutions/') || currentPath.includes('/products/'))) {
                        const newHref = '../' + href;
                        link.setAttribute('href', newHref);
                        console.log(`Fixed cross-directory industry link: ${href} -> ${newHref}`);
                    }
                    else if ((href.startsWith('solutions/') || href.startsWith('products/')) && currentPath.includes('/industries/')) {
                        const newHref = '../' + href;
                        link.setAttribute('href', newHref);
                        console.log(`Fixed cross-directory link from industries: ${href} -> ${newHref}`);
                    }
                    // Fix root-level page links - add ../ prefix to go up one directory
                    else if (!href.startsWith('../') && !href.includes('/')) {
                        // These are root-level pages that need ../ prefix
                        const rootPages = ['index.html', 'solutions.html', 'products.html', 'industries.html', 'platform.html', 'about.html', 'contact.html'];
                        if (rootPages.includes(href)) {
                            link.setAttribute('href', '../' + href);
                            console.log(`Fixed root link: ${href} -> ../${href}`);
                        }
                    }
                });
            }
        }, 100); // Increased timeout to ensure DOM is ready
    }

    // Highlight current page in navigation
    highlightCurrentPage() {
        // Wait a bit for the header to load
        setTimeout(() => {
            const currentPage = this.getCurrentPageName();
            const navLinks = document.querySelectorAll('.nav-links a');
            
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href) {
                    // Remove any existing active classes
                    link.classList.remove('active');
                    
                    // Check if this link matches the current page
                    if (this.isCurrentPage(href, currentPage)) {
                        link.classList.add('active');
                        // Also highlight parent dropdown if applicable
                        const parentDropdown = link.closest('.nav-dropdown');
                        if (parentDropdown) {
                            const parentLink = parentDropdown.querySelector('a');
                            if (parentLink) {
                                parentLink.classList.add('active');
                            }
                        }
                    }
                }
            });
        }, 100);
    }

    // Get current page name from URL
    getCurrentPageName() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        return filename || 'index.html';
    }

    // Check if a link href matches the current page
    isCurrentPage(href, currentPage) {
        // Handle root/index cases
        if (currentPage === 'index.html' || currentPage === '') {
            return href === 'index.html' || href === '/' || href === './';
        }
        
        // Get the current path for subdirectory matching
        const currentPath = window.location.pathname;
        
        // Direct match
        if (href === currentPage) {
            return true;
        }
        
        // Check if href ends with the current page (for subdirectory links)
        if (href.endsWith(currentPage)) {
            return true;
        }
        
        // Check if current path ends with href (for relative links from subdirectory)
        if (currentPath.endsWith(href)) {
            return true;
        }
        
        // Handle cases where href might have hash fragments
        const hrefBase = href.split('#')[0];
        return hrefBase === currentPage || currentPath.endsWith(hrefBase);
    }

    // Initialize mobile menu functionality
    initMobileMenu() {
        // Wait for header to load
        setTimeout(() => {
            const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
            const navLinks = document.querySelector('.nav-links');
            const body = document.body;

            if (mobileMenuBtn && navLinks) {
                mobileMenuBtn.addEventListener('click', () => {
                    const isOpen = navLinks.classList.contains('nav-open');
                    
                    if (isOpen) {
                        // Close menu
                        navLinks.classList.remove('nav-open');
                        mobileMenuBtn.classList.remove('active');
                        body.classList.remove('nav-open');
                    } else {
                        // Open menu
                        navLinks.classList.add('nav-open');
                        mobileMenuBtn.classList.add('active');
                        body.classList.add('nav-open');
                    }
                });

                // Close menu when clicking on a link
                const navLinksAll = navLinks.querySelectorAll('a');
                navLinksAll.forEach(link => {
                    link.addEventListener('click', (e) => {
                        // Don't close menu if this is a dropdown parent link on mobile
                        if (window.innerWidth <= 768 && link.parentElement.classList.contains('nav-dropdown')) {
                            // This is handled by the dropdown toggle logic below
                            return;
                        }
                        
                        // Close menu for regular links and dropdown children
                        navLinks.classList.remove('nav-open');
                        mobileMenuBtn.classList.remove('active');
                        body.classList.remove('nav-open');
                    });
                });

                // Close menu when clicking outside
                document.addEventListener('click', (e) => {
                    if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                        navLinks.classList.remove('nav-open');
                        mobileMenuBtn.classList.remove('active');
                        body.classList.remove('nav-open');
                    }
                });

                // Handle dropdown toggles on mobile
                const dropdownLinks = document.querySelectorAll('.nav-dropdown > a');
                dropdownLinks.forEach(link => {
                    link.addEventListener('click', (e) => {
                        // Only prevent default on mobile
                        if (window.innerWidth <= 768) {
                            e.preventDefault();
                            const dropdown = link.parentElement;
                            const isOpen = dropdown.classList.contains('dropdown-open');
                            
                            // Close all other dropdowns
                            document.querySelectorAll('.nav-dropdown').forEach(d => {
                                if (d !== dropdown) {
                                    d.classList.remove('dropdown-open');
                                }
                            });
                            
                            // Toggle current dropdown
                            dropdown.classList.toggle('dropdown-open');
                        }
                    });
                });
            }
        }, 150);
    }
}

// Initialize component loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ComponentLoader();
});

// Add CSS for active navigation links and mobile menu
const style = document.createElement('style');
style.textContent = `
    .nav-links a.active {
        color: var(--primary) !important;
        font-weight: 600;
    }
    
    .nav-links a.active::after {
        content: '';
        position: absolute;
        bottom: -0.5rem;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--accent);
        border-radius: 1px;
    }

    /* Mobile Menu Button */
    .mobile-menu-btn {
        display: none;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 4px;
        width: 40px;
        height: 40px;
        border-radius: 8px;
        transition: background-color 0.2s;
    }

    .mobile-menu-btn:hover {
        background-color: var(--bg-light);
    }

    .hamburger-line {
        display: block;
        width: 24px;
        height: 2px;
        background-color: var(--primary);
        transition: all 0.3s ease;
        border-radius: 2px;
    }

    .mobile-menu-btn.active .hamburger-line:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }

    .mobile-menu-btn.active .hamburger-line:nth-child(2) {
        opacity: 0;
    }

    .mobile-menu-btn.active .hamburger-line:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }

    /* Mobile CTA in nav */
    .mobile-cta {
        display: none;
    }

    /* Mobile Styles */
    @media (max-width: 768px) {
        .mobile-menu-btn {
            display: flex;
        }

        .nav-links {
            position: fixed;
            top: 80px;
            left: 0;
            right: 0;
            background: var(--bg-white);
            flex-direction: column;
            padding: 2rem 5%;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            border-top: 1px solid var(--border);
            max-height: calc(100vh - 80px);
            overflow-y: auto;
            transform: translateX(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 999;
        }

        .nav-links.nav-open {
            transform: translateX(0);
            opacity: 1;
            visibility: visible;
        }

        .nav-links li {
            margin-bottom: 0;
            width: 100%;
        }

        .nav-links > li > a {
            display: block;
            padding: 1rem 0;
            border-bottom: 1px solid var(--border);
            font-size: 1.1rem;
            color: var(--primary);
            font-weight: 500;
        }

        .nav-links > li > a:hover {
            color: var(--accent);
        }

        /* Mobile Dropdown Styles */
        .nav-dropdown .dropdown-menu {
            position: static;
            opacity: 1;
            visibility: visible;
            pointer-events: all;
            box-shadow: none;
            border: none;
            background: var(--bg-light);
            padding: 0;
            margin: 0;
            border-radius: 0;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease, padding 0.3s ease;
        }

        .nav-dropdown.dropdown-open .dropdown-menu {
            max-height: 400px;
            padding: 0.5rem 0;
        }

        .nav-dropdown .dropdown-menu a {
            padding: 0.75rem 1.5rem;
            border-bottom: 1px solid var(--border);
            color: var(--text-secondary);
            font-size: 0.95rem;
        }

        .nav-dropdown .dropdown-menu a:hover {
            background: var(--bg-white);
            color: var(--accent);
        }

        .nav-dropdown .dropdown-menu a:last-child {
            border-bottom: none;
        }

        /* Mobile CTA buttons */
        .mobile-cta {
            display: block;
            padding: 2rem 0 1rem;
            border-top: 2px solid var(--border);
            margin-top: 1rem;
        }

        .mobile-cta a {
            display: block;
            margin-bottom: 1rem;
            text-align: center;
            padding: 0.875rem 1.5rem;
        }

        .mobile-cta a:last-child {
            margin-bottom: 0;
        }

        /* Hide desktop CTA on mobile */
        .nav-cta {
            display: none;
        }

        /* Prevent body scroll when menu is open */
        body.nav-open {
            overflow: hidden;
        }

        /* Add dropdown arrow indicator */
        .nav-dropdown > a::after {
            content: '▼';
            float: right;
            font-size: 0.8rem;
            transition: transform 0.3s ease;
            color: var(--text-light);
        }

        .nav-dropdown.dropdown-open > a::after {
            transform: rotate(180deg);
        }
    }
`;
document.head.appendChild(style);
