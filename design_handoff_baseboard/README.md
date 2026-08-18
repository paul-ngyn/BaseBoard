# Handoff: Baseboard — Hardwood Flooring Project Manager

## Overview
Baseboard is a project-management tool for a hardwood flooring contractor. It tracks
jobs by **address** and moves each one through a fixed pipeline of **stages** (monday.com-style).
Two products are covered:
- **Web app** (owner/office, desktop) — Projects table, Dashboard, Schedule, Map, Admin.
- **Mobile app** (crew, field) — a single "Today's schedule" screen.

## About the Design Files
The file in this bundle (`Baseboard.dc.html`) is a **design reference created in HTML** —
a working prototype showing intended look and behavior. It is **not production code to copy
directly**. The task is to **recreate these designs in the target codebase's existing
environment** (React, Vue, SwiftUI, native iOS, etc.) using its established patterns,
component library, and conventions. If no codebase exists yet, choose the most appropriate
framework (e.g. React + a component lib for web, SwiftUI/Kotlin for mobile) and implement there.

The prototype is built as a single "Design Component" and uses a client-side view switcher
(`state.view`) to swap between the web views. Treat that as illustrative — in a real app these
are routed pages/screens.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, and interactions are all intentional and
specified below. Recreate the UI to match, substituting the codebase's equivalent primitives
where sensible (e.g. its own Table, Button, Avatar components) while preserving the visual result.

---

## Design Tokens

The design re-tints a newsprint-serif design system ("Broadsheet") to warm **maple/wood** tones.

### Color
| Token | Hex | Use |
| --- | --- | --- |
| App background (canvas) | `#e7ddcc` | Outermost page behind the app frame |
| Content bg | `#f4efe6` | Main content area, cards' page |
| Surface | `#ece3d4` | Cards, table zebra, calendar cells |
| Sidebar bg | `#efe7d8` | Left nav, mobile tab bar |
| Text | `#2a2018` | Primary text |
| Text secondary | `#7a6a58` / `#8a7860` | Subtitles, meta |
| Text muted | `#9a8367` / `#b0a087` | Labels, hints |
| Accent (maple/walnut) | `#8a5a2b` | Primary buttons, active nav, links, mobile header |
| Accent 600 / 700 | `#744a22` / `#5e3b1a` | Hover / pressed |
| Divider | `rgba(42,32,24,.08–.12)` | Hairline rules, table rules |

### Stage colors (pill background / text) — the pipeline, warm→cool
| # | Stage | BG | Text |
| --- | --- | --- | --- |
| 01 | Lead / Estimate | `#cbb488` | `#3a2e18` |
| 02 | Measure | `#c39a5a` | `#ffffff` |
| 03 | Quote Sent | `#d98f3d` | `#3a2308` |
| 04 | Approved | `#b5701f` | `#ffffff` |
| 05 | Materials Ordered | `#a9581f` | `#ffffff` |
| 06 | Scheduled | `#8a6d3b` | `#ffffff` |
| 07 | Install In Progress | `#9c4a22` | `#ffffff` |
| 08 | Sanding / Finishing | `#7d5a2e` | `#ffffff` |
| 09 | Final Walkthrough | `#5f6b3a` | `#ffffff` |
| 10 | Complete | `#4a7a44` | `#ffffff` |
| 11 | Invoiced / Paid | `#3c5f34` | `#ffffff` |

"Done" stages for filtering active jobs: **Complete** and **Invoiced / Paid**.

### Typography
- **Headings:** Source Serif 4, weight 600. H2 page titles 29px; card metric numbers 32px; section headers (H4) 16px.
- **Body:** Source Serif 4, ~13–14px, weight 400; 600 for emphasis.
- Numbers in tables use `font-variant-numeric: tabular-nums`.
- The serif is the UI chrome too — **no sans-serif anywhere**.

### Spacing / shape
- Card/panel radius 10–14px; pills 100px; buttons per design system.
- Stage pills: `padding: 5px 12px; font-size: 11.5px; font-weight: 600`.
- Table rows separated by hairline rules, not boxes. Sections separated by whitespace.

### Icons
Prototype uses Unicode glyphs as placeholders (▤ ◧ ▦ ◉ ⚙). Replace with a real icon set
(the source design system specifies **Phosphor, duotone**).

---

## Screens / Views

### Web — shared shell
- **Left sidebar** (224px, `#efe7d8`, right hairline): brand mark (3 stacked wood-grain bars in
  `#8a5a2b`/`#a9581f`/`#c39a5a`) + "Baseboard / FLOORING PM"; nav items Projects, Dashboard,
  Schedule, Map, Admin; footer user chip (avatar `#8a5a2b`, "Rick Mallory / Owner").
- **Active nav item:** filled `#8a5a2b`, text `#f4efe6`, weight 600. Inactive: transparent, text `#2a2018`.
- **Main area:** `#f4efe6`, min-height 720px, ~26–30px padding.

### Web — Projects (default)
- Header: H2 "Projects" + subtitle "{active} active jobs · {pipeline $} in pipeline". Right side:
  search field ("Search address or client…"), Filter (secondary btn), **+ New project** (primary btn).
- **Table** columns (fixed layout, widths): Project 30%, Sq Ft 9% (right), Species/product 16%,
  Crew 11%, Dates 13%, Budget 10% (right), Stage 16%.
  - Project cell: 4px left border in the row's stage color; line 1 address (600), line 2 "city · client" (muted).
  - Stage cell: colored pill per the table above.
- Data: 10 sample projects (see the file's `data` array for exact values).

### Web — Dashboard
- 4 metric cards (grid): Active jobs, On site now, Sq ft booked, Pipeline ($). Card = surface, label
  (uppercase muted 11px), value (serif 32px), sub (12px).
- Two columns below: **Projects by stage** (horizontal bars, width = count/max, bar color = stage color,
  count at right) and **Starting soon** (list: color rail, address, detail, date at right).

### Web — Schedule
- H2 "Schedule" + "Week of March 3 · crews and installs".
- 5-column grid (Mon–Fri). Each day = surface card, min-height 300px, header "DOW / date", then event
  blocks colored by stage: time (small), address (600), label.

### Web — Map
- H2 "Map" + note that it's a placeholder to wire to a real map service.
- 2 columns: left a stylized SVG street map (`#e9e0cf`) with teardrop pins colored by stage; right a
  legend list of all projects (color dot + address + city). **Replace the SVG with a real map
  (Mapbox/Google/Leaflet); geocode project addresses to plot pins.**

### Web — Admin
- H2 "Admin" + "Team, workflow, and company settings". 2 columns (1.35fr / 1fr):
  - **Team & crews** (left): "+ Invite member" (secondary btn) + table — Member (avatar+name+email),
    Role, Crew, Access pill. Access levels & pill colors: **Full** `#3c5f34`/#fff, **Standard**
    `#8a6d3b`/#fff, **Field only** `#cbb488`/`#3a2e18`. 6 sample members.
  - **Project stages** (right, top): all 11 stages listed with index, color chip, name, drag handle (⋮⋮) for reorder.
  - **Company** (right, bottom): Business name, Service area, Default markup, Crews — label/sub on left, value on right.

### Mobile — Today's schedule
- iPhone frame (372×762, notch/status bar). **Header** `#8a5a2b`, text `#f4efe6`: "TUESDAY, MARCH 4",
  H3 "Today's schedule", then 3 stats (stops / mi to drive / crew).
- **Job cards** (surface, radius 14px): top row time (accent) + stage pill; address (16px, 600);
  "city · client"; divider; bottom row "crew · note" + **Directions** button (filled `#8a5a2b`).
- **Tab bar** (`#efe7d8`, top hairline): Today (active, accent), Jobs, Map, More.
- 3 sample jobs for the day.

---

## Interactions & Behavior
- **Web nav:** clicking a sidebar item switches the main view. In production these are routes.
- **Stage pills:** display-only here; in production make them an editable dropdown/select that
  advances a project's stage (this is the core action, like moving a monday.com item between groups).
- **Buttons:** hover = accent 600 (`#744a22`), pressed = accent 700 (`#5e3b1a`); focus-visible = 2px
  accent outline, 2px offset. Apply to all interactive elements.
- **Admin stages:** drag handles imply drag-to-reorder the pipeline.
- **Mobile Directions:** should deep-link to the device maps app with the job address.
- **Search / Filter / New project / Invite / Edit:** wire to real create/filter flows.

## State Management
Per-project record fields: `address`, `city`, `client` (name + contact), `sqft`, `species`
(product), `crew`, `startDate`/`endDate`, `budget`, `stage`, `materialsList`, plus geo lat/lng for
the map. Derived: active count (exclude done stages), pipeline $ (sum of active budgets), sq ft
booked, projects-by-stage counts. Team record: name, email, role, crew, accessLevel. Settings:
business name, service area, default markup, crew count. Data fetching: list projects, list team,
list settings; mutations for stage change, create project, invite member, reorder stages.

## Assets
None external. Brand mark is 3 rounded SVG rects (wood-grain bars). Map is a placeholder SVG —
replace with a real map library. Icons are Unicode placeholders — swap for Phosphor (duotone).

## Screenshots
`screenshots/` holds reference captures: 1-projects, 2-dashboard, 3-schedule, 4-map, 5-admin
(web views) and 6-mobile-today. Note the web frame is 1180px wide, so these captures are
cropped to the preview viewport — open `Baseboard.dc.html` in a browser for the full width.

## Files
- `Baseboard.dc.html` — the full prototype (template + logic). All sample data lives in the logic
  class (`data`, `stageMap`, `team`, `stageList`, `settings`, `week`, `todayJobs`, etc.) — read exact
  copy and values there.
