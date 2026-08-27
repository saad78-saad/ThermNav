# 📖 ThermoShift EcoBreeze: Official User Manual & Operations Guide
**Hyperlocal Microclimate-Driven Predictive Pre-Cooling & Free-Air Economizer BMS**  
*Powered by FortyGuard's Large Temperature Model (LTM) API Suite*

---

## 1. Quick Start Guide (60-Second Onboarding)

### System Launch Commands
1. **Backend Server (FastAPI):**
   ```bash
   cd backend
   python -m uvicorn main:app --reload --port 8000
   ```
2. **Frontend Interface (React + Vite):**
   ```bash
   cd frontend
   npm run dev
   ```
3. Open **`http://localhost:5173`** in your browser.

---

## 2. Navigating the User Interface

```
+--------------------------------------------------------------------------------------------------+
| [LOGO] ThermoShift EcoBreeze | [1. Facility Director] [2. AHU Plant Tech] [3. Façade Auditor]   | [Manual] [☀️/🌙] [FortyGuard API (7)] |
+--------------------------------------------------------------------------------------------------+
| [PRESETS] Financial Canyon (NYC) | Hudson Yards (NYC) | Grand Central (NYC) | Brooklyn Navy Yard (NYC) |
+--------------------------------------------------------------------------------------------------+
| 🌟 30-SECOND JUDGE SPOTLIGHT & 1-CLICK AUTO-PLAY CONTROLLER                                       |
| Current State: 02:00 PM | Outside: 42.5°C | Inside: 23.8°C | AC: OFF (0 kW) | Saved: $518/day    |
| [ ▶ Auto-Play 24h Heat Cycle ] [ Before vs. After Comparison ]                                  |
| [ 05:00 AM Pre-Cool ] [ 02:00 PM Peak Shed ] [ 10:00 PM Free Air ] [ 10:00 AM Modulated ]        |
+--------------------------------------------------------------------------------------------------+
| ROLE 1: FACILITY DIRECTOR | ROLE 2: AHU TECH SCHEMATIC | ROLE 3: FAÇADE SOLAR BALANCER          |
+--------------------------------------------------------------------------------------------------+
```

---

## 3. Step-by-Step Operator Guide by Role

### 🏢 Role 1: Facility Energy Director Dashboard
* **Target Users:** Chief Building Engineers, Energy Portfolio Managers, and Sustainability Directors.
* **Key Tasks:**
  1. **Review 24-Hour Horizon Multi-Curve Chart:**
     * **Red Curve:** Hyperlocal outdoor temperature forecasted by FortyGuard LTM.
     * **Blue Curve:** Indoor temperature trajectory.
     * **Amber Shaded Area (12:00 PM – 06:00 PM):** Peak tariff penalty window ($0.88/kWh).
     * **Cyan Shaded Area (04:00 AM – 08:00 AM):** Off-peak pre-cooling window ($0.08/kWh).
     * *Action:* Click or drag anywhere on the chart to scrub the simulation time.
  2. **Inspect Concrete Thermal Mass Battery State-of-Charge (SoC %):**
     * Observe the battery charge reaching **90%+** at 08:00 AM and discharging through 05:00 PM.
  3. **Tweak Pre-Cooling Sliders:**
     * **Pre-Cooling Aggression Factor (0.5x – 1.5x):** Increase to 1.3x–1.5x when high grid peak-demand penalties are forecasted.
     * **Economizer Threshold (°C):** Set the maximum permissible outdoor dry-bulb temperature (default $22.5^\circ\text{C}$).

---

### ⚙️ Role 2: HVAC Plant & AHU Automation Technician
* **Target Users:** Chiller Plant Operators, BAS/BMS Automation Engineers, and HVAC Technicians.
* **Key Tasks:**
  1. **Monitor Air Handling Unit (AHU) Schematic:**
     * **Outdoor Air (OA) Damper:** Verify damper opens to **100%** during free-cooling economizer mode ($h_{\text{out}} \le 45.5\,\text{kJ/kg}$).
     * **Mixing Chamber:** Check mixed air enthalpy and temperature.
     * **Cooling Coil:** Check staging status (Active vs. 100% Bypass).
     * **Supply Air Fan:** Verify air delivery CFM and temperature ($14.8^\circ\text{C}$).
  2. **Verify Psychrometric Enthalpy Gate ($h_{\text{out}}$ vs $h_{\text{in}}$):**
     * Ensure outdoor enthalpy is energetically lower than indoor return enthalpy before free-cooling is triggered.
  3. **Execute Emergency Overrides:**
     * `[ 🍃 Force 100% Free Air ]`: Opens dampers to 100% and shuts off chillers immediately.
     * `[ 🛡️ Force Peak Shed ]`: Throttles chiller power to 30% to shed electrical load.
     * `[ 🤖 Autonomous FortyGuard ]`: Restores AI microclimate automation.

---

### 🧭 Role 3: Façade Balancer & ESG Auditor
* **Target Users:** Zone Comfort Engineers, ESG Auditors, and LEED / Green Mark Compliance Officers.
* **Key Tasks:**
  1. **Directional Solar Balancing (4 Quadrants):**
     * **West Façade:** Click quadrant to verify **95% VAV Damper Opening** against harsh afternoon sun.
     * **South Façade:** Verify **78% VAV Damper Opening** for midday heat.
     * **East Façade:** Verify **35% VAV Damper Opening** in the afternoon to prevent occupant overcooling.
     * **North Façade:** Verify **25% Minimum Ventilation Flow**.
  2. **Audit ASHRAE 55 Occupant Comfort:**
     * Confirm **PMV index** is between $-0.2$ and $+0.2$ (Optimal Neutral).
     * Confirm **PPD** is $\le 5.2\%$ (ISO 7730 Class A Quality).
  3. **Export ESG Carbon Report:**
     * Verify daily Scope 2 carbon abatement ($\approx 248.6\,\text{kg CO}_2/\text{day}$) for LEED Energy & Atmosphere points.

---

## 4. Using the FortyGuard LTM API Suite Explorer

Click the **`FortyGuard API (7)`** button in the top navigation bar to open the live diagnostic modal:

1. **Environmental Parameters (`POST /v1/env_params`):**
   * Computes dry-bulb, wet-bulb, humidity, and solar GHI for psychrometric enthalpy gates.
2. **Heat Intelligence (`POST /v1/heat_intelligence`):**
   * Assesses urban canyon heat retention to predict nocturnal thermal decay.
3. **2-Meter Surface Heatmap (`POST /v1/heatmap`):**
   * Evaluates rooftop asphalt heat plumes to calibrate chiller condenser COP.
4. **Streetview Segmentation (`POST /v1/streetview`):**
   * Quantifies vertical façade solar exposure for zone-by-zone VAV balancing.
5. **Satellite Segmentation (`POST /v1/satellite`):**
   * Evaluates ground albedo and pavement reflectivity near air intakes.
6. **API Quota & Credits (`GET /v1/credits`):**
   * Tracks real-time API quota and health for 24/7 continuous operation.

---

## 5. Frequently Asked Questions (FAQ) & Troubleshooting

### Q1: How do I switch between the Crisp Light Theme and Dark Mode?
* **A:** Click the **`Light` / `Dark`** button in the top right corner of the navbar. The application will instantly re-render in high-contrast executive white or cyberpunk dark mode.

### Q2: Why does the system pre-cool at 5:00 AM?
* **A:** Electricity tariffs are at their lowest off-peak rate ($0.08–$0.29/kWh), and outdoor temperatures are coolest, allowing chillers to operate at peak thermodynamic efficiency.

### Q3: What happens if FortyGuard API connectivity is interrupted?
* **A:** The system automatically falls back to an embedded high-precision synthetic thermodynamic microclimate simulator, ensuring uninterrupted operation with zero downtime.

---

## 📞 Support & Hackathon Contacts
* **Project:** ThermoShift EcoBreeze
* **Engine:** FortyGuard Large Temperature Model (LTM) API Suite
* **Version:** 2.2.0 (Production Hackathon Edition)
