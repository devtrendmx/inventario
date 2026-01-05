
import { renderSidebar } from '../components/sidebar.js';
import { renderTable } from '../components/table.js';
import { Modal } from '../components/modal.js';
import { fetchWarehouses, createWarehouse, updateWarehouse, deleteWarehouse, getUser } from '../services/supabase.js';

let warehouses = [];
let currentWarehouseId = null;

async function init() {
    const user = await getUser();
    if (!user) window.location.href = './login.html';

    renderSidebar('sidebar-container', './warehouses.html');

    // Initial Load
    await loadWarehouses();

    // Event Listeners
    document.getElementById('add-btn').addEventListener('click', () => openModal());
}

async function loadWarehouses() {
    const { data, error } = await fetchWarehouses();
    if (error) {
        console.error(error);
        alert('Error cargando almacenes');
        return;
    }
    warehouses = data;
    renderTable(
        'warehouses-table-container',
        [
            { header: 'Nombre', key: 'name' },
            { header: 'Ubicación', key: 'location', render: (val) => val || '-' },
            { header: 'Fecha Creación', key: 'created_at', render: (val) => new Date(val).toLocaleDateString() }
        ],
        warehouses,
        handleEdit,
        handleDelete
    );
}

function openModal(warehouse = null) {
    currentWarehouseId = warehouse ? warehouse.id : null;
    const title = warehouse ? 'Editar Almacén' : 'Nuevo Almacén';
    const content = `
        <form id="warehouse-form" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">Nombre</label>
                <input type="text" id="w-name" value="${warehouse ? warehouse.name : ''}" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Ubicación</label>
                <input type="text" id="w-location" value="${warehouse ? warehouse.location || '' : ''}" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2">
            </div>
        </form>
    `;

    const modal = new Modal('warehouse-modal', title, content, async () => {
        const name = document.getElementById('w-name').value;
        const location = document.getElementById('w-location').value;

        if (!name) return alert('El nombre es obligatorio');

        if (currentWarehouseId) {
            const { error } = await updateWarehouse(currentWarehouseId, name, location);
            if (error) alert('Error actualizando: ' + error.message);
        } else {
            const { error } = await createWarehouse(name, location);
            if (error) alert('Error creando: ' + error.message);
        }
        await loadWarehouses();
    });
    modal.open();
}

function handleEdit(id) {
    const warehouse = warehouses.find(w => w.id === id);
    if (warehouse) openModal(warehouse);
}

async function handleDelete(id) {
    if (confirm('¿Estás seguro de eliminar este almacén?')) {
        const { error } = await deleteWarehouse(id);
        if (error) alert('Error eliminando: ' + error.message);
        else await loadWarehouses();
    }
}

init();
