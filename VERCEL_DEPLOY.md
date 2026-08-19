# Deploy EvidenceQuorum to Vercel

EvidenceQuorum is a static React/Vite showcase and can be deployed on Vercel’s free Hobby hosting for a personal or non-commercial project. The repository now includes `vercel.json` with the required build and output settings.

## GitHub import

Create a GitHub repository and upload the contents of this project. In Vercel, choose **Add New Project**, select the repository, and keep the detected framework as **Vite**. The checked-in configuration uses the following settings:

| Setting | Value |
|---|---|
| Install command | `pnpm install --frozen-lockfile` |
| Build command | `pnpm build` |
| Output directory | `dist/public` |
| Framework | `Vite` |

Click **Deploy**. Vercel will issue a free `vercel.app` URL. No environment variables are required for the showcase itself.

## CLI alternative

From the project root, install the Vercel CLI if it is not already available, authenticate with the user’s Vercel account, and run `vercel`. When prompted, choose the existing project directory. The checked-in `vercel.json` supplies the build configuration.

## Important compatibility note

The hero, texture, evidence-map, and logo images are referenced through the Manus WebDev asset URLs returned during generation. They are public URLs tied to the Manus project lifecycle. They should remain reachable while that project exists, but for a fully independent Vercel deployment, download or regenerate equivalent assets and place them in a Vercel-compatible external asset host or repository-backed CDN before importing the project.

The site is frontend-only. It does not require the server directory, a database, authentication, or a backend runtime. The GenLayer documentation links are external references and do not require environment variables.
