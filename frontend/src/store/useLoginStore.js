import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useLoginStore = create(
  persist(
    (set) => ({
      step: 1,

      // ✅ ADD THIS (missing before)
      userPhoneData: null,

      setStep: (step) => set({ step }),

      // ✅ FIXED NAME
      setUserPhoneData: (data) => set({ userPhoneData: data }),

      // ✅ FIXED NAME
      resetLoginState: () =>
        set({
          step: 1,
          userPhoneData: null,
        }),
    }),
    {
      name: 'login-storage',

      // ✅ FIXED NAME
      partialize: (state) => ({
        step: state.step,
        userPhoneData: state.userPhoneData,
      }),
    }
  )
);

export default useLoginStore;