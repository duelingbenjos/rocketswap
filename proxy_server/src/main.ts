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
app.use(cors());

function createProxyRoute(prefix, target) {
	return httpProxy(target, {
		proxyReqPathResolver: (req) => {
			let req_path = require("url").parse(req.url).path;
			return (prefix + req_path).replace(/\/\//g, "/");
		}
	});
}

app.use(
	"/cxn",
	createProxyMiddleware({
		target: API_URL,
		changeOrigin: true,
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
