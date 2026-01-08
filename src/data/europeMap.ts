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
  { id: 'edinburgh-london-1', cities: ['edinburgh', 'london'], length: 4, color: 'black' },
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
  { id: 'essen-berlin-2', cities: ['essen', 'berlin'], length: 2, color: 'pink', parallelRouteId: 'essen-berlin-1' },
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
  { id: 'wien-venezia', cities: ['wien', 'venezia'], length: 2, color: 'gray' },
  
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
