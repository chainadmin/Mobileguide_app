import { getTopBuzz } from './api';

// Below this many viewers, clicks only nudge TMDB's order instead of
// overriding it, so a handful of taps can't reshuffle a whole list.
const FULL_WEIGHT_VIEWERS = 10;

export async function getRegionBuzz(region: string): Promise<Map<string, number>> {
  const items = await getTopBuzz(region);
  return new Map(items.map(item => [`${item.media_type}-${item.tmdb_id}`, item.view_count]));
}

// Blends TMDB's order (position in `items`) with how many people in the
// region opened each title this week. Both parts score 0-1 and are added,
// so the most-viewed title can climb past everything TMDB ranked above it.
export function rankByBuzz<T extends { id: number; media_type: string }>(
  items: T[],
  buzz: Map<string, number>
): T[] {
  if (items.length === 0 || buzz.size === 0) return items;
  const maxViewers = Math.max(FULL_WEIGHT_VIEWERS, ...buzz.values());
  return items
    .map((item, index) => {
      const viewers = buzz.get(`${item.media_type}-${item.id}`) ?? 0;
      const score = (items.length - index) / items.length + viewers / maxViewers;
      return { item, index, score };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ item }) => item);
}
