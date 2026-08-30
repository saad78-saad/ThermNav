import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import OpenStreetMicroclimateMap from './OpenStreetMicroclimateMap';
import {
  Layers,
  Box,
  Eye,
  Sliders,
  Sparkles,
  Maximize2,
  Minimize2,
  Wind,
  Zap,
  Building,
  Thermometer,
  ShieldCheck,
  Compass,
  Cpu,
  Flame,
  CheckCircle2,
  RotateCcw,
  Camera,
  Scissors,
  Play,
  Pause,
  ThermometerSnowflake,
  Info,
  Activity,
  ArrowRight,
  BatteryCharging,
  AlertTriangle,
  Gauge,
  Users,
  UserCheck,
  TrendingUp,
  Radio,
  EyeOff,
  ChevronRight,
  Presentation,
  Volume2,
  Clock,
  Check,
  FlameKindling,
  Building2,
  Server,
  Filter,
  RefreshCw,
  Sun,
  Dices,
  Atom,
  Radiation,
  Waves,
  Glasses,
  ShieldAlert,
  MapPin,
  Map,
  Globe,
  Satellite,
  Plus,
  Minus,
  Navigation,
  Crosshair,
  TreePine,
  Car,
  Lightbulb,
  Monitor,
  Laptop,
  ZoomIn,
  Search,
  Hammer,
  Snowflake,
  SlidersHorizontal,
  Settings2
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Dynamic 24-Hour Surrounding Neighbor Thermal Calculator (FortyGuard / Autodesk CFD API Telemetry)
const calculateDynamicNeighborThermal = (neighbor, hour = 14, baseAmbient = 34.5, cfdData = null) => {
  if (!neighbor) return { tempC: 38.0, colorHex: 0xf97316, colorCss: '#f97316', badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40', radiantLabel: '38.0°C' };

  // 1. Direct real-time API Telemetry Lookup from FortyGuard / Autodesk CFD Backend
  const telemetry = cfdData?.neighbor_24h_telemetry;
  let apiTemp = null;

  if (telemetry) {
    const neighborEntry = telemetry[neighbor.id] || telemetry[neighbor.name] || telemetry[neighbor.name?.toLowerCase()];
    if (neighborEntry && Array.isArray(neighborEntry) && neighborEntry[hour]) {
      apiTemp = neighborEntry[hour].surface_temp_c;
    } else if (typeof telemetry[neighbor.id] === 'number') {
      apiTemp = telemetry[neighbor.id];
    }
  }

  const orient = neighbor.orientation || 'WEST';
  let currentTemp;

  if (typeof apiTemp === 'number' && !isNaN(apiTemp)) {
    currentTemp = Math.round(apiTemp * 10) / 10;
  } else {
    // Dynamic physics calculation fallback
    let tempDelta = 0;
    if (orient === 'EAST') {
      tempDelta = hour >= 6 && hour <= 14 ? 12.5 * Math.sin(((hour - 6) * Math.PI) / 8.0) : 1.0;
    } else if (orient === 'SOUTH') {
      tempDelta = hour >= 8 && hour <= 17 ? 15.0 * Math.sin(((hour - 8) * Math.PI) / 8.0) : 1.5;
    } else if (orient === 'WEST') {
      tempDelta = hour >= 10 && hour <= 19 ? 19.5 * Math.sin(((hour - 10) * Math.PI) / 8.0) : 1.0;
    } else {
      tempDelta = hour >= 9 && hour <= 17 ? 4.5 * Math.sin(((hour - 9) * Math.PI) / 8.0) : 0.5;
    }
    currentTemp = Math.round((baseAmbient + tempDelta * 0.72) * 10) / 10;
  }

  let colorHex = 0x06b6d4; // Cool Cyan (<28C)
  let colorCss = '#06b6d4';
  let badgeColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';

  if (currentTemp >= 50.0) {
    colorHex = 0xef4444; // Blazing Red
    colorCss = '#ef4444';
    badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse';
  } else if (currentTemp >= 43.0) {
    colorHex = 0xf97316; // Hot Orange
    colorCss = '#f97316';
    badgeColor = 'bg-orange-500/20 text-orange-300 border-orange-500/40';
  } else if (currentTemp >= 35.0) {
    colorHex = 0xeab308; // Warm Yellow
    colorCss = '#eab308';
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  } else if (currentTemp >= 28.0) {
    colorHex = 0x10b981; // Green
    colorCss = '#10b981';
    badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  }

  return {
    tempC: currentTemp,
    colorHex,
    colorCss,
    badgeColor,
    radiantLabel: `${currentTemp}°C (${orient} Facade • API Sync)`
  };
};

// =========================================================================
// 🏢 CORPORATE TENANT & CUSTOM HVAC PLANT CATALOG
// =========================================================================
const COMPANY_HVAC_CATALOG = {
  GOOGLE_UFAD: {
    id: 'GOOGLE_UFAD',
    company: 'Google Cloud & AI Labs',
    systemName: 'Underfloor Air Distribution (UFAD) & Server CRAC Cooling',
    systemType: 'UFAD',
    shortCode: 'UFAD + CRAC',
    description: 'Pressurized underfloor plenum with dynamic swirl floor diffusers and secondary CRAC high-density cooling.',
    colorHex: 0x00f0ff,
    badgeBg: 'from-blue-600 to-cyan-500',
    airflowEfficiency: '28% Fan Energy Reduction (ASHRAE 55 Optimal)',
    specialFeature: 'Raised Pedestal Floor Plenum with Swirl Diffusers'
  },
  GOLDMAN_VAV: {
    id: 'GOLDMAN_VAV',
    company: 'Goldman Sachs Financial Core',
    systemName: 'High-Pressure Dual-Duct VAV & Fast-Response Actuators',
    systemType: 'DUAL_VAV',
    shortCode: 'Dual VAV',
    description: 'Overhead galvanized heavy dual ducts with differential enthalpy economizer and high-velocity trading floor dampers.',
    colorHex: 0x10b981,
    badgeBg: 'from-emerald-600 to-teal-500',
    airflowEfficiency: 'Fast-Response ±0.2°C Precision for Trading Floors',
    specialFeature: 'Dual Rectangular Galvanized Supply & Modulating Dampers'
  },
  PFIZER_DOAS: {
    id: 'PFIZER_DOAS',
    company: 'Pfizer BioTech & Research Labs',
    systemName: '100% Dedicated Outdoor Air (DOAS) + HEPA Filtration Units',
    systemType: 'DOAS_HEPA',
    shortCode: 'DOAS + HEPA',
    description: 'Zero recirculation cleanroom ventilation with continuous particulate HEPA scrubbers and negative pressure containment.',
    colorHex: 0xa855f7,
    badgeBg: 'from-purple-600 to-indigo-500',
    airflowEfficiency: 'ISO Class 5 Cleanroom Air Quality (100% Fresh Intake)',
    specialFeature: 'Cylindrical HEPA Cleanroom Scrubbers & Bio-Exhaust'
  },
  WEWORK_VRF: {
    id: 'WEWORK_VRF',
    company: 'WeWork Coworking & Media Hub',
    systemName: 'Multi-Zone Smart VRF (Variable Refrigerant Flow)',
    systemType: 'VRF_SMART',
    shortCode: 'Smart VRF',
    description: 'Dynamic multi-split ceiling cassettes with localized thermal zoning and occupancy sensor load shifting.',
    colorHex: 0xf59e0b,
    badgeBg: 'from-amber-600 to-orange-500',
    airflowEfficiency: 'Zonal Diversity & Inverter Compressors',
    specialFeature: 'Multi-Split Ceiling Cassettes with Copper Refrigerant Lines'
  },
  AUTODESK_DISPLACEMENT: {
    id: 'AUTODESK_DISPLACEMENT',
    company: 'Autodesk Architecture & BIM Studio',
    systemName: 'Displacement Ventilation + Smart Solar Glazing Flues',
    systemType: 'DISPLACEMENT',
    shortCode: 'Displacement',
    description: 'Low-velocity floor displacement air supply with automated thermal chimney exhaust dampers.',
    colorHex: 0xec4899,
    badgeBg: 'from-pink-600 to-rose-500',
    airflowEfficiency: 'Ultra-Low Turbulence Air Stratification',
    specialFeature: 'Corner Displacement Towers & Smart Façade Louvers'
  }
};

// 150m Multi-City Urban Context Surrounding Structures (FortyGuard Surface Heatmaps)
const URBAN_CONTEXT_BY_PRESET = {
  nyc_financial: [
    {
      id: 'neighbor_west',
      name: 'One Liberty Plaza (West Tower)',
      orientation: 'WEST',
      distanceM: 52,
      heightM: 180,
      widthM: 45,
      pos: [-46, 28, -5],
      size: [14, 56, 22],
      surfaceTempC: 48.5,
      viewFactor: 0.44,
      colorHex: 0xf43f5e,
      emissivity: 0.88,
      sri: 0.72,
      hasPlume: true,
      plumeTempC: 54.0,
      radiantFluxOntoTarget: '+48.2 W/m² (High Radiant Load)'
    },
    {
      id: 'neighbor_south',
      name: 'Wall St Financial Core (South Tower)',
      orientation: 'SOUTH',
      distanceM: 55,
      heightM: 140,
      widthM: 50,
      pos: [0, 22, 50],
      size: [24, 44, 12],
      surfaceTempC: 52.0,
      viewFactor: 0.38,
      colorHex: 0xf97316,
      emissivity: 0.91,
      sri: 0.58,
      hasPlume: true,
      plumeTempC: 51.5,
      radiantFluxOntoTarget: '+38.6 W/m² (Bronze Glaze Soak)'
    },
    {
      id: 'neighbor_east',
      name: 'Historic Stone Exchange (East Mid-Rise)',
      orientation: 'EAST',
      distanceM: 48,
      heightM: 45,
      widthM: 60,
      pos: [44, 8, -4],
      size: [12, 16, 26],
      surfaceTempC: 36.2,
      viewFactor: 0.26,
      colorHex: 0xeab308,
      emissivity: 0.93,
      sri: 0.35,
      hasPlume: false,
      plumeTempC: 42.0,
      radiantFluxOntoTarget: '+18.4 W/m² (Moderate Masonry)'
    },
    {
      id: 'neighbor_north',
      name: 'North Canyon Shaded Street',
      orientation: 'NORTH',
      distanceM: 45,
      heightM: 35,
      widthM: 40,
      pos: [0, 6, -46],
      size: [28, 12, 10],
      surfaceTempC: 29.8,
      viewFactor: 0.18,
      colorHex: 0x06b6d4,
      emissivity: 0.95,
      sri: 0.22,
      hasPlume: false,
      plumeTempC: 35.0,
      radiantFluxOntoTarget: '+6.2 W/m² (Cool Shaded Baseline)'
    }
  ],
  nyc_hudson_yards: [
    {
      id: 'neighbor_west',
      name: '50 Hudson Yards (West Supertall)',
      orientation: 'WEST',
      distanceM: 52,
      heightM: 290,
      widthM: 52,
      pos: [-46, 36, -5],
      size: [14, 72, 24],
      surfaceTempC: 54.2,
      viewFactor: 0.46,
      colorHex: 0xef4444,
      emissivity: 0.86,
      sri: 0.78,
      hasPlume: true,
      plumeTempC: 58.0,
      radiantFluxOntoTarget: '+56.8 W/m² (Severe Specular Glare)'
    },
    {
      id: 'neighbor_south',
      name: '10 Hudson Yards (South Tower)',
      orientation: 'SOUTH',
      distanceM: 55,
      heightM: 270,
      widthM: 50,
      pos: [0, 30, 50],
      size: [24, 60, 12],
      surfaceTempC: 52.8,
      viewFactor: 0.40,
      colorHex: 0xf97316,
      emissivity: 0.88,
      sri: 0.74,
      hasPlume: true,
      plumeTempC: 56.0,
      radiantFluxOntoTarget: '+48.2 W/m² (Angled Glass Heat)'
    },
    {
      id: 'neighbor_east',
      name: 'The Shed Plaza Hardscape',
      orientation: 'EAST',
      distanceM: 48,
      heightM: 40,
      widthM: 70,
      pos: [44, 8, -4],
      size: [12, 16, 26],
      surfaceTempC: 46.0,
      viewFactor: 0.28,
      colorHex: 0xeab308,
      emissivity: 0.92,
      sri: 0.40,
      hasPlume: false,
      plumeTempC: 46.0,
      radiantFluxOntoTarget: '+26.0 W/m² (Plaza Hardscape)'
    },
    {
      id: 'neighbor_north',
      name: '11th Avenue Transit Corridor',
      orientation: 'NORTH',
      distanceM: 45,
      heightM: 28,
      widthM: 45,
      pos: [0, 6, -46],
      size: [28, 12, 10],
      surfaceTempC: 56.5,
      viewFactor: 0.22,
      colorHex: 0xdc2626,
      emissivity: 0.95,
      sri: 0.16,
      hasPlume: false,
      plumeTempC: 42.0,
      radiantFluxOntoTarget: '+29.4 W/m² (Asphalt Transit Heat)'
    }
  ],
  nyc_midtown_east: [
    {
      id: 'neighbor_west',
      name: 'One Vanderbilt (West Hub)',
      orientation: 'WEST',
      distanceM: 52,
      heightM: 427,
      widthM: 55,
      pos: [-46, 38, -5],
      size: [14, 76, 22],
      surfaceTempC: 51.0,
      viewFactor: 0.45,
      colorHex: 0xea580c,
      emissivity: 0.89,
      sri: 0.68,
      hasPlume: true,
      plumeTempC: 54.0,
      radiantFluxOntoTarget: '+49.5 W/m² (Terracotta & Glass Reflection)'
    },
    {
      id: 'neighbor_south',
      name: 'Graybar Limestone Building',
      orientation: 'SOUTH',
      distanceM: 55,
      heightM: 120,
      widthM: 60,
      pos: [0, 20, 50],
      size: [24, 40, 12],
      surfaceTempC: 49.2,
      viewFactor: 0.36,
      colorHex: 0xf97316,
      emissivity: 0.93,
      sri: 0.38,
      hasPlume: true,
      plumeTempC: 48.0,
      radiantFluxOntoTarget: '+41.8 W/m² (Limestone Heat Storage)'
    },
    {
      id: 'neighbor_east',
      name: 'Chrysler Building Spire',
      orientation: 'EAST',
      distanceM: 48,
      heightM: 319,
      widthM: 45,
      pos: [44, 30, -4],
      size: [12, 60, 26],
      surfaceTempC: 44.5,
      viewFactor: 0.31,
      colorHex: 0xca8a04,
      emissivity: 0.88,
      sri: 0.55,
      hasPlume: false,
      plumeTempC: 46.0,
      radiantFluxOntoTarget: '+30.4 W/m² (Morning Stainless Glare)'
    },
    {
      id: 'neighbor_north',
      name: 'Lexington Avenue Corridor',
      orientation: 'NORTH',
      distanceM: 45,
      heightM: 32,
      widthM: 38,
      pos: [0, 6, -46],
      size: [28, 12, 10],
      surfaceTempC: 54.8,
      viewFactor: 0.20,
      colorHex: 0xdc2626,
      emissivity: 0.95,
      sri: 0.18,
      hasPlume: false,
      plumeTempC: 40.0,
      radiantFluxOntoTarget: '+26.2 W/m² (Street Canyon Trap)'
    }
  ],
  nyc_brooklyn_navy: [
    {
      id: 'neighbor_west',
      name: 'East River Marine Basin (Cool Water)',
      orientation: 'WEST',
      distanceM: 52,
      heightM: 6,
      widthM: 90,
      pos: [-46, 2, -5],
      size: [14, 4, 28],
      surfaceTempC: 26.8,
      viewFactor: 0.35,
      colorHex: 0x06b6d4,
      emissivity: 0.96,
      sri: 0.10,
      hasPlume: false,
      plumeTempC: 28.0,
      radiantFluxOntoTarget: '+2.4 W/m² (Cool Maritime Heat Sink)'
    },
    {
      id: 'neighbor_south',
      name: 'Building 77 Tech Center',
      orientation: 'SOUTH',
      distanceM: 55,
      heightM: 65,
      widthM: 80,
      pos: [0, 14, 50],
      size: [24, 28, 12],
      surfaceTempC: 36.2,
      viewFactor: 0.34,
      colorHex: 0x3b82f6,
      emissivity: 0.91,
      sri: 0.45,
      hasPlume: true,
      plumeTempC: 39.0,
      radiantFluxOntoTarget: '+16.8 W/m² (Modern Insulated Mass)'
    },
    {
      id: 'neighbor_east',
      name: 'Steiner Studios Complex',
      orientation: 'EAST',
      distanceM: 48,
      heightM: 25,
      widthM: 85,
      pos: [44, 6, -4],
      size: [12, 12, 26],
      surfaceTempC: 34.5,
      viewFactor: 0.25,
      colorHex: 0x10b981,
      emissivity: 0.92,
      sri: 0.78,
      hasPlume: false,
      plumeTempC: 36.0,
      radiantFluxOntoTarget: '+12.1 W/m² (Cool White Roof)'
    },
    {
      id: 'neighbor_north',
      name: 'Flushing Avenue Corridor',
      orientation: 'NORTH',
      distanceM: 45,
      heightM: 18,
      widthM: 45,
      pos: [0, 5, -46],
      size: [28, 10, 10],
      surfaceTempC: 38.4,
      viewFactor: 0.18,
      colorHex: 0x14b8a6,
      emissivity: 0.94,
      sri: 0.26,
      hasPlume: false,
      plumeTempC: 38.0,
      radiantFluxOntoTarget: '+14.5 W/m² (Waterfront Boulevard)'
    }
  ]
};

// Vibrant Shirt Colors for Human Occupants
const OCCUPANT_SHIRT_COLORS = [0xf97316, 0x06b6d4, 0x84cc16, 0xec4899, 0x3b82f6, 0xeab308, 0xa855f7];

export default function AutodeskBuildingViewer({
  scheduleData,
  hvacData,
  selectedHour = 14,
  onSelectHour,
  activePreset = 'nyc_financial',
  customBuildingPlan = null,
  theme = 'dark'
}) {
  const mountRef = useRef(null);
  const isLight = theme === 'light';
  const dataStore = hvacData || scheduleData;

  // CFD Physics Simulation Data State (Declared first to avoid TDZ ReferenceError)
  const [cfdData, setCfdData] = useState(null);
  const [isLoadingCfd, setIsLoadingCfd] = useState(false);

  // View Mode: '3D_AUTODESK_BIM' (Default) | 'GOOGLE_MAPS_THERMAL_GIS' | 'FLIR_INFRARED_CFD'
  const [viewportMode, setViewportMode] = useState('3D_AUTODESK_BIM');

  // Location Search & Greenfield Empty Plot Mode
  const [locationInput, setLocationInput] = useState('');
  const [activeLocationQuery, setActiveLocationQuery] = useState(null);
  const [isEmptyPlot, setIsEmptyPlot] = useState(false);
  const neighborMeshesMapRef = useRef([]);

  // Simulation Speed: 1x, 2x, 5x
  const [simSpeed, setSimSpeed] = useState(1);
  const [isAutoRotate, setIsAutoRotate] = useState(false); // Default to steady / freeze for easy reading!
  // Climate Season Mode: 'summer' (Heatwave Peak Cooling) | 'winter' (Sub-Zero Freeze & Heat Recovery)
  const [climateSeason, setClimateSeason] = useState('summer');

  // Floor HVAC Overrides
  const [floorSetpointOverrides, setFloorSetpointOverrides] = useState({});
  const [floorDamperOverrides, setFloorDamperOverrides] = useState({});

  // Physics Toggles
  const [showPeople, setShowPeople] = useState(true);
  const [showFurniture, setShowFurniture] = useState(true);
  const [showNeighborTemps, setShowNeighborTemps] = useState(true);
  const [showAirflowParticles, setShowAirflowParticles] = useState(true);
  const [showRadiationRays, setShowRadiationRays] = useState(true);
  const [showSpecularGlare, setShowSpecularGlare] = useState(true);
  const [showThermalPlumes, setShowThermalPlumes] = useState(true);
  const [isSectionCut, setIsSectionCut] = useState(true);
  const [explodeFactor, setExplodeFactor] = useState(0);
  const [selectedFloorIndex, setSelectedFloorIndex] = useState(null);

  // Active Engineering HUD Sub-Tab
  const [activePhysicsTab, setActivePhysicsTab] = useState('physics_summary');

  const currentNeighbors = (cfdData?.urban_context_150m && cfdData.urban_context_150m.length > 0)
    ? cfdData.urban_context_150m
    : (URBAN_CONTEXT_BY_PRESET[activePreset] || URBAN_CONTEXT_BY_PRESET.nyc_financial);

  const [selectedNeighbor, setSelectedNeighbor] = useState(currentNeighbors[0]);

  // Update selected neighbor when preset or cfdData changes
  useEffect(() => {
    if (cfdData?.urban_context_150m && cfdData.urban_context_150m.length > 0) {
      setSelectedNeighbor(cfdData.urban_context_150m[0]);
    } else {
      const neighbors = URBAN_CONTEXT_BY_PRESET[activePreset] || URBAN_CONTEXT_BY_PRESET.nyc_financial;
      setSelectedNeighbor(neighbors[0]);
    }
  }, [activePreset, cfdData]);

  // 🏢 Dynamic Company Tenant per Floor
  const [floorTenantState, setFloorTenantState] = useState({
    0: 'GOLDMAN_VAV',
    1: 'PFIZER_DOAS',
    2: 'PFIZER_DOAS',
    3: 'GOOGLE_UFAD',
    4: 'GOOGLE_UFAD',
    5: 'WEWORK_VRF',
    6: 'AUTODESK_DISPLACEMENT',
    7: 'AUTODESK_DISPLACEMENT'
  });

  const setFloorCompany = (floorIdx, companyId) => {
    setFloorTenantState((prev) => ({
      ...prev,
      [floorIdx]: companyId
    }));
  };

  // Fetch 12-Hour Autodesk CFD Microclimate Physics Data for the exact selected preset, custom location & season
  const fetchCfdPhysics = async (customLoc = activeLocationQuery, emptyPlot = isEmptyPlot, season = climateSeason) => {
    setIsLoadingCfd(true);
    try {
      let url = `${API_BASE}/api/hvac/autodesk-cfd-simulation?preset_key=${activePreset}&is_empty_plot=${emptyPlot}&climate_season=${season}`;
      if (customLoc) {
        url += `&location_query=${encodeURIComponent(customLoc)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setCfdData(json);
      }
    } catch (err) {
      console.warn('Failed to fetch CFD simulation:', err);
    } finally {
      setIsLoadingCfd(false);
    }
  };

  useEffect(() => {
    fetchCfdPhysics(activeLocationQuery, isEmptyPlot, climateSeason);
  }, [activePreset, activeLocationQuery, isEmptyPlot, climateSeason]);

  // Three.js References
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const buildingGroupRef = useRef(null);
  const urbanContextGroupRef = useRef(null);
  const radiationGroupRef = useRef(null);
  const airflowParticlesGroupRef = useRef(null);
  const peopleGroupRef = useRef(null);
  const furnitureGroupRef = useRef(null);
  const floorSlabsGroupRef = useRef(null);
  const ductworkGroupRef = useRef(null);
  const celestialGroupRef = useRef(null);
  const sunSubGroupRef = useRef(null);
  const moonSubGroupRef = useRef(null);

  const numFloors = 8;
  const floorHeight = 3.2;

  const isWinter = climateSeason === 'winter';
  const cfdHourly = cfdData?.hourly_cfd_schedule?.[selectedHour >= 6 && selectedHour <= 18 ? selectedHour - 6 : 6];
  const rawAmbient = isWinter
    ? Math.round((-3.5 + 8.5 * Math.sin(Math.max(0, (selectedHour - 6)) * Math.PI / 12.0)) * 10) / 10
    : (typeof cfdHourly?.ambient_dry_bulb_c === 'number' ? cfdHourly.ambient_dry_bulb_c : (dataStore?.hourly_schedule?.[selectedHour]?.ambient_temp_c || 34.5));
  const rawIndoor = isWinter ? 21.5 : (dataStore?.hourly_schedule?.[selectedHour]?.indoor_temp_c || 22.8);
  const rawChillerKw = isWinter
    ? Math.round(180 + 190 * (1 - Math.sin(Math.max(0, (selectedHour - 6)) * Math.PI / 12.0)))
    : (dataStore?.hourly_schedule?.[selectedHour]?.chiller_power_kw || 420);
  const rawSavingsKw = isWinter
    ? Math.round(75 + 40 * Math.sin(Math.max(0, (selectedHour - 6)) * Math.PI / 12.0))
    : (dataStore?.hourly_schedule?.[selectedHour]?.peak_shaving_kw || 140);
  const rawBattery = dataStore?.battery_soc_pct || 65;

  const timeLabel = `${String(selectedHour).padStart(2, '0')}:00`;

  // Dynamic Floor Profiles with Company Tenants
  const floorProfiles = Array.from({ length: numFloors }, (_, i) => {
    const tenantKey = floorTenantState[i] || 'GOOGLE_UFAD';
    const tenantHvac = COMPANY_HVAC_CATALOG[tenantKey] || COMPANY_HVAC_CATALOG.GOOGLE_UFAD;
    const baseDamperPct = floorDamperOverrides[i] !== undefined
      ? floorDamperOverrides[i]
      : (tenantHvac.damper_min_pct + Math.round(Math.sin((i / numFloors) * Math.PI + (selectedHour / 24) * Math.PI) * 35));
    const targetSetTemp = floorSetpointOverrides[i] !== undefined
      ? floorSetpointOverrides[i]
      : (isWinter ? 21.5 : 22.5);
    const airflowCfm = Math.round(baseDamperPct * (tenantHvac.supply_cfm_per_floor / 100));

    return {
      floorNumber: i + 1,
      floorIndex: i,
      name: i === 0 ? 'Ground Lobby & Security' : i === numFloors - 1 ? 'Penthouse Executive Boardroom' : `Level ${i + 1} - ${tenantHvac.shortCode}`,
      outsideTemp: rawAmbient,
      solarFlux: isWinter ? 420 : 680,
      targetTemp: targetSetTemp,
      damperPct: baseDamperPct,
      airflowCfm,
      zoneRole: `${tenantHvac.company} (${tenantHvac.shortCode})`,
      tenantHvac
    };
  });

  const outdoorTemp = rawAmbient;
  const indoorTemp = rawIndoor;
  const powerKw = rawChillerKw;
  const batteryPct = rawBattery;

  const outdoorPct = isWinter
    ? Math.min(100, Math.max(5, ((outdoorTemp - (-10)) / (15 - (-10))) * 100))
    : Math.min(100, Math.max(5, ((outdoorTemp - 15) / (48 - 15)) * 100));
  const indoorPct = Math.min(100, Math.max(5, ((indoorTemp - 15) / (30 - 15)) * 100));
  const powerPct = Math.min(100, Math.max(4, (powerKw / 750) * 100));

  // =========================================================================
  // 🌟 THREE.JS ULTRA-REALISTIC 3D GOOGLE MAPS GIS & OCCUPANT SIMULATION ENGINE
  // =========================================================================
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    container.innerHTML = '';

    let car1 = null;
    let car2 = null;
    let particleMeshGroup = null;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(viewportMode === 'FLIR_INFRARED_CFD' ? 0x050515 : isLight ? 0xf8fafc : 0x070d19);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    
    if (viewportMode === 'GOOGLE_MAPS_THERMAL_GIS') {
      camera.position.set(0, 62, 54);
      camera.lookAt(0, 0, 0);
    } else {
      // Default Comfortable Zoomed-Out Architectural Perspective (Full BIM + Surrounding Towers + Sky)
      camera.position.set(28, 20, 36);
      camera.lookAt(0, (numFloors * floorHeight) / 2 - 1, 0);
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    } catch (e) {
      console.warn('WebGL init error:', e);
      return;
    }

    // High-Contrast Multi-Source Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isLight ? 1.4 : 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff5ea, 2.2);
    dirLight1.position.set(30, 45, 30);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight2.position.set(-30, 20, -20);
    scene.add(dirLight2);

    // ☀️ DYNAMIC CELESTIAL GROUP (SUN & MOON)
    const celestialGroup = new THREE.Group();
    celestialGroupRef.current = celestialGroup;

    // --- SUN SUBGROUP ---
    const sunSubGroup = new THREE.Group();
    sunSubGroupRef.current = sunSubGroup;

    const sunCoreGeo = new THREE.SphereGeometry(3.6, 32, 32);
    const sunCoreMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const sunCore = new THREE.Mesh(sunCoreGeo, sunCoreMat);
    sunSubGroup.add(sunCore);

    const coronaGeo = new THREE.SphereGeometry(6.5, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide
    });
    const corona = new THREE.Mesh(coronaGeo, coronaMat);
    sunSubGroup.add(corona);

    const ringGeo = new THREE.RingGeometry(7.0, 9.0, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.lookAt(0, (numFloors * floorHeight) / 2, 0);
    sunSubGroup.add(ring);

    const sunLight = new THREE.DirectionalLight(0xfffaed, isWinter ? 1.8 : 2.5);
    sunLight.position.set(0, 0, 0);
    sunLight.target.position.set(0, (numFloors * floorHeight) / 2, 0);
    scene.add(sunLight.target);
    sunSubGroup.add(sunLight);

    celestialGroup.add(sunSubGroup);

    // --- MOON SUBGROUP ---
    const moonSubGroup = new THREE.Group();
    moonSubGroupRef.current = moonSubGroup;

    const moonGeo = new THREE.SphereGeometry(3.2, 32, 32);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xf0f9ff });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonSubGroup.add(moonMesh);

    const moonGlowGeo = new THREE.SphereGeometry(5.4, 32, 32);
    const moonGlowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide
    });
    moonSubGroup.add(new THREE.Mesh(moonGlowGeo, moonGlowMat));

    const moonLight = new THREE.DirectionalLight(0xbae6fd, 1.1);
    moonLight.position.set(0, 0, 0);
    moonLight.target.position.set(0, (numFloors * floorHeight) / 2, 0);
    moonSubGroup.add(moonLight);

    celestialGroup.add(moonSubGroup);
    scene.add(celestialGroup);

    // Initial position based on selectedHour
    const isInitDay = selectedHour >= 6 && selectedHour <= 19;
    sunSubGroup.visible = isInitDay;
    moonSubGroup.visible = !isInitDay;

    if (isInitDay) {
      const hourAngle = ((selectedHour - 6) / 13) * Math.PI;
      const sunX = Math.cos(Math.PI - hourAngle) * 55;
      const sunY = Math.max(12, Math.sin(hourAngle) * 52);
      const sunZ = Math.sin(hourAngle) * 25 + 15;
      celestialGroup.position.set(sunX, sunY, sunZ);
    } else {
      const nightProgress = selectedHour >= 20 ? (selectedHour - 20) / 10 : (selectedHour + 4) / 10;
      const moonAngle = nightProgress * Math.PI;
      const moonX = Math.cos(Math.PI - moonAngle) * 45;
      const moonY = Math.max(15, Math.sin(moonAngle) * 48);
      const moonZ = -30 - Math.sin(moonAngle) * 15;
      celestialGroup.position.set(moonX, moonY, moonZ);
    }

    // Root Groups
    const buildingGroup = new THREE.Group();
    buildingGroupRef.current = buildingGroup;
    scene.add(buildingGroup);

    const urbanContextGroup = new THREE.Group();
    urbanContextGroupRef.current = urbanContextGroup;
    scene.add(urbanContextGroup);

    const radiationGroup = new THREE.Group();
    radiationGroupRef.current = radiationGroup;
    scene.add(radiationGroup);

    const airflowParticlesGroup = new THREE.Group();
    airflowParticlesGroupRef.current = airflowParticlesGroup;
    scene.add(airflowParticlesGroup);

    const peopleGroup = new THREE.Group();
    peopleGroupRef.current = peopleGroup;
    buildingGroup.add(peopleGroup);

    const furnitureGroup = new THREE.Group();
    furnitureGroupRef.current = furnitureGroup;
    buildingGroup.add(furnitureGroup);

    // =========================================================================
    // 🗺️ GOOGLE MAPS HIGH-RESOLUTION THERMAL GIS TERRAIN & ROADWAYS
    // =========================================================================
    if (viewportMode === 'GOOGLE_MAPS_THERMAL_GIS' || viewportMode === 'FLIR_INFRARED_CFD') {
      const terrainGeo = new THREE.PlaneGeometry(160, 160, 32, 32);
      terrainGeo.rotateX(-Math.PI / 2);
      
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0b0f19';
        ctx.fillRect(0, 0, 1024, 1024);

        // Asphalt Streets & Avenues
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(440, 0, 144, 1024); // North-South Broadway
        ctx.fillRect(0, 440, 1024, 144); // East-West Wall Street

        // Street Dash Line Markings
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 4;
        ctx.setLineDash([24, 20]);
        ctx.beginPath();
        ctx.moveTo(512, 0); ctx.lineTo(512, 1024);
        ctx.moveTo(0, 512); ctx.lineTo(1024, 512);
        ctx.stroke();
        ctx.setLineDash([]);

        // Sidewalks
        ctx.fillStyle = '#334155';
        ctx.fillRect(380, 0, 60, 1024);
        ctx.fillRect(584, 0, 60, 1024);
        ctx.fillRect(0, 380, 1024, 60);
        ctx.fillRect(0, 584, 1024, 60);

        // FortyGuard Thermal Gradient Hotspots
        const radGrad1 = ctx.createRadialGradient(280, 512, 20, 280, 512, 260);
        radGrad1.addColorStop(0, 'rgba(244, 63, 94, 0.85)');
        radGrad1.addColorStop(0.6, 'rgba(249, 115, 22, 0.55)');
        radGrad1.addColorStop(1, 'transparent');
        ctx.fillStyle = radGrad1;
        ctx.fillRect(0, 0, 1024, 1024);

        const radGrad2 = ctx.createRadialGradient(512, 750, 20, 512, 750, 240);
        radGrad2.addColorStop(0, 'rgba(249, 115, 22, 0.8)');
        radGrad2.addColorStop(1, 'transparent');
        ctx.fillStyle = radGrad2;
        ctx.fillRect(0, 0, 1024, 1024);

        const radGrad3 = ctx.createRadialGradient(512, 200, 20, 512, 200, 160);
        radGrad3.addColorStop(0, 'rgba(6, 182, 212, 0.7)');
        radGrad3.addColorStop(1, 'transparent');
        ctx.fillStyle = radGrad3;
        ctx.fillRect(0, 0, 1024, 1024);
      }

      const mapTexture = new THREE.CanvasTexture(canvas);
      const terrainMat = new THREE.MeshStandardMaterial({ map: mapTexture, roughness: 0.7, metalness: 0.2 });
      const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
      terrainMesh.position.y = -0.15;
      urbanContextGroup.add(terrainMesh);

      // Target Center Reticle
      const pinGeo = new THREE.RingGeometry(18, 19.5, 32);
      pinGeo.rotateX(-Math.PI / 2);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.y = 0.2;
      urbanContextGroup.add(pin);

    } else {
      // Crisp Titanium Base Platform & Grid in BIM Mode
      const platformGeo = new THREE.BoxGeometry(32, 0.6, 28);
      const platformMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.5 });
      const platform = new THREE.Mesh(platformGeo, platformMat);
      platform.position.y = -0.3;
      buildingGroup.add(platform);

      const grid = new THREE.GridHelper(70, 35, 0x00f0ff, 0x1e293b);
      grid.position.y = 0.01;
      scene.add(grid);
    }

    // =========================================================================
    // 🏢 2. RENDER SURROUNDING TOWERS (DYNAMIC HOURLY SURFACE TEMPERATURES)
    // =========================================================================
    const isBimView = viewportMode === '3D_AUTODESK_BIM';
    const neighborOpacity = isBimView ? 0.35 : 0.85;

    neighborMeshesMapRef.current = [];

    currentNeighbors.forEach((neighbor) => {
      const dyn = calculateDynamicNeighborThermal(neighbor, selectedHour, rawAmbient, cfdData);
      const nGeo = new THREE.BoxGeometry(neighbor.size[0], neighbor.size[1], neighbor.size[2]);
      const nMat = new THREE.MeshStandardMaterial({
        color: dyn.colorHex,
        roughness: 0.25,
        metalness: 0.8,
        transparent: true,
        opacity: neighborOpacity,
        emissive: dyn.colorHex,
        emissiveIntensity: isBimView ? 0.3 : 0.5
      });
      const nMesh = new THREE.Mesh(nGeo, nMat);
      nMesh.position.set(neighbor.pos[0], neighbor.pos[1], neighbor.pos[2]);

      const edges = new THREE.EdgesGeometry(nGeo);
      const lineMat = new THREE.LineBasicMaterial({ color: dyn.colorHex, transparent: true, opacity: 0.7 });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      nMesh.add(wireframe);

      urbanContextGroup.add(nMesh);

      // Keep reference for dynamic hour changes
      neighborMeshesMapRef.current.push({
        id: neighbor.id,
        neighbor,
        mesh: nMesh,
        wireframe
      });

      // Rooftop Condenser Exhaust Plumes
      if (showThermalPlumes && neighbor.hasPlume) {
        const plumeGeo = new THREE.CylinderGeometry(3.0, 5.5, 10.0, 16);
        const plumeMat = new THREE.MeshStandardMaterial({
          color: 0xf43f5e,
          transparent: true,
          opacity: isBimView ? 0.2 : 0.4,
          emissive: 0xf43f5e,
          emissiveIntensity: 0.85
        });
        const plumeMesh = new THREE.Mesh(plumeGeo, plumeMat);
        plumeMesh.position.set(neighbor.pos[0], neighbor.pos[1] + neighbor.size[1] / 2 + 5.0, neighbor.pos[2]);
        urbanContextGroup.add(plumeMesh);
      }
    });

    // 🌳 Procedural Cool Microclimate Trees along sidewalk (26°C Oasis)
    const treeGeo = new THREE.SphereGeometry(1.8, 8, 8);
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.8, emissive: 0x059669, emissiveIntensity: 0.4 });
    const treeTrunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 3, 6);
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f });

    [[-18, 0, 18], [-18, 0, -18], [18, 0, 18], [18, 0, -18], [0, 0, -22]].forEach(([tx, ty, tz]) => {
      const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
      trunk.position.set(tx, 1.5, tz);
      const foliage = new THREE.Mesh(treeGeo, treeMat);
      foliage.position.set(tx, 3.5, tz);
      urbanContextGroup.add(trunk, foliage);
    });

    // 🚗 3D Low-Poly Animated Cars on Broadway & Wall St
    const carGeo = new THREE.BoxGeometry(2.4, 1.1, 4.2);
    const carMat1 = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 });
    car1 = new THREE.Mesh(carGeo, carMat1);
    car1.position.set(-6.0, 0.6, 24);
    urbanContextGroup.add(car1);

    const carMat2 = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
    car2 = new THREE.Mesh(carGeo, carMat2);
    car2.position.set(6.0, 0.6, -26);
    urbanContextGroup.add(car2);

    // =========================================================================
    // 🌊 3. ANIMATED THERMAL HEAT WAVE PARTICLES & RAYS (FLOWING ONTO MAIN BUILDING)
    // =========================================================================
    if (showRadiationRays) {
      const radPoints = [
        new THREE.Vector3(-40, 20, -5), new THREE.Vector3(-8, 14, -2),
        new THREE.Vector3(-40, 12, -5), new THREE.Vector3(-8, 8, -2),
        new THREE.Vector3(0, 16, 40), new THREE.Vector3(0, 12, 7),
        new THREE.Vector3(36, 8, -4), new THREE.Vector3(8, 8, -2)
      ];
      const radGeo = new THREE.BufferGeometry().setFromPoints(radPoints);
      const radMat = new THREE.LineDashedMaterial({ color: 0xf43f5e, dashSize: 1.5, gapSize: 0.8, transparent: true, opacity: 0.9 });
      const radLines = new THREE.LineSegments(radGeo, radMat);
      radLines.computeLineDistances();
      radiationGroup.add(radLines);

      // Expanding Radiative Heat Pulse Rings
      const pulseGeo = new THREE.RingGeometry(3.5, 4.2, 24);
      pulseGeo.rotateY(Math.PI / 2);
      const pulseMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.75, side: THREE.DoubleSide });
      const pulseRing = new THREE.Mesh(pulseGeo, pulseMat);
      pulseRing.position.set(-18, 14, -2);
      radiationGroup.add(pulseRing);
    }

    if (showSpecularGlare) {
      const glarePoints = [
        new THREE.Vector3(45, 52, 35), new THREE.Vector3(-40, 28, -5),
        new THREE.Vector3(-40, 28, -5), new THREE.Vector3(-8, 18, 2)
      ];
      const glareGeo = new THREE.BufferGeometry().setFromPoints(glarePoints);
      const glareMat = new THREE.LineBasicMaterial({ color: 0xffd700, linewidth: 2, transparent: true, opacity: 0.95 });
      const glareRay = new THREE.LineSegments(glareGeo, glareMat);
      radiationGroup.add(glareRay);

      const hotspotGeo = new THREE.SphereGeometry(1.4, 16, 16);
      const hotspotMat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.85 });
      const hotspot = new THREE.Mesh(hotspotGeo, hotspotMat);
      hotspot.position.set(-8.2, 18, 2);
      radiationGroup.add(hotspot);
    }

    // =========================================================================
    // 💨 4. ANIMATED AIRFLOW SUPPLY PARTICLES (SUMMER COOL CYAN vs WINTER WARM AMBER)
    // =========================================================================
    const particleCount = 140;
    const particleGeo = new THREE.SphereGeometry(0.22, 8, 8);
    // Summer: Cool Cyan/Blue 0x00f0ff (Chilled Supply Air) | Winter: Warm Amber/Orange 0xf59e0b (Thermal Hydronic Heat)
    const particleColor = isWinter ? 0xf59e0b : 0x00f0ff;
    const particleMat = new THREE.MeshBasicMaterial({ color: particleColor, transparent: true, opacity: 0.95 });
    particleMeshGroup = new THREE.Group();

    if (showAirflowParticles && !isEmptyPlot) {
      for (let p = 0; p < particleCount; p++) {
        const pMesh = new THREE.Mesh(particleGeo, particleMat);
        const flIdx = Math.floor(Math.random() * numFloors);
        const pY = flIdx * floorHeight + 1.8;
        const pX = (Math.random() - 0.5) * 12.0;
        const pZ = (Math.random() - 0.5) * 10.0;
        pMesh.position.set(pX, pY, isSectionCut ? pZ * 0.5 - 0.5 : pZ);
        pMesh.userData = { speed: 0.06 + Math.random() * 0.08, baseY: pY, flIdx };
        particleMeshGroup.add(pMesh);
      }
      airflowParticlesGroup.add(particleMeshGroup);
    }

    // =========================================================================
    // 🏢 5. RENDER TARGET BUILDING / EMPTY GREENFIELD PARCEL
    // =========================================================================
    const floorWidth = 16;
    const floorDepth = 14;

    const floorSlabsGroup = new THREE.Group();
    const ductworkGroup = new THREE.Group();
    const conferencePodsGroup = new THREE.Group();

    buildingGroup.add(floorSlabsGroup);
    buildingGroup.add(ductworkGroup);
    buildingGroup.add(conferencePodsGroup);

    floorSlabsGroupRef.current = floorSlabsGroup;
    ductworkGroupRef.current = ductworkGroup;

    if (isEmptyPlot) {
      // 🏗️ 3D GREENFIELD EXCAVATION PARCEL (Empty Construction Plot with Soil Heat Influx)
      const plotPitGeo = new THREE.BoxGeometry(24, 2.2, 20);
      const plotPitMat = new THREE.MeshStandardMaterial({
        color: 0x3e2723, // Earth / Soil excavation pit
        roughness: 0.95,
        metalness: 0.05
      });
      const plotPit = new THREE.Mesh(plotPitGeo, plotPitMat);
      plotPit.position.set(0, -1.1, 0);
      buildingGroup.add(plotPit);

      // Pile caps / concrete foundation footings
      const footingGeo = new THREE.BoxGeometry(2.4, 0.8, 2.4);
      const footingMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5, metalness: 0.5 });
      [[-7, -6], [7, -6], [-7, 6], [7, 6], [0, 0], [-7, 0], [7, 0]].forEach(([fx, fz]) => {
        const footing = new THREE.Mesh(footingGeo, footingMat);
        footing.position.set(fx, 0.2, fz);
        buildingGroup.add(footing);
      });

      // Survey hazard boundary stakes
      const stakeGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.6, 8);
      const stakeMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      [[-11.8, -9.8], [11.8, -9.8], [-11.8, 9.8], [11.8, 9.8]].forEach(([sx, sz]) => {
        const stake = new THREE.Mesh(stakeGeo, stakeMat);
        stake.position.set(sx, 1.3, sz);
        buildingGroup.add(stake);
      });

      // Radiative Heat Absorption Gradient Rings in Soil
      [3.5, 7.5, 11.5].forEach((radius, rIdx) => {
        const ringGeo = new THREE.RingGeometry(radius - 0.25, radius + 0.25, 32);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
          color: rIdx === 0 ? 0xef4444 : rIdx === 1 ? 0xf97316 : 0xeab308,
          transparent: true,
          opacity: 0.75 - rIdx * 0.18,
          side: THREE.DoubleSide
        });
        const heatRing = new THREE.Mesh(ringGeo, ringMat);
        heatRing.position.set(0, 0.05, 0);
        buildingGroup.add(heatRing);
      });
    } else {
      // Central Elevator & Structural Core Shaft
      const coreGeo = new THREE.BoxGeometry(4.4, numFloors * floorHeight + 1.5, 4.4);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.4,
        metalness: 0.6,
        emissive: 0x1e293b,
        emissiveIntensity: 0.3
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.set(0, (numFloors * floorHeight + 1.5) / 2, 0);
      floorSlabsGroup.add(coreMesh);

    // Primary Vertical HVAC Supply Riser (Cold Blue in Summer, Warm Orange in Winter)
    const riserGeo = new THREE.BoxGeometry(2.0, numFloors * floorHeight + 2, 2.0);
    const riserMat = new THREE.MeshStandardMaterial({
      color: isWinter ? 0xf97316 : 0x00f0ff,
      metalness: 0.8,
      roughness: 0.2,
      emissive: isWinter ? 0xea580c : 0x00d8f6,
      emissiveIntensity: 0.85
    });
    const verticalRiser = new THREE.Mesh(riserGeo, riserMat);
    verticalRiser.position.set(-3.6, (numFloors * floorHeight + 2) / 2, 0);
    ductworkGroup.add(verticalRiser);

    // Floor Plates & Interior Architectural Elements
    for (let i = 0; i < numFloors; i++) {
      const floorData = floorProfiles[i] || floorProfiles[0];
      const isFloorIsolated = selectedFloorIndex !== null && selectedFloorIndex !== i;
      const floorOpacity = isFloorIsolated ? 0.15 : 1.0;
      const tenantHvac = floorData.tenantHvac;

      const baseY = i * floorHeight + 1.0;
      const currentFloorDepth = isSectionCut ? floorDepth * 0.65 : floorDepth;

      // 1. Solid Bright Floor Slab Plate
      const slabGeo = new THREE.BoxGeometry(floorWidth, 0.45, currentFloorDepth);
      const slabMat = new THREE.MeshStandardMaterial({
        color: isLight ? 0xe2e8f0 : 0x475569,
        roughness: 0.3,
        metalness: 0.4,
        transparent: isFloorIsolated,
        opacity: floorOpacity,
        emissive: 0x1e293b,
        emissiveIntensity: 0.2
      });
      const slabMesh = new THREE.Mesh(slabGeo, slabMat);
      slabMesh.position.set(0, baseY - 0.8, isSectionCut ? -floorDepth * 0.15 : 0);
      slabMesh.userData = { floorIndex: i, baseOffset: i * floorHeight };
      floorSlabsGroup.add(slabMesh);

      // Glowing Slab Perimeter Wireframe
      const slabEdges = new THREE.EdgesGeometry(slabGeo);
      const slabLineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 });
      const slabWireframe = new THREE.LineSegments(slabEdges, slabLineMat);
      slabMesh.add(slabWireframe);

      // 2. Structural Steel Columns
      const colGeo = new THREE.BoxGeometry(0.55, floorHeight - 0.45, 0.55);
      const colMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.8,
        roughness: 0.2,
        transparent: isFloorIsolated,
        opacity: floorOpacity
      });
      const col1 = new THREE.Mesh(colGeo, colMat);
      col1.position.set(floorWidth / 2 - 0.6, baseY + floorHeight / 2 - 0.8, isSectionCut ? -1.0 : floorDepth / 2 - 0.6);
      const col2 = new THREE.Mesh(colGeo, colMat);
      col2.position.set(-floorWidth / 2 + 0.6, baseY + floorHeight / 2 - 0.8, isSectionCut ? -1.0 : floorDepth / 2 - 0.6);
      floorSlabsGroup.add(col1, col2);

      // =========================================================================
      // 👥 HIGH-VISIBILITY 3D PEOPLE (HEAD, VIBRANT SHIRTS, LEGS & THERMAL PADS)
      // =========================================================================
      if (showPeople && !isFloorIsolated) {
        const floorPeopleCount = i === 0 ? 7 : i === numFloors - 1 ? 6 : 5;
        for (let p = 0; p < floorPeopleCount; p++) {
          const person = new THREE.Group();
          const shirtColor = OCCUPANT_SHIRT_COLORS[(i * 3 + p) % OCCUPANT_SHIRT_COLORS.length];

          // Head with skin tone
          const headGeo = new THREE.SphereGeometry(0.32, 12, 12);
          const headMat = new THREE.MeshStandardMaterial({ color: 0xffdfba, roughness: 0.4 });
          const head = new THREE.Mesh(headGeo, headMat);
          head.position.y = 1.55;
          person.add(head);

          // Hair cap
          const hairGeo = new THREE.SphereGeometry(0.33, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
          const hairMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
          const hair = new THREE.Mesh(hairGeo, hairMat);
          hair.position.y = 1.58;
          person.add(hair);

          // Torso (Vibrant Neon Shirt)
          const torsoGeo = new THREE.CylinderGeometry(0.3, 0.25, 0.8, 10);
          const torsoMat = new THREE.MeshStandardMaterial({
            color: shirtColor,
            roughness: 0.2,
            emissive: shirtColor,
            emissiveIntensity: 0.55
          });
          const torso = new THREE.Mesh(torsoGeo, torsoMat);
          torso.position.y = 0.98;
          person.add(torso);

          // Legs / Trousers
          const legsGeo = new THREE.CylinderGeometry(0.2, 0.17, 0.7, 8);
          const legsMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
          const legs = new THREE.Mesh(legsGeo, legsMat);
          legs.position.y = 0.35;
          person.add(legs);

          // Glowing Thermal Metabolic Halo (+120W Sensible Heat Ring)
          const haloGeo = new THREE.RingGeometry(0.38, 0.65, 20);
          haloGeo.rotateX(-Math.PI / 2);
          const haloMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
          const halo = new THREE.Mesh(haloGeo, haloMat);
          halo.position.y = 0.05;
          person.add(halo);

          const px = (p - floorPeopleCount / 2) * 2.4 + (Math.random() - 0.5) * 0.3;
          const pz = isSectionCut ? (p % 2 === 0 ? 0.6 : -1.2) : (Math.random() - 0.5) * (floorDepth * 0.5);
          person.position.set(px, baseY - 0.6, pz);
          peopleGroup.add(person);
        }
      }

      // =========================================================================
      // 🖥️ 3D OFFICE WORKSTATION DESKS & MONITORS
      // =========================================================================
      if (showFurniture && !isFloorIsolated) {
        for (let d = -4.5; d <= 4.5; d += 3.0) {
          // Desk
          const deskGeo = new THREE.BoxGeometry(2.0, 0.75, 0.95);
          const deskMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3, metalness: 0.4 });
          const desk = new THREE.Mesh(deskGeo, deskMat);
          desk.position.set(d, baseY - 0.25, isSectionCut ? -1.8 : 1.5);
          furnitureGroup.add(desk);

          // Glowing Dual Screens
          const screenGeo = new THREE.BoxGeometry(0.85, 0.55, 0.06);
          const screenMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
          const screen = new THREE.Mesh(screenGeo, screenMat);
          screen.position.set(d, baseY + 0.35, isSectionCut ? -1.8 : 1.5);
          furnitureGroup.add(screen);
        }
      }

      // 3. Exterior Glazing Shell
      if (!isSectionCut) {
        const glassGeo = new THREE.BoxGeometry(floorWidth * 0.99, floorHeight * 0.88, floorDepth * 0.99);
        const glassMat = new THREE.MeshStandardMaterial({
          color: tenantHvac.colorHex,
          transparent: true,
          opacity: 0.45,
          roughness: 0.1,
          metalness: 0.8
        });
        const glassMesh = new THREE.Mesh(glassGeo, glassMat);
        glassMesh.position.set(0, baseY + floorHeight / 2 - 0.8, 0);

        const edges = new THREE.EdgesGeometry(glassGeo);
        const lineMat = new THREE.LineBasicMaterial({ color: tenantHvac.colorHex, transparent: true, opacity: 0.65 });
        const wireframe = new THREE.LineSegments(edges, lineMat);
        glassMesh.add(wireframe);
        floorSlabsGroup.add(glassMesh);
      }

      // 4. Horizontal HVAC Supply Ducts
      const floorDuctGroup = new THREE.Group();
      const horizDuctGeo = new THREE.BoxGeometry(floorWidth * 0.84, 0.45, 0.65);
      const ductMat = new THREE.MeshStandardMaterial({
        color: tenantHvac.colorHex,
        metalness: 0.9,
        roughness: 0.1,
        emissive: tenantHvac.colorHex,
        emissiveIntensity: 0.8
      });
      const horizDuct = new THREE.Mesh(horizDuctGeo, ductMat);
      horizDuct.position.set(0, baseY + floorHeight - 1.1, isSectionCut ? -1.5 : 0);
      floorDuctGroup.add(horizDuct);
      floorDuctGroup.userData = { floorIndex: i, baseOffset: i * floorHeight };
      ductworkGroup.add(floorDuctGroup);
    }

    // Roof Chiller Plant
    const roofY = numFloors * floorHeight + 1.0;
    const chillerGeo = new THREE.BoxGeometry(5.5, 2.2, 3.8);
    const chillerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const chillerPlant = new THREE.Mesh(chillerGeo, chillerMat);
    chillerPlant.position.set(-3.2, roofY + 1.1, -2.0);
    buildingGroup.add(chillerPlant);
    }

    // Mouse Orbit Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;

      buildingGroup.rotation.y += deltaX * 0.008;
      urbanContextGroup.rotation.y += deltaX * 0.008;
      radiationGroup.rotation.y += deltaX * 0.008;
      airflowParticlesGroup.rotation.y += deltaX * 0.008;
      camera.position.y = Math.max(4, Math.min(85, camera.position.y - deltaY * 0.1));
      camera.lookAt(0, (numFloors * floorHeight) / 2 - 1, 0);

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Resize Handler via ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && renderer && camera) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      try {
        // Animate flowing airflow particles (only when building exists)
        if (showAirflowParticles && !isEmptyPlot && particleMeshGroup && particleMeshGroup.children) {
          particleMeshGroup.children.forEach((p) => {
            p.position.x += p.userData.speed * simSpeed;
            if (p.position.x > 7.0) {
              p.position.x = -7.0;
            }
          });
        }

        // Animate moving cars
        if (car1 && car2) {
          car1.position.z -= 0.12 * simSpeed;
          if (car1.position.z < -45) car1.position.z = 45;

          car2.position.z += 0.14 * simSpeed;
          if (car2.position.z > 45) car2.position.z = -45;
        }

        if (isAutoRotate && !isDragging && buildingGroup && urbanContextGroup && radiationGroup && airflowParticlesGroup) {
          const rotSpeed = 0.0008 * simSpeed;
          buildingGroup.rotation.y += rotSpeed;
          urbanContextGroup.rotation.y += rotSpeed;
          radiationGroup.rotation.y += rotSpeed;
          airflowParticlesGroup.rotation.y += rotSpeed;
        }

        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      } catch (err) {
        console.warn('Animation loop non-fatal error:', err);
      }
    };

    animate();

    return () => {
      if (animId) cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (container && renderer?.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer?.dispose();
    };
  }, [numFloors, isSectionCut, selectedFloorIndex, showRadiationRays, showSpecularGlare, showThermalPlumes, showNeighborTemps, showAirflowParticles, showPeople, showFurniture, viewportMode, simSpeed, floorTenantState, theme, isEmptyPlot, activePreset, isAutoRotate, climateSeason, isWinter]);

  // ☀️ / 🌙 REAL-TIME DYNAMIC SUN & MOON CELESTIAL POSITION & PHASES
  // Transitions Sun (Daytime) vs Moon (Nighttime) smoothly as selectedHour moves
  useEffect(() => {
    const celestial = celestialGroupRef.current;
    const sunSub = sunSubGroupRef.current;
    const moonSub = moonSubGroupRef.current;
    if (!celestial || !sunSub || !moonSub) return;

    const isDay = selectedHour >= 6 && selectedHour <= 19;
    sunSub.visible = isDay;
    moonSub.visible = !isDay;

    if (isDay) {
      const hourAngle = ((selectedHour - 6) / 13) * Math.PI; // 0 at 06:00 (East) to PI at 19:00 (West)
      const sunX = Math.cos(Math.PI - hourAngle) * 55;
      const sunY = Math.max(12, Math.sin(hourAngle) * 52);
      const sunZ = Math.sin(hourAngle) * 25 + 15;
      celestial.position.set(sunX, sunY, sunZ);
    } else {
      // Night lunar path (20:00 to 05:00)
      const nightProgress = selectedHour >= 20 ? (selectedHour - 20) / 10 : (selectedHour + 4) / 10;
      const moonAngle = nightProgress * Math.PI;
      const moonX = Math.cos(Math.PI - moonAngle) * 45;
      const moonY = Math.max(15, Math.sin(moonAngle) * 48);
      const moonZ = -30 - Math.sin(moonAngle) * 15;
      celestial.position.set(moonX, moonY, moonZ);
    }
  }, [selectedHour, isWinter]);

  // 🌡️ REAL-TIME DYNAMIC HOURLY SURROUNDING BUILDINGS THERMAL UPDATER (API SYNC)
  // Updates Three.js neighbor mesh colors & emissive glows instantly as selectedHour changes
  useEffect(() => {
    if (!neighborMeshesMapRef.current || neighborMeshesMapRef.current.length === 0) return;
    neighborMeshesMapRef.current.forEach((item) => {
      const dyn = calculateDynamicNeighborThermal(item.neighbor, selectedHour, rawAmbient, cfdData);
      if (item.mesh && item.mesh.material) {
        item.mesh.material.color.setHex(dyn.colorHex);
        item.mesh.material.emissive.setHex(dyn.colorHex);
      }
      if (item.wireframe && item.wireframe.material) {
        item.wireframe.material.color.setHex(dyn.colorHex);
      }
    });
  }, [selectedHour, rawAmbient, cfdData]);

  const setCameraAngle = (viewName) => {
    const camera = cameraRef.current;
    if (!camera) return;

    if (viewName === 'OCCUPANTS_ZOOM') {
      // Zoom right into the 3rd floor office workers!
      camera.position.set(8, 9.5, 12);
      camera.lookAt(0, 8.5, 0);
    } else if (viewName === 'ISO') {
      camera.position.set(28, 20, 36);
      camera.lookAt(0, (numFloors * floorHeight) / 2 - 1, 0);
    } else if (viewName === 'FRONT') {
      camera.position.set(0, 16, 42);
      camera.lookAt(0, (numFloors * floorHeight) / 2 - 1, 0);
    } else if (viewName === 'TOP') {
      camera.position.set(0, 68, 0);
      camera.lookAt(0, 0, 0);
    } else if (viewName === 'WEST_RADIATION') {
      camera.position.set(-46, 22, 0);
      camera.lookAt(0, (numFloors * floorHeight) / 2 - 1, 0);
    }
  };

  const zoomCamera = (delta) => {
    const camera = cameraRef.current;
    if (!camera) return;
    camera.position.multiplyScalar(delta);
    camera.lookAt(0, (numFloors * floorHeight) / 2 - 1, 0);
  };

  const cfdCurrentHour = cfdData?.hourly_cfd_schedule?.[selectedHour >= 6 && selectedHour <= 18 ? selectedHour - 6 : 8] || cfdData?.hourly_cfd_schedule?.[8] || {};
  const cfdFacades = cfdCurrentHour?.facades || [];

  return (
    <div className="space-y-5">
      {/* ========================================================================= */}
      {/* 🧭 1. TOP HORIZONTAL HVAC MISSION CONTROL BAR */}
      {/* ========================================================================= */}
      <div className={`p-4 rounded-3xl border shadow-xl space-y-3 transition-all ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/95 border-slate-800 backdrop-blur-md'
      }`}>
        {/* Row 1: Location Geocoder + Site Status Mode Toggle */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (locationInput.trim()) {
                setActiveLocationQuery(locationInput.trim());
                fetchCfdPhysics(locationInput.trim(), isEmptyPlot);
              }
            }}
            className="flex-1 flex items-center gap-2"
          >
            <div className="relative flex-1">
              <MapPin className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Enter Address / Landmark / GPS (e.g. One World Financial, 30 Hudson Yards, Dubai)..."
                className={`w-full pl-10 pr-3 py-2 rounded-2xl text-xs font-mono font-bold border focus:outline-none transition-all ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-950 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500'
                    : 'bg-slate-950 border-slate-700 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-400'
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={isLoadingCfd}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-xs shadow-md cursor-pointer disabled:opacity-50 transition-all shrink-0"
            >
              {isLoadingCfd ? 'Simulating...' : '📍 Simulate Site'}
            </button>
          </form>

          {/* Target BIM vs Greenfield Plot Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsEmptyPlot(false);
                fetchCfdPhysics(activeLocationQuery, false);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                !isEmptyPlot ? 'bg-cyan-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              🏢 Target BIM Facility
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEmptyPlot(true);
                fetchCfdPhysics(activeLocationQuery, true);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                isEmptyPlot ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              🏗️ Greenfield Plot
            </button>
          </div>
        </div>

        {/* Row 2: Presets, View Mode, Season, Speed & Floor Level Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-800/80 text-xs font-mono">
          {/* Quick Location Pills */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold pr-1">Presets:</span>
            {[
              { label: 'One World Financial', query: 'One World Financial Tower, Lower Manhattan, NY' },
              { label: '30 Hudson Yards', query: '30 Hudson Yards, New York, NY' },
              { label: 'Grand Central', query: 'Grand Central Plaza, 42nd St, New York, NY' },
              { label: 'Dubai Burj District', query: 'Downtown Dubai, UAE' }
            ].map((loc) => (
              <button
                key={loc.label}
                type="button"
                onClick={() => {
                  setLocationInput(loc.query);
                  setActiveLocationQuery(loc.query);
                  fetchCfdPhysics(loc.query, isEmptyPlot);
                }}
                className={`text-[10px] px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                  activeLocationQuery === loc.query
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-sm'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {loc.label}
              </button>
            ))}
          </div>

          {/* View Modes + Season + Sim Speed */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-bold">
              <button
                onClick={() => setViewportMode('3D_AUTODESK_BIM')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  viewportMode === '3D_AUTODESK_BIM' ? 'bg-cyan-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                🏢 3D BIM
              </button>
              <button
                onClick={() => setViewportMode('GOOGLE_MAPS_THERMAL_GIS')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  viewportMode === 'GOOGLE_MAPS_THERMAL_GIS' ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                🗺️ OpenStreetMap GIS
              </button>
              <button
                onClick={() => setViewportMode('FLIR_INFRARED_CFD')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  viewportMode === 'FLIR_INFRARED_CFD' ? 'bg-purple-600 text-white font-black shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                🔥 FLIR
              </button>
            </div>

            {/* Climate Season */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px]">
              <button
                type="button"
                onClick={() => setClimateSeason('summer')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  climateSeason === 'summer' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                ☀️ Summer
              </button>
              <button
                type="button"
                onClick={() => setClimateSeason('winter')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  climateSeason === 'winter' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                ❄️ Winter
              </button>
            </div>

            {/* Speed & Freeze */}
            <div className="flex items-center gap-1">
              <div className="flex items-center p-0.5 rounded-xl bg-slate-950 border border-slate-800 text-[9px]">
                {[1, 2, 5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setSimSpeed(spd)}
                    className={`px-1.5 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                      simSpeed === spd ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setIsAutoRotate(!isAutoRotate)}
                className={`p-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                  isAutoRotate ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
                title={isAutoRotate ? 'Auto-Rotate ON' : 'Steady / Freeze (OFF)'}
              >
                {isAutoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🏢 2. ENTERPRISE 3D DIGITAL TWIN & REAL-TIME TELEMETRY WORKSTATION */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Side: 3D Viewport Canvas Container (8 cols) */}
        <div className={`xl:col-span-8 rounded-3xl p-5 shadow-xl border relative overflow-hidden flex flex-col justify-between ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800 backdrop-blur-md'
        }`}>
          {/* Floor Level Selector Strip for HVAC Team */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-2.5 font-mono text-[11px] z-10">
            <span className="text-slate-400 font-bold text-[10px] uppercase flex items-center gap-1 shrink-0">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> Floors:
            </span>
            <button
              type="button"
              onClick={() => setSelectedFloorIndex(null)}
              className={`px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer shrink-0 ${
                selectedFloorIndex === null ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-md' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              All Floors (Stack)
            </button>
            {floorProfiles.map((fl, idx) => (
              <button
                key={fl.floorNumber}
                type="button"
                onClick={() => setSelectedFloorIndex(selectedFloorIndex === idx ? null : idx)}
                className={`px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                  selectedFloorIndex === idx
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 font-black shadow-md ring-1 ring-cyan-300'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>F{fl.floorNumber}</span>
                <span className="text-[9px] opacity-75">({fl.tenantHvac.shortCode})</span>
              </button>
            ))}
          </div>

          {/* Top Controls & Camera Angles */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2 z-10">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-black px-3 py-1 rounded-xl border bg-slate-950 text-cyan-300 border-slate-800">
                TIME: {timeLabel} • {rawAmbient}°C {isWinter ? '❄️ Winter' : '☀️ Summer'}
              </span>

              {/* Quick Focus Button on Occupants */}
              <button
                onClick={() => setCameraAngle('OCCUPANTS_ZOOM')}
                className="flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md cursor-pointer hover:opacity-90 transition-all"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>🔍 Zoom to People</span>
              </button>

              <button
                onClick={() => setIsSectionCut(!isSectionCut)}
                className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                  isSectionCut ? 'bg-amber-500 text-slate-950 border-amber-600 font-black' : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <Scissors className="w-3 h-3" />
                <span>{isSectionCut ? '🔪 Cutaway ON' : 'Full Shell'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1 text-[10px] font-bold font-mono">
              {[
                { id: 'OCCUPANTS_ZOOM', label: '👥 Occupants' },
                { id: 'ISO', label: '🏢 ISO' },
                { id: 'FRONT', label: 'Front' },
                { id: 'WEST_RADIATION', label: 'West Heat' },
                { id: 'TOP', label: 'Top' }
              ].map((ang) => (
                <button
                  key={ang.id}
                  onClick={() => setCameraAngle(ang.id)}
                  className="px-2 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  {ang.label}
                </button>
              ))}
            </div>
          </div>

          {/* WebGL Canvas Mount Container */}
          <div className="relative">
            <div
              ref={mountRef}
              className={`w-full h-[500px] min-h-[500px] rounded-2xl relative cursor-grab active:cursor-grabbing border overflow-hidden ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}
            />

            {/* Google Maps Style On-Screen Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-20">
              <button
                onClick={() => zoomCamera(0.85)}
                className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-white border border-slate-700 shadow-md cursor-pointer transition-all"
                title="Zoom In"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => zoomCamera(1.15)}
                className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-white border border-slate-700 shadow-md cursor-pointer transition-all"
                title="Zoom Out"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCameraAngle('ISO')}
                className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-cyan-400 border border-slate-700 shadow-md cursor-pointer transition-all"
                title="Reset North / Center"
              >
                <Navigation className="w-4 h-4" />
              </button>
            </div>

            {/* ========================================================================= */}
            {/* 🗺️ INTERACTIVE OPENSTREETMAP GIS VIEWPORT WHEN SELECTED */}
            {/* ========================================================================= */}
            {viewportMode === 'GOOGLE_MAPS_THERMAL_GIS' ? (
              <div className="w-full h-[520px] min-h-[520px]">
                <OpenStreetMicroclimateMap
                  lat={cfdData?.metadata?.lat || 40.7061}
                  lng={cfdData?.metadata?.lng || -74.0092}
                  locationName={activeLocationQuery || cfdData?.metadata?.target_location || 'Manhattan Financial Canyon, New York, NY'}
                  selectedHour={selectedHour}
                  ambientTemp={rawAmbient}
                  neighbors={currentNeighbors}
                  onSelectNeighbor={(n) => setSelectedNeighbor(n)}
                  onLocationChange={(newLoc) => {
                    setActiveLocationQuery(newLoc.name);
                    fetchCfdPhysics(newLoc.name, isEmptyPlot);
                  }}
                  theme={theme}
                />
              </div>
            ) : null}

            {/* ========================================================================= */}
            {/* 🏢 3D FLOATING THERMAL HUD OVERLAY FOR ALL 4 SIDES & NEIGHBORS */}
            {/* ========================================================================= */}
            {viewportMode !== 'GOOGLE_MAPS_THERMAL_GIS' && showNeighborTemps && (
              <div className="absolute top-3 left-3 pointer-events-none space-y-1.5 z-20 font-mono text-[10px]">
                <div className="px-2 py-1 rounded-md bg-slate-950/90 border border-cyan-500/40 text-cyan-400 font-bold tracking-wider uppercase text-[9px]">
                  Live 150m Surrounding Thermal Impact (Hour {selectedHour}:00):
                </div>
                {currentNeighbors.map((n) => {
                  const dyn = calculateDynamicNeighborThermal(n, selectedHour, rawAmbient, cfdData);
                  return (
                    <div
                      key={n.id}
                      className="px-3 py-1.5 rounded-xl backdrop-blur-xl shadow-lg border flex items-center justify-between gap-3 transition-all duration-300 pointer-events-auto cursor-pointer hover:scale-105"
                      onClick={() => setSelectedNeighbor(n)}
                      style={{
                        backgroundColor: `${dyn.colorCss}25`,
                        borderColor: `${dyn.colorCss}90`,
                        color: dyn.colorCss === '#06b6d4' ? '#67e8f9' : dyn.colorCss === '#10b981' ? '#6ee7b7' : dyn.colorCss === '#eab308' ? '#fde047' : '#fca5a5'
                      }}
                    >
                      <span>🏢 <strong>{n.name?.split('(')[0] || n.name}:</strong></span>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-white text-xs">{dyn.tempC}°C</strong>
                        <span className="opacity-80 text-[9px]">[{n.orientation}]</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 4-Façade Dynamic Perimeter Thermal Status (West, South, East, North) */}
            {viewportMode !== 'GOOGLE_MAPS_THERMAL_GIS' && (
              <div className="absolute top-3 right-16 pointer-events-none hidden md:flex flex-col gap-1.5 z-20 font-mono text-[10px]">
                <div className="px-2 py-0.5 rounded-md bg-slate-950/90 border border-slate-700 text-slate-400 font-bold uppercase text-[9px]">
                  Target Building Façades Sol-Air:
                </div>
                {(() => {
                  const westSolAir = Math.round((rawAmbient + (selectedHour >= 12 && selectedHour <= 18 ? 5.8 : 0.8)) * 10) / 10;
                  const southSolAir = Math.round((rawAmbient + (selectedHour >= 10 && selectedHour <= 16 ? 4.2 : 0.6)) * 10) / 10;
                  const eastSolAir = Math.round((rawAmbient + (selectedHour >= 6 && selectedHour <= 12 ? 3.5 : 0.4)) * 10) / 10;
                  const northSolAir = Math.round((rawAmbient + (selectedHour >= 11 && selectedHour <= 15 ? 1.2 : 0.2)) * 10) / 10;

                  return (
                    <>
                      <div className="px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-500/60 text-rose-300 flex justify-between gap-2 shadow-md">
                        <span>☀️ West Façade:</span>
                        <strong>{westSolAir}°C (Damper 95%)</strong>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-orange-950/80 border border-orange-500/60 text-orange-300 flex justify-between gap-2 shadow-md">
                        <span>🔥 South Façade:</span>
                        <strong>{southSolAir}°C (Damper 78%)</strong>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500/60 text-amber-300 flex justify-between gap-2 shadow-md">
                        <span>⛅ East Façade:</span>
                        <strong>{eastSolAir}°C (Damper 35%)</strong>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 flex justify-between gap-2 shadow-md">
                        <span>❄️ North Façade:</span>
                        <strong>{northSolAir}°C (Damper 25%)</strong>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Bottom Status Ribbon & GIS Thermal Legend */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center gap-2 shadow-md">
                <span className="text-cyan-400 font-bold">
                  {viewportMode === 'GOOGLE_MAPS_THERMAL_GIS' ? '🗺️ OpenStreetMap Microclimate GIS Layer' : viewportMode === 'FLIR_INFRARED_CFD' ? '🔥 FLIR Infrared CFD Mode' : isEmptyPlot ? '🏗️ Greenfield Empty Plot Microclimate' : '🏢 3D Autodesk BIM'}
                </span>
                <span>•</span>
                <span className="text-rose-400">
                  {isEmptyPlot ? `Plot Soil: ${cfdData?.empty_plot_diagnostics?.max_soil_surface_temp_c || 42.4}°C` : `Target Center: ${indoorTemp}°C`}
                </span>
              </div>

              {/* GIS Thermal Gradient Scale */}
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[9px] font-mono text-slate-300 flex items-center gap-2 shadow-md">
                <span>24°C</span>
                <div className="w-24 h-2 rounded-full bg-gradient-to-r from-blue-500 via-amber-400 to-rose-600" />
                <span>58°C</span>
              </div>
            </div>
          </div>

          {/* Greenfield Empty Plot Microclimate Diagnostics Card */}
          {isEmptyPlot && (
            <div className="mt-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-mono space-y-2.5 animate-fade-in-up">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Hammer className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-sm text-white">Greenfield Plot: Surrounding Towers Heat Influx & Soil Soak</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                  Stefan-Boltzmann Ground Radiative Absorption
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Soil Surface Temp</span>
                  <strong className="text-rose-400 text-sm font-bold">
                    {cfdData?.empty_plot_diagnostics?.max_soil_surface_temp_c || 42.4}°C
                  </strong>
                  <span className="text-[9px] text-slate-500 block">Unshaded Soil</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Radiant Influx on Plot</span>
                  <strong className="text-amber-400 text-sm font-bold">
                    +{cfdData?.empty_plot_diagnostics?.peak_incoming_radiant_load_kw || 192.5} kW
                  </strong>
                  <span className="text-[9px] text-slate-500 block">From 4 Towers</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Urban Heat Island Δ</span>
                  <strong className="text-cyan-400 text-sm font-bold">
                    +{cfdData?.empty_plot_diagnostics?.surrounding_urban_heat_island_delta_c || 4.2}°C
                  </strong>
                  <span className="text-[9px] text-slate-500 block">Canyon Trapping</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Plot Heat Stress</span>
                  <strong className="text-rose-300 text-xs font-bold block mt-0.5">CRITICAL_UNSHADED</strong>
                  <span className="text-[9px] text-slate-500 block">Direct GHI + Radiation</span>
                </div>
              </div>
              <div className="pt-1 border-t border-amber-500/20">
                <span className="text-[10px] text-amber-300 font-bold block mb-1">Architectural Massing & Mitigation Recommendations for Future Building:</span>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-300">
                  {cfdData?.empty_plot_diagnostics?.architectural_massing_recommendations ? (
                    cfdData.empty_plot_diagnostics.architectural_massing_recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))
                  ) : (
                    <>
                      <li>Setback West façade by &gt;= 4.5m to mitigate secondary 54.2°C specular reflections from adjacent supertall.</li>
                      <li>Incorporate deep external vertical shading louvers along South elevation to reduce peak 1,040 W/m² solar gain.</li>
                      <li>Specify Double Silver Low-E glazing with SHGC &lt;= 0.22 on upper floors.</li>
                      <li>Deploy high-albedo permeable pavement (SRI &gt;= 0.70) to suppress localized ground-level UHI heat island trap.</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* 🏢 DEDICATED FLOOR LEVEL HVAC MANAGEMENT & INSPECTOR CONSOLE */}
          {selectedFloorIndex !== null && (() => {
            const activeFloor = floorProfiles[selectedFloorIndex];
            const tenant = activeFloor.tenantHvac;
            return (
              <div className="mt-3 p-4 rounded-2xl bg-slate-950 border border-cyan-500/50 shadow-2xl space-y-3 font-mono text-xs animate-fade-in-up">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <span>Floor {activeFloor.floorNumber} HVAC Management: {activeFloor.name}</span>
                      </h4>
                      <span className="text-[11px] text-cyan-300">{tenant.company} • {tenant.systemType}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCameraAngle('OCCUPANTS_ZOOM')}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold cursor-pointer hover:bg-cyan-500 hover:text-slate-950 transition-all"
                    >
                      🔍 Focus Floor
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFloorIndex(null)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-[11px] cursor-pointer"
                    >
                      ✕ Close
                    </button>
                  </div>
                </div>

                {/* Floor Controls Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  {/* Setpoint Slider */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Target Temp Setpoint:</span>
                      <strong className="text-cyan-400 font-bold">{activeFloor.targetTemp}°C</strong>
                    </div>
                    <input
                      type="range"
                      min="18.0"
                      max="26.0"
                      step="0.5"
                      value={typeof activeFloor.targetTemp === 'number' && !isNaN(activeFloor.targetTemp) ? activeFloor.targetTemp : 22.5}
                      onChange={(e) => setFloorSetpointOverrides(prev => ({ ...prev, [selectedFloorIndex]: parseFloat(e.target.value) }))}
                      className="w-full accent-cyan-400 bg-slate-800 cursor-pointer"
                    />
                    <span className="text-[9px] text-slate-500 block">ASHRAE 55 Setpoint Modulation</span>
                  </div>

                  {/* Damper & CFM Modulation */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">VAV Damper Flow:</span>
                      <strong className="text-emerald-400 font-bold">{(typeof activeFloor.damperPct === 'number' && !isNaN(activeFloor.damperPct) ? activeFloor.damperPct : 65)}% ({((typeof activeFloor.airflowCfm === 'number' && !isNaN(activeFloor.airflowCfm)) ? activeFloor.airflowCfm : 3200).toLocaleString()} CFM)</strong>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      step="5"
                      value={typeof activeFloor.damperPct === 'number' && !isNaN(activeFloor.damperPct) ? activeFloor.damperPct : 65}
                      onChange={(e) => setFloorDamperOverrides(prev => ({ ...prev, [selectedFloorIndex]: parseInt(e.target.value) }))}
                      className="w-full accent-emerald-400 bg-slate-800 cursor-pointer"
                    />
                    <span className="text-[9px] text-slate-500 block">Supply Air Modulation</span>
                  </div>

                  {/* Company System Switcher */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <span className="text-[11px] text-slate-400 block">Assigned HVAC System:</span>
                    <select
                      value={floorTenantState[selectedFloorIndex] || 'GOOGLE_UFAD'}
                      onChange={(e) => setFloorCompany(selectedFloorIndex, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white text-[11px] font-mono cursor-pointer"
                    >
                      {Object.values(COMPANY_HVAC_CATALOG).map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.shortCode} - {cat.company}
                        </option>
                      ))}
                    </select>
                    <span className="text-[9px] text-slate-500 block">{tenant.primaryBenefit}</span>
                  </div>
                </div>

                {/* Floor Real-time Telemetry Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Indoor Temp:</span>
                    <strong className="text-emerald-400 font-bold">{indoorTemp}°C</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Active Occupants:</span>
                    <strong className="text-cyan-400 font-bold">{tenant.occupant_count} People</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">CO2 IAQ Quality:</span>
                    <strong className="text-emerald-300 font-bold">465 ppm (Clean)</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Comfort Score:</span>
                    <strong className="text-cyan-300 font-bold">ASHRAE 55 OK (PMV: +0.06)</strong>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Bottom Physics Visualization Toggles */}
          <div className="mt-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPeople(!showPeople)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                  showPeople ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                Occupants ({showPeople ? 'ON' : 'OFF'})
              </button>

              <button
                onClick={() => setShowFurniture(!showFurniture)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                  showFurniture ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                Workstations ({showFurniture ? 'ON' : 'OFF'})
              </button>

              <button
                onClick={() => setShowAirflowParticles(!showAirflowParticles)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                  showAirflowParticles ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                Airflow ({showAirflowParticles ? 'ON' : 'OFF'})
              </button>

              <button
                onClick={() => setShowRadiationRays(!showRadiationRays)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                  showRadiationRays ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                Radiation Waves ({showRadiationRays ? 'ON' : 'OFF'})
              </button>

              <button
                onClick={() => setShowSpecularGlare(!showSpecularGlare)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                  showSpecularGlare ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                Specular Glare ({showSpecularGlare ? 'ON' : 'OFF'})
              </button>
            </div>

            <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
              <span>Explode:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={typeof explodeFactor === 'number' && !isNaN(explodeFactor) ? explodeFactor : 0}
                onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
                className="w-24 accent-cyan-400 bg-slate-800 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Meters & Live Neighbor Heat Inspector (4 cols) */}
        <div className="xl:col-span-4 space-y-4 flex flex-col justify-between">
          <div className={`grid grid-cols-3 gap-3 p-5 rounded-3xl border shadow-xl ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] font-bold text-rose-400 uppercase">Ambient Air</span>
              <div className="relative w-8 h-36 bg-slate-800 rounded-full my-2 p-1 flex flex-col justify-end overflow-hidden border border-slate-700 shadow-inner">
                <div className="w-full rounded-full bg-gradient-to-t from-orange-500 via-rose-500 to-red-600 transition-all duration-500 shadow-lg" style={{ height: `${outdoorPct}%` }} />
              </div>
              <strong className="text-sm font-mono text-rose-400">{outdoorTemp}°C</strong>
              <span className="text-[9px] text-slate-500 font-mono">FortyGuard</span>
            </div>

            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] font-bold uppercase text-cyan-400">Center Target</span>
              <div className="relative w-8 h-36 bg-slate-800 rounded-full my-2 p-1 flex flex-col justify-end overflow-hidden border border-slate-700 shadow-inner">
                <div className="w-full rounded-full bg-gradient-to-t from-blue-600 via-cyan-500 to-teal-400 transition-all duration-500 shadow-lg" style={{ height: `${indoorPct}%` }} />
              </div>
              <strong className="text-sm font-mono text-cyan-400">{indoorTemp}°C</strong>
              <span className="text-[9px] text-emerald-400 font-mono">ASHRAE 55 OK</span>
            </div>

            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] font-bold text-emerald-400 uppercase">AC Draw</span>
              <div className="relative w-8 h-36 bg-slate-800 rounded-full my-2 p-1 flex flex-col justify-end overflow-hidden border border-slate-700 shadow-inner">
                <div className="w-full rounded-full bg-gradient-to-t from-emerald-600 to-cyan-400 transition-all duration-500 shadow-lg" style={{ height: `${powerPct}%` }} />
              </div>
              <strong className="text-sm font-mono text-emerald-400">{powerKw} kW</strong>
              <span className="text-[9px] text-cyan-300 font-mono">-{rawSavingsKw} kW Saved</span>
            </div>
          </div>

          {/* Neighbor Building Live Thermal Inspector */}
          {(() => {
            const dynSelected = calculateDynamicNeighborThermal(selectedNeighbor, selectedHour, rawAmbient, cfdData);
            return (
              <div className={`p-5 rounded-3xl border shadow-2xl space-y-3 ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-rose-400" />
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      Neighbor Thermal Inspector ({selectedNeighbor.name})
                    </h4>
                  </div>
                  <span
                    className="px-2.5 py-0.5 rounded-md font-mono text-[11px] font-black border shadow-sm"
                    style={{
                      backgroundColor: `${dynSelected.colorCss}20`,
                      borderColor: `${dynSelected.colorCss}60`,
                      color: dynSelected.colorCss === '#06b6d4' ? '#67e8f9' : dynSelected.colorCss === '#10b981' ? '#6ee7b7' : dynSelected.colorCss === '#eab308' ? '#fde047' : '#fca5a5'
                    }}
                  >
                    {dynSelected.tempC}°C ({selectedNeighbor.orientation})
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-2 text-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Distance to Target:</span>
                    <strong className="text-white">{selectedNeighbor.distanceM} meters</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">View Factor F12:</span>
                    <strong className="text-cyan-400">{selectedNeighbor.viewFactor}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dynamic Surface Temp:</span>
                    <strong className="text-rose-400">{dynSelected.tempC}°C ({dynSelected.radiantLabel})</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Rooftop Exhaust Plume:</span>
                    <strong className="text-amber-400">{selectedNeighbor.plumeTempC}°C (Hot Plume)</strong>
                  </div>
                </div>

                {/* Selector buttons for the 4 surrounding structures */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {currentNeighbors.map((n) => {
                    const dynN = calculateDynamicNeighborThermal(n, selectedHour, rawAmbient, cfdData);
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => setSelectedNeighbor(n)}
                        className={`p-2 rounded-xl border text-[10px] font-bold font-mono transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                          selectedNeighbor.id === n.id ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-md' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <span className="font-bold">{n.orientation}</span>
                        <span className="text-[9px] opacity-85">{dynN.tempC}°C</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 4. DEDICATED AUTODESK CFD & MICROCLIMATE PHYSICS SUITE */}
      <div className={`rounded-3xl p-6 shadow-xl border space-y-5 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-slate-800">
          <div>
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Atom className="w-4 h-4 text-cyan-400" />
              <span>Autodesk CFD / Revit Microclimate Simulation Outputs</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              12-Hour dynamic envelope heat fluxes, perimeter zone VAV asymmetry, and thermal plume gate strategies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActivePhysicsTab('physics_summary')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activePhysicsTab === 'physics_summary' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              📊 12h Summary
            </button>
            <button
              onClick={() => setActivePhysicsTab('stefan_boltzmann')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activePhysicsTab === 'stefan_boltzmann' ? 'bg-rose-600 text-white font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              🔬 Stefan-Boltzmann
            </button>
            <button
              onClick={() => setActivePhysicsTab('specular_glare')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activePhysicsTab === 'specular_glare' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              ☀️ Specular Glare & Sol-Air
            </button>
            <button
              onClick={() => setActivePhysicsTab('plume_gate')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activePhysicsTab === 'plume_gate' ? 'bg-purple-600 text-white font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              💨 AHU Plume Shield
            </button>
            <button
              onClick={() => setActivePhysicsTab('companies')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activePhysicsTab === 'companies' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              🏢 Company Tenants
            </button>
          </div>
        </div>

        {activePhysicsTab === 'physics_summary' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Stefan-Boltzmann Longwave</span>
                <strong className="text-base font-mono text-rose-400 block">
                  {cfdData?.total_envelope_heat_gain_breakdown?.longwave_radiation_exchange_kwh || '1,802.8'} kWh
                </strong>
                <p className="text-[11px] text-slate-400">Radiant exchange from adjacent hot building facades.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Specular Glare Reflections</span>
                <strong className="text-base font-mono text-amber-400 block">
                  {cfdData?.total_envelope_heat_gain_breakdown?.specular_glare_reflections_kwh || '739.0'} kWh
                </strong>
                <p className="text-[11px] text-slate-400">Shortwave reflections bouncing from neighbor glass curtain walls.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Envelope Conduction</span>
                <strong className="text-base font-mono text-cyan-400 block">
                  {cfdData?.total_envelope_heat_gain_breakdown?.envelope_conduction_kwh || '242.3'} kWh
                </strong>
                <p className="text-[11px] text-slate-400">Conduction driven by dynamic perimeter Sol-Air temperatures.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Pre-Cooling Lead Time</span>
                <strong className="text-base font-mono text-emerald-400 block">
                  4.0 Hours Required
                </strong>
                <p className="text-[11px] text-slate-400">Charges 2,800 kWh concrete mass before peak radiant surge.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <h5 className="text-xs font-black text-white uppercase tracking-wider mb-3">
                Current Hour ({timeLabel}) Perimeter Zone Load & VAV CFM Allocation
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {cfdFacades.map((facade) => (
                  <div key={facade.orientation} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between items-center">
                      <strong className="text-cyan-300 font-bold">{facade.orientation} Facade</strong>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">F12: {facade.view_factor_F12}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Sol-Air Temp:</span>
                      <strong className="text-rose-400">{facade.sol_air_temp_c}°C</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Net Heat Flux:</span>
                      <strong className="text-amber-400">{facade.net_facade_heat_flux_wm2} W/m²</strong>
                    </div>
                    <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                      <span>VAV Airflow:</span>
                      <strong className="text-emerald-400">{facade.perimeter_vav_cfm.toLocaleString()} CFM ({facade.vav_damper_target_pct}%)</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activePhysicsTab === 'stefan_boltzmann' && (
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Radiation className="w-5 h-5 text-rose-500" />
              <h5 className="text-xs font-black text-white uppercase tracking-wider">
                Stefan-Boltzmann Longwave Thermal Radiation Flux: q_rad = ε * σ * F_12 * (T_neighbor⁴ - T_target⁴)
              </h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentNeighbors.map((n) => (
                <div key={n.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <strong className="text-white">{n.name}</strong>
                    <span className="text-rose-400 font-bold">{n.surfaceTempC}°C Surface</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    <div>Distance: <strong className="text-slate-200">{n.distanceM}m</strong></div>
                    <div>View Factor F12: <strong className="text-cyan-400">{n.viewFactor}</strong></div>
                    <div>Emissivity ε: <strong className="text-slate-200">{n.emissivity}</strong></div>
                    <div>Radiative Flux: <strong className="text-rose-400">+{Math.round(0.88 * 5.67e-8 * n.viewFactor * (Math.pow(n.surfaceTempC + 273.15, 4) - Math.pow(297.15, 4)))} W/m²</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activePhysicsTab === 'specular_glare' && (
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              <h5 className="text-xs font-black text-white uppercase tracking-wider">
                Specular Glare & Dynamic Sol-Air Temperature: T_sol-air = T_ambient + (α·I_total + q_rad_net)/h_o - (ε·ΔR/h_o)
              </h5>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <strong className="text-amber-400 block font-bold">West Facade Moving Glare Hotspot (14:00 - 17:00)</strong>
                <div className="text-slate-400 space-y-1 text-[11px]">
                  <div>Direct Solar: <strong>680.0 W/m²</strong></div>
                  <div>Secondary Reflected Glare: <strong className="text-amber-400">+188.5 W/m²</strong></div>
                  <div>Combined I_total: <strong className="text-rose-400">868.5 W/m²</strong></div>
                  <div>Calculated Sol-Air Temp: <strong className="text-rose-400">58.4°C</strong></div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <strong className="text-cyan-400 block font-bold">South Facade Reflection Profile (11:00 - 15:00)</strong>
                <div className="text-slate-400 space-y-1 text-[11px]">
                  <div>Direct Solar: <strong>620.0 W/m²</strong></div>
                  <div>Secondary Reflected Glare: <strong className="text-amber-400">+94.2 W/m²</strong></div>
                  <div>Combined I_total: <strong className="text-cyan-300">714.2 W/m²</strong></div>
                  <div>Calculated Sol-Air Temp: <strong className="text-cyan-300">51.2°C</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activePhysicsTab === 'plume_gate' && (
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-purple-500" />
              <h5 className="text-xs font-black text-white uppercase tracking-wider">
                Urban Canyon Stagnant Pockets & AHU Plume Ingestion Gate
              </h5>
            </div>
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 text-xs font-mono text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <strong className="text-purple-400 block">PLUME PROTECTION STATUS: ACTIVE</strong>
                <span className="text-[11px] text-slate-400">West AHU Louvers throttled to 15% minimum ventilation • Avoids +240 kW chiller spike</span>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-[11px]">
                SAVINGS: $148.00 / afternoon
              </span>
            </div>
          </div>
        )}

        {activePhysicsTab === 'companies' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {floorProfiles.map((fl, idx) => {
              const isSelected = selectedFloorIndex === idx;
              const tenant = fl.tenantHvac;

              return (
                <div
                  key={fl.floorNumber}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected ? 'border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-400 shadow-md' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-lg bg-slate-800 text-cyan-300">
                        Floor {fl.floorNumber} ({fl.elevationM}m)
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r ${tenant.badgeBg}`}>
                        {tenant.shortCode}
                      </span>
                    </div>

                    <div className="mb-2">
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Tenant HVAC</label>
                      <select
                        value={floorTenantState[idx] || 'GOOGLE_UFAD'}
                        onChange={(e) => setFloorCompany(idx, e.target.value)}
                        className="w-full p-1.5 rounded-xl border border-slate-700 bg-slate-900 text-xs font-bold text-white focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                      >
                        {Object.values(COMPANY_HVAC_CATALOG).map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.company}
                          </option>
                        ))}
                      </select>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug mb-3">
                      {tenant.systemName}
                    </p>

                    <div className="space-y-1 text-xs font-mono pt-2 border-t border-slate-800 text-slate-300">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Airflow:</span>
                        <strong className="text-cyan-400">{fl.airflowCfm.toLocaleString()} CFM ({fl.damperPct}%)</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Zone Temp:</span>
                        <strong className="text-emerald-400">{fl.targetTemp}°C</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedFloorIndex(isSelected ? null : idx)}
                    className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-bold flex items-center justify-between text-slate-400 hover:text-white cursor-pointer"
                  >
                    <span>{isSelected ? '✓ Floor Isolated in 3D' : 'Isolate in 3D'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
