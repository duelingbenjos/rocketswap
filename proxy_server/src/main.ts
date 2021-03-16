import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

// Create Express Server
const app = express();

// Configuration
const PORT = 8080;
const HOST = "localhost";
const DOCS_URL = "rocketswap-docs:81"


// Environment

app.use(morgan("dev"));

// Proxy endpoints
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

// Start the Proxy
app.listen(PORT, HOST, () => {
    console.log(`Starting Proxy at ${HOST}:${PORT}`);
 });
 
