[HOOK — refinar]

A cache is supposed to protect your database. Most of the time it does exactly that, until the one moment it doesn't: a hot key expires, a wave of requests lands in the same second, and every single one of them decides the database needs to be asked the same expensive question at once. That's a cache stampede, also called a thundering herd, and it tends to show up right when traffic is highest.

The fix isn't "cache more." It's making sure that when a cached value expires, only one worker goes and recomputes it while everyone else waits or serves something slightly stale.

---

### What Actually Happens During a Stampede

A typical cache-aside setup looks simple: check Redis, if it's a miss go to the database, write the result back to Redis, return it. That works fine under low concurrency. It falls apart when a key with a short TTL is read constantly and expires while dozens or hundreds of requests are in flight for it.

Every one of those requests sees a miss at roughly the same instant. Every one of them runs the expensive query, or hits the expensive API, or recomputes the aggregation, in parallel. The database that the cache existed to protect gets hit with N times the load it was ever designed for, all in a burst.

---

### The Naive Version (and Where It Breaks)

Here's the pattern most teams start with, an Express route backed by `ioredis`:

```ts
import { Router } from "express";
import Redis from "ioredis";
import { getOrderSummary } from "./db";

const redis = new Redis();
const router = Router();

router.get("/orders/:id/summary", async (req, res) => {
  const key = `order-summary:${req.params.id}`;
  const cached = await redis.get(key);
  if (cached) return res.json(JSON.parse(cached));

  const summary = await getOrderSummary(req.params.id); // expensive
  await redis.set(key, JSON.stringify(summary), "EX", 30);
  res.json(summary);
});
```

Nothing here is wrong on its own. The problem is concurrency: if this endpoint gets 200 requests in the same 50ms window right after the key expires, all 200 will miss the cache and all 200 will call `getOrderSummary`. On a system handling real read traffic, that's the difference between a quiet database and one that just fell over.

I've dealt with this shape of problem on systems where the read volume wasn't optional. On iTrack Brasil, a B2B delivery platform with close to 60,000 couriers and over 50 million invoices processed, dashboards and status endpoints got hammered by both humans refreshing pages and integrated systems polling for updates. A single popular key expiring during a traffic peak is exactly the kind of thing that turns a normal afternoon into an incident.

---

### Fix 1: A Distributed Lock

The most direct fix is to make sure only one process recomputes a given key at a time, using Redis itself as the lock:

```ts
async function withLock<T>(
  key: string,
  fn: () => Promise<T>,
  lockTtlMs = 5000
): Promise<T | null> {
  const lockKey = `lock:${key}`;
  const acquired = await redis.set(lockKey, "1", "PX", lockTtlMs, "NX");

  if (!acquired) {
    // someone else is already recomputing; wait briefly and re-read the cache
    await new Promise((r) => setTimeout(r, 100));
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  try {
    return await fn();
  } finally {
    await redis.del(lockKey);
  }
}
```

`SET key value PX ttl NX` is atomic: only the first caller gets `acquired = true`. Everyone else backs off and polls the cache instead of hitting the database directly. This closes the stampede across every instance of your app, which matters the moment you run more than one Node process behind a load balancer.

**Trade-off:** losers of the lock have to wait, so tail latency goes up for whoever doesn't win. If the recompute is slow, that wait is felt by real users. A lock TTL that's too short also risks releasing before the recompute finishes, letting a second worker in.

---

### Fix 2: In-Process Request Coalescing

Before reaching for Redis, it's worth fixing the cheaper half of the problem: duplicate requests inside the same Node process don't need to touch Redis or the lock at all.

```ts
const inFlight = new Map<string, Promise<unknown>>();

async function coalesce<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (inFlight.has(key)) return inFlight.get(key) as Promise<T>;

  const promise = fn().finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}
```

Wrap the database call in this and ten simultaneous requests for the same order summary, within the same process, become one actual query with nine callers awaiting the same promise. It's a small function, but it removes most of the pressure before a distributed lock is ever needed.

The catch is scope: this only dedupes within a single process. If you're running four instances of the API, each one still runs its own recompute. That's exactly the gap the Redis lock in Fix 1 covers, so the two are complementary rather than alternatives.

---

### Fix 3: Refresh Before the Cliff

Locks and coalescing both react after a miss has already happened. A different approach avoids the miss altogether by recomputing a hot key slightly before it expires, proportionally more often the closer it gets to expiring. This is the idea behind probabilistic early expiration (the XFetch approach):

```ts
async function getWithEarlyRefresh<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>
): Promise<T> {
  const raw = await redis.get(key);
  if (raw) {
    const { value, computedAt, delta } = JSON.parse(raw);
    const elapsed = (Date.now() - computedAt) / 1000;
    const beta = 1; // tuning knob, higher = earlier refresh
    const shouldRefreshEarly =
      elapsed - delta * beta * Math.log(Math.random()) >= ttlSeconds;

    if (!shouldRefreshEarly) return value as T;
  }

  const start = Date.now();
  const value = await fn();
  const delta = (Date.now() - start) / 1000;
  await redis.set(
    key,
    JSON.stringify({ value, computedAt: Date.now(), delta }),
    "EX",
    ttlSeconds * 2
  );
  return value;
}
```

`delta` tracks how long the recompute actually took last time. As a key's remaining TTL gets short, the odds that any given request decides to refresh early creep up, so recomputes spread out across many individual requests instead of clustering on the single request that happens to see the miss. Most callers still get served from cache immediately.

---

None of these three techniques replaces the others. Coalescing handles the cheap, common case inside one process. The Redis lock is the safety net once you're running more than one instance. Early refresh is what keeps genuinely hot keys from ever hitting a hard miss in the first place. On a system like iTrack's dashboards, I'd reach for coalescing and early refresh by default, and only add the distributed lock for the handful of keys expensive enough that even one avoidable recompute is worth preventing.

The one thing all three share: they assume you already know which keys are hot. Instrumenting cache hit rates per key, not just globally, is the unglamorous prerequisite that makes any of this worth doing.

---

If you've hit a cache stampede in production, or you're deciding which of these to bother implementing first, I'd like to hear how you approached it. Let's connect and exchange ideas.

---

_Written by Gil, a fullstack developer with 19+ years of experience, passionate about practical architecture, clean UX, and blockchain-powered applications._
