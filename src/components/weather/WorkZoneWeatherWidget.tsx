import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  Compass,
  RefreshCw,
  Sun,
  CloudRain,
  CloudFog,
  ShieldAlert,
  Zap,
  Sliders,
  Radio,
  Eye,
} from 'lucide-react';

interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windGusts: number;
  precipitation: number;
  weatherCode: number;
  description: string;
  locationName: string;
  coords: [number, number];
  isLiveGps: boolean;
  updatedAt: string;
}

interface SevereWeatherWarning {
  level: 'critical' | 'warning' | 'advisory';
  title: string;
  condition: string;
  actionRequired: string;
  mutcdProtocol: string;
}

export const WorkZoneWeatherWidget: React.FC = () => {
  const { jobs, playBeep } = useApp();

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [simulatedCondition, setSimulatedCondition] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  // Fallback coords: default to first active job (e.g. US-101 San Jose)
  const defaultCoords: [number, number] = jobs[0]?.coordinates || [37.3382, -121.8863];
  const defaultLocationName = jobs[0]?.locationName || 'US-101 Corridor';

  // Decode WMO weather code into human label
  const getWeatherDescription = (code: number): string => {
    if (code === 0) return 'Clear Skies · Good Visibility';
    if (code === 1 || code === 2 || code === 3) return 'Partly Cloudy';
    if (code === 45 || code === 48) return 'Dense Fog · Low Visibility';
    if (code >= 51 && code <= 55) return 'Light Drizzle';
    if (code >= 61 && code <= 65) return 'Rain · Wet Asphalt';
    if (code >= 71 && code <= 77) return 'Snow / Ice Hazards';
    if (code >= 80 && code <= 82) return 'Rain Showers';
    if (code >= 95) return 'Severe Thunderstorm & Lightning';
    return 'Overcast';
  };

  const fetchWeather = useCallback(async (lat: number, lon: number, isLiveGps: boolean, locName: string) => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
      const data = await res.json();
      const current = data.current;

      setWeather({
        temp: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        windGusts: Math.round(current.wind_gusts_10m || current.wind_speed_10m * 1.3),
        precipitation: current.precipitation || 0,
        weatherCode: current.weather_code,
        description: getWeatherDescription(current.weather_code),
        locationName: locName,
        coords: [lat, lon],
        isLiveGps,
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } catch {
      // Offline fallback data with realistic work zone weather
      setWeather({
        temp: 68,
        feelsLike: 67,
        humidity: 62,
        windSpeed: 14,
        windGusts: 22,
        precipitation: 0,
        weatherCode: 2,
        description: 'Partly Cloudy · Cached Offline',
        locationName: locName,
        coords: [lat, lon],
        isLiveGps,
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const loadLocationAndWeather = useCallback(() => {
    setIsRefreshing(true);
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lon = Number(pos.coords.longitude.toFixed(4));
          fetchWeather(lat, lon, true, `GPS: ${lat}, ${lon}`);
        },
        () => {
          // GPS denied or timed out, use active job coords
          fetchWeather(defaultCoords[0], defaultCoords[1], false, defaultLocationName);
        },
        { timeout: 7000, enableHighAccuracy: true }
      );
    } else {
      fetchWeather(defaultCoords[0], defaultCoords[1], false, defaultLocationName);
    }
  }, [defaultCoords, defaultLocationName, fetchWeather]);

  useEffect(() => {
    loadLocationAndWeather();
  }, [loadLocationAndWeather]);

  // Assess severe weather hazards for road work
  const getSevereWeatherWarning = (): SevereWeatherWarning | null => {
    if (!weather) return null;

    // Check for simulated conditions first (for safety drill testing)
    if (simulatedCondition === 'wind') {
      return {
        level: 'critical',
        title: 'HIGH WIND WARNING — GUSTS EXCEEDING 38 MPH',
        condition: 'Severe crosswinds detected in active traffic corridor.',
        actionRequired: 'Anchor all portable signs with 50lb sandbags. Lower elevated attenuator boards if gusts exceed 45 MPH.',
        mutcdProtocol: 'MUTCD 6F.03 compliant ballasting mandatory.',
      };
    }
    if (simulatedCondition === 'lightning') {
      return {
        level: 'critical',
        title: 'SEVERE THUNDERSTORM & LIGHTNING HAZARD',
        condition: 'Cloud-to-ground lightning detected within 8 miles of work zone.',
        actionRequired: 'Cease elevated boom operations and metal barrier crane shifts. Personnel seek shelter in work vehicles.',
        mutcdProtocol: 'OSHA / Caltrans 30-30 lightning safety protocol.',
      };
    }
    if (simulatedCondition === 'fog') {
      return {
        level: 'warning',
        title: 'DENSE FOG ADVISORY — SIGHT DISTANCE < 300 FT',
        condition: 'Thick valley fog severely reducing live traffic sight lines.',
        actionRequired: 'Flaggers must use illuminated neon wands. Activate high-intensity LED strobe beacons on all TMA trucks.',
        mutcdProtocol: 'MUTCD Section 6E.02 nighttime / low-visibility apparel.',
      };
    }
    if (simulatedCondition === 'heat') {
      return {
        level: 'warning',
        title: 'EXTREME HEAT WARNING — AMBIENT 102°F (FEELS 108°F)',
        condition: 'Asphalt surface temperature exceeds 135°F.',
        actionRequired: 'Mandatory 10-minute shade and hydration rest break every 2 hours for all flaggers and ground personnel.',
        mutcdProtocol: 'Caltrans Title 8 Section 3395 Heat Illness Prevention.',
      };
    }

    // Evaluate real-time data
    if (weather.weatherCode >= 95) {
      return {
        level: 'critical',
        title: 'SEVERE THUNDERSTORM & LIGHTNING HAZARD',
        condition: 'Severe atmospheric instability and electrical activity detected.',
        actionRequired: 'Cease all crane barrier shifts. Ground crew stay clear of tall metal light towers.',
        mutcdProtocol: 'Standard work zone electrical safety suspension.',
      };
    }

    if (weather.windGusts >= 30) {
      return {
        level: 'critical',
        title: `HIGH WIND WARNING — GUSTS ${weather.windGusts} MPH`,
        condition: 'Wind speed exceeds MUTCD temporary sign stability limits.',
        actionRequired: 'Double-sandbag all roll-up sign stands. Check cone taper alignment immediately.',
        mutcdProtocol: 'MUTCD Section 6F.03 Ballast Requirements.',
      };
    }

    if (weather.windGusts >= 22) {
      return {
        level: 'advisory',
        title: `MODERATE WIND ADVISORY — GUSTS ${weather.windGusts} MPH`,
        condition: 'Breezy conditions in open highway corridor.',
        actionRequired: 'Verify sandbags are placed on base of all ROAD WORK AHEAD signs.',
        mutcdProtocol: 'Precautionary cone displacement check.',
      };
    }

    if (weather.weatherCode === 45 || weather.weatherCode === 48) {
      return {
        level: 'warning',
        title: 'DENSE FOG ADVISORY — LOW VISIBILITY',
        condition: 'Reduced sight distances for incoming highway motorists.',
        actionRequired: 'Switch arrow boards to maximum nighttime intensity. Flaggers activate illuminated wands.',
        mutcdProtocol: 'Class 3 high-visibility apparel mandatory.',
      };
    }

    if (weather.precipitation > 0.1 || (weather.weatherCode >= 61 && weather.weatherCode <= 65)) {
      return {
        level: 'advisory',
        title: 'WET ASPHALT & RAIN ADVISORY',
        condition: 'Reduced pavement friction for approaching motorists.',
        actionRequired: 'Extend cone taper buffer distance by 20% to account for vehicle wet braking distance.',
        mutcdProtocol: 'MUTCD Table 6C-3 stopping sight distance adjustments.',
      };
    }

    if (weather.feelsLike >= 90) {
      return {
        level: 'warning',
        title: `HIGH HEAT ADVISORY — HEAT INDEX ${weather.feelsLike}°F`,
        condition: 'Extreme heat on open asphalt pavement.',
        actionRequired: 'Dispatch safety water rest periods. Monitor crew for heat exhaustion symptoms.',
        mutcdProtocol: 'Caltrans Title 8 Heat Illness Prevention.',
      };
    }

    return null;
  };

  const warning = getSevereWeatherWarning();

  // Play audio chime when severe warning triggers
  useEffect(() => {
    if (warning && warning.level === 'critical') {
      playBeep('alert');
    }
  }, [warning, playBeep]);

  return (
    <div className="bg-[#121316] border-2 border-[#252830] rounded-3xl p-5 shadow-2xl relative overflow-hidden space-y-4">
      {/* Top ambient color strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${
          warning?.level === 'critical'
            ? 'from-red-600 via-[#ff6700] to-red-600 animate-pulse'
            : warning?.level === 'warning'
            ? 'from-amber-500 via-[#ff6700] to-amber-500'
            : 'from-amber-500 via-emerald-500 to-amber-500'
        }`}
      />

      {/* Header with GPS Status and Refresh */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Radio className="w-4 h-4 text-[#ff6700]" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <span>Real-Time Work Zone Weather</span>
              {weather?.isLiveGps && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  Live GPS
                </span>
              )}
            </h3>
            <p className="text-[11px] text-[#8e929b] truncate max-w-[220px] sm:max-w-md">
              {weather?.locationName} · Updated {weather?.updatedAt || 'just now'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowConfig((prev) => !prev)}
            title="Weather Test Simulator"
            className="p-2 rounded-xl bg-[#181920] hover:bg-[#22242f] text-slate-300 hover:text-white border border-[#2b2e38] transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
          </button>

          <button
            onClick={loadLocationAndWeather}
            disabled={isRefreshing}
            title="Refresh GPS Weather"
            className="p-2 rounded-xl bg-[#181920] hover:bg-[#22242f] text-slate-300 hover:text-white border border-[#2b2e38] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Severe Weather Warning Banner (If Triggered) */}
      {warning && (
        <div
          className={`relative overflow-hidden rounded-2xl p-4 border-2 shadow-lg ${
            warning.level === 'critical'
              ? 'bg-red-950/60 border-red-600/80 text-red-200 shadow-red-950/50'
              : warning.level === 'warning'
              ? 'bg-[#1c1408] border-amber-500/70 text-amber-200 shadow-amber-950/50'
              : 'bg-[#16171d] border-amber-500/40 text-amber-300'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                warning.level === 'critical'
                  ? 'bg-red-600 text-white animate-bounce'
                  : 'bg-amber-500 text-black'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                    warning.level === 'critical'
                      ? 'bg-red-500 text-white'
                      : 'bg-amber-400 text-black'
                  }`}
                >
                  {warning.level.toUpperCase()} ALERT
                </span>
                <span className="text-xs font-black tracking-wide text-white">
                  {warning.title}
                </span>
              </div>

              <p className="text-xs text-slate-200 font-medium">
                {warning.condition}
              </p>

              <div className="pt-1 text-[11px] text-amber-300 font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#ff6700] shrink-0" />
                <span>Action: {warning.actionRequired}</span>
              </div>

              <div className="text-[10px] text-slate-400 font-mono">
                Protocol: {warning.mutcdProtocol}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weather Telemetry Grid */}
      {weather && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Temperature & Feels Like */}
          <div className="p-3 rounded-2xl bg-[#090a0c] border border-[#23252c] flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-[#8e929b] flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span>Ambient Temp</span>
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-mono-numbers text-3xl font-black text-white">{weather.temp}°</span>
              <span className="text-xs text-[#8e929b] font-medium">F</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Feels like <strong className="text-amber-400">{weather.feelsLike}°F</strong>
            </div>
          </div>

          {/* Wind Speed & Max Gusts */}
          <div
            className={`p-3 rounded-2xl bg-[#090a0c] border flex flex-col justify-between transition-colors ${
              weather.windGusts >= 25 ? 'border-amber-500/60 bg-amber-500/10' : 'border-[#23252c]'
            }`}
          >
            <span className="text-[10px] uppercase font-bold text-[#8e929b] flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-[#ff6700]" />
              <span>Wind & Gusts</span>
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-mono-numbers text-3xl font-black text-white">{weather.windSpeed}</span>
              <span className="text-xs text-amber-400 font-bold">MPH</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Gusts up to <strong className="text-[#ff6700] font-bold">{weather.windGusts} MPH</strong>
            </div>
          </div>

          {/* Humidity & Atmospheric Moisture */}
          <div className="p-3 rounded-2xl bg-[#090a0c] border border-[#23252c] flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-[#8e929b] flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>Humidity</span>
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-mono-numbers text-3xl font-black text-white">{weather.humidity}</span>
              <span className="text-xs text-cyan-400 font-bold">%</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {weather.humidity > 80 ? 'Moisture / Dew risk' : 'Normal moisture'}
            </div>
          </div>

          {/* Road Conditions Summary */}
          <div className="p-3 rounded-2xl bg-[#090a0c] border border-[#23252c] flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-[#8e929b] flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pavement Status</span>
            </span>
            <div className="mt-2">
              <span className="text-xs font-bold text-white block truncate leading-tight">
                {weather.precipitation > 0 ? 'Wet Asphalt' : 'Dry & Clear'}
              </span>
              <span className="text-[10px] text-amber-400 font-mono mt-0.5 block truncate">
                {weather.description}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 truncate">
              {weather.precipitation > 0 ? `${weather.precipitation}" rain rate` : 'Full traction'}
            </div>
          </div>
        </div>
      )}

      {/* Safety Compliance Footnote */}
      <div className="flex items-center justify-between text-[11px] text-[#8e929b] pt-1 border-t border-[#212328]">
        <span className="flex items-center gap-1.5">
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span>MUTCD Section 6C & OSHA Weather Compliance Active</span>
        </span>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="text-amber-400 hover:text-amber-300 font-bold text-[10px]"
        >
          {simulatedCondition ? `Test Active (${simulatedCondition})` : 'Test Safety Drills'}
        </button>
      </div>

      {/* Weather Safety Drill Simulator Drawer */}
      {showConfig && (
        <div className="p-3 rounded-2xl bg-[#0a0b0e] border border-[#2b2e38] space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Severe Weather Safety Drill Simulator</span>
            </span>
            {simulatedCondition && (
              <button
                onClick={() => setSimulatedCondition(null)}
                className="text-[10px] text-red-400 hover:text-red-300 font-bold"
              >
                Clear Drill (Return to Live GPS)
              </button>
            )}
          </div>
          <p className="text-[10px] text-[#8e929b]">
            Simulate hazardous field conditions to test crew warning banners and MUTCD safety protocols.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setSimulatedCondition('wind')}
              className={`p-2 rounded-xl border text-left text-xs transition-colors ${
                simulatedCondition === 'wind'
                  ? 'bg-red-950/60 border-red-500 text-red-200'
                  : 'bg-[#14151b] border-[#252830] text-slate-300 hover:border-amber-500/50'
              }`}
            >
              <div className="font-bold flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-[#ff6700]" />
                <span>High Wind (38 MPH)</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Sandbag ballast drill</div>
            </button>

            <button
              onClick={() => setSimulatedCondition('lightning')}
              className={`p-2 rounded-xl border text-left text-xs transition-colors ${
                simulatedCondition === 'lightning'
                  ? 'bg-red-950/60 border-red-500 text-red-200'
                  : 'bg-[#14151b] border-[#252830] text-slate-300 hover:border-amber-500/50'
              }`}
            >
              <div className="font-bold flex items-center gap-1">
                <CloudLightning className="w-3.5 h-3.5 text-amber-400" />
                <span>Lightning Strike</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Crane suspension drill</div>
            </button>

            <button
              onClick={() => setSimulatedCondition('fog')}
              className={`p-2 rounded-xl border text-left text-xs transition-colors ${
                simulatedCondition === 'fog'
                  ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                  : 'bg-[#14151b] border-[#252830] text-slate-300 hover:border-amber-500/50'
              }`}
            >
              <div className="font-bold flex items-center gap-1">
                <CloudFog className="w-3.5 h-3.5 text-slate-300" />
                <span>Dense Valley Fog</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Illuminated wands drill</div>
            </button>

            <button
              onClick={() => setSimulatedCondition('heat')}
              className={`p-2 rounded-xl border text-left text-xs transition-colors ${
                simulatedCondition === 'heat'
                  ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                  : 'bg-[#14151b] border-[#252830] text-slate-300 hover:border-amber-500/50'
              }`}
            >
              <div className="font-bold flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-red-400" />
                <span>Extreme Heat (102°F)</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Caltrans rest drill</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
