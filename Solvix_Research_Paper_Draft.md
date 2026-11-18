# Solvix: A Geospatial Web Platform for Preliminary Renewable Energy Site Planning

**Raj Mishra**, **Shashank Das**, and **Sumit Kumar Singh**  
Department of Information Science and Engineering  
Atria Institute of Technology, Bengaluru, India  

**Project Guide:** Deepak NR  
Department of Information Science and Engineering  
Atria Institute of Technology, Bengaluru, India  

## Abstract

Early-stage renewable-energy planning requires geographic, topographical, meteorological, and economic information. This paper presents Solvix, a browser-based geospatial platform for preliminary site planning that combines map-based area selection, terrain visualization, planning constraints, and energy and financial summaries. The implementation uses the Next.js App Router, React, TypeScript, Leaflet, Three.js with React Three Fiber, and Zustand. For a Bengaluru test coordinate (13.0547° N, 77.5963° E), the Open-Meteo historical archive returned 1,826 daily records for 2021–2025, with mean horizontal shortwave radiation of 5.531 kWh/m²/day, mean temperature of 23.20 °C, and mean precipitation of 1,007.9 mm/year. The European Commission Joint Research Centre's PVGIS API reported 1,519.82 kWh/year for a 1 kWp crystalline-silicon system using ERA5 data for 2005–2023. A controlled local test of the Solvix analysis route returned 12,000 kWh/year for a 5 kW system, 57.9% above the PVGIS result scaled to 5 kW; however, the route's forecast request returned HTTP 400 and its response used default values. The difference is therefore an implementation diagnostic, not a measured prediction error. These provider datasets are modeled or reanalysis products, not measurements from an installed Solvix system. The study contributes a reproducible, location-specific resource-data comparison and a runtime assessment of the current analysis path.

**Index Terms—** renewable energy planning, geospatial web application, solar energy, terrain visualization, decision support, digital representation, preliminary feasibility.

## I. INTRODUCTION

Renewable-energy planning for a parcel of land combines several kinds of information. A preliminary assessment may need to consider the site boundary, land area, terrain, solar and weather conditions, equipment capacity, budget, energy goals, and estimated financial outcomes. For a landowner who is only exploring a project, collecting this information from separate mapping, weather, and financial tools can make it difficult to understand the relationship between the site and a possible energy system.

Digital representations and web-based decision-support applications offer a way to present site information and planning estimates in a common interface. Research on digital twins describes a range of relationships between physical assets, their digital representations, and data flows; the term does not by itself establish that a system has continuous, bidirectional synchronization with a physical asset [1]–[3]. This distinction is important for renewable-energy planning: a visual 3D terrain scene can assist exploration, but it does not prove that the scene or the resulting estimates are engineering-grade or continuously synchronized with field measurements.

Solvix is a web application prototype intended to support the first stages of renewable-energy site exploration. A user can select a geographic area, provide constraints, view a terrain scene, and review preliminary estimates and saved-plan summaries. The implementation combines client-side map and visualization components with server routes that retrieve or process site-related information. Plans are persisted in browser storage by the current application store.

The contributions of this paper are (1) a source-grounded description of the application workflow and data path, (2) a reproducible comparison of Bengaluru resource data from Open-Meteo and PVGIS, and (3) a runtime diagnostic comparing the application's reported output with an independent PVGIS baseline. The study does not claim measured improvements in energy yield, cost reduction, planning time, or user performance.

### A. Problem Statement

Prospective renewable-energy developers need an accessible way to explore whether a parcel merits further investigation. Solvix addresses the interface-level problem of bringing site selection, terrain visualization, constraint entry, and preliminary output estimates together. It does not resolve the full engineering problem of determining an installable or financeable system. That would require validated resource models, detailed equipment specifications, shading and orientation analysis, grid-interconnection information, jurisdiction-specific permitting data, and professional review.

### B. Research Questions

This study is guided by the following questions:

1. **RQ1:** How can a browser-based application integrate map-based land selection, three-dimensional terrain visualization, and preliminary renewable-energy planning outputs in one workflow?
2. **RQ2:** Which site inputs, external services, calculations, and persistence mechanisms are used by the current Solvix implementation?
3. **RQ3:** What implementation and validation limitations must be addressed before the prototype's outputs can be interpreted as reliable site-specific engineering or investment estimates?

### C. Scope and Contributions

The scope covers the software prototype, its data flow, its present estimation logic, and a reproducible single-location comparison against independent provider data. The contributions are:

1. A modular description of the application workflow and architecture, grounded in the repository.
2. A transparent account of the prototype's site-analysis equations and data dependencies.
3. A distinction between empirical provider inputs, deterministic heuristics, demonstration behavior, and fallback data.
4. A quantitative single-location resource-data comparison and an explicit account of the runtime behavior observed during testing.

## II. RELATED WORK

Digital-twin terminology spans multiple implementation levels. Kritzinger *et al.* classify digital-twin approaches in manufacturing according to their relationship between physical and digital systems, including the role of data exchange [1]. Semeraro *et al.* provide a systematic review of the digital-twin paradigm and its definitions and application areas [2]. In smart farming, Verdouw *et al.* discuss digital twins as a means of connecting agricultural operations, digital representations, and information systems [3]. These works motivate careful description of the relationship between a physical site and a digital representation.

Solvix's 3D scene is best described as an interactive digital representation of a selected site for planning exploration. The repository does not show a continuous sensor stream from an operating renewable installation, nor does it establish continuous synchronization between a field asset and the scene. The use of “digital twin” in product-facing material should therefore be qualified in a research paper; “geospatial 3D representation” or “digital site model” is more precise for the current prototype.

Solar-resource and yield estimation require explicit inputs and modeling assumptions. The European Commission's Photovoltaic Geographical Information System (PVGIS) provides an independent modeled baseline for the comparison in Section V [4]. The existence of such a baseline does not validate Solvix's estimates. Open-Meteo documents forecast variables including temperature, cloud cover, wind speed, and solar-radiation variables [5]. Its elevation endpoint describes its elevation data as based on the Copernicus DEM GLO-90 dataset and documents a 90 m resolution [6], [7]. These sources are relevant to the prototype's data flow, but provider data availability alone does not ensure suitable temporal resolution, coordinate accuracy, or engineering validity for a specific site.

Solvix differs from a standalone resource calculator in the way it combines a map-oriented workflow, interactive terrain visualization, user constraints, and saved-plan presentation. This is an interface and integration contribution rather than a claim of a new photovoltaic model. Section V reports a single-location comparison with PVGIS and clearly separates reference-model output from the application's runtime output.

## III. SYSTEM ARCHITECTURE AND METHODOLOGY

### A. Architecture Overview

Solvix is implemented as a Next.js web application using the App Router. The frontend is built with React and TypeScript. Leaflet and React Leaflet provide the map interface; Three.js, React Three Fiber, and Drei support the 3D scene. Tailwind CSS and reusable interface components support styling, while Framer Motion is used for transitions and progressive presentation. Zustand manages plan and draft-constraint state, with persistence configured in browser storage [8]–[11].

The application separates user-interface modules from server-side API route handlers. Relevant routes include site analysis, elevation retrieval, utility-tariff lookup, roof-segmentation integration, authentication, and a demonstration agent-optimization endpoint. External service configuration is environment-based. The application also contains a Gemini-compatible client helper, but the inspected repository does not establish a call path from the interactive analysis workflow to that helper; consequently, this paper does not attribute live analysis results to Gemini.

### B. User Workflow

The principal workflow begins when a user opens the application and enters the area-selection page. The map supports geographic navigation and area drawing. The selected polygon is represented as latitude/longitude coordinates and is used as input to subsequent site analysis. The user can set planning constraints, including financial preferences, energy goals, land constraints, technical preferences, and timelines through the planning interface.

When site analysis is requested, the client calls the site-analysis route with the selected coordinates and constraint values. The response includes estimated system and financial metrics, weather and irradiation fields, utility-tariff information, and rooftop/site metadata. The user can inspect a 3D terrain scene and summary metrics, save a plan, and open the overview page. A saved plan contains area coordinates and summary analysis values. The current Zustand store uses persistence under a browser-storage key; the repository does not establish a server-side plans database.

### C. Elevation and Terrain Processing

The elevation route validates that the request includes at least three coordinates, computes the polygon's bounding box, and samples a regular grid over that box. The implementation sets the grid width and height to 20, yielding 400 requested positions. The route divides positions into chunks of up to 100 and requests elevation values from Open-Meteo. The response includes the elevation values, grid dimensions, and bounds.

On the client, the terrain scene uses the elevation-grid data to construct a Three.js terrain surface. The code also computes slope, aspect, solar-suitability, and wind-suitability arrays for the terrain grid. If the elevation request fails, `lib/geo.ts` produces a 10-by-10 synthetic grid using deterministic trigonometric functions. This enables the scene to render but is not a measurement of the selected site's real elevation and must not be used as evidence of actual topography.

The scene requests placement information from a terrain placement route. The inspected route streams a predefined set of placement zones from `lib/placements.ts`; it does not perform an independently verified optimization of the user-selected parcel. The scene also has demo fallback zones if placement retrieval fails. Therefore, the current placement visualization should be described as demonstration or predefined placement behavior, not as a validated optimal layout.

### D. Site-Analysis Inputs and Equations

The site-analysis route computes a polygon center as the arithmetic mean of input latitudes and longitudes. It also derives an approximate acreage from the latitude and longitude spans of the polygon's bounding box:

\[
A_{\text{approx}}=\max\left(1,\left|\Delta\phi\,\Delta\lambda\,250{,}000\right|\right),
\tag{1}
\]

where \(\Delta\phi\) and \(\Delta\lambda\) are the latitude and longitude differences in degrees, and the result is treated as acres by the implementation. This is an approximation based on the bounding box, not the geodesic polygon-area calculation also present in `lib/geo.ts`. The two area methods can produce different values, particularly for irregular polygons and non-equatorial locations.

The route requests a three-day forecast from Open-Meteo and derives internal weather and radiation values from returned hourly arrays, with fixed defaults when data are absent. An estimated roof suitability factor is assigned according to absolute latitude: 0.88 below 30 degrees, 0.80 below 45 degrees, and 0.72 otherwise. The estimated roof capacity is:

\[
P_{\text{roof}}=\operatorname{clamp}
\left(A_{\text{approx}}\cdot0.9\cdot S_{\text{roof}}\cdot
\left(0.9+\frac{H_{\text{solar}}}{8}\right),5,2500\right),
\tag{2}
\]

where \(S_{\text{roof}}\) is the latitude-based suitability factor and \(H_{\text{solar}}\) is the route's derived daily solar value. The estimated system size is then adjusted by energy goal, storage selection, and target production:

\[
P_{\text{system}}=\operatorname{clamp}
\left(P_{\text{roof}}\cdot F_{\text{goal}}\cdot F_{\text{storage}}\cdot
\max\left(0.8,F_{\text{target}}\right),4,2500\right),
\tag{3}
\]

where \(F_{\text{target}}=E_{\text{target}}/4000\) when the target is nonzero and \(F_{\text{target}}=1\) otherwise. In the current code, the goal factor is 1.2 for income, 1.15 for independence, and 1 otherwise; the storage factor is 1.1 when storage is selected and 1 otherwise. Equation (3) is a software heuristic rather than a physical system-sizing model.

Annual production is estimated by:

\[
E_{\text{annual}}=\operatorname{clamp}
\left(P_{\text{system}}\cdot1700\cdot
\left(1+\frac{H_{\text{solar}}}{16}\right)\cdot
\left(1-\frac{C_{\text{cloud}}}{200}\right)\cdot
\left(1+\frac{V_{\text{wind}}}{100}\right),
12{,}000,4{,}500{,}000\right),
\tag{4}
\]

where \(C_{\text{cloud}}\) is the average cloud-cover value and \(V_{\text{wind}}\) is the effective wind-speed value used by the route. Equations (1)–(4) reproduce the current implementation's calculation structure; they are not validated physical models. In particular, short-term forecast values, defaults, unit assumptions, and the multiplicative wind adjustment require review before the output can be interpreted as annual photovoltaic yield.

The route estimates CO₂ offset as annual production divided by 2,500 and clamps the result between 12 and 15,000 tonnes. It estimates total cost primarily from system size and a storage add-on, applies a fixed incentive percentage, computes annual savings from estimated production multiplied by tariff, and calculates payback from net cost divided by annual savings. The code also calculates a 25-year ROI-like value. These calculations are assumption-driven; the current source does not establish a jurisdiction-specific financial model or validated emissions factor.

### E. Tariff, Roof, and AI-Related Integrations

The utility-tariff route classifies a country using address substrings, limited postal-code rules, or latitude heuristics. It uses a table of fixed regional rates unless optional provider settings are configured. The inspected code assigns INR as its default currency, including in the default rate table. As a result, displayed financial values should not be claimed as accurate for arbitrary countries or utilities without a validated tariff source and appropriate currency handling.

The roof-segmentation route can call an optional configured provider; if the provider is missing or fails, it returns local placeholder values, including zero roof capacity and panel count. The current source therefore does not demonstrate a universal roof-segmentation capability.

The repository includes a Gemini-compatible API client helper, but the inspected source search did not identify calls from the active area-analysis workflow. Separately, the agent optimization endpoint checks for a delegated-scope header and returns fixed demonstration fields such as ROI values and insights. These components do not establish that the saved estimates are produced by an AI agent or that an optimizer chooses a system layout.

### F. Plan Persistence and Analytics

The plan type includes site coordinates, constraints, analysis summary values, equipment placements, and financial fields. The Zustand store persists plan state in browser storage. The overview reads the saved plan and presents summary metrics. The analytics interface includes production, financial, and environmental sections.

The data-generation code for charts requires qualification. Monthly and hourly production curves use predefined seasonal and hourly factors with random variation. Cost breakdowns use fixed percentages; equipment items use fixed example product names and prices; incentive examples include location-specific labels. Cash-flow values are generated from simplified annual savings and degradation assumptions. These outputs are illustrative UI data, not evidence that these exact products, incentives, or yields are available or applicable to a selected site.

### G. Data Flow Summary

The following sequence summarizes the current implementation:

1. The user draws a polygon on the Leaflet map.
2. The client sends polygon coordinates and constraints to the site-analysis route.
3. The route requests weather and radiation values, performs heuristic calculations, and returns estimates and metadata.
4. The terrain flow requests a 20-by-20 elevation grid and renders a Three.js scene; synthetic terrain may be used if the request fails.
5. Placement visualizations use predefined route data or demo fallback zones.
6. The user saves plan summary values in the client-side Zustand store.
7. The overview and analytics components render saved or illustrative data.

## IV. IMPLEMENTATION

### A. Technology Stack

The package manifest specifies Next.js 16.1.4, React 19.2.3, TypeScript 5, Leaflet 1.9.4, React Leaflet 5, Three.js 0.182, React Three Fiber 9, Drei 10, Zustand 5, and Framer Motion 12. The interface uses Tailwind CSS and a collection of reusable UI components. The project includes ESLint and TypeScript scripts; no dedicated test suite is identified in the package scripts.

**TABLE I. IMPLEMENTED TECHNOLOGY AND ROLE**

| Technology | Role in current repository |
|---|---|
| Next.js App Router | Page routing and server API routes |
| React and TypeScript | User interface and typed application logic |
| Leaflet and React Leaflet | Interactive geographic map |
| Three.js, React Three Fiber, Drei | 3D terrain and scene components |
| Zustand with persistence middleware | Client-side plan and draft state |
| Tailwind CSS and UI components | Styling and interface controls |
| Framer Motion | Animations and transitions |
| Open-Meteo endpoints | Elevation and forecast/radiation input path |
| Optional configured providers | Tariff, roof segmentation, and imagery integrations |

### B. Software Modules

The main modules visible in the repository are:

1. **Landing and authentication:** Landing, login, and registration pages with authentication API routes.
2. **Plan dashboard:** Home view for plan access and plan cards.
3. **Area selection:** Map navigation, polygon drawing, location selection, constraints, and analysis workflow.
4. **Terrain visualization:** Client-rendered three-dimensional terrain, suitability calculations, and placement visualization.
5. **Site analysis:** Server route for external data requests and preliminary numeric estimates.
6. **Plan overview:** Saved metrics, plan actions, and navigation to detail sections.
7. **Analytics:** Production, financial, and environmental visualizations, with several generated values as detailed in Section III-F.

### C. Security and Configuration Considerations

External service credentials are expected to be configured through environment variables. They must not be embedded in source code or included in a public paper or repository. The active application includes authentication routes and HTTP-only cookie handling. This paper does not constitute a security audit. Future research deployment should separately evaluate authentication configuration, authorization, privacy, rate limiting, external-provider failure handling, and safe use of user-provided location data.

## V. EVALUATION AND RESULTS

### A. Data and Reproducible Method

The resource-data comparison uses the Bengaluru test coordinate 13.0547° N, 77.5963° E. Open-Meteo's Historical Weather API [5] was queried for daily `shortwave_radiation_sum`, `temperature_2m_mean`, and `precipitation_sum` from January 1, 2021 through December 31, 2025, using the `Asia/Kolkata` timezone. The API returned 1,826 daily records and snapped the requested coordinate to its grid point at 13.0404215° N, 77.63422° E. Daily shortwave energy in MJ/m² was converted to kWh/m² by dividing by 3.6. Annual precipitation is the sum of daily precipitation.

PVGIS v5.3 [4] was queried at 13.0547° N, 77.5963° E with `peakpower=1`, crystalline-silicon technology, `loss=14`, automatic optimal inclination and azimuth, and JSON output. PVGIS returned ERA5 data for 2005–2023, an optimal fixed slope of 17°, an azimuth of −14° (PVGIS convention: 0° is south), and annual energy output of 1,519.82 kWh for the 1 kWp system. The 5 kWp comparison value is a linear scaling of that reference output; it is not a second PVGIS run.

On November 12, 2026, the application runtime check used a constructed 1-acre bounding-box polygon centered at 13.0547° N, 77.5963° E and solar-only constraints; it does not represent a surveyed parcel. The local Next.js development server returned HTTP 200 from `/api/site-analysis`. The response reported a 5 kW system and 12,000 kWh/year. The same forecast URL used by the route returned HTTP 400 when requested directly; the route response's weather and irradiance values matched its hard-coded defaults. Thus, the runtime result records the current fallback path and the route's minimum-production clamp, not an output driven by the provider data.

### B. Results

**TABLE II. OPEN-METEO HISTORICAL RESOURCE DATA AT THE RETURNED GRID POINT**

| Year | Daily records | Annual shortwave radiation (MJ/m²) | Annual shortwave radiation (kWh/m²) | Annual precipitation (mm) |
|---|---:|---:|---:|---:|
| 2021 | 365 | 6,986.45 | 1,940.68 | 1,327.5 |
| 2022 | 365 | 7,197.26 | 1,999.24 | 1,108.5 |
| 2023 | 365 | 7,618.40 | 2,116.22 | 729.6 |
| 2024 | 366 | 7,192.70 | 1,997.97 | 996.5 |
| 2025 | 365 | 7,362.70 | 2,045.19 | 877.5 |
| **Mean annual / period mean** | **1,826 total** | **7,271.50** | **2,019.86** | **1,007.9 per year** |

Across all 1,826 days, mean daily shortwave radiation was 19.911 MJ/m²/day, equivalent to **5.531 kWh/m²/day**. The period mean temperature was **23.20 °C**. The values above are gridded historical reanalysis estimates, not readings from a weather station at the parcel.

**TABLE III. PVGIS REFERENCE AND SOLVIX RUNTIME COMPARISON**

| Measure | PVGIS reference | Solvix route response |
|---|---:|---:|
| System rating | 1 kWp; 5 kWp after linear scaling | 5.0 kW |
| Annual energy | 1,519.82 kWh/kWp/year; 7,599.10 kWh/year at 5 kWp | 12,000 kWh/year |
| Specific yield | 1,519.82 kWh/kWp/year | 2,400 kWh/kW/year |
| Relative difference from scaled PVGIS | — | +57.9% |
| Input status | ERA5, 2005–2023, 14% system loss | Forecast request returned HTTP 400; default values used |

The route's reported annual energy is 4,400.90 kWh above the linearly scaled PVGIS value. This difference is not interpreted as a general model error because the route did not consume a successful forecast response in this run and the PVGIS scaling assumes a proportional system-size relationship. It is evidence that the route's fallback and lower clamp can produce a value that is materially different from an independent site-specific reference. The route also returned INR 7.60/kWh and related financial outputs, but those values are excluded from the comparison because the test did not establish a verified local utility tariff.

The independently queried datasets show a five-year mean horizontal resource of 2,019.86 kWh/m²/year at the Open-Meteo grid point and a PVGIS mean plane-of-array irradiation of 2,003.22 kWh/m²/year at the requested coordinate. These are similar in magnitude but are not a direct validation pair: they use different spatial grid points, periods, and irradiation planes. PVGIS's reported 1,519.82 kWh/kWp/year is the relevant modeled system-output baseline for the specified 1 kWp assumptions.

### C. Threats to Validity

The current estimates are sensitive to site-boundary representation, geographic scale, provider availability, and default assumptions. Bounding-box acreage can overstate irregular polygon area. The weather route's short forecast horizon does not establish long-term climate behavior. The suitability coefficient and annual-production equation are heuristic. Tariff classification is limited and can assign an inappropriate currency. A terrain fallback can look realistic while not representing true elevations. UI charts can introduce nondeterministic variation. These factors prevent generalization of the displayed output to real-world expected generation or economic performance.

The quantitative results are limited to one location, one system configuration, and one runtime request. Open-Meteo and PVGIS use different gridded data and periods, and PVGIS output is modeled rather than observed generation. The Solvix runtime test exposed a failed forecast request and fallback behavior; it cannot establish predictive accuracy. Financial outputs were not compared with a verified tariff or cost dataset. No user-study or field-generation results are inferred from these data. The evidence supports a preliminary resource comparison and implementation diagnostic, not a claim of engineering or financial validation.

## VI. CONCLUSION AND FUTURE WORK

This paper described Solvix and reported a reproducible Bengaluru resource-data comparison using Open-Meteo's 2021–2025 historical archive and PVGIS ERA5 data for 2005–2023. The archive returned a period mean of 5.531 kWh/m²/day of horizontal shortwave radiation; PVGIS reported 1,519.82 kWh/year for the specified 1 kWp system. A local route test returned 12,000 kWh/year for 5 kW, 57.9% above the scaled PVGIS reference. Inspection showed that the route's weather request returned HTTP 400 and the response used defaults, so this difference is a runtime diagnostic rather than a prediction-accuracy result.

The implementation should not be characterized as an engineering-certified or field-validated renewable-energy design system. Its estimated production and financial outputs rely on heuristic formulas and defaults. Terrain may use synthetic fallback data; placement zones can be predefined or demonstrative; and several analytics views display generated illustrative values. Although the repository contains Gemini-related scaffolding, it does not establish that Gemini powers the live estimate flow. These limitations are material to interpreting the user interface and should be made explicit in demonstrations and publications.

For the reported route output to be interpreted as a site-specific estimate, the forecast request must succeed, fallback inputs must be clearly separated from provider data, and the production clamp and heuristic must be evaluated against matched reference cases. Broader validation would require multiple locations and system configurations, verified local tariffs, usability testing with intended users, and measured generation from operating systems. Until then, the reported API data provide a real location-based resource assessment and a transparent benchmark, but not field-measured system performance.

## ACKNOWLEDGMENT

The authors acknowledge **Deepak NR** for project guidance.

## REFERENCES

[1] W. Kritzinger, M. Karner, G. Traar, J. Henjes, and W. Sihn, “Digital Twin in manufacturing: A categorical literature review and classification,” *IFAC-PapersOnLine*, vol. 51, no. 11, pp. 1016–1022, 2018, doi: [10.1016/j.ifacol.2018.08.474](https://doi.org/10.1016/j.ifacol.2018.08.474).

[2] C. Semeraro, M. Lezoche, H. Panetto, and M. Dassisti, “Digital twin paradigm: A systematic literature review,” *Computers in Industry*, vol. 130, Art. no. 103469, 2021, doi: [10.1016/j.compind.2021.103469](https://doi.org/10.1016/j.compind.2021.103469).

[3] C. Verdouw, B. Tekinerdogan, A. Beulens, and S. Wolfert, “Digital twins in smart farming,” *Agricultural Systems*, vol. 189, Art. no. 103046, 2021, doi: [10.1016/j.agsy.2020.103046](https://doi.org/10.1016/j.agsy.2020.103046).

[4] European Commission, Joint Research Centre, “Photovoltaic Geographical Information System (PVGIS),” PVGIS v5.3 API. [Online]. Available: [https://re.jrc.ec.europa.eu/api/v5_3/PVcalc](https://re.jrc.ec.europa.eu/api/v5_3/PVcalc). Accessed: Nov. 12, 2026.

[5] Open-Meteo, “Weather Forecast and Historical Weather APIs.” [Online]. Available: [https://open-meteo.com/en/docs](https://open-meteo.com/en/docs); [https://open-meteo.com/en/docs/historical-weather-api](https://open-meteo.com/en/docs/historical-weather-api). Accessed: Nov. 12, 2026.

[6] Open-Meteo, “Elevation API.” [Online]. Available: [https://open-meteo.com/en/docs/elevation-api](https://open-meteo.com/en/docs/elevation-api). Accessed: Nov. 12, 2026.

[7] European Space Agency, “Copernicus DEM—Global and European Digital Elevation Model.” Dataset DOI: [10.5270/ESA-c5d3d65](https://doi.org/10.5270/ESA-c5d3d65).

[8] Vercel, “Next.js App Router Documentation.” [Online]. Available: [https://nextjs.org/docs/app](https://nextjs.org/docs/app). Accessed: Nov. 12, 2026.

[9] React Three Fiber, “Introduction.” [Online]. Available: [https://r3f.docs.pmnd.rs/getting-started/introduction](https://r3f.docs.pmnd.rs/getting-started/introduction). Accessed: Nov. 12, 2026.

[10] Leaflet, “Leaflet 1.9.4 API Reference.” [Online]. Available: [https://leafletjs.com/reference-1.9.4.html](https://leafletjs.com/reference-1.9.4.html). Accessed: Nov. 12, 2026.

[11] Zustand, “Persist Middleware.” [Online]. Available: [https://zustand.docs.pmnd.rs/reference/middlewares/persist](https://zustand.docs.pmnd.rs/reference/middlewares/persist). Accessed: Nov. 12, 2026.
