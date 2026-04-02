/** QAR per gram of jewelry at a given fine-gold purity, from 24K spot (per gram fine gold). */
export function goldPricePerGramAtPurity(price24KPerGramQAR: number, purity: number): number {
  if (!Number.isFinite(price24KPerGramQAR) || !Number.isFinite(purity)) return 0;
  return Math.round(price24KPerGramQAR * purity * 100) / 100;
}
