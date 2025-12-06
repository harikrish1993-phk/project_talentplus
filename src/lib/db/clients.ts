

import { createServerClient } from '@/lib/supabase/client';
import { logActivity } from '@/lib/audit/activity-logger';
import { Client } from '@/lib/types';

// --- Types (Simplified for this file) ---
interface ClientCreateData {
  organization_id: string;
  name: string;
  contact_name?: string;
  contact_email?: string;
  // ... other fields
}

interface ClientUpdateData {
  name?: string;
  contact_name?: string;
  contact_email?: string;
  // ... other fields
}

// --- Core Functions ---

/**
 * Creates a new client in the database.
 * @param data - Client creation data.
 * @param userId - ID of the user creating the client.
 * @returns The created Client object.
 */
export async function createClient(data: ClientCreateData, userId: string): Promise<Client> {
  const supabase = createServerClient();

  // 1. Validate data (Assuming validation is done before this call)
  // const validatedData = clientSchema.parse(data);

  // 2. Insert into database
  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      ...data,
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase error creating client:', error);
    throw new Error(`Failed to create client: ${error.message}`);
  }

  // 3. Log activity
  await logActivity({
    organization_id: data.organization_id,
    user_id: userId,
    action: 'create',
    entity_type: 'client',
    entity_id: client.id,
    metadata: { name: client.name },
  });

  return client as Client;
}

/**
 * Retrieves a client by its ID.
 * @param clientId - The ID of the client.
 * @param organizationId - The ID of the organization.
 * @returns The Client object or null if not found.
 */
export async function getClientById(clientId: string, organizationId: string): Promise<Client | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .eq('organization_id', organizationId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
    console.error('Supabase error fetching client:', error);
    throw new Error(`Failed to fetch client: ${error.message}`);
  }

  return data as Client | null;
}

/**
 * Updates an existing client.
 * @param clientId - The ID of the client to update.
 * @param data - The data to update.
 * @param userId - The ID of the user performing the update.
 * @returns The updated Client object.
 */
export async function updateClient(clientId: string, data: ClientUpdateData, userId: string, organizationId: string): Promise<Client> {
  const supabase = createServerClient();

  // 1. Update database
  const { data: client, error } = await supabase
    .from('clients')
    .update(data)
    .eq('id', clientId)
    .eq('organization_id', organizationId)
    .select()
    .single();

  if (error) {
    console.error('Supabase error updating client:', error);
    throw new Error(`Failed to update client: ${error.message}`);
  }

  // 2. Log activity
  await logActivity({
    organization_id: organizationId,
    user_id: userId,
    action: 'update',
    entity_type: 'client',
    entity_id: client.id,
    metadata: { name: client.name, changes: Object.keys(data) },
  });

  return client as Client;
}

/**
 * Deletes a client.
 * @param clientId - The ID of the client to delete.
 * @param userId - The ID of the user performing the deletion.
 * @param organizationId - The ID of the organization.
 */
export async function deleteClient(clientId: string, userId: string, organizationId: string): Promise<void> {
  const supabase = createServerClient();

  // 1. Delete from database
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)
    .eq('organization_id', organizationId);

  if (error) {
    console.error('Supabase error deleting client:', error);
    throw new Error(`Failed to delete client: ${error.message}`);
  }

  // 2. Log activity
  await logActivity({
    organization_id: organizationId,
    user_id: userId,
    action: 'delete',
    entity_type: 'client',
    entity_id: clientId,
  });
}

/**
 * Retrieves a list of clients for an organization with filtering and pagination.
 * @param organizationId - The ID of the organization.
 * @param filters - Optional filters (search).
 * @param page - Page number (1-indexed).
 * @param limit - Items per page.
 * @returns A list of Client objects and the total count.
 */
export async function getClients(
  organizationId: string,
  filters: { search?: string },
  page: number = 1,
  limit: number = 20
): Promise<{ clients: Client[]; totalCount: number }> {
  const supabase = createServerClient();
  const offset = (page - 1) * limit;

  let query = supabase
    .from('clients')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId);

  // Apply filters
  if (filters.search) {
    // Basic text search on name and contact_name
    query = query.or(`name.ilike.%${filters.search}%,contact_name.ilike.%${filters.search}%`);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Supabase error fetching clients:', error);
    throw new Error(`Failed to fetch clients: ${error.message}`);
  }

  return {
    clients: data as Client[],
    totalCount: count || 0,
  };
}
