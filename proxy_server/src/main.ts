import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
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
app.use(cors({ origin: "*" }));

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "rocketswap.exchange"); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Origin", "rswp.io"); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.use(
	"/docs",
	createProxyMiddleware({
		target: DOCS_URL,
		changeOrigin: true,
		pathRewrite: {
			[`^/docs`]: ""
		}
	})
);

app.use(
	"/website",
	createProxyMiddleware({
		target: WEBSITE_URL,
		changeOrigin: true,
		pathRewrite: {
			[`^/website`]: ""
		}
	})
);
const apiProxy = createProxyMiddleware({
	target: API_URL,
	// changeOrigin: true,
	pathRewrite: {
		[`^/cxn`]: ""
	},
	ws: true
});

app.use("/cxn");

app.use(
	"/",
	createProxyMiddleware({
		target: APP_URL,
		// changeOrigin: true,
		pathRewrite: {
			[`^/`]: ""
		}
	})
);

const server = app.listen(PORT, () => {
	console.log(`Starting Proxy on port : ${PORT}`);
});

server.on("upgrade", apiProxy.upgrade);
