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
        const isInSubdirectory = path.includes('/solutions/') || path.includes('/products/') || path.includes('/industries/') || path.split('/').length > 2;
        const componentPath = isInSubdirectory ? '../components/' : 'components/';
        console.log('ComponentLoader: Using component path:', componentPath, 'for current path:', path);
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
}

// Initialize component loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ComponentLoader();
});

// Add CSS for active navigation links
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
`;
document.head.appendChild(style);
