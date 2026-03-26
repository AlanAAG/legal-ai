-- Seed Red Flag Rules for Phase F4
INSERT INTO red_flag_rules (id, name, description, severity, is_active)
VALUES 
  ('expiry_fiscal_3m', 'Fecha de emisión (Situación Fiscal)', 'Verifica que la Constancia de Situación Fiscal tenga menos de 90 días.', 'bloqueante', true),
  ('expiry_utility_3m', 'Fecha de emisión (Servicios)', 'Verifica que el recibo de servicios tenga menos de 90 días.', 'bloqueante', true),
  ('expiry_power_1y', 'Vigencia de Poder Notarial', 'Verifica que el poder notarial tenga menos de 1 año de antigüedad.', 'bloqueante', true),
  ('keyword_donation', 'Cláusula de Donación', 'Detecta si la escritura menciona donación o título gratuito.', 'advertencia', true),
  ('keyword_usufruct', 'Cláusula de Usufructo', 'Detecta si la escritura menciona usufructo o nuda propiedad.', 'advertencia', true),
  ('keyword_lien', 'Gravámenes o Embargos', 'Detecta lenguaje relacionado con hipotecas, gravámenes o embargos.', 'bloqueante', true),
  ('presence_ine', 'Validación de Identidad (INE)', 'Verifica la presencia de palabras clave de una identificación oficial (INE).', 'advertencia', true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  severity = EXCLUDED.severity,
  is_active = EXCLUDED.is_active;
