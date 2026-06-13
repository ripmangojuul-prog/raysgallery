import { create } from 'zustand'

export const useStore = create((set, get) => ({
  // Artwork proximity detection
  artInRange: null,
  setArtInRange: (art) => {
    if (get().artInRange?.id !== art?.id) {
      set({ artInRange: art })
    }
  },

  // Lightbox state
  lightboxArt: null,
  openLightbox: (art) => set({ lightboxArt: art, isMenuOpen: false }),
  closeLightbox: () => set({ lightboxArt: null }),

  // Menu state
  isMenuOpen: false,
  toggleMenu: () => set((s) => ({ isMenuOpen: !s.isMenuOpen, lightboxArt: null })),

  // Close everything
  closeAll: () => set({ lightboxArt: null, isMenuOpen: false }),
}))
