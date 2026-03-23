# Session Resume

## Current Project State
Repo-to-Product Accelerator now supports:
- repo fingerprint generation
- idea generation and scoring
- idea index override from CLI
- architecture generation with capabilitySnapshot
- backlog generation
- scaffold plan generation
- controlled apply mode
- template registry
- capability-aware template selection
- template manifest validation

## Working Pipeline Commands

### Developer Workflow CLI
pnpm exec tsx apps/cli/src/index.ts https://github.com/fatihsoyaltun/repo-to-product-accelerator --local-path . --idea-index 1 --apply

### Internal Analysis Console
pnpm exec tsx apps/cli/src/index.ts https://github.com/fatihsoyaltun/repo-to-product-accelerator --local-path . --idea-index 3 --apply

## Current Templates
- templates/node-cli-basic
- templates/dashboard-basic

## Last Completed Milestones
- architecture propagation bug fixed
- template registry added
- capability-aware template scoring added
- manifest validation added
- dashboard template apply bug fixed

## Current Known State
- apps/generated-cli exists
- apps/generated-dashboard exists
- template outputs are safe and skip existing files
- system is deterministic and fail-fast on invalid template manifests

## Next Planned Step
Implement template parameter replacement.

### First target
Support placeholder replacement like:
{{projectName}}

### Initial file to extend
services/scaffolder/src/index.ts

### First template already prepared
templates/node-cli-basic/index.js contains:
console.log("{{projectName}} CLI started");

## Resume Rule
Do not redesign the system.
Continue from template parameter replacement only.
