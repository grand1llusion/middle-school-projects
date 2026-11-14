export interface Cat {
  name: string;
  coat: number;
  wear: string[];
}

export interface ProgressDoc {
  stars: number;
  solved: number;
  area: Record<string, number>;
  catAreas: string[];
  cats: Cat[];
  got: number;
  food: number;
  treats: number;
  water: number;
  streak: number;
  day: string;
  updatedAt?: string;
}

export function merge(local: ProgressDoc, remote: ProgressDoc): ProgressDoc {
  // stars, solved, got: only go up
  const stars = Math.max(local.stars, remote.stars);
  const solved = Math.max(local.solved, remote.solved);
  const got = Math.max(local.got, remote.got);

  // area: per key, max
  const area: Record<string, number> = { ...local.area };
  for (const [k, v] of Object.entries(remote.area)) {
    area[k] = Math.max(area[k] ?? 0, v);
  }

  // catAreas: union
  const catAreas = [...new Set([...local.catAreas, ...remote.catAreas])];

  // cats: by index, prefer longer list; non-empty name wins; union wear
  const len = Math.max(local.cats.length, remote.cats.length);
  const cats: Cat[] = Array.from({ length: len }, (_, i) => {
    const lc = local.cats[i], rc = remote.cats[i];
    if (!lc) return { ...rc };
    if (!rc) return { ...lc };
    return {
      name: lc.name || rc.name,
      coat: lc.coat,
      wear: [...new Set([...lc.wear, ...rc.wear])],
    };
  });

  // streak, day: take the pair with the later day string
  const useRemoteDay = !local.day || remote.day > local.day;
  const streak = useRemoteDay ? remote.streak : local.streak;
  const day = useRemoteDay ? remote.day : local.day;

  // food, treats, water: take from the doc with the later updatedAt
  const useRemoteCare = !local.updatedAt ||
    (!!remote.updatedAt && remote.updatedAt > local.updatedAt);
  const food = useRemoteCare ? remote.food : local.food;
  const treats = useRemoteCare ? remote.treats : local.treats;
  const water = useRemoteCare ? remote.water : local.water;

  const updatedAt = local.updatedAt && remote.updatedAt
    ? (remote.updatedAt > local.updatedAt ? remote.updatedAt : local.updatedAt)
    : (local.updatedAt ?? remote.updatedAt);

  return { stars, solved, area, catAreas, cats, got, food, treats, water, streak, day, updatedAt };
}
