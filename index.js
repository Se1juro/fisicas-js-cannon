const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const buttonReset = document.getElementById("reset");

buttonReset.addEventListener("click", (e) => {
  cannonBalls = [];
});

let imgCount = 1;

const renderImages = () => {
  if (--imgCount > 0) return;

  animate();
};

let cannonBody = new Image();
cannonBody.src = "https://www.clker.com/cliparts/Q/o/D/b/l/b/cannon-big-hi.png";
cannonBody.onload = renderImages;

let mousePos = null;
let angle = null;
let canShoot = true;

let cannonBalls = [];

// Colisiones
const ballHitWall = (ball) => {
  // Colisiones en cualquier lado de los bordes del canvas
  if (
    ball.x + ball.radius > 1380 ||
    ball.x - ball.radius < 25 ||
    ball.y + ball.radius > 580 ||
    ball.y - ball.radius < 25
  ) {
    ball.dy = ball.dy * ball.elasticity;
    // Colision en el lado derecho del canvas
    if (ball.x + ball.radius > 1380) {
      ball.x = 1380 - ball.radius;
      ball.dx *= -1;
    } else if (ball.x - ball.radius < 25) {
      ball.x = 25 + ball.radius;
      ball.dx *= -1;
    } else if (ball.y + ball.radius > 580) {
      ball.y = 580 - ball.radius;
      ball.dy *= -1;
    } else if (ball.y - ball.radius < 20) {
      ball.y = 25 + ball.radius;
      ball.dy *= -1;
    }
  }
};

const collideBalls = (ball1, ball2) => {
  let dx = ball2.x - ball1.x;
  let dy = ball2.y - ball1.y;
  let distance = Math.sqrt(dx * dx + dy * dy);

  let collisionNorm = {
    x: dx / distance,
    y: dy / distance,
  };

  let relativeVelocity = {
    x: ball1.dx - ball2.dx,
    y: ball1.dy - ball2.dy,
  };

  let speed =
    relativeVelocity.x * collisionNorm.x + relativeVelocity.y * collisionNorm.y;

  if (speed < 0) return;

  let impulse = (2 * speed) / (ball1.mass + ball2.mass);

  ball1.dx -= impulse * ball2.mass * collisionNorm.x;
  ball1.dy -= impulse * ball2.mass * collisionNorm.y;
  ball2.dx += impulse * ball1.mass * collisionNorm.x;
  ball2.dx += impulse * ball1.mass * collisionNorm.y;

  ball1.dy = ball1.dy * ball1.elasticity;
  ball2.dy = ball2.dy * ball2.elasticity;
};

const collide = (index) => {
  let ball = cannonBalls[index];
  for (let j = index + 1; j < cannonBalls.length; j++) {
    let testBall = cannonBalls[j];
    if (ballHitBall(ball, testBall)) {
      collideBalls(ball, testBall);
    }
  }
};

// Detectar colision entre balas
const ballHitBall = (ball1, ball2) => {
  let collision = false;
  let dx = ball1.x - ball2.x;
  let dy = ball1.y - ball2.y;

  let distance = dx * dx + dy * dy;
  if (distance <= (ball1.radius + ball2.radius) * (ball1.radius + ball2.radius))
    collision = true;

  return collision;
};

const sortBalls = (x, y) => {
  let rotatedAngle = angle;

  let dx = x - (cannon.x + 15);
  let dy = y - (cannon.y - 35);
  let distance = Math.sqrt(dx * dx + dy * dy);
  let originalAngle = Math.atan2(dy, dx);

  let newX = cannon.x + 15 + distance * Math.cos(originalAngle + rotatedAngle);
  let newY = cannon.y - 50 + distance * Math.sin(originalAngle + rotatedAngle);
  return {
    x: newX,
    y: newY,
  };
};

const drawBorder = () => {
  ctx.fillStyle = "#666666";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.clearRect(20, 20, 1360, 560);
};

class Cannon {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.topX = x - 20;
    this.topY = y - 75;
  }

  stand() {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + 15, this.y - 50);
    ctx.lineTo(this.x + 30, this.y);
    ctx.stroke();
  }

  rotateTop() {
    if (mousePos) {
      angle = Math.atan2(
        mousePos.y - (this.y - 50),
        mousePos.x - (this.x + 15)
      );
      ctx.translate(this.x + 15, this.y - 50);
      ctx.rotate(angle);
      ctx.translate(-(this.x + 15), -(this.y - 50));
    }
  }

  draw() {
    this.stand();
    ctx.save();
    this.rotateTop();
    ctx.drawImage(cannonBody, this.topX, this.topY, 100, 50);
  }
}

class CannonBalls {
  constructor(angle, x, y) {
    this.radius = 20;
    this.mass = this.radius;
    this.angle = angle;
    this.x = x;
    this.y = y;
    this.dx = Math.cos(angle) * 7;
    this.dy = Math.sin(angle) * 7;
    this.gravity = 0.05;
    this.elasticity = 0.5;
    this.friction = 0.002;
  }

  move() {
    if (this.y + this.gravity < 580) {
      this.dy += this.gravity;
    }
    // Anadir friccion al eje X
    this.dx = this.dx - this.dx * this.friction;

    this.x += this.dx;
    this.y += this.dy;
  }

  draw() {
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

let cannon = new Cannon(80, 580);

const animate = () => {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBorder();

  cannon.draw();
  ctx.restore();

  // Disparar
  cannonBalls.forEach((ball, index) => {
    ball.move();
    ballHitWall(ball);
    collide(index);
    // Renderizar balas
    ball.draw();
  });
};

canvas.addEventListener("mousemove", (e) => {
  mousePos = {
    x: e.clientX - canvas.offsetLeft,
    y: e.clientY - canvas.offsetTop,
  };
});

canvas.addEventListener("click", (e) => {
  if (angle < -2 || angle > 0.5) return;
  if (!canShoot) return;
  canShoot = false;

  let ballPos = sortBalls(cannon.topX + 100, cannon.topY + 30);

  cannonBalls.push(new CannonBalls(angle, ballPos.x, ballPos.y));

  setTimeout(() => {
    canShoot = true;
  }, 1000);
});

animate();
