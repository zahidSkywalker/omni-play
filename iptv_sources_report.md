# IPTV Sources — Consolidated Search Results Report

> **Note:** The `z-ai web_search` CLI and SDK both hit connection timeouts in this environment. All data below was gathered via the **GitHub REST API** (`api.github.com`) and direct raw-file fetches from GitHub repos.

---

## 1. TIER-1 M3U PLAYLIST REPOS (Most Popular, Community-Maintained)

### 🔸 1a. iptv-org/iptv — ⭐ 117,235 stars
- **Repo:** https://github.com/iptv-org/iptv
- **Main all-in-one playlist:** `https://iptv-org.github.io/iptv/index.m3u`
- **Category-grouped:** `https://iptv-org.github.io/iptv/index.category.m3u`
- **Language-grouped:** `https://iptv-org.github.io/iptv/index.language.m3u`
- **Country-playlists pattern:** `https://iptv-org.github.io/iptv/countries/{cc}.m3u`
  - 130+ countries (ad, ae, af, al, am, ao, ar, at, au, aw, az, ba, bb, bd, be, bf, bg, bh, bj, bn, bo, bq, br, bs, by, bz, ca, cd, cg, ch, ci, cl, cm, cn, co, cr, cu, cv, cw, cy, cz, de, dk, do, dz, ec, ee, eg, eh, er, es, et, fi, fo, fr, gb/uk, ge, gf, gg, gh, gm, gn, gp, gq, gr, gt, gu, gy, hk, hn, hr, ht, hu, id, ie, il, in, iq, ir, it, jm, jo, jp, ke, kg, kh, ki, km, kn, kp, kr, kw, kz, la, lb, lc, li, lk, lt, lu, lv, ly, ma, mc, md, me, mg, mk, ml, mm, mn, mo, mq, mr, mt, mu, mv, mx, my, mz, na, ne, ng, ni, nl, no, np, nz, om, pa, pe, pf, pg, ph, pk, pl, pr, ps, pt, py, qa, re, ro, rs, ru, rw, sa, sd, se, sg, si, sk, sm, sn, so, sr, sv, sx, sy, td, tg, th, tj, tm, tn, tr, tt, tw, tz, ua, ug, us, uy, uz, va, ve, vg, vi, vn, ws, xk, ye, za, zw, int)
- **Category-playlists:**
  - Sports: `https://iptv-org.github.io/iptv/categories/sports.m3u` (311 ch)
  - News: `https://iptv-org.github.io/iptv/categories/news.m3u` (933 ch)
  - Documentary: `https://iptv-org.github.io/iptv/categories/documentary.m3u` (102 ch)
  - Kids: `https://iptv-org.github.io/iptv/categories/kids.m3u` (208 ch)
  - Movies: `https://iptv-org.github.io/iptv/categories/movies.m3u` (341 ch)
  - Music: `https://iptv-org.github.io/iptv/categories/music.m3u` (650 ch)
  - Entertainment: `https://iptv-org.github.io/iptv/categories/entertainment.m3u` (602 ch)
  - Animation: `https://iptv-org.github.io/iptv/categories/animation.m3u` (59 ch)
  - Education: `https://iptv-org.github.io/iptv/categories/education.m3u` (223 ch)
  - General: `https://iptv-org.github.io/iptv/categories/general.m3u` (2395 ch)
  - Religious: `https://iptv-org.github.io/iptv/categories/religious.m3u` (714 ch)
  - Legislative: `https://iptv-org.github.io/iptv/categories/legislative.m3u` (180 ch)
- **Raw source files (324 streams):** `https://raw.githubusercontent.com/iptv-org/iptv/master/streams/{cc}.m3u`

---

### 🔸 1b. Free-TV/IPTV — ⭐ 16,604 stars
- **Repo:** https://github.com/Free-TV/IPTV
- **Main playlist:** `https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8`
- **Country-playlists pattern:** `https://raw.githubusercontent.com/Free-TV/IPTV/master/playlists/playlist_{country}.m3u8`
  - 90+ countries (albania, andorra, argentina, armenia, australia, austria, azerbaijan, belarus, belgium, bosnia_and_herzegovina, brazil, bulgaria, canada, chad, chile, china, costa_rica, croatia, cyprus, czech_republic, denmark, dominican_republic, egypt, estonia, faroe_islands, finland, france, georgia, germany, greece, greenland, hong_kong, hongkong, hungary, iceland, india, indonesia, iran, iraq, ireland, israel, italy, japan, korea, kosovo, latvia, lithuania, luxembourg, macau, malta, mexico, moldova, monaco, montenegro, netherlands, north_korea, north_macedonia, norway, paraguay, peru, poland, portugal, qatar, romania, russia, san_marino, saudi_arabia, serbia, slovakia, slovenia, somalia, spain, sweden, switzerland, taiwan, trinidad, turkey, uk, ukraine, united_arab_emirates, usa, venezuela)
- **Special category-playlists:**
  - `playlist_zz_documentaries_en.m3u8`, `playlist_zz_documentaries_ar.m3u8`
  - `playlist_zz_news_en.m3u8`, `playlist_zz_news_ar.m3u8`, `playlist_zz_news_es.m3u8`
  - `playlist_zz_movies.m3u8`
  - `playlist_spain_vod.m3u8`, `playlist_usa_vod.m3u8`, `playlist_zz_vod_it.m3u8`

---

### 🔸 1c. Guovin/iptv-api — ⭐ 23,999 stars (Self-Hosted Live-Source Platform)
- **Repo:** https://github.com/Guovin/iptv-api
- **Type:** Self-hosted IPTV live-source auto-update platform
- **Features:** Automated collection, filtering, speed-testing, generation. Supports custom templates, channel aliases, multi-source aggregation, stream relay, replay/VOD interfaces, EPG, channel logos.
- **Deploy via:** Docker, GitHub Actions workflow, CLI, or GUI desktop app
- **Note:** Requires self-hosting; does NOT provide a public M3U URL out of the box — you deploy your own instance.

---

### 🔸 1d. MARIKO578/IPTV (Fork of Free-TV/IPTV)
- **Repo:** https://github.com/MARIKO578/IPTV
- **Main playlist:** `https://raw.githubusercontent.com/MARIKO578/IPTV/master/playlist.m3u8`
- **Country-playlists:** Same structure as Free-TV at `https://raw.githubusercontent.com/MARIKO578/IPTV/master/playlists/playlist_{country}.m3u8`
- **Desktop app builds:** Also hosts Tauri desktop player binaries (Software_1.7.zip, Software_3.3-alpha.3.zip)

---

## 2. VOD/MOVIE M3U PLAYLISTS (From m3u8-xtream/m3u8-xtream-playlist)

- **Repo:** https://github.com/m3u8-xtream/m3u8-xtream-playlist (⭐ 465)
- **Base URL:** `https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/`
  - `trending-series.m3u`
  - `top-movies.m3u`
  - `action-movies.m3u`
  - `adventure-movies.m3u`
  - `animation-movies.m3u`
  - `comedy-movies.m3u`
  - `crime-movies.m3u`
  - `documentary-movies.m3u`
  - `drama-movies.m3u`
  - `family-movies.m3u`
  - `fantasy-movies.m3u`
  - `history-movies.m3u`
  - `horror-movies.m3u`
  - `music-movies.m3u`
  - `mystery-movies.m3u`
  - `romance-movies.m3u`
  - `science-fiction-movies.m3u`
  - `thriller-movies.m3u`
  - `tv-movies.m3u`
  - `war-movies.m3u`
  - `western-movies.m3u`

---

## 3. JSON-BASED IPTV CHANNEL DATABASES

### 🔸 3a. iptv-org/api — Full Channel Metadata API
- **Repo:** https://github.com/iptv-org/api
- **API Endpoints:**
  - `https://iptv-org.github.io/api/channels.json` — All channel metadata
  - `https://iptv-org.github.io/api/streams.json` — All stream URLs
  - `https://iptv-org.github.io/api/feeds.json` — Channel feeds
  - `https://iptv-org.github.io/api/guides.json` — EPG guide data
  - `https://iptv-org.github.io/api/logos.json` — Channel logos
  - `https://iptv-org.github.io/api/categories.json` — Category list
  - `https://iptv-org.github.io/api/languages.json` — Language list
  - `https://iptv-org.github.io/api/countries.json` — Country list
  - `https://iptv-org.github.io/api/subdivisions.json` — Subdivision list
  - `https://iptv-org.github.io/api/cities.json` — City list
  - `https://iptv-org.github.io/api/regions.json` — Region list
  - `https://iptv-org.github.io/api/timezones.json` — Timezone list
  - `https://iptv-org.github.io/api/blocklist.json` — Blocked channels

### 🔸 3b. istiakrahman15/iptv-api — Bangla/Sports/News/Kids JSON DB
- **Repo:** https://github.com/istiakrahman15/iptv-api
- **URL:** `https://raw.githubusercontent.com/istiakrahman15/iptv-api/main/channels.json`
- **Categories:** Bangla, News, Sports, Hindi, English, Kids, Music, Indian Bangla, International, Entertainment (200+ channels)

---

## 4. SPECIALIZED / NICHE IPTV REPOS

| Repo | Stars | Description | Key URL |
|------|-------|-------------|---------|
| [M3UPT](https://github.com/LITUATUI/M3UPT) | 585 | Portuguese TV & radio (official streams) | `https://raw.githubusercontent.com/LITUATUI/M3UPT/main/M3U/M3UPT.m3u` |
| [filoox-bdix](https://github.com/sultanarabi161/filoox-bdix) | — | 600+ auto-updating BDIX channels | `https://raw.githubusercontent.com/sultanarabi161/filoox-bdix/main/playlist.m3u` |
| [IPTV-LIVE](https://github.com/gtvservices5/IPTV-LIVE) | — | US Live TV + international radio | `https://raw.githubusercontent.com/gtvservices5/IPTV-LIVE/main/PrimeVision.m3u` |
| [IPTV-LIVE Radio](https://github.com/gtvservices5/IPTV-LIVE) | — | International radio stations | `https://raw.githubusercontent.com/gtvservices5/IPTV-LIVE/main/UnionRadio.m3u` |
| [Beijing-IPTV](https://github.com/qwerttvv/Beijing-IPTV) | 2,229 | Beijing Unicom/China Mobile IPTV | See repo for m3u files |
| [bj-unicom-iptv](https://github.com/wuwentao/bj-unicom-iptv) | 693 | Beijing Unicom IPTV playlist | See repo |
| [Tata-Sky-IPTV](https://github.com/ForceGT/Tata-Sky-IPTV) | 711 | Tata Sky India direct m3u generator | See repo |
| [Live-TV](https://github.com/spsokhi/Live-TV) | — | Single-file HTML IPTV web player (19K+ ch) | `https://raw.githubusercontent.com/spsokhi/Live-TV/main/index.html` |
| [airwavetv](https://github.com/gilbertian-pithecanthropus683/airwavetv) | — | 19,000+ channels in one HTML file | See repo |
| [IPTV-Scanner](https://github.com/ZEROPOINTBRUH/IPTV-Scanner) | — | Scan, validate, organize live TV channels | Tool (not a playlist) |

---

## 5. IPTV TOOLS & UTILITIES

| Tool | Stars | Description | URL |
|------|-------|-------------|-----|
| [iptv-checker](https://github.com/freearhey/iptv-checker) | 612 | Node.js CLI to validate links in M3U playlists | https://github.com/freearhey/iptv-checker |
| [iptvnator](https://github.com/4gray/iptvnator) | 6,142 | Cross-platform IPTV player (m3u/m3u8 support) | https://github.com/4gray/iptvnator |
| [Megacubo](https://github.com/EdenwareApps/Megacubo) | 567 | IPTV streaming app with EPG, community lists | https://github.com/EdenwareApps/Megacubo |
| [tuliprox](https://github.com/euzu/tuliprox) | 471 | Rust IPTV playlist processor/proxy (M3U, Xtream, HDHomeRun) | https://github.com/euzu/tuliprox |
| [Playlist-AutoUpdater](https://github.com/Shra1V32/Playlist-AutoUpdater) | 714 | Auto-update M3U playlists daily with same link | https://github.com/Shra1V32/Playlist-AutoUpdater |
| [IPTV.bundle](https://github.com/Cigaras/IPTV.bundle) | 1,033 | Plex plug-in for M3U IPTV playback | https://github.com/Cigaras/IPTV.bundle |
| [PlaylistEditorTV](https://github.com/Isayso/PlaylistEditorTV) | 355 | Windows M3U editor/player with Kodi support | https://github.com/Isayso/PlaylistEditorTV |

---

## 6. EPG (Electronic Program Guide) SOURCES

| Source | Description | URL |
|--------|-------------|-----|
| iptv-org/epg | EPG data for most iptv-org channels | https://github.com/iptv-org/epg |
| gtvservices5 | EPG XML for PrimeVision | `https://raw.githubusercontent.com/gtvservices5/IPTV-LIVE/main/epg.xml` |
| LITUATUI/M3UPT | EPG for Portuguese channels | https://github.com/LITUATUI/M3UPT/tree/main/EPG |

---

## 7. QUICK-START: TOP 10 MOST USEFUL URLS

For immediate use in any IPTV player:

| # | What | URL |
|---|------|-----|
| 1 | **All channels worldwide** | `https://iptv-org.github.io/iptv/index.m3u` |
| 2 | **Free-TV all channels** | `https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8` |
| 3 | **Sports only** | `https://iptv-org.github.io/iptv/categories/sports.m3u` |
| 4 | **News only** | `https://iptv-org.github.io/iptv/categories/news.m3u` |
| 5 | **Documentary** | `https://iptv-org.github.io/iptv/categories/documentary.m3u` |
| 6 | **Kids** | `https://iptv-org.github.io/iptv/categories/kids.m3u` |
| 7 | **USA channels** | `https://iptv-org.github.io/iptv/countries/us.m3u` |
| 8 | **UK channels** | `https://iptv-org.github.io/iptv/countries/uk.m3u` |
| 9 | **Channel metadata JSON** | `https://iptv-org.github.io/api/channels.json` |
| 10 | **Stream URLs JSON** | `https://iptv-org.github.io/api/streams.json` |

---

*Report generated via GitHub API search — `z-ai web_search` was unreachable in this environment.*
