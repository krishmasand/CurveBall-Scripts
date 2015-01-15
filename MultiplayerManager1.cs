using UnityEngine;
using System.Collections;
using GooglePlayGames;
using GooglePlayGames.BasicApi.Multiplayer;
using System.Collections.Generic;
using System;

public class MultiplayerManager1 : RealTimeMultiplayerListener {
	const string RaceTrackName = "RaceTrack";
	string[] PlayerNames = new string[] { "Blue", "Red" };
	const int QuickGameOpponents = 1;
	const int GameVariant = 0;
	static MultiplayerManager1 sInstance = null;
	const int MinOpponents = 1;
	const int MaxOpponents = 1;
	public int type;

	
	// points required to finish race. Must be < 255 because it has to fit in a byte
	const int PointsToEnd = 5;
	
	public enum GameState { SettingUp, Playing, Finished, SetupFailed, Aborted };
	private GameState mGameState = GameState.SettingUp;
	
	// how many points each of our fellow racers has
	private Dictionary<string,int> mRacerScore = new Dictionary<string,int>();
	
	// whether or not we received the final score for each participant id
	private HashSet<string> mGotFinalScore = new HashSet<string>();
	
	// my participant ID
	private string mMyParticipantId = "";
	
	// my rank (1st, 2nd, 3rd, 4th, or 0 to mean 'no rank yet')
	// This is updated every time we get a finish notification from a peer
	private int mFinishRank = 0;
	
	// room setup progress
	private float mRoomSetupProgress = 0.0f;
	
	// speed of the "fake progress" (to keep the player happy)
	// during room setup
	const float FakeProgressSpeed = 1.0f;
	const float MaxFakeProgress = 30.0f;
	float mRoomSetupStartTime = 0.0f;
	
	public MultiplayerManager1() {
		//mRoomSetupStartTime = Time.time;
	}
	
	public static void CreateQuickGame() {
		sInstance = new MultiplayerManager1();
		PlayGamesPlatform.Instance.RealTime.CreateQuickGame(QuickGameOpponents, QuickGameOpponents,
		                                                    GameVariant, sInstance);
	}
	
	public static void CreateWithInvitationScreen() {
		sInstance = new MultiplayerManager1();
		PlayGamesPlatform.Instance.RealTime.CreateWithInvitationScreen(MinOpponents, MaxOpponents,
		                                                               GameVariant, sInstance);
		sInstance.type = 0;
		MainBallTransmitter.setType(sInstance.type);
	}
	
	public static void AcceptFromInbox() {
		sInstance = new MultiplayerManager1();
		PlayGamesPlatform.Instance.RealTime.AcceptFromInbox(sInstance);
		sInstance.type = 1;
		MainBallTransmitter.setType(sInstance.type);
	}
	
	public static void AcceptInvitation(string invitationId) {
		sInstance = new MultiplayerManager1();
		PlayGamesPlatform.Instance.RealTime.AcceptInvitation(invitationId, sInstance);
		sInstance.type = 1;
		MainBallTransmitter.setType(sInstance.type);
	}
	
	public GameState State {
		get {
			return mGameState;
		}
	}
	
	public static MultiplayerManager1 Instance {
		get {
			return sInstance;
		}
	}
	
	public int FinishRank {
		get {
			return mFinishRank;
		}
	}
	
	public float RoomSetupProgress {
		get {
			float fakeProgress = (Time.time - mRoomSetupStartTime) * FakeProgressSpeed;
			if (fakeProgress > MaxFakeProgress) {
				fakeProgress = MaxFakeProgress;
			}
			float progress = mRoomSetupProgress + fakeProgress;
			return progress < 99.0f ? progress : 99.0f;
		}
	}
	
	private void SetupTrack() {
		//BehaviorUtils.MakeVisible(GameObject.Find(RaceTrackName), true);
		Debug.Log ("About to get self");
		Participant self = GetSelf();
		Debug.Log ("Self is " + self);
		Debug.Log ("About to get a list of connected participants");
		List<Participant> players = GetPlayers();
		Debug.Log ("Players is  " + players + " with count of " + players.Count);
		int i;
		for (i = 0; i < PlayerNames.Length; i++) {
			Debug.Log("Looking at i value of " + i);
		//	GameObject car = GameObject.Find(PlayerNames[i]);
			Debug.Log ("Looking for car name " + PlayerNames[i]);
			Participant player = i < players.Count ? players[i] : null;
			Debug.Log ("Player is " + player);
			
			bool isSelf = player != null && player.ParticipantId.Equals(self.ParticipantId);
			if (player != null) {
				Debug.Log("Racer is not null!");
				//BehaviorUtils.MakeVisible(car, true);
			//	CarController controller = car.GetComponent<CarController>();
			//	controller.SetParticipantId(racer.ParticipantId);
			//	controller.SetBlinking(isSelf);
			} else {
				Debug.Log("Hiding racer");
			//	BehaviorUtils.MakeVisible(car, false);
			}
		}
	}
	
/*	private void TearDownTrack() {
		BehaviorUtils.MakeVisible(GameObject.Find(RaceTrackName), false);
		foreach (string name in CarNames) {
			GameObject car = GameObject.Find(name);
			car.GetComponent<CarController>().Reset();
			BehaviorUtils.MakeVisible(car, false);
		}
	} */
	
	public void OnRoomConnected(bool success) {
		PlayerPrefs.SetInt("OnRoomSetupProgress", 0);

		if (success) {
			if(GooglePlayManager1.quickGameSetup){
				GooglePlayManager1.quickGameSetup = false;
				PlayerPrefs.SetInt("type", MainBallTransmitter.getIndexPosition());
			}
			Application.LoadLevel(MainMenuScript.PvPOnlineScene);
			mGameState = GameState.Playing;
			mMyParticipantId = GetSelf().ParticipantId;
			SetupTrack();
		} else {
			if(GooglePlayManager1.quickGameSetup){
				GooglePlayManager1.quickGameSetup = false;
			}
			Application.LoadLevel(MainMenuScript.MainMenuScene);
			PlayerPrefs.SetInt("Disconnect", 1);
		}
	}
	
	public void OnLeftRoom() {
		Application.LoadLevel(MainMenuScript.MainMenuScene);
		PlayerPrefs.SetInt("Disconnect", 1);
		GooglePlayManager1.type = 0;
		if (mGameState != GameState.Finished) {
			mGameState = GameState.Aborted;
		}
		
	}
	
	public void OnPeersConnected(string[] peers) {
	}
	
	public void OnPeersDisconnected(string[] peers) {

		Application.LoadLevel(MainMenuScript.MainMenuScene);
		PlayerPrefs.SetInt("Disconnect", 1);
		foreach (string peer in peers) {
			// if this peer has left and hasn't finished the race,
			// consider them to have abandoned the race (0 score!)
			mGotFinalScore.Add(peer);
			mRacerScore[peer] = 0;
	//		RemoveCarFor(peer);
		}
		
		// if, as a result, we are the only player in the race, it's over
		List<Participant> racers = GetPlayers();
		if (mGameState == GameState.Playing && (racers == null || racers.Count < 2)) {
			mGameState = GameState.Aborted;
		}
	}
	
/*	private void RemoveCarFor(string participantId) {
		foreach (string name in CarNames) {
			GameObject obj = GameObject.Find(name);
			CarController cc = obj.GetComponent<CarController>();
			if (participantId.Equals(cc.ParticipantId)) {
				BehaviorUtils.MakeVisible(obj, false);
			}
		}
	} */
	
	public void OnRoomSetupProgress(float percent) {
		mRoomSetupProgress = percent;
		PlayerPrefs.SetInt("OnRoomSetupProgress", 1);



	}
	
	public void OnRealTimeMessageReceived(bool isReliable, string senderId, byte[] data) {
		MainBallTransmitter.receiveByteArray = data;
	}
	
	public void CleanUp() {
		PlayGamesPlatform.Instance.RealTime.LeaveRoom();
	//	TearDownTrack();
		mGameState = GameState.Aborted;
		sInstance = null;
	}
	
	public float GetRacerProgress(string participantId) {
		return GetRacerPosition(participantId) / (float)PointsToEnd;
	}
	
	public int GetRacerPosition(string participantId) {
		if (mRacerScore.ContainsKey(participantId)) {
			return mRacerScore[participantId];
		} else {
			return 0;
		}
	}
	
	private Participant GetSelf() {
		return PlayGamesPlatform.Instance.RealTime.GetSelf();
	}
	
	private List<Participant> GetPlayers() {
		return PlayGamesPlatform.Instance.RealTime.GetConnectedParticipants();
	}
	
	private Participant GetParticipant(string participantId) {
		return PlayGamesPlatform.Instance.RealTime.GetParticipant(participantId);
	}
	
	public void UpdateSelf(float deltaT, int pointsToAdd) {
		int pos = GetRacerPosition(mMyParticipantId);
		
		if (pos >= PointsToEnd) {
			// already finished
			return;
		}
		
		pos += pointsToAdd;
		pos = pos < 0 ? 0 : pos >= PointsToEnd ? PointsToEnd : pos;
		mRacerScore[mMyParticipantId] = pos;
		
		if (pos >= PointsToEnd) {
			// we finished the race!
			FinishRace();
		} else if (pointsToAdd > 0) {
			// broadcast position update to peers
			BroadCastPosition(pos);
		}
	}
	
	byte[] mPosPacket = new byte[2];
	private void BroadCastPosition(int pos) {
		mPosPacket[0] = (byte)'I'; // interim update
		mPosPacket[1] = (byte)pos;
		PlayGamesPlatform.Instance.RealTime.SendMessageToAll(false, mPosPacket);
	}
	
	byte[] mFinalPacket = new byte[2];
	private void FinishRace() {
		mGotFinalScore.Add(mMyParticipantId);
		mGameState = GameState.Finished;
		UpdateMyRank();
		
		// send final score packet to peers
		mFinalPacket[0] = (byte)'F'; // final update
		mFinalPacket[1] = (byte)mRacerScore[mMyParticipantId];
		PlayGamesPlatform.Instance.RealTime.SendMessageToAll(true, mFinalPacket);
	}
	
	private void UpdateMyRank() {
		int numRacers = GetPlayers().Count;
		if (mGotFinalScore.Count < numRacers) {
			mFinishRank = 0; // undefined for now
		}
		int myScore = mRacerScore[mMyParticipantId];
		int rank = 1;
		foreach (string participantId in mRacerScore.Keys) {
			if (mRacerScore[participantId] > myScore) {
				++rank;
			}
		}
		mFinishRank = rank;
	}
}
