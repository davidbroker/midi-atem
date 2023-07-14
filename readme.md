# MIDI Atem Bridge
A simple program that listens for MIDI signals and maps them to ATEM commands.

This code acts as a bridge between the MIDI library [jzz](https://github.com/jazz-soft/JZZ) and Atem control library [atem-connection](https://github.com/nrkno/sofie-atem-connection).

Starting point for this was version 2.2 of [midi-relay](https://github.com/josephdadams/midi-relay/) although I have heavily stripped it back and customised it for my needs.

Personally, I use this to listen to MIDI notes emited from FaithLife Proclaim to automate a live stream for on an ATEM Mini Pro. 

# How To Use

## MIDI Setup

* First, run the program
* This will give you a list of all MIDI Input Ports available. These could be phsyical devices connected to your computer or a virtual MIDI bus.
* On a Mac device the virtual MIDI bus will usually be called 'IAC Driver Bus 1'. See [here](https://support.apple.com/en-au/guide/audio-midi-setup/ams1013/mac) for more info. On Windows, additional software is required for a virtual bus.
* Take the port name and use that for configurion the trigger,.

## Configuring

The program is configured in the config.js file.
Multiple triggers can be defined for different devices, MIDI commands, notes and velocities by adding to the triggers array.

Multiple triggers can also be defined on the same MIDI trigger point. The triggers will be executed in the order they are in the file, however the ATEM _may_ not process them in the same order. It is recommend to use define an ATEM macro and execute that by a MIDI trigger to guarantee the order. 

    // Example trigger configuration:
    {
      "midiPort": "IAC Driver Bus 1",
      "midiCmd": "noteon",
      "midiChannel": 0,
      "midiNote": 48,
      "midiVelocity": 100,
      "atemIp": "192.1.1.101",
      "atemCmd": "changeProgramInput",
      "atemCmdParameters": [1, 1]
    }

### Configuration Fields
| **Field**           | **Description**                     |
|---------------------|-------------------------------------|
| `midiPort`          | Name of the MIDI port (aka Device).|
| `midiCmd`           | The command that executes the trigger. Can be noteon or noteoff |
| `midiChannel`       | MIDI Channel to listen for. Can be * for any. |
| `midiNote`          | MIDI Note to listen for. Can be * for any. |
| `midiVelocity`      | MIDI Velocity to listen for. Can be * for any.|
| `atemIp`            | IP Address of the ATEM device|
| `atemCmd`           | Atem Command. See below for list of options. |
| `atemCmdParameters` | Array of parameters for the Atem Command. See below for parameters for the command |


### ATEM Commands

The commands map directly to a function in the [atem-connection](https://nrkno.github.io/sofie-atem-connection/classes/Atem.html) package.

I've implemented the ones I need. It is very easy to add more.

| **ATEM Command** | **Description** | **Parameters** |
|-|-|-|
| `startStreaming` | Start a streaming session | _None_ |
| `stopStreaming` | Stop an active streaming session | _None_ |
| `startRecording` | Start a recording session | _None_ |
| `stopRecording` | Stop an active recording session | _None_ |
| `changeProgramInput` | Change the source of the program input | 1: number: Input Number<br/>2: number: Mix Effect Number (optional) |
| `changePreviewInput` | Change the source of the preview input | 1: number: Input Number<br/>2: number: Mix Effect Number (optional) |
| `cut` | Cut the preview to the program | 1: number: Mix Effect Number (optional) |
| `autoTransition` | Transition the preview to a program. | 1: number: Mix Effect Number (optional) |
| `fadeToBlack` | Fade the prorgam to black | 1: number: Mix Effect Number (optional) |
| `macroRun` | Run a pre-recorded ATEM macro | 1: number: Macro Number |

## Running

### RUNNING THIS SOFTWARE FROM BINARY:
1. Download a binary release from <https://github.com/davidbroker/midi-atem/releases> for your OS.
1. Open a terminal window and change directory to the folder where you placed the binary release.
1. Run the executable from this folder.

### RUNNING DIRECTLY WITHIN NODE:
1. Install `node` if not already installed. <https://nodejs.org/en/download/>
1. Download the midi-relay source code.
1. Open a terminal window and change directory to the folder where you placed the source code.
1. Type `node index.js` within the this folder.

### RUNNING AS A SERVICE:
1. Open a terminal window and change directory to the folder where you placed the source code.
1. Install the Node.js library, `pm2`, by typing `npm install -g pm2`. This will install it globally on your system.
1. After `pm2` is installed, type `pm2 start index.js --name midi-atem` to daemonize it as a service.
1. If you would like it to start automatically upon bootup, type `pm2 startup` and follow the instructions on-screen.
1. To view the console output while running the software with `pm2`, type `pm2 logs midi-atem`.

Upon startup, the program will enumerate through the available MIDI input and output ports. It will also process the stored output triggers into memory and open any MIDI ports mentioned and start listening to them for incoming MIDI messages.
