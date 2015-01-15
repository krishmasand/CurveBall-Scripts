#pragma strict

class MainBall extends BallSub {
	//Intended to be extended by game type
	
	//Control Mechanics
	var setControlTime: float = -1;
	var setCooldownTime: float = -1;
	var controlTime: float[]; //1 default
	@System.NonSerialized var cooldownTime: float[]; //4 default
	@System.NonSerialized var startTime: float[];
	@System.NonSerialized var controlTimer:float[];
	var showRestingJoystick:boolean = true;
	@System.NonSerialized var bigCircleOrigSIze: Vector3;
	@System.NonSerialized var smallCircleOrigSIze: Vector3;
	@System.NonSerialized var prevTouchCheck:boolean[];
	@System.NonSerialized var validTouch:boolean[];
	@System.NonSerialized var validKey:boolean[];

	@System.NonSerialized var deadZones = new ArrayList(); // An arraylist of zones that do not affect ball control in the format of (Vector3, Vector3)
	
	// All Ball Mechanics
	@System.NonSerialized var ballCounter:int = 0;
	@System.NonSerialized var ballArray = new ArrayList();
	@System.NonSerialized var ballsAllowed: int = 1;
	@System.NonSerialized var destroyAllSubBallsCheck: boolean = false;
	@System.NonSerialized var ballsOut:int;

	// Desktop Player Input Mechanics
	@System.NonSerialized var playerInput: int = 0;
	@System.NonSerialized var playerInputTimer: float = 0;

	// Debug Text
	@System.NonSerialized var debugText:GameObject;

	// DevMode Mechanics
	@System.NonSerialized var devModeTimer: float = 0;


	// Cosmetic Objects
	@System.NonSerialized var borders: GameObject[] = new GameObject[2];


	// Network Mechanics
	@System.NonSerialized var smallCircleDelta:Vector3[];
	@System.NonSerialized var clientType:int = 0;
	@System.NonSerialized var onlineEnabled:boolean = false;

	@System.NonSerialized var storedByteArrays = new ArrayList(); // Stores the bytes before they are sent
	// List of ArrayLists
	// In format of ArrayList[reliable, byte array, how many times left to send]
	@System.NonSerialized var numTimesSent:int = 10; //How many times the packets are sent


	

	function setBallType() {
		// Overridden method in all inherited balls
		ballType = "NA";
	}
	
	
	function resetChecker() {
		// Checks and implements for a reset of the main ball
		if (!ballEnabled && resetCheck == 0) { //Cycles through balls out and checks if one is still active
			var check:boolean = true;
			for (var ballSub:GameObject in ballArray) {
				if (ballSub.GetComponent(BallSub).ballEnabled && ballSub.GetComponent(BallSub).resetCheck == 0) {
					check = false;
					break;
				}
			}
			if (check) {
				Reset();
				if (ballType == "BB" || ballType == "EL") {
					reduceLives();
				}
				DestroyAllSubBalls();
			}
		}
	}
	
	function reduceLives(num:int){ //Implemented in BB
		// Reduces lives left (used in BB)
	}
	
	function reduceLives() {
		// Reduces lives left (used in BB)
		reduceLives(1);
	}

	function resetTimes (){
		// Resets the various time variables
		for (var i:int = 0; i < opponents; i++) {
			controlTimer[i] = 0;
			controlStage[i] = 0;
			setSmallCircleDelta(i, 0, 0);
		}
	}

	function resetMain() {
		// Reset function for main ball
		// Overridden function from BallSub, implemented in Reset()
		RestoreOrigPosition();
		resetTimes();
	}

	function setSmallCircleDelta(i:int, x:float, y:float) {
		// Sets the smallCircleDelta using a function
		smallCircleDelta[i].x = x;
		smallCircleDelta[i].y = y;
	}


	function setSmallCircleDelta(i:int, vect:Vector3) {
		// Overloads to allow vector input
		setSmallCircleDelta(i, vect.x, vect.y);
	}



	
	function Update() {
		// Unity Update function
		mainStuff();
		BallSubUpdate();
		resetChecker();

	}

	function mainStuff(){
		// Does various main ball activities, executed in update
		manageDevModeToggle();
		managePlayerToggle();
		manageControlTime();
		
		if (!ballEnabled) {
			rigidbody.velocity = rigidbody.velocity * 0;
		}
	
		if (resetCheck == 0 && !(Application.loadedLevel == MainMenuScript.TutorialScene && (TutorialEngine.waitCheck || TutorialEngine.pauseEnabled)) && ((PauseMenu.waitCheck == false  && PauseMenu.pauseEnabled == false) || ballType == "MU")) {

			manageCircleColorSize();
			

			manageControlTouches();



			for (var i:int = 0; i < players; i++) {
				
				manageControlInput(i);
				manageXboxController(i);
			}

			for (i = 0; i < opponents; i++) {
				manageCircleDelta(i);
			}

			manageCirclePosition();
		}

		updateDividers();

		if (onlineEnabled) {
			onlineUpdate();
		}


		debugText.transform.position = transform.position;


	}
	
	function manageDevModeToggle() {
		// Allows only one change of dev mode per second
		if (Application.platform == RuntimePlatform.OSXEditor || RuntimePlatform.WindowsEditor) {
			if (devModeTimer <= Time.time && Input.GetButton("DevMode")) {
				setDevModeAll(!devMode);
				devModeTimer = Time.time + 1;
			}
		}
	}

	function managePlayerToggle() {
		// Allows only one change of player per second
		if (Application.platform == RuntimePlatform.OSXEditor || RuntimePlatform.WindowsEditor) {
			if (playerInputTimer <= Time.time && Input.GetButton("PlayerInput")) {
				playerInput += 1;
				if (playerInput >= players) {
					playerInput -= players;
				}
				playerInputTimer = Time.time + 1;
			}
		}
	}

	function setDebugText(text:String) {
		debugText.GetComponent.<TextMesh>().text = text;
	}

	function manageControlTime() {
		//Control Timer Cycle
		for (var i:int = 0; i < opponents; i++) {
			if (devMode) {
				setControlStageAll(i, 1);
			}
			else {

				// Control Stage has 3 different phases
				// 0 - ready for control
				// 1 - being controlled with more time left
				// 2 - cooling down from being controlled
				

				//0 - Big Circle with color
				//1 - Big Circle shrinking, color
				//2 - Big Circle growing, grey
				if(controlStage[i] == 1){
					controlTimer[i] = controlTime[i] - (Time.time - startTime[i]);
					if(controlTimer[i] < 0){  //If the time has run out on controlling the ball
						setControlStageAll(i, 2);
					}
				}
				
				
				if (controlStage[i] == 2) {  // cant be else if because of transition frame
					controlTimer[i] = (cooldownTime[i] + controlTime[i]) - (Time.time - startTime[i]);
					if (controlTimer[i] < 0) {  // If the cooldown has turned off
						setControlStageAll(i, 0);
						controlTimer[i] = 0;
					}	
				}
			}
		}
	}

	function manageCircleColorSize() {
		// Manages Circle Color and Size
		//0 - Big Circle with color
		//1 - Big Circle shrinking, color
		//2 - Big Circle growing, grey


		for (var i:int = 0; i < opponents; i++) {  //Circle coloring and sizing
			var circleColor:Color;
			if  (i == 0) circleColor = ColorDictionary.blue;
			else if (i == 1) circleColor = ColorDictionary.red;
			if (ballType == "MU") circleColor = ColorDictionary.purple;

			if (controlStage[i] == 0 || devMode) {
				bigCircle[i].transform.localScale = bigCircleOrigSIze;
				bigCircle[i].renderer.material.color = circleColor;
			}

			else if (controlStage[i] == 1) {
				bigCircle[i].transform.localScale = bigCircleOrigSIze * controlTimer[i] / controlTime[i];
				bigCircle[i].transform.localScale.y = bigCircleOrigSIze.y; //y represents the scale of the depth (rotated cylinders)
				bigCircle[i].renderer.material.color = circleColor;
			}

			else if (controlStage[i] == 2) {
				bigCircle[i].transform.localScale = bigCircleOrigSIze * (1 - controlTimer[i]/cooldownTime[i]);
				bigCircle[i].transform.localScale.y = bigCircleOrigSIze.y; //y represents the scale of the depth (rotated cylinders)
				bigCircle[i].renderer.material.color = Color.gray;
			}
			
		}
	}

	function unityCoord(touch:Touch) {
		// Transforms touch coordinates into unity coordinates
		return unityCoord(Vector3(touch.position.x, touch.position.y, 0));
	}		

	function unityCoord(vector:Vector2) {
		// Transforms vector2 coordinates into unity coordinates
		return unityCoord(Vector3(vector.x, vector.y, 0));
	}	

	function unityCoord(x:float, y:float) {
		// Transforms (x,y) coordinates based on screen height and width into unity coordinates
		return unityCoord(Vector3(x, y, 0));
	}


	function unityCoord(vector:Vector3) {
		// Transforms vector coordinates based on screen height and width into unity coordinates
		var xCoord:float;
		var yCoord:float;
		// if (screenWidth/screenHeight <= (rightBound - leftBound) / (topBound - bottomBound)) {
		//Something buggy about this if statement; idgaf

			xCoord = (vector.x/screenWidth - 0.5) * (topBound - bottomBound)*screenWidth/screenHeight;
			yCoord = (vector.y/screenHeight) * (topBound - bottomBound) + bottomBound;
		// }
		return Vector3(xCoord, yCoord, 0);
	}

	function pixelCoord(vector:Vector3) {
		// Transforms vector coordinates based on unity coordinates into screen height and width
		var xCoord:float;
		var yCoord:float;
		xCoord = screenWidth * (vector.x/(topBound - bottomBound) * (screenWidth/screenHeight) + 0.5);
		yCoord = screenHeight * ((vector.y - bottomBound)/(topBound - bottomBound));  //Credit to Jenny He on solving these equations
		if (screenWidth/screenHeight <= (rightBound - leftBound) / (topBound - bottomBound)) {
		}
		else {
			// xCoord = (vector.x/screenWidth) * (rightBound - leftBound) + leftBound;
			// yCoord = (vector.y/screenHeight - 0.5) * (rightBound - leftBound)*screenHeight/screenWidth;
		}
		return Vector3(xCoord, yCoord, 0);
	}


	function manageControlTouches(fakeTouch:Vector3) {
		// Manages all touches on screen but ignores those that dont control
		// Also allows for a fake touch for computer testing
		var i:int;
		for (var j : boolean in validTouch) {j = false;} //Sets all validTouches to false
		for (var k : boolean in validKey) {k = false;} //Sets all validKeys to false

		var touchVectors:Vector2[];
		if (fakeTouch.z >= 0) {
			touchVectors = new Vector2[Input.touches.length + 1];
			touchVectors[touchVectors.length -1] = Vector2(fakeTouch.x, fakeTouch.y);
		}
		else {
		 	touchVectors = new Vector2[Input.touches.length];
		 }
		for (var l :int = 0; l < Input.touches.length; l++) {
			touchVectors[l] = Input.touches[l].position;
		}

		for (var touchVector:Vector2 in touchVectors) {
			var unityCoord:Vector3 = unityCoord(touchVector);
			unityCoord.z = -1;

			var scheme:int;

			if (players == 1 || onlineEnabled) {
				scheme = 1;
			}

			else if (players == 2) {
				scheme = 2;
			}
			
			//xcoord, ycoord refer to the unity pixels
			//transforms touches into pixels
			
			//General map of field
			
			//XCoords
			//Divider @ -14.125
			//Paddles Start @ 0
			//Divider @ 14.125
			
			//YCoords
			//Edge @ 25
			//Paddle @ 22
			//Divider @ 17
			//Center @ 0
			//Divider @ -17
			//Paddle @-22
			//Edge @ -25
			
			i = 0;
			if (scheme == 1) { //Control Scheme for 1 player
				
				if (unityCoord.y > dividers[1].transform.position.y) {
					validTouch[i] = true;  //Valid touch for controlling ball
				}
			}
			
			
			if (scheme == 2) { //Control Scheme for 2 players
			
				if (unityCoord.y > dividers[1].transform.position.y && unityCoord.y < dividers[2].transform.position.y && Mathf.Abs(unityCoord.y) > 1) { //Ensures touch in control zone
				
					if (unityCoord.y < 0) {i = 0;}
					else if (unityCoord.y > 0) {i = 1;}
					if (Mathf.Abs(unityCoord.y) >= 2 || controlStage != 0) {
						validTouch[i] = true;  //Valid touch for controlling ball
					}
					
				}
			}

			for (var zone:Vector3[] in deadZones) { //Negates a touch if it is in a deadzone
				if ((zone[0].x < unityCoord.x && unityCoord.x < zone[1].x) && (zone[0].y > unityCoord.y && unityCoord.y > zone[1].y)) {
					validTouch[i] = false;
					break;
				}
			}
			
			if (!prevTouchCheck[i] && validTouch[i]) { //Checks if this is the first instance of touch

				prevTouchCheck[i] = true;
				
				bigCircle[i].transform.position = unityCoord;
				if (controlStage[i] == 0) {
					setControlStageAll(i, 1);
					timeAwake(i);
				}
			}
			
			if (prevTouchCheck[i]) { //If this is a continuing touch
				if (controlStage[i] == 1){
					smallCircle[i].transform.position = unityCoord;
				}
			}
		}
	}	

	function manageControlTouches() {
		// Overloads to a default fake touch that is ignored

		manageControlTouches(Vector3(0,0,-1));
	}


	function manageControlInput(i:int) {
		// Manages all inputs that relate to control
		if (players == 2 && playerInput == 1) i = 1 - i;
		if (((Input.GetButton("Player1BallLeft") || Input.GetButton("Player1BallRight") || Input.GetButton("Player1BallUp") || Input.GetButton("Player1BallDown")) && i == 0) || ((Input.GetButton("Player2BallLeft") || Input.GetButton("Player2BallRight") || Input.GetButton("Player2BallUp") || Input.GetButton("Player2BallDown")) && i == 1)) { // Checks whether if there is a valid input for each player
			var direction:Vector3;


			if (i == 0) {
				if(Input.GetButton("Player1BallLeft")) direction.x += -1;
				if(Input.GetButton("Player1BallRight")) direction.x += 1;
				if(Input.GetButton("Player1BallUp")) direction.y += 1;
				if(Input.GetButton("Player1BallDown")) direction.y += -1;
			}
			else if ( i == 1) {
				if(Input.GetButton("Player2BallLeft")) direction.x += -1;
				if(Input.GetButton("Player2BallRight")) direction.x += 1;
				if(Input.GetButton("Player2BallUp")) direction.y += 1;
				if(Input.GetButton("Player2BallDown")) direction.y += -1;
			}

			validKey[i] = true;

			if (controlStage[i] == 0) {
				setControlStageAll(i, 1);
				timeAwake(i);
			}

			if (controlStage[i] == 1) {
				bigCircle[i].transform.position.x = -10;
				bigCircle[i].transform.position.y = -11;
				if (i%2 == 1) {
					bigCircle[i].transform.position.x *= -1;
					bigCircle[i].transform.position.y *= -1;
				}
				bigCircle[i].transform.position.z = 1;
				smallCircle[i].transform.position = bigCircle[i].transform.position + direction.normalized * 2;
				smallCircle[i].transform.localScale = smallCircleOrigSIze;
			}
		}
	}

	function manageXboxController(i:int) {
		// Manages Xbox control

		
		if (players == 2 && playerInput == 1) i = 1 - i;
		var direction:Vector3;
		if (i == 0) {
			direction.x = Input.GetAxis( "Joystick1LeftXAxis");
			direction.y = -Input.GetAxis( "Joystick1LeftYAxis");
		}
		if (i == 1) {
			direction.x = Input.GetAxis( "Joystick2LeftXAxis");
			direction.y = -Input.GetAxis( "Joystick2LeftYAxis");
		}

		if (direction.magnitude > 0) {

			validKey[i] = true;

			if (controlStage[i] == 0) {
				setControlStageAll(i, 1);
				timeAwake(i);
			}

			if (controlStage[i] == 1) {
				bigCircle[i].transform.position.x = -10;
				bigCircle[i].transform.position.y = -11;
				if (i%2 == 1) {
					bigCircle[i].transform.position.x *= -1;
					bigCircle[i].transform.position.y *= -1;
				}
				bigCircle[i].transform.position.z = 1;
				smallCircle[i].transform.position = bigCircle[i].transform.position + direction.normalized * 2;
				smallCircle[i].transform.localScale = smallCircleOrigSIze;
			}
		}
	}

	function manageCircleDelta(i:int) {
		// Manages direct input to the small circle
		if (smallCircleDelta[i].magnitude != 0 && resetCheck == 0) {
			validKey[i] = true;
			if (controlStage[i] == 0) {
				setControlStageAll(i, 1);
				timeAwake(i);
			}

			if (controlStage[i] == 1) {
				bigCircle[i].transform.position.x = -10;
				bigCircle[i].transform.position.y = -11;
				if (i%2 == 1) {
					bigCircle[i].transform.position.x *= -1;
					bigCircle[i].transform.position.y *= -1;
				}
				bigCircle[i].transform.position.z = 1;
				smallCircle[i].transform.position = bigCircle[i].transform.position + smallCircleDelta[i].normalized * 2;
				smallCircle[i].transform.position.z = 1;
				smallCircle[i].transform.localScale = smallCircleOrigSIze;
			}
		}
	}



	function manageCirclePosition() {
		// Manages default circle positions
		for (var i:int = 0; i < opponents; i++) {
			if (!validTouch[i] && !validKey[i]) {
				if ((controlStage[i] != 0 && !devMode) || showRestingJoystick) { //Default resting positions
					bigCircle[i].transform.position.x = -10;
					bigCircle[i].transform.position.y = -11;
					bigCircle[i].transform.position.z = 1;
					if (i%2 == 1) {
						bigCircle[i].transform.position.x *= -1;
						bigCircle[i].transform.position.y *= -1;
					}
					smallCircle[i].transform.position = bigCircle[i].transform.position;
					if (bigCircle[i].transform.localScale.magnitude * 0.5 < smallCircleOrigSIze.magnitude) {
						smallCircle[i].transform.localScale = bigCircle[i].transform.localScale * 0.5;
						smallCircle[i].transform.localScale.y = smallCircleOrigSIze.y; //y represents the scale of the depth (rotated cylinders)
					}
					else {
						smallCircle[i].transform.localScale = smallCircleOrigSIze;
					}
				}
				else {
					bigCircle[i].transform.position.y = bottomBound - 20;
					smallCircle[i].transform.position = bigCircle[i].transform.position;
				}
				prevTouchCheck[i] = false;
			}
			if (controlStage[i] == 2) {
				smallCircle[i].transform.position.y = bottomBound - 20;
			}
		}
	}

	function updateDividers() {
		// Actively polls the borders and adjusts dividers accordingly
		var borderCheck:boolean[] = new boolean[5];
		borderCheck[1] = bottomBorder;
		borderCheck[2] = topBorder;
		borderCheck[3] = leftBorder;
		borderCheck[4] = rightBorder;
		if (!borderCheck[1] && !borderCheck[2]) borderCheck[0] = false;
		else borderCheck[0] = true;
		//To associate i with the corresponding border



		for (var i:int = 0; i < dividers.length; i++) {
			if (dividers[i] != null && borderCheck[i]) {
				Destroy(dividers[i]);
				dividers[i] = null;
			}
			else if (dividers[i] == null && !borderCheck[i]) { //pairs i and the border number
				createDivider(i);
			}
		}
	}


	function createDivider(i:int) {
		// Split function, check above for functionality
		dividers[i] = Instantiate(Resources.Load("Prefabs/Cube"));
		// if (ballType == "VS") dividers[i].transform.position = Vector3(0, -15, 0);
		// else 
		dividers[i].transform.position = Vector3(0, -17, 0); // undone for krish
		dividers[i].transform.localScale = Vector3(rightBound-leftBound, .1, .1);
		if (i == 0) {
			dividers[i].transform.position = Vector3(0,0,0);
			dividers[i].transform.localScale.x *= 26f/28;
			dividers[i].name = "Middle Divider";
		}
		else if (i == 1) {
			dividers[i].renderer.material.color = ColorDictionary.blue;
			dividers[i].name = "Bottom Divider";
		}
		else if (i == 2) {
			dividers[i].renderer.material.color = ColorDictionary.red;
			dividers[i].transform.position *= -1;
			dividers[i].name = "Top Divider";
		}
		else {

		}
	}

	function createBorders() {
		// Creates left and right borders
		for (var i:int = 0; i < borders.length; i++) {
			borders[i] = Instantiate(Resources.Load("Prefabs/Cube"));
			borders[i].transform.localScale = Vector3(.25, topBound - bottomBound, .1);
			borders[i].transform.position = Vector3((leftBound - borders[i].transform.localScale.x/2) * Mathf.Pow(-1, i), 0, 0);

			if (i == 0) {
				borders[i].name = "Left Border";
			}

			else if (i == 1) {
				borders[i].name = "Right Border";
			}
		}
	}
			
	
	function DestroyAllSubBalls() {
		// Sets boolean to destroy all sub balls in the Late Update
		destroyAllSubBallsCheck = true;
	}

		
	
	function LateUpdate() {
		// Occurs after all other updates have occurred

		if (destroyAllSubBallsCheck) {
			destroyAllSubBallsCheck = false;
			for (var h:int = 0; h < ballArray.Count; h++) {
				destroyBallSub(ballArray[h]);
			}
		}
		ballsOut = ballArray.Count;
	}

	function destroyBallSub(ballSub:GameObject) {
		 // Actually destroys the balls
		for (var i:int = 0; i < ballArray.Count; i++) {
			var aBallSub:GameObject = ballArray[i];
			if (aBallSub.GetComponent(BallSub).ballId == ballSub.GetComponent(BallSub).ballId) {
				ballArray.RemoveAt(i);
				break;
			}
		}
		Destroy(ballSub, 1);
	}
	
	function allBallArray() {
		// Returns an array of all balls, including the main ball
		var retArray:ArrayList = new ArrayList();
		retArray.Add(gameObject);
		for (var ballSub:GameObject in ballArray) {
			retArray.Add(ballSub);
		}
		return retArray;
	}

	function getAveragePaddleHits() {
		// Returns the average paddle hit, usually used for score
		var total:float = paddleHitCounter;
		for (var ballSub:GameObject in ballArray) {
			total+= ballSub.GetComponent(BallSub).paddleHitCounter;
		}
		return total/ballsAllowed;
	}
	
		
	function instantiateVariables() {
		// Instantiates general main ball variables
		setBallType();
		if (opponents < 0) opponents = players;
		controlTime = new float[opponents]; //1
		cooldownTime = new float[opponents]; //4
		startTime = new float[opponents];
		controlTimer = new float[opponents];
		controlStage = new int[opponents];
		
		bigCircle = new GameObject[opponents];
		smallCircle = new GameObject[opponents];
		smallCircleDelta = new Vector3[opponents];
		
		prevTouchCheck = new boolean[opponents];
		validTouch= new boolean[opponents];
		validKey = new boolean[opponents];

		createBorders();


		if (PlayerPrefs.GetInt("restingJoystickEnabled") == 1) showRestingJoystick = true;
		else showRestingJoystick = false;

		for (var i:int = 0; i < opponents; i++) {  //Instantiates circle objects
			if (setControlTime == -1) controlTime[i] = 1.5;  //Default values
			else controlTime[i] = setControlTime;
			
			if (setCooldownTime== -1) cooldownTime[i] = 4;  //Default values
			else cooldownTime[i] = setCooldownTime;
			
			prevTouchCheck[i] = false;
			
			bigCircle[i] = Instantiate(Resources.Load("Prefabs/RotatedCylinder"));
			bigCircle[i].renderer.material.color = Color.gray;
			bigCircle[i].transform.localScale = Vector3(5,.1,5);
			bigCircle[i].name = "Big Control Circle " + i;
			
			smallCircle[i] = Instantiate(Resources.Load("Prefabs/RotatedCylinder"));
			smallCircle[i].renderer.material.color  = Color.gray;
			smallCircle[i].transform.localScale = Vector3(1,.2,1);
			smallCircle[i].name = "Small Control Circle " + i;

			smallCircleDelta[i] = Vector3(0,0,0);
			
		}
		bigCircleOrigSIze = bigCircle[0].transform.localScale;
		smallCircleOrigSIze = smallCircle[0].transform.localScale;

		debugText = Instantiate(Resources.Load("Prefabs/text"));
		debugText.renderer.material.color = Color.gray;


		SetOrigPosition();
	}

	function addDeadZone(zone:Vector3[]) {
		//In the rectangle made up of the two points, control is disabled
		deadZones.Add(zone);
	}

	function addDeadZone(vector1:Vector3, vector2:Vector3) {
		// overloads for 2 Vector3 arguments
		var zone:Vector3[] = new Vector3[2];
		zone[0] = vector1;
		zone[1] = vector2;
		addDeadZone(zone);
	}

	function addDeadZone(x1:float, y1:float, x2:float, y2:float) {
		// overloads for 4 float arguments
		var vector1:Vector3 = Vector3(x1, y1, 0);
		var vector2:Vector3 = Vector3(x2, y2, 0);
		addDeadZone(vector1, vector2);
	}

	function addDeadZone(array:float[]) {
		// overloads for 1 float array argument
		addDeadZone(array[0], array[1], array[2], array[3]);
	}
	

	function addUnityCoordDeadZone(zone:Vector3[]) {
		//In the rectangle made up of the two points, control is disabled, also converts to unity coordinates
		zone[0] = unityCoord(zone[0]);
		zone[1] = unityCoord(zone[1]);
		deadZones.Add(zone);
	}

	function addUnityCoordDeadZone(vector1:Vector3, vector2:Vector3) {
		// overloads for 2 Vector3 arguments
		var zone:Vector3[] = new Vector3[2];
		zone[0] = vector1;
		zone[1] = vector2;
		addUnityCoordDeadZone(zone);
	}

	function addUnityCoordDeadZone(x1:float, y1:float, x2:float, y2:float) {
		// overloads for 4 float arguments
		var zone:Vector3[] = new Vector3[2];
		var vector1:Vector3 = Vector3(x1, y1, 0);
		var vector2:Vector3 = Vector3(x2, y2, 0);
		addUnityCoordDeadZone(vector1, vector2);
	}

	function addUnityCoordDeadZone(array:float[]) {
		// overloads for 1 float array argument
		addUnityCoordDeadZone(array[0], array[1], array[2], array[3]);
	}
	

	function Start() {
		// Unity Start function
		instantiateVariables();
		ballEnabled = true;
		mainCheck = true;
		

		Reset();

		for (var i:int = 0; i < ballsAllowed - 1; i++) {
			spawnBall();
		}

		Instantiate(Resources.Load("Prefabs/zcredits")); // gives credit where credit is due

	}
	
	function spawnBall(point:Vector3) {
		// Creates a cylinder object with BallSub attached and passes all necessary variables
		var ballSub:GameObject = Instantiate(Resources.Load("Prefabs/BallSub"));
		ballSub.transform.position = point + Vector3(Random.value, Random.value, 0).normalized * transform.localScale.x * 1.5; //Places the ball a random direction and fixed distance away from the main ball
		ballSub.GetComponent(BallSub).ballType = ballType;
		ballSub.GetComponent(BallSub).bigCircle = bigCircle;
		ballSub.GetComponent(BallSub).smallCircle = smallCircle;
		ballSub.GetComponent(BallSub).sSpeed = sSpeed;
		ballSub.GetComponent(BallSub).cSpeed = cSpeed;
		ballSub.GetComponent(BallSub).timesTillC = timesTillC;
		ballSub.GetComponent(BallSub).controlStage = controlStage;
		ballSub.GetComponent(BallSub).invincible = invincible;
		ballSub.GetComponent(BallSub).players = players;
		ballSub.GetComponent(BallSub).opponents = opponents;
		ballSub.GetComponent(BallSub).dividers = dividers;
		ballSub.GetComponent(BallSub).ballId = ballCounter;
		ballSub.GetComponent(BallSub).setBounceBorders(getBounceBorders());
		ballSub.GetComponent(BallSub).setBounds(getBounds());
		ballCounter ++;
		ballArray.Add(ballSub);
		ballSub.name = "BallSub " + allBallArray().Count;
		ballSub.GetComponent(BallSub).Reset();
	}
	
	
	
	function spawnBall() {
		// Creates null argument spawnBall
		spawnBall(orig);
	}



	function enableInvincibleAll(time:float) {
		// Enables invincible on all balls
		for (var ballSub:GameObject in allBallArray()) {
			ballSub.GetComponent(BallSub).enableInvincible(time);
		}
	}
	
	function disableControlAll(time:float) {
		// Disables control on all balls
		for (var ballSub:GameObject in allBallArray()) {
			ballSub.GetComponent(BallSub).disableControl(time);
		}
	}
	
	function setControlStageAll(stages:int[]) {
		// Sets control stage to argument stages on all balls
		for (var ballSub:GameObject in allBallArray()) {
			ballSub.GetComponent(BallSub).setControlStage(stages);
		}
	}
	
	function setControlStageAll(index:int, stage:int) {
		// Sets control stage index to argument stage on all balls
		for (var ballSub:GameObject in allBallArray()) {
			ballSub.GetComponent(BallSub).setControlStage(index,stage);
		}
	}
	
	function setDevModeAll(setting:boolean) {
		// Sets dev mode on all balls
		for (var ballSub:GameObject in allBallArray()) {
			ballSub.GetComponent(BallSub).devMode = setting;
		}
	}
	
		
	function timeAwake(i:int) {
		// Sets the control time start to current time
		startTime[i] = Time.time;
	 
	}
	
	function multiplyControlTime(index:int, factor:float){
		// Multiplies the control time by factor for player index(on all balls)
		controlTime[index] *= factor;
	}
	
	function multiplyControlTime(factor:float) {
		// Defaults to player 0 (used for possible legacy access
		multiplyControlTime(0, factor);
	}







	// Online Multiplayer Functions
		
	//Host Function
	function getBytes() {
		// Type agnostic get function
		var bytes:byte[];
		var i:int = 1;
		var delta:Vector3;
		if (smallCircle[0].transform.position.y > bottomBound) delta = smallCircle[0].transform.position - bigCircle[0].transform.position;
		else delta = Vector3(0,0,0);

		if (clientType == 0) {
			// Returns a byte array of host variables
			bytes = new byte[25];
			bytes[0] = System.Convert.ToByte("H"[0]);
			i = byteArrayReplace(bytes, System.BitConverter.GetBytes(paddles[0].transform.position.x), i);
			i = byteArrayReplace(bytes, System.BitConverter.GetBytes(delta.x), i);
			i = byteArrayReplace(bytes, System.BitConverter.GetBytes(delta.y), i);
			i = byteArrayReplace(bytes, System.BitConverter.GetBytes(transform.position.x), i);
			i = byteArrayReplace(bytes, System.BitConverter.GetBytes(transform.position.y), i);
			i = byteArrayReplace(bytes, System.BitConverter.GetBytes(hitCounter), i);
		}

		else if (clientType == 1) {
			// Returns a byte array of client variables
			bytes = new byte[13];
			bytes[0] = System.Convert.ToByte("C"[0]);
			i = byteArrayReplace(bytes, System.BitConverter.GetBytes(paddles[0].transform.position.x), i);
			i = byteArrayReplace(bytes, System.BitConverter.GetBytes(delta.x), i);
			i = byteArrayReplace(bytes, System.BitConverter.GetBytes(delta.y), i);
		}
		gameObject.SendMessage("receiveData", bytes);
		return bytes;
	}

	function sendLPacket(state:boolean) {
		// Sends a pause byte array
		// State true pauses receivers
		// State false unpauses
		var bytes:byte[] = new byte[2];
		bytes[0] = System.Convert.ToByte("L"[0]);
		if (state) bytes[1] = 1;
		else bytes[1] = 0;



		//Deletes all other pause packets in the queue
		var sendArrayList:ArrayList;
		var sampleBytes:byte[];
		for (var i:int = storedByteArrays.Count - 1; i >= 0; i--) {// Cycles backwards to account for possible deleting
			sendArrayList = storedByteArrays[i];
			sampleBytes = sendArrayList[1];
			if (sampleBytes[0] == System.Convert.ToByte("L"[0])) sendArrayList[2] = 0;
		}


		repeatSendBytes(true, bytes);

	}

	function receiveBytes(bytes:byte[]) {
		// Type agnostic receive function

		// Types of packets
		// "H" - host update (paddle, smallcircle, ball)
		// "C" - client update (paddle, smallcircle)
		// "P" - point update (both player points)
		// "L" - pause update (both pause and unpause) L is for the ll
		// "S" - start update (control time, cooldown time, points till victory)
		if (bytes[0] == System.Convert.ToByte("H"[0])) { // Host
			paddles[1].transform.position.x = System.BitConverter.ToSingle(bytes, 1) * -1;
			smallCircleDelta[1].x = System.BitConverter.ToSingle(bytes, 5) * -1;
			smallCircleDelta[1].y = System.BitConverter.ToSingle(bytes, 9) * -1;
			transform.position.x = System.BitConverter.ToSingle(bytes, 13) * -1;
			transform.position.y = System.BitConverter.ToSingle(bytes, 17) * -1;
			hitCounter = System.BitConverter.ToInt32(bytes, 21) * -1;
		}

		else if (bytes[0] == System.Convert.ToByte("C"[0])) { // Client
			paddles[1].transform.position.x = System.BitConverter.ToSingle(bytes, 1) * -1;
			smallCircleDelta[1].x = System.BitConverter.ToSingle(bytes, 5) * -1;
			smallCircleDelta[1].y = System.BitConverter.ToSingle(bytes, 9) * -1;
		}


		else if (bytes[0] == System.Convert.ToByte("L"[0])) { // Pause
			if (bytes[1] == 1) PauseMenu.staticPause();
			else if (bytes[1] == 0) PauseMenu.staticUnpause();
		}
	}

	static function byteArrayReplace(array1:byte[], array2:byte[], start:int) {
		// Used to concatanate arrays quickly
		for (var i:int = 0; i < array2.length; i++) {
			array1[i+start] = array2[i];
		}
		return i+start;
	}

	function setClientType(type:int) {
		// Duh
		clientType = type;
	}

	static function byteArraySlice(array:byte[], start:int, end:int) {
		// Own array slice function
		var bytes:byte[] = new byte[end - start];
		for (var i:int = 0; i < bytes.length; i++) {
			bytes[i] = array[i+start];
		}
		return bytes;
	}

	function repeatSendBytes(reliable:boolean, data:byte[], times:int) {
		// Stores a byte array and sends every update for a fixed number of times
		var temp = new ArrayList();
		temp.Add(reliable);
		temp.Add(data);
		temp.Add(times);
		// times = in format of ArrayList[reliable, byte array, how many times left to send]
		storedByteArrays.Add(temp);
	}


	function repeatSendBytes(reliable:boolean, data:byte[]) {
		// Overloads repeatSendBytes to default to numTimesSent times
		repeatSendBytes(false, data, numTimesSent);
	}

	function repeatSendBytes(data:byte[]) {
		// Overloads repeatSendBytes to default to unreliable messages
		repeatSendBytes(false, data);
	}

	function sendStoredBytes() {
		// Sends the stored byte array and lowers its counter by 1
		var sendArrayList:ArrayList;
		var countLeft:int;
		for (var i:int = storedByteArrays.Count - 1; i >= 0; i--) {// Cycles backwards to account for possible deleting
			sendArrayList = storedByteArrays[i];
			countLeft = sendArrayList[2];
			if (countLeft > 0) {
				sendBytes(sendArrayList[0], sendArrayList[1]);
				countLeft -= 1;
				if (countLeft == 0) storedByteArrays.RemoveAt(i);
				else sendArrayList[2] = countLeft;
			}
		}
	}


	function sendBytes(reliable:boolean, data:byte[]) {
		// Sends bytes directly to play
		// print("sent " + stringArray(data) + " as " + reliable);
		if (reliable) gameObject.SendMessage("sendReliableMessage", data);
		else gameObject.SendMessage("sendUnreliableMessage", data);
	}

	function sendBytes(data:byte[]) {
		// Overloads sendBytes to default to unreliable messages
		sendBytes(false, data);
	}

	function enableOnline() {
		// Enables online in a bunch of methods
		onlineEnabled = true;
	}

	function onlineUpdate() {
		// called in mainUpdate if onlineEnabled is true

		if (!paddles[1].GetComponent(Paddle).controlDisabled) {
			paddles[1].GetComponent(Paddle).controlDisabled = true;
		}

		sendStoredBytes();

	}

	static function stringArray(array:byte[]) {
		// Returns a string of the array
		var retString:String = "";
		for (var i:int = 0; i < array.length; i++) {
			
			retString += array[i] + " ";

		}
		return retString;
	}


}