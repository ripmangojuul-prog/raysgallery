import { create } from 'zustand'

const useStore = create((set) => ({
  isLocked: false,
  setLocked: (v) => set({ isLocked: v }),
}))

export default useStore
