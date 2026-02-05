#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const cmakeFile = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-screens',
  'android',
  'CMakeLists.txt'
);

if (fs.existsSync(cmakeFile)) {
  let content = fs.readFileSync(cmakeFile, 'utf-8');
  
  if (content.includes('-Werror') && !content.includes('-Wno-error=deprecated-declarations')) {
    content = content.replace(
      /-Werror/g,
      '-Werror -Wno-error=deprecated-declarations'
    );
    fs.writeFileSync(cmakeFile, content);
    console.log('Patched react-native-screens CMakeLists.txt to allow deprecation warnings');
  } else if (!content.includes('-Werror')) {
    console.log('No -Werror flag found in react-native-screens CMakeLists.txt');
  } else {
    console.log('react-native-screens CMakeLists.txt already patched');
  }
} else {
  console.log('react-native-screens CMakeLists.txt not found at:', cmakeFile);
}
