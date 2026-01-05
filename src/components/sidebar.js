
const menuItems = [
    { name: 'Dashboard', icon: 'layout-dashboard', href: './dashboard.html' },
    { name: 'Ventas', icon: 'shopping-cart', href: './sales.html' }, // Todo: create sales.html
    { name: 'Inventario', icon: 'package', href: './inventory.html' },
    { name: 'Almacenes', icon: 'building-2', href: './warehouses.html' }, // Todo: create warehouses.html
    { name: 'Productos', icon: 'tag', href: './products.html' },
    { name: 'Reportes', icon: 'bar-chart-3', href: './reports.html' },
    { name: 'Usuarios', icon: 'users', href: './users.html' }, // Admin only? 
];

export function renderSidebar(containerId, activePath = './dashboard.html') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const nav = document.createElement('nav');
    nav.className = 'flex-1 py-6 px-3 space-y-2';

    // Logo area
    const logoDiv = document.createElement('div');
    logoDiv.className = 'flex items-center justify-center mb-8';
    logoDiv.innerHTML = `
        <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3 shadow-lg">
            I
        </div>
        <span class="text-xl font-bold tracking-wide">Inventario</span>
    `;
    container.appendChild(logoDiv);

    menuItems.forEach(item => {
        const link = document.createElement('a');
        link.href = item.href;
        const isActive = activePath.endsWith(item.href.substring(2)) || (activePath === '/' && item.href === './dashboard.html'); // Simple check

        link.className = `
            flex items-center px-4 py-3 rounded-lg transition-colors group
            ${isActive
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
        `;

        link.innerHTML = `
            <i data-lucide="${item.icon}" class="w-5 h-5 mr-3 transition-transform group-hover:scale-110"></i>
            <span class="font-medium">${item.name}</span>
        `;
        nav.appendChild(link);
    });

    container.appendChild(nav);

    // Mobile Menu Logic
    const mobileBtn = document.getElementById('mobile-menu-btn');
    if (mobileBtn) {
        // Create overlay if it doesn't exist
        let overlay = document.getElementById('mobile-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'mobile-overlay';
            overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-40 hidden md:hidden';
            document.body.appendChild(overlay);
        }

        const toggleMenu = () => {
            const isHidden = container.classList.contains('hidden');

            if (isHidden) {
                // Open menu
                container.classList.remove('hidden');
                container.classList.add('fixed', 'inset-y-0', 'left-0', 'z-50');
                overlay.classList.remove('hidden');
            } else {
                // Close menu
                container.classList.add('hidden');
                container.classList.remove('fixed', 'inset-y-0', 'left-0', 'z-50');
                overlay.classList.add('hidden');
            }
        };

        // Remove old listeners to avoid duplicates if re-rendered
        const newBtn = mobileBtn.cloneNode(true);
        mobileBtn.parentNode.replaceChild(newBtn, mobileBtn);

        newBtn.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);
    }

    // Trigger Lucide icons refresh if available globally
    if (window.lucide) {
        window.lucide.createIcons();
    }
}
