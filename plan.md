# Chrome Extension Task List

Use this file as the working checklist for the project.

## Rules for AI execution
- Mark finished items with [x]
- Keep unfinished items as [ ]
- Work from top to bottom unless blocked
- Verify each feature in Chrome before marking it done
- Keep everything plain HTML, CSS, and JavaScript
- Use the existing vendor Bootstrap files for styling

## 0. Planning and scope
- [x] Define the extension goal and scope
- [x] Prioritize Responsive Viewer as a first-class feature
- [x] Decide on plain HTML, CSS, and JavaScript only
- [x] Decide to use Bootstrap assets from the vendor folder
- [x] Final review of scope before implementation starts

## 1. Project setup
- [x] Create manifest.json for Chrome Extension Manifest V3
- [x] Add required permissions and host permissions
- [x] Create popup.html
- [x] Create popup.js
- [x] Create background.js service worker
- [x] Create content.js for page tools
- [x] Create toolbar.css
- [x] Link Bootstrap styles from the vendor folder
- [x] Confirm the extension loads in Chrome without errors

## 2. Responsive Viewer first release
- [x] Create responsive-viewer.html
- [x] Create responsive-viewer.js
- [x] Add button in popup to open Responsive Viewer
- [x] Pass current tab URL into the viewer page
- [x] Add phone preset iframe preview
- [x] Add tablet preset iframe preview
- [x] Add desktop preset iframe preview
- [x] Add grid layout toggle
- [x] Add list layout toggle
- [x] Add custom width and height controls
- [x] Add refresh/reload previews action
- [x] Handle iframe-blocked websites gracefully
- [x] Test Responsive Viewer on real websites

## 3. Core DOM editing tools
- [x] Implement CSS Inspector
- [x] Implement Live Text Editor
- [x] Implement Move Element tool
- [x] Implement Delete Element / hide element tool
- [x] Implement Fonts Changer
- [x] Test DOM editing tools on multiple websites

## 4. Page analysis tools
- [x] Implement List All Fonts
- [x] Implement Color Picker
- [x] Implement Color Palette extraction
- [x] Implement SEO Meta Inspector
- [x] Implement Meta Tags Preview
- [x] Implement Email Finder
- [x] Test analysis tools on real pages

## 5. Content utility tools
- [x] Implement Reader Mode
- [x] Implement Webpage to Markdown
- [x] Implement Extract Images
- [x] Implement Todo Tasks with local storage
- [x] Test export and utility tools

## 6. Phase 2 browser utilities
- [ ] Implement Export Element
- [ ] Implement Page Ruler
- [ ] Implement Page Outliner
- [ ] Implement Image Replacer
- [ ] Implement Take Screenshot
- [ ] Implement Open Multiple URLs
- [ ] Implement Table Capture
- [ ] Implement Save as PDF
- [ ] Implement Cookie Editor
- [ ] Implement API Tester
- [ ] Implement Currency Converter

## 7. Advanced features
- [ ] Implement basic Accessibility Tools
- [ ] Implement Site Stack detection
- [ ] Implement Broken Link Checker
- [ ] Implement Redirect Path logging
- [ ] Integrate Page Speed Insights API
- [ ] Design optional Stripe Analytics module
- [ ] Add Responsive Viewer enhancements

## 8. Polish and release
- [ ] Add empty states and error handling
- [ ] Minimize and review permissions
- [ ] Improve popup layout and UX
- [ ] Add icons and branding assets
- [ ] Write usage notes in README.md
- [ ] Test extension on several different websites
- [ ] Fix bugs found during testing
- [ ] Prepare the first release package

## Definition of done
- [ ] Extension loads successfully in Chrome
- [ ] Responsive Viewer works with phone, tablet, and desktop previews
- [ ] Grid and list modes both work
- [ ] Core editing tools work on real websites
- [ ] Settings and tasks persist correctly
- [ ] First release is stable enough to ship
