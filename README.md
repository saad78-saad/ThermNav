# ThermoShift EcoBreeze: Microclimate Predictive Pre-Cooling & Free-Air Economizer BMS
**Powered by the FortyGuard Large Temperature Model (LTM) API Suite**

ThermoShift EcoBreeze is a thermal-aware building energy management and cooling optimization platform designed to eliminate peak electricity tariffs, maximize fresh air free-cooling, and maintain ASHRAE 55 occupant comfort.

By ingesting FortyGuard's 2-meter resolution microclimate forecasts, street canyon geometry, and surface albedo, ThermoShift EcoBreeze dynamically switches between **4 intelligent operating modes**, transforming commercial buildings into active thermal batteries.

---

## 🌟 Core Problem Solved

1. **The Peak Tariff Penalty:** Commercial buildings run chillers at maximum capacity during 12 PM – 5 PM peak heat, incurring 3x to 5x peak tariff surcharges and stressing urban electrical grids.
2. **The "Rooftop Sensor Flaw":** Traditional HVAC economizers rely on uncalibrated rooftop probes baked by asphalt heat plumes. Rooftops are often **4–7°C hotter** than street canyons, causing BMS to falsely disable free-cooling when fresh street canyon air is actually cool and usable.
3. **Reactive vs. Anticipatory Cooling:** Standard thermostats react only *after* indoor temperatures rise. ThermoShift EcoBreeze leverages the building's **lumped thermal capacitance** ($C_b$) to pre-cool structural mass during cheap off-peak hours.

---

## 🏗️ The 4 Dynamic Operating Modes

1. ❄️ **Predictive Pre-Cooling:** "Charges" the building thermal mass during off-peak morning hours (04:00 - 08:00) when grid electricity tariffs are lowest.
2. 🍃 **100% Free-Air Economizer:** Shuts down energy-intensive chiller compressors completely and opens outdoor air dampers to 100% whenever FortyGuard psychrometric enthalpy ($h_{\text{outdoor}} \le h_{\text{indoor}}$) and dry-bulb ($T_{\text{outdoor}} \le 22.5^\circ\text{C}$) permit.
3. 🛡️ **Thermal Mass Coasting & Peak Shedding:** Throttles compressors by up to 65% during peak tariff hours (12:00 - 17:00), allowing stored concrete thermal energy to absorb heat while maintaining ASHRAE 55 comfort bounds.
4. ⚙️ **Modulated Mechanical Cooling:** High-efficiency variable-speed chiller cooling with dynamic COP modulation based on FortyGuard rooftop wet-bulb ($T_{\text{wb}}$) temperatures.

---

## 👥 3 Specialized User Roles

* **1. Facility Energy Director:**
  * 24-Hour predictive multi-metric thermal horizon.
  * Real-time thermal battery State-of-Charge (SoC %) meter.
  * Dollar savings (\$), peak demand shaved (kW), and carbon abatement ($\text{kg CO}_2$) counters.
  * Interactive Pre-Cooling Aggression and Economizer Setpoint sliders.

* **2. HVAC Plant & AHU Automation Technician:**
  * Interactive Air Handling Unit (AHU) mechanical schematic with animated airflow paths.
  * Real-time psychrometric enthalpy comparator ($h_{\text{outdoor}}$ vs $h_{\text{indoor}}$) with automated mode decision rationale.
  * Chiller compressor staging and dynamic rooftop condenser COP monitoring.
  * Emergency manual override triggers (Force Free Air, Force Peak Shed, Autonomous FortyGuard Mode).

* **3. Façade Solar Balancer & ESG Auditor:**
  * 4-Quadrant directional solar heat flux balancer (North, South, East, West) with VAV damper modulation.
  * ASHRAE 55 Occupant Thermal Comfort compliance index (PMV: +0.12, PPD: 5.2%).
  * Indoor Air Quality (IAQ) CO2 ppm tracker and LEED/Green Mark credit scorecard.

---

## 🔬 Thermodynamic & Psychrometric Equations

### 1. ASHRAE Psychrometric Enthalpy Engine
$$\text{Saturation Vapor Pressure: } P_{\text{ws}} = 0.61078 \cdot \exp\left(\frac{17.27 \cdot T_{\text{db}}}{T_{\text{db}} + 237.3}\right) \quad [\text{kPa}]$$

$$\text{Humidity Ratio: } W = 0.62198 \cdot \frac{\text{RH} \cdot P_{\text{ws}}}{P_{\text{atm}} - \text{RH} \cdot P_{\text{ws}}} \quad \left[\frac{\text{kg water}}{\text{kg dry air}}\right]$$

$$\text{Specific Enthalpy: } h = 1.006 \cdot T_{\text{db}} + W \cdot (2501 + 1.86 \cdot T_{\text{db}}) \quad \left[\frac{\text{kJ}}{\text{kg}}\right]$$

$$\textbf{Economizer Gate: } \text{Mode} = \begin{cases} 
\textbf{Free-Air Economizer (Compressors 0 kW)}, & \text{if } h_{\text{out}} \le h_{\text{in}} \land T_{\text{out}} \le 22.5^\circ\text{C} \\
\textbf{Pre-Cool / Mechanical}, & \text{otherwise}
\end{cases}$$

### 2. 1R1C Building Thermal Mass & Inertia Model
$$C_b \frac{dT_{\text{indoor}}}{dt} = \frac{T_{\text{ambient}}(t) - T_{\text{indoor}}(t)}{R_{\text{envelope}}} + \text{SHGC} \cdot A_{\text{glazing}} \cdot \text{GHI}(t) + \dot{Q}_{\text{internal}} - \dot{Q}_{\text{HVAC}}$$

---

## 🌐 FortyGuard LTM API Suite Integration

| FortyGuard Endpoint | Role in ThermoShift EcoBreeze |
| :--- | :--- |
| **`POST /v1/env_params`** | Ingests hyper-local dry-bulb ($T_a$), wet-bulb ($T_{\text{wb}}$), humidity ($RH$), and solar $GHI$ for enthalpy & thermal load forecasting. |
| **`POST /v1/heat_intelligence`** | Evaluates urban heat island vulnerability and canyon heat retention indices. |
| **`POST /v1/heatmap`** | 2-meter thermal perimeter heatmap to optimize rooftop condenser heat rejection efficiency. |
| **`POST /v1/streetview`** | Evaluates vertical façade solar exposure and urban canyon airflow channeling for economizer intake. |
| **`POST /v1/satellite`** | Calculates surrounding ground albedo and surface reflectivity near fresh air intake louvers. |
| **`GET /v1/status/{activity_id}`** | Asynchronous job status polling engine. |
| **`GET /v1/credits`** | Real-time API credits meter and quota health monitoring. |

---

## 🚀 Setup and Quick Start

### 1. Requirements
* Python 3.11+
* Node.js 18+
* FortyGuard API Key (Optional — includes robust synthetic simulation fallback)

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.
