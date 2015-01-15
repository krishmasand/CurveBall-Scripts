#pragma strict
static var devBuild:boolean = true;
// DONT FORGET TO CHANGE IF PUBLISHING


var resetData:boolean;
var togglePay:boolean;



@System.NonSerialized var menuType:String;





var MyGUISkin : GUISkin;
var MyGUISkin2 : GUISkin;
var MyGUISkin3 : GUISkin;
var SubHeadingSkin : GUISkin;
var BackSkin : GUISkin;
var SoundOnSkin : GUISkin;
var SoundOffSkin : GUISkin;
var SoundOn : boolean;
var optionsGuiStyle : GUIStyle;
var contSliderValue : float;
var coolSliderValue : float;
var scoreSliderInt: int;
var aiDifficulty: int;
var instructionScrollPosition : Vector2;
var optionScrollPosition : Vector2;
@System.NonSerialized var cheatCheck: boolean;

@System.NonSerialized var cookiePositions = new ArrayList();


static var MainMenuScene = 0;
static var PvPScene = 1;
static var PvPOnlineScene = 2;
static var PvAIScene = 3;
static var EndlessScene = 4;
static var TutorialScene = 5;
static var LevelSelectionScene = 6;
static var levelsBeforeBB = LevelSelectionScene;
//remember to update MainMenuScript.cs






function OnGUI() {
	if (menuType == "" || menuType == null) {
		menuType == "main";
	}


	if(PlayerPrefs.GetInt("mute") == 0){
		SoundOn = true;
	}
	else{
		SoundOn = false;
	}
	
	resetPowerups();

	if(SoundOn){
		GUI.skin = SoundOnSkin;
		AudioListener.volume = 1;
	}
	else{
		GUI.skin = SoundOffSkin;
		AudioListener.volume = 0;
	}
	
	if(GUI.Button(new Rect(Screen.width*.02,Screen.height*0.01,Screen.width*0.1,Screen.width*0.1),""))
				{
					if(SoundOn){
						PlayerPrefs.SetInt("mute", 1);
						//AudioListener.volume = 0;
					}
					else{
						PlayerPrefs.SetInt("mute", 0);
						//AudioListener.volume = 1;
					}
						
				
				}

//	GUILayout.BeginArea(new Rect(Screen.width*0.25, Screen.height*0.25, Screen.width*0.5, Screen.height*0.5), "");
	GUILayout.BeginArea(new Rect(Screen.width*0.1, Screen.height*0.02, Screen.width*0.8, Screen.height*0.2), "");
	
	GUI.skin = MyGUISkin2;
	GUILayout.Space(5);
//	GUI.skin.label.fontSize = Screen.height / 10;   NO 
//	GUI.skin.button.fontSize = Screen.height / 20; 
	
//	transform.guiText.fontSize = Screen.height / 12; //480 / 40 = 12
	
	var titleText:String;
//	if (PlayerPrefs.GetString("debugText") == "") {
		titleText = "CurveBall";
//	}
//	else {
//		titleText = PlayerPrefs.GetString("debugText");
//	}

	GUILayout.Label(titleText);
	
	GUILayout.EndArea();
	
	GUILayout.BeginArea(new Rect(Screen.width*0.1, Screen.height*0.22, Screen.width*0.8, Screen.height*0.73), "");
	
	GUI.skin = MyGUISkin2;
	
	
	if(menuType == "main") {
		if(GUILayout.Button("Smash Bricks")) {
//		if(GUI.Button(Rect (0, Screen.height*.1, Screen.height*.75, Screen.height*.1), "Play")) {		
			audio.PlayOneShot(Resources.Load("audio/Click"));
			Application.LoadLevel(levelsBeforeBB);
		}

		if (TutorialEngine.phoneCheck() || TutorialEngine.editorCheck()) {
			if(GUILayout.Button("Multiplayer")) {
				audio.PlayOneShot(Resources.Load("audio/Click"));
				menuType = "matchmaking";
			}
		}
		
		if(GUILayout.Button("Endless Bricks")) {
			audio.PlayOneShot(Resources.Load("audio/Click"));
//		if(GUI.Button(Rect (0, Screen.height*.1, Screen.height*.75, Screen.height*.1), "Play")) {		

			Application.LoadLevel(EndlessScene);
		}
		
		if(GUILayout.Button("VS Computer")) {
			audio.PlayOneShot(Resources.Load("audio/Click"));
//		if(GUI.Button(Rect (0, Screen.height*.1, Screen.height*.75, Screen.height*.1), "Play")) {		

			Application.LoadLevel(PvAIScene);
		}

		if (TutorialEngine.phoneCheck() || TutorialEngine.editorCheck()) {
			if(GUILayout.Button("Achievements")) {
				
				audio.PlayOneShot(Resources.Load("audio/Click"));

				if(PlayerPrefs.GetInt("signedIn") == 1){
					PlayerPrefs.SetInt("showAchievements", 1);
				}
				else{
					menuType = "signInInstructions";
				}


			}
		}
		
		if(GUILayout.Button("Options")) {

			audio.PlayOneShot(Resources.Load("audio/Click"));
//		if(GUI.Button(Rect (0, Screen.height*.1, Screen.height*.75, Screen.height*.1), "Play")) {		
			menuType = "options";
			contSliderValue = PlayerPrefs.GetFloat("contSliderValue");
			coolSliderValue = PlayerPrefs.GetFloat("coolSliderValue");
			scoreSliderInt = PlayerPrefs.GetInt("scoreSliderValue");
			aiDifficulty = PlayerPrefs.GetInt("aiDifficulty");

		} 	
		
		/*
		if(GUILayout.Button("Instructions")) {

			audio.PlayOneShot(Resources.Load("audio/Click"));
//		if(GUI.Button(Rect (0, Screen.height*.1, Screen.height*.75, Screen.height*.1), "Play")) {		
			menuType = "instructions";

		}
		*/

		if(GUILayout.Button("Tutorial")) {
			audio.PlayOneShot(Resources.Load("audio/Click"));
			Application.LoadLevel(TutorialScene);
		}
		
		if(GUILayout.Button("About")) {
			audio.PlayOneShot(Resources.Load("audio/Click"));
			menuType = "about";
		}

	
		GUI.skin = BackSkin;
		
		if(GUILayout.Button("Quit")) {
			audio.PlayOneShot(Resources.Load("audio/Click"));
			Application.Quit();
		}
		
		GUI.skin = MyGUISkin2;
		
		
		
	}

	if(menuType == "signInInstructions"){
		GUI.skin = MyGUISkin3;
		GUILayout.Label("Sign into Google+ to use this feature.");
		GUI.skin = MyGUISkin2;
		if(GUILayout.Button("Okay")){
			menuType = "main";
		}
	}
	
	if(menuType == "matchmaking"){
			if(PlayerPrefs.GetInt("OnRoomSetupProgress") == 0 && PlayerPrefs.GetInt("Connecting") == 0){
				if(GUILayout.Button("Same Device")) {
					audio.PlayOneShot(Resources.Load("audio/Click"));
		//		if(GUI.Button(Rect (0, Screen.height*.1, Screen.height*.75, Screen.height*.1), "Play")) {		

					Application.LoadLevel(PvPScene);
				}

				//LastMultiType, Quick = 0 , Regular = 1

				if(GUILayout.Button("Quick Online Game")) {
					audio.PlayOneShot(Resources.Load("audio/Click"));
					PlayerPrefs.SetInt("LastMultiType", 0);
					if(PlayerPrefs.GetInt("signedIn") == 1){
						PlayerPrefs.SetInt("showQuickGame", 1);
						PlayerPrefs.SetInt("Connecting", 1);
					}
					else{
						menuType = "signInInstructions";
					}
					


				}

				if(GUILayout.Button("Create MP Game")) {
					audio.PlayOneShot(Resources.Load("audio/Click"));
					
					PlayerPrefs.SetInt("LastMultiType", 1);
					if(PlayerPrefs.GetInt("signedIn") == 1){
						PlayerPrefs.SetInt("showInviteScreen", 1);
						PlayerPrefs.SetInt("type", 0);
						PlayerPrefs.SetInt("Connecting", 1);
					}
					else{
						menuType = "signInInstructions";
					}

				}
				
				if(GUILayout.Button("Join MP Game")) {
					audio.PlayOneShot(Resources.Load("audio/Click"));
					PlayerPrefs.SetInt("LastMultiType", 1);
					if(PlayerPrefs.GetInt("signedIn") == 1){
						PlayerPrefs.SetInt("joinMultiplayer", 1);
						PlayerPrefs.SetInt("type", 1);
						PlayerPrefs.SetInt("Connecting", 1);
					}
					else{
						menuType = "signInInstructions";
					}



				}
			}

			if(PlayerPrefs.GetInt("Connecting") == 1){
				GUI.skin = MyGUISkin3;
				GUILayout.Label("Connecting to Google Play...");
			}

			if(PlayerPrefs.GetInt("OnRoomSetupProgress") == 1){
				PlayerPrefs.SetInt("Connecting", 0);
				GUI.skin = MyGUISkin3;
				GUILayout.Label("Connecting to opponent...");
			}

			GUI.skin = BackSkin;
			if(GUILayout.Button("Back")) {
				PlayerPrefs.SetInt("Disconnect", 1);
				audio.PlayOneShot(Resources.Load("audio/Click"));
				PlayerPrefs.SetInt("type", 0);
				menuType = "main";


			}

			if(Input.GetKeyDown("escape")){
				PlayerPrefs.SetInt("Disconnect", 1);
				PlayerPrefs.SetInt("type", 0);
				menuType = "main";
			}


			GUI.skin = MyGUISkin2;
	}

	if(menuType == "about"){
			GUI.skin = SubHeadingSkin;
			GUILayout.Label("About");
			GUI.skin = MyGUISkin3;
			GUILayout.Label("Developers: \n Krish Masand & Mark Tai");
			GUILayout.Label("Special Thanks: \n Music - Markus Heichelbech \n Test Devices - UIUC's ACM SIGMobile Chapter \n Inspiration - Julie Rooney & Melissa Antonacci");

			GUILayout.Space(30);

			GUI.skin = BackSkin;
			if(GUILayout.Button("Back")) {
				menuType = "main";
				audio.PlayOneShot(Resources.Load("audio/Click"));
			}

			if(Input.GetKeyDown("escape")){
				menuType = "main";
			}

			GUI.skin = MyGUISkin2;
	}


	//Options Menu
	if(menuType == "options") {
		GUILayout.BeginArea(new Rect(0, 0, Screen.width*0.8, Screen.height*0.7), "");
		optionScrollPosition = GUILayout.BeginScrollView (optionScrollPosition);

	
		
		for (var touch : Touch in Input.touches) {
		        if (touch.phase == TouchPhase.Moved) {

		                 optionScrollPosition.y += touch.deltaPosition.y;
		                 optionScrollPosition.x += touch.deltaPosition.x;
		        }
		}
		
		GUI.skin = SubHeadingSkin;
		GUILayout.Label("Options");
		GUI.skin = MyGUISkin3;
		GUILayout.Space(5);

		GUILayout.Label("Max VS Score: " + scoreSliderInt.ToString());
		scoreSliderInt = GUILayout.HorizontalSlider(scoreSliderInt, 1.0, 30.0);
		PlayerPrefs.SetInt("scoreSliderValue", scoreSliderInt);

		GUILayout.Label("VS Control Time: " + (contSliderValue).ToString("F2"));
		contSliderValue = GUILayout.HorizontalSlider(contSliderValue, 0.0, 10.0);
		PlayerPrefs.SetFloat("contSliderValue", contSliderValue);

		GUILayout.Label("VS Cooldown Time: " + (coolSliderValue).ToString("F2"));
		coolSliderValue = GUILayout.HorizontalSlider(coolSliderValue, 0.0, 10.0);
		PlayerPrefs.SetFloat("coolSliderValue", coolSliderValue);

		var aiText:String = "AI Difficulty: ";
		if (aiDifficulty == 0) aiText += "Easy";
		else if (aiDifficulty == 1) aiText += "Medium";
		else if (aiDifficulty == 2) aiText += "Hard";
		else if (aiDifficulty == 3) aiText += "Insane";
		GUILayout.Label(aiText);
		aiDifficulty = GUILayout.HorizontalSlider(aiDifficulty, 0, 2);
		PlayerPrefs.SetInt("aiDifficulty", aiDifficulty);


		// var adText:String;

		// if (PlayerPrefs.GetInt("adsEnabled") == 1) {
		// 	adText = "Turn Ads Off";
		// 	GUI.skin = BackSkin;
		// }

		// else if (PlayerPrefs.GetInt("adsEnabled") == 0) {
		// 	adText = "Turn Ads On";
		// 	GUI.skin = MyGUISkin2;
		// }

		// if (GUILayout.Button(adText)) {
		// 	audio.PlayOneShot(Resources.Load("audio/Click"));
		// 	PlayerPrefs.SetInt("adsEnabled", 1 - PlayerPrefs.GetInt("adsEnabled")); //toggles between 1 and 0
		// }

		GUI.skin = MyGUISkin2;
		if (PlayerPrefs.GetInt("paid") == 0) {
			if (GUILayout.Button("Donate+Remove Ads")) {
				audio.PlayOneShot(Resources.Load("audio/Click"));
				gameObject.SendMessage("buyCookie");
			}
		}

		else {
			if (GUILayout.Button("Enjoy the Cookie!")) {
				audio.PlayOneShot(Resources.Load("audio/Click"));
				throwCookie();
			}
		}

		var joystickText:String;
		if (PlayerPrefs.GetInt("restingJoystickEnabled") == 0) {
			joystickText = "Rest Joystick is Off";
			GUI.skin = MyGUISkin2;
		}

		else if (PlayerPrefs.GetInt("restingJoystickEnabled") == 1) {
			joystickText = "Rest Joystick is On";
			GUI.skin = BackSkin;
		}

		if (GUILayout.Button(joystickText)) {
			audio.PlayOneShot(Resources.Load("audio/Click"));
			PlayerPrefs.SetInt("restingJoystickEnabled", 1 - PlayerPrefs.GetInt("restingJoystickEnabled")); //toggles between 1 and 0
		}

		var tiltText:String;

		if (PlayerPrefs.GetInt("tiltControlEnabled") == 0) {
			tiltText = "Tilt Control is Off";
			GUI.skin = MyGUISkin2;
		}

		else if (PlayerPrefs.GetInt("tiltControlEnabled") == 1) {
			tiltText = "Tilt Control is On";
			GUI.skin = BackSkin;
		}

		if (GUILayout.Button(tiltText)) {
			audio.PlayOneShot(Resources.Load("audio/Click"));
			PlayerPrefs.SetInt("tiltControlEnabled", 1 - PlayerPrefs.GetInt("tiltControlEnabled")); //toggles between 1 and 0
		}

		if (PlayerPrefs.GetFloat("contSliderValue") <= .02 && PlayerPrefs.GetFloat("coolSliderValue") >= 9.98 && PlayerPrefs.GetInt("scoreSliderValue") == 23) { //Gives you everything

				// PlayerPrefs.SetInt("unlockedLevel", 40);
				// PlayerPrefs.SetInt("extraBalls", 500);
				// PlayerPrefs.SetInt("invincible", 100);
				// PlayerPrefs.SetInt("moreConTime", 100);
				// PlayerPrefs.SetInt("longerPaddle", 100);
			if (!cheatCheck) {
				if (devBuild) {
					togglePay = true;

				}
				else {
					PlayerPrefs.SetInt("adsEnabled", 0);
					PlayerPrefs.SetInt("redditor", 1);
				}
				cheatCheck = true;
			}
		}
		else {
			cheatCheck = false;
		}


		GUI.skin = MyGUISkin2;
		
		if(GUILayout.Button("Reset to Default")) {
			audio.PlayOneShot(Resources.Load("audio/Click"));
			resetOptions();
			contSliderValue = PlayerPrefs.GetFloat("contSliderValue");
			coolSliderValue = PlayerPrefs.GetFloat("coolSliderValue");
			scoreSliderInt = PlayerPrefs.GetInt("scoreSliderValue");
			aiDifficulty = PlayerPrefs.GetInt("aiDifficulty");
		}
		
		GUI.skin = BackSkin;
		
		if(GUILayout.Button("Reset Progress")) {
			audio.PlayOneShot(Resources.Load("audio/Click"));
			menuType = "reset";
			
		}		

		if(GUILayout.Button("Back")) {
			audio.PlayOneShot(Resources.Load("audio/Click"));
			menuType = "main";		
		}	
		
		if(Input.GetKeyDown("escape")){
			menuType = "main";
		}
		
		
		GUI.skin = MyGUISkin2;

		GUILayout.EndScrollView ();
		GUILayout.EndArea();
	}
	
	if(menuType == "reset"){
	
		GUI.skin = MyGUISkin2;
		GUILayout.Label("Options");
		GUI.skin = MyGUISkin3;
		GUILayout.Space(5);
		GUILayout.Label("Are you sure you want to reset your Smash Bricks progress?");
		
		GUI.skin = BackSkin;
		if(GUILayout.Button("Yes")) {
			audio.PlayOneShot(Resources.Load("audio/Click"));
			menuType = "options";
			resetProgress();
			
		}

		GUI.skin = MyGUISkin2;
		if(GUILayout.Button("No")) {
			audio.PlayOneShot(Resources.Load("audio/Click"));
			menuType = "options";
			
		}	
		//GUILayout.label
		
		if(Input.GetKeyDown("escape")){
			menuType = "options";
		}
		
	}
	
	if(menuType == "instructions") {

		GUI.skin = BackSkin;
		if(GUILayout.Button("Back")) {
			audio.PlayOneShot(Resources.Load("audio/Click"));
			menuType = "main";
		}
		
		if(Input.GetKeyDown("escape")){
			menuType = "main";
		}
		
		GUI.skin = MyGUISkin;
		instructionScrollPosition = GUILayout.BeginScrollView (instructionScrollPosition);
		
		for (var touch : Touch in Input.touches) 
		{
		        if (touch.phase == TouchPhase.Moved)
		        {

	                 instructionScrollPosition.y += touch.deltaPosition.y;
	                 instructionScrollPosition.x += touch.deltaPosition.x;
		        }
		}
		
		GUILayout.Label("Instructions");
		GUILayout.Space(1);
		GUILayout.Label("CurveBall is a pong variation with one major difference: ball control!\nControls:\nPaddle - Under the colored line, touch to the left and right of the paddle to move it.  \nBall - Between the white and colored line, touch and hold to move the ball in that direction. The ball control is limited, so use it wisely!");
		GUILayout.Label("Notes:");
		GUILayout.Label("The ball cannot be controlled when past the colored lines.");
		GUILayout.Label("A colored number means you can control the ball. A white number means cooldown.");
		GUILayout.Label("Tip: Try to control the ball here!");
		GUILayout.EndScrollView ();
		




	}


	if (menuType == "rate") {
		GUI.skin = SubHeadingSkin;
		GUILayout.Label("We're glad that you're enjoying CurveBall! Would you like rate our app?");
		GUI.skin = MyGUISkin2;
		if(GUILayout.Button("Yes")){

			Application.OpenURL("market://details?id=com.curveBall.curveBall");
			PlayerPrefs.SetInt("timesToWait", -2);
			menuType = "thanksRate";
		}

		if (GUILayout.Button("Maybe Later")) {
			PlayerPrefs.SetInt("timesToWait", 7);
			menuType = "main";
		}

		if(GUILayout.Button("I Already Have")){
			PlayerPrefs.SetInt("timesToWait", -2);
			menuType = "thanksRate";
		}

		GUI.skin = BackSkin;
	 
		if(GUILayout.Button("No")){
			PlayerPrefs.SetInt("timesToWait", -2);
			menuType = "main";
		}

		GUI.skin = MyGUISkin;
	}

	if (menuType == "thanksRate"){
		GUI.skin = SubHeadingSkin;
		GUILayout.Label("Thanks for rating! We're working hard to make sure your experience is as awesome as possible!");
		GUI.skin = BackSkin;

		if(GUILayout.Button("Main Menu")){
			menuType = "main";
		}

	}

	
	
	GUILayout.EndArea();


	GUILayout.BeginArea(new Rect(0 , 0, Screen.width, Screen.height), "");
	for( var cookiePosition:Vector2 in cookiePositions) {
		if (cookiePosition.y + 338 >= 0 && cookiePosition.y <= Screen.height) { // COOKIE!
			var aTexture:Texture = Resources.Load("Textures/Transparent Cookie");
			GUI.DrawTexture(new Rect(cookiePosition.x, cookiePosition.y, 340, 338),  aTexture);
		}
	}
	GUILayout.EndArea();		

//	GUILayout.EndScrollView ();

}




function Start () {
	if (resetData) {
		resetAllData();
		resetData = false;
	}
	menuType = "main";

	PauseMenu.EnableButton();
	
	BackSkin = Resources.Load("GUISkins/BackSkin");
	var audioSource = gameObject.AddComponent(AudioSource);


	PlayerPrefs.SetInt("adsOn", 0);
	//to not make the phone think that it's connected to multiplayer when the app starts
	PlayerPrefs.SetInt("OnRoomSetupProgress", 0);
	//makes sure thinks is mp host before mp starts, changed if becomes client
	PlayerPrefs.SetInt("type", 0);

	instantiatePlayerPrefFloat("contSliderValue", 1.75);
	instantiatePlayerPrefFloat("coolSliderValue", 4.00);
	instantiatePlayerPrefInt("scoreSliderValue", 5);
	instantiatePlayerPrefInt("aiDifficulty", 00);

	contSliderValue = PlayerPrefs.GetFloat("contSliderValue");
	coolSliderValue = PlayerPrefs.GetFloat("coolSliderValue");
	scoreSliderInt = PlayerPrefs.GetInt("scoreSliderValue");
	aiDifficulty = PlayerPrefs.GetInt("aiDifficulty");
	

	if(!PlayerPrefs.HasKey("unlockedLevel")){
		resetProgress();
	}
	
	instantiatePlayerPrefInt("paid", 0);
	instantiatePlayerPrefInt("cookiesEaten", 0);

	instantiatePlayerPrefInt("mute", 0);
	instantiatePlayerPrefInt("adsEnabled", 1);
	instantiatePlayerPrefInt("restingJoystickEnabled", 1);
	instantiatePlayerPrefInt("tiltControlEnabled", 0);

	instantiatePlayerPrefInt("timesToWait", -1);

	instantiatePlayerPrefInt("signedIn", 0);

	instantiatePlayerPrefInt("firstTime", 1);
	instantiatePlayerPrefInt("firstTimeComputerMultiplayer", 1);
	//instantiatePlayerPrefString("debugText", "arst");

	if (PlayerPrefs.GetInt("firstTime") == 1) {
		Application.LoadLevel(TutorialScene); //Goes to tutorial
	}

	if (PlayerPrefs.GetInt("timesToWait") > 0) {
		PlayerPrefs.SetInt("timesToWait", PlayerPrefs.GetInt("timesToWait") - 1);
	}

	
	Time.timeScale = 1;

	
}



function instantiatePlayerPrefInt(key:String, value:int) {
	if (!PlayerPrefs.HasKey(key)) {
		PlayerPrefs.SetInt(key, value);
	}
}


function instantiatePlayerPrefFloat(key:String, value:float) {
	if (!PlayerPrefs.HasKey(key)) {
		PlayerPrefs.SetFloat(key, value);
	}
}

function instantiatePlayerPrefString(key:String, value:String) {
	if (!PlayerPrefs.HasKey(key)) {
		PlayerPrefs.SetString(key, value);
	}
}

function Update () {

	if (PlayerPrefs.GetInt("timesToWait") == 0) {
		menuType = "rate";
	}

	else if (PlayerPrefs.GetInt("timesToWait") == -1 && (PlayerPrefs.GetInt("unlockedLevel") >= 7)) { //Put cases to ask for ratings here
		PlayerPrefs.SetInt("timesToWait", 1) ;
	}

	//MyGUISkin2.label.fontSize*=(Screen.height/1280);
	MyGUISkin.label.fontSize=30*(Screen.height/1280.00);
	MyGUISkin2.label.fontSize=120*(Screen.height/1280.00);
	MyGUISkin3.label.fontSize=30*(Screen.height/1280.00);
	SubHeadingSkin.label.fontSize=60*(Screen.height/1280.00);
	MyGUISkin.button.fontSize=60*(Screen.height/1280.00);
	MyGUISkin2.button.fontSize=60*(Screen.height/1280.00);
	MyGUISkin3.button.fontSize=60*(Screen.height/1280.00);
	BackSkin.button.fontSize=60*(Screen.height/1280.00);

	MyGUISkin.button.fontSize=60*(Screen.height/1280.00);
	//buttonGuiStyle.button.fontSize=60*(Screen.height/1280.00);
	MyGUISkin3.horizontalSlider.fixedHeight=50*(Screen.height/1280.00);
	MyGUISkin3.horizontalSliderThumb.fixedHeight=50*(Screen.height/1280.00);
	MyGUISkin3.horizontalSliderThumb.fixedWidth =50*(Screen.height/1280.00);
	if (resetData) {
		resetAllData();
		resetData = false;
	}

	if (togglePay && PlayerPrefs.GetInt("paid") == 0) {
		fakePay();
		togglePay = false;
	}

	else if (togglePay) {
		unpay();
		togglePay = false;
	}



	if(PlayerPrefs.GetInt("InviteAccepted") == 1){
		PlayerPrefs.SetInt("InviteAccepted", 0);
		autoAcceptInvite();

	}

	if (PlayerPrefs.GetInt("paid") == 1) {
		PlayerPrefs.SetInt("adsEnabled", 0);
	}


	for(var i:int = cookiePositions.Count - 1; i >= 0; i--) { //Goes down to account for possible deleting
		var cookiePosition:Vector2 = cookiePositions[i];
		if (cookiePosition.y + 338 >= 0 && cookiePosition.y <= Screen.height) { // COOKIE!
			cookiePosition.y = cookiePosition.y  + Time.deltaTime/1.58 * (Screen.height); //1.58 seconds is the delay of COOKIE to nomnomnom
			cookiePositions[i] = cookiePosition;
		}
		else if (cookiePosition.y > Screen.height) {
			cookiePositions.RemoveAt(i);
			PlayerPrefs.SetInt("cookiesEaten", PlayerPrefs.GetInt("cookiesEaten") + 1);
		}
	}
	
	
}

function fakePay() {
	PlayerPrefs.SetInt("paid", 1);
}

function unpay() {
	PlayerPrefs.SetInt("paid", 0);
}

function throwCookie() {
	cookiePositions.Add(Vector2(Screen.width/2 - 340/2,-338));
	audio.PlayOneShot(Resources.Load("audio/COOKIE"));
}



function autoAcceptInvite(){
	menuType = "matchmaking";
	//PlayerPrefs.SetInt("joinMultiplayer", 1);
	PlayerPrefs.SetInt("type", 1);

}

static function resetOptions() {
	PlayerPrefs.SetFloat("contSliderValue", 1.75);
	PlayerPrefs.SetFloat("coolSliderValue", 4.00);
	PlayerPrefs.SetInt("scoreSliderValue", 5);
	PlayerPrefs.SetInt("aiDifficulty", 0);
	PlayerPrefs.SetInt("mute", 0);
	PlayerPrefs.SetInt("adsEnabled", 1);
	PlayerPrefs.SetInt("restingJoystickEnabled", 1);
	PlayerPrefs.SetInt("tiltControlEnabled", 0);
}



static function resetProgress(){
	
	
	PlayerPrefs.SetInt("unlockedLevel", 1);
	
	PlayerPrefs.SetInt("extraBalls", 0);
	PlayerPrefs.SetInt("invincible", 0);
	PlayerPrefs.SetInt("moreConTime", 0);
	PlayerPrefs.SetInt("longerPaddle", 0);
	PlayerPrefs.SetInt("ELScore", 0);

	PlayerPrefs.SetInt("resetCloud", 1);
}
static function resetPowerups() {

	if(PlayerPrefs.GetInt("invincibleEnabled") == 1){
		PlayerPrefs.SetInt("invincibleEnabled", 0);
		PlayerPrefs.SetInt("invincible", PlayerPrefs.GetInt("invincible") - 1);
	}
	if(PlayerPrefs.GetInt("extraBallEnabled") == 1){
		PlayerPrefs.SetInt("extraBallEnabled", 0);
		if (PlayerPrefs.GetInt("extraBalls") >= 5) {
			PlayerPrefs.SetInt("extraBalls", PlayerPrefs.GetInt("extraBalls") - 4) ;
		}
		else{
			PlayerPrefs.SetInt("extraBalls", 0);
		}
	}
	if(PlayerPrefs.GetInt("moreConEnabled") == 1){
		PlayerPrefs.SetInt("moreConEnabled", 0);
		PlayerPrefs.SetInt("moreConTime", PlayerPrefs.GetInt("moreConTime") - 1);
	}
	if(PlayerPrefs.GetInt("longPaddleEnabled") == 1){
		PlayerPrefs.SetInt("longPaddleEnabled", 0);
		PlayerPrefs.SetInt("longerPaddle", PlayerPrefs.GetInt("longerPaddle") - 1);
	}
}

static function resetAllData() {
	resetProgress();
	resetOptions();
	PlayerPrefs.SetInt("firstTime", 1);
	PlayerPrefs.SetInt("firstTimeComputerMultiplayer", 1);
	PlayerPrefs.DeleteAll();
}
