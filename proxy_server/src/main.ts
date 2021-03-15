import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

// Create Express Server
const app = express();

// Configuration
const PORT = 3000;
const HOST = "localhost";
const API_SERVICE_URL = "https://jsonplaceholder.typicode.com";

console.log("hello wurld");
app.use(morgan("dev"));


// Authorization
// app.use("", (req, res, next) => {
// 	if (req.headers.authorization) {
// 		next();
// 	} else {
// 		res.sendStatus(403);
// 	}
// });

// Proxy endpoints
app.use(
	"/json_placeholder",
	createProxyMiddleware({
		target: API_SERVICE_URL,
		changeOrigin: true,
		pathRewrite: {
			[`^/json_placeholder`]: ""
		}
	})
);

// Start the Proxy
app.listen(PORT, HOST, () => {
    console.log(`Starting Proxy at ${HOST}:${PORT}`);
 });
 
