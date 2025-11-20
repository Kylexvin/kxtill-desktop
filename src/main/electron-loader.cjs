// src/main/electron-loader.cjs
const Module = require('module');
const path = require('path');

// Load the main ES module using Module._load
const mainPath = path.resolve(__dirname, 'main.js');
Module._load(mainPath, null, true);