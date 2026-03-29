import { supabase } from '../../../lib/supabase';
import type { DbAgent } from '../../../lib/types/database.types';
import { mapDbAgentToAgent } from '../../../lib/mappers';
import type { Agent } from '../../../types';

export const agentService = {
  async updateProfile(id: string, updates: Partial<Agent>): Promise<Agent> {
    const dbUpdates: any = { id: id }; // Required for upsert to match by ID
    
    if (updates.nombre) dbUpdates.nombre = updates.nombre;
    if (updates.email) dbUpdates.email = updates.email;
    if (updates.telefono !== undefined) dbUpdates.telefono = updates.telefono;
    if (updates.agencia) dbUpdates.agencia = updates.agencia;
    if (updates.esAMPI !== undefined) dbUpdates.es_ampi = updates.esAMPI;

    const { data, error } = await supabase
      .from('agents')
      .upsert(dbUpdates)
      .select()
      .single();

    if (error) throw error;
    return mapDbAgentToAgent(data as DbAgent);
  }
};
