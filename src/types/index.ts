export type SellerType = 'fisica' | 'moral';

export type PropertyType = 'casa' | 'departamento' | 'terreno';

export type PropertyUsage = 'habitacional' | 'comercial';

export type SuccessionType = 'ninguna' | 'testamentaria' | 'intestamentaria';

export type DocumentCategory = 
  | 'propiedad' 
  | 'condominio' 
  | 'construccion' 
  | 'sucesion' 
  | 'vendedorFisica' 
  | 'vendedorMoral';

export type DocumentState = 'pending' | 'uploaded' | 'validated' | 'rejected' | 'flagged' | 'analyzed';
export type AnalysisStatus = 'pending' | 'analyzing' | 'analyzed' | 'error';
export type Severity = 'high' | 'medium' | 'low';

export interface RedFlag {
  id: string;
  document_slot_id: string;
  type: string;
  title: string;
  description: string;
  severity: Severity;
  created_at: string;
}

export interface Agent {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  agencia: string;
  esAMPI: boolean;
}

export interface Seller {
  id: string;
  nombreCompleto: string;
  tipo: SellerType;
  telefono: string;
  email: string;
}

export interface Property {
  id: string;
  tipo: PropertyType;
  uso: PropertyUsage;
  direccion: {
    calle: string;
    numeroExterior: string;
    numeroInterior?: string;
    colonia: string;
    alcaldia: string;
    codigoPostal: string;
    estado: string;
  };
  esCondominio: boolean;
  tieneConstruccionOAmpliacion: boolean;
  sucesionTipo: SuccessionType;
}

export interface DocumentSlot {
  id: string;
  name: string;
  description: string;
  category: DocumentCategory;
  is_required: boolean;
  soloPersona?: SellerType;
  condicion?: 'condominio' | 'construccion' | 'sucesionTestamentaria' | 'sucesionIntestamentaria';
  status: DocumentState;
  file_name?: string;
  uploaded_at?: string;
  storagePath?: string;
  analysis_status?: AnalysisStatus;
}

export interface Operation {
  id: string;
  shareToken: string;
  agente: Agent;
  vendedor: Seller;
  inmueble: Property;
  documentos: DocumentSlot[];
  createdAt: string;
}
