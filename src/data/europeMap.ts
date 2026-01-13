import { City, Route, DestinationTicket } from '@/types/game';

// Russian city names mapping
export const CITY_NAMES_RU: Record<string, string> = {
  edinburgh: 'Эдинбург',
  london: 'Лондон',
  amsterdam: 'Амстердам',
  bruxelles: 'Брюссель',
  dieppe: 'Дьепп',
  brest: 'Брест',
  paris: 'Париж',
  pamplona: 'Памплона',
  madrid: 'Мадрид',
  lisboa: 'Лиссабон',
  cadiz: 'Кадис',
  barcelona: 'Барселона',
  marseille: 'Марсель',
  zurich: 'Цюрих',
  munchen: 'Мюнхен',
  frankfurt: 'Франкфурт',
  essen: 'Эссен',
  berlin: 'Берлин',
  kobenhavn: 'Копенгаген',
  stockholm: 'Стокгольм',
  petrograd: 'Петроград',
  riga: 'Рига',
  wilno: 'Вильно',
  danzig: 'Данциг',
  warszawa: 'Варшава',
  wien: 'Вена',
  venezia: 'Венеция',
  roma: 'Рим',
  palermo: 'Палермо',
  brindisi: 'Бриндизи',
  athina: 'Афины',
  smyrna: 'Смирна',
  constantinople: 'Константинополь',
  angora: 'Анкара',
  erzurum: 'Эрзурум',
  sevastopol: 'Севастополь',
  sochi: 'Сочи',
  rostov: 'Ростов',
  kharkov: 'Харьков',
  kyiv: 'Киев',
  bucuresti: 'Бухарест',
  budapest: 'Будапешт',
  sarajevo: 'Сараево',
  zagreb: 'Загреб',
  sofia: 'София',
  moskva: 'Москва',
  smolensk: 'Смоленск',
};

// All 46 cities from Ticket to Ride: Europe - fine-tuned to map image
export const EUROPE_CITIES: City[] = [
  { id: 'edinburgh', name: 'Эдинбург', x: 125, y: 45 },
  { id: 'london', name: 'Лондон', x: 175, y: 166 },
  { id: 'amsterdam', name: 'Амстердам', x: 251, y: 167 },
  { id: 'bruxelles', name: 'Брюссель', x: 232, y: 205 },
  { id: 'dieppe', name: 'Дьепп', x: 166, y: 237 },
  { id: 'brest', name: 'Брест', x: 95, y: 261 },
  { id: 'paris', name: 'Париж', x: 206, y: 272 },
  { id: 'pamplona', name: 'Памплона', x: 155, y: 390 },
  { id: 'madrid', name: 'Мадрид', x: 78, y: 455 },
  { id: 'lisboa', name: 'Лиссабон', x: 24, y: 473 },
  { id: 'cadiz', name: 'Кадис', x: 77, y: 514 },
  { id: 'barcelona', name: 'Барселона', x: 164, y: 464 },
  { id: 'marseille', name: 'Марсель', x: 273, y: 388 },
  { id: 'zurich', name: 'Цюрих', x: 294, y: 316 },
  { id: 'munchen', name: 'Мюнхен', x: 348, y: 265 },
  { id: 'frankfurt', name: 'Франкфурт', x: 302, y: 230 },
  { id: 'essen', name: 'Эссен', x: 316, y: 176 },
  { id: 'berlin', name: 'Берлин', x: 393, y: 187 },
  { id: 'kobenhavn', name: 'Копенгаген', x: 371, y: 93 },
  { id: 'stockholm', name: 'Стокгольм', x: 453, y: 31 },
  { id: 'petrograd', name: 'Петроград', x: 679, y: 51 },
  { id: 'riga', name: 'Рига', x: 547, y: 54 },
  { id: 'wilno', name: 'Вильно', x: 609, y: 161 },
  { id: 'danzig', name: 'Данциг', x: 481, y: 126 },
  { id: 'warszawa', name: 'Варшава', x: 521, y: 181 },
  { id: 'moskva', name: 'Москва', x: 756, y: 146 },
  { id: 'smolensk', name: 'Смоленск', x: 689, y: 166 },
  { id: 'kyiv', name: 'Киев', x: 634, y: 224 },
  { id: 'kharkov', name: 'Харьков', x: 745, y: 263 },
  { id: 'rostov', name: 'Ростов', x: 776, y: 306 },
  { id: 'sevastopol', name: 'Севастополь', x: 703, y: 363 },
  { id: 'sochi', name: 'Сочи', x: 772, y: 375 },
  { id: 'wien', name: 'Вена', x: 438, y: 279 },
  { id: 'budapest', name: 'Будапешт', x: 476, y: 298 },
  { id: 'zagreb', name: 'Загреб', x: 427, y: 350 },
  { id: 'venezia', name: 'Венеция', x: 360, y: 339 },
  { id: 'roma', name: 'Рим', x: 367, y: 411 },
  { id: 'palermo', name: 'Палермо', x: 396, y: 514 },
  { id: 'brindisi', name: 'Бриндизи', x: 435, y: 431 },
  { id: 'sarajevo', name: 'Сараево', x: 493, y: 396 },
  { id: 'bucuresti', name: 'Бухарест', x: 593, y: 353 },
  { id: 'sofia', name: 'София', x: 546, y: 403 },
  { id: 'athina', name: 'Афины', x: 532, y: 493 },
  { id: 'constantinople', name: 'Константинополь', x: 634, y: 450 },
  { id: 'smyrna', name: 'Смирна', x: 600, y: 513 },
  { id: 'angora', name: 'Анкара', x: 695, y: 493 },
  { id: 'erzurum', name: 'Эрзурум', x: 757, y: 474 }
];

// All routes between cities
export const EUROPE_ROUTES: Route[] = [
  // Edinburgh connections
  { id: 'edinburgh-london-1', cities: ['edinburgh', 'london'], length: 4, color: 'black', parallelRouteId: 'edinburgh-london-2' },
  { id: 'edinburgh-london-2', cities: ['edinburgh', 'london'], length: 4, color: 'orange', parallelRouteId: 'edinburgh-london-1' },
  
  // London connections
  { id: 'london-amsterdam', cities: ['london', 'amsterdam'], length: 2, color: 'gray', ferryLocomotives: 2 },
  { id: 'london-dieppe-1', cities: ['london', 'dieppe'], length: 2, color: 'gray', ferryLocomotives: 1 },
  { id: 'london-dieppe-2', cities: ['london', 'dieppe'], length: 2, color: 'gray', ferryLocomotives: 1, parallelRouteId: 'london-dieppe-1' },
  
  // Amsterdam connections
  { id: 'amsterdam-bruxelles', cities: ['amsterdam', 'bruxelles'], length: 1, color: 'black' },
  { id: 'amsterdam-essen', cities: ['amsterdam', 'essen'], length: 3, color: 'yellow' },
  { id: 'amsterdam-frankfurt', cities: ['amsterdam', 'frankfurt'], length: 2, color: 'white' },
  
  // Bruxelles connections
  { id: 'bruxelles-dieppe', cities: ['bruxelles', 'dieppe'], length: 2, color: 'green' },
  { id: 'bruxelles-paris-1', cities: ['bruxelles', 'paris'], length: 2, color: 'yellow' },
  { id: 'bruxelles-paris-2', cities: ['bruxelles', 'paris'], length: 2, color: 'red', parallelRouteId: 'bruxelles-paris-1' },
  { id: 'bruxelles-frankfurt', cities: ['bruxelles', 'frankfurt'], length: 2, color: 'blue' },
  
  // Dieppe connections
  { id: 'dieppe-brest', cities: ['dieppe', 'brest'], length: 2, color: 'orange' },
  { id: 'dieppe-paris', cities: ['dieppe', 'paris'], length: 1, color: 'pink' },
  
  // Brest connections
  { id: 'brest-paris', cities: ['brest', 'paris'], length: 3, color: 'black' },
  { id: 'brest-pamplona', cities: ['brest', 'pamplona'], length: 4, color: 'pink' },
  
  // Paris connections
  { id: 'paris-pamplona-1', cities: ['paris', 'pamplona'], length: 4, color: 'blue' },
  { id: 'paris-pamplona-2', cities: ['paris', 'pamplona'], length: 4, color: 'green', parallelRouteId: 'paris-pamplona-1' },
  { id: 'paris-zurich', cities: ['paris', 'zurich'], length: 3, color: 'gray', isTunnel: true },
  { id: 'paris-marseille', cities: ['paris', 'marseille'], length: 4, color: 'gray' },
  { id: 'paris-frankfurt-1', cities: ['paris', 'frankfurt'], length: 3, color: 'white' },
  { id: 'paris-frankfurt-2', cities: ['paris', 'frankfurt'], length: 3, color: 'orange', parallelRouteId: 'paris-frankfurt-1' },
  
  // Pamplona connections
  { id: 'pamplona-madrid-1', cities: ['pamplona', 'madrid'], length: 3, color: 'black', isTunnel: true },
  { id: 'pamplona-madrid-2', cities: ['pamplona', 'madrid'], length: 3, color: 'white', isTunnel: true, parallelRouteId: 'pamplona-madrid-1' },
  { id: 'pamplona-barcelona', cities: ['pamplona', 'barcelona'], length: 2, color: 'gray', isTunnel: true },
  { id: 'pamplona-marseille', cities: ['pamplona', 'marseille'], length: 4, color: 'red' },
  
  // Madrid connections
  { id: 'madrid-lisboa', cities: ['madrid', 'lisboa'], length: 3, color: 'pink' },
  { id: 'madrid-cadiz', cities: ['madrid', 'cadiz'], length: 3, color: 'orange' },
  { id: 'madrid-barcelona', cities: ['madrid', 'barcelona'], length: 2, color: 'yellow' },
  
  // Lisboa connections
  { id: 'lisboa-cadiz', cities: ['lisboa', 'cadiz'], length: 2, color: 'blue' },
  
  // Barcelona connections
  { id: 'barcelona-marseille', cities: ['barcelona', 'marseille'], length: 4, color: 'gray' },
  
  // Marseille connections
  { id: 'marseille-zurich', cities: ['marseille', 'zurich'], length: 2, color: 'pink', isTunnel: true },
  { id: 'marseille-roma', cities: ['marseille', 'roma'], length: 4, color: 'gray', isTunnel: true },
  
  // Zurich connections
  { id: 'zurich-munchen', cities: ['zurich', 'munchen'], length: 2, color: 'yellow', isTunnel: true },
  { id: 'zurich-venezia', cities: ['zurich', 'venezia'], length: 2, color: 'green', isTunnel: true },
  
  // Frankfurt connections
  { id: 'frankfurt-essen', cities: ['frankfurt', 'essen'], length: 2, color: 'green' },
  { id: 'frankfurt-munchen', cities: ['frankfurt', 'munchen'], length: 2, color: 'pink' },
  { id: 'frankfurt-berlin-1', cities: ['frankfurt', 'berlin'], length: 3, color: 'black' },
  { id: 'frankfurt-berlin-2', cities: ['frankfurt', 'berlin'], length: 3, color: 'red', parallelRouteId: 'frankfurt-berlin-1' },
  
// Essen connections
  { id: 'essen-berlin-1', cities: ['essen', 'berlin'], length: 2, color: 'blue' },
  { id: 'essen-kobenhavn-1', cities: ['essen', 'kobenhavn'], length: 3, color: 'gray', ferryLocomotives: 1 },
  { id: 'essen-kobenhavn-2', cities: ['essen', 'kobenhavn'], length: 3, color: 'gray', ferryLocomotives: 1, parallelRouteId: 'essen-kobenhavn-1' },
  
  // Berlin connections
  { id: 'berlin-danzig', cities: ['berlin', 'danzig'], length: 4, color: 'gray' },
  { id: 'berlin-warszawa-1', cities: ['berlin', 'warszawa'], length: 4, color: 'yellow' },
  { id: 'berlin-warszawa-2', cities: ['berlin', 'warszawa'], length: 4, color: 'pink', parallelRouteId: 'berlin-warszawa-1' },
  { id: 'berlin-wien', cities: ['berlin', 'wien'], length: 3, color: 'green' },
  
  // København connections
  { id: 'kobenhavn-stockholm-1', cities: ['kobenhavn', 'stockholm'], length: 3, color: 'yellow' },
  { id: 'kobenhavn-stockholm-2', cities: ['kobenhavn', 'stockholm'], length: 3, color: 'white', parallelRouteId: 'kobenhavn-stockholm-1' },
  
  // Stockholm connections
  { id: 'stockholm-petrograd', cities: ['stockholm', 'petrograd'], length: 8, color: 'gray', isTunnel: true },
  
  // Petrograd connections
  { id: 'petrograd-riga', cities: ['petrograd', 'riga'], length: 4, color: 'gray' },
  { id: 'petrograd-moskva', cities: ['petrograd', 'moskva'], length: 4, color: 'white' },
  { id: 'petrograd-wilno', cities: ['petrograd', 'wilno'], length: 4, color: 'blue' },
  
  // Riga connections
  { id: 'riga-danzig', cities: ['riga', 'danzig'], length: 3, color: 'black' },
  { id: 'riga-wilno', cities: ['riga', 'wilno'], length: 4, color: 'green' },
  
  // Danzig connections
  { id: 'danzig-warszawa', cities: ['danzig', 'warszawa'], length: 2, color: 'gray' },
  
  // Wilno connections
  { id: 'wilno-warszawa', cities: ['wilno', 'warszawa'], length: 3, color: 'red' },
  { id: 'wilno-smolensk', cities: ['wilno', 'smolensk'], length: 3, color: 'yellow' },
  { id: 'wilno-kyiv', cities: ['wilno', 'kyiv'], length: 2, color: 'gray' },
  
  // Warszawa connections
  { id: 'warszawa-wien', cities: ['warszawa', 'wien'], length: 4, color: 'blue' },
  { id: 'warszawa-kyiv', cities: ['warszawa', 'kyiv'], length: 4, color: 'gray' },
  
  // Smolensk connections
  { id: 'smolensk-moskva', cities: ['smolensk', 'moskva'], length: 2, color: 'orange' },
  { id: 'smolensk-kyiv', cities: ['smolensk', 'kyiv'], length: 3, color: 'red' },
  
  // Moskva connections
  { id: 'moskva-kharkov', cities: ['moskva', 'kharkov'], length: 4, color: 'gray' },
  
  // Kyiv connections
  { id: 'kyiv-kharkov', cities: ['kyiv', 'kharkov'], length: 4, color: 'gray' },
  { id: 'kyiv-budapest', cities: ['kyiv', 'budapest'], length: 6, color: 'gray', isTunnel: true },
  { id: 'kyiv-bucuresti', cities: ['kyiv', 'bucuresti'], length: 4, color: 'gray' },
  
  // Kharkov connections
  { id: 'kharkov-rostov', cities: ['kharkov', 'rostov'], length: 2, color: 'green' },
  
  // Rostov connections
  { id: 'rostov-sevastopol', cities: ['rostov', 'sevastopol'], length: 4, color: 'gray' },
  { id: 'rostov-sochi', cities: ['rostov', 'sochi'], length: 2, color: 'gray' },
  
  // Sevastopol connections
  { id: 'sevastopol-sochi', cities: ['sevastopol', 'sochi'], length: 2, color: 'gray', ferryLocomotives: 2 },
  { id: 'sevastopol-bucuresti', cities: ['sevastopol', 'bucuresti'], length: 4, color: 'white' },
  { id: 'sevastopol-constantinople', cities: ['sevastopol', 'constantinople'], length: 4, color: 'gray', ferryLocomotives: 2 },
  
  // Sochi connections
  { id: 'sochi-erzurum', cities: ['sochi', 'erzurum'], length: 3, color: 'red', isTunnel: true },
  
  // Erzurum connections
  { id: 'erzurum-angora', cities: ['erzurum', 'angora'], length: 3, color: 'black' },
  { id: 'erzurum-sevastopol', cities: ['erzurum', 'sevastopol'], length: 4, color: 'gray', isTunnel: true },
  
  // Angora connections
  { id: 'angora-smyrna', cities: ['angora', 'smyrna'], length: 3, color: 'orange', isTunnel: true },
  { id: 'angora-constantinople-1', cities: ['angora', 'constantinople'], length: 2, color: 'gray', isTunnel: true },
  { id: 'angora-constantinople-2', cities: ['angora', 'constantinople'], length: 2, color: 'gray', isTunnel: true, parallelRouteId: 'angora-constantinople-1' },
  
  // Smyrna connections
  { id: 'smyrna-athina', cities: ['smyrna', 'athina'], length: 2, color: 'gray', ferryLocomotives: 1 },
  { id: 'smyrna-constantinople', cities: ['smyrna', 'constantinople'], length: 2, color: 'gray', isTunnel: true },
  
  // Constantinople connections
  { id: 'constantinople-sofia', cities: ['constantinople', 'sofia'], length: 3, color: 'blue' },
  { id: 'constantinople-bucuresti', cities: ['constantinople', 'bucuresti'], length: 3, color: 'yellow' },
  
  // Sofia connections
  { id: 'sofia-athina', cities: ['sofia', 'athina'], length: 3, color: 'pink' },
  { id: 'sofia-sarajevo', cities: ['sofia', 'sarajevo'], length: 2, color: 'gray', isTunnel: true },
  { id: 'sofia-bucuresti', cities: ['sofia', 'bucuresti'], length: 2, color: 'gray', isTunnel: true },
  
  // Athina connections
  { id: 'athina-brindisi', cities: ['athina', 'brindisi'], length: 4, color: 'gray', ferryLocomotives: 1 },
  
  // Bucuresti connections
  { id: 'bucuresti-budapest', cities: ['bucuresti', 'budapest'], length: 4, color: 'gray', isTunnel: true },
  
  // Budapest connections
  { id: 'budapest-wien-1', cities: ['budapest', 'wien'], length: 1, color: 'white' },
  { id: 'budapest-wien-2', cities: ['budapest', 'wien'], length: 1, color: 'red', parallelRouteId: 'budapest-wien-1' },
  { id: 'budapest-sarajevo', cities: ['budapest', 'sarajevo'], length: 3, color: 'pink' },
  { id: 'budapest-zagreb', cities: ['budapest', 'zagreb'], length: 2, color: 'orange' },
  
  // Wien connections
  { id: 'wien-munchen', cities: ['wien', 'munchen'], length: 3, color: 'orange' },
  { id: 'wien-zagreb', cities: ['wien', 'zagreb'], length: 2, color: 'gray' },
  
  // München connections
  { id: 'munchen-venezia', cities: ['munchen', 'venezia'], length: 2, color: 'blue', isTunnel: true },
  
  // Sarajevo connections
  { id: 'sarajevo-zagreb', cities: ['sarajevo', 'zagreb'], length: 3, color: 'red' },
  { id: 'sarajevo-athina', cities: ['sarajevo', 'athina'], length: 4, color: 'green' },
  
  // Zagreb connections
  { id: 'zagreb-venezia', cities: ['zagreb', 'venezia'], length: 2, color: 'gray' },
  
  // Venezia connections
  { id: 'venezia-roma', cities: ['venezia', 'roma'], length: 2, color: 'black' },
  
  // Roma connections
  { id: 'roma-brindisi', cities: ['roma', 'brindisi'], length: 2, color: 'white' },
  { id: 'roma-palermo', cities: ['roma', 'palermo'], length: 4, color: 'gray', ferryLocomotives: 1 },
  
  // Brindisi connections
  { id: 'brindisi-palermo', cities: ['brindisi', 'palermo'], length: 3, color: 'gray', ferryLocomotives: 1 },
  
  // Palermo connections
  { id: 'palermo-smyrna', cities: ['palermo', 'smyrna'], length: 6, color: 'gray', ferryLocomotives: 2 },
];

// Destination tickets (simplified set for first version)
export const DESTINATION_TICKETS: DestinationTicket[] = [
  { id: 'ticket-1', cities: ['lisboa', 'danzig'], points: 20, isLongRoute: true },
  { id: 'ticket-2', cities: ['brest', 'petrograd'], points: 20, isLongRoute: true },
  { id: 'ticket-3', cities: ['palermo', 'moskva'], points: 20, isLongRoute: true },
  { id: 'ticket-4', cities: ['cadiz', 'stockholm'], points: 21, isLongRoute: true },
  { id: 'ticket-5', cities: ['edinburgh', 'athina'], points: 21, isLongRoute: true },
  { id: 'ticket-6', cities: ['kobenhavn', 'erzurum'], points: 21, isLongRoute: true },
  { id: 'ticket-7', cities: ['amsterdam', 'pamplona'], points: 7 },
  { id: 'ticket-8', cities: ['zurich', 'brindisi'], points: 6 },
  { id: 'ticket-9', cities: ['zurich', 'budapest'], points: 6 },
  { id: 'ticket-10', cities: ['berlin', 'moskva'], points: 12 },
  { id: 'ticket-11', cities: ['berlin', 'bucuresti'], points: 8 },
  { id: 'ticket-12', cities: ['brest', 'marseille'], points: 7 },
  { id: 'ticket-13', cities: ['brest', 'venezia'], points: 8 },
  { id: 'ticket-14', cities: ['budapest', 'sofia'], points: 5 },
  { id: 'ticket-15', cities: ['edinburgh', 'paris'], points: 7 },
  { id: 'ticket-16', cities: ['frankfurt', 'kobenhavn'], points: 5 },
  { id: 'ticket-17', cities: ['kyiv', 'sochi'], points: 8 },
  { id: 'ticket-18', cities: ['london', 'berlin'], points: 7 },
  { id: 'ticket-19', cities: ['london', 'wien'], points: 10 },
  { id: 'ticket-20', cities: ['madrid', 'zurich'], points: 8 },
  { id: 'ticket-21', cities: ['marseille', 'essen'], points: 8 },
  { id: 'ticket-22', cities: ['paris', 'wien'], points: 8 },
  { id: 'ticket-23', cities: ['paris', 'zagreb'], points: 7 },
  { id: 'ticket-24', cities: ['riga', 'bucuresti'], points: 10 },
  { id: 'ticket-25', cities: ['roma', 'smyrna'], points: 8 },
  { id: 'ticket-26', cities: ['sarajevo', 'sevastopol'], points: 8 },
  { id: 'ticket-27', cities: ['smolensk', 'rostov'], points: 8 },
  { id: 'ticket-28', cities: ['sofia', 'smyrna'], points: 5 },
  { id: 'ticket-29', cities: ['stockholm', 'wien'], points: 11 },
  { id: 'ticket-30', cities: ['venezia', 'constantinople'], points: 10 },
  { id: 'ticket-31', cities: ['warszawa', 'smolensk'], points: 6 },
  { id: 'ticket-32', cities: ['zageb', 'brindisi'], points: 6 },
  { id: 'ticket-33', cities: ['athina', 'angora'], points: 5 },
  { id: 'ticket-34', cities: ['athina', 'wilno'], points: 11 },
  { id: 'ticket-35', cities: ['barcelona', 'bruxelles'], points: 8 },
  { id: 'ticket-36', cities: ['barcelona', 'munchen'], points: 8 },
];

// Train card distribution (110 cards: 12 of each color + 14 locomotives)
export function createTrainCardDeck(): string[] {
  const colors: string[] = ['red', 'blue', 'green', 'yellow', 'orange', 'pink', 'white', 'black'];
  const deck: string[] = [];
  
  // 12 of each color
  colors.forEach(color => {
    for (let i = 0; i < 12; i++) {
      deck.push(color);
    }
  });
  
  // 14 locomotives
  for (let i = 0; i < 14; i++) {
    deck.push('locomotive');
  }
  
  return deck;
}

// Shuffle array using Fisher-Yates algorithm
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Route wagon positions - calibrated positions for each route
export const ROUTE_WAGON_POSITIONS: Record<string, { x: number; y: number; angle: number }[]> = {
  'edinburgh-london-1': [{ x: 138, y: 66, angle: 68 }, { x: 149, y: 91, angle: 68 }, { x: 160, y: 119, angle: 68 }, { x: 172, y: 146, angle: 68 }],
  'edinburgh-london-2': [{ x: 125, y: 70, angle: 68 }, { x: 136, y: 97, angle: 68 }, { x: 147, y: 123, angle: 68 }, { x: 159, y: 150, angle: 68 }],
  'london-dieppe-2': [{ x: 164, y: 185, angle: 97 }, { x: 161, y: 213, angle: 97 }],
  'dieppe-brest': [{ x: 144, y: 235, angle: 180 }, { x: 112, y: 244, angle: 153 }],
  'madrid-lisboa': [{ x: 62, y: 442, angle: -135 }, { x: 33, y: 432, angle: 173 }, { x: 23, y: 453, angle: 90 }],
  'brest-paris': [{ x: 119, y: 262, angle: 6 }, { x: 147, y: 265, angle: 6 }, { x: 175, y: 268, angle: 6 }],
  'brest-pamplona': [{ x: 115, y: 277, angle: 30 }, { x: 138, y: 295, angle: 65 }, { x: 150, y: 321, angle: 84 }, { x: 150, y: 350, angle: 90 }],
  'london-dieppe-1': [{ x: 176, y: 188, angle: 97 }, { x: 174, y: 215, angle: 97 }],
  'bruxelles-dieppe': [{ x: 212, y: 211, angle: 153 }, { x: 189, y: 228, angle: 135 }],
  'london-amsterdam': [{ x: 195, y: 166, angle: 1 }, { x: 225, y: 167, angle: 1 }],
  'amsterdam-essen': [{ x: 254, y: 148, angle: -74 }, { x: 273, y: 146, angle: 8 }, { x: 299, y: 158, angle: 58 }],
  'essen-kobenhavn-1': [{ x: 320, y: 155, angle: -56 }, { x: 335, y: 130, angle: -56 }, { x: 353, y: 105, angle: -56 }],
  'essen-kobenhavn-2': [{ x: 331, y: 161, angle: -56 }, { x: 346, y: 137, angle: -56 }, { x: 363, y: 112, angle: -56 }],
  'essen-berlin-1': [{ x: 340, y: 175, angle: 8 }, { x: 367, y: 177, angle: 8 }],
  'bruxelles-paris-2': [{ x: 221, y: 224, angle: 114 }, { x: 209, y: 249, angle: 111 }],
  'paris-frankfurt-2': [{ x: 263, y: 266, angle: -24 }, { x: 238, y: 278, angle: -24 }, { x: 289, y: 250, angle: -34 }],
  'paris-frankfurt-1': [{ x: 232, y: 268, angle: -24 }, { x: 258, y: 253, angle: -24 }, { x: 281, y: 238, angle: -37 }],
  'bruxelles-paris-1': [{ x: 233, y: 229, angle: 111 }, { x: 221, y: 255, angle: 111 }],
  'amsterdam-frankfurt': [{ x: 267, y: 185, angle: 51 }, { x: 287, y: 204, angle: 51 }],
  'bruxelles-frankfurt': [{ x: 255, y: 206, angle: -18 }, { x: 280, y: 215, angle: 51 }],
  'paris-zurich': [{ x: 225, y: 296, angle: 63 }, { x: 246, y: 315, angle: 27 }, { x: 274, y: 322, angle: 0 }],
  'paris-marseille': [{ x: 221, y: 330, angle: 60 }, { x: 212, y: 305, angle: 82 }, { x: 241, y: 348, angle: 37 }, { x: 262, y: 367, angle: 60 }],
  'paris-pamplona-2': [{ x: 187, y: 290, angle: 99 }, { x: 181, y: 318, angle: 113 }, { x: 171, y: 345, angle: 113 }, { x: 157, y: 371, angle: 127 }],
  'paris-pamplona-1': [{ x: 199, y: 292, angle: 101 }, { x: 193, y: 322, angle: 104 }, { x: 183, y: 350, angle: 113 }, { x: 170, y: 377, angle: 127 }],
  'pamplona-marseille': [{ x: 177, y: 400, angle: 9 }, { x: 194, y: 383, angle: -63 }, { x: 218, y: 370, angle: -1 }, { x: 246, y: 375, angle: 27 }],
  'pamplona-madrid-2': [{ x: 128, y: 397, angle: 140 }, { x: 107, y: 413, angle: 140 }, { x: 87, y: 434, angle: 129 }],
  'madrid-cadiz': [{ x: 95, y: 471, angle: 51 }, { x: 110, y: 495, angle: 68 }, { x: 95, y: 511, angle: 153 }],
  'madrid-barcelona': [{ x: 113, y: 462, angle: 0 }, { x: 140, y: 462, angle: 6 }],
  'lisboa-cadiz': [{ x: 34, y: 492, angle: 63 }, { x: 56, y: 511, angle: 0 }],
  'pamplona-madrid-1': [{ x: 137, y: 406, angle: 140 }, { x: 117, y: 425, angle: 140 }, { x: 98, y: 444, angle: 140 }],
  'barcelona-marseille': [{ x: 181, y: 449, angle: -50 }, { x: 202, y: 426, angle: -35 }, { x: 223, y: 411, angle: -35 }, { x: 249, y: 398, angle: -22 }],
  'marseille-zurich': [{ x: 283, y: 365, angle: -74 }, { x: 291, y: 338, angle: -74 }],
  'marseille-roma': [{ x: 295, y: 379, angle: -37 }, { x: 318, y: 362, angle: -32 }, { x: 337, y: 373, angle: 58 }, { x: 353, y: 395, angle: 53 }],
  'venezia-roma': [{ x: 363, y: 361, angle: 84 }, { x: 369, y: 388, angle: 74 }],
  'kobenhavn-stockholm-1': [{ x: 382, y: 75, angle: -45 }, { x: 403, y: 56, angle: -37 }, { x: 426, y: 37, angle: -27 }],
  'kobenhavn-stockholm-2': [{ x: 391, y: 85, angle: -45 }, { x: 412, y: 65, angle: -37 }, { x: 434, y: 49, angle: -32 }],
  'stockholm-petrograd': [{ x: 466, y: 49, angle: 60 }, { x: 487, y: 45, angle: -39 }, { x: 513, y: 34, angle: 5 }, { x: 542, y: 35, angle: 5 }, { x: 571, y: 35, angle: 5 }, { x: 601, y: 35, angle: 5 }, { x: 629, y: 35, angle: 5 }, { x: 657, y: 38, angle: 21 }],
  'petrograd-riga': [{ x: 655, y: 56, angle: 179 }, { x: 627, y: 56, angle: 179 }, { x: 598, y: 57, angle: 179 }, { x: 571, y: 57, angle: 179 }],
  'petrograd-moskva': [{ x: 700, y: 60, angle: 21 }, { x: 725, y: 74, angle: 51 }, { x: 744, y: 95, angle: 63 }, { x: 754, y: 124, angle: 84 }],
  'moskva-kharkov': [{ x: 767, y: 165, angle: 59 }, { x: 775, y: 193, angle: 90 }, { x: 774, y: 223, angle: 104 }, { x: 760, y: 249, angle: 135 }],
  'smolensk-moskva': [{ x: 712, y: 167, angle: 8 }, { x: 739, y: 160, angle: -37 }],
  'riga-danzig': [{ x: 524, y: 62, angle: 164 }, { x: 499, y: 80, angle: 133 }, { x: 487, y: 108, angle: 112 }],
  'berlin-danzig': [{ x: 397, y: 162, angle: -82 }, { x: 407, y: 135, angle: -60 }, { x: 433, y: 118, angle: -9 }, { x: 463, y: 119, angle: 18 }],
  'berlin-warszawa-1': [{ x: 413, y: 178, angle: -22 }, { x: 441, y: 172, angle: -3 }, { x: 471, y: 171, angle: -3 }, { x: 499, y: 171, angle: 14 }],
  'danzig-warszawa': [{ x: 499, y: 137, angle: 30 }, { x: 518, y: 161, angle: 79 }],
  'berlin-warszawa-2': [{ x: 415, y: 192, angle: -16 }, { x: 441, y: 186, angle: -3 }, { x: 470, y: 184, angle: -3 }, { x: 497, y: 184, angle: 8 }],
  'wilno-warszawa': [{ x: 586, y: 154, angle: 37 }, { x: 557, y: 147, angle: -5 }, { x: 534, y: 165, angle: -63 }],
  'riga-wilno': [{ x: 546, y: 76, angle: 104 }, { x: 548, y: 105, angle: 60 }, { x: 569, y: 128, angle: 40 }, { x: 591, y: 143, angle: 34 }],
  'frankfurt-munchen': [{ x: 310, y: 253, angle: 69 }, { x: 324, y: 268, angle: -22 }],
  'zurich-munchen': [{ x: 308, y: 303, angle: -43 }, { x: 328, y: 284, angle: -43 }],
  'munchen-venezia': [{ x: 350, y: 291, angle: 81 }, { x: 356, y: 321, angle: 81 }],
  'zurich-venezia': [{ x: 314, y: 327, angle: 19 }, { x: 339, y: 337, angle: 19 }],
  'wien-munchen': [{ x: 415, y: 286, angle: -37 }, { x: 388, y: 295, angle: -171 }, { x: 363, y: 283, angle: -133 }],
  'zagreb-venezia': [{ x: 408, y: 340, angle: -135 }, { x: 382, y: 337, angle: 158 }],
  'roma-brindisi': [{ x: 392, y: 406, angle: -6 }, { x: 419, y: 415, angle: 53 }],
  'roma-palermo': [{ x: 384, y: 423, angle: 25 }, { x: 407, y: 440, angle: 45 }, { x: 418, y: 466, angle: 101 }, { x: 406, y: 494, angle: 130 }],
  'brindisi-palermo': [{ x: 440, y: 459, angle: 72 }, { x: 433, y: 482, angle: 135 }, { x: 416, y: 501, angle: 121 }],
  'athina-brindisi': [{ x: 510, y: 498, angle: 175 }, { x: 479, y: 495, angle: -147 }, { x: 461, y: 474, angle: -113 }, { x: 449, y: 449, angle: -118 }],
  'sarajevo-athina': [{ x: 492, y: 417, angle: -90 }, { x: 491, y: 444, angle: 90 }, { x: 490, y: 476, angle: 90 }, { x: 510, y: 485, angle: 0 }],
  'sofia-sarajevo': [{ x: 536, y: 387, angle: 54 }, { x: 513, y: 386, angle: -27 }],
  'sarajevo-zagreb': [{ x: 471, y: 401, angle: 163 }, { x: 445, y: 397, angle: -145 }, { x: 430, y: 372, angle: -90 }],
  'sofia-athina': [{ x: 532, y: 418, angle: 140 }, { x: 519, y: 444, angle: 99 }, { x: 524, y: 471, angle: 54 }],
  'smyrna-athina': [{ x: 580, y: 497, angle: -164 }, { x: 550, y: 489, angle: 169 }],
  'smyrna-constantinople': [{ x: 607, y: 494, angle: -62 }, { x: 621, y: 469, angle: -62 }],
  'constantinople-sofia': [{ x: 613, y: 439, angle: -152 }, { x: 590, y: 429, angle: -152 }, { x: 567, y: 415, angle: -152 }],
  'constantinople-bucuresti': [{ x: 625, y: 425, angle: -113 }, { x: 615, y: 401, angle: -113 }, { x: 604, y: 377, angle: -113 }],
  'sevastopol-constantinople': [{ x: 692, y: 386, angle: 90 }, { x: 682, y: 413, angle: 128 }, { x: 665, y: 425, angle: -146 }, { x: 646, y: 434, angle: 128 }],
  'erzurum-sevastopol': [{ x: 735, y: 461, angle: -148 }, { x: 717, y: 440, angle: -116 }, { x: 707, y: 413, angle: -99 }, { x: 705, y: 387, angle: -90 }],
  'erzurum-angora': [{ x: 760, y: 496, angle: 77 }, { x: 742, y: 507, angle: 163 }, { x: 716, y: 504, angle: -150 }],
  'smolensk-kyiv': [{ x: 695, y: 186, angle: 68 }, { x: 688, y: 211, angle: 133 }, { x: 662, y: 223, angle: -171 }],
  'wilno-kyiv': [{ x: 626, y: 177, angle: 34 }, { x: 641, y: 201, angle: 90 }],
  'wilno-smolensk': [{ x: 627, y: 148, angle: -52 }, { x: 645, y: 136, angle: 41 }, { x: 670, y: 154, angle: 40 }],
  'warszawa-wien': [{ x: 513, y: 202, angle: 130 }, { x: 496, y: 226, angle: 130 }, { x: 477, y: 248, angle: 143 }, { x: 455, y: 264, angle: 141 }],
  'wien-zagreb': [{ x: 429, y: 300, angle: 99 }, { x: 430, y: 332, angle: 99 }],
  'budapest-wien-1': [{ x: 450, y: 296, angle: -148 }],
  'budapest-wien-2': [{ x: 458, y: 285, angle: -153 }],
  'warszawa-kyiv': [{ x: 535, y: 195, angle: 45 }, { x: 557, y: 211, angle: 21 }, { x: 586, y: 215, angle: 0 }, { x: 614, y: 216, angle: 4 }],
  'kyiv-budapest': [{ x: 612, y: 228, angle: 180 }, { x: 588, y: 230, angle: 180 }, { x: 559, y: 235, angle: 155 }, { x: 535, y: 247, angle: 155 }, { x: 508, y: 260, angle: 153 }, { x: 487, y: 280, angle: 135 }],
  'kyiv-bucuresti': [{ x: 624, y: 246, angle: 108 }, { x: 615, y: 273, angle: 108 }, { x: 606, y: 301, angle: 108 }, { x: 596, y: 328, angle: 108 }],
  'sevastopol-bucuresti': [{ x: 688, y: 346, angle: -124 }, { x: 665, y: 330, angle: -158 }, { x: 635, y: 325, angle: 162 }, { x: 608, y: 341, angle: 135 }],
  'kyiv-kharkov': [{ x: 647, y: 244, angle: 69 }, { x: 662, y: 264, angle: 39 }, { x: 693, y: 275, angle: 0 }, { x: 721, y: 271, angle: -13 }],
  'rostov-sevastopol': [{ x: 755, y: 301, angle: -172 }, { x: 725, y: 297, angle: -169 }, { x: 713, y: 319, angle: 96 }, { x: 710, y: 344, angle: 104 }],
  'kharkov-rostov': [{ x: 766, y: 265, angle: 0 }, { x: 776, y: 283, angle: 97 }],
  'rostov-sochi': [{ x: 774, y: 327, angle: 93 }, { x: 773, y: 353, angle: 93 }],
  'sevastopol-sochi': [{ x: 724, y: 368, angle: 10 }, { x: 752, y: 373, angle: 10 }],
  'angora-smyrna': [{ x: 679, y: 506, angle: -27 }, { x: 649, y: 513, angle: -8 }, { x: 622, y: 514, angle: 0 }],
  'angora-constantinople-1': [{ x: 669, y: 488, angle: -145 }, { x: 646, y: 474, angle: -145 }],
  'angora-constantinople-2': [{ x: 677, y: 477, angle: -145 }, { x: 654, y: 463, angle: -145 }],
  'frankfurt-berlin-2': [{ x: 326, y: 231, angle: -25 }, { x: 351, y: 220, angle: -25 }, { x: 377, y: 208, angle: -25 }],
  'frankfurt-berlin-1': [{ x: 321, y: 220, angle: -25 }, { x: 346, y: 208, angle: -25 }, { x: 372, y: 195, angle: -25 }],
  'frankfurt-essen': [{ x: 314, y: 211, angle: -37 }, { x: 329, y: 195, angle: -114 }],
  'petrograd-wilno': [{ x: 667, y: 73, angle: 122 }, { x: 651, y: 97, angle: 130 }, { x: 633, y: 119, angle: 122 }, { x: 618, y: 138, angle: 122 }],
  'palermo-smyrna': [{ x: 430, y: 514, angle: 0 }, { x: 460, y: 514, angle: 0 }, { x: 489, y: 515, angle: 0 }, { x: 517, y: 515, angle: 0 }, { x: 547, y: 516, angle: 0 }, { x: 576, y: 514, angle: 0 }],
};
