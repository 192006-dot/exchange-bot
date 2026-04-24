/**
 * Approximate city-level coordinates for each partner uni.
 * Used by the landing-page world map.
 *
 * Note: city centroids, not exact campus locations. [lng, lat].
 */
export const uniCoordinates: Record<string, [number, number]> = {
  // ===== SEED =====
  'pompeu-fabra': [2.17, 41.38],           // Barcelona
  bocconi: [9.19, 45.46],                  // Milan
  luiss: [12.50, 41.90],                   // Rome
  'nova-sbe': [-9.14, 38.72],              // Lisbon
  'copenhagen-bs': [12.57, 55.68],         // Copenhagen
  'sse-stockholm': [18.07, 59.33],         // Stockholm
  essec: [2.07, 49.04],                    // Cergy (near Paris)
  'st-gallen': [9.37, 47.42],              // St. Gallen
  'wu-vienna': [16.37, 48.21],             // Vienna
  'trinity-dublin': [-6.26, 53.34],        // Dublin
  aston: [-1.89, 52.49],                   // Birmingham
  'nyu-stern': [-74.00, 40.73],            // New York
  'michigan-ross': [-83.74, 42.28],        // Ann Arbor
  'hec-montreal': [-73.58, 45.51],         // Montreal
  'fgv-sao-paulo': [-46.63, -23.55],       // São Paulo
  'puc-chile': [-70.65, -33.45],           // Santiago
  nus: [103.82, 1.35],                     // Singapore
  hkust: [114.27, 22.34],                  // Hong Kong
  unsw: [151.22, -33.92],                  // Sydney
  stellenbosch: [18.86, -33.93],           // Stellenbosch (near Cape Town)

  // ===== EUROPE =====
  innsbruck: [11.40, 47.27],
  antwerpen: [4.40, 51.22],
  uclouvain: [4.60, 50.67],                // Louvain-la-Neuve
  'hec-liege': [5.57, 50.63],
  'ku-leuven': [4.70, 50.88],
  'charles-prague': [14.42, 50.08],
  aarhus: [10.20, 56.16],
  aalto: [24.94, 60.17],                   // Helsinki area
  hanken: [24.94, 60.17],
  edhec: [3.06, 50.63],                    // Lille / Nice — Lille
  'em-lyon': [4.85, 45.76],
  'sciences-po': [2.33, 48.85],            // Paris
  ieseg: [3.07, 50.64],                    // Lille / Paris
  'frankfurt-school': [8.68, 50.11],       // Frankfurt
  'fu-berlin': [13.40, 52.52],
  lmu: [11.58, 48.14],                     // Munich
  mannheim: [8.47, 49.49],
  cologne: [6.96, 50.94],
  corvinus: [19.05, 47.50],                // Budapest
  cattolica: [9.19, 45.46],                // Milan
  bologna: [11.34, 44.49],
  'bi-norway': [10.75, 59.91],             // Oslo
  nhh: [5.32, 60.39],                      // Bergen
  'catolica-lisbon': [-9.14, 38.72],
  'catolica-porto': [-8.61, 41.15],
  'ie-madrid': [-3.70, 40.42],
  'carlos-iii': [-3.70, 40.42],
  'autonoma-barcelona': [2.17, 41.38],
  lund: [13.19, 55.71],
  uppsala: [17.64, 59.86],
  lausanne: [6.63, 46.52],
  zagreb: [15.98, 45.81],

  // ===== AMERICAS =====
  'emory-goizueta': [-84.39, 33.75],       // Atlanta
  'purdue-krannert': [-86.92, 40.42],      // West Lafayette
  'texas-am': [-96.34, 30.62],             // College Station
  'wisconsin-madison': [-89.40, 43.08],    // Madison
  tulane: [-90.08, 29.95],                 // New Orleans
  'george-washington': [-77.04, 38.90],    // Washington DC
  'minnesota-carlson': [-93.27, 44.97],    // Minneapolis
  'uc-berkeley': [-122.27, 37.87],         // Berkeley
  'florida-warrington': [-82.35, 29.65],   // Gainesville
  'queens-smith': [-76.49, 44.23],         // Kingston, ON
  'western-ivey': [-81.25, 42.98],         // London, ON
  uqam: [-73.57, 45.51],                   // Montreal
  laval: [-71.21, 46.81],                  // Quebec City
  'simon-fraser': [-122.92, 49.28],        // Burnaby/Vancouver
  itam: [-99.13, 19.43],                   // Mexico City
  'tec-monterrey': [-100.32, 25.67],       // Monterrey
  insper: [-46.63, -23.55],                // São Paulo
  uba: [-58.38, -34.61],                   // Buenos Aires
  'los-andes': [-74.07, 4.71],             // Bogotá
  pacifico: [-77.04, -12.05],              // Lima

  // ===== ASIA-PACIFIC =====
  cuhk: [114.21, 22.42],                   // Hong Kong
  hku: [114.14, 22.28],                    // Hong Kong
  'city-hk': [114.17, 22.34],              // Hong Kong
  fudan: [121.47, 31.23],                  // Shanghai
  'peking-guanghua': [116.40, 39.90],      // Beijing
  'sjtu-antai': [121.47, 31.23],           // Shanghai
  renmin: [116.40, 39.90],                 // Beijing
  'ntu-singapore': [103.68, 1.35],         // Singapore
  'smu-singapore': [103.85, 1.30],         // Singapore
  'icu-japan': [139.69, 35.69],            // Tokyo
  yonsei: [126.94, 37.56],                 // Seoul
  'korea-university': [127.03, 37.59],     // Seoul
  snu: [126.95, 37.46],                    // Seoul
  sogang: [126.94, 37.55],                 // Seoul
  chulalongkorn: [100.50, 13.74],          // Bangkok
  thammasat: [100.48, 13.75],              // Bangkok
  monash: [144.96, -37.81],                // Melbourne
  'sydney-uni': [151.19, -33.89],          // Sydney
  anu: [149.13, -35.28],                   // Canberra
  'uq-brisbane': [153.02, -27.47],         // Brisbane
  'auckland-tech': [174.76, -36.85],       // Auckland
  waikato: [175.30, -37.78],               // Hamilton, NZ

  // ===== AFRICA & ME =====
  'au-cairo': [31.24, 30.04],              // Cairo
  hem: [-7.59, 33.57],                     // Casablanca / Rabat
  bogazici: [29.05, 41.08],                // Istanbul
  koc: [29.00, 41.07],                     // Istanbul
  sabanci: [29.36, 40.89],                 // Istanbul
  'aus-sharjah': [55.48, 25.36],           // Sharjah / Dubai
};
