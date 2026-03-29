export interface DbAgent {
  id: string; // matches auth.users.id
  nombre: string;
  email: string;
  telefono: string;
  agencia: string;
  es_ampi: boolean;
  created_at: string;
}

export interface DbOperation {
  id: string;
  share_token: string;
  agent_id: string;
  seller_name: string;
  seller_type: 'fisica' | 'moral';
  seller_phone: string;
  seller_email: string;
  property_type: 'casa' | 'departamento' | 'terreno';
  property_use: 'habitacional' | 'comercial';
  property_street: string;
  property_number: string;
  property_colony: string;
  property_municipality: string;
  property_zip: string;
  property_state: string;
  is_condominium: boolean;
  has_construction_extension: boolean;
  succession_type: 'ninguna' | 'testamentaria' | 'intestamentaria';
  created_at: string;
}

export interface DbDocumentSlot {
  id: string;
  operation_id: string;
  name: string;
  description: string;
  category: string;
  is_required: boolean;
  condition_trigger?: string;
  person_type_trigger?: 'fisica' | 'moral';
  status: 'pending' | 'uploaded' | 'validated' | 'rejected' | 'alert' | 'analyzed';
  file_name?: string;
  storage_path?: string;
  analysis_status?: 'pending' | 'processing' | 'analyzed';
  uploaded_at?: string;
}

export interface DbRedFlagRule {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  is_active: boolean;
}
