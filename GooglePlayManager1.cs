using UnityEngine;
using System.Collections;
using GooglePlayGames;
using UnityEngine.SocialPlatforms;
using GooglePlayGames.BasicApi.Multiplayer;




public class GooglePlayManager1 : MonoBehaviour {

	InvitationManager inv2 = new InvitationManager();
	public static bool signedInSession = false;
	public static bool quickGameSetup = false;
	public static int type = 0;
	public GUISkin GoogleSkin;
	public Texture signedInTexture;
	public Texture signingInTexture;

	void OnGUI(){

		if(Application.loadedLevel == 0){
			
			if(PlayerPrefs.GetInt("signedIn") == 0 || !PlayerPrefs.HasKey("signedIn")){
				GUI.skin = GoogleSkin;
				if (GUI.Button(new Rect((float)(Screen.width*0.88), (float)(Screen.height*0.01), (float)(Screen.width*0.1), (float)(Screen.width*0.1)), "")){

					PlayerPrefs.SetInt("signedIn", 2);
					// recommended for debugging:
					PlayGamesPlatform.DebugLogEnabled = true;
					
					// Activate the Google Play Games platform
					PlayGamesPlatform.Activate();

					Social.localUser.Authenticate((bool success) => {
						// handle success or failure
						if(success){
							PlayerPrefs.SetInt("signedIn", 1);
							signedInSession = true;
						// register an invitation delegate
							InvitationManager.Instance.Setup();
				            
							CloudSaveScript1.Instance.LoadState();

							CloudSaveScript1.Instance.SaveState();
						}
						else{
							PlayerPrefs.SetInt("signedIn", 0);
						}
					});
			

		        }
	        }
	        else if(PlayerPrefs.GetInt("signedIn") == 1){
	        	
	        	//GUI.DrawTexture(new Rect((float)(Screen.width*0.73896),(float)(Screen.height*0.01),(float)(Screen.width*0.24104),(float)(Screen.width*0.1)),signedInTexture);

	        	GUI.DrawTexture(new Rect((float)(Screen.width*0.37948),(float)(Screen.height*0.135),(float)(Screen.width*0.24104),(float)(Screen.width*0.1)),signedInTexture);
	        }
    	    else if(PlayerPrefs.GetInt("signedIn") == 2){
	        	


	        	GUI.DrawTexture(new Rect((float)(Screen.width*0.37948),(float)(Screen.height*0.135),(float)(Screen.width*0.24104),(float)(Screen.width*0.1)),signingInTexture);
	        }


	        	
	        	


	    }



	}

	public void OnInvitationReceived(Invitation inv, bool shouldAutoAccept) {
		//Application.LoadLevel(MainMenuScript.MainMenuScene);
		//PlayerPrefs.SetInt("InviteAccepted", 1);
	}
	
	// Use this for initialization




	void Start () {


		if((PlayerPrefs.GetInt("signedIn") == 1 || PlayerPrefs.GetInt("signedIn") == 2) && !signedInSession){

				PlayerPrefs.SetInt("signedIn", 2);

	        	//GUI.DrawTexture(new Rect((float)(Screen.width*0.73896),(float)(Screen.height*0.01),(float)(Screen.width*0.24104),(float)(Screen.width*0.1)),signedInTexture);
        							// recommended for debugging:
					PlayGamesPlatform.DebugLogEnabled = true;
					
					// Activate the Google Play Games platform
					PlayGamesPlatform.Activate();

					Social.localUser.Authenticate((bool success) => {
						// handle success or failure
						if(success){
							PlayerPrefs.SetInt("signedIn", 1);
							signedInSession = true;
						// register an invitation delegate

							InvitationManager.Instance.Setup();
				            
							CloudSaveScript1.Instance.LoadState();

							
						}
						else{
							PlayerPrefs.SetInt("signedIn", 0);
						}
					});
			

		}
		else if((PlayerPrefs.GetInt("signedIn") == 1)){
			CloudSaveScript1.Instance.SaveState();
		}

	}

	public static void saveToCloud(){
		CloudSaveScript1.Instance.SaveState();
	}

	public static void paidAchievement(){
		Social.ReportProgress("CgkI7reDt5kcEAIQCQ", 100.0f, (bool success) => {
			// handle success or failure
		});
	}

// Check if actually signed in or if disconnected during play
	public void signInCheck(){

		PlayGamesPlatform.Activate();
		
		Social.localUser.Authenticate((bool success) => {
			if(!success){
				PlayerPrefs.SetInt("signedIn", 0);
			}
		});
	}


	// Update is called once per frame
	void Update () {

		if(PlayerPrefs.GetInt("firstTime") == 2){
				PlayerPrefs.SetInt("firstTime", 0);
				PlayerPrefs.SetInt("signedIn", 2);

	        	//GUI.DrawTexture(new Rect((float)(Screen.width*0.73896),(float)(Screen.height*0.01),(float)(Screen.width*0.24104),(float)(Screen.width*0.1)),signedInTexture);
        							// recommended for debugging:
					PlayGamesPlatform.DebugLogEnabled = true;
					
					// Activate the Google Play Games platform
					PlayGamesPlatform.Activate();

					Social.localUser.Authenticate((bool success) => {
						// handle success or failure
						if(success){
							PlayerPrefs.SetInt("signedIn", 1);
							signedInSession = true;
						// register an invitation delegate

							InvitationManager.Instance.Setup();
				            
							CloudSaveScript1.Instance.LoadState();

							
						}
						else{
							PlayerPrefs.SetInt("signedIn", 0);
						}
					});
			

		}

		//Handle Disconnects
		if(PlayerPrefs.GetInt("Disconnect") == 1){
			PlayerPrefs.SetInt("Disconnect", 0);
			PlayerPrefs.SetInt("OnRoomSetupProgress", 0);
			PlayGamesPlatform.Instance.RealTime.LeaveRoom();
		}

		type = (PlayerPrefs.GetInt("type"));

		Invitation inv = InvitationManager.Instance.Invitation;
		if (inv != null) {



			if (InvitationManager.Instance.ShouldAutoAccept) {
				// jump straight into the game, since the user already indicated
				// they want to accept the invitation!
				//InvitationManager.Instance.Clear();
				//MultiplayerManager1.AcceptInvitation(inv.InvitationId);

						//Show Multiplayer Invite Screen
			if (PlayerPrefs.GetInt ("InviteAccepted") == 1) {
				MultiplayerManager1 sInstance = new MultiplayerManager1();
				PlayGamesPlatform.Instance.RealTime.AcceptInvitation(inv.InvitationId, sInstance);

			}





			//	gameObject.GetComponent<RaceGui>().MakeActive();
			} else { 
				// show the "incoming invitation" screen

				gameObject.GetComponent<IncomingInvitationGui>().MakeActive();

			}
		}
		
		
		//Reset Cloud
		if (PlayerPrefs.GetInt ("resetCloud") == 1) {
			CloudSaveScript1.Instance.SaveState();
			PlayerPrefs.SetInt ("resetCloud", 0);
		}



		//Quick Game

		if (PlayerPrefs.GetInt ("showQuickGame") == 1) {
			PlayerPrefs.SetInt ("showQuickGame",0);


			const int MinOpponents = 1, MaxOpponents = 1;
			const int GameVariant = 0;
			MultiplayerManager1 sInstance = new MultiplayerManager1();

			PlayGamesPlatform.Instance.RealTime.CreateQuickGame(MinOpponents, MaxOpponents,GameVariant, sInstance);

			quickGameSetup = true;
			//PlayGamesPlatform.Instance.RealTime.CreateQuickGame(MinOpponents, MaxOpponents,GameVariant, inv2.mpInstance);


		}
		//Show Multiplayer Invite Screen
		if (PlayerPrefs.GetInt ("showInviteScreen") == 1) {
			PlayerPrefs.SetInt ("showInviteScreen",0);
			const int MinOpponents = 1, MaxOpponents = 1;
			const int GameVariant = 0;
			MultiplayerManager1 sInstance = new MultiplayerManager1();
			PlayGamesPlatform.Instance.RealTime.CreateWithInvitationScreen(MinOpponents, MaxOpponents, GameVariant, sInstance);
			//PlayGamesPlatform.Instance.RealTime.CreateWithInvitationScreen(MinOpponents, MaxOpponents, GameVariant, inv2.mpInstance);
			//Social.ShowAchievementsUI();
		}



		if (PlayerPrefs.GetInt ("joinMultiplayer") == 1) {
			PlayerPrefs.SetInt ("joinMultiplayer", 0);
			MultiplayerManager1 sInstance = new MultiplayerManager1();
			PlayGamesPlatform.Instance.RealTime.AcceptFromInbox(sInstance);
			//PlayGamesPlatform.Instance.RealTime.AcceptFromInbox(inv2.mpInstance);
		}

		//Show Achievements
		if (PlayerPrefs.GetInt ("showAchievements") == 1) {
			PlayerPrefs.SetInt ("showAchievements", 0);
			Social.ShowAchievementsUI();
		}

		if (PlayerPrefs.GetInt("signedIn") == 1) { //fucking annoying red errors all the time //<--- I'm not sure who wrote that/why it was writting - Krish

			//Unlocking Achievements
			if(PlayerPrefs.GetInt("unlockedLevel") == 2){

				Social.ReportProgress("CgkI7reDt5kcEAIQAg", 100.0f, (bool success) => {
					// handle success or failure
				});

			}

			//Unlocking Achievements
			if(PlayerPrefs.GetInt("unlockedLevel") == 21){

				Social.ReportProgress("CgkI7reDt5kcEAIQAw", 100.0f, (bool success) => {
					// handle success or failure
				});

			}

			if(PlayerPrefs.GetInt("unlockedLevel") == 41){

				Social.ReportProgress("CgkI7reDt5kcEAIQBA", 100.0f, (bool success) => {
					// handle success or failure
				});

			}

			if(PlayerPrefs.GetInt("redditor") == 1){
				Social.ReportProgress("CgkI7reDt5kcEAIQBw", 100.0f, (bool success) => {
				// handle success or failure
			});
			}

			if (PlayerPrefs.GetFloat ("contSliderValue") <= .02 && PlayerPrefs.GetFloat ("coolSliderValue") >= 9.98 && PlayerPrefs.GetInt ("scoreSliderValue") == 23) {

				Social.ReportProgress("CgkI7reDt5kcEAIQBw", 100.0f, (bool success) => {
					// handle success or failure
				});

			}


			signInCheck();
		}
	
	}
}
