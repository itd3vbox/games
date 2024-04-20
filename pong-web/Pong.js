class Pong
{
    element = null

    __SCENE_WIDTH__ = 600
    __SCENE_HEIGHT__ = 400

    data = {
        scene: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        },
        paddle1: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        },
        paddle2: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        },
        ball: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        },
        ballSpeed: 4,
        ballAngle: 0,
        ballIsOut: true,
        ballOut: {
            isLeft: false,
            isRight: false,
        },
        isEnd: false,
        isPlayer1Ready: false,
        isPlayer2Ready: false,
        isReady: false,
        isStopped: false,
        score: {
            player_1: 0,
            player_2: 0,
            max: 2,
        }
    }

    isScrollDisabled = false

    computation = null;
    draw = null;

    keysPressed = {};

    onUpdate = null
    onServerPlayerMovement = null

    gameLoop = null
    gameFPS = 65

    constructor(data)
    {
        this.element = data.element

        this.onUpdate = data.onUpdate
        this.onServerPlayerMovement = data.onServerPlayerMovement

        this.reset()

        this.computation = new PongComputation(this)
        
        this.draw = new PongDraw(
            this.element,
            this, 
            this.computation,
            this.onUpdate,
        )

        window.addEventListener('keydown', (event) => this.handleKeyDown(event));
        window.addEventListener('keyup', (event) => this.handleKeyUp(event));
        this.element.addEventListener('click', () => {
            this.handleScroll(!this.isScrollDisabled); 
        });
    }

    getData()
    {
        return this.data
    }

    setData(data)
    {
        this.data = data
    }

    reset()
    {
        this.data.scene.width = this.element.clientWidth
        this.data.scene.height = this.element.clientHeight
        
        // compute with media query
        this.data.paddle1.width = 30
        this.data.paddle1.height = 100
        this.data.paddle1.x = 100
        this.data.paddle1.y = (this.data.scene.height - this.data.paddle1.height) / 2

        // compute with media query
        this.data.paddle2.width = 30
        this.data.paddle2.height = 100
        this.data.paddle2.x = this.data.scene.width - 100 - this.data.paddle2.width
        this.data.paddle2.y = (this.data.scene.height - this.data.paddle2.height) / 2

        // compute with media query
        this.data.ball.width = 30
        this.data.ball.height = 30
        this.data.ball.x = (this.data.scene.width - this.data.ball.width) / 2
        this.data.ball.y = (this.data.scene.height - this.data.ball.height) / 2

        this.data.ballAngle = 0
        this.data.isEnd = false
        this.data.isReady = false

        this.data.score = {
            player_1: 0,
            player_2: 0,
            max: 4,
        }

        console.log(this.data)
    }

    setDataPlayer1(data)
    {
        if (!data)
            return
        this.data = {
            ...this.data,
            paddle1: data.paddle1 ? data.paddle1 : this.data.paddle1,
            isPlayer1Ready: data.isPlayer1Ready !== undefined ? data.isPlayer1Ready : this.data.isPlayer1Ready,
        }
    }

    setDataPlayer2(data)
    {
        if (!data)
            return
        this.data = {
            ...this.data,
            paddle2: data.paddle2 ? data.paddle2 : this.data.paddle2,
            isPlayer2Ready: data.isPlayer2Ready !== undefined ? data.isPlayer2Ready : this.data.isPlayer2Ready,
        }
    }

    handleKeyDown(event) 
    {
        this.keysPressed[event.key] = true;
        //this.updatePaddleMovement(); // offline 
        this.localePlayerMovement() // locale mode
        //this.serverPlayerMovement() // server mode
    }

    handleKeyUp(event) 
    {
        delete this.keysPressed[event.key];
    }

    handleScroll(isDisable) {
        if (isDisable) {
            this.element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        this.isScrollDisabled = isDisable;
    }


    tryPaddleMovement(data) 
    {
        const gap = 20; // Step size for paddle movement
        
        // Check if data contains instructions for Paddle 1 movement
        if (data && data.player1) {
            if (data.player1.up && this.data.paddle1.y > 10) {
                this.movePaddle1(0, -gap); // Move upward
            }
            if (data.player1.down && this.data.paddle1.y < this.data.scene.height - 10 - this.data.paddle1.height) {
                this.movePaddle1(0, gap); // Move downward
            }
        }
        
        // Check if data contains instructions for Paddle 2 movement
        if (data && data.player2) {
            if (data.player2.up && this.data.paddle2.y > 10) {
                this.movePaddle2(0, -gap); // Move upward
            }
            if (data.player2.down && this.data.paddle2.y < this.data.scene.height - 10 - this.data.paddle2.height) {
                this.movePaddle2(0, gap); // Move downward
            }
        }
    }
    

    movePaddle1(dx, dy) 
    {
        const nextPaddleX = this.data.paddle1.x + dx;
        const nextPaddleY = this.data.paddle1.y + dy;
    
        // Check if the move would cause a collision with the ball
        const isCollision = this.computation?.detecterCollision(
            nextPaddleX, nextPaddleY,
            this.data.paddle1.width, this.data.paddle1.height,
            this.data.ball.x, this.data.ball.y,
            this.data.ball.width,
            5 // Collision tolerance or margin
        );
    
        // If a collision is detected, do not move the paddle
        if (isCollision) {
            return;
        }
    
        // Move the paddle
        this.data.paddle1.x = nextPaddleX;
        this.data.paddle1.y = nextPaddleY;
    }
    
    movePaddle2(dx, dy) 
    {
        const nextPaddleX = this.data.paddle2.x + dx;
        const nextPaddleY = this.data.paddle2.y + dy;
    
        // Check if the move would cause a collision with the ball
        const isCollision = this.computation?.detecterCollision(
            nextPaddleX, 
            nextPaddleY,
            this.data.paddle2.width, 
            this.data.paddle2.height,
            this.data.ball.x, 
            this.data.ball.y,
            this.data.ball.width,
            5 // Collision tolerance or margin
        );
    
        // If a collision is detected, do not move the paddle
        if (isCollision) {
            return;
        }
    
        // Move the paddle
        this.data.paddle2.x = nextPaddleX;
        this.data.paddle2.y = nextPaddleY;
    }
    

    updatePaddleMovement() 
    {
        const gap = 20; // Movement step size
        console.log('data ...', this.data);
        
        // Paddle 1 movement (with 'w' and 's' keys)
        if (this.data.isPlayer1Ready) {
            if ('w' in this.keysPressed && this.data.paddle1.y > 10) {
                this.movePaddle1(0, -gap); // Move upward
            }
            if ('s' in this.keysPressed && this.data.paddle1.y < this.data.scene.height - 10 - this.data.paddle1.height) {
                this.movePaddle1(0, gap); // Move downward
            }
        }
        
        // Paddle 2 movement (with 'ArrowUp' and 'ArrowDown' keys)
        if (this.data.isPlayer2Ready) {
            if ('ArrowUp' in this.keysPressed && this.data.paddle2.y > 10) {
                this.movePaddle2(0, -gap); // Move upward
            }
            if ('ArrowDown' in this.keysPressed && this.data.paddle2.y < this.data.scene.height - 10 - this.data.paddle2.height) {
                this.movePaddle2(0, gap); // Move downward
            }
        }
    }
    

    setLevel(level)
    {
        this.data.ballSpeed = level
    }

    start()
    {
        if (this.draw && !this.draw.isStarted)
        {
            console.log('Pong start ...', this.data)

            if (!this.data.isReady)
            {
                if(this.onUpdate)
                {
                    this.onUpdate({
                        data: this.data,
                        ball_out: null,
                    })
                }
                return ;
            }
            this.handleScroll(true)
            this.reset()
            this.draw.start()
        }
    }

    end()
    {
        if (this.draw)
        {
            console.log('Pong end ...')
            this.handleScroll(false)
            this.draw.stop()
            this.data.isEnd = true
        }
    }

    clear()
    {
        if (this.draw)
        {
            this.handleScroll(false)
            this.reset()
            this.draw.serverDraw()
        }
    }

    // Local game mode: Start
    localeStart() 
    {   
        // Set initial readiness for both players
        this.data.isPlayer1Ready = true;
        this.data.isPlayer2Ready = true;
        this.data.isReady = true;

        // Execute game logic in a separate thread
        const data = this.getData();
        if (this.draw && data) {
            if (data.isEnd) {
                console.log('Game has ended...');
            }
            // Handle screen scrolling based on game state
            this.handleScroll(!data.isEnd);

            // (Optional) Update data for client-side rendering
            // this.setData(data);

            // Start game logic
            this.start();
        }
    }

    // Local game mode: Player Movement
    localePlayerMovement() 
    {
        let data = {};

        // Paddle 1 movement (with 'w' and 's' keys)
        if (this.data.isPlayer1Ready) {
            if ('z' in this.keysPressed) {
                data = {
                    ...data,
                    player1: { up: true }
                };
            }
            if ('s' in this.keysPressed) {
                data = {
                    ...data,
                    player1: { down: true }
                };
            }
        }

        // Paddle 2 movement (with 'ArrowUp' and 'ArrowDown' keys)
        if (this.data.isPlayer2Ready) {
            if ('ArrowUp' in this.keysPressed) {
                data = {
                    ...data,
                    player2: { up: true }
                };
            }
            if ('ArrowDown' in this.keysPressed) {
                data = {
                    ...data,
                    player2: { down: true }
                };
            }
        }

        // Apply the movement data to the corresponding players
        const { player1, player2 } = data;
        this.setDataPlayer1(player1);
        this.setDataPlayer2(player2);

        // Attempt to move the paddles based on the provided input
        this.tryPaddleMovement({ player1, player2 });
    }

    // Server game mode: Start
    serverStart(data) 
    {
        if (this.draw && data) {
            if (data.isEnd) {
                console.log('Game has ended...');
            }
            // Handle screen scrolling based on game state
            this.handleScroll(!data.isEnd);

            // Set data for server-side rendering
            this.setData(data);

            // (Optional) Draw the server-side graphics
            this.draw.serverDraw();
        }
    }

    // Server game mode: Player Movement
    serverPlayerMovement() 
    {
        let data = {};

        // Paddle 1 movement (with 'w' and 's' keys)
        if (this.data.isPlayer1Ready) {
            if ('w' in this.keysPressed) {
                data = {
                    ...data,
                    player1: { up: true }
                };
            }
            if ('s' in this.keysPressed) {
                data = {
                    ...data,
                    player1: { down: true }
                };
            }
        }

        // Paddle 2 movement (with 'ArrowUp' and 'ArrowDown' keys)
        if (this.data.isPlayer2Ready) {
            if ('ArrowUp' in this.keysPressed) {
                data = {
                    ...data,
                    player2: { up: true }
                };
            }
            if ('ArrowDown' in this.keysPressed) {
                data = {
                    ...data,
                    player2: { down: true }
                };
            }
        }

        // Call a custom event handler if defined
        if (this.onServerPlayerMovement) {
            this.onServerPlayerMovement(data);
        }
    }
}