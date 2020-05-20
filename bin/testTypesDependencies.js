#!/usr/bin/env node

/*
 * Wire
 * Copyright (C) 2020 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

const globby = require('globby')
const path = require('path')
const fs = require('fs')
const {execSync} = require('child_process');

console.info('Checking @types dependencies ...');

let output;

try {
  output = execSync('npx lerna changed --all --json', {stdio: 'pipe'});
} catch (error) {
  console.info('No local packages have changed since the last tagged releases.');
  process.exit(0);
}

const changedPackages = JSON.parse(output.toString());
const packageLocations = changedPackages.map(project => project.location);
let missingTypes = [];
let redundantTypes = [];

for (const packageLocation of packageLocations) {
  const packageJsonFile = path.join(packageLocation, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonFile, 'utf8'));
  const distDir = path.dirname(path.join(packageLocation, packageJson.main));

  const includedTypesDefinitions = Object.keys(packageJson.dependencies || {}).filter(dependency => dependency.startsWith('@types/'));
  const localReferencedTypes = [];
  const referencedTypesRegex = /<reference types="(?<name>[^"]+)" \/>/gm;

  const definitionFiles = globby.sync(`${distDir}/**/*.d.ts`);

  for (const fileName of definitionFiles) {
    const fileContent = fs.readFileSync(fileName, 'utf8');

    let matches = [];

    while(matches = referencedTypesRegex.exec(fileContent)) {
      const fullTypeName = `@types/${matches[1]}`;
      if (!localReferencedTypes.find(type => type.name === fullTypeName)) {
        localReferencedTypes.push({fileName, name: fullTypeName, packageJson: packageJsonFile});
      }
    }
  }

  const localMissingTypes = localReferencedTypes.filter(type => !includedTypesDefinitions.includes(type.name));
  const localRedundantTypes = includedTypesDefinitions.filter(type => !localReferencedTypes.find(referencedType => type === referencedType.name)).map(typeName => ({distDir, name: typeName, packageJson: packageJsonFile}));
  missingTypes = missingTypes.concat(localMissingTypes);
  redundantTypes = redundantTypes.concat(localRedundantTypes);
}

for (const redundantType of redundantTypes) {
  const relativeDistDir = path.relative('.', redundantType.distDir);
  const relativePackageJson = path.relative('.', redundantType.packageJson);
  console.warn(`⚠️ "${redundantType.name}" is included in "${relativePackageJson}", but not referenced in any of the definition files in "${relativeDistDir}".`);
}

if (missingTypes.length > 0) {
  for (const missingType of missingTypes) {
    const relativeFilename = path.relative('.', missingType.fileName);
    const relativePackageJson = path.relative('.', missingType.packageJson);
    console.error(`❌ "${missingType.name}" is referenced in "${relativeFilename}", but not included in "${relativePackageJson}".`);
  }
  process.exit(1);
}
