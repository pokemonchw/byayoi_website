---
name: byayoi-community-homepage
description: Follow Moon Shrine fan community homepage conventions when modifying this repository. Use for homepage planning, frontend implementation, content structure, styling, accessibility, deployment preparation, and validation for https://byayoi.org.
---

# 月之神社同人社区主页项目规范

## Project Shape

This repository is for building the new homepage of the 月之神社同人社区, currently associated with `https://byayoi.org`.

- Treat the homepage as a community-facing website, not a game, dashboard, or generic marketing template.
- Root `AGENTS.md` applies to the whole workspace. If subdirectory instructions are added later, follow the most specific applicable file.
- Keep the first screen focused on the community identity, current activity, navigation, and useful entry points for visitors.
- Prefer a small static frontend unless the repository later adopts a specific framework, build tool, or hosting workflow.
- Do not introduce a package manager, frontend framework, CMS, analytics service, or backend dependency unless the user asks or an existing implementation already depends on it.

## Product Direction

Design and implementation should support a fan community homepage with a clear, welcoming, and maintainable structure.

- Primary audience: community members, returning visitors, prospective members, contributors, and people looking for official links.
- Core jobs: explain what 月之神社 is, provide trusted navigation, surface announcements or recent updates, link to community spaces, and preserve a cohesive identity.
- The homepage should feel like a community portal rather than a corporate landing page. Avoid empty hype copy and stock SaaS patterns.
- Use Chinese as the default user-facing language unless the user requests another locale.
- Keep content easy to update. Announcements, links, featured projects, staff/contact entries, and footer metadata should be represented in clear data structures or obvious markup sections.

## Source And Content Authority

Use user-provided content as the primary source of truth.

- If existing site content, screenshots, brand assets, or copy are provided, preserve their meaning unless the user asks for a rewrite.
- If using `https://byayoi.org` as a reference, verify current content before making factual claims about it.
- Do not invent official statements, community rules, affiliation claims, or event dates.
- Mark placeholder copy clearly in code comments or visible draft text only when the user has not supplied final content.
- Do not copy third-party text, images, illustrations, music, logos, or character assets unless the user confirms the rights or the asset is already part of this repository.

## Implementation Style

Prefer direct, readable frontend code aligned with the current repository.

- Match the selected local stack once it exists. If the project starts empty, a static HTML/CSS/JavaScript implementation is preferred for the first homepage prototype.
- Keep files focused. Typical responsibilities are page structure, styles, small interaction scripts, static content data, and assets.
- Separate content from presentation where practical. Repeated sections such as links, announcements, projects, and social entries should be data-driven when that improves maintainability.
- Keep JavaScript minimal and deterministic. Use it for navigation state, theme toggles, small animations, filtering, or progressive enhancement only when needed.
- Avoid global mutable state except intentional module-level constants and small UI state objects.
- Do not rely on DOM text as source data when the same content drives multiple UI sections.
- Prefer semantic HTML before custom scripted behavior.

## Naming Rules

Names are part of the project contract and should remain stable.

- Use ASCII, stable, machine-readable IDs and filenames where possible, for example `siteLinks`, `announcementList`, `communityGroups`, `heroVisual`, and `footerNav`.
- Use Chinese for visible user-facing copy by default.
- Use `camelCase` for JavaScript variables, functions, object properties, and methods.
- Use `PascalCase` only for constructor functions, classes, and type-like factory names.
- Use `UPPER_SNAKE_CASE` for true constants that are not expected to vary by content updates.
- Boolean names should read as predicates, such as `isMenuOpen`, `hasAnnouncement`, and `shouldReduceMotion`.
- Functions that mutate UI state should use imperative names, such as `openMenu`, `closeMenu`, `applyTheme`, and `renderAnnouncements`.
- Functions that only compute or query should use descriptive non-mutating names, such as `getVisibleLinks`, `formatDateLabel`, and `prefersReducedMotion`.
- Avoid vague names such as `data`, `obj`, `item`, `temp`, `foo`, and `handleStuff` except in very small local scopes where the meaning is obvious.

## Data Shape Rules

Keep homepage content structures explicit and easy to diff.

- Generic catch-all containers are discouraged for site content. Avoid vague structures such as `data`, `values`, `extra`, `meta`, `payload`, and `Record<string, any>` unless the exact key contract is documented nearby.
- For repeated homepage content, prefer named structures such as `SiteLink`, `Announcement`, `FeaturedProject`, `CommunityChannel`, `StaffProfile`, and `FooterSection`.
- Every navigational link entry should include at least a stable ID, visible label, URL, and short purpose when practical.
- Every announcement entry should include at least a stable ID, title, date or date label, summary, and target URL when it links elsewhere.
- Dates should use an unambiguous machine-readable format such as `YYYY-MM-DD` in data, with localized display formatting handled separately.
- Keep URLs in data fields, not embedded inside display strings, when the link is part of a repeated component.
- Do not store presentation-only state as source content. Class names and animation flags should live in rendering or styling code.

## Comments And Documentation

Comments should clarify intent, content contracts, and non-obvious behavior without cluttering simple markup.

- Public modules or major sections should start with a short Chinese comment explaining what the section owns.
- Add JSDoc or adjacent schema comments for reusable JavaScript content structures and helper functions.
- Comment non-obvious layout decisions, responsive constraints, accessibility workarounds, and animation choices.
- Do not write comments that merely repeat the code.
- Do not leave vague TODO comments. If a TODO is unavoidable, include concrete context, for example `// TODO: 用户提供正式社群链接后替换占位 URL。`
- Keep comments close to the code or content they explain.

## Visual And UI Guidance

Build a usable community homepage, not an empty splash screen.

- The first viewport should clearly show the 月之神社 identity, concise positioning copy, primary navigation, and at least one useful action or destination.
- Include sections visitors naturally expect from a community homepage: introduction, official links, announcements or updates, featured community content, joining/contact path, and footer.
- Use visual assets when building the site. Prefer repository-owned images, user-provided assets, or generated/created assets with clear rights.
- Do not use decorative visuals that obscure important text or make the site feel unrelated to the community.
- Avoid card-heavy generic SaaS layouts when a denser community portal structure is more useful.
- Keep text readable and scannable on mobile and desktop. Text must not overlap, clip, or depend on hover-only discovery.
- Use stable responsive constraints for fixed-format UI elements such as navigation bars, link grids, announcement lists, and media blocks.
- Do not scale font size directly with viewport width. Use responsive layout changes instead.
- Respect reduced-motion preferences for animations and transitions.
- Use icons only when they improve recognition. Provide accessible names for icon-only controls.

## Accessibility And Semantics

Accessibility is part of the implementation, not a final polish pass.

- Use semantic landmarks such as `header`, `nav`, `main`, `section`, and `footer`.
- Keep heading order logical and useful for screen readers.
- All meaningful images need `alt` text. Decorative images should use empty `alt=""` or CSS backgrounds as appropriate.
- Interactive elements must be keyboard reachable and visibly focusable.
- Navigation menus, toggles, modals, and disclosure widgets must expose correct ARIA state when custom behavior is used.
- Maintain sufficient color contrast for body text, links, buttons, and focus indicators.
- Do not hide essential information behind pointer hover only.

## Content And Legal Boundaries

Respect community trust and third-party rights.

- Do not present the site as officially affiliated with any external IP holder unless the user provides that wording.
- Use neutral wording for fan/community identity when affiliation is unknown.
- Do not include user personal information, private contact details, or moderation-only links unless explicitly provided for publication.
- External links should be clear about their destination when the label alone is ambiguous.
- If fan works, screenshots, illustrations, or media embeds are added, keep attribution and permission notes close to the relevant data or asset.

## Formatting Rules

Formatting consistency is mandatory within touched files.

- Use 4-space indentation for new HTML, CSS, JavaScript, and JSON-like data unless an existing file clearly uses another style.
- Use semicolons in JavaScript.
- Use double quotes for HTML attributes, JavaScript strings, stable IDs, and Chinese visible text unless a local file consistently uses single quotes.
- Keep repeated content objects vertically formatted when they contain multiple fields.
- Keep line length reasonable for review. Long copy may wrap naturally when readability improves.
- Do not make whitespace-only changes outside the lines you are materially editing.

## Validation

Use the narrowest useful validation for the files changed.

- For a static homepage, validate by opening the HTML file directly when possible.
- If browser module loading, routing, or local assets require a server, start a minimal local dev server and report the URL.
- When changing layout or responsive behavior, check at least a mobile-width and desktop-width viewport.
- When changing JavaScript behavior, exercise the affected interaction manually and run any available tests or lint commands.
- If no automated tests exist, state the manual validation performed.

## Change Discipline

Keep changes narrow and aligned with the homepage goal.

- Before changing an existing implementation, inspect the closest local code and follow its conventions.
- Do not rename large sets of files, restructure directories, or run broad formatters unless explicitly requested.
- Do not treat generated or third-party-like files as primary authoring locations.
- Keep assets organized and avoid committing large binary files unless they are necessary for the homepage.
- When uncertain whether a requirement belongs in project documentation or code, implement the smallest coherent behavior and note the assumption in the final response.
