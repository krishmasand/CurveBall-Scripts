
using UnityEngine;
using System.Collections;
using GooglePlayGames;
using GooglePlayGames.BasicApi.Multiplayer;
using System.Collections.Generic;
using System;



public class MainBallTransmitter : MonoBehaviour {

	public static byte[] receiveByteArray = new byte[20]; //Bytes that are received from Google
	public static byte[] sendByteArray = new byte[20]; //Bytes that are sent to Google
	public static int type = 0; // 0 is Host, 1 is Client



	
	// Use this for initialization
	public void Start () {
		// Sends a message to enable online in the ball
		gameObject.SendMessage("enableOnline");

	}


	public static int getIndexPosition() {
		// Returns the index position in the google play list of participants
		Participant myself = PlayGamesPlatform.Instance.RealTime.GetSelf();
		List<Participant> participants = PlayGamesPlatform.Instance.RealTime.GetConnectedParticipants();
		for (int i = 0; i < participants.Count; i++) {
			if (myself == participants[i]) return i;
		}
		return -1;
	}


	public void receiveData (byte[] data) {
		// Used in a message in MainBall
		sendByteArray = data;
	}


	public static void setType(int number) {
		// Sets the type 
		type = number;
	}

	public void sendUnreliableMessage (byte[] data) {
		// Sends an unreliable message through google
		sendGoogleMessage(false, data);
	}

	public void sendReliableMessage (byte[] data) {
		// Sends a reliable message through google
		sendGoogleMessage(true, data);
	}

	public void sendGoogleMessage(bool reliable, byte[] data) {
		// Sends a message through google with type based on the argument reliable
		PlayGamesPlatform.Instance.RealTime.SendMessageToAll(reliable, data);
	}	

	
	// Update is called once per frame
	public void Update () {
		if(PlayerPrefs.GetInt("Disconnect") == 1){
			PlayerPrefs.SetInt("Disconnect", 0);
			PlayGamesPlatform.Instance.RealTime.LeaveRoom();
		}
		gameObject.SendMessage("setClientType", PlayerPrefs.GetInt("type"));
		gameObject.SendMessage("getBytes");
		gameObject.SendMessage("receiveBytes", receiveByteArray);
		sendGoogleMessage(false, sendByteArray);
	}

}