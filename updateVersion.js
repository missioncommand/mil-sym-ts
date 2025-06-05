const fs = require("fs");

const version = process.argv[2];
if (!version) {
  console.error("Usage: node updateVersion.js [version]");
  process.exit(1);
}

// Define multiple package files
const packageFiles = ["package.web.json", "package.node.json", "package.packNode.json", "package.packWeb.json"];

packageFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    let packageData = JSON.parse(fs.readFileSync(file, "utf8"));
    packageData.version = version;
    fs.writeFileSync(file, JSON.stringify(packageData, null, 2));
    console.log(`Updated ${file} to version ${version}`);
  } else {
    console.warn(`Skipping: ${file} not found.`);
  }
});
