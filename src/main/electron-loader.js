// src/main/electron-loader.js - ESM LOADER
import { pathToFileURL } from 'url';

// Dynamically import the main ES module
const mainPath = './main.js';
const mainUrl = pathToFileURL(mainPath).href;

import(mainUrl).catch(console.error);