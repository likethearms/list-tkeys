#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const translationKeys = new Set();

function findTranslationKeys(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findTranslationKeys(filePath);
    } else if (
      stat.isFile() &&
      /\.(js|jsx|ts|tsx)$/.test(filePath) &&
      !/node_modules/.test(filePath) &&
      !/.next/.test(filePath) &&
      !/.git/.test(filePath) &&
      !/\.json$/.test(filePath)
    ) {
      const content = fs.readFileSync(filePath, "utf8");
      const regex = /(?<=t\(['"`])(.*?)(?=['"`])/g;
      let match;

      while ((match = regex.exec(content)) !== null) {
        const key = match[0];
        const namespaceRegex = /(?<=useTranslation\(['"`])(.*?)(?=['"`])/g;
        let namespaceMatch;

        if (!/:/.test(key)) {
          while ((namespaceMatch = namespaceRegex.exec(content)) !== null) {
            const namespace = namespaceMatch[0];
            translationKeys.add(`${namespace}:${key}`);
          }
        } else {
          translationKeys.add(key);
        }
      }
    }
  }
}

findTranslationKeys(process.cwd());

const outputFilePath = path.join(process.cwd(), "translation-keys.txt");
fs.writeFileSync(outputFilePath, Array.from(translationKeys).sort().join("\n"));
