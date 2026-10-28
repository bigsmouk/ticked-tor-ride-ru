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
  { id: 'london-dieppe-1', cities: ['london', 'dieppe'], length: 2, color: 'gray', ferryLocomotives: 1, parallelRouteId: 'london-dieppe-2' },
  { id: 'london-dieppe-2', cities: ['london', 'dieppe'], length: 2, color: 'gray', ferryLocomotives: 1, parallelRouteId: 'london-dieppe-1' },
  
  // Amsterdam connections
  { id: 'amsterdam-bruxelles', cities: ['amsterdam', 'bruxelles'], length: 1, color: 'black' },
  { id: 'amsterdam-essen', cities: ['amsterdam', 'essen'], length: 3, color: 'yellow' },
  { id: 'amsterdam-frankfurt', cities: ['amsterdam', 'frankfurt'], length: 2, color: 'white' },
  
  // Bruxelles connections
  { id: 'bruxelles-dieppe', cities: ['bruxelles', 'dieppe'], length: 2, color: 'green' },
  { id: 'bruxelles-paris-1', cities: ['bruxelles', 'paris'], length: 2, color: 'yellow', parallelRouteId: 'bruxelles-paris-2' },
  { id: 'bruxelles-paris-2', cities: ['bruxelles', 'paris'], length: 2, color: 'red', parallelRouteId: 'bruxelles-paris-1' },
  { id: 'bruxelles-frankfurt', cities: ['bruxelles', 'frankfurt'], length: 2, color: 'blue' },
  
  // Dieppe connections
  { id: 'dieppe-brest', cities: ['dieppe', 'brest'], length: 2, color: 'orange' },
  { id: 'dieppe-paris', cities: ['dieppe', 'paris'], length: 1, color: 'pink' },
  
  // Brest connections
  { id: 'brest-paris', cities: ['brest', 'paris'], length: 3, color: 'black' },
  { id: 'brest-pamplona', cities: ['brest', 'pamplona'], length: 4, color: 'pink' },
  
  // Paris connections
  { id: 'paris-pamplona-1', cities: ['paris', 'pamplona'], length: 4, color: 'blue', parallelRouteId: 'paris-pamplona-2' },
  { id: 'paris-pamplona-2', cities: ['paris', 'pamplona'], length: 4, color: 'green', parallelRouteId: 'paris-pamplona-1' },
  { id: 'paris-zurich', cities: ['paris', 'zurich'], length: 3, color: 'gray', isTunnel: true },
  { id: 'paris-marseille', cities: ['paris', 'marseille'], length: 4, color: 'gray' },
  { id: 'paris-frankfurt-1', cities: ['paris', 'frankfurt'], length: 3, color: 'white', parallelRouteId: 'paris-frankfurt-2' },
  { id: 'paris-frankfurt-2', cities: ['paris', 'frankfurt'], length: 3, color: 'orange', parallelRouteId: 'paris-frankfurt-1' },
  
  // Pamplona connections
  { id: 'pamplona-madrid-1', cities: ['pamplona', 'madrid'], length: 3, color: 'black', isTunnel: true, parallelRouteId: 'pamplona-madrid-2' },
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
  { id: 'frankfurt-berlin-1', cities: ['frankfurt', 'berlin'], length: 3, color: 'black', parallelRouteId: 'frankfurt-berlin-2' },
  { id: 'frankfurt-berlin-2', cities: ['frankfurt', 'berlin'], length: 3, color: 'red', parallelRouteId: 'frankfurt-berlin-1' },
  
// Essen connections
  { id: 'essen-berlin-1', cities: ['essen', 'berlin'], length: 2, color: 'blue' },
  { id: 'essen-kobenhavn-1', cities: ['essen', 'kobenhavn'], length: 3, color: 'gray', ferryLocomotives: 1, parallelRouteId: 'essen-kobenhavn-2' },
  { id: 'essen-kobenhavn-2', cities: ['essen', 'kobenhavn'], length: 3, color: 'gray', ferryLocomotives: 1, parallelRouteId: 'essen-kobenhavn-1' },
  
  // Berlin connections
  { id: 'berlin-danzig', cities: ['berlin', 'danzig'], length: 4, color: 'gray' },
  { id: 'berlin-warszawa-1', cities: ['berlin', 'warszawa'], length: 4, color: 'yellow', parallelRouteId: 'berlin-warszawa-2' },
  { id: 'berlin-warszawa-2', cities: ['berlin', 'warszawa'], length: 4, color: 'pink', parallelRouteId: 'berlin-warszawa-1' },
  { id: 'berlin-wien', cities: ['berlin', 'wien'], length: 3, color: 'green' },
  
  // København connections
  { id: 'kobenhavn-stockholm-1', cities: ['kobenhavn', 'stockholm'], length: 3, color: 'yellow', parallelRouteId: 'kobenhavn-stockholm-2' },
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
  { id: 'angora-constantinople-1', cities: ['angora', 'constantinople'], length: 2, color: 'gray', isTunnel: true, parallelRouteId: 'angora-constantinople-2' },
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
  { id: 'budapest-wien-1', cities: ['budapest', 'wien'], length: 1, color: 'white', parallelRouteId: 'budapest-wien-2' },
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
  { id: 'ticket-32', cities: ['zagreb', 'brindisi'], points: 6 },
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

// Route wagon positions - paste into europeMap.ts
export const ROUTE_WAGON_POSITIONS: Record<string, { x: number; y: number; angle: number }[]> = {
  'edinburgh-london-1': [{ x: 159, y: 74, angle: 68 }, { x: 168, y: 98, angle: 68 }, { x: 177, y: 123, angle: 68 }, { x: 187, y: 144, angle: 68 }],
  'edinburgh-london-2': [{ x: 145, y: 79, angle: 68 }, { x: 155, y: 103, angle: 68 }, { x: 165, y: 127, angle: 68 }, { x: 173, y: 151, angle: 68 }],
  'london-dieppe-2': [{ x: 172, y: 214, angle: 97 }, { x: 177, y: 183, angle: 97 }],
  'dieppe-brest': [{ x: 159, y: 233, angle: 180 }, { x: 132, y: 240, angle: 153 }],
  'madrid-lisboa': [{ x: 71, y: 433, angle: -135 }, { x: 45, y: 426, angle: 173 }, { x: 33, y: 444, angle: 90 }],
  'brest-paris': [{ x: 135, y: 261, angle: 6 }, { x: 160, y: 264, angle: 6 }, { x: 186, y: 268, angle: 6 }],
  'brest-pamplona': [{ x: 127, y: 273, angle: 30 }, { x: 150, y: 287, angle: 65 }, { x: 161, y: 311, angle: 84 }, { x: 163, y: 341, angle: 90 }],
  'london-dieppe-1': [{ x: 187, y: 214, angle: 97 }, { x: 190, y: 187, angle: 97 }],
  'bruxelles-dieppe': [{ x: 224, y: 213, angle: 153 }, { x: 200, y: 226, angle: 135 }],
  'london-amsterdam': [{ x: 210, y: 167, angle: 1 }, { x: 239, y: 169, angle: 1 }],
  'amsterdam-essen': [{ x: 266, y: 151, angle: -74 }, { x: 288, y: 147, angle: 8 }, { x: 310, y: 165, angle: 58 }],
  'essen-kobenhavn-1': [{ x: 328, y: 157, angle: -56 }, { x: 344, y: 133, angle: -56 }, { x: 362, y: 110, angle: -56 }],
  'essen-kobenhavn-2': [{ x: 341, y: 162, angle: -56 }, { x: 356, y: 141, angle: -56 }, { x: 373, y: 116, angle: -56 }],
  'essen-berlin-1': [{ x: 349, y: 182, angle: 8 }, { x: 379, y: 183, angle: 8 }],
  'bruxelles-paris-2': [{ x: 247, y: 231, angle: 114 }, { x: 237, y: 249, angle: 111 }],
  'paris-frankfurt-2': [{ x: 272, y: 265, angle: -24 }, { x: 243, y: 275, angle: -24 }, { x: 295, y: 250, angle: -34 }],
  'paris-frankfurt-1': [{ x: 242, y: 263, angle: -24 }, { x: 265, y: 253, angle: -24 }, { x: 288, y: 239, angle: -37 }],
  'bruxelles-paris-1': [{ x: 233, y: 223, angle: 111 }, { x: 220, y: 246, angle: 111 }],
  'amsterdam-frankfurt': [{ x: 278, y: 190, angle: 51 }, { x: 298, y: 208, angle: 51 }],
  'bruxelles-frankfurt': [{ x: 262, y: 206, angle: -18 }, { x: 287, y: 215, angle: 51 }],
  'paris-zurich': [{ x: 238, y: 296, angle: 63 }, { x: 257, y: 313, angle: 27 }, { x: 283, y: 318, angle: 0 }],
  'paris-marseille': [{ x: 231, y: 323, angle: 60 }, { x: 221, y: 300, angle: 82 }, { x: 252, y: 341, angle: 37 }, { x: 272, y: 358, angle: 60 }],
  'paris-pamplona-2': [{ x: 204, y: 322, angle: 99 }, { x: 210, y: 295, angle: 113 }, { x: 199, y: 344, angle: 113 }, { x: 184, y: 367, angle: 127 }],
  'paris-pamplona-1': [{ x: 201, y: 290, angle: 101 }, { x: 191, y: 316, angle: 104 }, { x: 181, y: 340, angle: 113 }, { x: 171, y: 363, angle: 127 }],
  'pamplona-marseille': [{ x: 187, y: 392, angle: 9 }, { x: 204, y: 376, angle: -63 }, { x: 226, y: 362, angle: -1 }, { x: 253, y: 367, angle: 27 }],
  'pamplona-madrid-2': [{ x: 143, y: 390, angle: 140 }, { x: 121, y: 407, angle: 140 }, { x: 100, y: 424, angle: 129 }],
  'madrid-cadiz': [{ x: 105, y: 460, angle: 51 }, { x: 122, y: 480, angle: 68 }, { x: 106, y: 494, angle: 153 }],
  'madrid-barcelona': [{ x: 123, y: 449, angle: 0 }, { x: 150, y: 450, angle: 6 }],
  'lisboa-cadiz': [{ x: 37, y: 476, angle: 63 }, { x: 60, y: 492, angle: 0 }],
  'pamplona-madrid-1': [{ x: 150, y: 400, angle: 140 }, { x: 130, y: 418, angle: 140 }, { x: 112, y: 433, angle: 140 }],
  'barcelona-marseille': [{ x: 195, y: 435, angle: -50 }, { x: 216, y: 412, angle: -35 }, { x: 236, y: 400, angle: -35 }, { x: 262, y: 387, angle: -22 }],
  'marseille-zurich': [{ x: 297, y: 359, angle: -74 }, { x: 304, y: 334, angle: -74 }],
  'marseille-roma': [{ x: 303, y: 377, angle: -37 }, { x: 325, y: 357, angle: -32 }, { x: 344, y: 368, angle: 58 }, { x: 358, y: 389, angle: 53 }],
  'venezia-roma': [{ x: 372, y: 359, angle: 84 }, { x: 378, y: 385, angle: 74 }],
  'kobenhavn-stockholm-1': [{ x: 390, y: 74, angle: -45 }, { x: 413, y: 56, angle: -37 }, { x: 443, y: 41, angle: -20 }],
  'kobenhavn-stockholm-2': [{ x: 398, y: 86, angle: -45 }, { x: 416, y: 68, angle: -37 }, { x: 444, y: 52, angle: -18 }],
  'stockholm-petrograd': [{ x: 477, y: 60, angle: 60 }, { x: 498, y: 53, angle: -39 }, { x: 527, y: 45, angle: 5 }, { x: 556, y: 45, angle: 5 }, { x: 580, y: 43, angle: 5 }, { x: 606, y: 43, angle: 5 }, { x: 629, y: 43, angle: 5 }, { x: 659, y: 46, angle: 21 }],
  'petrograd-riga': [{ x: 655, y: 61, angle: 179 }, { x: 626, y: 62, angle: 179 }, { x: 601, y: 62, angle: 179 }, { x: 574, y: 63, angle: 179 }],
  'petrograd-moskva': [{ x: 695, y: 67, angle: 21 }, { x: 720, y: 83, angle: 51 }, { x: 739, y: 103, angle: 63 }, { x: 746, y: 128, angle: 84 }],
  'moskva-kharkov': [{ x: 759, y: 164, angle: 59 }, { x: 765, y: 193, angle: 90 }, { x: 765, y: 217, angle: 104 }, { x: 754, y: 242, angle: 135 }],
  'smolensk-moskva': [{ x: 708, y: 169, angle: 8 }, { x: 731, y: 161, angle: -37 }],
  'riga-danzig': [{ x: 532, y: 67, angle: 164 }, { x: 511, y: 83, angle: 133 }, { x: 497, y: 108, angle: 112 }],
  'berlin-danzig': [{ x: 411, y: 162, angle: -82 }, { x: 420, y: 139, angle: -60 }, { x: 441, y: 124, angle: -9 }, { x: 469, y: 123, angle: 18 }],
  'berlin-warszawa-1': [{ x: 422, y: 179, angle: -22 }, { x: 447, y: 174, angle: -3 }, { x: 472, y: 171, angle: -3 }, { x: 503, y: 173, angle: 14 }],
  'danzig-warszawa': [{ x: 509, y: 137, angle: 30 }, { x: 523, y: 158, angle: 79 }],
  'berlin-warszawa-2': [{ x: 424, y: 192, angle: -16 }, { x: 450, y: 187, angle: -3 }, { x: 472, y: 186, angle: -3 }, { x: 501, y: 186, angle: 8 }],
  'wilno-warszawa': [{ x: 586, y: 154, angle: 37 }, { x: 557, y: 147, angle: -5 }, { x: 539, y: 166, angle: -63 }],
  'riga-wilno': [{ x: 551, y: 80, angle: 104 }, { x: 552, y: 109, angle: 60 }, { x: 569, y: 128, angle: 40 }, { x: 591, y: 143, angle: 34 }],
  'frankfurt-munchen': [{ x: 319, y: 254, angle: 69 }, { x: 333, y: 266, angle: -22 }],
  'zurich-munchen': [{ x: 323, y: 297, angle: -43 }, { x: 339, y: 279, angle: -43 }],
  'munchen-venezia': [{ x: 361, y: 286, angle: 81 }, { x: 363, y: 314, angle: 81 }],
  'zurich-venezia': [{ x: 323, y: 322, angle: 19 }, { x: 348, y: 335, angle: 19 }],
  'wien-munchen': [{ x: 422, y: 289, angle: -37 }, { x: 393, y: 293, angle: -171 }, { x: 371, y: 278, angle: -133 }],
  'zagreb-venezia': [{ x: 411, y: 334, angle: -135 }, { x: 388, y: 332, angle: 158 }],
  'roma-brindisi': [{ x: 399, y: 399, angle: -6 }, { x: 424, y: 408, angle: 53 }],
  'roma-palermo': [{ x: 392, y: 420, angle: 25 }, { x: 413, y: 433, angle: 45 }, { x: 420, y: 459, angle: 101 }, { x: 412, y: 480, angle: 130 }],
  'brindisi-palermo': [{ x: 442, y: 450, angle: 72 }, { x: 439, y: 475, angle: 135 }, { x: 423, y: 491, angle: 121 }],
  'athina-brindisi': [{ x: 511, y: 488, angle: 175 }, { x: 483, y: 485, angle: -147 }, { x: 465, y: 464, angle: -113 }, { x: 455, y: 439, angle: -118 }],
  'sarajevo-athina': [{ x: 492, y: 417, angle: -90 }, { x: 491, y: 444, angle: 90 }, { x: 492, y: 462, angle: 90 }, { x: 511, y: 474, angle: 0 }],
  'sofia-sarajevo': [{ x: 537, y: 382, angle: 54 }, { x: 513, y: 386, angle: -27 }],
  'sarajevo-zagreb': [{ x: 474, y: 395, angle: 163 }, { x: 447, y: 389, angle: -145 }, { x: 436, y: 368, angle: -90 }],
  'sofia-athina': [{ x: 532, y: 418, angle: 140 }, { x: 519, y: 444, angle: 99 }, { x: 524, y: 471, angle: 54 }],
  'smyrna-athina': [{ x: 580, y: 487, angle: -164 }, { x: 556, y: 481, angle: 169 }],
  'smyrna-constantinople': [{ x: 610, y: 480, angle: -62 }, { x: 620, y: 460, angle: -62 }],
  'constantinople-sofia': [{ x: 612, y: 431, angle: -152 }, { x: 588, y: 421, angle: -152 }, { x: 566, y: 412, angle: -152 }],
  'constantinople-bucuresti': [{ x: 623, y: 416, angle: -113 }, { x: 614, y: 393, angle: -113 }, { x: 605, y: 370, angle: -113 }],
  'sevastopol-constantinople': [{ x: 692, y: 386, angle: 90 }, { x: 682, y: 413, angle: 128 }, { x: 666, y: 417, angle: -146 }, { x: 647, y: 423, angle: 128 }],
  'erzurum-sevastopol': [{ x: 736, y: 452, angle: -148 }, { x: 718, y: 435, angle: -116 }, { x: 707, y: 413, angle: -99 }, { x: 705, y: 387, angle: -90 }],
  'erzurum-angora': [{ x: 763, y: 490, angle: 77 }, { x: 745, y: 501, angle: 180 }, { x: 709, y: 496, angle: -150 }],
  'smolensk-kyiv': [{ x: 695, y: 186, angle: 68 }, { x: 688, y: 211, angle: 133 }, { x: 662, y: 223, angle: -171 }],
  'wilno-kyiv': [{ x: 626, y: 177, angle: 34 }, { x: 641, y: 201, angle: 90 }],
  'wilno-smolensk': [{ x: 629, y: 149, angle: -52 }, { x: 646, y: 139, angle: 41 }, { x: 668, y: 157, angle: 40 }],
  'warszawa-wien': [{ x: 514, y: 205, angle: 130 }, { x: 502, y: 229, angle: 130 }, { x: 484, y: 246, angle: 143 }, { x: 462, y: 262, angle: 141 }],
  'wien-zagreb': [{ x: 437, y: 298, angle: 99 }, { x: 433, y: 325, angle: 99 }],
  'budapest-wien-1': [{ x: 458, y: 295, angle: -148 }],
  'budapest-wien-2': [{ x: 464, y: 283, angle: -153 }],
  'warszawa-kyiv': [{ x: 535, y: 195, angle: 45 }, { x: 557, y: 211, angle: 21 }, { x: 586, y: 215, angle: 0 }, { x: 614, y: 216, angle: 4 }],
  'kyiv-budapest': [{ x: 612, y: 228, angle: 180 }, { x: 588, y: 230, angle: 180 }, { x: 559, y: 235, angle: 155 }, { x: 535, y: 247, angle: 155 }, { x: 508, y: 260, angle: 153 }, { x: 487, y: 280, angle: 135 }],
  'kyiv-bucuresti': [{ x: 624, y: 246, angle: 108 }, { x: 615, y: 273, angle: 108 }, { x: 606, y: 301, angle: 108 }, { x: 596, y: 328, angle: 108 }],
  'sevastopol-bucuresti': [{ x: 683, y: 339, angle: -124 }, { x: 664, y: 324, angle: -158 }, { x: 637, y: 323, angle: 162 }, { x: 610, y: 337, angle: 135 }],
  'kyiv-kharkov': [{ x: 647, y: 244, angle: 69 }, { x: 662, y: 264, angle: 39 }, { x: 690, y: 269, angle: 0 }, { x: 718, y: 269, angle: -13 }],
  'rostov-sevastopol': [{ x: 747, y: 301, angle: -172 }, { x: 720, y: 296, angle: -169 }, { x: 705, y: 311, angle: 96 }, { x: 704, y: 339, angle: 104 }],
  'kharkov-rostov': [{ x: 757, y: 264, angle: 0 }, { x: 767, y: 284, angle: 97 }],
  'rostov-sochi': [{ x: 767, y: 324, angle: 93 }, { x: 767, y: 350, angle: 93 }],
  'sevastopol-sochi': [{ x: 721, y: 363, angle: 10 }, { x: 745, y: 367, angle: 10 }],
  'angora-smyrna': [{ x: 675, y: 499, angle: -27 }, { x: 648, y: 507, angle: -8 }, { x: 619, y: 507, angle: 0 }],
  'angora-constantinople-1': [{ x: 662, y: 480, angle: -145 }, { x: 642, y: 465, angle: -145 }],
  'angora-constantinople-2': [{ x: 675, y: 473, angle: -145 }, { x: 654, y: 458, angle: -145 }],
  'frankfurt-berlin-2': [{ x: 333, y: 231, angle: -25 }, { x: 357, y: 219, angle: -25 }, { x: 386, y: 209, angle: -25 }],
  'frankfurt-berlin-1': [{ x: 329, y: 219, angle: -25 }, { x: 356, y: 207, angle: -25 }, { x: 380, y: 198, angle: -25 }],
  'frankfurt-essen': [{ x: 325, y: 210, angle: -37 }, { x: 338, y: 200, angle: -114 }],
  'petrograd-wilno': [{ x: 668, y: 79, angle: 122 }, { x: 652, y: 101, angle: 130 }, { x: 633, y: 121, angle: 122 }, { x: 616, y: 141, angle: 122 }],
  'palermo-smyrna': [{ x: 434, y: 503, angle: 0 }, { x: 462, y: 504, angle: 0 }, { x: 489, y: 505, angle: 0 }, { x: 517, y: 506, angle: 0 }, { x: 547, y: 504, angle: 0 }, { x: 575, y: 505, angle: 0 }],
  'amsterdam-bruxelles': [{ x: 256, y: 190, angle: 110 }],
  'dieppe-paris': [{ x: 194, y: 251, angle: 50 }],
  'pamplona-barcelona': [{ x: 168, y: 404, angle: 82 }, { x: 171, y: 432, angle: 82 }],
  'berlin-wien': [{ x: 409, y: 211, angle: 72 }, { x: 416, y: 237, angle: 63 }, { x: 429, y: 254, angle: 37 }],
  'sochi-erzurum': [{ x: 763, y: 396, angle: 101 }, { x: 763, y: 422, angle: 99 }, { x: 760, y: 444, angle: 105 }],
  'sofia-bucuresti': [{ x: 567, y: 386, angle: 169 }, { x: 582, y: 372, angle: 98 }],
  'bucuresti-budapest': [{ x: 573, y: 345, angle: -155 }, { x: 547, y: 331, angle: -155 }, { x: 523, y: 318, angle: -155 }, { x: 500, y: 304, angle: -155 }],
  'budapest-sarajevo': [{ x: 486, y: 320, angle: 81 }, { x: 488, y: 344, angle: 90 }, { x: 492, y: 370, angle: 90 }],
  'budapest-zagreb': [{ x: 469, y: 312, angle: 117 }, { x: 452, y: 332, angle: 150 }],
};
