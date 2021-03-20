var clc = require('cli-color');

var conf = {
	filters : {
		// log : clc.white.bgBlue,
		trace : clc.magenta,
		debug : clc.cyan,
		info : clc.green,
		warn : clc.xterm(202).bgXterm(236),
		error : clc.red.bold
	},
	format: [
    '{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})', //default format
    {
      error:
        '{{timestamp}} <{{title}}> {{message}} ({{file}}:{{line}})\nCall Stack:\n{{stack}}' // error format
    }
  ],
  dateformat: 'HH:MM:ss',
  preprocess: function(data) {
    data.title = data.title.toUpperCase()
  },
	inspectOpts: {color: true}
};

export const log = require('tracer').colorConsole(conf)
