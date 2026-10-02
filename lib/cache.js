const store = new Map();

export function cached(key, load, ttlMs = 300000) {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return hit.promise;
  const promise = load();
  store.set(key, { promise, expires: Date.now() + ttlMs });
  promise.catch(() => store.delete(key));
  return promise;
}
