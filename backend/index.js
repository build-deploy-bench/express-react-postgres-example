require("dotenv").config();
const env = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 3001;
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const errorHandler = require("./middleware/errorHandler");

const usersRoutes = require("./routes/users");
const userRoutes = require("./routes/user");
const articlesRoutes = require("./routes/articles");
const profilesRoutes = require("./routes/profiles");
const tagsRoutes = require("./routes/tags");

// The commit that bench/build.sh recorded at build time, or "unknown" without a build.
const BUILD_COMMIT = (() => {
  try {
    return fs.readFileSync(path.join(__dirname, ".build-commit"), "utf8").trim() || "unknown";
  } catch {
    return "unknown";
  }
})();

// The harness sets BENCH_RUN_ID before each deploy, and each deployment keeps the env it started with.
const RUN_ID = process.env.BENCH_RUN_ID || "unknown";

const app = express();
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === "production") {
  app.use(express.static("../frontend/dist"));
} else {
  app.get("/", (req, res) => res.json({ status: "API is running on /api" }));
}
// Independent of the database, so the benchmark probe can identify the deployment before any query works.
app.get("/version", (req, res) => res.json({ commit: BUILD_COMMIT, run: RUN_ID }));
app.use("/api/users", usersRoutes);
app.use("/api/user", userRoutes);
app.use("/api/articles", articlesRoutes);
app.use("/api/profiles", profilesRoutes);
app.use("/api/tags", tagsRoutes);
app.get("/*any", (req, res) =>
  res.status(404).json({ errors: { body: ["Not found"] } }),
);
app.use(errorHandler);

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log(`Connection with ${env} database has been established.`);
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`Server running on port ${PORT}`),
    );
  } catch (error) {
    console.error("Unable to initialize the database:", error);
    process.exitCode = 1;
    await sequelize.close();
  }
})();
