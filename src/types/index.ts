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

export type DocumentState = 'pendiente' | 'subido' | 'validado' | 'rechazado' | 'con_alerta';
export type AnalysisStatus = 'pendiente' | 'procesando' | 'completado' | 'error';
export type Severity = 'bloqueante' | 'advertencia' | 'info';

export interface RedFlag {
  ruleId: string;
  severidad: Severity;
  mensaje: string;
  detectedAt: string;
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
  nombre: string;
  descripcion: string;
  categoria: DocumentCategory;
  esObligatorio: boolean;
  soloPersona?: SellerType;
  condicion?: 'condominio' | 'construccion' | 'sucesionTestamentaria' | 'sucesionIntestamentaria';
  estado: DocumentState;
  archivoNombre?: string;
  fechaSubida?: string;
  storagePath?: string;
  analisisStatus?: AnalysisStatus;
  redFlags?: RedFlag[];
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
