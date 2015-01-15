#pragma strict


var mainMenu : boolean = true;
var about : boolean;
var instructions: boolean;
var exit : boolean;
var MyGUISkin : GUISkin;
var ButtonSkin : GUISkin;
var BackSkin : GUISkin;


var index: int = 1;
var xCount: int = 10;
var nomRows = 2;
var nomCols = 2;
var maxAllowedLevel: int;
var screenAdjust = 50;
var buttonWidth = 100;
var Wt: int = 200;
var Ht: int = 200;
var valueToggle: int = 0;

var scrollPosition : Vector2;

function Update(){

	MyGUISkin.label.fontSize=30*(Screen.height/1280.00);
	MyGUISkin.button.fontSize=60*(Screen.height/1280.00);
	BackSkin.button.fontSize=60*(Screen.height/1280.00);
	MyGUISkin.toggle.fontSize=60*(Screen.height/1280.00);
	//MyGUISkin.verticalScrollbarThumb.fixedHeight=4*(Screen.height/1280.00);

}

function Start() {
	PlayerPrefs.SetInt ("adsOn", 0);
	BackSkin = Resources.Load("GUISkins/BackSkin");
	var audioSource = gameObject.AddComponent(AudioSource);
	MainMenuScript.resetPowerups();
}

function OnGUI() {
	//GUILayout.BeginArea(new Rect(Screen.width/2-100, Screen.height/2-20, 200, 300), "");
	    
	GUILayout.BeginArea(new Rect(Screen.width*0.7, Screen.height*0.05, Screen.width*0.2, Screen.height*0.4), "");
		GUI.skin = BackSkin;

		if(GUILayout.Button("Back")) {
//		if(GUI.Button(Rect (0, Screen.height*.1, Screen.height*.75, Screen.height*.1), "Play")) {		
			audio.PlayOneShot(Resources.Load("audio/Click"));
			Application.LoadLevel(MainMenuScript.MainMenuScene);
		}
		
		if(Input.GetKeyDown("escape")){
			Application.LoadLevel(MainMenuScript.MainMenuScene);
		}
		
	GUILayout.EndArea();
	GUILayout.BeginArea(new Rect(Screen.width*0.1, Screen.height*0.05, Screen.width*0.55, Screen.height*0.1), "");
	
	GUI.skin = MyGUISkin;
	
	GUILayout.Label("Minimize paddle hits and don't use power-ups to score well!");
	
	GUILayout.EndArea();
	
	GUILayout.BeginArea(new Rect(Screen.width*0.1, Screen.height*0.15, Screen.width*0.8, Screen.height*0.55), "");

	GUI.skin = MyGUISkin;
		
		

		if (GUI.Toggle (Rect (0, 0*((Screen.height*0.55-Screen.height*0.05)/5), Screen.width*0.8, Screen.height*0.55/10), (valueToggle == 0), "No Power-Up" )){

		    valueToggle = 0;
		    }

	
	if(PlayerPrefs.GetInt("invincible")>0){
		if (GUI.Toggle (Rect (0, 1*((Screen.height*0.55-Screen.height*0.25)/5), Screen.width*0.8, Screen.height*0.55/10), (valueToggle == 1), "Invincible: " + PlayerPrefs.GetInt("invincible").ToString()) ){

		    valueToggle = 1;
		    }
   }
	if(PlayerPrefs.GetInt("moreConTime")>0){
		if (GUI.Toggle (Rect (0, 2*((Screen.height*0.55-Screen.height*0.25)/5), Screen.width*0.8, Screen.height*0.55/10), (valueToggle == 2), "Longer Curve: " + PlayerPrefs.GetInt("moreConTime").ToString()) ){

		    valueToggle = 2;
		    }
	}	 
	if(PlayerPrefs.GetInt("extraBalls")>0){
		if (GUI.Toggle (Rect (0, 3*((Screen.height*0.55-Screen.height*0.25)/5), Screen.width*0.8, Screen.height*0.55/10), (valueToggle == 3), "Extra Balls: " + PlayerPrefs.GetInt("extraBalls").ToString() )){

		    valueToggle = 3;
		    }
	}
	if(PlayerPrefs.GetInt("longerPaddle")>0){
	if (GUI.Toggle (Rect (0, 4*((Screen.height*0.55-Screen.height*0.25)/5), Screen.width*0.8, Screen.height*0.55/10), (valueToggle == 4), "Longer Paddles: " + PlayerPrefs.GetInt("longerPaddle").ToString()) ){

	    valueToggle = 4;
	    }
	}
			
			GUILayout.EndArea();
	
//	GUILayout.BeginArea(new Rect(Screen.width*0.25, Screen.height*0.25, Screen.width*0.5, Screen.height*0.5), "");
	GUILayout.BeginArea(new Rect(Screen.width*0.1, Screen.height*0.5, Screen.width*0.8, Screen.height*0.9), "");
	//GUILayout.BeginArea(new Rect(0,0,Screen.width * 0.4f,Screen.height));
	
	GUI.skin = ButtonSkin;

//	GUI.skin.label.fontSize = Screen.height / 10;   NO 
//	GUI.skin.button.fontSize = Screen.height / 20; 
	
//	transform.guiText.fontSize = Screen.height / 12; //480 / 40 = 12
	
  /*  for(var n=1; n < maxAllowedLevel;){

        for(var i=0; i<nomRows; i++){

            for(var j=0;j<nomCols; j++){

                GUI.enabled = n <= maxAllowedLevel;

                if(GUI.Button(new Rect(Screen.width/2 - screenAdjust + i*80,j*30 + 150,buttonWidth,25),"Level " + n)){

                    //Load level N

                }

            n++;

            }   

        } 

    } */
    
  /*  for (var b7:int = 0; b7 < 40; b7 ++)    {

    var sz = 12;

    if (GUI.Button (Rect(b7*40,-b7*40,40,40),GUIContent("b7" + b7,"fast selection for digger size")))

        {

            Wt=(b7%6)+1;   Ht=(Mathf.Floor(b7/6))+1;

        }//+++++++++++++++++++++++++++++++++++++++++   

    }	*/
    
	scrollPosition = GUI.BeginScrollView (Rect (0,0,Screen.width*0.8, Screen.height*0.8),scrollPosition, Rect (0, 0, Screen.width*0.8, Screen.height*1.4));

	for (var touch : Touch in Input.touches) 
	{
	        if (touch.phase == TouchPhase.Moved)
	        {

	                 scrollPosition.y += touch.deltaPosition.y;
	                // scrollPosition.x += touch.deltaPosition.x;
	        }
	}
	
		var nomRows = 4;
		var nomCols = 10;
		var n = 0;
		maxAllowedLevel = PlayerPrefs.GetInt("unlockedLevel");
		for(var j=0;j<nomCols; j++)
			{
		for(var i=0; i<nomRows; i++)
		{

				GUI.enabled = n < maxAllowedLevel;
				if(GUI.Button(new Rect(i*(Screen.width*0.8)/nomRows,j*(Screen.height*0.5)/5,(Screen.width*0.8)/nomRows - 5,(Screen.height*0.4)/5),(n+1).ToString()))
				{

					audio.PlayOneShot(Resources.Load("audio/Click"));
					if(valueToggle > 0){
						PlayerPrefs.SetInt("powerUpUsed", 1);
					}
					else if(valueToggle == 1){
						PlayerPrefs.SetInt("invincibleEnabled", 1);
					}
					else if(valueToggle == 2){
						PlayerPrefs.SetInt("moreConEnabled", 1);
					}
					else if(valueToggle == 3){
						PlayerPrefs.SetInt("extraBallEnabled", 1);
					}
					else if(valueToggle == 4){
						PlayerPrefs.SetInt("longPaddleEnabled", 1);
					}
					Application.LoadLevel( n + MainMenuScript.levelsBeforeBB + 1 );
				}
			n++;
			}
			
		
		}
		
			
			GUI.EndScrollView();
			GUILayout.EndArea();
}



