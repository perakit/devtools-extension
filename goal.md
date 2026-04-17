# Chrome Extension Implementation Plan

## Goal
Build a Chrome extension using only plain HTML, CSS, and JavaScript.
No build step, no framework, and no extra runtime.
Use the existing vendor Bootstrap files for UI styling.

## Product direction
This feature list is too large for a single first release, so it should be delivered in phases.
The best approach is to ship a strong MVP first, then add advanced tools after the core architecture is stable.

## Technical rules
- Manifest V3 only
- Plain HTML, CSS, and JavaScript
- Bootstrap from the vendor folder for layout and styling
- Content scripts for page interaction tools
- Background service worker for browser-level actions
- Local storage for settings, saved snippets, and todo tasks
- Responsive Viewer should be a first-class built-in tool, not a later add-on
- Use an extension page with iframe previews for phone, tablet, and desktop sizes
- Support both grid and list layouts for device previews
- Optional external APIs only where absolutely necessary

## Recommended project structure
- manifest.json
- popup.html
- popup.js
- responsive-viewer.html
- responsive-viewer.js
- options.html
- options.js
- background.js
- content.js
- toolbar.css
- tools/
  - css-inspector.js
  - text-editor.js
  - font-tools.js
  - color-tools.js
  - dom-tools.js
  - media-tools.js
  - seo-tools.js
  - utility-tools.js
  - responsive-tools.js

## Phase 1: MVP features
These are realistic, high-value, and can be built quickly with content scripts.
Responsive Viewer is a first-class MVP feature and should be working in the earliest usable release.

1. Responsive Viewer
   - Show the current site in multiple iframe previews at once
   - Provide device presets such as phone, tablet, and desktop
   - Support both grid view and list view
   - Allow quick width and height presets for common screen sizes
2. CSS Inspector
3. Live Text Editor
4. Fonts Changer
5. List All Fonts
6. Color Picker
7. Color Palette
8. Move Element
9. Delete Element
10. Extract Images
11. SEO Meta Inspector
12. Meta Tags Preview
13. Email Finder
14. Reader Mode
15. Webpage to Markdown
16. Todo Tasks

## Phase 2: Browser utility features
These are also feasible in plain JavaScript, but need more permissions and testing.

1. Export Element
2. Page Ruler
3. Page Outliner
4. Image Replacer
5. Take Screenshot
6. Clear Browsing Data
7. Open Multiple URLs
8. Table Capture
9. Save as PDF
10. Cookie Editor
11. API Tester
12. Currency Converter

## Phase 3: Advanced or limited-scope features
These should be added later or released as simplified versions.

1. Site Stack
   - Detect common libraries, CMS, analytics, and frameworks from DOM, scripts, and meta tags.
   - Keep expectations realistic; results will be heuristic, not perfect.

2. Responsive Viewer Enhancements
   - The core Responsive Viewer belongs in Phase 1.
   - Later enhancements can add custom device sizes, synced scrolling, saved layouts, and more preview presets.

3. Accessibility Tools
   - Start with basic checks such as missing alt text, heading order, form labels, and contrast warnings.

4. Redirect Path
   - May require webRequest-based logging and careful permissions.

5. Broken Link Checker
   - Check links on page and report bad or blocked responses.

6. Page Speed Insights
   - Best implemented through the Google PageSpeed Insights API.
   - This may require an API key and rate-limit handling.

7. Stripe Analytics
   - Should be treated as a separate premium tool or optional dashboard helper.
   - Prefer user-provided Stripe API keys instead of scraping the Stripe dashboard.

## Permissions likely needed
- activeTab
- scripting
- storage
- tabs
- downloads
- cookies
- browsingData
- contextMenus
- host_permissions for all_urls or limited site access

## Build order

### Milestone 1
Set up the extension shell:
- manifest
- popup UI
- Bootstrap styling
- background service worker
- content script injection system
- responsive-viewer page shell
- grid/list toggle for preview layout
- default phone, tablet, and desktop presets

### Milestone 2
Build the first-class viewing and DOM editing tools:
- Responsive Viewer
- CSS Inspector
- Live Text Editor
- Move Element
- Delete Element
- Fonts Changer

### Milestone 3
Build analysis tools:
- List All Fonts
- Color Palette
- SEO Meta Inspector
- Meta Tags Preview
- Email Finder

### Milestone 4
Build export and utility tools:
- Extract Images
- Export Element
- Table Capture
- Webpage to Markdown
- Todo Tasks

### Milestone 5
Add browser-level tools:
- Screenshot
- Save as PDF
- Multiple URLs
- Cookie Editor
- Clear Browsing Data

### Milestone 6
Add advanced tools with limited first versions:
- Site Stack
- Accessibility checks
- Broken Link Checker
- Responsive Viewer enhancements

## First release scope
To keep the project doable, the first release should include:
- Responsive Viewer
- CSS Inspector
- Live Text Editor
- Fonts Changer
- List All Fonts
- Color Picker
- Color Palette
- Move Element
- Delete Element
- Extract Images
- SEO Meta Inspector
- Meta Tags Preview
- Email Finder
- Reader Mode
- Webpage to Markdown
- Todo Tasks

## Definition of done
The extension is ready for first release when:
- it loads in Chrome without build tools
- popup UI works with Bootstrap styling
- each MVP feature runs on real websites
- permissions are minimized and documented
- errors are handled cleanly
- settings persist in browser storage

## Notes
- Do not try to build every feature at once.
- Start with the MVP and keep each tool modular.
- Some features such as Stripe Analytics and Page Speed Insights should be treated as optional integrations, not launch blockers.
- The main target is a stable all-in-one web developer toolbox extension.