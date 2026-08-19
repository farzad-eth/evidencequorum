# Deployment rename

The GitHub repository was renamed to https://github.com/farzad-eth/evidencequorum.

The Vercel project was renamed to `evidencequorum`.

The verified public deployment URL is https://evidencequorum-showcase.vercel.app/.

The shorter apex alias https://evidencequorum.vercel.app/ is not assigned and returned Vercel `DEPLOYMENT_NOT_FOUND`; Vercel’s domain dialog showed no matching domain. The stable `evidencequorum-showcase.vercel.app` alias remains attached and serves the homepage successfully.


## Project Edition handoff state — 2026-08-16

The connected GitHub repository is https://github.com/farzad-eth/evidencequorum on the main branch. It currently contains the earlier flattened static bundle from the initial Vercel deployment, not the new Project Edition source tree.

The connected Vercel project is `evidencequorum` under the user’s Hobby team. Its overview is open and its production deployment is connected to the GitHub repository. The next handoff action is to update the repository contents so Vercel can build the Project Edition from the current source.


## Project Edition commit — 2026-08-16

The four validated production files were uploaded to https://github.com/farzad-eth/evidencequorum and committed directly to the main branch with commit `693b197` titled `Deploy EvidenceQuorum Project Edition`. Vercel is connected to this repository, so the next step is to monitor the production deployment and verify the public URL.


## Corrective Vercel deployment — 2026-08-16

The first Project Edition deployment failed because the uploaded flat bundle still contained a Vite build configuration that referenced a missing package install/build context. The Vercel configuration was corrected to static-only output (`framework: null`, `outputDirectory: .`, SPA rewrite), committed as `2dec36f`, and Vercel reported the deployment Ready.

The verified deployment alias is https://evidencequorum-hi85nlepc-abc-e8ca.vercel.app/. The public page title is `EvidenceQuorum — Verifiable Evidence for the Intelligent Web` and it is serving the static site bundle.


## URL troubleshooting resolution — 2026-08-16

Both reported Vercel URLs returned the HTML shell but rendered blank because `index.html` referenced `/assets/index-CY8FogYN.js` and `/assets/index-C_9HZz1d.css`, while the flat GitHub bundle stored them as `/index.js` and `/index.css`. The root-relative references were corrected and committed as `8603f28`. Vercel deployment `evidencequorum-ktn8il8oh-abc-e8ca.vercel.app` reported Ready, and its public page now renders the full EvidenceQuorum workspace with interactive controls and Project Edition sections.


## Short alias — 2026-08-16

Attached `eq-proof.vercel.app` to the Vercel project as a Production domain. The alias reports Valid Configuration and renders the complete EvidenceQuorum Project Edition. This is the preferred public website URL for contribution evidence.

## Source-repair deployment verification — 2026-08-19

The Vercel project dashboard showed a Ready production deployment from GitHub commit `49ab8d6` (`Update publish-repaired-source.yml`) at the beginning of the source-repair verification. The successful workflow-free source publication run subsequently created the full-source commit, so the next action is to verify that Vercel receives the newer commit and builds the Vite project successfully before the contribution is revised.

Vercel has now received the full-source commit (`Repair EvidenceQuorum source package and live GenLayer client`) but reports its deployment as **Error**. The older `49ab8d6` static deployment remains Ready on `eq-proof.vercel.app`; the failed Vite build must be diagnosed from Vercel logs before the public evidence can be updated.

The failed source commit is `3428ba8`. Vercel reports that `pnpm install --frozen-lockfile` exited with status `254`; the next verification action is to inspect the installation log and correct the repository’s Vercel project configuration or lockfile compatibility.

The deployment’s Logs tab contains no runtime request logs and does not expose the build-install details. The failure must therefore be addressed through the source package and deployment configuration, then confirmed through a fresh Vercel build.

The missing dependency patch was restored as GitHub commit `c3b170a` (`Create wouter@3.7.1.patch`). This should trigger a fresh Vercel build whose first dependency-install failure can now be rechecked.

The `c3b170a` Vercel production deployment is **Ready** at `https://evidencequorum-5srq6cvhz-abc-e8ca.vercel.app`, with the Production aliases `https://eq-proof.vercel.app/` and `https://evidencequorum-showcase.vercel.app/` attached. The next step is a browser-level check that the public alias exposes the live GenLayer contract state rather than the previous local-only workflow.

Public browser verification at `https://eq-proof.vercel.app/` completed successfully. The site resolves the deployed GenLayerJS `count()` read to **0 canonical records**, displays `LIVE READ CONNECTED`, identifies the contract `0xec…8e89`, and clearly labels preflight as non-writing while reserving `attest` and `challenge` for explicit browser-wallet transactions.
