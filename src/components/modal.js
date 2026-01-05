
export class Modal {
    constructor(id, title, contentHtml, onConfirm = null) {
        this.id = id;
        this.title = title;
        this.contentHtml = contentHtml;
        this.onConfirm = onConfirm;
        this.element = null;
        this.create();
    }

    create() {
        // Check if exists
        if (document.getElementById(this.id)) return;

        const modalHtml = `
            <div id="${this.id}" class="fixed inset-0 z-50 overflow-y-auto hidden" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onclick="document.getElementById('${this.id}').classList.add('hidden')"></div>
                    <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                    <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div class="sm:flex sm:items-start">
                                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        ${this.title}
                                    </h3>
                                    <div class="mt-2 text-sm text-gray-500 w-full">
                                        ${this.contentHtml}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button type="button" id="${this.id}-confirm" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                                Confirmar
                            </button>
                            <button type="button" onclick="document.getElementById('${this.id}').classList.add('hidden')" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Bind confirm
        if (this.onConfirm) {
            document.getElementById(`${this.id}-confirm`).addEventListener('click', () => {
                this.onConfirm();
                this.close();
            });
        }
    }

    open() {
        const el = document.getElementById(this.id);
        if (el) el.classList.remove('hidden');
    }

    close() {
        const el = document.getElementById(this.id);
        if (el) el.classList.add('hidden');
    }
}
