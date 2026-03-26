import type { Operation, DocumentSlot } from '../../../types';

export const ALL_DOCUMENT_SLOTS: DocumentSlot[] = [
  // BASE PROPERTY DOCS
  {
    id: 'prop-1',
    nombre: 'Escritura de adquisición',
    descripcion: 'Con sello u hoja de ingreso en el RPP y anexos',
    categoria: 'propiedad',
    esObligatorio: true,
    estado: 'subido',
    archivoNombre: 'escritura_reforma_222.pdf',
    fechaSubida: '2024-03-15'
  },
  {
    id: 'prop-2',
    nombre: 'Boleta predial',
    descripcion: 'Correspondiente al año en curso',
    categoria: 'propiedad',
    esObligatorio: true,
    estado: 'subido',
    archivoNombre: 'predial_2024_tennyson.pdf',
    fechaSubida: '2024-03-20'
  },
  {
    id: 'prop-3',
    nombre: 'Boleta de Agua',
    descripcion: 'Correspondiente al año en curso',
    categoria: 'propiedad',
    esObligatorio: true,
    estado: 'pendiente'
  },
  {
    id: 'prop-4',
    nombre: 'Planos',
    descripcion: 'Planos arquitectónicos de la propiedad',
    categoria: 'propiedad',
    esObligatorio: false,
    estado: 'pendiente'
  },

  // CONDOMINIO
  {
    id: 'cond-1',
    nombre: 'Régimen en Condominio',
    descripcion: 'Con tabla de valores e indivisos y anexos',
    categoria: 'condominio',
    esObligatorio: true,
    condicion: 'condominio',
    estado: 'pendiente'
  },
  {
    id: 'cond-2',
    nombre: 'Reglamento de Condóminos',
    descripcion: 'Reglamento interno vigente',
    categoria: 'condominio',
    esObligatorio: true,
    condicion: 'condominio',
    estado: 'pendiente'
  },
  {
    id: 'cond-3',
    nombre: 'Carta de no adeudo de cuotas',
    descripcion: 'Constancia de no adeudo de mantenimiento',
    categoria: 'condominio',
    esObligatorio: true,
    condicion: 'condominio',
    estado: 'pendiente'
  },

  // CONSTRUCCION
  {
    id: 'const-1',
    nombre: 'Licencia de Construcción',
    descripcion: 'Licencia original o copia certificada',
    categoria: 'construccion',
    esObligatorio: true,
    condicion: 'construccion',
    estado: 'pendiente'
  },
  {
    id: 'const-2',
    nombre: 'Aviso de Terminación de Obra',
    descripcion: 'Aviso de terminación y ocupación',
    categoria: 'construccion',
    esObligatorio: true,
    condicion: 'construccion',
    estado: 'pendiente'
  },
  {
    id: 'const-3',
    nombre: 'Regularización de Construcciones',
    descripcion: 'En caso de no contar con terminación de obra',
    categoria: 'construccion',
    esObligatorio: false,
    condicion: 'construccion',
    estado: 'pendiente'
  },
  {
    id: 'const-4',
    nombre: 'Constancia de Alineamiento y No. Oficial',
    descripcion: 'Vigente',
    categoria: 'construccion',
    esObligatorio: true,
    condicion: 'construccion',
    estado: 'pendiente'
  },

  // SUCESION TESTAMENTARIA
  {
    id: 'st-1',
    nombre: 'Testamento',
    descripcion: 'Copia del testamento',
    categoria: 'sucesion',
    esObligatorio: true,
    condicion: 'sucesionTestamentaria',
    estado: 'pendiente'
  },
  {
    id: 'st-2',
    nombre: 'Radicación de Sucesión',
    descripcion: 'Aceptación de Herencia',
    categoria: 'sucesion',
    esObligatorio: true,
    condicion: 'sucesionTestamentaria',
    estado: 'pendiente'
  },

  // SUCESION INTESTAMENTARIA
  {
    id: 'si-1',
    nombre: 'Juicio Intestamentario',
    descripcion: 'Aceptación de herederos y nombramiento de Albacea',
    categoria: 'sucesion',
    esObligatorio: true,
    condicion: 'sucesionIntestamentaria',
    estado: 'pendiente'
  },

  // VENDEDOR PERSONA FISICA
  {
    id: 'vf-1',
    nombre: 'Identificación oficial (Física)',
    descripcion: 'INE o Pasaporte vigente',
    categoria: 'vendedorFisica',
    esObligatorio: true,
    soloPersona: 'fisica',
    estado: 'subido',
    archivoNombre: 'INE_Carlos_Rodríguez.pdf',
    fechaSubida: '2024-03-10'
  },
  {
    id: 'vf-2',
    nombre: 'Acta de Nacimiento (Física)',
    descripcion: 'Copia certificada reciente',
    categoria: 'vendedorFisica',
    esObligatorio: true,
    soloPersona: 'fisica',
    estado: 'pendiente'
  },
  {
    id: 'vf-3',
    nombre: 'Acta de Matrimonio (Física)',
    descripcion: 'Con quien estaba casado al adquirir',
    categoria: 'vendedorFisica',
    esObligatorio: true,
    soloPersona: 'fisica',
    estado: 'pendiente'
  },
  {
    id: 'vf-4',
    nombre: 'Constancia de Situación Fiscal (Física)',
    descripcion: 'No mayor a 3 meses',
    categoria: 'vendedorFisica',
    esObligatorio: true,
    soloPersona: 'fisica',
    estado: 'pendiente'
  },
  {
    id: 'vf-5',
    nombre: 'CURP (Física)',
    descripcion: 'Formato reciente',
    categoria: 'vendedorFisica',
    esObligatorio: true,
    soloPersona: 'fisica',
    estado: 'pendiente'
  },
  {
    id: 'vf-6',
    nombre: 'Factura de Servicios (Luz/Tel)',
    descripcion: 'Para exención de impuestos (< 3 meses)',
    categoria: 'vendedorFisica',
    esObligatorio: true,
    soloPersona: 'fisica',
    estado: 'pendiente'
  },

  // VENDEDOR PERSONA MORAL
  {
    id: 'vm-1',
    nombre: 'Acta Constitutiva',
    descripcion: 'Documento original o copia certificada',
    categoria: 'vendedorMoral',
    esObligatorio: true,
    soloPersona: 'moral',
    estado: 'pendiente'
  },
  {
    id: 'vm-2',
    nombre: 'Comprobante de domicilio (Moral)',
    descripcion: 'No mayor a 3 meses',
    categoria: 'vendedorMoral',
    esObligatorio: true,
    soloPersona: 'moral',
    estado: 'pendiente'
  },
  {
    id: 'vm-3',
    nombre: 'Constancia de Situación Fiscal (Moral)',
    descripcion: 'No mayor a 3 meses',
    categoria: 'vendedorMoral',
    esObligatorio: true,
    soloPersona: 'moral',
    estado: 'pendiente'
  },
  {
    id: 'vm-4',
    nombre: 'Poder notarial Representante Legal',
    descripcion: 'Facultades para actos de dominio (< 1 año)',
    categoria: 'vendedorMoral',
    esObligatorio: true,
    soloPersona: 'moral',
    estado: 'pendiente'
  },
  {
    id: 'vm-5',
    nombre: 'Identificación Representante Legal',
    descripcion: 'INE o Pasaporte vigente',
    categoria: 'vendedorMoral',
    esObligatorio: true,
    soloPersona: 'moral',
    estado: 'pendiente'
  },
  {
    id: 'vm-6',
    nombre: 'CURP Representante Legal',
    descripcion: 'Formato reciente',
    categoria: 'vendedorMoral',
    esObligatorio: true,
    soloPersona: 'moral',
    estado: 'pendiente'
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
