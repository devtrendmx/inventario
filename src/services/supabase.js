
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { CONFIG } from '../config.js';

const supabaseUrl = CONFIG.SUPABASE_URL;
const supabaseKey = CONFIG.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or Key missing. Check config.js.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Auth helpers
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Warehouses
export async function fetchWarehouses() {
  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function createWarehouse(name, location) {
  const { data, error } = await supabase
    .from('warehouses')
    .insert([{ name, location }])
    .select()
  return { data, error }
}

export async function updateWarehouse(id, name, location) {
  const { data, error } = await supabase
    .from('warehouses')
    .update({ name, location })
    .eq('id', id)
    .select()
  return { data, error }
}

export async function deleteWarehouse(id) {
  const { error } = await supabase
    .from('warehouses')
    .delete()
    .eq('id', id)
  return { error }
}

// Products
export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function createProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
  return { data, error }
}

export async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
  return { data, error }
}

export async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  return { error }
}

// Inventory & Movements
export async function fetchInventory() {
  const { data, error } = await supabase
    .from('inventory')
    .select('*, products(id, name, sku, unit, min_stock, category, image_url), warehouses(id, name, location)')
    .order('updated_at', { ascending: false })
  return { data, error }
}

export async function createMovement(movement) {
  const { data, error } = await supabase
    .from('movements')
    .insert([movement])
    .select()
  return { data, error }
}

export async function fetchMovements() {
  const { data, error } = await supabase
    .from('movements')
    .select('*, products(id, name, sku, category, image_url), warehouses(id, name)')
    .order('created_at', { ascending: false })
  return { data, error }
}

// Users
export async function fetchProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function updateProfileRole(id, role) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select()
  return { data, error }
}

export async function createUserSafe(email, password, role) {
  // WORKAROUND: Create a temporary client to sign up a new user 
  // without logging out the current admin.
  // This avoids the default behavior of signUp which sets the session.

  const tempSupabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  // 1. Create the user (this triggers the handle_new_user function in DB)
  const { data, error } = await tempSupabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'Usuario Nuevo',
      }
    }
  });

  if (error) return { error };

  // 2. If successful, use the MAIN client (Super Admin) to set the correct role
  // We need to wait a small bit for the trigger to create the profile, or just try updating.
  if (data.user) {
    // Give the trigger a moment (optional but safer)
    await new Promise(r => setTimeout(r, 1000));

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: role })
      .eq('id', data.user.id);

    if (updateError) {
      console.error("Error asignando rol:", updateError);
      return { data, error: { message: "Usuario creado pero falló la asignación de rol. Edítalo manualmente." } };
    }
  }

  return { data, error };
}
