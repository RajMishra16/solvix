# Project Name: TeraWatt

**Team:** Sujal, Aritra, Senria, Nik  
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
