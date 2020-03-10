'use strict';

// Определяем холст и его переменные
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext("2d");
let width = canvas.width;
let height = canvas.height;

//Функция рисования окружности
let circle = function (x, y, radius, fillCircle) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, false);
  if (fillCircle) {
    ctx.fill();
  } else {
    ctx.stroke();
  }
};

//Делим холст на ячейки (10*10 пикселей)
let blockSize = 10;
let widthInBlocks = width / blockSize;
let heightInBlocks = height / blockSize;

//Создаем переменную для посчета очков
let score = 0;

//Рисуем рамку толщиной в 1 блок (blockSize)
let drawBorder = function () {
  ctx.fillStyle = "Gray";
  ctx.fillRect(0, 0, width, blockSize);                  //верхняя граница
  ctx.fillRect(width - blockSize, 0, blockSize, height); //правая граница
  ctx.fillRect(0, height - blockSize, width, blockSize); //нижняя граница
  ctx.fillRect(0, 0, blockSize, height);                 //левая граница
};

//Рисуем отображение счета в левом верхнем углу
let drawScore = function () {
  ctx.font = "20px Courier";
  ctx.fillStyle = "Black";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Счет: " + score, blockSize, blockSize); //отступ = blockSize
};

//Game over - отменяем действие setInterval и печатаем текст "Конец игры"
let gameOver = function () {
  clearInterval(intervalId);
  ctx.font = "60px Courier";
  ctx.fillStyle = "Black";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Конец игры", width / 2, width / 2);
};

//Конструктор ячейки сетки (создаем объект Block)
let Block = function (col, row) {
  this.col = col;
  this.row = row;
};

//Рисуем квадрат в ячейке сетки (cоздаем метод drawSquare для объета Block)
Block.prototype.drawSquare = function (color) {
  let x = this.col * blockSize;
  let y = this.row * blockSize;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, blockSize, blockSize);
};

//Рисуем круг в ячейке сетки (создаем метод drawCircle для объекта Block)
Block.prototype.drawCircle = function (color) {
  let centerX = this.col * blockSize + blockSize / 2;
  let centerY = this.row * blockSize + blockSize / 2;
  ctx.fillStyle = color;
  circle(centerX, centerY, blockSize / 2, true);
};

//Проверяем, совпадают ли координаты  2-x объектов (создаем метод equal для объекта Block)
Block.prototype.equal = function (otherBlock) {
  return this.col === otherBlock.col && this.row === otherBlock.row;
};

// Конструктор змейки (создаем объект Snake)
let Snake = function () {
  this.segments = [
    new Block(7, 5),
    new Block(6, 5),
    new Block(5, 5)
  ];

  this.direction = "right";
  this.nextDirection = "right";
};

// Рисуем квадрат для каждого сегмента змейки (создаем метод draw для объета Snake)
Snake.prototype.draw = function () {
  for (let i = 0; i < this.segments.length; i++) {
    this.segments[i].drawSquare("Blue");
  };
};

// Передвигаем змейку - создаем новую голову и добавляем ее к началу змейки (создаем метод move для объета Snake)
Snake.prototype.move = function () {
  let head = this.segments[0];
  let newHead;

  this.direction = this.nextDirection;

  if (this.direction === "right") {
    newHead = new Block(head.col + 1, head.row);
  } else if (this.direction === "down") {
    newHead = new Block(head.col, head.row + 1);
  } else if (this.direction === "left") {
    newHead = new Block(head.col - 1, head.row);
  }else if (this.direction === "up") {
    newHead = new Block(head.col, head.row - 1);
  };

  if ( this.checkCollision(newHead) ) {
    gameOver();
    return; // ранний возврат из метода, чтобы пропустить остальной код
  };

  this.segments.unshift(newHead);

  if (newHead.equal(apple.position)) {
    score++;
    apple.move();
  } else {
    this.segments.pop();
  }
};

//Проверяем змейку на столкновение со стенами и своим хвостом (создаем метод checkCollision для объекта Snake)
Snake.prototype.checkCollision = function (head) {
  let leftCollision = (head.col === 0);
  let topCollision = (head.row === 0);
  let rightCollision = (head.col === widthInBlocks - 1);
  let bottomCollision = (head.row === heightInBlocks -1);

  let wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;

  let selfCollision = false;

  for (let i = 0; i < this.segments.length; i++) {
    if (head.equal(this.segments[i])) {
      selfCollision = true;
    }
  }

  return wallCollision || selfCollision;
};

// Конструктор яблока, первоначально в позиции 10, 10 (конструктор для создания объекта Apple)
let Apple = function () {
  this.position = new Block(10, 10);
};

// Рисуем кружок в позиции яблока (создаем метод draw для объекта Apple)
Apple.prototype.draw = function () {
  this.position.drawCircle("LimeGreen");
};

//Перемещаем яблоко в случайную позицию (создаем метод move для объекта Apple)
Apple.prototype.move = function () {
  let randomCol = Math.floor( Math.random() * (widthInBlocks - 2) ) + 1;
  let randomRow = Math.floor( Math.random()* (heightInBlocks - 2) ) + 1;
  this.position = new Block(randomCol, randomRow);
};

//Задаем названия для кодов клавиш
let directions = {
  37: "left",
  38: "up",
  39: "right",
  40: "down"
};

//Делаем обработчик нажатия клавиш
$("body").keydown(function (event) {
  let newDirection = directions[event.keyCode];
  if (newDirection !== undefined) {
    snake.setDirection(newDirection);
  };
});

//Задаем новое направление змейки (создаем метод setDirection для объекта Snake)
Snake.prototype.setDirection = function (newDirection) {
  if (this.Direction === "up" && newDirection === "down") {
    return; //досрочный выход из функции
  } else if (this.direction === "right" && newDirection === "left") {
    return; //досрочный выход из функции
  } else if (this.direction === "down" && newDirection === "up") {
    return; //досрочный выход из функции
  } else if (this.direction === "left" && newDirection === "right") {
    return; //досрочный выход из функции
  }

  this.nextDirection = newDirection; // выполниться, если ни один if не сработает
};

//Создаем объект-змейку и объект-яблоко
let snake = new Snake();
let apple = new Apple();

//Запускаем функцию анимации через setInterval
let intervalId = setInterval(function () {
  ctx.clearRect(0, 0, width, height);
  drawScore();
  snake.move();
  snake.draw();
  apple.draw();
  drawBorder();
}, 150);
