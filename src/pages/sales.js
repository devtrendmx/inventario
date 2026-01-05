
import { renderSidebar } from '../components/sidebar.js';
import { renderTable } from '../components/table.js';
import { Modal } from '../components/modal.js';
import { fetchMovements, createMovement, fetchProducts, fetchWarehouses, getUser } from '../services/supabase.js';

let sales = [];

async function init() {
    const user = await getUser();
    if (!user) window.location.href = './login.html';

    renderSidebar('sidebar-container', './sales.html');
    await loadSales();

    document.getElementById('new-sale-btn').addEventListener('click', () => openSaleModal());
}

async function loadSales() {
    const { data, error } = await fetchMovements();
    if (error) {
        console.error(error);
        return alert('Error cargando ventas');
    }
    // Filter only OUT type
    sales = data.filter(m => m.type === 'OUT');

    renderTable(
        'sales-table-container',
        [
            { header: 'Fecha', key: 'created_at', render: (val) => new Date(val).toLocaleString() },
            { header: 'Producto', key: 'products', render: (p) => p ? `${p.name} (${p.sku})` : '?' },
            {
                header: 'Imagen',
                key: 'products',
                render: (p) => {
                    const url = p?.image_url;
                    return url ?
                        `<img src="${url}" alt="${p.name}" class="w-12 h-12 object-cover rounded-md border border-gray-200" onerror="this.src='https://via.placeholder.com/48?text=No+Img'">` :
                        `<div class="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">Sin imagen</div>`;
                }
            },
            { header: 'Almacén', key: 'warehouses', render: (w) => w ? w.name : '?' },
            { header: 'Cantidad', key: 'quantity', render: (q) => Math.abs(q) }, // Show positive
            { header: 'Vendedor', key: 'user_id', render: () => 'Usuario' },
            { header: 'Ref/Nota', key: 'reference' }
        ],
        sales,
        () => { }, // No edit
        () => { }  // No delete
    );
}

async function openSaleModal() {
    const [pRes, wRes] = await Promise.all([fetchProducts(), fetchWarehouses()]);
    const products = pRes.data;
    const warehouses = wRes.data;

    const content = `
        <form id="sale-form" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">Almacén de Salida</label>
                <select id="s-warehouse" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    ${warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Producto</label>
                <select id="s-product" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    ${products.map(p => `<option value="${p.id}">${p.name} (${p.sku}) - $${p.price}</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Cantidad</label>
                <input type="number" id="s-qty" min="1" value="1" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            </div>
             <div>
                <label class="block text-sm font-medium text-gray-700">Referencia (Cliente/Ticket)</label>
                <input type="text" id="s-ref" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            </div>
        </form>
    `;

    const modal = new Modal('sale-modal', 'Registrar Venta', content, async () => {
        const warehouse_id = document.getElementById('s-warehouse').value;
        const product_id = document.getElementById('s-product').value;
        const qty = parseInt(document.getElementById('s-qty').value);
        const ref = document.getElementById('s-ref').value;

        if (!qty || qty <= 0) return alert('Cantidad inválida');

        const user = await getUser();

        const { error } = await createMovement({
            product_id,
            warehouse_id,
            user_id: user.id,
            type: 'OUT',
            quantity: -qty, // Negative for OUT
            reference: ref
        });

        if (error) alert('Error: ' + error.message);
        else await loadSales();
    });
    modal.open();
}

init();
