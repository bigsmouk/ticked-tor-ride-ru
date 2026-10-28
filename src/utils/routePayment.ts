import { Route, TrainCardType } from '@/types/game';

/** Validate the exact offered payment, not merely whether a valid hand exists. */
export const validateRoutePayment = (route: Route, cards: TrainCardType[], hand: TrainCardType[]): string | null => {
  if (cards.length !== route.length) return `Выберите ровно ${route.length} карт`;
  const remaining = [...hand];
  for (const card of cards) {
    const index = remaining.indexOf(card);
    if (index === -1) return 'Недостаточно выбранных карт в руке';
    remaining.splice(index, 1);
  }
  const locomotives = cards.filter(card => card === 'locomotive').length;
  if (locomotives < (route.ferryLocomotives ?? 0)) {
    return `Для парома требуется минимум ${route.ferryLocomotives} локомотив(а)`;
  }
  const colors = [...new Set(cards.filter(card => card !== 'locomotive'))];
  if (colors.length > 1) return 'Нужны карты одного цвета; локомотивы могут заменять любой цвет';
  if (route.color !== 'gray' && colors.some(color => color !== route.color)) {
    return 'Цвет карт не совпадает с цветом маршрута';
  }
  return null;
};

export const canSelectRouteCard = (route: Route, selected: TrainCardType[], next: TrainCardType): boolean => {
  if (selected.length >= route.length) return false;
  const colors = [...new Set([...selected, next].filter(card => card !== 'locomotive'))];
  if (colors.length > 1) return false;
  if (route.color !== 'gray' && colors.some(color => color !== route.color)) return false;
  const locomotives = [...selected, next].filter(card => card === 'locomotive').length;
  return locomotives + (route.length - selected.length - 1) >= (route.ferryLocomotives ?? 0);
};
