function createRequestGuard({ now = Date.now, windowMs = 600000, maxRequests = 5, maxEntries = 10000, maxConcurrent = 4 } = {}) {
  const entries = new Map();
  let active = 0;
  return {
    acquire(key) {
      const time = now();
      for (const [id, entry] of entries) if (entry.resetAt <= time) entries.delete(id);
      const entry = entries.get(key) || {count:0,resetAt:time + windowMs};
      if (entry.count >= maxRequests || active >= maxConcurrent || (!entries.has(key) && entries.size >= maxEntries)) return null;
      entry.count++;
      entries.set(key,entry);
      active++;
      let released = false;
      return () => { if (!released) { active--; released = true; } };
    }
  };
}
module.exports = { createRequestGuard };
