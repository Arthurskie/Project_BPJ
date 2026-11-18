import { FormContext } from './useFormContext.js';

const unsupported = () => {
  throw new Error('Penyimpanan formulir lokal tidak didukung. Gunakan master jenis surat Supabase.');
};

// Compatibility only for legacy imports; active routes use letterTypeAPI.
export function FormProvider({ children }) {
  return (
    <FormContext.Provider value={{ forms: [], addForm: unsupported, deleteForm: unsupported }}>
      {children}
    </FormContext.Provider>
  );
}
