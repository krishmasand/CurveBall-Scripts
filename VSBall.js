#pragma strict

class VSBall extends MainBall{
	var score:int[];
	@System.NonSerialized var endScore:int = -1; 
	@System.NonSerialized var flipSides:boolean = false;
	
	
	
	function setBallType() {
		ballType = "VS";
	}

	function VSInstantiateVariables() {
		// Instantiates some of the vs variables
		score = new int[opponents];
		if (endScore == -1) endScore = PlayerPrefs.GetInt("scoreSliderValue");
		for (var i:int = 0; i < controlTime.length; i++) {
			controlTime[i] = PlayerPrefs.GetFloat("contSliderValue");
			cooldownTime[i] = PlayerPrefs.GetFloat("coolSliderValue");
		}

	}

	function lateStart() {
		// Called at the end of the first ball restart 
		super();

		if (onlineEnabled && clientType == 0) {
			sendSPacket();
			if (PlayerPrefs.GetInt("LastMultiType") == 0) {// Quick game
				if (endScore == -1) endScore = 5;
				for (var i:int = 0; i < controlTime.length; i++) {
					controlTime[i] = 1.75;
					cooldownTime[i] = 4f;
				}
			}
		}

	}

	function instantiateVariables() {
		// Adds VSInstantiateVariables to instantiateVariables
		super();
		VSInstantiateVariables();
	}

	function addScore() {
		// Increments score if the host
		for (var ballSub:GameObject in allBallArray()) {
			if (!ballSub.GetComponent(BallSub).ballEnabled && !ballSub.GetComponent(BallSub).killCheck) {
				ballSub.GetComponent(BallSub).killCheck =  true;
				if (opponents == 2) {

					if (!(onlineEnabled && clientType == 1)) { // Makes client not update scores
						if (ballSub.GetComponent(BallSub).killPoint.y < bottomBound) {
							score[1]++;
						}
						else if (ballSub.GetComponent(BallSub).killPoint.y > topBound) {
							score[0]++;
						}


						if (onlineEnabled && clientType == 0) {
							sendPPacket();
						}
					}

				}
			}
		}
	}

	function sendSPacket() {
		// Sends the starting settings

		var bytes:byte[] = new byte[10];
		var i:int = 2;
		bytes[0] = System.Convert.ToByte("S"[0]);
		bytes[1] = endScore;
		i = byteArrayReplace(bytes, System.BitConverter.GetBytes(controlTime[0]), i);
		i = byteArrayReplace(bytes, System.BitConverter.GetBytes(cooldownTime[0]), i);
		repeatSendBytes(true, bytes);
	}

	function sendPPacket() {
		// Sends the points byte array
		var bytes:byte[] = new byte[3];
		var i:int = 1;
		bytes[0] = System.Convert.ToByte("P"[0]);
		bytes[1] = score[0];
		bytes[2] = score[1];
		repeatSendBytes(true, bytes);
	}


	function receiveBytes(bytes:byte[]) {
		// Adds on to the receiveBytes from MainBall with VS specific items
		super(bytes);
		if (bytes[0] == System.Convert.ToByte("P"[0])) { // Points
			score[1] = bytes[1];
			score[0] = bytes[2];
		}


		else if (bytes[0] == System.Convert.ToByte("S"[0])) { // Start
			var controlTimeTemp:float = System.BitConverter.ToSingle(bytes, 2);
			var cooldownTimeTemp:float = System.BitConverter.ToSingle(bytes, 6);
			endScore = bytes[1];
			for (var i:int = 0; i < players; i++) {
				controlTime[i] = controlTimeTemp;
				cooldownTime[i] = cooldownTimeTemp;
			}
		}
	}


	function Update() {
		addScore();
		super();
	}


}