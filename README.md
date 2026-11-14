# GALIA — preventive health for Lithuania

One blood test a year, **100+ biomarkers**, a doctor-approved plan and an AI assistant — for **€149/year**.
GALIA fills the missing middle between DIY lab panels (€50–400, no explanation) and longevity programs (~€3,000).

**Live demo:** https://galia-five.vercel.app

## Repository
| Folder | What |
|---|---|
| `web/` | Web MVP (vanilla JS/HTML/CSS, LT/EN): landing, dashboard, 84 biomarkers, lab upload with unit conversion, personal plan, AI assistant, employer view, settings |
| `pitch/` | Pitch video in Remotion (React + TypeScript), Lithuanian and English versions with AI voice-over |
| `prototype/` | Clickable mobile-app prototype |
| `brand/` | Logo (SVG/PNG) |

## Run locally
```bash
# web MVP — static, no build step
cd web && npx serve .

# pitch video
cd pitch && npm install
npx remotion studio            # preview
npx remotion render GaliaPitchEN out/GALIA_pitch_EN.mp4
npx remotion render GaliaPitch   out/GALIA_pitch_LT.mp4
```

## AI in demo mode
`web/app.js` has `AI_LIVE=false`: the API key is not connected, so the assistant, plan generator and lab-report reader use prepared answers (`web/canned.js`) and a pre-parsed sample report. The live prompts (report extraction with unit conversion, plan generation, results-aware assistant) are already in the code.

> Hackathon prototype. Sample data. Not medical advice.
