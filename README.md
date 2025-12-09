# Root Platform Claim Form

A Next.js single-page application for submitting engineer reviews and uploading attachments to Root Platform's API.

## Features

- Dynamic route-based form (`/{claim_number}`)
- Engineer review form with two fields:
  - Engineer Review of Damages
  - Engineer Suggested Work
- Image upload support (up to 5 images, max 4MB each)
- Next.js API route for backend processing
- Root Platform API integration helpers
- Server-side API key storage (never exposed to client)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your Root Platform API credentials:
```
ROOT_API_BASE_URL=https://sandbox.uk.rootplatform.com/v1/insurance
ROOT_API_KEY=your-root-api-key
```

Note: `ROOT_API_BASE_URL` defaults to the sandbox URL if not set. The API key is required.

## Development

Run the development server:
```bash
npm run dev
```

Access the form at: `http://localhost:3000/{claim_number}`

Example: `http://localhost:3000/CLM-12345`

## Deployment to Vercel

1. Push your code to GitHub
2. Import the project into Vercel
3. Set environment variables in Vercel:
   - Go to Project → Settings → Environment Variables
   - Add `ROOT_API_KEY` (and optionally `ROOT_API_BASE_URL`)
4. Deploy

## Project Structure

```
├── pages/
│   ├── index.js                          # Original demo form (optional)
│   ├── [claim_number].js                 # Engineer review form (dynamic route)
│   └── api/
│       ├── submit-claim.js               # Original API route (optional)
│       └── submit-claim/
│           └── [claim_number].js         # API route for engineer review
├── lib/
│   └── rootApi.js                        # Root Platform API helpers
└── package.json
```

## API Endpoints

- `GET /{claim_number}` - Engineer review form page
- `POST /api/submit-claim/{claim_number}` - Submit engineer review and upload attachments

## Root Platform API Integration

The app integrates with Root Platform's API:
- **Update Claim Blocks**: [PATCH /v1/insurance/claims/{claim_id}/blocks](https://docs.rootplatform.com/reference/update-multiple-block-states)
- **Create Attachment**: [POST /v1/insurance/claims/{claim_id}/attachments](https://docs.rootplatform.com/reference/claim-create-attachment)

All API calls are made server-side with the API key stored securely in environment variables.

