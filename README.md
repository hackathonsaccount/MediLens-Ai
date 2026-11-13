# MediLens AI

MediLens AI is an educational report-reading workspace. It helps people inspect extracted report text, learn common terms, browse general educational sources, and prepare editable questions for a clinician. It does **not** diagnose conditions, interpret personal results, or recommend treatment.

## Features

- Upload a PDF, JPG, or PNG for transient text extraction (10 MiB upload limit; PDF processing is limited to 20 pages).
- Review extracted sections, page locations, values, units, and printed reference ranges.
- Browse an English/Arabic glossary and educational references.
- Prepare, edit, copy, print, and download discussion notes.
- Explore a clearly labelled fictional report and optional sample-only explanations.
- Responsive liquid-glass interface with scroll reveals, reading progress, larger type, high contrast, reduced-motion support, and Arabic right-to-left layout.

## Important scope and privacy notes

Uploaded files are processed in memory for extraction and are not retained by the application. Report content is not sent to an AI provider. The optional OpenAI integration is limited to curated terms from the fictional sample; without `OPENAI_API_KEY`, the app uses a static sample explanation. Do not use the fictional sample, extracted labels, or this application as clinical guidance. Always discuss personal health concerns with a qualified clinician.

## Machine-learning section organizer

The API includes a scikit-learn TF-IDF/logistic-regression model that sorts extracted report lines into five document-layout categories. It is not trained to evaluate health results.

The training and evaluation data are synthetic and kept separate:

- `ml/dataset/train.csv` — 60 training examples
- `ml/dataset/test.csv` — 20 held-out test examples
- `ml/train.py` — trains the model and reports class metrics
- `artifacts/api-server/src/routes/section-classifier.ts` — performs inference with the generated model

Retrain the model with:

```bash
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r ml/requirements.txt
python ml/train.py
```

The current macro-F1 score is 1.00 on this small synthetic test split (four test rows per label). This is not evidence of real-world or clinical accuracy. A larger, independently labelled, representative dataset and appropriate review would be needed before making stronger claims.

## Tech stack

- React, TypeScript, Vite, Tailwind CSS
- Express API with TypeScript
- pnpm workspaces and shared API types
- Python and scikit-learn for the section organizer

## Getting started

### Requirements

- Node.js 22 or newer
- pnpm (the repository includes `pnpm-lock.yaml`)
- Python 3.10 or newer (only needed to retrain the ML model)

Install JavaScript dependencies from the repository root:

```bash
corepack enable
pnpm install
```

### Run the frontend

The Vite configuration requires both `PORT` and `BASE_PATH`:

```bash
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/medilens-ai run dev
```

Open `http://localhost:5173`.

### Run the API

In a second terminal:

```bash
PORT=5000 pnpm --filter @workspace/api-server run dev
```

The API build is generated into `artifacts/api-server/dist/` when the command runs. Set `OPENAI_API_KEY` only if you want to enable the optional fictional-sample explanation integration. Never commit API keys or `.env` files.

## Useful checks

Run these commands from the repository root:

```bash
pnpm --filter @workspace/medilens-ai run typecheck
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/mockup-sandbox run typecheck
pnpm --filter @workspace/api-server run build
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/medilens-ai run build
```

## Repository layout

```text
artifacts/
  api-server/       Express API and report-processing routes
  medilens-ai/      Main React/Vite application
  mockup-sandbox/   UI mockup sandbox
lib/
  api-client-react/ Shared React API client
  api-spec/         OpenAPI specification and code generation
  api-zod/          Shared Zod schemas
  db/               Database package and schema
ml/                 Synthetic training/evaluation data and training script
scripts/            Workspace scripts
```

## Contributing

Please open an issue to discuss substantial changes before submitting a pull request. Do not include real patient records, personal health information, API credentials, or other private data in issues, commits, or test fixtures.
