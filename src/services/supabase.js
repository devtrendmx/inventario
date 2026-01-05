
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
