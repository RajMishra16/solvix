# Project Name: TeraWatt

## Live Site
https://solvix-energy.vercel.app

**Team:** Raj, Sumit, Shashank  
**Track Chosen:** Renewables

## The Information Gap in Renewable Deployment
Even though solar panels are now far more affordable, farmers and other agricultural landowners still face a major barrier: figuring out whether solar makes sense on their own acreage. Right now, answering the basic question “What’s the energy potential of my fields?” means wrestling with terrain and shading maps, weather and production models, interconnection constraints, and local zoning rules.

As a result, many farmers have to hire consultants and wait weeks just to get a reliable estimate. Our project removes that friction by turning what used to be slow, expensive expert analysis into a fully digital, instant experience so farmers can evaluate solar potential on their land in minutes, not months.

## Ideation and Development Process
Our development process focused on bridging the gap between raw geospatial data and actionable user insights through a Multi-Agent System:

*   **Data Layering (The Digital Twin):** We integrated granular data sources to create a "Digital Twin" of the user's location.
    *   *Topology:* We utilized Mapbox and Three.js to fetch high-resolution elevation data and render accurate 3D terrain.
    *   *Meteorology:* We integrated environmental constraints to model wind and solar potential based on specific geographic coordinates.
*   **The Simulator Engine:** We built a custom 3D interactive simulator using React Three Fiber. Unlike static 2D calculators, this immersive environment allows for the spatial organization of hybrid assets, placing solar arrays and wind turbines directly onto the actual terrain geometry.
*   **Agentic Optimization:** We developed an Energy Architect agent powered by Gemini. Instead of manual placement, the agent uses intelligent prompting to autonomously generate layouts that satisfy user goals (e.g., Maximize kWh output under $50k budget).

## Final Solution and Intended Impact
TeraWatt is an intelligent, location-aware energy simulator that democratizes renewable system design.

### Key Features
*   **Site-Specific 3D Simulation:** Instant generation of a topologically accurate 3D environment populated with real-world terrain constraints.
*   **Agentic Builder:** An AI agent that autonomously designs valid system configurations (Solar/Wind) tailored to user constraints (Budget, Power Needs, Green Energy Maximization).
*   **Scenario Modeling:** The system calculates and compares scenarios, such as "Maximum Theoretical Output" vs. "Cost-Optimized Build," providing detailed CAPEX vs. Yield breakdowns.
*   **Comprehensive Plan Analysis:** Delivers granular breakdowns of Production (monthly/daily), Financials (ROI, Payback, Tax Credits), and Environmental Impact (CO2 offsets, equivalencies), ensuring total transparency for investment decisions.
*   **Verified Metric Certification:** Automatically cross-references simulation data with utility-scale standards to provide certified, bankable reports.

## Authentication setup

Email/password and Google sign-in both use Supabase Auth. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the Supabase project's API settings. Restart the Next.js server after changing environment variables.

To enable Google sign-in:

1. In Google Cloud Console, configure the OAuth consent screen (add your account as a test user while the app is in testing) and create an OAuth client with application type **Web application**.
2. In Supabase, open **Authentication → Sign In / Providers → Google**, enable Google, and enter the Google OAuth client ID and client secret.
3. In Supabase **Authentication → URL Configuration**, set the Site URL to your production origin (for this project: `https://solvix-energy.vercel.app`). Add these Redirect URLs:
   - `http://localhost:3000/**` for local development.
   - `https://solvix-energy.vercel.app/**` for production. If you use another Vercel deployment or a custom domain, add its origin with `/**` too.
4. Copy the Supabase project's callback URL shown in the Google provider settings (typically `https://<project-ref>.supabase.co/auth/v1/callback`) into the Google OAuth client's **Authorized redirect URIs**. This is the Supabase callback, not the app's `/api/auth/callback` route.
5. Save both dashboards and restart the local Next.js server if you changed app environment variables. The Google client secret belongs only in Supabase; do not put it in `NEXT_PUBLIC_*` variables or commit it.

The app sends users back through `/api/auth/callback`, which exchanges Supabase's authorization code for a session and redirects them to `/home`. Test locally at `http://localhost:3000/login`; for production, use the deployed site's `/login`. Google OAuth can be limited to consent-screen test users until the Google app is published.

Email confirmation is enabled according to the Supabase project's Auth settings. New users must confirm their email before email/password sign-in. Supabase's built-in email service has strict sending limits; configure a custom SMTP provider in the Supabase dashboard if signup or password-reset emails are rate-limited.
