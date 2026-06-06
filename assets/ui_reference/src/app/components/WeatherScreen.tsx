import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings, MapPin, Sun, Cloud, CloudRain, Snowflake,
  Thermometer, Droplets, Wind, Eye, Layers, AlertTriangle,
  Building2, Wheat, Wifi, Signal,
} from 'lucide-react';

export type Mode = 'city' | 'farmer';
export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'snowy';

interface StatItem {
  label: string;
  value: string;
  iconKey: string;
}

interface WeatherConfig {
  gradient: string;
  headline: string;
  subtitle: string;
  textColor: string;
  subtitleColor: string;
  iconColor: string;
  glassColor: string;
  glassText: string;
  glassStroke: string;
  stats: StatItem[];
}

const configs: Record<Mode, Record<WeatherType, WeatherConfig>> = {
  city: {
    sunny: {
      gradient: 'linear-gradient(165deg, #5EC2F0 0%, #81D4FA 40%, #FFF59D 100%)',
      headline: 'Hava Şahane,\nKeyfini Çıkar!',
      subtitle: 'Gözlüğünü almayı unutma.',
      textColor: '#0A2540',
      subtitleColor: '#1565C0',
      iconColor: '#FF8F00',
      glassColor: 'rgba(255, 255, 255, 0.22)',
      glassText: '#0A2540',
      glassStroke: 'rgba(255, 255, 255, 0.5)',
      stats: [
        { label: 'Sıcaklık', value: '28°C', iconKey: 'thermometer' },
        { label: 'Nem', value: '%45', iconKey: 'droplets' },
        { label: 'Rüzgar', value: '12 km/s', iconKey: 'wind' },
        { label: 'UV', value: 'Yüksek', iconKey: 'sun' },
      ],
    },
    cloudy: {
      gradient: 'linear-gradient(165deg, #E8EDF0 0%, #CFD8DC 45%, #C5B8D9 100%)',
      headline: 'Gökyüzü Kapalı,\nYağış Beklenmiyor.',
      subtitle: 'İnce bir ceket iyi olabilir.',
      textColor: '#263238',
      subtitleColor: '#455A64',
      iconColor: '#546E7A',
      glassColor: 'rgba(255, 255, 255, 0.35)',
      glassText: '#263238',
      glassStroke: 'rgba(255, 255, 255, 0.6)',
      stats: [
        { label: 'Sıcaklık', value: '18°C', iconKey: 'thermometer' },
        { label: 'Nem', value: '%65', iconKey: 'droplets' },
        { label: 'Rüzgar', value: '8 km/s', iconKey: 'wind' },
        { label: 'Görüş', value: 'İyi', iconKey: 'eye' },
      ],
    },
    rainy: {
      gradient: 'linear-gradient(165deg, #2C3E50 0%, #3D5166 50%, #6B8FA8 100%)',
      headline: '40 Dakika Sonra\nYağmur Başlıyor.',
      subtitle: 'Şemsiyeni yanına al.',
      textColor: '#FFFFFF',
      subtitleColor: '#90CAF9',
      iconColor: '#82B4E0',
      glassColor: 'rgba(255, 255, 255, 0.1)',
      glassText: '#FFFFFF',
      glassStroke: 'rgba(255, 255, 255, 0.2)',
      stats: [
        { label: 'Sıcaklık', value: '14°C', iconKey: 'thermometer' },
        { label: 'Nem', value: '%85', iconKey: 'droplets' },
        { label: 'Rüzgar', value: '22 km/s', iconKey: 'wind' },
        { label: 'Yağış', value: '12mm', iconKey: 'cloud-rain' },
      ],
    },
    snowy: {
      gradient: 'linear-gradient(165deg, #DCEEFF 0%, #EEF4FF 50%, #FFFFFF 100%)',
      headline: 'Kar Yağışlı\nBir Gün.',
      subtitle: 'Yollar kaygan, dikkatli yürü.',
      textColor: '#1A237E',
      subtitleColor: '#3949AB',
      iconColor: '#5C8FE0',
      glassColor: 'rgba(255, 255, 255, 0.42)',
      glassText: '#1A237E',
      glassStroke: 'rgba(255, 255, 255, 0.7)',
      stats: [
        { label: 'Sıcaklık', value: '-2°C', iconKey: 'thermometer' },
        { label: 'Nem', value: '%78', iconKey: 'droplets' },
        { label: 'Rüzgar', value: '15 km/s', iconKey: 'wind' },
        { label: 'Kar', value: '5 cm', iconKey: 'snowflake' },
      ],
    },
  },
  farmer: {
    sunny: {
      gradient: 'linear-gradient(165deg, #F9A825 0%, #FFB300 40%, #66BB6A 100%)',
      headline: 'İlaçlama İçin\nİdeal Zaman.',
      subtitle: 'Rüzgar hızı 5 km/s, nem düşük.',
      textColor: '#1B3A1F',
      subtitleColor: '#2E7D32',
      iconColor: '#BF360C',
      glassColor: 'rgba(255, 255, 255, 0.2)',
      glassText: '#1B3A1F',
      glassStroke: 'rgba(255, 255, 255, 0.4)',
      stats: [
        { label: 'Sıcaklık', value: '26°C', iconKey: 'thermometer' },
        { label: 'Nem', value: '%38', iconKey: 'droplets' },
        { label: 'Rüzgar', value: '5 km/s', iconKey: 'wind' },
        { label: 'Toprak', value: 'Kuru', iconKey: 'layers' },
      ],
    },
    cloudy: {
      gradient: 'linear-gradient(165deg, #8D6E63 0%, #BCAAA4 50%, #EEEEEE 100%)',
      headline: 'Bulutlu.\nSulamayı Erteleyebilirsin.',
      subtitle: 'Toprak nemi yeterli seviyede.',
      textColor: '#3E2723',
      subtitleColor: '#5D4037',
      iconColor: '#6D4C41',
      glassColor: 'rgba(255, 255, 255, 0.32)',
      glassText: '#3E2723',
      glassStroke: 'rgba(255, 255, 255, 0.55)',
      stats: [
        { label: 'Sıcaklık', value: '17°C', iconKey: 'thermometer' },
        { label: 'Nem', value: '%72', iconKey: 'droplets' },
        { label: 'Rüzgar', value: '10 km/s', iconKey: 'wind' },
        { label: 'Toprak', value: '%68', iconKey: 'layers' },
      ],
    },
    rainy: {
      gradient: 'linear-gradient(165deg, #0D1F26 0%, #1C3138 50%, #2E7D32 100%)',
      headline: 'Şiddetli\nYağış Geliyor.',
      subtitle: 'Drenaj kanallarını kontrol et.',
      textColor: '#FFFFFF',
      subtitleColor: '#80CBC4',
      iconColor: '#4DB6AC',
      glassColor: 'rgba(255, 255, 255, 0.08)',
      glassText: '#FFFFFF',
      glassStroke: 'rgba(255, 255, 255, 0.16)',
      stats: [
        { label: 'Sıcaklık', value: '12°C', iconKey: 'thermometer' },
        { label: 'Nem', value: '%92', iconKey: 'droplets' },
        { label: 'Rüzgar', value: '28 km/s', iconKey: 'wind' },
        { label: 'Yağış', value: '45mm', iconKey: 'cloud-rain' },
      ],
    },
    snowy: {
      gradient: 'linear-gradient(165deg, #6ECFDA 0%, #B2EBF2 40%, #1A237E 100%)',
      headline: 'Dikkat!\nDon Riski Başlıyor.',
      subtitle: 'Seranı/Ürünlerini korumaya al.',
      textColor: '#E8EAF6',
      subtitleColor: '#C5CAE9',
      iconColor: '#7986CB',
      glassColor: 'rgba(255, 255, 255, 0.14)',
      glassText: '#E8EAF6',
      glassStroke: 'rgba(255, 255, 255, 0.25)',
      stats: [
        { label: 'Sıcaklık', value: '-4°C', iconKey: 'thermometer' },
        { label: 'Nem', value: '%60', iconKey: 'droplets' },
        { label: 'Rüzgar', value: '18 km/s', iconKey: 'wind' },
        { label: 'Don', value: 'Kritik', iconKey: 'alert-triangle' },
      ],
    },
  },
};

// ─── Utility Icons ───────────────────────────────────────────────────────────

function StatIcon({ iconKey, color, size = 15 }: { iconKey: string; color: string; size?: number }) {
  const p = { size, color, strokeWidth: 1.8 };
  switch (iconKey) {
    case 'thermometer': return <Thermometer {...p} />;
    case 'droplets': return <Droplets {...p} />;
    case 'wind': return <Wind {...p} />;
    case 'sun': return <Sun {...p} />;
    case 'eye': return <Eye {...p} />;
    case 'layers': return <Layers {...p} />;
    case 'cloud-rain': return <CloudRain {...p} />;
    case 'snowflake': return <Snowflake {...p} />;
    case 'alert-triangle': return <AlertTriangle {...p} />;
    default: return <Sun {...p} />;
  }
}

// ─── Status Bar ──────────────────────────────────────────────────────────────

function StatusBar({ textColor }: { textColor: string }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 10000);
    return () => clearInterval(id);
  }, []);

  const timeStr = time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const opacity = textColor === '#FFFFFF' ? 1 : 0.9;

  return (
    <div
      className="flex items-center justify-between px-7"
      style={{ height: 50, paddingTop: 8 }}
    >
      {/* Time */}
      <span
        style={{
          color: textColor,
          fontFamily: FONT,
          fontSize: '0.95rem',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          opacity,
        }}
      >
        {timeStr}
      </span>

      {/* Right icons */}
      <div className="flex items-center gap-1.5" style={{ opacity }}>
        <Signal size={14} color={textColor} strokeWidth={2} />
        <Wifi size={14} color={textColor} strokeWidth={2} />
        {/* Battery */}
        <div className="flex items-center gap-0.5">
          <div
            style={{
              width: 22,
              height: 11,
              borderRadius: 3,
              border: `1.5px solid ${textColor}`,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              padding: '1.5px',
            }}
          >
            <div
              style={{
                width: '75%',
                height: '100%',
                borderRadius: 1,
                background: textColor,
              }}
            />
            {/* Tip */}
            <div
              style={{
                position: 'absolute',
                right: -4,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 3,
                height: 5,
                borderRadius: '0 1px 1px 0',
                background: textColor,
                opacity: 0.5,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Animated Weather Icon ───────────────────────────────────────────────────

function WeatherIcon({ weather, color }: { weather: WeatherType; color: string }) {
  const p = { color, strokeWidth: 1.2 };

  if (weather === 'sunny') {
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
      >
        <Sun size={88} {...p} />
      </motion.div>
    );
  }
  if (weather === 'cloudy') {
    return (
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Cloud size={88} {...p} />
      </motion.div>
    );
  }
  if (weather === 'rainy') {
    return (
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <CloudRain size={88} {...p} />
      </motion.div>
    );
  }
  return (
    <motion.div
      animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Snowflake size={88} {...p} />
    </motion.div>
  );
}

// ─── Particle Systems ────────────────────────────────────────────────────────

function SunnyParticles() {
  const orbs = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 90 + 35,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.2 + 0.06,
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map(orb => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.size,
            height: orb.size,
            background: 'rgba(255, 215, 50, 0.38)',
            filter: 'blur(24px)',
          }}
          animate={{ y: [0, -22, 0], scale: [1, 1.12, 1], opacity: [orb.opacity, orb.opacity * 1.5, orb.opacity] }}
          transition={{ duration: orb.duration, delay: orb.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <div style={{
        position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)',
        width: '80vw', height: '80vw',
        background: 'radial-gradient(circle, rgba(255,230,80,0.22) 0%, transparent 65%)',
        filter: 'blur(8px)',
      }} />
    </div>
  );
}

function CloudyParticles() {
  const clouds = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 60,
      width: Math.random() * 130 + 70,
      height: Math.random() * 55 + 28,
      duration: Math.random() * 14 + 10,
      delay: Math.random() * 6,
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {clouds.map(c => (
        <motion.div
          key={c.id}
          className="absolute rounded-full"
          style={{ left: `${c.x}%`, top: `${c.y}%`, width: c.width, height: c.height, background: 'rgba(255,255,255,0.42)', filter: 'blur(18px)' }}
          animate={{ x: [-12, 12, -12] }}
          transition={{ duration: c.duration, delay: c.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function RainyParticles({ dark }: { dark: boolean }) {
  const drops = useMemo(() =>
    Array.from({ length: 42 }, (_, i) => ({
      id: i,
      x: Math.random() * 105,
      h: Math.random() * 55 + 35,
      dur: (Math.random() * 0.7 + 0.55).toFixed(2),
      del: (Math.random() * 2.5).toFixed(2),
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <style>{`
        @keyframes rDrop {
          0%   { transform: translateY(-120px) rotate(9deg); opacity: 0; }
          6%   { opacity: 0.65; }
          92%  { opacity: 0.45; }
          100% { transform: translateY(110vh) rotate(9deg); opacity: 0; }
        }
      `}</style>
      {drops.map(d => (
        <div key={d.id} style={{
          position: 'absolute', left: `${d.x}%`, top: 0,
          width: '1.5px', height: `${d.h}px`,
          background: dark ? 'rgba(160, 210, 255, 0.45)' : 'rgba(90, 140, 200, 0.35)',
          borderRadius: 999,
          animation: `rDrop ${d.dur}s linear ${d.del}s infinite`,
        }} />
      ))}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '25%',
        background: dark
          ? 'linear-gradient(to top, rgba(80,140,200,0.12), transparent)'
          : 'linear-gradient(to top, rgba(50,100,160,0.08), transparent)',
      }} />
    </div>
  );
}

function SnowyParticles() {
  const flakes = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 7 + 4,
      dur: (Math.random() * 4 + 4).toFixed(1),
      del: (Math.random() * 6).toFixed(1),
      sw: Math.floor(Math.random() * 30 + 8),
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <style>{`
        @keyframes sFall {
          0%   { transform: translateY(-30px) translateX(0px) rotate(0deg); opacity: 0; }
          6%   { opacity: 0.9; }
          50%  { transform: translateY(42vh) translateX(var(--sw)) rotate(180deg); }
          93%  { opacity: 0.55; }
          100% { transform: translateY(108vh) translateX(calc(var(--sw) * -0.4)) rotate(360deg); opacity: 0; }
        }
      `}</style>
      {flakes.map(f => (
        <div key={f.id} style={{
          position: 'absolute', left: `${f.x}%`, top: 0,
          width: f.size, height: f.size, borderRadius: '50%',
          background: 'rgba(255,255,255,0.88)',
          boxShadow: '0 0 3px rgba(160,200,255,0.4)',
          '--sw': `${f.sw}px`,
          animation: `sFall ${f.dur}s ease-in-out ${f.del}s infinite`,
        } as React.CSSProperties} />
      ))}
    </div>
  );
}

function ParticleLayer({ weather, dark }: { weather: WeatherType; dark: boolean }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div key={weather} className="absolute inset-0"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.7 }}
      >
        {weather === 'sunny' && <SunnyParticles />}
        {weather === 'cloudy' && <CloudyParticles />}
        {weather === 'rainy' && <RainyParticles dark={dark} />}
        {weather === 'snowy' && <SnowyParticles />}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FONT = "'Lexend', 'Inter', sans-serif";
const WEATHER_TYPES: WeatherType[] = ['sunny', 'cloudy', 'rainy', 'snowy'];
const WEATHER_EMOJI: Record<WeatherType, string> = { sunny: '☀️', cloudy: '☁️', rainy: '🌧️', snowy: '❄️' };
const WEATHER_LABELS: Record<WeatherType, string> = { sunny: 'Güneşli', cloudy: 'Bulutlu', rainy: 'Yağmurlu', snowy: 'Karlı' };

// ─── Main Component ───────────────────────────────────────────────────────────

interface WeatherScreenProps {
  mode: Mode;
  weather: WeatherType;
  location: string;
  userName: string;
  onSettingsOpen: () => void;
  onWeatherChange: (w: WeatherType) => void;
  onModeChange: (m: Mode) => void;
}

export function WeatherScreen({
  mode, weather, location, userName,
  onSettingsOpen, onWeatherChange, onModeChange,
}: WeatherScreenProps) {
  const cfg = configs[mode][weather];
  const isDark = cfg.textColor === '#FFFFFF' || cfg.textColor === '#E8EAF6';

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col" style={{ fontFamily: FONT }}>

      {/* Background gradient */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${mode}-${weather}`}
          className="absolute inset-0"
          style={{ background: cfg.gradient }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65 }}
        />
      </AnimatePresence>

      {/* Particles */}
      <ParticleLayer weather={weather} dark={isDark} />

      {/* ── Status Bar ── */}
      <div className="relative z-10">
        <StatusBar textColor={cfg.textColor} />
      </div>

      {/* ── Header ── */}
      <div className="relative z-10 flex items-center justify-between px-5 py-2">
        <div style={{ width: 40 }} />

        {/* Location chip */}
        <motion.div
          className="flex items-center gap-1.5 px-4 py-2 rounded-full cursor-pointer select-none"
          style={{
            background: cfg.glassColor,
            backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
            border: `1px solid ${cfg.glassStroke}`,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}
          whileTap={{ scale: 0.95 }}
        >
          <MapPin size={13} color={cfg.textColor} strokeWidth={2.2} />
          <span style={{ color: cfg.textColor, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            {location}
          </span>
        </motion.div>

        {/* Settings */}
        <motion.button
          onClick={onSettingsOpen}
          className="w-10 h-10 flex items-center justify-center rounded-2xl"
          style={{
            background: cfg.glassColor,
            backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
            border: `1px solid ${cfg.glassStroke}`,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}
          whileTap={{ scale: 0.88 }}
        >
          <Settings size={17} color={cfg.textColor} strokeWidth={2} />
        </motion.button>
      </div>

      {/* Mode badge */}
      <div className="relative z-10 flex justify-center pb-1">
        <div
          className="flex items-center gap-1 px-3 py-1 rounded-full"
          style={{
            background: 'rgba(0,0,0,0.1)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}
        >
          {mode === 'city'
            ? <Building2 size={10} color={cfg.subtitleColor} />
            : <Wheat size={10} color={cfg.subtitleColor} />
          }
          <span style={{ color: cfg.subtitleColor, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {mode === 'city' ? 'Şehir Modu' : 'Çiftçi Modu'}
            {userName ? ` · ${userName}` : ''}
          </span>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">

        {/* Icon card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`icon-${mode}-${weather}`}
            initial={{ opacity: 0, scale: 0.6, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: -20 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="w-[120px] h-[120px] rounded-[32px] flex items-center justify-center"
              style={{
                background: cfg.glassColor,
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${cfg.glassStroke}`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.35)`,
              }}
            >
              <WeatherIcon weather={weather} color={cfg.iconColor} />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Headline */}
        <AnimatePresence mode="wait">
          <motion.h1
            key={`h-${mode}-${weather}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            style={{
              color: cfg.textColor,
              fontFamily: FONT,
              fontSize: 'clamp(1.7rem, 7vw, 2.8rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.035em',
              textShadow: isDark ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
              whiteSpace: 'pre-line',
              marginTop: 20,
              marginBottom: 10,
            }}
          >
            {cfg.headline}
          </motion.h1>
        </AnimatePresence>

        {/* Subtitle */}
        <AnimatePresence mode="wait">
          <motion.p
            key={`s-${mode}-${weather}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.85, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            style={{
              color: cfg.subtitleColor,
              fontFamily: FONT,
              fontSize: 'clamp(0.85rem, 3.5vw, 1rem)',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              marginBottom: 28,
            }}
          >
            {cfg.subtitle}
          </motion.p>
        </AnimatePresence>

        {/* Stats */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`stats-${mode}-${weather}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="grid grid-cols-4 gap-2 w-full max-w-[320px]"
          >
            {cfg.stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1.5 py-3"
                style={{
                  background: cfg.glassColor,
                  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                  border: `1px solid ${cfg.glassStroke}`,
                  borderRadius: 18,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)',
                }}
              >
                <StatIcon iconKey={stat.iconKey} color={cfg.iconColor} size={15} />
                <span style={{ color: cfg.glassText, fontFamily: FONT, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1 }}>
                  {stat.value}
                </span>
                <span style={{ color: cfg.subtitleColor, fontFamily: FONT, fontSize: '0.55rem', fontWeight: 500, letterSpacing: '0.01em', opacity: 0.75, lineHeight: 1 }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom Controls ── */}
      <div className="relative z-10 px-4 pb-1">
        <div
          className="rounded-[28px] px-4 py-3"
          style={{
            background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid ${cfg.glassStroke}`,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}
        >
          {/* Mode toggle */}
          <div className="flex gap-2 mb-2.5">
            {(['city', 'farmer'] as Mode[]).map((m) => (
              <motion.button
                key={m}
                onClick={() => onModeChange(m)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl"
                style={{
                  background: mode === m
                    ? isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.1)'
                    : 'transparent',
                  border: mode === m ? `1px solid ${cfg.glassStroke}` : '1px solid transparent',
                  color: cfg.textColor,
                  fontFamily: FONT,
                  fontSize: '0.73rem',
                  fontWeight: mode === m ? 700 : 400,
                  letterSpacing: '-0.01em',
                  opacity: mode === m ? 1 : 0.48,
                  transition: 'all 0.2s',
                }}
                whileTap={{ scale: 0.95 }}
              >
                {m === 'city' ? <Building2 size={12} /> : <Wheat size={12} />}
                {m === 'city' ? 'Şehir Modu' : 'Çiftçi Modu'}
              </motion.button>
            ))}
          </div>

          {/* Weather selector */}
          <div className="flex gap-2">
            {WEATHER_TYPES.map((w) => (
              <motion.button
                key={w}
                onClick={() => onWeatherChange(w)}
                className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl"
                style={{
                  background: weather === w
                    ? isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.1)'
                    : 'transparent',
                  border: weather === w ? `1px solid ${cfg.glassStroke}` : '1px solid transparent',
                  opacity: weather === w ? 1 : 0.45,
                  transition: 'all 0.2s',
                }}
                whileTap={{ scale: 0.92 }}
              >
                <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{WEATHER_EMOJI[w]}</span>
                <span style={{
                  color: cfg.textColor, fontFamily: FONT,
                  fontSize: '0.55rem', fontWeight: weather === w ? 700 : 400,
                  lineHeight: 1, letterSpacing: '-0.005em',
                }}>
                  {WEATHER_LABELS[w]}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Home Indicator ── */}
      <div className="relative z-10 flex justify-center py-3">
        <div
          style={{
            width: 134,
            height: 5,
            borderRadius: 3,
            background: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.2)',
          }}
        />
      </div>
    </div>
  );
}
