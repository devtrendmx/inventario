
import { getUser, logout } from '../services/supabase.js';
import { renderSidebar } from '../components/sidebar.js';

async function initDashboard() {
    const user = await getUser();
    if (!user) {
        window.location.href = './login.html';
        return;
    }

    // Update User Name
    // We try to get profile data, but for now just use email or metadata
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) {
        userNameEl.textContent = user.user_metadata?.full_name || user.email;
    }

    // Logout Handler
    document.getElementById('logout-btn').addEventListener('click', async () => {
        await logout();
        window.location.href = './login.html';
    });

    // Render Sidebar
    renderSidebar('sidebar-container', './dashboard.html');

    // Initialize Icons in case they weren't caught
    if (window.lucide) window.lucide.createIcons();

    // Load Stats (Placeholder for now)
    loadStats();
}

function loadStats() {
    // TODO: Fetch real data from Supabase
    const statsContainer = document.getElementById('stats-grid');
    if (!statsContainer) return;

    // Mock Data
    const stats = [
        { label: 'Ventas Totales', value: '$12,450', change: '+12%', icon: 'dollar-sign', color: 'bg-green-100 text-green-600' },
        { label: 'Pedidos', value: '45', change: '+5%', icon: 'shopping-bag', color: 'bg-blue-100 text-blue-600' },
        { label: 'Stock Bajo', value: '12', change: '-2', icon: 'alert-triangle', color: 'bg-orange-100 text-orange-600' },
        { label: 'Productos', value: '1,240', change: '+24', icon: 'package', color: 'bg-purple-100 text-purple-600' },
    ];

    statsContainer.innerHTML = stats.map(stat => `
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-4">
                <div class="p-3 rounded-full ${stat.color}">
                    <i data-lucide="${stat.icon}" class="w-6 h-6"></i>
                </div>
                <span class="text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'} bg-gray-50 px-2 py-1 rounded-full">
                    ${stat.change}
                </span>
            </div>
            <h4 class="text-2xl font-bold text-gray-800">${stat.value}</h4>
            <p class="text-sm text-gray-500 mt-1">${stat.label}</p>
        </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
}

initDashboard();
