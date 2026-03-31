import type { Operation, DocumentSlot } from '../../../types';

export const ALL_DOCUMENT_SLOTS: DocumentSlot[] = [
  // BASE PROPERTY DOCS
  {
    id: 'prop-1',
    name: 'Escritura de adquisición',
    description: 'Con sello u hoja de ingreso en el RPP y anexos',
    category: 'propiedad',
    is_required: true,
    status: 'uploaded',
    file_name: 'escritura_reforma_222.pdf',
    uploaded_at: '2024-03-15'
  },
  {
    id: 'prop-2',
    name: 'Boleta predial',
    description: 'Correspondiente al año en curso',
    category: 'propiedad',
    is_required: true,
    status: 'uploaded',
    file_name: 'predial_2024_tennyson.pdf',
    uploaded_at: '2024-03-20'
  },
  {
    id: 'prop-3',
    name: 'Boleta de Agua',
    description: 'Correspondiente al año en curso',
    category: 'propiedad',
    is_required: true,
    status: 'pending'
  },
  {
    id: 'prop-4',
    name: 'Planos',
    description: 'Planos arquitectónicos de la propiedad',
    category: 'propiedad',
    is_required: false,
    status: 'pending'
  },

  // CONDOMINIO
  {
    id: 'cond-1',
    name: 'Régimen en Condominio',
    description: 'Con tabla de valores e indivisos y anexos',
    category: 'condominio',
    is_required: true,
    condicion: 'condominio',
    status: 'pending'
  },
  {
    id: 'cond-2',
    name: 'Reglamento de Condóminos',
    description: 'Reglamento interno vigente',
    category: 'condominio',
    is_required: true,
    condicion: 'condominio',
    status: 'pending'
  },
  {
    id: 'cond-3',
    name: 'Carta de no adeudo de cuotas',
    description: 'Constancia de no adeudo de mantenimiento',
    category: 'condominio',
    is_required: true,
    condicion: 'condominio',
    status: 'pending'
  },

  // CONSTRUCCION
  {
    id: 'const-1',
    name: 'Licencia de Construcción',
    description: 'Licencia original o copia certificada',
    category: 'construccion',
    is_required: true,
    condicion: 'construccion',
    status: 'pending'
  },
  {
    id: 'const-2',
    name: 'Aviso de Terminación de Obra',
    description: 'Aviso de terminación y ocupación',
    category: 'construccion',
    is_required: true,
    condicion: 'construccion',
    status: 'pending'
  },
  {
    id: 'const-3',
    name: 'Regularización de Construcciones',
    description: 'En caso de no contar con terminación de obra',
    category: 'construccion',
    is_required: false,
    condicion: 'construccion',
    status: 'pending'
  },
  {
    id: 'const-4',
    name: 'Constancia de Alineamiento y No. Oficial',
    description: 'Vigente',
    category: 'construccion',
    is_required: true,
    condicion: 'construccion',
    status: 'pending'
  },

  // SUCESION TESTAMENTARIA
  {
    id: 'st-1',
    name: 'Testamento',
    description: 'Copia del testamento',
    category: 'sucesion',
    is_required: true,
    condicion: 'sucesionTestamentaria',
    status: 'pending'
  },
  {
    id: 'st-2',
    name: 'Radicación de Sucesión',
    description: 'Aceptación de Herencia',
    category: 'sucesion',
    is_required: true,
    condicion: 'sucesionTestamentaria',
    status: 'pending'
  },

  // SUCESION INTESTAMENTARIA
  {
    id: 'si-1',
    name: 'Juicio Intestamentario',
    description: 'Aceptación de herederos y nombramiento de Albacea',
    category: 'sucesion',
    is_required: true,
    condicion: 'sucesionIntestamentaria',
    status: 'pending'
  },

  // VENDEDOR PERSONA FISICA
  {
    id: 'vf-1',
    name: 'Identificación oficial (Física)',
    description: 'INE o Pasaporte vigente',
    category: 'vendedorFisica',
    is_required: true,
    soloPersona: 'fisica',
    status: 'uploaded',
    file_name: 'INE_Carlos_Rodríguez.pdf',
    uploaded_at: '2024-03-10'
  },
  {
    id: 'vf-2',
    name: 'Acta de Nacimiento (Física)',
    description: 'Copia certificada reciente',
    category: 'vendedorFisica',
    is_required: true,
    soloPersona: 'fisica',
    status: 'pending'
  },
  {
    id: 'vf-3',
    name: 'Acta de Matrimonio (Física)',
    description: 'Con quien estaba casado al adquirir',
    category: 'vendedorFisica',
    is_required: true,
    soloPersona: 'fisica',
    status: 'pending'
  },
  {
    id: 'vf-4',
    name: 'Constancia de Situación Fiscal (Física)',
    description: 'No mayor a 3 meses',
    category: 'vendedorFisica',
    is_required: true,
    soloPersona: 'fisica',
    status: 'pending'
  },
  {
    id: 'vf-5',
    name: 'CURP (Física)',
    description: 'Formato reciente',
    category: 'vendedorFisica',
    is_required: true,
    soloPersona: 'fisica',
    status: 'pending'
  },
  {
    id: 'vf-6',
    name: 'Factura de Servicios (Luz/Tel)',
    description: 'Para exención de impuestos (< 3 meses)',
    category: 'vendedorFisica',
    is_required: true,
    soloPersona: 'fisica',
    status: 'pending'
  },

  // VENDEDOR PERSONA MORAL
  {
    id: 'vm-1',
    name: 'Acta Constitutiva',
    description: 'Documento original o copia certificada',
    category: 'vendedorMoral',
    is_required: true,
    soloPersona: 'moral',
    status: 'pending'
  },
  {
    id: 'vm-2',
    name: 'Comprobante de domicilio (Moral)',
    description: 'No mayor a 3 meses',
    category: 'vendedorMoral',
    is_required: true,
    soloPersona: 'moral',
    status: 'pending'
  },
  {
    id: 'vm-3',
    name: 'Constancia de Situación Fiscal (Moral)',
    description: 'No mayor a 3 meses',
    category: 'vendedorMoral',
    is_required: true,
    soloPersona: 'moral',
    status: 'pending'
  },
  {
    id: 'vm-4',
    name: 'Poder notarial Representante Legal',
    description: 'Facultades para actos de dominio (< 1 año)',
    category: 'vendedorMoral',
    is_required: true,
    soloPersona: 'moral',
    status: 'pending'
  },
  {
    id: 'vm-5',
    name: 'Identificación Representante Legal',
    description: 'INE o Pasaporte vigente',
    category: 'vendedorMoral',
    is_required: true,
    soloPersona: 'moral',
    status: 'pending'
  },
  {
    id: 'vm-6',
    name: 'CURP Representante Legal',
    description: 'Formato reciente',
    category: 'vendedorMoral',
    is_required: true,
    soloPersona: 'moral',
    status: 'pending'
  }
];

export const mockOperation: Operation = {
  id: 'op-123',
  shareToken: '550e8400-e29b-41d4-a716-446655440000',
  createdAt: '2024-04-23T10:00:00Z',
  agente: {
    id: 'agent-123',
    nombre: 'Sofía Martínez',
    email: 'sofia.martinez@broker.mx',
    telefono: '55 1234 5678',
    agencia: 'Luxury Real Estate CDMX',
    esAMPI: true
  },
  vendedor: {
    id: 'seller-456',
    nombreCompleto: 'Elena Vázquez Mota',
    tipo: 'fisica',
    telefono: '55 9876 5432',
    email: 'elena.vazquez@email.com'
  },
  inmueble: {
    id: 'prop-789',
    tipo: 'departamento',
    uso: 'habitacional',
    direccion: {
      calle: 'Calle Tennyson',
      numeroExterior: '123',
      colonia: 'Polanco IV Sección',
      alcaldia: 'Miguel Hidalgo',
      codigoPostal: '11550',
      estado: 'CDMX'
    },
    esCondominio: true,
    tieneConstruccionOAmpliacion: false,
    sucesionTipo: 'testamentaria'
  },
  documentos: ALL_DOCUMENT_SLOTS
};
