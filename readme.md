# Tiny AI Office | React Static App

Tiny AI Office is a responsive client-side React app that presents an AI web agency as a virtual office. Visitors complete intake, submit a brief, watch the agency work desk by desk, review a generated website preview, and then receive the full delivery pack.

The office scene is powered by a plain JavaScript canvas engine. Characters are drawn with pixel-art functions, move between desks for handovers, and the camera supports bounds, smooth desk focus, drag-to-pan, zoom, and responsive resizing.

## Run locally

```bash
npm install
npm run dev
```

Build the static app with:

```bash
npm run build
```

The compiled files are written to `dist/` and can be hosted by any static web host.

## Project structure

```text
index.html
src/
  App.jsx
  main.jsx
  styles.css
  components/
    ChatDock.jsx
    DetailsModal.jsx
    Hud.jsx
    MenuModal.jsx
    Modal.jsx
    OfficeScene.jsx
    OutputsModal.jsx
    PauseModal.jsx
    Toast.jsx
  data/
    employees.js
    outputs.js
    steps.js
  hooks/
    useAgencyController.js
  game/
    OfficeCanvasEngine.js
  services/
    openai.js
    storage.js
  utils/
    text.js
```

## Main flow

1. Nova asks whether the visitor is returning or new.
2. Returning customers load saved sessions by email from local browser storage.
3. New customers enter email and complete the client details form.
4. The visitor pastes the client brief.
5. The agency runs autonomously until the website preview needs approval.
6. If approved, the agency completes QA notes and a project PDF with invoice draft.
7. If changes are requested, Kai revises the preview and asks for approval again.

## Game controls

- Drag the office scene to pan around the floor.
- Use the mouse wheel to zoom on desktop.
- Tap a desk to inspect that employee.
- On mobile, the camera uses tighter zoom and the speech panel is constrained so the game remains usable on small screens.

## Model settings

Open **Office Menu > Settings** to add either an OpenAI API key for local testing or a proxy endpoint for production. Direct browser API keys are not safe for public production use.

Default routing:

- Fast model: `gpt-4.1-mini`
- Complex model: `gpt-4.1`

## Persistence

Sessions are saved in `localStorage`, keyed by email. Refreshing the page starts a clean welcome flow, but entering the same email loads the saved returning-customer project. Saved data includes client details, brief, outputs, progress, task log, conversation log, settings, and optional remembered API key.
