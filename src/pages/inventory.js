
import { renderSidebar } from '../components/sidebar.js';
import { renderTable } from '../components/table.js';
import { Modal } from '../components/modal.js';
import { fetchInventory, createMovement, fetchProducts, fetchWarehouses, getUser } from '../services/supabase.js';

let inventory = [];

async function init() {
    const user = await getUser();
    if (!user) window.location.href = './login.html';

    renderSidebar('sidebar-container', './inventory.html');
    await loadInventory();

    document.getElementById('adjust-btn').addEventListener('click', () => openAdjustmentModal());
    document.getElementById('transfer-btn').addEventListener('click', () => openTransferModal());
}

async function loadInventory() {
    const { data, error } = await fetchInventory();
    if (error) {
        console.error(error);
        return alert('Error cargando inventario');
    }
    inventory = data;
    renderTable(
        'inventory-table-container',
        [
            { header: 'Producto', key: 'products', render: (p) => p ? `${p.name} (${p.sku})` : '?' },
            {
                header: 'Imagen',
                key: 'products',
                render: (p) => {
                    const url = p?.image_url;
                    return url ?
                        `<img src="${url}" alt="${p.name}" class="w-16 h-16 object-cover rounded-md border border-gray-200" onerror="this.src='https://via.placeholder.com/64?text=No+Img'">` :
                        `<div class="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">Sin imagen</div>`;
                }
            },
            { header: 'Almacén', key: 'warehouses', render: (w) => w ? w.name : '?' },
            { header: 'Stock', key: 'quantity', render: (q, row) => `${q} ${row.products?.unit || ''}` },
            { header: 'Última Act.', key: 'updated_at', render: (val) => new Date(val).toLocaleString() }
        ],
        inventory,
        () => { }, // No direct edit, use adjustments
        () => { }  // No delete logic for now
    );
}

// Helper to load options for select
async function loadOptions() {
    const [pRes, wRes] = await Promise.all([fetchProducts(), fetchWarehouses()]);
    return { products: pRes.data, warehouses: wRes.data };
}

async function openAdjustmentModal() {
    const { products, warehouses } = await loadOptions();

    const content = `
        <form id="adjust-form" class="space-y-4">
             <div>
                <label class="block text-sm font-medium text-gray-700">Tipo</label>
                <select id="adj-type" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    <option value="IN">Entrada (Compra/Devolución)</option>
                    <option value="OUT">Salida (Venta/Merma)</option>
                    <option value="ADJUSTMENT">Corrección (Inventario Físico)</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Almacén</label>
                <select id="adj-warehouse" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    ${warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Producto</label>
                <select id="adj-product" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    ${products.map(p => `<option value="${p.id}">${p.name} (${p.sku})</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Cantidad (Positiva)</label>
                <input type="number" id="adj-qty" min="1" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            </div>
             <div>
                <label class="block text-sm font-medium text-gray-700">Referencia / Nota</label>
                <input type="text" id="adj-ref" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            </div>
        </form>
    `;

    const modal = new Modal('adjust-modal', 'Ajuste de Stock', content, async () => {
        const type = document.getElementById('adj-type').value;
        const warehouse_id = document.getElementById('adj-warehouse').value;
        const product_id = document.getElementById('adj-product').value;
        const qtyInput = parseInt(document.getElementById('adj-qty').value);
        const reference = document.getElementById('adj-ref').value;

        if (!qtyInput || qtyInput <= 0) return alert('Cantidad inválida');

        let quantity = qtyInput;
        if (type === 'OUT') quantity = -quantity;

        const user = await getUser();

        const movement = {
            product_id,
            warehouse_id,
            user_id: user.id,
            type,
            quantity,
            reference
        };

        const { error } = await createMovement(movement);
        if (error) alert('Error: ' + error.message);
        else await loadInventory();
    });
    modal.open();
}

async function openTransferModal() {
    const { products, warehouses } = await loadOptions();

    if (warehouses.length < 2) return alert('Se necesitan al menos 2 almacenes para transferir');

    const content = `
        <form id="transfer-form" class="space-y-4">
             <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Origen</label>
                    <select id="tr-from" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                        ${warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Destino</label>
                    <select id="tr-to" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                        ${warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Producto</label>
                <select id="tr-product" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    ${products.map(p => `<option value="${p.id}">${p.name} (${p.sku})</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Cantidad</label>
                <input type="number" id="tr-qty" min="1" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            </div>
        </form>
    `;

    const modal = new Modal('transfer-modal', 'Transferencia entre Almacenes', content, async () => {
        const fromId = document.getElementById('tr-from').value;
        const toId = document.getElementById('tr-to').value;
        const productId = document.getElementById('tr-product').value;
        const qty = parseInt(document.getElementById('tr-qty').value);

        if (fromId === toId) return alert('Origen y destino deben ser diferentes');
        if (!qty || qty <= 0) return alert('Cantidad inválida');

        const user = await getUser();

        try {
            // Out
            const { error: err1 } = await createMovement({
                product_id: productId,
                warehouse_id: fromId,
                user_id: user.id,
                type: 'TRANSFER',
                quantity: -qty,
                reference: `Transferencia a ${toId}`
            });
            if (err1) throw err1;

            // In
            const { error: err2 } = await createMovement({
                product_id: productId,
                warehouse_id: toId,
                user_id: user.id,
                type: 'TRANSFER',
                quantity: qty,
                reference: `Transferencia desde ${fromId}`
            });
            if (err2) throw err2;

            await loadInventory();

        } catch (e) {
            alert('Error en transferencia: ' + e.message);
        }
    });
    modal.open();
}

init();
