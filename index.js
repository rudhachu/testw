const fs = require("fs").promises;
const fsx = require("fs");
const path = require("path");
const config = require("./config");
const { MakeSession } = require("./lib/session");
const connect = require("./lib/connection");
const { getandRequirePlugins } = require("./lib/db/plugins");
const { UpdateLocal, overrideConsoleLogs } = require("./lib");

global.__basedir = __dirname;

// Override console methods in the worker process
process.on("message", (data) => {
  if (data.type === "overrideLogs") {
    overrideConsoleLogs();
  }
});

// Auth function to generate session credentials and initialize the bot
async function auth() {
  try {
    if (!fsx.existsSync("./lib/session/creds.json")) {
      await MakeSession(config.SESSION_ID, "./lib/session");
      console.log("Version : " + require("./package.json").version);
    }
    console.log("WhatsApp Bot Initializing...");
    return initialize();
  } catch (error) {
    console.error("AuthFile Generation Error:", error);
    process.exit(1);
  }
}

// Reads and requires all `.js` files in a directory
const readAndRequireFiles = async (directory) => {
  try {
    const files = await fs.readdir(directory);
    return Promise.all(
      files
        .filter((file) => path.extname(file).toLowerCase() === ".js")
        .map((file) => require(path.join(directory, file)))
    );
  } catch (error) {
    console.error("Error reading and requiring files:", error);
    throw error;
  }
};

// Main initialization function
async function initialize() {
  console.log("============> ッ <============");
  try {
    // Load database-related files
    await readAndRequireFiles(path.join(__dirname, "/lib/db/"));
    console.log("Syncing Database");
    await config.DATABASE.sync();

    // Install plugins
    console.log("⬇  Installing Plugins...");
    await readAndRequireFiles(path.join(__dirname, "/plugins/"));
    await getandRequirePlugins();
    console.log("✅ Plugins Installed!");

    // Connect to services
    return await connect();
  } catch (error) {
    console.error("Initialization error:", error);
    process.exit(1); // Exit with error status
  }
}

// Start the authentication process
auth();
