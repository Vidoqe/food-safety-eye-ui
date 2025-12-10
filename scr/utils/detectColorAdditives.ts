// scr/utils/detectColorAdditives.ts

import { COLOR_ADDITIVES, ColorAdditiveInfo } from '../data/colorAdditives';

export function detectColorAdditives(rawIngredientLine: string): ColorAdditiveInfo[] {
  const line = rawIngredientLine.toLowerCase();
  const matches: ColorAdditiveInfo[] = [];

  for (const additive of COLOR_ADDITIVES) {
    if (additive.match_terms.some(term => line.includes(term.toLowerCase()))) {
      matches.push(additive);
    }
  }

  return matches;
}