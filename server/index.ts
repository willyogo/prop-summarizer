import express from "express";
import { router as summaryRouter } from "./routes/summary";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler caught:', err);
  res.status(500).json({
    error: 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API routes
app.use(express.json());
app.use("/api", summaryRouter);

// Development mode: Serve through Vite's dev server
if (process.env.NODE_ENV !== "production") {
  console.log("Running in development mode - API server on port", PORT);
} else {
  // Production mode: Serve static files and handle client-side routing
  const staticPath = path.resolve(__dirname, "../dist");
  app.use(express.static(staticPath));
  
  app.get("*", (req, res) => {
    if (req.url.startsWith("/api")) return;
    res.sendFile(path.join(staticPath, "index.html"));
  });
}

// Start the server and ensure it's ready before accepting connections
const server = app.listen(PORT, () => {
  console.log(`✨ Server is running and ready on port ${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});