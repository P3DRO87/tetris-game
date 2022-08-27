export const shapesCoords = [
   [
      [1, 1],
      [1, 1],
   ],

   [
      [1, 1, null],
      [null, 1, 1],
      [null, null, null],
   ],
   [
      [null, 1, null],
      [1, 1, 1],
      [null, null, null],
   ],
   [
      [1, null, null],
      [1, 1, 1],
      [null, null, null],
   ],

   [
      [null, null, null, null],
      [1, 1, 1, 1],
      [null, null, null, null],
      [null, null, null, null],
   ],
   [
      [null, 1, 1],
      [1, 1, null],
      [null, null, null],
   ],
   [
      [null, null, 1],
      [1, 1, 1],
      [null, null, null],
   ],
];

const colors = [
   "#F1B300",
   "#EE2733",
   "#9f159f",
   "#1b1b9f",
   "#005A9D",
   "#41B23C",
   "#B45700",
];

export const shapesWithColors = shapesCoords.map((shape, i) => ({
   color: colors[i],
   shape,
}));
