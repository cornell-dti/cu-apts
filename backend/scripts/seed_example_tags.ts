import { db } from '../src/firebase-config';

const EXAMPLE_TAG_NAMES = ['Best value', 'Close to campus', 'Most reviewed'] as const;

const TOP_N = 2;

type TagKey = 'best' | 'close' | 'reviewed';

const TAG_NAME_TO_KEY: Record<typeof EXAMPLE_TAG_NAMES[number], TagKey> = {
  'Best value': 'best',
  'Close to campus': 'close',
  'Most reviewed': 'reviewed',
};

const KEY_LABEL: Record<TagKey, string> = {
  best: 'best value',
  close: 'close to campus',
  reviewed: 'most reviewed',
};

async function getOrCreateTagId(name: typeof EXAMPLE_TAG_NAMES[number]): Promise<string> {
  const trimmed = name.trim();
  const normalizedName = trimmed.toLowerCase();
  const existing = await db.collection('tags').where('normalizedName', '==', normalizedName).get();
  if (!existing.empty) {
    return existing.docs[0].id;
  }
  const ref = db.collection('tags').doc();
  await ref.set({ name: trimmed, normalizedName });
  return ref.id;
}

async function countApprovedReviewsByApt(): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  const revs = await db.collection('reviews').where('status', '==', 'APPROVED').get();
  revs.forEach((doc) => {
    const data = doc.data();
    const aid = data.aptId;
    if (typeof aid === 'string' && aid.length > 0) {
      map.set(aid, (map.get(aid) || 0) + 1);
    }
  });
  return map;
}

const main = async () => {
  const tagIdByKey: Record<TagKey, string> = {
    best: '',
    close: '',
    reviewed: '',
  };

  const tagEntries = await Promise.all(
    EXAMPLE_TAG_NAMES.map((name) => getOrCreateTagId(name).then((id) => ({ name, id } as const)))
  );
  tagEntries.forEach(({ name, id }) => {
    const key = TAG_NAME_TO_KEY[name];
    tagIdByKey[key] = id;
    console.log(`[tag] ${KEY_LABEL[key]}: ${id}`);
  });

  const snap = await db.collection('buildings').get();
  const rows = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      distanceToCampus:
        typeof data.distanceToCampus === 'number'
          ? data.distanceToCampus
          : Number.POSITIVE_INFINITY,
      price: typeof data.price === 'number' ? data.price : Number.POSITIVE_INFINITY,
    };
  });

  if (rows.length === 0) {
    console.log('No buildings in Firestore; only tags were created/verified.');
    return;
  }

  const reviewCounts = await countApprovedReviewsByApt();

  const byDistance = [...rows].sort((a, b) => a.distanceToCampus - b.distanceToCampus);
  const finiteDistance = byDistance.filter((b) => Number.isFinite(b.distanceToCampus));
  let closeToCampus = finiteDistance
    .slice(0, Math.min(TOP_N, finiteDistance.length))
    .map((b) => b.id);
  if (closeToCampus.length === 0) {
    closeToCampus = byDistance.slice(0, Math.min(TOP_N, byDistance.length)).map((b) => b.id);
  }

  const closeSet = new Set(closeToCampus);
  const pricePool = rows.filter((b) => b.price > 0);
  const sortByPrice = pricePool.length >= Math.min(TOP_N, rows.length) ? pricePool : rows;
  const byPriceAsc = [...sortByPrice].sort((a, b) => a.price - b.price);
  const bestOutsideClose = byPriceAsc.filter((b) => !closeSet.has(b.id));
  const bestValuePool = bestOutsideClose.length >= TOP_N ? bestOutsideClose : byPriceAsc;
  const bestValue = bestValuePool.slice(0, Math.min(TOP_N, bestValuePool.length)).map((b) => b.id);

  const bestSet = new Set<string>([...closeToCampus, ...bestValue]);
  const reviewedWithCount = rows
    .map((b) => ({ id: b.id, c: reviewCounts.get(b.id) || 0 }))
    .filter((x) => x.c > 0)
    .sort((a, b) => b.c - a.c);
  const reviewedOutside = reviewedWithCount.filter((x) => !bestSet.has(x.id));
  const mostReviewedPool = reviewedOutside.length >= TOP_N ? reviewedOutside : reviewedWithCount;
  const mostReviewed = mostReviewedPool.slice(0, TOP_N).map((x) => x.id);

  const toApply = new Map<string, Set<TagKey>>();

  const add = (aptId: string, key: TagKey) => {
    let keySet = toApply.get(aptId);
    if (!keySet) {
      keySet = new Set<TagKey>();
      toApply.set(aptId, keySet);
    }
    keySet.add(key);
  };

  closeToCampus.forEach((id) => add(id, 'close'));
  bestValue.forEach((id) => add(id, 'best'));
  mostReviewed.forEach((id) => add(id, 'reviewed'));

  console.log(
    `[heuristic] close to campus: ${closeToCampus.length} apts, best value: ${bestValue.length}, most reviewed: ${mostReviewed.length}`
  );

  await Promise.all(
    Array.from(toApply.entries()).map(async ([aptId, keys]) => {
      const ref = db.collection('buildings').doc(aptId);
      const cur = (await ref.get()).data() as { tags?: string[] } | undefined;
      const existing: string[] = cur && Array.isArray(cur.tags) ? [...cur.tags] : [];
      const newIds = Array.from(keys).map((k: TagKey) => tagIdByKey[k]);
      const merged = Array.from(new Set([...existing, ...newIds]));
      await ref.update({ tags: merged });
      const labels = Array.from(keys).map((k) => KEY_LABEL[k]);
      console.log(`[building] ${aptId} +tags (${labels.join(', ')})`);
    })
  );

  console.log('Done. Refresh the app; search and listings read tags from Firestore.');
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
