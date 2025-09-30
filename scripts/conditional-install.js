#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");

// Get NODE_ENV, fallback to EXPO_PUBLIC_NODE_ENV if needed
const nodeEnv = process.env.EXPO_PUBLIC_NODE_ENV || "dev";

console.log(`🔧 Running conditional install for environment: ${nodeEnv}`);

// Define environment-specific packages
const environmentPackages = {
  prod: ["@expo/ngrok@^4.1.3"],
  dev: [
    // Add any dev-only packages here if needed
  ],
};

// Get packages for current environment
const packagesToInstall = environmentPackages[nodeEnv] || [];

if (packagesToInstall.length === 0) {
  console.log(
    `✅ No conditional packages to install for ${nodeEnv} environment`
  );
  process.exit(0);
}

console.log(
  `📦 Installing packages for ${nodeEnv} environment:`,
  packagesToInstall
);

try {
  // Install packages for current environment
  for (const pkg of packagesToInstall) {
    console.log(`   Installing ${pkg}...`);
    execSync(`npm install ${pkg}`, {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });
  }

  console.log(`✅ Successfully installed all ${nodeEnv} packages`);
} catch (error) {
  console.error(`❌ Failed to install packages for ${nodeEnv}:`, error.message);

  // Don't fail the build in development if production packages fail
  if (nodeEnv !== "prod") {
    console.log("⚠️  Continuing anyway since this is not production...");
    process.exit(0);
  }

  process.exit(1);
}
