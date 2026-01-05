
import { renderSidebar } from '../components/sidebar.js';
import { renderTable } from '../components/table.js';
import { Modal } from '../components/modal.js';
import { fetchProfiles, updateProfileRole, getUser } from '../services/supabase.js';

let profiles = [];

async function init() {
    const user = await getUser();
    if (!user) window.location.href = './login.html';

    renderSidebar('sidebar-container', './users.html');
    await loadUsers();
}

async function loadUsers() {
    const { data, error } = await fetchProfiles();
    if (error) {
        console.error(error);
        return alert('Error cargando usuarios');
    }
    profiles = data;
    renderTable(
        'users-table-container',
        [
            { header: 'Email', key: 'email' },
            { header: 'Nombre', key: 'full_name' },
            { header: 'Rol', key: 'role', render: (val) => `<span class="px-2 py-1 rounded-full text-xs font-bold ${getRoleColor(val)}">${val.toUpperCase()}</span>` },
            { header: 'Fecha Registro', key: 'created_at', render: (val) => new Date(val).toLocaleDateString() }
        ],
        profiles,
        handleEdit,
        () => { } // No delete (managed by Auth usually)
    );
}

function getRoleColor(role) {
    switch (role) {
        case 'super_admin': return 'bg-purple-100 text-purple-800';
        case 'admin': return 'bg-blue-100 text-blue-800';
        case 'operator': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function handleEdit(id) {
    const profile = profiles.find(p => p.id === id);
    if (!profile) return;

    const content = `
        <form id="role-form" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">Usuario: ${profile.email}</label>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Rol</label>
                <select id="u-role" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    <option value="viewer" ${profile.role === 'viewer' ? 'selected' : ''}>Consulta (Viewer)</option>
                    <option value="operator" ${profile.role === 'operator' ? 'selected' : ''}>Operador</option>
                    <option value="admin" ${profile.role === 'admin' ? 'selected' : ''}>Administrador</option>
                    <option value="super_admin" ${profile.role === 'super_admin' ? 'selected' : ''}>Super Admin</option>
                </select>
            </div>
        </form>
    `;

    const modal = new Modal('role-modal', 'Editar Rol de Usuario', content, async () => {
        const newRole = document.getElementById('u-role').value;
        const { error } = await updateProfileRole(id, newRole);
        if (error) alert('Error actualizando rol: ' + error.message);
        else await loadUsers();
    });
    modal.open();
}

init();
