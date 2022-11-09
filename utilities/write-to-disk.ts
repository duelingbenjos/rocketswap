const Fs = require("fs");

function writeToFile(data: any, path: any) {
	const json = JSON.stringify(data, null, 2);

	Fs.writeFile(path, json, (err: any) => {
		if (err) {
			console.error(err);
			throw err;
		}

		console.log("Saved data to file.");
	});
}

writeToFile({ hi: "hello" }, "./some-file.json");
