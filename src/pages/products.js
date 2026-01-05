
import { renderSidebar } from '../components/sidebar.js';
import { renderTable } from '../components/table.js';
import { Modal } from '../components/modal.js';
import { fetchProducts, createProduct, updateProduct, deleteProduct, getUser } from '../services/supabase.js';

let products = [];
let currentProductId = null;

async function init() {
    const user = await getUser();
    if (!user) window.location.href = './login.html';

    renderSidebar('sidebar-container', './products.html');
    await loadProducts();
    document.getElementById('add-btn').addEventListener('click', () => openModal());
}

async function loadProducts() {
    const { data, error } = await fetchProducts();
    if (error) {
        console.error(error);
        alert('Error cargando productos');
        return;
    }
    products = data;
    renderTable(
        'products-table-container',
        [
            {
                header: 'Imagen',
                key: 'image_url',
                render: (url) => url ?
                    `<img src="${url}" alt="Producto" class="w-12 h-12 object-cover rounded-md border border-gray-200" onerror="this.src='https://via.placeholder.com/48?text=No+Img'">` :
                    `<div class="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">Sin imagen</div>`
            },
            { header: 'SKU', key: 'sku' },
            { header: 'Nombre', key: 'name' },
            { header: 'Categoría', key: 'category' },
            { header: 'Precio', key: 'price', render: (val) => `$${parseFloat(val).toFixed(2)}` },
            { header: 'Stock Min', key: 'min_stock' },
            { header: 'Unidad', key: 'unit' },
            { header: 'Estado', key: 'is_active', render: (val) => val ? '<span class="text-green-600 font-bold">Activo</span>' : '<span class="text-red-600">Inactivo</span>' }
        ],
        products,
        handleEdit,
        handleDelete
    );
}

async function openModal(product = null) {
    currentProductId = product ? product.id : null;
    const title = product ? 'Editar Producto' : 'Nuevo Producto';

    // Get warehouses for new product
    let warehousesHTML = '';
    if (!product) {
        const { fetchWarehouses } = await import('../services/supabase.js');
        const { data: warehouses } = await fetchWarehouses();
        warehousesHTML = `
            <div class="md:col-span-2 border-t pt-4 mt-4">
                <h3 class="text-sm font-semibold text-gray-700 mb-3">Stock Inicial (Opcional)</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Almacén</label>
                        <select id="p-warehouse" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                            <option value="">-- Sin stock inicial --</option>
                            ${warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Cantidad Inicial</label>
                        <input type="number" id="p-initial-qty" min="0" value="0" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    </div>
                </div>
                <p class="text-xs text-gray-500 mt-2">Puedes agregar más stock desde la sección de Inventario</p>
            </div>
        `;
    }

    const content = `
        <form id="product-form" class="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Nombre</label>
                <input type="text" id="p-name" value="${product ? product.name : ''}" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">SKU</label>
                <input type="text" id="p-sku" value="${product ? product.sku : ''}" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            </div>
             <div>
                <label class="block text-sm font-medium text-gray-700">Categoría</label>
                <input type="text" id="p-category" value="${product ? product.category || '' : ''}" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Precio</label>
                <input type="number" id="p-price" value="${product ? product.price : 0}" step="0.01" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Stock Mínimo</label>
                <input type="number" id="p-min-stock" value="${product ? product.min_stock : 0}" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            </div>
             <div>
                <label class="block text-sm font-medium text-gray-700">Unidad</label>
                <input type="text" id="p-unit" value="${product ? product.unit || 'units' : 'units'}" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            </div>
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700">URL de Imagen</label>
                <input type="url" id="p-image" value="${product ? product.image_url || '' : ''}" placeholder="https://ejemplo.com/imagen.jpg" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                <p class="text-xs text-gray-500 mt-1">Opcional: URL de la imagen del producto</p>
            </div>
            <div class="flex items-center mt-6">
                 <input type="checkbox" id="p-active" ${product && !product.is_active ? '' : 'checked'} class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                 <label for="p-active" class="ml-2 block text-sm text-gray-900">Activo</label>
            </div>
            ${warehousesHTML}
        </form>
    `;

    const modal = new Modal('product-modal', title, content, async () => {
        const productData = {
            name: document.getElementById('p-name').value,
            sku: document.getElementById('p-sku').value,
            category: document.getElementById('p-category').value,
            price: parseFloat(document.getElementById('p-price').value),
            min_stock: parseInt(document.getElementById('p-min-stock').value),
            unit: document.getElementById('p-unit').value,
            image_url: document.getElementById('p-image').value || null,
            is_active: document.getElementById('p-active').checked
        };

        if (!productData.name || !productData.sku) return alert('Nombre y SKU obligatorios');

        if (currentProductId) {
            const { error } = await updateProduct(currentProductId, productData);
            if (error) alert('Error actualizando: ' + error.message);
        } else {
            // Create product
            const { data: newProduct, error } = await createProduct(productData);
            if (error) {
                alert('Error creando: ' + error.message);
                return;
            }

            // Add initial stock if warehouse selected
            const warehouseId = document.getElementById('p-warehouse')?.value;
            const initialQty = parseInt(document.getElementById('p-initial-qty')?.value || 0);

            if (warehouseId && initialQty > 0 && newProduct && newProduct[0]) {
                const { createMovement, getUser } = await import('../services/supabase.js');
                const user = await getUser();

                await createMovement({
                    product_id: newProduct[0].id,
                    warehouse_id: warehouseId,
                    user_id: user.id,
                    type: 'IN',
                    quantity: initialQty,
                    reference: 'Stock inicial'
                });
            }
        }
        await loadProducts();
    });
    modal.open();
}

function handleEdit(id) {
    const product = products.find(p => p.id === id);
    if (product) openModal(product);
}

async function handleDelete(id) {
    if (confirm('¿Eliminar producto?')) {
        const { error } = await deleteProduct(id);
        if (error) alert('Error eliminando: ' + error.message);
        else await loadProducts();
    }
}

init();
