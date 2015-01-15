using UnityEngine;
using System.Collections;
using GooglePlayGames;
using GooglePlayGames.BasicApi.Multiplayer;
using System.Collections.Generic;

public class InvitationManager {
	public MultiplayerManager1 mpInstance = new MultiplayerManager1();
	private static InvitationManager sInstance = new InvitationManager();
	public static InvitationManager Instance {
		get {
			return sInstance;
		}
	}
	
	private Invitation mInvitation = null;
	private bool mShouldAutoAccept = false;
	private bool mSetupDone = false;
	
	public void Setup() {
		if (!mSetupDone) {
			PlayGamesPlatform.Instance.RegisterInvitationDelegate(OnInvitationReceived);
			mSetupDone = true;

		}
	}
	
	public void OnInvitationReceived(Invitation inv, bool shouldAutoAccept) {
		mInvitation = inv;
		mShouldAutoAccept = shouldAutoAccept;
		//Application.LoadLevel(MainMenuScript.MainMenuScene);
		if(shouldAutoAccept){
			PlayerPrefs.SetInt("InviteAccepted", 1);
		}
	}
	
	public Invitation Invitation {
		get {
			return mInvitation;
		}
	}
	
	public bool ShouldAutoAccept {
		get {
			return mShouldAutoAccept;
		}
	}
	
	public void DeclineInvitation() {
		if (mInvitation != null) {
			PlayGamesPlatform.Instance.RealTime.DeclineInvitation(mInvitation.InvitationId);
		}
		Clear();
	}
	
	public void Clear() {
		mInvitation = null;
		mShouldAutoAccept = false;
	}
}