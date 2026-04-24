#!/usr/bin/env node
// One-time codemod: inject factual fields into each uni block.
// Values sourced from confident training knowledge; spot-check with
// WebSearch happens outside this script where needed.

import fs from 'node:fs';
import path from 'node:path';

const FILE = path.resolve('src/data/universities.ts');

// Fields:
//   eu, sc (Schengen), fh (flight hours from FRA, rounded 0.5),
//   pop (city proper k), coast (km), mtn (km), temp (°C Jun-Aug N / Dec-Feb S)
// tier derived from pop.
const F = {
  // === Europe (EU/Schengen where applicable) ===
  'pompeu-fabra':        { eu:1, sc:1, fh:2.0, pop:1600,  coast:0,   mtn:0,    temp:28 },
  'bocconi':             { eu:1, sc:1, fh:1.5, pop:1400,  coast:100, mtn:40,   temp:29 },
  'luiss':               { eu:1, sc:1, fh:2.0, pop:2800,  coast:25,  mtn:50,   temp:32 },
  'nova-sbe':            { eu:1, sc:1, fh:3.0, pop:550,   coast:5,   mtn:200,  temp:28 },
  'copenhagen-bs':       { eu:1, sc:1, fh:1.5, pop:650,   coast:0,   mtn:850,  temp:22 },
  'sse-stockholm':       { eu:1, sc:1, fh:2.0, pop:980,   coast:0,   mtn:400,  temp:22 },
  'essec':               { eu:1, sc:1, fh:1.5, pop:65,    coast:180, mtn:500,  temp:25 },
  'st-gallen':           { eu:0, sc:1, fh:1.0, pop:80,    coast:400, mtn:5,    temp:21 },
  'wu-vienna':           { eu:1, sc:1, fh:1.0, pop:1950,  coast:300, mtn:70,   temp:27 },
  'trinity-dublin':      { eu:1, sc:0, fh:2.0, pop:590,   coast:0,   mtn:280,  temp:19 },
  'aston':               { eu:0, sc:0, fh:1.5, pop:1150,  coast:120, mtn:140,  temp:21 },
  'innsbruck':           { eu:1, sc:1, fh:1.0, pop:130,   coast:400, mtn:0,    temp:25 },
  'antwerpen':           { eu:1, sc:1, fh:1.0, pop:540,   coast:85,  mtn:350,  temp:23 },
  'uclouvain':           { eu:1, sc:1, fh:1.0, pop:30,    coast:130, mtn:300,  temp:22 },
  'hec-liege':           { eu:1, sc:1, fh:1.0, pop:200,   coast:150, mtn:200,  temp:23 },
  'ku-leuven':           { eu:1, sc:1, fh:1.0, pop:100,   coast:130, mtn:300,  temp:23 },
  'charles-prague':      { eu:1, sc:1, fh:1.0, pop:1300,  coast:500, mtn:100,  temp:25 },
  'aarhus':              { eu:1, sc:1, fh:1.5, pop:350,   coast:0,   mtn:900,  temp:21 },
  'aalto':               { eu:1, sc:1, fh:2.5, pop:660,   coast:0,   mtn:1100, temp:22 },
  'hanken':              { eu:1, sc:1, fh:2.5, pop:660,   coast:0,   mtn:1100, temp:22 },
  'edhec':               { eu:1, sc:1, fh:1.5, pop:240,   coast:75,  mtn:300,  temp:23 },
  'em-lyon':             { eu:1, sc:1, fh:1.5, pop:520,   coast:250, mtn:60,   temp:28 },
  'sciences-po':         { eu:1, sc:1, fh:1.5, pop:2150,  coast:170, mtn:400,  temp:25 },
  'ieseg':               { eu:1, sc:1, fh:1.5, pop:240,   coast:75,  mtn:300,  temp:23 },
  'frankfurt-school':    { eu:1, sc:1, fh:0.5, pop:770,   coast:400, mtn:40,   temp:25 },
  'fu-berlin':           { eu:1, sc:1, fh:1.0, pop:3700,  coast:150, mtn:250,  temp:24 },
  'lmu':                 { eu:1, sc:1, fh:0.5, pop:1490,  coast:600, mtn:50,   temp:24 },
  'mannheim':            { eu:1, sc:1, fh:0.5, pop:310,   coast:500, mtn:80,   temp:26 },
  'cologne':             { eu:1, sc:1, fh:0.5, pop:1080,  coast:260, mtn:50,   temp:24 },
  'corvinus':            { eu:1, sc:1, fh:1.5, pop:1700,  coast:400, mtn:100,  temp:28 },
  'cattolica':           { eu:1, sc:1, fh:1.5, pop:1400,  coast:100, mtn:40,   temp:29 },
  'bologna':             { eu:1, sc:1, fh:1.5, pop:390,   coast:70,  mtn:30,   temp:30 },
  'bi-norway':           { eu:0, sc:1, fh:2.0, pop:700,   coast:0,   mtn:150,  temp:21 },
  'nhh':                 { eu:0, sc:1, fh:2.0, pop:290,   coast:0,   mtn:30,   temp:18 },
  'catolica-lisbon':     { eu:1, sc:1, fh:3.0, pop:550,   coast:5,   mtn:200,  temp:28 },
  'catolica-porto':      { eu:1, sc:1, fh:3.0, pop:230,   coast:5,   mtn:120,  temp:24 },
  'ie-madrid':           { eu:1, sc:1, fh:2.5, pop:3280,  coast:350, mtn:60,   temp:32 },
  'carlos-iii':          { eu:1, sc:1, fh:2.5, pop:3280,  coast:350, mtn:60,   temp:32 },
  'autonoma-barcelona':  { eu:1, sc:1, fh:2.0, pop:1600,  coast:20,  mtn:10,   temp:28 },
  'lund':                { eu:1, sc:1, fh:1.5, pop:95,    coast:15,  mtn:900,  temp:22 },
  'uppsala':             { eu:1, sc:1, fh:2.0, pop:170,   coast:70,  mtn:400,  temp:22 },
  'lausanne':            { eu:0, sc:1, fh:1.5, pop:140,   coast:0,   mtn:20,   temp:25 },
  'zagreb':              { eu:1, sc:1, fh:1.5, pop:770,   coast:140, mtn:20,   temp:27 },

  // === North America ===
  'nyu-stern':           { eu:0, sc:0, fh:8.5, pop:8300,  coast:0,   mtn:160,  temp:29 },
  'michigan-ross':       { eu:0, sc:0, fh:9.0, pop:120,   coast:80,  mtn:800,  temp:28 },
  'emory-goizueta':      { eu:0, sc:0, fh:9.0, pop:500,   coast:400, mtn:100,  temp:31 },
  'purdue-krannert':     { eu:0, sc:0, fh:9.5, pop:45,    coast:195, mtn:600,  temp:29 },
  'texas-am':            { eu:0, sc:0, fh:10.5,pop:120,   coast:190, mtn:900,  temp:34 },
  'wisconsin-madison':   { eu:0, sc:0, fh:9.5, pop:280,   coast:180, mtn:1500, temp:27 },
  'tulane':              { eu:0, sc:0, fh:11.0,pop:370,   coast:10,  mtn:700,  temp:32 },
  'george-washington':   { eu:0, sc:0, fh:8.5, pop:700,   coast:50,  mtn:90,   temp:30 },
  'minnesota-carlson':   { eu:0, sc:0, fh:9.5, pop:430,   coast:250, mtn:1500, temp:28 },
  'uc-berkeley':         { eu:0, sc:0, fh:11.0,pop:120,   coast:0,   mtn:20,   temp:22 },
  'florida-warrington':  { eu:0, sc:0, fh:11.0,pop:140,   coast:90,  mtn:500,  temp:33 },
  'hec-montreal':        { eu:0, sc:0, fh:8.0, pop:1800,  coast:600, mtn:80,   temp:26 },
  'queens-smith':        { eu:0, sc:0, fh:8.0, pop:135,   coast:0,   mtn:200,  temp:26 },
  'western-ivey':        { eu:0, sc:0, fh:8.5, pop:420,   coast:200, mtn:800,  temp:26 },
  'uqam':                { eu:0, sc:0, fh:8.0, pop:1800,  coast:600, mtn:80,   temp:26 },
  'laval':               { eu:0, sc:0, fh:7.5, pop:550,   coast:0,   mtn:100,  temp:25 },
  'simon-fraser':        { eu:0, sc:0, fh:10.5,pop:2650,  coast:0,   mtn:0,    temp:22 },

  // === Latin America ===
  'fgv-sao-paulo':       { eu:0, sc:0, fh:12.0,pop:12000, coast:60,  mtn:100,  temp:28 },
  'insper':              { eu:0, sc:0, fh:12.0,pop:12000, coast:60,  mtn:100,  temp:28 },
  'puc-chile':           { eu:0, sc:0, fh:16.0,pop:6800,  coast:100, mtn:10,   temp:28 },
  'itam':                { eu:0, sc:0, fh:12.0,pop:9200,  coast:280, mtn:0,    temp:24 },
  'tec-monterrey':       { eu:0, sc:0, fh:13.0,pop:1150,  coast:200, mtn:10,   temp:35 },
  'uba':                 { eu:0, sc:0, fh:14.0,pop:3100,  coast:0,   mtn:700,  temp:29 },
  'los-andes':           { eu:0, sc:0, fh:11.0,pop:7900,  coast:500, mtn:0,    temp:19 },
  'pacifico':            { eu:0, sc:0, fh:15.0,pop:10800, coast:0,   mtn:80,   temp:26 },

  // === East Asia ===
  'cuhk':                { eu:0, sc:0, fh:11.0,pop:7400,  coast:0,   mtn:200,  temp:31 },
  'hku':                 { eu:0, sc:0, fh:11.0,pop:7400,  coast:0,   mtn:200,  temp:31 },
  'city-hk':             { eu:0, sc:0, fh:11.0,pop:7400,  coast:0,   mtn:200,  temp:31 },
  'hkust':               { eu:0, sc:0, fh:11.0,pop:7400,  coast:0,   mtn:200,  temp:31 },
  'fudan':               { eu:0, sc:0, fh:12.0,pop:25000, coast:30,  mtn:200,  temp:32 },
  'sjtu-antai':          { eu:0, sc:0, fh:12.0,pop:25000, coast:30,  mtn:200,  temp:32 },
  'peking-guanghua':     { eu:0, sc:0, fh:9.5, pop:21500, coast:150, mtn:50,   temp:30 },
  'renmin':              { eu:0, sc:0, fh:9.5, pop:21500, coast:150, mtn:50,   temp:30 },
  'icu-japan':           { eu:0, sc:0, fh:13.0,pop:13900, coast:0,   mtn:80,   temp:30 },
  'snu':                 { eu:0, sc:0, fh:11.5,pop:9700,  coast:30,  mtn:190,  temp:29 },
  'yonsei':              { eu:0, sc:0, fh:11.5,pop:9700,  coast:30,  mtn:190,  temp:29 },
  'korea-university':    { eu:0, sc:0, fh:11.5,pop:9700,  coast:30,  mtn:190,  temp:29 },
  'sogang':              { eu:0, sc:0, fh:11.5,pop:9700,  coast:30,  mtn:190,  temp:29 },

  // === SE Asia ===
  'nus':                 { eu:0, sc:0, fh:12.0,pop:5700,  coast:0,   mtn:2000, temp:31 },
  'ntu-singapore':       { eu:0, sc:0, fh:12.0,pop:5700,  coast:0,   mtn:2000, temp:31 },
  'smu-singapore':       { eu:0, sc:0, fh:12.0,pop:5700,  coast:0,   mtn:2000, temp:31 },
  'chulalongkorn':       { eu:0, sc:0, fh:11.0,pop:10500, coast:40,  mtn:150,  temp:33 },
  'thammasat':           { eu:0, sc:0, fh:11.0,pop:10500, coast:40,  mtn:150,  temp:33 },

  // === Oceania ===
  'unsw':                { eu:0, sc:0, fh:22.5,pop:5300,  coast:0,   mtn:70,   temp:26 },
  'sydney-uni':          { eu:0, sc:0, fh:22.5,pop:5300,  coast:0,   mtn:70,   temp:26 },
  'monash':              { eu:0, sc:0, fh:22.5,pop:5100,  coast:0,   mtn:80,   temp:25 },
  'anu':                 { eu:0, sc:0, fh:23.0,pop:450,   coast:150, mtn:50,   temp:28 },
  'uq-brisbane':         { eu:0, sc:0, fh:22.0,pop:2600,  coast:20,  mtn:50,   temp:29 },
  'auckland-tech':       { eu:0, sc:0, fh:24.0,pop:1650,  coast:0,   mtn:50,   temp:24 },
  'waikato':             { eu:0, sc:0, fh:24.0,pop:180,   coast:100, mtn:80,   temp:24 },

  // === Africa / Middle East ===
  'stellenbosch':        { eu:0, sc:0, fh:12.0,pop:80,    coast:50,  mtn:0,    temp:28 },
  'au-cairo':            { eu:0, sc:0, fh:4.0, pop:10100, coast:180, mtn:300,  temp:35 },
  'hem':                 { eu:0, sc:0, fh:3.5, pop:3300,  coast:0,   mtn:150,  temp:26 },
  'bogazici':            { eu:0, sc:0, fh:3.0, pop:15700, coast:0,   mtn:100,  temp:29 },
  'koc':                 { eu:0, sc:0, fh:3.0, pop:15700, coast:0,   mtn:100,  temp:29 },
  'sabanci':             { eu:0, sc:0, fh:3.0, pop:15700, coast:0,   mtn:100,  temp:29 },
  'aus-sharjah':         { eu:0, sc:0, fh:6.0, pop:1800,  coast:10,  mtn:80,   temp:41 },
};

const tierOf = (pop) =>
  pop < 150 ? 'small' : pop < 800 ? 'medium' : pop < 3000 ? 'big' : 'mega';

function lines(f) {
  return [
    `    eu: ${!!f.eu},`,
    `    schengen: ${!!f.sc},`,
    `    flight_hours_from_de: ${f.fh},`,
    `    city_population_k: ${f.pop},`,
    `    city_size_tier: '${tierOf(f.pop)}',`,
    `    km_to_coast: ${f.coast},`,
    `    km_to_mountains: ${f.mtn},`,
    `    avg_summer_temp_c: ${f.temp},`,
  ].join('\n');
}

let src = fs.readFileSync(FILE, 'utf8');

// State-machine pass: walk blocks, capture last id, strip any existing factual
// field lines before `highlights: [`, then inject fresh values. Idempotent.
const FACTUAL_KEYS = [
  'eu', 'schengen', 'flight_hours_from_de', 'city_population_k',
  'city_size_tier', 'km_to_coast', 'km_to_mountains', 'avg_summer_temp_c',
];
const factualRegex = new RegExp(
  `^\\s*(?:${FACTUAL_KEYS.join('|')})\\s*:\\s*.+,\\s*$`,
);

const out = [];
let lastId = null;
let replaced = 0;
const unknown = [];
const lineArr = src.split('\n');

for (const line of lineArr) {
  const idMatch = line.match(/^\s*id:\s*'([^']+)'/);
  if (idMatch) lastId = idMatch[1];

  // Skip existing factual lines; they'll be re-emitted at the injection point.
  if (factualRegex.test(line)) continue;

  if (/^\s*highlights:\s*\[/.test(line) && lastId) {
    const f = F[lastId];
    if (!f) {
      unknown.push(lastId);
      out.push(line);
    } else {
      out.push(lines(f));
      out.push(line);
      replaced++;
    }
    lastId = null; // consume; next id starts next block
  } else {
    out.push(line);
  }
}

if (unknown.length) {
  console.error('MISSING in factual map:', unknown);
  process.exit(1);
}

fs.writeFileSync(FILE, out.join('\n'));
console.log(`Injected factual fields into ${replaced}/100 uni blocks.`);
