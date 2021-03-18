import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors"
// let httpProxy = require("express-http-proxy");
import httpProxy from "express-http-proxy";

// Create Express Server
const app = express();


// Configuration
const PORT = 80;
const WEBSITE_URL = "http://0.0.0.0:82";
const APP_URL = "http://0.0.0.0:5000";
const DOCS_URL = "http://0.0.0.0:3000";
const API_URL = "http://0.0.0.0:2053";

app.use(morgan("dev"));
app.use(cors({origin: '*'}));

app.use((req, res, next) => {
	// res.header('Access-Control-Allow-Origin', '*');
	res.header("Access-Control-Allow-Origin", "rocketswap.exchange"); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
  });

// app.use(function (req, res, next) {

//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', 'https://rocketswap.exchange');

//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', 'true');

//     // Pass to next layer of middleware
//     next();
// });


app.use(
	"/socket.io",
	createProxyMiddleware({
		target: API_URL,
		// changeOrigin: true,
		pathRewrite: {
			[`^/socket.io`]: ""
		}
	})
);

app.use(
	"/cxn",
	createProxyMiddleware({
		target: API_URL,
		// changeOrigin: true,
		pathRewrite: {
			[`^/cxn`]: ""
		}
	})
);

app.use(
	"/",
	createProxyMiddleware({
		target: APP_URL,
		changeOrigin: true,
		pathRewrite: {
			[`^/`]: ""
		}
	})
);

// app.use("/", createProxyRoute("/", APP_URL));

app.listen(PORT, () => {
	console.log(`Starting Proxy on port : ${PORT}`);
});
