var midiHandler = require('jzz');

const { Atem } = require('atem-connection')
const config = require('./config.js');
const MIDI_MSG_TYPES = ['noteon', 'noteoff'];
const ATEM_CMD_TYPES = ['startStreaming', 'stopStreaming', 'startRecording', 'stopRecording', 'changeProgramInput', 'changePreviewInput', 'cut', 'autoTransition', 'fadeToBlack', 'macroRun'];

const myAtem = new Atem();
myAtem.on('info', console.log);
myAtem.on('error', console.error);

var TRIGGERS = [];
var MIDI_inputs = [];

/*
Load MIDI Ports and listen for MIDI notes
*/
function loadMidiPorts() {
	midiHandler.requestMIDIAccess().then(function(webmidi) {
		
		console.info('MIDI Input Ports:');
		webmidi.inputs.forEach(function(port) { console.info(" * " + port.name); });
		let info = midiHandler.info();

		//retain the 'opened' property when reloading the array
		let temp_inputs = info.inputs;
		for (let i = 0; i < temp_inputs.length; i++) {
			let port = MIDI_inputs.find( ({ name }) => name === temp_inputs[i].name);
			if (port) {
				if (port.opened) {
					temp_inputs[i].opened = port.opened;
				}
			}
		}
		
		MIDI_inputs = temp_inputs;
		
		TRIGGERS = config.triggers;

		for (let i = 0; i < TRIGGERS.length; i++) {
			let port = MIDI_inputs.find( ({ name }) => name === TRIGGERS[i].midiPort);
			if (port) {
				if (!port.opened) {
					console.debug('Attempting to open MIDI port used in a Trigger: ' + TRIGGERS[i].midiPort);

					midiHandler().openMidiIn(TRIGGERS[i].midiPort)
					.or(function () {
						console.log('Cannot open port.');
					})
					.and(function() {
						for (let j = 0; j < MIDI_inputs.length; j++) {
							if (MIDI_inputs[j].name === this.name()) {
								MIDI_inputs[j].opened = true;
								break;
							}
						}
						console.info('Port opened successfully: ' + TRIGGERS[i].midiPort);
						this.connect(receiveMidi.bind({'midiport': TRIGGERS[i].midiPort}));
					});
				}
			} else {
				console.error('MIDI Port used in Trigger not found: ' + TRIGGERS[i].midiPort);
			}
		}
		
	}, function(err) {
		if (err) {
			console.error(err);
			throw new Error(err);
		}
	});
}

/*
Receive a individual MIDI note
*/
function receiveMidi(midiArg) {
	let midiObj = {};
	
	let statusBytes = [
		{byte: '8', type: 'noteoff'},
		{byte: '9', type: 'noteon'},
	]
	
	let midiType = midiArg[0].toString(16).substring(0,1).toUpperCase();
	let statusByte = statusBytes.find( ({ byte }) => byte === midiType);
	if (statusByte) {
		let midiCmd = statusByte.type;
		midiObj.midiCmd = midiCmd;
	}
	
	midiObj.midiPort = this.midiPort;
	
	switch(midiObj.midiCmd) {
		case 'noteon':
		case 'noteoff':
			midiObj.channel = midiArg.getChannel();
			midiObj.note = midiArg.getNote();
			midiObj.velocity = midiArg.getVelocity();
			break;
		default:
			midiObj.midiCmd = 'unsupported';
			break;
	}
	
	midiObj.rawmessage = '';
	for (let i = 0; i < midiArg.length; i++) {
		midiObj.rawmessage += midiArg[i];
		if (i < (midiArg.length-1)) {
			midiObj.rawmessage += ',';
		}
	}
	
	if (MIDI_MSG_TYPES.includes(midiObj.midiCmd)) {
		let port = MIDI_inputs.find( ({ name }) => name === midiObj.midiport);
	
		if (port.opened) {
			// console.log(midiObj);
			for (let i = 0; i < TRIGGERS.length; i++) {
				if ((TRIGGERS[i].midiport === midiObj.midiport) && (TRIGGERS[i].midiCmd === midiObj.midiCmd)) {
					switch(TRIGGERS[i].midiCmd) {
						case 'noteon':
						case 'noteoff':
							if ((parseInt(TRIGGERS[i].channel) === parseInt(midiObj.channel)) || (TRIGGERS[i].channel === '*')) {
								if (parseInt(TRIGGERS[i].note) === parseInt(midiObj.note)) {
									if ((parseInt(TRIGGERS[i].velocity) === parseInt(midiObj.velocity)) || (TRIGGERS[i].velocity === '*')) {
										setTimeout(runAtemCommand, 1, TRIGGERS[i]);
									}
								}
							}
							break;
					}
				}
			}
		} else {
			console.log('This MIDI port is currently closed: ' + midiObj.midiport);
		}
	}
}
/*
Run an individual ATEM Trigger
*/
function runAtemCommand(midiTrigger) {
	if (ATEM_CMD_TYPES.includes(midiTrigger.atemCmd)) {
		console.log('Running Atem Command: ' +midiTrigger.atemCmd);

		//myAtem.connect(midiTrigger.atemIp);

		//myAtem.on('connected', () => {
			// Handle ATEM Command
			
			minParams = 0;
			maxParams = 0;
			paramTypes = [];

			switch(midiTrigger.atemCmd) {
				case 'startStreaming':
				case 'stopStreaming':
				case 'startRecording':
				case 'stopRecording':
					maxParams = 0;
					break;
				case 'changeProgramInput':
				case 'changePreviewInput':
					minParams = 1;
					maxParams = 2;
					paramTypes = ['number', 'number'];
					break;
				case 'fadeToBlack':
				case 'autoTransition':
				case 'cut':
					minParams = 0;
					maxParams = 1;
					paramTypes = ['number'];
					break;
				case 'macroRun':
					minParams = 1;
					maxParams = 1;
					paramTypes = ['number'];
					break;
				default:
					console.error('Unsupported ATEM Command: ' +midiTrigger.atemCmd);
					return;
			}
			
			params = [];
			if(midiTrigger.atemCmdParams) {
				if(Array.isArray(midiTrigger.atemCmdParams)) {
					params = midiTrigger.atemCmdParams;
				} else {
					params.push(midiTrigger.atemCmdParams);
				}
			}

			// Validate the number of params
			if(minParams > 0) {
				if(paramTypes.length >= minParams
					&& params.length <= maxParams) {
``
						// Validate the data types of the params
						for (let i = 0; i < params.length; i++) {
							if(typeof params[i] !== paramTypes[i]) {
								console.error('atemCmdParams #'+(i+1)+' must be a '+paramTypes[i]+', but is a '+typeof params[i]+': '+params[i]+'.');
								return;
							}
						}
						myAtem[midiTrigger.atemCmd].apply(params);

				} else {
					if(minParams == maxParams) {
						console.error('Error: Expecting ' + minParams + ' atemCmdParams. Received '+ params.length+'. Update config.js.');
					} else {
						console.error('Error: Expecting between ' + minParams + ' and ' + maxParams +' atemCmdParams. Received '+ params.length+'. Update config.js.');
					}
				}
			} else if(params.length < 1) {
				myAtem[midiTrigger.atemCmd].apply();
			} else {
				console.log('Expecting 0 atemCmdParams. Received ' +params.length +'.');
			}


			myAtem.disconnect();
		//});

	} else {
		console.error('Error: Unsupported atemCmd: ' + midiTrigger.atemCmd);
		console.error('atemCmd must be one of: ' + ATEM_CMD_TYPES.join(', '));
	}
}

/*
Main Process:
*/
process.on('uncaughtException', function(err) {
	console.log('midi-atem-bridge Error occurred:');	
	console.log(err);
	process.exit(1);
});

console.info('midi-atem-bridge');

try {
	loadMidiPorts();
} catch (error) {
	console.error(error);
}
