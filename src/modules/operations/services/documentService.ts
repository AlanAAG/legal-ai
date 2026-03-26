import { supabase } from '../../../lib/supabase';

export interface UploadResult {
  storagePath: string;
  publicUrl: string;
}

/**
 * Sanitizes a filename: replaces spaces with underscores and removes special characters
 */
const sanitizeFileName = (fileName: string): string => {
  const extension = fileName.split('.').pop();
  const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));
  
  const sanitized = nameWithoutExtension
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
    
  return `${sanitized}.${extension}`;
};

export const documentService = {
  /**
   * Uploads a file to Supabase Storage and updates the document slot record
   */
  async uploadDocument(
    operationId: string, 
    slotId: string, 
    file: File
  ): Promise<UploadResult> {
    const sanitizedName = sanitizeFileName(file.name);
    const storagePath = `${operationId}/${slotId}/${sanitizedName}`;

    // 1. Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from('documentos')
      .upload(storagePath, file, {
        upsert: true,
        contentType: file.type
      });

    if (uploadError) throw uploadError;

    // 2. Update Document Slot in DB
    const { error: dbError } = await supabase
      .from('document_slots')
      .update({
        status: 'subido',
        storage_path: storagePath,
        file_name: sanitizedName,
        uploaded_at: new Date().toISOString(),
        analisis_status: 'pendiente'
      })
      .eq('id', slotId);

    if (dbError) throw dbError;

    // 3. Get Signed URL (1 hour)
    const signedUrl = await this.getSignedUrl(storagePath);

    return {
      storagePath,
      publicUrl: signedUrl
    };
  },

  /**
   * Generates a fresh signed URL for a stored file
   */
  async getSignedUrl(storagePath: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('documentos')
      .createSignedUrl(storagePath, 3600);

    if (error) throw error;
    return data.signedUrl;
  },

  /**
   * Removes a file from storage and resets the slot status
   */
  async deleteDocument(slotId: string, storagePath: string): Promise<void> {
    // 1. Remove from Storage
    const { error: storageError } = await supabase.storage
      .from('documentos')
      .remove([storagePath]);

    if (storageError) throw storageError;

    // 2. Clear DB record
    const { error: dbError } = await supabase
      .from('document_slots')
      .update({
        status: 'pendiente',
        storage_path: null,
        file_name: null,
        uploaded_at: null,
        analisis_status: 'pendiente'
      })
      .eq('id', slotId);

    if (dbError) throw dbError;
  },

  /**
   * Stub for triggering AI Red Flag analysis
   */
  async triggerRedFlagAnalysis(slotId: string): Promise<void> {
    // In actual implementation, this might call an Edge Function
    const { error } = await supabase
      .from('document_slots')
      .update({
        analisis_status: 'procesando'
      })
      .eq('id', slotId);

    if (error) throw error;
  }
};
