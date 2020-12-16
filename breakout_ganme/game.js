/*控制rules显示和关闭*/

//获取rules的元素
let showrules = document.getElementById('rules-btn');
let closerules = document.getElementById('close_btn');
let rules = document.getElementById('rules');

//显示rules
showrules.onclick = function() {
    rules.classList.add('show');
};
//关闭rules
closerules.onclick = function() {
    rules.classList.remove('show');
};

/**
 *  开始在canvas画元素
 */
//获取canvas画布元素
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let score = 0; //获得的分数

let brickRowCount = 9; //brick的列数
let brickColumnCount = 5; //brick的行数
const delay = 500; //delay to reset the game

//创建ball参数
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 10,
    speed: 4,
    dx: 4,
    dy: -4,
    visible: true,
};

//创建paddle参数
const paddle = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 20,
    w: 80,
    h: 10,
    speed: 8,
    dx: 0,
    visible: true,
};

//创建单个brick参数
const brickInfo = {
    w: 70,
    h: 20,
    padding: 10,
    offsetx: 45,
    offsety: 60,
    visible: true,
};

//创建多个的brick参数
const bricks = [];
for (let i = 0; i < brickRowCount; i++) {
    bricks[i] = [];
    for (let j = 0; j < brickColumnCount; j++) {
        const x = i * (brickInfo.w + brickInfo.padding) + brickInfo.offsetx;
        const y = j * (brickInfo.h + brickInfo.padding) + brickInfo.offsety;
        bricks[i][j] = { x, y, ...brickInfo };
        //...是es6 扩展运算符
    }
}

/**
 * 以上就是相关元素的参数的设置
 * 以下就是利用参数实现功能
 */

/**
  * 画图形的步骤:
  * 1.ctx.beginPath();
  * 2.选择对应的画图的函数
  * 3.进行填充ctx.fillStyle,ctx.fill();
  * 4.结束ctx.closePath(); 
  * 
  */
//开始画ball
function drawBall(params) {
    ctx.beginPath(); //	起始一条路径，或重置当前路径。
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2); // (圆的中心的 x 坐标,	圆的中心的 y 坐标,	圆的半径,起始角，以弧度计（弧的圆形的三点钟位置是 0 度）,结束角，以弧度计)
    ctx.fillStyle = ball.visible ? '#0095dd' : 'transparent'; //设置填充样式
    ctx.fill(); //进行填充
    ctx.closePath(); //结束
}

//开始画paddle
function drawPaddle(params) {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h); //(矩形左上角的 x 坐标,矩形左上角的 y 坐标,矩形的宽度，以像素计,	矩形的高度，以像素计)
    ctx.fillStyle = paddle.visible ? '#0095dd' : 'transparent';
    ctx.fill();
    ctx.closePath();
}

//设置score
function drawScore(params) {
    ctx.font = '20px Arial'; //字体属性
    ctx.fillText(`Score:${score}`, canvas.width - 100, 30); //(规定在画布上输出的文本,开始绘制文本的 x 坐标位置（相对于画布）,开始绘制文本的 y 坐标位置（相对于画布）,	(可选。允许的最大文本宽度，以像素计))
}
//开始画bricks
function drawBricks(params) {
    //你可以使用for循环去画bricks
    //为了学习JavaScript我推荐用forEach()
    bricks.forEach(item => {
        item.forEach(brick => {
            ctx.beginPath();
            ctx.rect(brick.x, brick.y, brick.w, brick.h);
            ctx.fillStyle = brick.visible ? '#0095dd' : 'transparent';
            ctx.fill();
            ctx.closePath();
        });
    });
}

/**
 * 以上是元素的画图已经完成
 * 以下就是控制元素移动等逻辑的实现
 */
//移动paddle
function movePaddle(params) {
    paddle.x += paddle.dx; //加上移动距离
    if (paddle.x + paddle.w > canvas.width) {
        //当你的移动位置在右边时候需要停下
        paddle.x = canvas.width - paddle.w;
    }
    if (paddle.x < 0) {
        //当你的位置在左边需要停下
        paddle.x = 0;
    }
}
//设置ball的移动
function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) {
        ball.dx *= -1;
    } //当ball碰到墙的时候就需要反弹回来
    if (ball.y + ball.size > canvas.height || ball.y - ball.size < 0) {
        ball.dy *= -1;
    } //当ball碰到墙的时候就需要反弹回来
    //console.log(ball.x, ball.y);

    /**
     * x
     * 撞击paddle左端
     * 撞击paddle右端
     * y
     * 撞击paddle
     */
    if (
        ball.x - ball.size > paddle.x &&
        ball.x + ball.size < paddle.x + paddle.w &&
        ball.y + ball.size > paddle.y
    ) {
        //撞击paddle反弹回来
        ball.dy = -ball.speed; //撞击后加速
    }

    /** 
    * 撞击bricks有四种情况
    * 1.bricks左端 
    * 2.bricks右端
    * 3.bricks底部
    * 4.brikcs上部
    * 
    */

    bricks.forEach(item => {
        item.forEach(brick => {
            if (brick.visible) {
                if (
                    ball.x - ball.size > brick.x &&
                    ball.y + ball.size > brick.y &&
                    ball.x + ball.size < brick.x + brick.w &&
                    ball.y - ball.size < brick.y + brick.h
                ) {
                    ball.dy *= -1;
                    brick.visible = false;
                    increaseScore();
                }
            }
        });
    });
    if (ball.y + ball.size > canvas.height) {
        showallbricks();
        score = 0;
    }
}

//改变score的值
function increaseScore(params) {
    score++;
    if (score == brickRowCount * brickColumnCount) {
        ball.visible = false;
        paddle.visible = false;
        ctx.fillText(`0.5s后重新开始`, canvas.width / 2, canvas.height / 2);
        setTimeout(() => {
            ctx.fillText(``, canvas.width / 2, canvas.height / 2);
            showallbricks();
            score = 0;
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
            paddle.x = canvas.width / 2 - 40;
            paddle.y = canvas.height - 20;
            ball.visible = true;
            paddle.visible = true;
        }, delay);
    }
}
//显示所有brick显示
function showallbricks() {
    bricks.forEach(item => {
        item.forEach(brick => {
            brick.visible = true;
        });
    });
}
//画everything
function draw() {
    movePaddle();
    moveBall();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawPaddle();
    drawScore();
    drawBricks();
    requestAnimationFrame(draw);
}
draw();
//update

//获取键盘key,控制paddle的移动
function keydown(e) {
    if (e.key == 'right' || e.key == 'ArrowRight') {
        paddle.dx = paddle.speed;
    }
    if (e.key == 'left' || e.key == 'ArrowLeft') {
        paddle.dx = -paddle.speed;
    }
}
function keyup(e) {
    if (e.key == 'right' || e.key == 'ArrowRight' || e.key == 'left' || e.key == 'ArrowLeft')
        paddle.dx = 0;
}
document.addEventListener('keydown', keydown);
document.addEventListener('keyup', keyup);
