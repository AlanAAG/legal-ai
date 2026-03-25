import type { Operation, PropertyType, PropertyUsage, SuccessionType } from '../../types';

export const getPropertyTypeLabel = (type: PropertyType): string => {
  const labels: Record<PropertyType, string> = {
    casa: 'Casa',
    departamento: 'Departamento',
    terreno: 'Terreno'
  };
  return labels[type];
};

export const getPropertyUseLabel = (use: PropertyUsage): string => {
  const labels: Record<PropertyUsage, string> = {
    habitacional: 'Habitacional',
    comercial: 'Comercial'
  };
  return labels[use];
};

export const getSucesionLabel = (tipo: SuccessionType): string => {
  const labels: Record<SuccessionType, string> = {
    ninguna: 'Ninguna',
    testamentaria: 'Testamentaria',
    intestamentaria: 'Intestamentaria'
  };
  return labels[tipo];
};

export const calculateProgress = (operation: Operation) => {
  const requiredDocs = operation.documentos.filter(doc => {
    // Visibility logic (same as in DocumentosTab)
    const isVisible = 
      (doc.categoria === 'condominio' ? operation.inmueble.esCondominio : true) &&
      (doc.categoria === 'construccion' ? operation.inmueble.tieneConstruccionOAmpliacion : true) &&
      (doc.categoria === 'sucesion' ? operation.inmueble.sucesionTipo !== 'ninguna' : true) &&
      (doc.soloPersona ? doc.soloPersona === operation.vendedor.tipo : true);

    return isVisible && doc.esObligatorio;
  });

  const totalRequired = requiredDocs.length;
  const totalUploaded = requiredDocs.filter(d => d.estado === 'subido').length;
  const percentage = totalRequired > 0 ? Math.round((totalUploaded / totalRequired) * 100) : 0;

  return {
    totalRequired,
    totalUploaded,
    percentage
  };
};
