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

// 47 Cities - calibrated coordinates for 1920×1440 viewBox
export const TEST_CITIES: TestCity[] = [
  { id: 'edinburgh', name: 'Эдинбург', x: 322, y: 196 },
  { id: 'london', name: 'Лондон', x: 440, y: 467 },
  { id: 'amsterdam', name: 'Амстердам', x: 619, y: 474 },
  { id: 'bruxelles', name: 'Брюссель', x: 578, y: 564 },
  { id: 'dieppe', name: 'Дьепп', x: 421, y: 631 },
  { id: 'brest', name: 'Брест', x: 251, y: 684 },
  { id: 'paris', name: 'Париж', x: 505, y: 712 },
  { id: 'pamplona', name: 'Памплона', x: 391, y: 994 },
  { id: 'madrid', name: 'Мадрид', x: 217, y: 1146 },
  { id: 'lisboa', name: 'Лиссабон', x: 94, y: 1184 },
  { id: 'cadiz', name: 'Кадис', x: 212, y: 1286 },
  { id: 'barcelona', name: 'Барселона', x: 419, y: 1160 },
  { id: 'marseille', name: 'Марсель', x: 670, y: 995 },
  { id: 'zurich', name: 'Цюрих', x: 722, y: 816 },
  { id: 'munchen', name: 'Мюнхен', x: 842, y: 697 },
  { id: 'frankfurt', name: 'Франкфурт', x: 736, y: 619 },
  { id: 'essen', name: 'Эссен', x: 764, y: 493 },
  { id: 'berlin', name: 'Берлин', x: 946, y: 520 },
  { id: 'kobenhavn', name: 'Копенгаген', x: 897, y: 299 },
  { id: 'stockholm', name: 'Стокгольм', x: 1084, y: 156 },
  { id: 'petrograd', name: 'Петроград', x: 1606, y: 204 },
  { id: 'riga', name: 'Рига', x: 1301, y: 212 },
  { id: 'wilno', name: 'Вильно', x: 1441, y: 461 },
  { id: 'danzig', name: 'Данциг', x: 1155, y: 374 },
  { id: 'warszawa', name: 'Варшава', x: 1240, y: 503 },
  { id: 'moskva', name: 'Москва', x: 1784, y: 418 },
  { id: 'smolensk', name: 'Смоленск', x: 1630, y: 467 },
  { id: 'kyiv', name: 'Киев', x: 1513, y: 602 },
  { id: 'kharkov', name: 'Харьков', x: 1757, y: 698 },
  { id: 'rostov', name: 'Ростов', x: 1834, y: 790 },
  { id: 'sevastopol', name: 'Севастополь', x: 1659, y: 928 },
  { id: 'sochi', name: 'Сочи', x: 1822, y: 955 },
  { id: 'wien', name: 'Вена', x: 1046, y: 728 },
  { id: 'budapest', name: 'Будапешт', x: 1138, y: 772 },
  { id: 'zagreb', name: 'Загреб', x: 1025, y: 901 },
  { id: 'venezia', name: 'Венеция', x: 869, y: 878 },
  { id: 'roma', name: 'Рим', x: 890, y: 1043 },
  { id: 'palermo', name: 'Палермо', x: 895, y: 1240 },
  { id: 'brindisi', name: 'Бриндизи', x: 1048, y: 1084 },
  { id: 'sarajevo', name: 'Сараево', x: 1180, y: 1007 },
  { id: 'bucuresti', name: 'Бухарест', x: 1405, y: 905 },
  { id: 'sofia', name: 'София', x: 1301, y: 1022 },
  { id: 'athina', name: 'Афины', x: 1269, y: 1228 },
  { id: 'constantinople', name: 'Константинополь', x: 1502, y: 1135 },
  { id: 'smyrna', name: 'Смирна', x: 1421, y: 1276 },
  { id: 'angora', name: 'Анкара', x: 1642, y: 1232 },
  { id: 'erzurum', name: 'Эрзурум', x: 1789, y: 1187 },
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
