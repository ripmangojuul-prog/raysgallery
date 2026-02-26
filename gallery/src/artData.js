/**
 * Gallery artwork configuration.
 * 51 pieces arranged in two parallel rows — corridor layout.
 * Player walks between them in first-person.
 */

const IMAGES = [
  'g01_01.jpg', 'g01_02.jpg', 'g01_03.jpg', 'g01_04.jpg', 'g01_05.jpg',
  'g01_06.jpg', 'g01_07.jpg', 'g01_08.jpg', 'g01_09.jpg', 'g01_10.jpg',
  'g01_11.jpg', 'g01_12.jpg', 'g01_13.jpg', 'g01_14.jpg', 'g01_15.jpg',
  'g01_16.jpg', 'g01_17.jpg', 'g01_18.jpg', 'g01_19.jpg',
  'g02_01.jpg', 'g02_02.jpg', 'g02_03.jpg', 'g02_04.jpg',
  'g04_01.jpg', 'g04_02.jpg', 'g04_03.jpg',
  'g06_01.jpg', 'g06_02.jpg', 'g06_03.jpg', 'g06_04.jpg',
  'g07_01.jpg', 'g07_02.jpg', 'g07_03.jpg', 'g07_04.jpg',
  'g08_01.jpg', 'g08_02.jpg', 'g08_03.jpg', 'g08_04.jpg',
  'g09_01.jpg', 'g09_02.jpg', 'g09_03.jpg', 'g09_04.jpg',
  'g10_01.jpg', 'g10_02.jpg', 'g10_03.jpg', 'g10_04.jpg',
  'g11_01.jpg', 'g11_02.jpg', 'g11_03.jpg', 'g11_04.jpg',
  'g12_01.jpg',
]

function toRoman(n) {
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
  const syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']
  let r = ''
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { r += syms[i]; n -= vals[i] }
  }
  return r
}

const HALF_X = 8
const SPACING_Z = 3.5
const ART_Y = 2.0

export const ART_WIDTH = 2.4
export const ART_HEIGHT = 3.2
export const FRAME_BORDER = 0.12
export const FRAME_DEPTH = 0.08

export const ART_DATA = IMAGES.map((file, i) => {
  const isLeft = i % 2 === 0
  return {
    id: i + 1,
    src: `/art/flash/${file}`,
    title: toRoman(i + 1),
    artist: 'Hinter',
    position: [isLeft ? -HALF_X : HALF_X, ART_Y, -i * SPACING_Z],
    rotation: [0, isLeft ? Math.PI / 2 : -Math.PI / 2, 0],
  }
})

export const CORRIDOR = {
  startZ: 12,
  endZ: -(IMAGES.length * SPACING_Z + 15),
  halfX: HALF_X + 5,
  eyeHeight: 1.7,
}
