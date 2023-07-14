const config = {
  "triggers": [
    /* Example Trigger
    {
      "midiport": "IAC Driver Bus 1", // The MIDI Port/Bus name
      "midicommand": "noteon", // One of: 'noteon', 'noteoff'
      "channel": 0, // MIDI Channel: 0-15 (note channel 1 = 0)
      "note": 2, // MIDI Note: 0-127
      "velocity": 100, // Velocity: 0-127
      "atemIp": "192.1.1.101", // IP Addres of Atem device
      "atemCmd": "startStreaming", // See README for supported commands and parameters
      "atemCmdParams": [] // See README for supported commands and parameters
      },
     */
      {
        "midiport": "IAC Driver Bus 1",
        "midicommand": "noteon",
        "channel": 0,
        "note": 48,
        "velocity": 100,
        "atemIp": "192.1.1.101",
        "atemCmd": "changeProgramInput",
        "atemCmdParams": [1]
        
      },
    {
      "midiport": "IAC Driver Bus 1",
      "midicommand": "noteoff",
      "channel": 0,
      "note": 48,
      "velocity": 100,
      "atemIp": "192.1.1.101",
      "atemCmd": "startStreaming",
      
    },
    {
      "midiport": "Launchkey Mini MK3 MIDI Port",
      "midicommand": "noteon",
      "channel": 0,
      "note": 50,
      "velocity": '*',
      "atemIp": "192.1.1.101",
      "atemCmd": "macroRun",
      "atemCmdParameters": 2
    }
  ]
}

module.exports = config;
