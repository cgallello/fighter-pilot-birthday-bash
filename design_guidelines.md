# F-35 Birthday Registration - Design Guidelines

## Design Approach: Playful Military Aesthetic

**Reference Direction:** Blend serious military aviation UI (fighter jet HUD interfaces, tactical displays) with bright, approachable birthday party vibes. Think "Top Gun meets Chuck E. Cheese" - tactical precision with childish joy.

**Core Design Principle:** Contrast serious F-35 military elements with unexpectedly playful execution. Use authentic aviation UI patterns but render them in cheerful colors with corny microcopy.

---

## Color Palette

### Primary Colors (Light Mode)
- **Sky Blue:** 205 85% 65% - Primary brand, evokes clear skies for flying
- **Jet Gray:** 210 15% 25% - Headers, primary text, serious military elements
- **Cockpit Dark:** 215 20% 15% - Navigation, footers, contrast elements

### Accent Colors
- **Afterburner Orange:** 25 95% 60% - CTAs, active states, excitement moments
- **Radar Green:** 145 65% 50% - Success states, "mission accomplished" feedback
- **Warning Yellow:** 45 90% 65% - Alerts, important notices (sparingly)

### Neutral Palette
- **Cloud White:** 0 0% 98% - Backgrounds, cards
- **Contrail Gray:** 210 10% 90% - Secondary backgrounds, borders
- **Tactical Text:** 215 15% 35% - Body text

### Surface Treatments
- Card backgrounds: Cloud White with subtle Jet Gray borders
- Primary buttons: Afterburner Orange gradient (30 95% 60% to 25 95% 50%)
- Hover states: 8% brightness increase + subtle box-shadow (0 4px 12px rgba(0,0,0,0.1))

---

## Typography

**Font Families (via Google Fonts):**
- **Headers:** "Rajdhani" - Bold (700), SemiBold (600) - Angular, technical, military-inspired
- **Body:** "Inter" - Regular (400), Medium (500) - Clean, readable, modern
- **Accents:** "Rajdhani" Medium (500) for button text and labels

**Type Scale:**
- Hero headline: text-6xl (Rajdhani Bold) - "OPERATION: THIRTY-FIVE"
- Section headers: text-3xl (Rajdhani SemiBold)
- Card titles: text-xl (Rajdhani SemiBold)
- Body text: text-base (Inter Regular)
- Microcopy/labels: text-sm (Inter Medium, uppercase, tracking-wide)
- Button text: text-base (Rajdhani Medium, uppercase)

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 8, 12, 16, 24 for consistent rhythm
- Component padding: p-4, p-6, p-8
- Section spacing: py-12, py-16, py-24
- Gap between elements: gap-4, gap-6, gap-8

**Container Strategy:**
- Max-width: max-w-6xl for content sections
- Full-width for hero and schedule sections
- Responsive padding: px-4 (mobile), px-6 (tablet), px-8 (desktop)

**Grid Layouts:**
- Schedule columns: 2-column grid (lg:grid-cols-2) for Fair Weather vs Rain Plan
- Event cards: Stack vertically within each column
- Admin roster: Responsive table with sticky headers

---

## Component Library

### Navigation Header
- Fixed top navigation with backdrop blur
- Logo area: Cartoon F-35 silhouette + "Operation: Thirty-Five" wordmark
- Right-aligned: Admin link (if applicable)
- Subtle contrail divider (linear gradient fade)
- Background: Cloud White/90 with backdrop-blur-sm

### Hero Section
- **Large hero image:** Yes - Wide-angle shot of F-35 in flight against blue sky with clouds
- Image treatment: Subtle overlay (Jet Gray at 20% opacity) for text contrast
- Centered headline: "MISSION BRIEFING" (Rajdhani Bold, text-6xl, text-Cloud White)
- Subheading: Event details in playful military language
- Primary CTA: "ENLIST NOW" button (Afterburner Orange, variant="default")
- Height: min-h-[70vh] with background-cover, background-center

### Registration Form Card
- Elevated white card (shadow-lg) over hero or separate section
- Form fields with military labels:
  - "CALLSIGN" (Name)
  - "SECURE COMMS" (Email)
  - "SCRAMBLE LINE" (Phone - required with helper text)
  - "MISSION BIO" (Personal description)
- Input styling: border-2, rounded-lg, focus:ring-2 focus:ring-Sky Blue
- Submit button: "CONFIRM DEPLOYMENT" (Afterburner Orange, full-width)

### Schedule Display
- **Two-column layout (desktop):** Side-by-side comparison
- Column headers with weather icons:
  - "☀️ FAIR WEATHER OPS" (left)
  - "🌧️ RAIN CONTINGENCY" (right)
- Sticky headers on scroll
- Mobile: Tab interface to switch between plans

### Event Block Cards
- White background with Contrail Gray border
- Top stripe: 4px Afterburner Orange accent
- Structure:
  - Time badge (Rajdhani Medium, uppercase, Tactical Text)
  - Event title (text-xl, Rajdhani SemiBold)
  - Location with map pin icon + link
  - Description text (Inter Regular)
  - RSVP toggle button
- Hover state: Subtle lift (transform translateY(-2px))

### RSVP Toggle Buttons
- Joined state: Radar Green background, "🎯 TARGET LOCKED"
- Not joined state: outline variant with Jet Gray, "JOIN MISSION"
- Toggle animation: Smooth color transition (300ms)
- Icon changes based on state
- Clear visual feedback

### Mission Bio Editor (with SMS verification)
- Modal overlay or dedicated section
- Two-step flow:
  1. Phone confirmation screen (if needed)
  2. SMS code entry: 6 individual boxes with auto-advance
- Code input: Large text (text-2xl), monospace feel
- "SEND SCRAMBLE CODE" button (Afterburner Orange)
- Success state: "✅ CALLSIGN CONFIRMED" with Radar Green
- Editor: Textarea with character count, save button

### Admin Panel
- Clean dashboard layout with section cards
- Event management: Table view with drag handles for reordering
- Guest roster: Searchable table with RSVP status badges
- RSVP matrix view: Grid showing all guests vs all events
- Visual indicators:
  - Joined: Radar Green badge
  - Not joined: Contrail Gray badge
  - Total counts per event

### "My Selections" Summary
- Sticky sidebar or bottom sheet (mobile)
- Lists all joined events with quick links
- Total count badge
- "REVIEW DEPLOYMENT" button to scroll to schedule

---

## Visual Elements

### F-35 Theme Integration
- **Header:** Cartoon F-35 silhouette (simplified, friendly outline)
- **Background patterns:** Subtle radar sweep SVG (low opacity), grid lines reminiscent of HUD
- **Dividers:** Contrail trails (horizontal gradient lines with fade)
- **Icons:** Mix of military (target reticle, radar ping) and party (🎂, 🎉, 🎈)

### Microcopy Style
- Military jargon made silly: "Pre-Flight Check," "Pilot Roster," "Mission Status"
- Button text: UPPERCASE, action-oriented
- Success messages: "Mission accomplished!" with emoji
- Error states: "Off-target. Try again, pilot!"

### Accessibility
- Focus rings: 2px Sky Blue outline with 2px offset
- Color contrast: All text meets WCAG AA (4.5:1 minimum)
- Interactive elements: Minimum 44x44px touch targets
- Reduced motion: Disable animations when prefers-reduced-motion

---

## Images

### Hero Section
- **Large hero image:** F-35 Lightning II in flight
- Image description: Wide-angle aerial photograph of an F-35 against bright blue sky with white clouds, aircraft angled dynamically
- Placement: Full-width hero section, 70vh height
- Treatment: Dark overlay gradient (bottom to top, Jet Gray 40% to 0%) for text legibility

### Optional Supporting Images
- Admin panel header: Cockpit view (subtle background)
- Success confirmation: Thumbs up pilot silhouette or cartoon jet with party hat

---

## Responsive Behavior

**Mobile (< 768px):**
- Single column layout for schedule (tabs to switch plans)
- Stack form fields vertically
- Simplified navigation (hamburger menu if needed)
- Full-width buttons

**Tablet (768px - 1024px):**
- Begin showing two-column schedule
- Maintain spacing hierarchy
- Larger touch targets

**Desktop (> 1024px):**
- Full two-column schedule side-by-side
- Optimal reading width for forms
- Hover states fully active