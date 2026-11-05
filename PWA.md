# Installable Mobile App (PWA)

The site now works as an installable app on Android and iPhone. It is a
**Progressive Web App (PWA)**: no app store, no build step, and the same files
serve both the website and the installed app.

## What was added

| File | Purpose |
| --- | --- |
| `manifest.webmanifest` | App name, icons, theme, shortcuts, standalone display |
| `sw.js` | Service worker: offline cache and fast repeat visits |
| `offline.html` | Friendly page shown when a page is not cached and the device is offline |
| `assets/img/icon.svg` | Editable app-icon source |
| `assets/img/icon-192.png` | Android / PWA icon |
| `assets/img/icon-512.png` | PWA icon |
| `assets/img/icon-maskable-512.png` | Android adaptive (maskable) icon |
| `assets/img/apple-touch-icon.png` | iPhone / iPad home-screen icon |
| `assets/js/main.js` | Registers the service worker and shows the install prompt |

Every page now has a manifest link, theme colour, Apple mobile-web-app tags and
`viewport-fit=cover` for notched phones.

## How clients install it

**Android (Chrome, Edge, Samsung Internet)**
1. Open the site.
2. Tap **Install app** when the gold prompt appears, or open the browser menu.
3. Choose **Install app** / **Add to Home screen**.

**iPhone / iPad (Safari)**
1. Open the site in Safari.
2. Tap the **Share** button.
3. Choose **Add to Home Screen**, then **Add**.

The icon launches full-screen without browser chrome. The bottom action bar,
calls, WhatsApp links and booking form all keep working.

## Testing

Service workers require a secure context. They work on:

- `http://localhost`
- any `https://` domain

They **do not** run on a plain `http://192.168.x.x` phone-to-laptop address.
To test on a real phone before launch, deploy to Netlify/Vercel (HTTPS) or use a
temporary HTTPS tunnel. Opening `index.html` directly from the filesystem still
shows the site, but the install/offline features are inactive.

### Offline test

1. Open the site once so the cache fills.
2. Turn on airplane mode (or stop the local server).
3. Open `services.html` - it should load from cache.
4. Open a page that was never cached - the branded **You're offline** page appears.
5. Turn the network back on and reload.

### Audit

`node tools/seo-audit.js` also checks the manifest, icon sizes, service worker,
offline page and per-page app tags.

## Updating the app

HTML uses network-first caching, so normal content updates appear on the next
online visit. CSS/JS/images use stale-while-revalidate.

After a significant design or script change, bump the cache version in `sw.js`:

```js
const VERSION = "m2m-v1.1.0"; // change this
```

That removes old caches on the next visit. Do not edit `sw.js` to cache
sensitive data - the cache is stored on the user's device.

## Optional: Play Store / App Store package

A PWA is the lowest-maintenance option and is usually enough for a local service.
If you specifically need a store listing, there are two routes.

### Android Trusted Web Activity (recommended for this site)

Bubblewrap wraps the live PWA in an Android app. The app stays up to date with
the website, and no separate codebase is needed.

Requirements: JDK 17+, Android SDK, a Google Play developer account, and a
production HTTPS domain.

```powershell
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://m2mmassage.com/manifest.webmanifest
bubblewrap build
```

Then upload the generated `.aab` in Google Play Console. Keep the therapeutic /
18+ positioning and complete the Data safety and Content rating forms honestly.

### iOS / cross-platform with Capacitor

Requires macOS + Xcode for the iOS build. Use a **separate** project folder so
`node_modules` never ends up inside the website:

```powershell
mkdir native-app
cd native-app
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init "M2M Massage" "com.m2mmassage.app" --web-dir=www
# copy the website files (except node_modules, .git) into native-app/www
npx cap add android
npx cap add ios
npx cap sync
npx cap open android
```

Re-run `npx cap sync` after website changes. App-store review for massage
services is stricter than the web: keep the copy clearly therapeutic, use real
business details, and provide a privacy policy and support contact.

---

**Bottom line:** the site is already installable and app-like today. A store
package is optional and only needed if you want to be listed in Google Play or
the App Store.
