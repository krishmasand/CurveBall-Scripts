#pragma strict

	

class BallSub extends MonoBehaviour {
	//Extended by MainBall and also used as an additional ball to MainBall

	//Player Mechanics
	var players:int = 1; //Does not include computers
	var opponents:int = -1; // Includes computers
		// If -1 by Start, defaults to players
	
	//Ball Organization Variables
	@System.NonSerialized var mainCheck:boolean = false; //Boolean that shows whether a ball is a sub or main
	var ballType:String = "NA"; //String that varies among ball types
	@System.NonSerialized var ballId:int = -1; //Unique id to identify balls(for deleting from array)


	//Speed Mechanics
	var cSpeed:float = 35; //constant speed that occurs when hitCounter = timesTillC
	var sSpeed:float = 20; //starting speed
	var timesTillC:int = 6;
	@System.NonSerialized var hitCounter:int = 0;
	@System.NonSerialized var paddleHitCounter:int = 0;
	@System.NonSerialized var currentSpeed:float;
	
	//Reset Mechanics
	@System.NonSerialized var resetCheck:int = 0;
	@System.NonSerialized var ballEnabled: boolean = false;
	@System.NonSerialized var killPoint:Vector3 = new Vector3(0,0,0);
	@System.NonSerialized var killCheck:boolean = false;
	@System.NonSerialized var prevVelocity:Vector3;
	@System.NonSerialized var orig:Vector3;
	@System.NonSerialized var lateStartUsed:boolean = false;
	

	//Ball Control Mechanics
	@System.NonSerialized var controlStage:int[];
	@System.NonSerialized var bigCircle:GameObject[];
	@System.NonSerialized var smallCircle:GameObject[];
	@System.NonSerialized var colorCheck:boolean[];
	@System.NonSerialized var dividers: GameObject[] = new GameObject[5]; //not really sure why 5, usually has only 3



	//Invincible Mode Mechanics
	@System.NonSerialized var invincible: boolean = false;
	@System.NonSerialized var invincibleStartTime: float = 0;
	@System.NonSerialized var invincibleTimer: float = 0;
	@System.NonSerialized var invincibleMax: float = 7;

	//Boundary Floats
	@System.NonSerialized var bottomBound:float = -25;
	@System.NonSerialized var topBound:float = 25;
	@System.NonSerialized var leftBound:float = -14;
	@System.NonSerialized var rightBound:float = 14;
	@System.NonSerialized var screenHeight:float = Screen.height;
	@System.NonSerialized var screenWidth:float = Screen.width;
	
	//Boundary Booleans
	@System.NonSerialized var bottomBorder:boolean = true;
	@System.NonSerialized var topBorder:boolean = true;
	@System.NonSerialized var leftBorder:boolean = true;
	@System.NonSerialized var rightBorder:boolean = true;

	
	//Ball Control Disable Mechanics
	@System.NonSerialized var controlAllowed:boolean = true;
	@System.NonSerialized var controlDisabler:int = 0;
	@System.NonSerialized var controlDisableStartTime:float = -1;
	@System.NonSerialized var stuckTimerStart: float = -1;

	//DevMode Mechanics
	@System.NonSerialized var devMode: boolean = false; //Allows infinite control of ball in all areas
	//Still follows disabled control


	
	//Access Variables
	@System.NonSerialized var paddles: GameObject[];
	

	
	
	function resetChecker() {
		// Function overridden in MainBall
	}

	function resetMain() {
		// Function overridden in MainBall
	}
	
	function mainStuff() {//Does stuff that the main ball stuff
		//Does control time 
		//Does invincible time
		//Draws the circles
	}
	function setBallType() {
		// Overridden method in all inherited balls
		ballType = "NA";
	}	
	function Start () {
		// Generally not used
		// Overridden in MainBall
	
		var audioSource = gameObject.AddComponent(AudioSource);
		if (ballEnabled) {
			Reset();
		}
		else {
			Kill();
		}
			
	}
	
	
	function SetOrigPosition() {
		// Defines original starting position
		orig.x = transform.position.x;
		orig.y = transform.position.y;
	}
	
	function RestoreOrigPosition() {
		// Restores original starting position
		transform.position.x = orig.x;
		transform.position.y = orig.y;
	}
	
	function ResetVariables() {
		// Resets various variables to their starting values
		
		hitCounter = 0;
		collider.isTrigger = false;
		currentSpeed = sSpeed;
		killCheck = false;
	}
	
	function Reset(waitTime:float) {
		// Spawns a ball with mostly reset variables, and gives it a velocity after a set time
		if (resetCheck != 1) {

			resetCheck = 1;


			if (waitTime < 0) {
				if (ballType == "EL") waitTime = 0.1;
				else waitTime = 0.5;
			}

			ResetVariables();
		

			rigidbody.velocity = rigidbody.velocity * 0;

			yield WaitForSeconds(waitTime);

			if (ballType == "MU") renderer.material.color = Color.grey;
			else renderer.material.color = Color.white;

			rigidbody.velocity = rigidbody.velocity * 0;
			resetMain();

			if (ballType == "EL") enableInvincible(waitTime + 0.5);

			if (!mainCheck) sSpeed = (.2*Random.value  + .6) *(sSpeed); // Sets subballs to random speeds

			yield WaitForSeconds(waitTime); // waits for waitTime
			
			ballEnabled = true;
			if (lateStartUsed == false) lateStart();

			var direction:Vector3 =  Vector3(0, -1, 0);
			if (ballType == "VS" || ballType == "MU") {
				if (Random.value > 0.5) direction = Vector3(0, 1, 0); //Randomly sends ball up half the time
			}
			setVelocity(direction);
			resetCheck = 0;
		}
	}

	function lateStart() {
		// Called at the end of the first ball restart 
		lateStartUsed = true;
	}


	function Reset() {
		// Overloads the function to manage null argument
		Reset(-1);
	}
	
	function setPosition(x, y) {
		// Sets position if the ball is enabled
		if (ballEnabled) {
			rigidbody.position.x = x;
			rigidbody.position.y = y;
		}
	}

	function setPosition(vector:Vector3) {
		// Allows vector arguments for setPosition
		setPosition(vector.x, vector.y);
	}

	function setVelocity(x, y) {
		// Cleanest way to force speed
		if (float.IsNaN(x)) x = 0;
		if (float.IsNaN(y)) y = 0;
		if (ballEnabled && !(x == 0 && y == 0)) {
			// print(x + ", " + y);
			rigidbody.velocity.x = x;
			rigidbody.velocity.y = y;
			normSpeed();
		}
	}
	
	function setVelocity(vector:Vector3) {
		// Allows vector arguments for setVelocity
		setVelocity(vector.x, vector.y);
	}

	function normSpeed() {
		// Creates vector of calculated speed and predefined direction
		if (hitCounter < timesTillC){
			var currentSpeedTemp:float = 0f;
			while (true) {
				currentSpeedTemp = hitCounter*1f / timesTillC * (cSpeed - sSpeed) + sSpeed;
				
				if (currentSpeedTemp >= currentSpeed) {
					currentSpeed = currentSpeedTemp;
					break;
				}
				
				if (hitCounter >= timesTillC) break;
				else hitCounter++;

			}
		}
		
		if (hitCounter >= timesTillC) {
			if (currentSpeed <= cSpeed) currentSpeed = cSpeed;
		}
		rigidbody.velocity = rigidbody.velocity.normalized * currentSpeed;
		if (rigidbody.velocity.magnitude == 0) {
			rigidbody.velocity = prevVelocity;
		}
		else {
			prevVelocity = rigidbody.velocity;
		}
	}
	
	function freezeBall(time:float) {
		// Unimplemented
	}
	
	
	function enableControl() {
		// Enables control of ball using method format
		controlAllowed = true;
	}
	
	function forceDisableControl() {
		// Disables control of ball using method format disregarding all other variables
		controlAllowed = false;
	}
	
	function disableControl() {
		// Allows for disabling control for an unknown amount of time
		forceDisableControl();
	}
	
	function disableControl(time:float) {
		// Disables control for argument time
		// If called multiple times, enables control when last time is completed
		if (time > 0) {
			if (controlDisableStartTime == -1) controlDisableStartTime = Time.time;
			controlDisabler ++;
			var startControlDisabler:int = controlDisabler;
			disableControl();
			yield WaitForSeconds(time);
			if (startControlDisabler == controlDisabler) {
				enableControl();
				controlDisableStartTime = -1;
			}
			
		}
	}
	
	function enableInvincible(time:float) {
		// Enables invincible mode for argument time
		invincible = true;
		invincibleMax = time;
	}
	
	function setControlStage(index:int, stage:int) {
		// Sets the control stage with arguments index and stage
		controlStage[index] = stage;
	}
	
	function setControlStage(stages:int[]) {
		// Sets the control stage to argument stages
		controlStage = stages;
	}
	
	function Update () {
		// Unity Update function
		// Written in two methods to allow calling of BallSubUpdate rather than Update
		BallSubUpdate();
	}

	function BallSubUpdate() {
		// Further divides the update that a ballsub should use
		manageInvincible();
		if (resetCheck == 0 && ballEnabled && (PauseMenu.waitCheck == false || ballType == "MU")) {  //Checks if they can move
			
			transform.position.z = 0;
			normSpeed();
			manageControl();
			manageColor();
			reboundBorders();
		}
		
		if (resetCheck == 1) {
			rigidbody.velocity *= 0; //Forces velocity to 0 if resetting
		}
	}

	function manageInvincible() {
		//Invincible Timer Cycle
		if (invincible && resetCheck == 0) {
			if(invincibleStartTime == 0){
				setInvincibleTime();
			}
			if(invincibleStartTime!=0){
				invincibleTimer = invincibleMax - (Time.time - invincibleStartTime);
			}
			if(invincibleTimer <= 0){
				invincible = false;
				invincibleTimer = 0;
				invincibleStartTime = 0;
			}

		}


		//Enables invincible if the ball is stuck
		if (ballType == "EL") {
			if (controlAllowed) {
				stuckTimerStart = -1;
			}
			else if (stuckTimerStart == -1) {
				stuckTimerStart = Time.time;
			}
			else {
				if (Time.time - stuckTimerStart > 1.5) {
					enableInvincible(.5);
				}
			}
		}
	}

	function manageControl() {

		//Manages control direction and colors
		colorCheck = new boolean[opponents];
		var i:int = 0;
		var topDisabled:boolean = false;
		var bottomDisabled:boolean = false;


		// Cleans up some boolean math
		if (!bottomBorder) { 
			if (transform.position.y < dividers[1].transform.position.y) {
				bottomDisabled = true;
			}
		}

		if (!topBorder) {
			if (transform.position.y > dividers[2].transform.position.y) {
				topDisabled = true;
			}
		}


		if ( ( (!bottomDisabled && !topDisabled) || devMode) && ballEnabled && controlAllowed) {
			var direction:Vector3;
			for (i = 0; i < opponents; i++) {
				if (controlStage[i] == 1 && !(smallCircle[i].transform.position == bigCircle[i].transform.position && ballType == "MU")) { //If works, remove circles from this
					direction += Vector3(smallCircle[i].transform.position.x - bigCircle[i].transform.position.x, smallCircle[i].transform.position.y - bigCircle[i].transform.position.y, 0).normalized;
					colorCheck[i] = true;
					
				}
			}
			if (direction.magnitude > 0) setVelocity(direction);
		} 	

	}

	function manageColor() {
		//Set Colors 
		if (ballType == "MU") {
			if (colorCheck[0]) {
				renderer.material.color = ColorDictionary.purple;
			}
			else {
				renderer.material.color = ColorDictionary.gray;
			}
		}
		else {
			if (invincible == true){
				renderer.material.color = ColorDictionary.yellow;
			}
			else if (opponents == 1 && colorCheck[0]) {
				renderer.material.color = ColorDictionary.blue;
			}
			else if (opponents == 2) {
				if (colorCheck[0] && !colorCheck[1]) { //Player 1 controlling only
					renderer.material.color = ColorDictionary.blue;
				}
				else if (colorCheck[1] && !colorCheck[0]) { //Player 2 controlling only
					renderer.material.color = ColorDictionary.red;
				}
				else if (colorCheck[0] && colorCheck[1]) { //Player 1 and 2
					renderer.material.color = ColorDictionary.purple;
				}
				else {
					renderer.material.color = Color.white;
				}
			}
			else renderer.material.color = Color.white;
		}
	}


	function reboundBorders() {
		//Checks bounds
		
		//If the border is true, reflects off of it
		//If not, kills if past it

		var borderCheck:boolean[] = getBounceBorders();
		var vectorIndex:int;
		var direction:float;

		var bounds:float[] = getBounds();
		//To associate i with the corresponding border


		for (var i:int = 0; i < borderCheck.length; i++) {
			if (i < 2) {
				vectorIndex = 1; //Uses y of vectors
			}
			else {
				vectorIndex = 0; //Uses x of vectors
			}
			direction = transform.position[vectorIndex]/Mathf.Abs(transform.position[vectorIndex]); //Results in either 1 or -1
			if (borderCheck[i]) {
				if ((transform.position[vectorIndex] >= 0 && bounds[i] >= 0) || (transform.position[vectorIndex] <= 0 && bounds[i] <= 0)) { //Checks if the signs are the same
					if (Mathf.Abs(transform.position[vectorIndex]) > Mathf.Abs(bounds[i]) - transform.localScale[vectorIndex]/2) { //Compares distance from (0,0)
						var vect:float = Mathf.Abs(rigidbody.velocity[vectorIndex]) * -direction;
						var post:float = (Mathf.Abs(bounds[i]) - transform.localScale[vectorIndex]/2) * direction; // for some reason Vector3[i] is a read only attribute

						if (i < 2) {
							rigidbody.velocity.y = vect;
							transform.position.y = post;
						}
						else {
							rigidbody.velocity.x = vect;
							transform.position.x = post;
						}
					}
				}
			}
			else {
				if (transform.position[vectorIndex] * bounds[i] > 0) { //Checks if the signs are the same
					if (Mathf.Abs(transform.position[vectorIndex]) > Mathf.Abs(bounds[i]) + 2) { //Compares distance from (0,0)
						Kill();
					}
				}
			}
		}
	}
		

	function Kill(){
		// Disables the ball and other assorted kill functions
		if (ballEnabled) {
			ballEnabled = false;
			killPoint = rigidbody.position;
			killCheck = false;
			rigidbody.position.x = 0;
			rigidbody.position.y = bottomBound - 20;
			rigidbody.velocity *= 0;
			collider.isTrigger = true;
		}
		else if (resetCheck == 0){
			rigidbody.position.x = 0;
			rigidbody.position.y = bottomBound - 20;
		}

		
	}

	function setInvincibleTime(){
		// functional method that sets the time invincible started
		invincibleStartTime = Time.time;
	}

	function getBounceBorders(){
		// returns an array of the border checks
		var temp:boolean[] = new boolean[4];
		temp[0] = bottomBorder;
		temp[1] = topBorder;
		temp[2] = leftBorder;
		temp[3] = rightBorder;
		return temp;
	}

	function setBounceBorders(temp:boolean[]){
		// sets the array of the border checks
		bottomBorder = temp[0];
		topBorder = temp[1];
		leftBorder = temp[2];
		rightBorder = temp[3];
	}


	function getBounds(){
		// returns an array of the boundaries
		var temp:float[] = new float[4];
		temp[0] = bottomBound;
		temp[1] = topBound;
		temp[2] = leftBound;
		temp[3] = rightBound;
		return temp;
	}

	function setBounds(temp:float[]){
		// sets the array of the boundaries
		bottomBound = temp[0];
		topBound = temp[1];
		leftBound = temp[2];
		rightBound = temp[3];
	}


	
	function printPosition() {
		// prints the current position of the ball in (x, y)
		print("Ball position: " + transform.position.x + ", " + transform.position.y);
	}
	
	function printVelocity() {
		// prints the current velocity of the ball in (x, y)
		print("Ball velocity: " + rigidbody.velocity.x + ", " + rigidbody.velocity.y);
	}
}