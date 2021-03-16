import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

// Create Express Server
const app = express();

// Configuration
const PORT = 80;
const HOST = "localhost";
const DOCS_URL = "http://127.0.0.1:82"


// Environment

app.use(morgan("dev"));

// Proxy endpoints
app.use(
	"/",
	createProxyMiddleware({
		target: DOCS_URL,
		changeOrigin: true,
		pathRewrite: {
			[`^/`]: ""
		}
	})
);

// Start the Proxy
app.listen(PORT, HOST, () => {
    console.log(`Starting Proxy at ${HOST}:${PORT}`);
 });
 
