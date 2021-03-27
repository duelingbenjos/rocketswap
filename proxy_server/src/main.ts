import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import https from "https";
import http from "http";
import fs from "fs";

// Create Express Server
const app = express();

// Configuration
const DOWN_URL = "http://0.0.0.0:82";
const APP_URL = "http://0.0.0.0:5000";
const DOCS_URL = "http://0.0.0.0:3000";
const API_URL = "http://0.0.0.0:2053";

app.use(morgan("dev"));
app.use(cors({ origin: "*" }));

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "rocketswap.exchange"); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Origin", "rswp.io"); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.use(
	"/docs#",
	createProxyMiddleware({
		target: DOCS_URL,
		changeOrigin: false,
		pathRewrite: {
			[`^/docs`]: ""
		}
	})
);

app.use(
	"/docs",
	createProxyMiddleware({
		target: DOCS_URL,
		changeOrigin: false,
		pathRewrite: {
			[`^/docs`]: ""
		}
	})
);

app.use(
	"/down",
	createProxyMiddleware({
		target: DOWN_URL,
		changeOrigin: true,
		pathRewrite: {
			[`^/down`]: ""
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

const httpServer = http.createServer(app);
const httpsServer = https.createServer(
	{
		key: fs.readFileSync("src/certs/key.pem"),
		cert: fs.readFileSync("src/certs/pub.pem")
	},
	app
);

httpServer.listen(80, () => {
	console.log(`Starting HTTP Proxy on port : ${80}`);
});

httpsServer.listen(443, () => {
	console.log(`Starting HTTPS Proxy on port : ${443}`);
});
