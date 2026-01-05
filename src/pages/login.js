import { login } from '../services/supabase.js';

const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

console.log('Login page loaded');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log('Attempting login with:', email);

    errorMessage.classList.add('hidden');
    errorMessage.textContent = '';

    try {
        const { data, error } = await login(email, password);
        console.log('Login response:', { data, error });

        if (error) throw error;

        console.log('Login successful, redirecting...');
        window.location.href = './dashboard.html';
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = error.message || 'Error al iniciar sesión';
        errorMessage.classList.remove('hidden');
    }
});
