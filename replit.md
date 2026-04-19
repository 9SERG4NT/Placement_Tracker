# PlacementIQ — AI-Powered Placement Risk Modeling System

## Overview

A full-stack fintech intelligence platform for education loan lenders to assess and manage employability risk for student borrowers. Built to the PlacementIQ PRD v1.0.

## Features

- **Dashboard**: Portfolio-level KPIs, placement trend charts, risk distribution, salary distribution by field, cohort breakdown, active alerts snapshot
- **Student Portfolio**: Searchable/filterable table of all student borrowers with risk bands, placement scores, institute tier badges, loan amounts
- **Student Risk Profile**: Full risk card with placement probability gauges (3m/6m/12m), SHAP-style risk factors, AI-generated risk narrative, expected salary range, next-best-action recommendations
- **Early Alerts**: Feed of critical/high/medium alerts with acknowledge functionality, days-to-EMI-start countdown
- **Institute Directory**: Partner institutes with placement rates, salary benchmarks, tier grades

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **Frontend**: React + Vite, Tailwind CSS, Recharts, Framer Motion, wouter routing
- **Backend**: Express 5 API server
- **Database**: PostgreSQL + Drizzle ORM
- **API codegen**: Orval (from OpenAPI spec at lib/api-spec/openapi.yaml)
- **Build**: esbuild (CJS bundle for API server)

## Architecture

- `artifacts/placementiq/` — React + Vite frontend (served at `/`)
- `artifacts/api-server/` — Express API server (served at `/api`)
- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/api-client-react/` — Generated React Query hooks
- `lib/api-zod/` — Generated Zod validation schemas
- `lib/db/` — Drizzle ORM schema and database client
- `scripts/src/seed.ts` — Database seed script

## Key Commands

- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run build` — build API server
- `pnpm --filter @workspace/scripts run seed` — seed database with sample data

## AI Scoring Engine

The scoring engine (`artifacts/api-server/src/lib/scoring.ts`) implements:
- Placement probability computation (3m/6m/12m) based on CGPA, institute tier, internship quality, certifications, job portal activity, field demand, macro climate, and placement cell effectiveness
- Salary range estimation (low/median/high) using course-type baselines and multipliers
- Risk band classification (low/medium/high) based on 6m placement probability thresholds
- SHAP-style positive/negative factor extraction with human-readable descriptions
- AI-generated risk narrative in plain English
- Next-best-action generation (skill-up, resume, mock interview, recruiter match, counselling, EMI restructure)

## Database Schema

- `institutes` — Partner institute data with placement rates and tier information
- `students` — Student borrowers with academic profile, loan details, and computed risk scores
- `alerts` — Early warning alerts for high-risk students
