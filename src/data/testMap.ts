/**
 * Test Map Data - Railway Adventure (1920×1080)
 * 46 cities with routes including parallel routes for 4+ players
 */

export interface TestCity {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface TestRoute {
  id: string;
  from: string;
  to: string;
  length: number;
  color: 'gray' | 'red' | 'blue' | 'green' | 'yellow' | 'black' | 'orange' | 'pink' | 'white';
  type: 'land' | 'tunnel' | 'ferry';
  parallel?: 0 | 1;
  ferryLocomotives?: number;
}

export interface TestDestinationTicket {
  id: string;
  from: string;
  to: string;
  points: number;
  isLongRoute?: boolean;
}

// Scale factor from 800×550 to 1920×1440 (4:3 aspect ratio to match new map image)
const SCALE_X = 1920 / 800;
const SCALE_Y = 1440 / 550;

// 46 Cities scaled to 1920×1440 coordinate system
export const TEST_CITIES: TestCity[] = [
  { id: 'edinburgh', name: 'Эдинбург', x: Math.round(125 * SCALE_X), y: Math.round(45 * SCALE_Y) },
  { id: 'london', name: 'Лондон', x: Math.round(175 * SCALE_X), y: Math.round(166 * SCALE_Y) },
  { id: 'amsterdam', name: 'Амстердам', x: Math.round(251 * SCALE_X), y: Math.round(167 * SCALE_Y) },
  { id: 'bruxelles', name: 'Брюссель', x: Math.round(232 * SCALE_X), y: Math.round(205 * SCALE_Y) },
  { id: 'dieppe', name: 'Дьепп', x: Math.round(166 * SCALE_X), y: Math.round(237 * SCALE_Y) },
  { id: 'brest', name: 'Брест', x: Math.round(95 * SCALE_X), y: Math.round(261 * SCALE_Y) },
  { id: 'paris', name: 'Париж', x: Math.round(206 * SCALE_X), y: Math.round(272 * SCALE_Y) },
  { id: 'pamplona', name: 'Памплона', x: Math.round(155 * SCALE_X), y: Math.round(390 * SCALE_Y) },
  { id: 'madrid', name: 'Мадрид', x: Math.round(78 * SCALE_X), y: Math.round(455 * SCALE_Y) },
  { id: 'lisboa', name: 'Лиссабон', x: Math.round(24 * SCALE_X), y: Math.round(473 * SCALE_Y) },
  { id: 'cadiz', name: 'Кадис', x: Math.round(77 * SCALE_X), y: Math.round(514 * SCALE_Y) },
  { id: 'barcelona', name: 'Барселона', x: Math.round(164 * SCALE_X), y: Math.round(464 * SCALE_Y) },
  { id: 'marseille', name: 'Марсель', x: Math.round(273 * SCALE_X), y: Math.round(388 * SCALE_Y) },
  { id: 'zurich', name: 'Цюрих', x: Math.round(294 * SCALE_X), y: Math.round(316 * SCALE_Y) },
  { id: 'munchen', name: 'Мюнхен', x: Math.round(348 * SCALE_X), y: Math.round(265 * SCALE_Y) },
  { id: 'frankfurt', name: 'Франкфурт', x: Math.round(302 * SCALE_X), y: Math.round(230 * SCALE_Y) },
  { id: 'essen', name: 'Эссен', x: Math.round(316 * SCALE_X), y: Math.round(176 * SCALE_Y) },
  { id: 'berlin', name: 'Берлин', x: Math.round(393 * SCALE_X), y: Math.round(187 * SCALE_Y) },
  { id: 'kobenhavn', name: 'Копенгаген', x: Math.round(371 * SCALE_X), y: Math.round(93 * SCALE_Y) },
  { id: 'stockholm', name: 'Стокгольм', x: Math.round(453 * SCALE_X), y: Math.round(31 * SCALE_Y) },
  { id: 'petrograd', name: 'Петроград', x: Math.round(679 * SCALE_X), y: Math.round(51 * SCALE_Y) },
  { id: 'riga', name: 'Рига', x: Math.round(547 * SCALE_X), y: Math.round(54 * SCALE_Y) },
  { id: 'wilno', name: 'Вильно', x: Math.round(609 * SCALE_X), y: Math.round(161 * SCALE_Y) },
  { id: 'danzig', name: 'Данциг', x: Math.round(481 * SCALE_X), y: Math.round(126 * SCALE_Y) },
  { id: 'warszawa', name: 'Варшава', x: Math.round(521 * SCALE_X), y: Math.round(181 * SCALE_Y) },
  { id: 'moskva', name: 'Москва', x: Math.round(756 * SCALE_X), y: Math.round(146 * SCALE_Y) },
  { id: 'smolensk', name: 'Смоленск', x: Math.round(689 * SCALE_X), y: Math.round(166 * SCALE_Y) },
  { id: 'kyiv', name: 'Киев', x: Math.round(634 * SCALE_X), y: Math.round(224 * SCALE_Y) },
  { id: 'kharkov', name: 'Харьков', x: Math.round(745 * SCALE_X), y: Math.round(263 * SCALE_Y) },
  { id: 'rostov', name: 'Ростов', x: Math.round(776 * SCALE_X), y: Math.round(306 * SCALE_Y) },
  { id: 'sevastopol', name: 'Севастополь', x: Math.round(703 * SCALE_X), y: Math.round(363 * SCALE_Y) },
  { id: 'sochi', name: 'Сочи', x: Math.round(772 * SCALE_X), y: Math.round(375 * SCALE_Y) },
  { id: 'wien', name: 'Вена', x: Math.round(438 * SCALE_X), y: Math.round(279 * SCALE_Y) },
  { id: 'budapest', name: 'Будапешт', x: Math.round(476 * SCALE_X), y: Math.round(298 * SCALE_Y) },
  { id: 'zagreb', name: 'Загреб', x: Math.round(427 * SCALE_X), y: Math.round(350 * SCALE_Y) },
  { id: 'venezia', name: 'Венеция', x: Math.round(360 * SCALE_X), y: Math.round(339 * SCALE_Y) },
  { id: 'roma', name: 'Рим', x: Math.round(367 * SCALE_X), y: Math.round(411 * SCALE_Y) },
  { id: 'palermo', name: 'Палермо', x: Math.round(396 * SCALE_X), y: Math.round(514 * SCALE_Y) },
  { id: 'brindisi', name: 'Бриндизи', x: Math.round(435 * SCALE_X), y: Math.round(431 * SCALE_Y) },
  { id: 'sarajevo', name: 'Сараево', x: Math.round(493 * SCALE_X), y: Math.round(396 * SCALE_Y) },
  { id: 'bucuresti', name: 'Бухарест', x: Math.round(593 * SCALE_X), y: Math.round(353 * SCALE_Y) },
  { id: 'sofia', name: 'София', x: Math.round(546 * SCALE_X), y: Math.round(403 * SCALE_Y) },
  { id: 'athina', name: 'Афины', x: Math.round(532 * SCALE_X), y: Math.round(493 * SCALE_Y) },
  { id: 'constantinople', name: 'Константинополь', x: Math.round(634 * SCALE_X), y: Math.round(450 * SCALE_Y) },
  { id: 'smyrna', name: 'Смирна', x: Math.round(600 * SCALE_X), y: Math.round(513 * SCALE_Y) },
  { id: 'angora', name: 'Анкара', x: Math.round(695 * SCALE_X), y: Math.round(493 * SCALE_Y) },
  { id: 'erzurum', name: 'Эрзурум', x: Math.round(757 * SCALE_X), y: Math.round(474 * SCALE_Y) },
];

// Helper to generate route ID
const makeRouteId = (from: string, to: string, parallel?: 0 | 1, color?: string): string => {
  const pairKey = [from, to].sort().join('__');
  return `${pairKey}__${parallel ?? 0}__${color || 'gray'}`;
};

// All routes with parallel support
export const TEST_ROUTES: TestRoute[] = [
  // Edinburgh connections
  { id: makeRouteId('edinburgh', 'london', 0, 'black'), from: 'edinburgh', to: 'london', length: 4, color: 'black', type: 'land', parallel: 0 },
  { id: makeRouteId('edinburgh', 'london', 1, 'orange'), from: 'edinburgh', to: 'london', length: 4, color: 'orange', type: 'land', parallel: 1 },
  
  // London connections
  { id: makeRouteId('london', 'amsterdam', 0, 'gray'), from: 'london', to: 'amsterdam', length: 2, color: 'gray', type: 'ferry', ferryLocomotives: 2 },
  { id: makeRouteId('london', 'dieppe', 0, 'gray'), from: 'london', to: 'dieppe', length: 2, color: 'gray', type: 'ferry', parallel: 0, ferryLocomotives: 1 },
  { id: makeRouteId('london', 'dieppe', 1, 'gray'), from: 'london', to: 'dieppe', length: 2, color: 'gray', type: 'ferry', parallel: 1, ferryLocomotives: 1 },
  
  // Amsterdam connections
  { id: makeRouteId('amsterdam', 'bruxelles', 0, 'black'), from: 'amsterdam', to: 'bruxelles', length: 1, color: 'black', type: 'land' },
  { id: makeRouteId('amsterdam', 'essen', 0, 'yellow'), from: 'amsterdam', to: 'essen', length: 3, color: 'yellow', type: 'land' },
  { id: makeRouteId('amsterdam', 'frankfurt', 0, 'white'), from: 'amsterdam', to: 'frankfurt', length: 2, color: 'white', type: 'land' },
  
  // Bruxelles connections
  { id: makeRouteId('bruxelles', 'dieppe', 0, 'green'), from: 'bruxelles', to: 'dieppe', length: 2, color: 'green', type: 'land' },
  { id: makeRouteId('bruxelles', 'paris', 0, 'yellow'), from: 'bruxelles', to: 'paris', length: 2, color: 'yellow', type: 'land', parallel: 0 },
  { id: makeRouteId('bruxelles', 'paris', 1, 'red'), from: 'bruxelles', to: 'paris', length: 2, color: 'red', type: 'land', parallel: 1 },
  { id: makeRouteId('bruxelles', 'frankfurt', 0, 'blue'), from: 'bruxelles', to: 'frankfurt', length: 2, color: 'blue', type: 'land' },
  
  // Dieppe connections
  { id: makeRouteId('dieppe', 'brest', 0, 'orange'), from: 'dieppe', to: 'brest', length: 2, color: 'orange', type: 'land' },
  { id: makeRouteId('dieppe', 'paris', 0, 'pink'), from: 'dieppe', to: 'paris', length: 1, color: 'pink', type: 'land' },
  
  // Brest connections
  { id: makeRouteId('brest', 'paris', 0, 'black'), from: 'brest', to: 'paris', length: 3, color: 'black', type: 'land' },
  { id: makeRouteId('brest', 'pamplona', 0, 'pink'), from: 'brest', to: 'pamplona', length: 4, color: 'pink', type: 'land' },
  
  // Paris connections
  { id: makeRouteId('paris', 'pamplona', 0, 'blue'), from: 'paris', to: 'pamplona', length: 4, color: 'blue', type: 'land', parallel: 0 },
  { id: makeRouteId('paris', 'pamplona', 1, 'green'), from: 'paris', to: 'pamplona', length: 4, color: 'green', type: 'land', parallel: 1 },
  { id: makeRouteId('paris', 'zurich', 0, 'gray'), from: 'paris', to: 'zurich', length: 3, color: 'gray', type: 'tunnel' },
  { id: makeRouteId('paris', 'marseille', 0, 'gray'), from: 'paris', to: 'marseille', length: 4, color: 'gray', type: 'land' },
  { id: makeRouteId('paris', 'frankfurt', 0, 'white'), from: 'paris', to: 'frankfurt', length: 3, color: 'white', type: 'land', parallel: 0 },
  { id: makeRouteId('paris', 'frankfurt', 1, 'orange'), from: 'paris', to: 'frankfurt', length: 3, color: 'orange', type: 'land', parallel: 1 },
  
  // Pamplona connections
  { id: makeRouteId('pamplona', 'madrid', 0, 'black'), from: 'pamplona', to: 'madrid', length: 3, color: 'black', type: 'tunnel', parallel: 0 },
  { id: makeRouteId('pamplona', 'madrid', 1, 'white'), from: 'pamplona', to: 'madrid', length: 3, color: 'white', type: 'tunnel', parallel: 1 },
  { id: makeRouteId('pamplona', 'barcelona', 0, 'gray'), from: 'pamplona', to: 'barcelona', length: 2, color: 'gray', type: 'tunnel' },
  { id: makeRouteId('pamplona', 'marseille', 0, 'red'), from: 'pamplona', to: 'marseille', length: 4, color: 'red', type: 'land' },
  
  // Madrid connections
  { id: makeRouteId('madrid', 'lisboa', 0, 'pink'), from: 'madrid', to: 'lisboa', length: 3, color: 'pink', type: 'land' },
  { id: makeRouteId('madrid', 'cadiz', 0, 'orange'), from: 'madrid', to: 'cadiz', length: 3, color: 'orange', type: 'land' },
  { id: makeRouteId('madrid', 'barcelona', 0, 'yellow'), from: 'madrid', to: 'barcelona', length: 2, color: 'yellow', type: 'land' },
  
  // Lisboa connections
  { id: makeRouteId('lisboa', 'cadiz', 0, 'blue'), from: 'lisboa', to: 'cadiz', length: 2, color: 'blue', type: 'land' },
  
  // Barcelona connections
  { id: makeRouteId('barcelona', 'marseille', 0, 'gray'), from: 'barcelona', to: 'marseille', length: 4, color: 'gray', type: 'land' },
  
  // Marseille connections
  { id: makeRouteId('marseille', 'zurich', 0, 'pink'), from: 'marseille', to: 'zurich', length: 2, color: 'pink', type: 'tunnel' },
  { id: makeRouteId('marseille', 'roma', 0, 'gray'), from: 'marseille', to: 'roma', length: 4, color: 'gray', type: 'tunnel' },
  
  // Zurich connections
  { id: makeRouteId('zurich', 'munchen', 0, 'yellow'), from: 'zurich', to: 'munchen', length: 2, color: 'yellow', type: 'tunnel' },
  { id: makeRouteId('zurich', 'venezia', 0, 'green'), from: 'zurich', to: 'venezia', length: 2, color: 'green', type: 'tunnel' },
  
  // Frankfurt connections
  { id: makeRouteId('frankfurt', 'essen', 0, 'green'), from: 'frankfurt', to: 'essen', length: 2, color: 'green', type: 'land' },
  { id: makeRouteId('frankfurt', 'munchen', 0, 'pink'), from: 'frankfurt', to: 'munchen', length: 2, color: 'pink', type: 'land' },
  { id: makeRouteId('frankfurt', 'berlin', 0, 'black'), from: 'frankfurt', to: 'berlin', length: 3, color: 'black', type: 'land', parallel: 0 },
  { id: makeRouteId('frankfurt', 'berlin', 1, 'red'), from: 'frankfurt', to: 'berlin', length: 3, color: 'red', type: 'land', parallel: 1 },
  
  // Essen connections
  { id: makeRouteId('essen', 'berlin', 0, 'blue'), from: 'essen', to: 'berlin', length: 2, color: 'blue', type: 'land' },
  { id: makeRouteId('essen', 'kobenhavn', 0, 'gray'), from: 'essen', to: 'kobenhavn', length: 3, color: 'gray', type: 'ferry', parallel: 0, ferryLocomotives: 1 },
  { id: makeRouteId('essen', 'kobenhavn', 1, 'gray'), from: 'essen', to: 'kobenhavn', length: 3, color: 'gray', type: 'ferry', parallel: 1, ferryLocomotives: 1 },
  
  // Berlin connections
  { id: makeRouteId('berlin', 'danzig', 0, 'gray'), from: 'berlin', to: 'danzig', length: 4, color: 'gray', type: 'land' },
  { id: makeRouteId('berlin', 'warszawa', 0, 'yellow'), from: 'berlin', to: 'warszawa', length: 4, color: 'yellow', type: 'land', parallel: 0 },
  { id: makeRouteId('berlin', 'warszawa', 1, 'pink'), from: 'berlin', to: 'warszawa', length: 4, color: 'pink', type: 'land', parallel: 1 },
  { id: makeRouteId('berlin', 'wien', 0, 'green'), from: 'berlin', to: 'wien', length: 3, color: 'green', type: 'land' },
  
  // København connections
  { id: makeRouteId('kobenhavn', 'stockholm', 0, 'yellow'), from: 'kobenhavn', to: 'stockholm', length: 3, color: 'yellow', type: 'land', parallel: 0 },
  { id: makeRouteId('kobenhavn', 'stockholm', 1, 'white'), from: 'kobenhavn', to: 'stockholm', length: 3, color: 'white', type: 'land', parallel: 1 },
  
  // Stockholm connections
  { id: makeRouteId('stockholm', 'petrograd', 0, 'gray'), from: 'stockholm', to: 'petrograd', length: 8, color: 'gray', type: 'tunnel' },
  
  // Petrograd connections
  { id: makeRouteId('petrograd', 'riga', 0, 'gray'), from: 'petrograd', to: 'riga', length: 4, color: 'gray', type: 'land' },
  { id: makeRouteId('petrograd', 'moskva', 0, 'white'), from: 'petrograd', to: 'moskva', length: 4, color: 'white', type: 'land' },
  { id: makeRouteId('petrograd', 'wilno', 0, 'blue'), from: 'petrograd', to: 'wilno', length: 4, color: 'blue', type: 'land' },
  
  // Riga connections
  { id: makeRouteId('riga', 'danzig', 0, 'black'), from: 'riga', to: 'danzig', length: 3, color: 'black', type: 'land' },
  { id: makeRouteId('riga', 'wilno', 0, 'green'), from: 'riga', to: 'wilno', length: 4, color: 'green', type: 'land' },
  
  // Danzig connections
  { id: makeRouteId('danzig', 'warszawa', 0, 'gray'), from: 'danzig', to: 'warszawa', length: 2, color: 'gray', type: 'land' },
  
  // Wilno connections
  { id: makeRouteId('wilno', 'warszawa', 0, 'red'), from: 'wilno', to: 'warszawa', length: 3, color: 'red', type: 'land' },
  { id: makeRouteId('wilno', 'smolensk', 0, 'yellow'), from: 'wilno', to: 'smolensk', length: 3, color: 'yellow', type: 'land' },
  { id: makeRouteId('wilno', 'kyiv', 0, 'gray'), from: 'wilno', to: 'kyiv', length: 2, color: 'gray', type: 'land' },
  
  // Warszawa connections
  { id: makeRouteId('warszawa', 'wien', 0, 'blue'), from: 'warszawa', to: 'wien', length: 4, color: 'blue', type: 'land' },
  { id: makeRouteId('warszawa', 'kyiv', 0, 'gray'), from: 'warszawa', to: 'kyiv', length: 4, color: 'gray', type: 'land' },
  
  // Smolensk connections
  { id: makeRouteId('smolensk', 'moskva', 0, 'orange'), from: 'smolensk', to: 'moskva', length: 2, color: 'orange', type: 'land' },
  { id: makeRouteId('smolensk', 'kyiv', 0, 'red'), from: 'smolensk', to: 'kyiv', length: 3, color: 'red', type: 'land' },
  
  // Moskva connections
  { id: makeRouteId('moskva', 'kharkov', 0, 'gray'), from: 'moskva', to: 'kharkov', length: 4, color: 'gray', type: 'land' },
  
  // Kyiv connections
  { id: makeRouteId('kyiv', 'kharkov', 0, 'gray'), from: 'kyiv', to: 'kharkov', length: 4, color: 'gray', type: 'land' },
  { id: makeRouteId('kyiv', 'budapest', 0, 'gray'), from: 'kyiv', to: 'budapest', length: 6, color: 'gray', type: 'tunnel' },
  { id: makeRouteId('kyiv', 'bucuresti', 0, 'gray'), from: 'kyiv', to: 'bucuresti', length: 4, color: 'gray', type: 'land' },
  
  // Kharkov connections
  { id: makeRouteId('kharkov', 'rostov', 0, 'green'), from: 'kharkov', to: 'rostov', length: 2, color: 'green', type: 'land' },
  
  // Rostov connections
  { id: makeRouteId('rostov', 'sevastopol', 0, 'gray'), from: 'rostov', to: 'sevastopol', length: 4, color: 'gray', type: 'land' },
  { id: makeRouteId('rostov', 'sochi', 0, 'gray'), from: 'rostov', to: 'sochi', length: 2, color: 'gray', type: 'land' },
  
  // Sevastopol connections
  { id: makeRouteId('sevastopol', 'sochi', 0, 'gray'), from: 'sevastopol', to: 'sochi', length: 2, color: 'gray', type: 'ferry', ferryLocomotives: 2 },
  { id: makeRouteId('sevastopol', 'bucuresti', 0, 'white'), from: 'sevastopol', to: 'bucuresti', length: 4, color: 'white', type: 'land' },
  { id: makeRouteId('sevastopol', 'constantinople', 0, 'gray'), from: 'sevastopol', to: 'constantinople', length: 4, color: 'gray', type: 'ferry', ferryLocomotives: 2 },
  
  // Sochi connections
  { id: makeRouteId('sochi', 'erzurum', 0, 'red'), from: 'sochi', to: 'erzurum', length: 3, color: 'red', type: 'tunnel' },
  
  // Erzurum connections
  { id: makeRouteId('erzurum', 'angora', 0, 'black'), from: 'erzurum', to: 'angora', length: 3, color: 'black', type: 'land' },
  { id: makeRouteId('erzurum', 'sevastopol', 0, 'gray'), from: 'erzurum', to: 'sevastopol', length: 4, color: 'gray', type: 'tunnel' },
  
  // Angora connections
  { id: makeRouteId('angora', 'smyrna', 0, 'orange'), from: 'angora', to: 'smyrna', length: 3, color: 'orange', type: 'tunnel' },
  { id: makeRouteId('angora', 'constantinople', 0, 'gray'), from: 'angora', to: 'constantinople', length: 2, color: 'gray', type: 'tunnel', parallel: 0 },
  { id: makeRouteId('angora', 'constantinople', 1, 'gray'), from: 'angora', to: 'constantinople', length: 2, color: 'gray', type: 'tunnel', parallel: 1 },
  
  // Smyrna connections
  { id: makeRouteId('smyrna', 'athina', 0, 'gray'), from: 'smyrna', to: 'athina', length: 2, color: 'gray', type: 'ferry', ferryLocomotives: 1 },
  { id: makeRouteId('smyrna', 'constantinople', 0, 'gray'), from: 'smyrna', to: 'constantinople', length: 2, color: 'gray', type: 'tunnel' },
  
  // Constantinople connections
  { id: makeRouteId('constantinople', 'sofia', 0, 'blue'), from: 'constantinople', to: 'sofia', length: 3, color: 'blue', type: 'land' },
  { id: makeRouteId('constantinople', 'bucuresti', 0, 'yellow'), from: 'constantinople', to: 'bucuresti', length: 3, color: 'yellow', type: 'land' },
  
  // Sofia connections
  { id: makeRouteId('sofia', 'athina', 0, 'pink'), from: 'sofia', to: 'athina', length: 3, color: 'pink', type: 'land' },
  { id: makeRouteId('sofia', 'sarajevo', 0, 'gray'), from: 'sofia', to: 'sarajevo', length: 2, color: 'gray', type: 'tunnel' },
  { id: makeRouteId('sofia', 'bucuresti', 0, 'gray'), from: 'sofia', to: 'bucuresti', length: 2, color: 'gray', type: 'tunnel' },
  
  // Athina connections
  { id: makeRouteId('athina', 'brindisi', 0, 'gray'), from: 'athina', to: 'brindisi', length: 4, color: 'gray', type: 'ferry', ferryLocomotives: 1 },
  
  // Bucuresti connections
  { id: makeRouteId('bucuresti', 'budapest', 0, 'gray'), from: 'bucuresti', to: 'budapest', length: 4, color: 'gray', type: 'tunnel' },
  
  // Budapest connections
  { id: makeRouteId('budapest', 'wien', 0, 'white'), from: 'budapest', to: 'wien', length: 1, color: 'white', type: 'land', parallel: 0 },
  { id: makeRouteId('budapest', 'wien', 1, 'red'), from: 'budapest', to: 'wien', length: 1, color: 'red', type: 'land', parallel: 1 },
  { id: makeRouteId('budapest', 'sarajevo', 0, 'pink'), from: 'budapest', to: 'sarajevo', length: 3, color: 'pink', type: 'land' },
  { id: makeRouteId('budapest', 'zagreb', 0, 'orange'), from: 'budapest', to: 'zagreb', length: 2, color: 'orange', type: 'land' },
  
  // Wien connections
  { id: makeRouteId('wien', 'munchen', 0, 'orange'), from: 'wien', to: 'munchen', length: 3, color: 'orange', type: 'land' },
  { id: makeRouteId('wien', 'zagreb', 0, 'gray'), from: 'wien', to: 'zagreb', length: 2, color: 'gray', type: 'land' },
  
  // München connections
  { id: makeRouteId('munchen', 'venezia', 0, 'blue'), from: 'munchen', to: 'venezia', length: 2, color: 'blue', type: 'tunnel' },
  
  // Sarajevo connections
  { id: makeRouteId('sarajevo', 'zagreb', 0, 'red'), from: 'sarajevo', to: 'zagreb', length: 3, color: 'red', type: 'land' },
  { id: makeRouteId('sarajevo', 'athina', 0, 'green'), from: 'sarajevo', to: 'athina', length: 4, color: 'green', type: 'land' },
  
  // Zagreb connections
  { id: makeRouteId('zagreb', 'venezia', 0, 'gray'), from: 'zagreb', to: 'venezia', length: 2, color: 'gray', type: 'land' },
  
  // Venezia connections
  { id: makeRouteId('venezia', 'roma', 0, 'black'), from: 'venezia', to: 'roma', length: 2, color: 'black', type: 'land' },
  
  // Roma connections
  { id: makeRouteId('roma', 'brindisi', 0, 'white'), from: 'roma', to: 'brindisi', length: 2, color: 'white', type: 'land' },
  { id: makeRouteId('roma', 'palermo', 0, 'gray'), from: 'roma', to: 'palermo', length: 4, color: 'gray', type: 'ferry', ferryLocomotives: 1 },
  
  // Brindisi connections
  { id: makeRouteId('brindisi', 'palermo', 0, 'gray'), from: 'brindisi', to: 'palermo', length: 3, color: 'gray', type: 'ferry', ferryLocomotives: 1 },
  
  // Palermo connections
  { id: makeRouteId('palermo', 'smyrna', 0, 'gray'), from: 'palermo', to: 'smyrna', length: 6, color: 'gray', type: 'ferry', ferryLocomotives: 2 },
];

// Destination tickets for test map
export const TEST_DESTINATION_TICKETS: TestDestinationTicket[] = [
  { id: 'test-ticket-1', from: 'lisboa', to: 'danzig', points: 20, isLongRoute: true },
  { id: 'test-ticket-2', from: 'brest', to: 'petrograd', points: 20, isLongRoute: true },
  { id: 'test-ticket-3', from: 'palermo', to: 'moskva', points: 20, isLongRoute: true },
  { id: 'test-ticket-4', from: 'cadiz', to: 'stockholm', points: 21, isLongRoute: true },
  { id: 'test-ticket-5', from: 'edinburgh', to: 'athina', points: 21, isLongRoute: true },
  { id: 'test-ticket-6', from: 'amsterdam', to: 'pamplona', points: 7 },
  { id: 'test-ticket-7', from: 'zurich', to: 'brindisi', points: 6 },
  { id: 'test-ticket-8', from: 'berlin', to: 'moskva', points: 12 },
  { id: 'test-ticket-9', from: 'brest', to: 'marseille', points: 7 },
  { id: 'test-ticket-10', from: 'london', to: 'berlin', points: 7 },
  { id: 'test-ticket-11', from: 'paris', to: 'wien', points: 8 },
  { id: 'test-ticket-12', from: 'roma', to: 'smyrna', points: 8 },
];

// Validation helper
export function validateTestMap(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const cityIds = new Set(TEST_CITIES.map(c => c.id));
  
  // Check for duplicate city IDs
  if (cityIds.size !== TEST_CITIES.length) {
    errors.push('Duplicate city IDs found');
  }
  
  // Validate routes
  for (const route of TEST_ROUTES) {
    if (!cityIds.has(route.from)) {
      errors.push(`Route ${route.id}: 'from' city '${route.from}' not found`);
    }
    if (!cityIds.has(route.to)) {
      errors.push(`Route ${route.id}: 'to' city '${route.to}' not found`);
    }
    if (route.length < 1) {
      errors.push(`Route ${route.id}: length must be >= 1`);
    }
    if (route.parallel !== undefined && route.parallel !== 0 && route.parallel !== 1) {
      errors.push(`Route ${route.id}: parallel must be 0 or 1`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

// Get city by ID helper
export function getTestCity(cityId: string): TestCity | undefined {
  return TEST_CITIES.find(c => c.id === cityId);
}

// Get parallel route offset
export function getParallelOffset(route: TestRoute, allRoutes: TestRoute[]): number {
  if (route.parallel === undefined) {
    // Check if there's a parallel route for this pair
    const pairKey = [route.from, route.to].sort().join('__');
    const hasParallel = allRoutes.some(r => 
      r.id !== route.id && 
      [r.from, r.to].sort().join('__') === pairKey
    );
    return hasParallel ? -12 : 0;
  }
  return route.parallel === 0 ? -12 : 12;
}
