import fs from 'fs-extra';

export async function createStores() {
  // Form store
  const formStoreFile = `import { create } from 'zustand';

interface FormState {
    // Add your form state properties here
    isSubmitting: boolean;
    setIsSubmitting: (isSubmitting: boolean) => void;
    reset: () => void;
}

export const useFormStore = create<FormState>((set) => ({
    isSubmitting: false,
    setIsSubmitting: (isSubmitting: boolean) => set({ isSubmitting }),
    reset: () => set({ isSubmitting: false }),
}));`;

  fs.writeFileSync('stores/formStore.ts', formStoreFile);

  // Reset stores
  const resetStoresFile = `import { useCallback } from "react";
import { useFormStore } from "./formStore";

export const useResetStores = () => {
    const resetFormStore = useFormStore((state) => state.reset);

    return useCallback(() => {
        resetFormStore();
    }, [resetFormStore]);
};`;

  fs.writeFileSync('stores/resetStores.ts', resetStoresFile);
}