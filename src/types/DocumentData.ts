export type DocumentStatus = 'Pendiente' | 'Cargado' | 'Rechazado' | 'En Revisión';

export interface DocumentItem {
  id: string;
  name: string;
  status: DocumentStatus;
  fileUrl?: string;
  updatedAt?: string;
  description?: string;
}

export interface DocumentCategory {
  id: string;
  title: string;
  documents: DocumentItem[];
}

export interface PropertySale {
  id: string;
  address: string;
  sellerName: string;
  sellerType: 'Persona Física' | 'Persona Moral';
  progress: number;
  categories: DocumentCategory[];
}

export const INITIAL_CHECKLIST: DocumentCategory[] = [
  {
    id: 'propiedad-base',
    title: 'DOCUMENTOS DE LA PROPIEDAD',
    documents: [
      { id: 'escritura', name: 'Escritura de adquisición con sello del RPP', status: 'Pendiente' },
      { id: 'predial', name: 'Boleta predial del año en curso', status: 'Pendiente' },
      { id: 'agua', name: 'Boleta de Agua del año en curso', status: 'Pendiente' },
      { id: 'planos', name: 'Planos', status: 'Pendiente' },
    ]
  },
  {
    id: 'condominio',
    title: 'EN CASO DE DEPARTAMENTO O CASA EN CONDOMINIO',
    documents: [
      { id: 'regimen', name: 'Régimen en Condominio con tabla de valores', status: 'Pendiente' },
      { id: 'reglamento', name: 'Reglamento de Condóminos', status: 'Pendiente' },
      { id: 'no-adeudo-mtto', name: 'Carta de no adeudo de mantenimiento', status: 'Pendiente' },
    ]
  },
  {
    id: 'construccion',
    title: 'EN CASO DE TERRENO CON CONSTRUCCIÓN O AMPLIACIONES',
    documents: [
      { id: 'licencia', name: 'Licencia de Construcción', status: 'Pendiente' },
      { id: 'terminacion', name: 'Aviso de Terminación de Obra', status: 'Pendiente' },
      { id: 'regularizacion', name: 'Regularización de Construcciones', status: 'Pendiente' },
      { id: 'alineamiento', name: 'Constancia de Alineamiento y Número Oficial', status: 'Pendiente' },
    ]
  },
  {
    id: 'sucesion-testamentaria',
    title: 'EN CASO DE SUCESIÓN TESTAMENTARIA',
    documents: [
      { id: 'testamento', name: 'Testamento', status: 'Pendiente' },
      { id: 'radicacion-t', name: 'Radicación de Sucesión o Aceptación de Herencia', status: 'Pendiente' },
      { id: 'escritura-adj-t', name: 'Escritura de Adjudicación (si aplica)', status: 'Pendiente' },
    ]
  },
  {
    id: 'sucesion-intestamentaria',
    title: 'EN CASO DE SUCESIÓN INTESTAMENTARIA',
    documents: [
      { id: 'juicio', name: 'Juicio Intestamentario', status: 'Pendiente' },
      { id: 'radicacion-i', name: 'Radicación de Sucesión o Aceptación de Herencia', status: 'Pendiente' },
      { id: 'escritura-adj-i', name: 'Escritura de Adjudicación (si aplica)', status: 'Pendiente' },
    ]
  },
  {
    id: 'vendedor-fisica',
    title: 'DEL VENDEDOR PERSONA FÍSICA',
    documents: [
      { id: 'identificacion-f', name: 'Identificación oficial vigente (INE o Pasaporte)', status: 'Pendiente' },
      { id: 'nacimiento-f', name: 'Acta de Nacimiento', status: 'Pendiente' },
      { id: 'matrimonio-f', name: 'Acta de Matrimonio', status: 'Pendiente' },
      { id: 'csf-f', name: 'Constancia de Situación Fiscal (< 3 meses)', status: 'Pendiente' },
      { id: 'curp-f', name: 'CURP', status: 'Pendiente' },
      { id: 'servicios-f', name: 'Factura para exención (Luz, Tel, etc.)', status: 'Pendiente' },
    ]
  },
  {
    id: 'vendedor-moral',
    title: 'DEL VENDEDOR PERSONA MORAL',
    documents: [
      { id: 'constitutiva-m', name: 'Acta Constitutiva', status: 'Pendiente' },
      { id: 'domicilio-m', name: 'Comprobante de domicilio (< 3 meses)', status: 'Pendiente' },
      { id: 'csf-m', name: 'Constancia de Situación Fiscal (< 3 meses)', status: 'Pendiente' },
      { id: 'poder-m', name: 'Poder notarial del Representante Legal', status: 'Pendiente' },
      { id: 'id-representante-m', name: 'Identificación oficial del Representante Legal', status: 'Pendiente' },
      { id: 'curp-representante-m', name: 'CURP del Representante Legal', status: 'Pendiente' },
    ]
  }
];
