// Shared artwork data and gallery configuration

export const GALLERY = {
  width: 10,        // corridor width (walls at ±5)
  height: 5.5,      // ceiling height
  wallX: 5,         // wall X position
  startZ: 5,        // entrance end
  endZ: -33,        // back wall
  interactionRadius: 4.5,
}

export const ARTWORKS = [
  {
    id: 'art-1',
    title: 'Occult Geometry',
    url: '/tattoo_samples/Screenshot 2026-02-12 155407.png',
    position: [-4.99, 2.8, -7],
    rotation: [0, Math.PI / 2, 0],
    floorRing: [-2.5, 0.01, -7],
    barrierPos: [-3.3, 0, -7],
  },
  {
    id: 'art-2',
    title: 'Vintage Mechanism',
    url: '/tattoo_samples/Screenshot 2026-02-12 161036.png',
    position: [4.99, 2.8, -12],
    rotation: [0, -Math.PI / 2, 0],
    floorRing: [2.5, 0.01, -12],
    barrierPos: [3.3, 0, -12],
  },
  {
    id: 'art-3',
    title: 'Anatomical Heart',
    url: '/tattoo_samples/Screenshot 2026-02-12 164355.png',
    position: [-4.99, 2.8, -19],
    rotation: [0, Math.PI / 2, 0],
    floorRing: [-2.5, 0.01, -19],
    barrierPos: [-3.3, 0, -19],
  },
  {
    id: 'art-4',
    title: 'Mugler Reference',
    url: '/tattoo_samples/Screenshot 2026-02-19 080158.png',
    position: [4.99, 2.8, -25],
    rotation: [0, -Math.PI / 2, 0],
    floorRing: [2.5, 0.01, -25],
    barrierPos: [3.3, 0, -25],
  },
]
