const fs = require("fs");
const path = require("path");

// Function to copy files
function copyFile(src, dest) {
	fs.copyFileSync(src, dest);
	console.log(`Copied ${src} to ${dest}`);
}

// Function to search and copy README.md files
function searchAndCopy(baseDir, destDir, excludedDirs) {
	const subDirs = fs
		.readdirSync(baseDir, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name)
		.filter((name) => !excludedDirs.includes(name));

	for (let subDir of subDirs) {
		const readmePath = path.join(baseDir, subDir, "README.md");
		if (fs.existsSync(readmePath)) {
			const destFilePath = path.join(destDir, `${subDir}.md`);
			copyFile(readmePath, destFilePath);
		}
	}
}

// Define the directories and excluded folders
const baseDir = path.resolve(__dirname, "../../packages");
const destDir = path.resolve(__dirname, "../src/packages");
const excludedDirs = ["ui5-app"];

// Execute the function
searchAndCopy(baseDir, destDir, excludedDirs);
