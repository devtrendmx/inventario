import { renderSidebar } from '../components/sidebar.js';
import { renderTable } from '../components/table.js';
import { Modal } from '../components/modal.js';
import { fetchProfiles, updateProfileRole, createUserSafe, getUser } from '../services/supabase.js';

let profiles = [];

async function init() {
    const user = await getUser();
    if (!user) window.location.href = './login.html';

    renderSidebar('sidebar-container', './users.html');
    await loadUsers();

    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', openCreateUserModal);
    }
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

modal.open();
}

async function openCreateUserModal() {
    const content = `
        <form id="create-user-form" class="space-y-4">
            <div class="bg-yellow-50 text-yellow-800 p-3 rounded text-sm mb-4">
                <p>⚠️ <strong>Atención:</strong> Estás creando un usuario manualmente.</p>
                <p class="mt-1">Asegúrate de copiar la contraseña, ya que no podrás verla después.</p>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" id="new-email" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Contraseña</label>
                <input type="text" id="new-password" required minlength="6" placeholder="Mínimo 6 caracteres" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Rol Inicial</label>
                <select id="new-role" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    <option value="viewer">Consulta (Viewer)</option>
                    <option value="operator">Operador</option>
                    <option value="admin">Administrador</option>
                </select>
            </div>
        </form>
    `;

    const modal = new Modal('create-user-modal', 'Nuevo Usuario', content, async () => {
        const email = document.getElementById('new-email').value;
        const password = document.getElementById('new-password').value;
        const role = document.getElementById('new-role').value;

        if (!email || !password) return alert('Email y contraseña obligatorios');
        if (password.length < 6) return alert('La contraseña debe tener al menos 6 caracteres');

        // Show loading state could be nice here, but simplicity first
        const { data, error } = await createUserSafe(email, password, role);

        if (error) {
            console.error(error);
            alert('Error creando usuario: ' + (error.message || error.error_description || JSON.stringify(error)));
        } else {
            alert('✅ Usuario creado exitosamente');
            await loadUsers();
            // Modal closes automatically by the component logic usually, or requires explicit close?
            // The Modal component likely handles closing on success of callback if designed that way, 
            // but looking at usage in products.js line 164, it just awaits.
        }
    });
    modal.open();
}

init();
