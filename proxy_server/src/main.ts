import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

// Create Express Server
const app = express();

// Configuration
const PORT = 80;
const WEBSITE_URL = "http://0.0.0.0:82"
const APP_URL = "http://0.0.0.0:5000"
const DOCS_URL = "http://0.0.0.0:3000"

app.use(morgan("dev"));

// Proxy endpoints
// app.use(
// 	"/website",
// 	createProxyMiddleware({
// 		target: WEBSITE_URL,
// 		changeOrigin: true,
// 		pathRewrite: {
// 			[`^/website`]: ""
// 		}
// 	})
// );

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
app.listen(PORT, () => {
    console.log(`Starting Proxy on port : ${PORT}`);
 });
 
