
import { renderSidebar } from '../components/sidebar.js';
import { ChartFactory } from '../components/chart-factory.js';
import { fetchMovements, fetchInventory, getUser } from '../services/supabase.js';

async function init() {
    try {
        const user = await getUser();
        console.log('User:', user);
        if (!user) {
            console.log('No user, redirecting to login');
            window.location.href = './login.html';
            return;
        }

        renderSidebar('sidebar-container', './reports.html');
        await loadReports();
    } catch (error) {
        console.error('Init error:', error);
        alert('Error inicializando: ' + error.message);
    }
}

async function loadReports() {
    const [movRes, invRes] = await Promise.all([fetchMovements(), fetchInventory()]);

    if (movRes.error || invRes.error) {
        console.error(movRes.error || invRes.error);
        return alert('Error cargando datos');
    }

    const movements = movRes.data;
    const inventory = invRes.data;

    // 1. Sales per Day (OUT movements)
    // Group by Date
    const salesByDate = {};
    movements.filter(m => m.type === 'OUT').forEach(m => {
        const date = m.created_at.split('T')[0];
        salesByDate[date] = (salesByDate[date] || 0) + Math.abs(m.quantity);
    });

    const salesData = Object.keys(salesByDate).sort().map(date => ({
        time: date,
        value: salesByDate[date]
    }));

    if (salesData.length > 0) {
        ChartFactory.createAreaChart('sales-chart', salesData);
    } else {
        document.getElementById('sales-chart').innerHTML = 'No hay datos de ventas';
    }

    // 2. Top Products (OUT Volume)
    const productSales = {};
    movements.filter(m => m.type === 'OUT').forEach(m => {
        const pName = m.products ? m.products.name : 'Desc';
        productSales[pName] = (productSales[pName] || 0) + Math.abs(m.quantity);
    });

    // Lightweight charts Histogram needs time scale, which is weird for categorical data.
    // Hack: We map categories to pseudo-dates or just show Top list?
    // Lightweight charts is strictly Time-Series or numeric x-axis.
    // For Top Products (Categorical), lightweight-charts isn't ideal without hacks.
    // I will render a HTML List/Bar for Top Products instead, or mapped to dummy days if persisted.
    // Better: Render HTML bars for Top 5.

    renderTopProductsHTML(productSales);

    // 3. KPI Summary
    const totalStock = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const totalProducts = inventory.length; // Actually distinct products? No, rows in inventory.
    const lowStock = inventory.filter(i => i.quantity < (i.products?.min_stock || 0)).length;

    document.getElementById('inventory-summary').innerHTML = `
        <div class="bg-blue-50 p-4 rounded-lg">
            <h4 class="text-blue-600 font-bold text-2xl">${totalStock}</h4>
            <p class="text-gray-600">Unidades en Stock</p>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
            <h4 class="text-purple-600 font-bold text-2xl">${totalProducts}</h4>
            <p class="text-gray-600">Registros de Inventario</p>
        </div>
        <div class="bg-red-50 p-4 rounded-lg">
            <h4 class="text-red-600 font-bold text-2xl">${lowStock}</h4>
            <p class="text-red-600">Alertas Stock Bajo</p>
        </div>
    `;
}

function renderTopProductsHTML(productSales) {
    const container = document.getElementById('top-chart');
    const sorted = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5);

    if (sorted.length === 0) {
        container.innerHTML = 'No hay datos';
        return;
    }

    const max = sorted[0][1];

    container.innerHTML = `
        <div class="space-y-4">
            ${sorted.map(([name, val]) => `
                <div>
                    <div class="flex justify-between text-sm mb-1">
                        <span>${name}</span>
                        <span class="font-bold">${val}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                        <div class="bg-indigo-600 h-2.5 rounded-full" style="width: ${(val / max) * 100}%"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

init();
