#!/usr/bin/env node
/**
 * IPTV M3U Playlist Source Tester
 * Fetches M3U/JSON playlists, parses channel counts, and tests stream liveness.
 */

const M3U_SOURCES = [
  {
    name: "Free-TV/IPTV master playlist",
    url: "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8",
    type: "m3u",
  },
  {
    name: "istiakrahman15/iptv-api channels",
    url: "https://raw.githubusercontent.com/istiakrahman15/iptv-api/main/channels.json",
    type: "json",
  },
  {
    name: "sultanarabi161/filoox-bdix playlist",
    url: "https://raw.githubusercontent.com/sultanarabi161/filoox-bdix/main/playlist.m3u",
    type: "m3u",
  },
  {
    name: "gtvservices5/IPTV-LIVE PrimeVision",
    url: "https://raw.githubusercontent.com/gtvservices5/IPTV-LIVE/main/PrimeVision.m3u",
    type: "m3u",
  },
  {
    name: "LITUATUI/M3UPT playlist",
    url: "https://raw.githubusercontent.com/LITUATUI/M3UPT/main/M3U/M3UPT.m3u",
    type: "m3u",
  },
  {
    name: "iptv-org sports (current source)",
    url: "https://iptv-org.github.io/iptv/categories/sports.m3u",
    type: "m3u",
  },
  {
    name: "iptv-org documentary (current source)",
    url: "https://iptv-org.github.io/iptv/categories/documentary.m3u",
    type: "m3u",
  },
  {
    name: "iptv-org kids (current source)",
    url: "https://iptv-org.github.io/iptv/categories/kids.m3u",
    type: "m3u",
  },
];

const JSON_API_SOURCES = [
  {
    name: "iptv-org channels.json API",
    url: "https://iptv-org.github.io/api/channels.json",
    type: "json_api_preview",
    description: "Preview first 5000 chars to check structure",
  },
  {
    name: "iptv-org countries.json API",
    url: "https://iptv-org.github.io/api/countries.json",
    type: "json_api_full",
    description: "Full fetch - should be smaller",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function separator(char = "─", width = 80) {
  return char.repeat(width);
}

function sectionHeader(title) {
  console.log(`\n${separator("═", 80)}`);
  console.log(`  ${title}`);
  console.log(`${separator("═", 80)}\n`);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatMs(ms) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Fetch with timeout (AbortController)
 */
async function fetchWithTimeout(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const start = Date.now();
    const res = await fetch(url, { signal: controller.signal });
    const elapsed = Date.now() - start;
    return { res, elapsed };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * HEAD request with timeout to check stream liveness
 */
async function headCheck(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const start = Date.now();
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "VLC/3.0.18",
      },
    });
    const elapsed = Date.now() - start;
    return {
      alive: res.ok,
      status: res.status,
      statusText: res.statusText,
      contentType: res.headers.get("content-type") || "unknown",
      elapsed,
    };
  } catch (err) {
    return {
      alive: false,
      status: 0,
      statusText: err.name === "AbortError" ? "TIMEOUT" : err.message,
      contentType: "N/A",
      elapsed: timeoutMs,
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Parse M3U content: count #EXTINF lines, extract stream URLs
 */
function parseM3U(content) {
  const lines = content.split("\n").map((l) => l.trim());
  const channelNames = [];
  const streamUrls = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF:")) {
      // Extract channel name (after last comma)
      const match = lines[i].match(/,(.+)$/);
      channelNames.push(match ? match[1].trim() : "Unknown");
      // Next non-comment, non-empty line is the stream URL
      for (let j = i + 1; j < lines.length; j++) {
        const next = lines[j];
        if (next && !next.startsWith("#")) {
          streamUrls.push(next);
          break;
        }
      }
    } else if (lines[i].startsWith("#EXTVLCOPT:")) {
      // Some M3Us have VLC options between EXTINF and URL — skip
    }
  }

  return { channelCount: channelNames.length, channelNames, streamUrls };
}

/**
 * Parse JSON channel list (array of objects with url or stream field)
 */
function parseJsonChannels(content) {
  try {
    const data = JSON.parse(content);
    if (!Array.isArray(data)) return { channelCount: 0, streamUrls: [] };
    const urls = [];
    for (const item of data) {
      // Common field names for stream URLs
      const url =
        item.url ||
        item.stream ||
        item.link ||
        item.source ||
        item.stream_url ||
        "";
      if (url && url.startsWith("http")) {
        urls.push(url);
      }
    }
    return { channelCount: data.length, streamUrls: urls };
  } catch {
    return { channelCount: 0, streamUrls: [] };
  }
}

/**
 * Pick N random items from array
 */
function pickRandom(arr, n) {
  if (arr.length <= n) return [...arr];
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

function truncate(str, maxLen = 80) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + "...";
}

// ─── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════════════════╗");
  console.log("║             IPTV M3U Playlist Source Tester                              ║");
  console.log("║             Run: " + new Date().toISOString() + "           ║");
  console.log("╚══════════════════════════════════════════════════════════════════════════╝");

  const results = [];
  const totalStart = Date.now();

  // ── Phase 1: Fetch and parse M3U sources ──
  sectionHeader("PHASE 1: Fetching & Parsing M3U / JSON Playlist Sources");

  for (const source of M3U_SOURCES) {
    const result = {
      name: source.name,
      url: source.url,
      type: source.type,
      channelCount: 0,
      streamUrls: [],
      fetchTime: 0,
      sizeBytes: 0,
      status: "unknown",
      error: null,
      headTests: [],
    };

    process.stdout.write(`  Fetching: ${source.name} ... `);

    try {
      const { res, elapsed } = await fetchWithTimeout(source.url, 15000);
      result.fetchTime = elapsed;

      if (!res.ok) {
        result.status = `HTTP ${res.status} ${res.statusText}`;
        console.log(`FAIL (${result.status}) [${formatMs(elapsed)}]`);
        results.push(result);
        continue;
      }

      const text = await res.text();
      result.sizeBytes = Buffer.byteLength(text, "utf-8");
      result.status = `HTTP ${res.status} OK`;

      if (source.type === "m3u") {
        const parsed = parseM3U(text);
        result.channelCount = parsed.channelCount;
        result.channelNames = parsed.channelNames;
        result.streamUrls = parsed.streamUrls;
      } else if (source.type === "json") {
        const parsed = parseJsonChannels(text);
        result.channelCount = parsed.channelCount;
        result.streamUrls = parsed.streamUrls;
      }

      console.log(
        `OK [${formatMs(elapsed)}] ${formatBytes(result.sizeBytes)} | ${result.channelCount.toLocaleString()} channels`
      );
    } catch (err) {
      result.error = err.message;
      result.status = err.name === "AbortError" ? "TIMEOUT" : `ERROR: ${err.message}`;
      console.log(`FAIL (${result.status})`);
    }

    results.push(result);
  }

  // ── Phase 2: Fetch JSON API sources ──
  sectionHeader("PHASE 2: Fetching iptv-org JSON API Endpoints");

  for (const api of JSON_API_SOURCES) {
    process.stdout.write(`  Fetching: ${api.name} ... `);

    try {
      const { res, elapsed } = await fetchWithTimeout(api.url, 15000);

      if (!res.ok) {
        console.log(`FAIL (HTTP ${res.status}) [${formatMs(elapsed)}]`);
        continue;
      }

      const text = await res.text();
      const size = Buffer.byteLength(text, "utf-8");

      if (api.type === "json_api_preview") {
        // Show structure from first 5000 chars
        const preview = text.slice(0, 5000);
        let structure = "unknown";
        let count = 0;
        try {
          // Count top-level array items (partial parse)
          const trimmed = preview.trim();
          if (trimmed.startsWith("[")) {
            // Count commas at depth 0
            let depth = 0;
            for (const ch of trimmed) {
              if (ch === "[" || ch === "{") depth++;
              if (ch === "]" || ch === "}") depth--;
              if (ch === "," && depth === 1) count++;
            }
            count++; // N commas = N+1 items (approximately for preview)
            structure = `Array (seen ${count} items in preview)`;
          } else if (trimmed.startsWith("{")) {
            structure = "Object";
          }
        } catch {
          /* ignore */
        }

        // Show first object structure
        const firstObjMatch = preview.match(/\{[^}]{10,200}\}/);
        console.log(
          `OK [${formatMs(elapsed)}] ${formatBytes(size)} | ${structure}`
        );
        if (firstObjMatch) {
          console.log(`    First record shape: ${truncate(firstObjMatch[0], 76)}`);
        }
      } else {
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          console.log(
            `OK [${formatMs(elapsed)}] ${formatBytes(size)} | ${data.length} items`
          );
          // Show first item keys
          if (data.length > 0) {
            const keys = Object.keys(data[0]);
            console.log(`    Keys: [${keys.join(", ")}]`);
            // Show first 3 items summary
            for (let i = 0; i < Math.min(3, data.length); i++) {
              console.log(`    [${i}] ${truncate(JSON.stringify(data[i]), 76)}`);
            }
          }
        } else {
          console.log(
            `OK [${formatMs(elapsed)}] ${formatBytes(size)} | Top-level keys: ${Object.keys(data).join(", ")}`
          );
        }
      }
    } catch (err) {
      console.log(
        `FAIL (${err.name === "AbortError" ? "TIMEOUT" : err.message})`
      );
    }
  }

  // ── Phase 3: Test stream liveness ──
  sectionHeader(
    "PHASE 3: Stream Liveness Tests (HEAD request, 3 random per source, 5s timeout)"
  );

  let totalHeadTests = 0;
  let totalAlive = 0;
  let totalDead = 0;

  for (const result of results) {
    if (result.streamUrls.length === 0) {
      console.log(`  ⊘ ${result.name}: No stream URLs to test`);
      continue;
    }

    const toTest = pickRandom(result.streamUrls, 3);
    console.log(`\n  ▶ ${result.name} (${result.streamUrls.length.toLocaleString()} total, testing ${toTest.length}):`);

    for (const url of toTest) {
      process.stdout.write(`    HEAD ${truncate(url, 60)} ... `);
      const check = await headCheck(url, 5000);
      totalHeadTests++;

      if (check.alive) {
        totalAlive++;
        const ct = check.contentType || "N/A";
        console.log(
          `✓ ALIVE (${check.status}) [${formatMs(check.elapsed)}] ${ct}`
        );
      } else {
        totalDead++;
        console.log(
          `✗ DEAD (${check.status} ${check.statusText}) [${formatMs(check.elapsed)}]`
        );
      }

      result.headTests.push({ url, ...check });
    }
  }

  // ── Phase 4: Summary ──
  sectionHeader("PHASE 4: Summary Report");

  console.log(`  ${"Source".padEnd(45)} ${"Channels".padStart(10)} ${"Size".padStart(10)} ${"Fetch".padStart(8)} ${"Alive".padStart(6)} ${"Dead".padStart(6)}`);
  console.log(`  ${separator("─", 85)}`);

  for (const r of results) {
    const name = truncate(r.name, 44).padEnd(45);
    const channels = String(r.channelCount).padStart(10);
    const size = formatBytes(r.sizeBytes).padStart(10);
    const fetch = formatMs(r.fetchTime).padStart(8);
    const alive = String(
      r.headTests.filter((t) => t.alive).length
    ).padStart(6);
    const dead = String(
      r.headTests.filter((t) => !t.alive).length
    ).padStart(6);
    console.log(`  ${name} ${channels} ${size} ${fetch} ${alive} ${dead}`);
  }

  console.log(`\n  Stream Liveness Totals:`);
  console.log(`    Tested: ${totalHeadTests}`);
  console.log(`    Alive:  ${totalAlive} (${totalHeadTests > 0 ? ((totalAlive / totalHeadTests) * 100).toFixed(1) : 0}%)`);
  console.log(`    Dead:   ${totalDead} (${totalHeadTests > 0 ? ((totalDead / totalHeadTests) * 100).toFixed(1) : 0}%)`);

  const totalTime = Date.now() - totalStart;
  console.log(`\n  Total runtime: ${formatMs(totalTime)}`);

  // ── Phase 5: Recommendations ──
  sectionHeader("PHASE 5: Recommendations");

  // Sort by channels descending, then by alive ratio
  const ranked = results
    .filter((r) => r.channelCount > 0)
    .sort((a, b) => {
      const aAlive = a.headTests.filter((t) => t.alive).length;
      const bAlive = b.headTests.filter((t) => t.alive).length;
      if (bAlive !== aAlive) return bAlive - aAlive;
      return b.channelCount - a.channelCount;
    });

  if (ranked.length > 0) {
    console.log("  Ranked by stream liveness then channel count:");
    ranked.forEach((r, i) => {
      const alive = r.headTests.filter((t) => t.alive).length;
      const total = r.headTests.length;
      const badge = alive === total && total > 0 ? "🌟" : alive > 0 ? "⚠️" : "❌";
      console.log(
        `    ${i + 1}. ${badge} ${r.name} — ${r.channelCount.toLocaleString()} channels, ${alive}/${total} streams alive`
      );
    });
  }

  console.log(`\n${separator("═", 80)}`);
  console.log("  Done.");
  console.log(`${separator("═", 80)}\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
