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

export type DocumentState = 'no_subido' | 'subido';

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
}

export interface Operation {
  id: string;
  agente: Agent;
  vendedor: Seller;
  inmueble: Property;
  documentos: DocumentSlot[];
}
