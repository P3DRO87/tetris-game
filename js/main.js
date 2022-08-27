import clickHold from "./clickHold.js";
import { shapesCoords, shapesWithColors } from "./shape-types.js";

const d = document;
const $canvas = document.getElementById("canvas");
const $startGmModal = document.getElementById("start-game-modal");
const $pauseGameBtn = document.getElementById("pause-game");
const $restartGameBtn = document.getElementById("restart-game");
const $startGameModal = document.getElementById("start-game-modal");
const $lines = document.getElementById("lines");
const $level = document.getElementById("level");

const c = $canvas.getContext("2d");

const BOX_LIMIT_X = 10;
const BOX_LIMIT_Y = 20;

const gameMiddleArenaX = Math.floor(BOX_LIMIT_X / 2) - 1;

const boxSizeX = $canvas.width / BOX_LIMIT_X;
const boxSizeY = $canvas.height / BOX_LIMIT_Y;

let gameArena = Array(BOX_LIMIT_Y).fill(Array(BOX_LIMIT_X).fill(""));

let gameTimeInterval = 900;
let isGameOver = false;
let isShapeYCollited = false;
let shape = null;
let nextShape = null;
let isGamePaused = false;
let gameInterval = null;
let isGameActive = false;
let gameLines = 0;
let level = 1;

class Shape {
   r = Math.floor(Math.random() * shapesCoords.length);

   constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
      this.color = shapesWithColors[this.r].color;
      this.parts = shapesWithColors[this.r].shape;
      this.coords = [];
   }

   rotate() {
      if (this.y === -1) return;

      const { parts } = this;

      const rotatedPrts = parts.map((_, index) =>
         parts.map((row) => row[index]).reverse()
      );

      let { coords } = { ...this };

      coords = [];

      rotatedPrts.forEach((row, y) => {
         row.forEach((c, x) => {
            if (!c) return;

            coords.push({ x: x + this.x, y: y + this.y });
         });
      });

      if (coords.some(({ x }) => x <= 0)) shape.x = 0;

      if (coords.some(({ x }) => x >= BOX_LIMIT_X)) {
         const offsetToLeft = Math.max(...coords.map(({ x }) => x)) - BOX_LIMIT_X;
         shape.x = shape.x - offsetToLeft - 1;
      }

      if (coords.some(({ y }) => y >= BOX_LIMIT_Y - 1)) {
         const offsetToUp = Math.max(...coords.map(({ y }) => y)) - BOX_LIMIT_Y;
         shape.y = shape.y - offsetToUp - 1;
      }

      if (coords.some(({ x, y }) => gameArena[y] && gameArena[y][x])) return;

      if (coords.some(({ x, y }) => gameArena[y + 1] && gameArena[y + 1][x])) return;

      this.parts = rotatedPrts;

      this.update();
   }

   move(nextMove) {
      let isShapeXCollited = false;

      const { coords } = shape;

      isShapeXCollited = coords.some(({ x, y }) => gameArena[y][x + nextMove]);

      if (isShapeXCollited) return;

      this.x += nextMove;

      this.update();
   }

   update() {
      c.clearRect(0, 0, $canvas.width, $canvas.height);

      drawGameBoard();

      this.draw();
   }

   draw() {
      this.coords = [];

      this.parts.forEach((row, y) => {
         row.forEach((coord, x) => {
            if (!coord) return;

            this.coords.push({ x: x + this.x, y: y + this.y });

            drawBox(c, x + this.x, y + this.y, "#ccc", this.color);
         });
      });
   }
}

document.addEventListener("DOMContentLoaded", () => {
   if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
         navigator.userAgent
      )
   ) {
      document.querySelector(".game-controls").classList.remove("d-none");
   }
   main();
});

document.addEventListener("keypress", ({ key }) => {
   if (key !== "Enter") return;

   isGameActive = true;

   $startGmModal.classList.remove("active");
   main();
});

$startGameModal.addEventListener("click", () => {
   isGameActive = true;

   $startGmModal.classList.remove("active");
   main();
});

//mobile buttons
d.querySelector("#rotate").addEventListener("click", () => {
   isGameActive && shape.rotate();
});

clickHold(d.querySelector("#move-left"), () => {
   const { coords } = shape;

   isGameActive && !coords.some((c) => c.x <= 0) && shape.move(-1);
});

clickHold(d.querySelector("#move-right"), () => {
   const { coords } = shape;

   isGameActive && !coords.some((c) => c.x >= BOX_LIMIT_X - 1) && shape.move(1);
});

clickHold(d.querySelector("#boost"), () => {
   isGameActive && !isGameOver && animate();
});
///

document.addEventListener("keyup", ({ key }) => {
   if (!isGameActive) return;

   key === "ArrowUp" && shape.rotate();
});

document.addEventListener("keydown", ({ key }) => {
   if (!isGameActive) return;

   if (key === "ArrowDown") !isGameOver && animate();

   const { coords } = shape;

   if (key === "ArrowLeft") !coords.some((c) => c.x <= 0) && shape.move(-1);

   if (key === "ArrowRight") !coords.some((c) => c.x >= BOX_LIMIT_X - 1) && shape.move(1);
});

const main = () => {
   resetGameStatus();
   isGameOver = false;
   isGamePaused = false;
   $pauseGameBtn.textContent = "Pause";
   c.clearRect(0, 0, $canvas.width, $canvas.height);
   clearInterval(gameInterval);

   populateGameArena();

   generateShape();

   drawGameBoard();

   shape.draw();

   gameInterval = setInterval(animate, gameTimeInterval);
};

$pauseGameBtn.addEventListener("click", () => {
   isGamePaused = !isGamePaused;

   if (isGamePaused) {
      clearInterval(gameInterval);
      $pauseGameBtn.textContent = "Resume";
      return;
   }

   gameInterval = setInterval(animate, gameTimeInterval);
   $pauseGameBtn.textContent = "Pause";
});

$restartGameBtn.addEventListener("click", () => main());

const animate = () => {
   setShape();

   shape.y++;

   const isSomeRowFilled = gameArena.some((row) => row.every((c) => c.length > 1));

   isSomeRowFilled && drawGameBoard();

   gameArena[1].some(Boolean) && setGameOver();

   shape.update();
};

const setShape = () => {
   const { coords } = shape;

   isShapeYCollited = coords.some(({ y, x }) => gameArena[y + 1] && gameArena[y + 1][x]);

   if (coords.some(({ y }) => y >= BOX_LIMIT_Y - 1) || isShapeYCollited) {
      coords.forEach(({ x, y }) => (gameArena[y][x] = shape.color));

      generateShape(-1);
   }
};

const drawGameBoard = () => {
   gameArena.forEach((row, y) => {
      const fillRowIdx = row.every((c) => c.length > 1) ? y : -1;

      row.forEach((coord, x) => {
         if (coord) return drawBox(c, x, y, "#ccc", coord);

         drawBox(c, x, y, "#808080");
      });

      if (fillRowIdx === -1) return;

      deleteLine(fillRowIdx);
   });
};

const deleteLine = (fillRowIdx) => {
   gameArena.splice(fillRowIdx, 1);
   gameArena.unshift(Array(BOX_LIMIT_X).fill(""));
   gameLines++;
   $lines.textContent = gameLines;

   if (gameLines % 10 === 0 && gameInterval !== 70) {
      level++;
      clearInterval(gameInterval);
      gameTimeInterval -= 70;
      gameInterval = setInterval(animate, gameTimeInterval);
      $level.textContent = level;
   }
};

const setGameOver = () => {
   song.pause();
   resetGameStatus();
   shape.y = -1;
   isGameOver = true;
   clearInterval(gameInterval);
   main();
};

const resetGameStatus = () => {
   gameLines = 0;
   level = 1;
   $lines.textContent = gameLines;
   $level.textContent = level;
};

const generateShape = (y = 0) => {
   shape = new Shape(gameMiddleArenaX, y);

   if (shape.parts.every((prt) => prt.length >= 4)) {
      shape.y--;
      shape.x--;
   }

   return shape;
};

const populateGameArena = () => {
   for (let i = 0; i < BOX_LIMIT_Y; i++) {
      gameArena[i] = [];
      for (let j = 0; j < BOX_LIMIT_X; j++) {
         gameArena[i][j] = "";
      }
   }
};

const drawBox = (ctx, x = 0, y = 0, border = "#ccc", background) => {
   ctx.beginPath();
   ctx.fillStyle = background;
   ctx.strokeStyle = border;
   border && c.rect(x * boxSizeX, y * boxSizeY, boxSizeX, boxSizeX);
   background && c.fillRect(x * boxSizeX, y * boxSizeY, boxSizeX, boxSizeY);
   ctx.stroke();
};
