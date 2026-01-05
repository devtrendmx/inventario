
export function renderTable(containerId, columns, data, onEdit, onDelete) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (data.length === 0) {
        container.innerHTML = '<div class="p-4 text-center text-gray-500">No hay datos disponibles</div>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'min-w-full divide-y divide-gray-200';

    // Header
    const thead = document.createElement('thead');
    thead.className = 'bg-gray-50';
    thead.innerHTML = `
        <tr>
            ${columns.map(col => `
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ${col.header}
                </th>
            `).join('')}
            <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Acciones</span>
            </th>
        </tr>
    `;
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    tbody.className = 'bg-white divide-y divide-gray-200';

    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            ${columns.map(col => `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
            `).join('')}
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-indigo-600 hover:text-indigo-900 mr-4 edit-btn" data-id="${row.id}">Editar</button>
                <button class="text-red-600 hover:text-red-900 delete-btn" data-id="${row.id}">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    container.innerHTML = '';
    container.appendChild(table);

    // Bind Events
    container.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => onEdit(btn.dataset.id));
    });
    container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => onDelete(btn.dataset.id));
    });
}
