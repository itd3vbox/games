class PongComputation
{
    pong = null
        
    constructor(pong)
    {
        this.pong = pong
    }

    updateCoordinatesRelativeFrom(planeFrom, plane, x, y) 
    {
        var planeFromPosition = planeFrom.position;
        var planePosition = plane.position;
    
        // Get the width and height of 'planeFrom'
        var planeFromGeometry = planeFrom.geometry;
        var planeFromSize = {
            width: planeFromGeometry.parameters.width,
            height: planeFromGeometry.parameters.height,
        };
    
        // Get the width and height of 'plane'
        var planeGeometry = plane.geometry;
        var planeSize = {
            width: planeGeometry.parameters.width,
            height: planeGeometry.parameters.height,
        };
    
        // Calculate the new coordinates based on the relative position and size difference
        var x2 = planeFromPosition.x + x - planeFromSize.width / 2 + planeSize.width / 2;
        var y2 = planeFromPosition.y - y + planeFromSize.height / 2 - planeSize.height / 2;
    
        // Set the new position for 'plane'
        plane.position.set(x2, y2, planePosition.z);
    }
    
    generateRandomAngle() 
    {
        let angleView = 30;
        let angleIgnore1 = [90 - (angleView / 2), 90 + (angleView / 2)]; // plage près de 90 degrés
        let angleIgnore2 = [270 - (angleView / 2), 270 + (angleView / 2)]; // plage près de 270 degrés
        const verticalAngles = [90, 270];
        let angle;
        do {
            angle = Math.random() * 360;
        } while ((angle >= angleIgnore1[0] && angle <= angleIgnore1[1]) || (angle >= angleIgnore2[0] && angle <= angleIgnore2[1]) || verticalAngles.includes(angle));
        return angle;
    }
    
    
    ballCompute() 
    {
        // If the ball angle has not been initialized, generate a random angle
        if (this.pong.getData().ballAngle == -1) {
            this.pong.getData().ballAngle = this.generateRandomAngle();
        }
    
        // Convert the ball angle from degrees to radians
        var angleRad = this.pong.getData().ballAngle * Math.PI / 180;
    
        // Calculate the X and Y components of the ball's speed
        // 'ballSpeed' could be set by the game level or difficulty
        var speedX = Math.cos(angleRad) * this.pong.getData().ballSpeed;
        var speedY = Math.sin(angleRad) * this.pong.getData().ballSpeed;
    
        // Move the ball in the direction determined by the speed components
        this.pong.getData().ball.x += speedX * 1; // Update the X-coordinate
        this.pong.getData().ball.y += speedY * 1; // Update the Y-coordinate
    
        // Compute potential collisions after moving the ball
        return this.ballComputeCollision();
    }
    
    detecterCollision(
        x_paddle,
        y_paddle,
        largeur_paddle,
        hauteur_paddle,
        x_balle,
        y_balle,
        taille_cote_balle,
        n_pixel
    ) 
    {

        var gauche_paddle = x_paddle - n_pixel;
        var droite_paddle = x_paddle + largeur_paddle + n_pixel;
        var haut_paddle = y_paddle - n_pixel;
        var bas_paddle = y_paddle + hauteur_paddle + n_pixel;
    
        var gauche_balle = x_balle;
        var droite_balle = x_balle + taille_cote_balle;
        var haut_balle = y_balle;
        var bas_balle = y_balle + taille_cote_balle;
    
        if (gauche_paddle < droite_balle && droite_paddle > gauche_balle &&
            haut_paddle < bas_balle && bas_paddle > haut_balle) {
            return true;
        } else {
            return false;
        }
    }

    ballComputeCollision() 
    {
        let data = {
            isLeft: false,
            isRight: false,
        };
    
        // Check if the ball has gone out of bounds on the left or the right
        if (this.pong.getData().ball.x < 0) {
            // The ball went out on the left
            data = {
                isLeft: true,
                isRight: false,
            };
            this.pong.getData().ballIsOut = true;
        } else if (this.pong.getData().ball.x > this.pong.getData().scene.width - this.pong.getData().ball.width) {
            // The ball went out on the right
            data = {
                isLeft: false,
                isRight: true,
            };
            this.pong.getData().ballIsOut = true;
        } else {
            // The ball did not go out of bounds
            this.pong.getData().ballIsOut = false;
        }
    
        // Law of reflection: If the ball hits the left or right wall
        if (this.pong.getData().ball.x < 0 || this.pong.getData().ball.x > this.pong.getData().scene.width - this.pong.getData().ball.width) {
            // Reverse the horizontal direction of the ball
            this.pong.getData().ballAngle = 180 - this.pong.getData().ballAngle;
            if (this.pong.getData().ballIsOut) {
                // Reset the ball to the center if it went out
                this.pong.getData().ballAngle = -1; // Invalidate the angle to force reinitialization
                this.pong.getData().ball.x = (this.pong.getData().scene.width - this.pong.getData().ball.width) / 2; // Center horizontally
                this.pong.getData().ball.y = (this.pong.getData().scene.height - this.pong.getData().ball.height) / 2; // Center vertically
            }
        }
    
        // If the ball hits the top or bottom wall
        if (this.pong.getData().ball.y < 0 || this.pong.getData().ball.y > this.pong.getData().scene.height - this.pong.getData().ball.height) {
            // Reverse the vertical direction of the ball
            this.pong.getData().ballAngle = 360 - this.pong.getData().ballAngle;
        }
    
        // Check for collisions with the paddles
        this.ballComputeCollisionPaddle1();
        this.ballComputeCollisionPaddle2();
    
        return data; // Return information on whether the ball went out on the left or right
    }
    
    ballComputeCollisionPaddle1() 
    {
        // Detect a collision with paddle1
        const isCollision1 = this.detecterCollision(
            this.pong.getData().paddle1.x, this.pong.getData().paddle1.y, 
            this.pong.getData().paddle1.width, this.pong.getData().paddle1.height, 
            this.pong.getData().ball.x, this.pong.getData().ball.y, 
            this.pong.getData().ball.width, 
            5, // Collision tolerance or margin
        );
    
        if (isCollision1) {
            console.log("Collision detected!", 
                this.pong.getData().ball.x, this.pong.getData().ball.y,
                this.pong.getData().paddle1.x, this.pong.getData().paddle1.y, 
            );
    
            // Generate a random angle variation
            let angleVariation = (Math.random() - 0.5) * 20; // Random variation between -10 and 10 degrees
    
            // Add this variation to the reflection angle
            this.pong.getData().ballAngle += angleVariation;
    
            // If the ball hits the paddle, invert the horizontal angle
            // This inversion ensures the ball bounces back in the opposite direction
            if (this.pong.getData().ball.x > this.pong.getData().paddle1.x + this.pong.getData().paddle1.width / 2) {
                // Invert the angle to bounce to the right
                this.pong.getData().ballAngle = 180 - this.pong.getData().ballAngle;
            } else {
                // Invert the angle to bounce to the left
                this.pong.getData().ballAngle = 180 + 180 - this.pong.getData().ballAngle; // Equivalent to 360 - 180 + angle
            }
    
            // Invert the vertical angle to simulate reflection off the paddle
            this.pong.getData().ballAngle = 360 - this.pong.getData().ballAngle;
        }
    }
    
    ballComputeCollisionPaddle2() 
    {
        // Detect a collision with paddle2
        const isCollision2 = this.detecterCollision(
            this.pong.getData().paddle2.x, this.pong.getData().paddle2.y, 
            this.pong.getData().paddle2.width, this.pong.getData().paddle2.height,
            this.pong.getData().ball.x, this.pong.getData().ball.y, 
            this.pong.getData().ball.width, 
            5, // Collision tolerance or margin
        );
    
        if (isCollision2) {
            console.log("Collision detected!", 
                this.pong.getData().ball.x, this.pong.getData().ball.y,
                this.pong.getData().paddle2.x, this.pong.getData().paddle2.y, 
            );
    
            // Generate a random angle variation
            let angleVariation = (Math.random() - 0.5) * 20; // Random variation between -10 and 10 degrees
    
            // Add this variation to the reflection angle
            this.pong.getData().ballAngle += angleVariation;
    
            // If the ball hits the paddle, invert the horizontal angle
            // This inversion handles the direction change after collision
            if (this.pong.getData().ball.x < this.pong.getData().paddle2.x + this.pong.getData().paddle2.width / 2) {
                // Invert the angle to bounce to the left
                this.pong.getData().ballAngle = 180 - this.pong.getData().ballAngle;
            } else {
                // Invert the angle to bounce to the right
                this.pong.getData().ballAngle = 180 + 180 - this.pong.getData().ballAngle; // Same as 360 - 180 + angle
            }
    
            // Invert the vertical angle to simulate reflection
            this.pong.getData().ballAngle = 360 - this.pong.getData().ballAngle;
        }
    }

    resize(sizeNew) 
    {
        let data = this.pong.getData();
    
        // Calculate the new scene dimensions based on the new size
        let scene = {
            ...data.scene,
            width: sizeNew.width,
            height: sizeNew.height,
        };
    
        // Calculate the ratio of change for X and Y dimensions
        const ratioX = sizeNew.width / data.scene.width;
        const ratioY = sizeNew.height / data.scene.height;
    
        // Update paddle1's position and size according to the new ratios
        let paddle1 = {
            x: data.paddle1.x * ratioX,
            y: data.paddle1.y * ratioY,
            width: data.paddle1.width * ratioX,
            height: data.paddle1.height * ratioY,
        };
    
        // Update paddle2's position and size according to the new ratios
        let paddle2 = {
            x: data.paddle2.x * ratioX,
            y: data.paddle2.y * ratioY,
            width: data.paddle2.width * ratioX,
            height: data.paddle2.height * ratioY,
        };
    
        // Update ball's position and size (assuming it's a square, only width is used)
        let ball = {
            x: data.ball.x * ratioX,
            y: data.ball.y * ratioY,
            width: data.ball.width * ratioX,
            height: data.ball.width * ratioX, // Since the ball is square
        };
    
        // Apply the changes back to the game data
        data.scene = scene;
        data.paddle1 = paddle1;
        data.paddle2 = paddle2;
        data.ball = ball;
    
        // If needed, you can update other components like scoring areas or boundaries based on the new scene size
    }
}