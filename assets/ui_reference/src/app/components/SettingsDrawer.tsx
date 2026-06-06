import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Building2, Wheat, Home, MapPin, Tractor,
  Bell, BellRing, User, ChevronRight, Plus, Check,
} from 'lucide-react';
import type { Mode } from './WeatherScreen';

const FONT = "'Lexend', 'Inter', sans-serif";

interface SavedLocation {
  id: string;
  name: string;
  address: string;
  icon: 'home' | 'farm' | 'pin';
}

interface NotificationSettings {
  eveningSummary: boolean;
  instantAlerts: boolean;
}

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  mode: Mode;
  onModeChange: (m: Mode) => void;
  userName: string;
  onUserNameChange: (name: string) => void;
  notifications: NotificationSettings;
  onNotificationsChange: (n: NotificationSettings) => void;
}

const defaultLocations: SavedLocation[] = [
  { id: '1', name: 'Evim', address: 'Kadıköy, İstanbul', icon: 'home' },
  { id: '2', name: 'Tarlam', address: 'Polatlı, Ankara', icon: 'farm' },
  { id: '3', name: 'İşyerim', address: 'Maslak, İstanbul', icon: 'pin' },
];

function LocationIconEl({ icon }: { icon: SavedLocation['icon'] }) {
  if (icon === 'home') return <Home size={15} />;
  if (icon === 'farm') return <Tractor size={15} />;
  return <MapPin size={15} />;
}

export function SettingsDrawer({
  open, onClose, mode, onModeChange,
  userName, onUserNameChange,
  notifications, onNotificationsChange,
}: SettingsDrawerProps) {
  const [locations, setLocations] = useState<SavedLocation[]>(defaultLocations);
  const [newLocName, setNewLocName] = useState('');
  const [nameSaved, setNameSaved] = useState(false);

  const addLocation = () => {
    const trimmed = newLocName.trim();
    if (trimmed) {
      setLocations(prev => [...prev, { id: Date.now().toString(), name: trimmed, address: 'Konumunuz', icon: 'pin' }]);
      setNewLocName('');
    }
  };

  const handleNameSave = () => {
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 1800);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="absolute inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            className="absolute top-0 right-0 h-full z-50 overflow-y-auto"
            style={{
              width: '82%',
              background: 'rgba(248, 248, 252, 0.97)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderLeft: '0.5px solid rgba(0,0,0,0.08)',
              boxShadow: '-12px 0 50px rgba(0,0,0,0.22)',
              fontFamily: FONT,
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 36 }}
          >
            {/* Drag indicator */}
            <div className="flex justify-center pt-3 pb-1">
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.12)' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-8 pb-4" style={{ borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
              <div>
                <h2 style={{ fontFamily: FONT, fontSize: '1.25rem', fontWeight: 800, color: '#111', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                  Ayarlar
                </h2>
                <p style={{ fontFamily: FONT, fontSize: '0.75rem', color: '#8E8E93', fontWeight: 400, marginTop: 2 }}>
                  Deneyimini kişiselleştir
                </p>
              </div>
              <motion.button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.07)' }}
                whileTap={{ scale: 0.88 }}
              >
                <X size={15} color="#3C3C43" />
              </motion.button>
            </div>

            <div className="px-4 py-5 flex flex-col gap-5">

              {/* ── Mode Toggle ── */}
              <Section label="🎛️  Kullanıcı Modu">
                <div
                  className="flex gap-2 rounded-2xl p-1.5"
                  style={{ background: 'rgba(0,0,0,0.05)', border: '0.5px solid rgba(0,0,0,0.06)' }}
                >
                  <ModeBtn
                    active={mode === 'city'}
                    onClick={() => onModeChange('city')}
                    icon={<Building2 size={17} />}
                    label="Şehir Modu"
                    sub="Günlük yaşam"
                    gradient="linear-gradient(135deg, #667EEA 0%, #764BA2 100%)"
                  />
                  <ModeBtn
                    active={mode === 'farmer'}
                    onClick={() => onModeChange('farmer')}
                    icon={<Wheat size={17} />}
                    label="Çiftçi Modu"
                    sub="Tarla & Üretim"
                    gradient="linear-gradient(135deg, #F6A623 0%, #2ECC71 100%)"
                  />
                </div>
              </Section>

              {/* ── Name ── */}
              <Section label="👤  Sana nasıl hitap edelim?">
                <div className="flex gap-2 items-center">
                  <div
                    className="flex-1 flex items-center gap-2.5 px-3.5 py-3 rounded-xl"
                    style={{ background: '#F2F2F7', border: '0.5px solid rgba(0,0,0,0.06)' }}
                  >
                    <User size={15} color="#8E8E93" />
                    <input
                      type="text"
                      value={userName}
                      onChange={e => { onUserNameChange(e.target.value); setNameSaved(false); }}
                      placeholder="İsminizi girin..."
                      className="flex-1 outline-none bg-transparent"
                      style={{ fontFamily: FONT, fontSize: '0.86rem', fontWeight: 500, color: '#111', }}
                    />
                  </div>
                  <motion.button
                    onClick={handleNameSave}
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: nameSaved ? '#34C759' : (userName ? '#6366F1' : '#E5E5EA'),
                      transition: 'background 0.2s',
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {nameSaved
                      ? <Check size={16} color="#fff" strokeWidth={2.5} />
                      : <ChevronRight size={16} color={userName ? '#fff' : '#AEAEB2'} />
                    }
                  </motion.button>
                </div>
              </Section>

              {/* ── Notifications ── */}
              <Section label="🔔  Bildirim Tercihleri">
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.07)' }}
                >
                  <NotifRow
                    icon={<Bell size={15} color="#6366F1" />}
                    iconBg="rgba(99,102,241,0.1)"
                    label="Akşam Özeti"
                    sub="Her gün 18:00'de hava durumu"
                    value={notifications.eveningSummary}
                    onChange={v => onNotificationsChange({ ...notifications, eveningSummary: v })}
                    divider
                  />
                  <NotifRow
                    icon={<BellRing size={15} color="#F59E0B" />}
                    iconBg="rgba(245,158,11,0.1)"
                    label="Anlık Uyarılar"
                    sub="Ani hava değişimlerinde bildir"
                    value={notifications.instantAlerts}
                    onChange={v => onNotificationsChange({ ...notifications, instantAlerts: v })}
                  />
                </div>
              </Section>

              {/* ── Saved Locations ── */}
              <Section label="📍  Kayıtlı Konumlarım">
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.07)' }}
                >
                  {locations.map((loc, idx) => (
                    <div
                      key={loc.id}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{ borderBottom: idx < locations.length - 1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none' }}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: loc.icon === 'home' ? 'rgba(99,102,241,0.1)'
                            : loc.icon === 'farm' ? 'rgba(34,197,94,0.1)'
                              : 'rgba(245,158,11,0.1)',
                          color: loc.icon === 'home' ? '#6366F1'
                            : loc.icon === 'farm' ? '#16A34A'
                              : '#D97706',
                        }}
                      >
                        <LocationIconEl icon={loc.icon} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontFamily: FONT, fontSize: '0.84rem', fontWeight: 700, color: '#111', letterSpacing: '-0.01em' }}>
                          {loc.name}
                        </p>
                        <p style={{ fontFamily: FONT, fontSize: '0.7rem', color: '#8E8E93', fontWeight: 400 }} className="truncate">
                          {loc.address}
                        </p>
                      </div>
                      <ChevronRight size={14} color="#C7C7CC" />
                    </div>
                  ))}

                  {/* Add new */}
                  <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: '#FAFAFA', borderTop: '0.5px solid rgba(0,0,0,0.05)' }}>
                    <input
                      type="text"
                      value={newLocName}
                      onChange={e => setNewLocName(e.target.value)}
                      placeholder="Yeni konum ekle..."
                      className="flex-1 outline-none bg-transparent"
                      style={{ fontFamily: FONT, fontSize: '0.8rem', color: '#3C3C43', fontWeight: 500 }}
                      onKeyDown={e => e.key === 'Enter' && addLocation()}
                    />
                    <motion.button
                      onClick={addLocation}
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: newLocName.trim() ? '#6366F1' : '#E5E5EA',
                        transition: 'background 0.2s',
                      }}
                      whileTap={{ scale: 0.88 }}
                    >
                      <Plus size={14} color={newLocName.trim() ? '#fff' : '#AEAEB2'} />
                    </motion.button>
                  </div>
                </div>
              </Section>

              {/* Version */}
              <div className="flex items-center justify-center pt-1 pb-6">
                <p style={{ fontFamily: FONT, fontSize: '0.65rem', color: '#C7C7CC', letterSpacing: '0.02em' }}>
                  Yağmur Var mı? · v1.0.0
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <span style={{ fontFamily: FONT, fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em', textTransform: 'uppercase', paddingLeft: 4 }}>
        {label}
      </span>
      {children}
    </section>
  );
}

function ModeBtn({ active, onClick, icon, label, sub, gradient }: {
  active: boolean; onClick: () => void; icon: React.ReactNode;
  label: string; sub: string; gradient: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl"
      style={{
        background: active ? gradient : 'transparent',
        border: 'none', cursor: 'pointer',
        boxShadow: active ? '0 4px 14px rgba(0,0,0,0.16)' : 'none',
        transition: 'box-shadow 0.2s',
      }}
      whileTap={{ scale: 0.95 }}
    >
      <div style={{ color: active ? '#fff' : '#8E8E93' }}>{icon}</div>
      <span style={{ fontFamily: FONT, fontSize: '0.8rem', fontWeight: 700, color: active ? '#fff' : '#3C3C43', letterSpacing: '-0.01em' }}>
        {label}
      </span>
      <span style={{ fontFamily: FONT, fontSize: '0.62rem', fontWeight: 400, color: active ? 'rgba(255,255,255,0.72)' : '#AEAEB2' }}>
        {sub}
      </span>
    </motion.button>
  );
}

function NotifRow({ icon, iconBg, label, sub, value, onChange, divider }: {
  icon: React.ReactNode; iconBg: string; label: string; sub: string;
  value: boolean; onChange: (v: boolean) => void; divider?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5"
      style={{ borderBottom: divider ? '0.5px solid rgba(0,0,0,0.06)' : 'none' }}
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ fontFamily: FONT, fontSize: '0.84rem', fontWeight: 700, color: '#111', letterSpacing: '-0.01em' }}>{label}</p>
        <p style={{ fontFamily: FONT, fontSize: '0.68rem', color: '#8E8E93', fontWeight: 400 }}>{sub}</p>
      </div>
      <NativeToggle value={value} onChange={onChange} />
    </div>
  );
}

function NativeToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <motion.button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={{
        width: 51, height: 31, borderRadius: 999,
        background: value ? '#34C759' : '#E5E5EA',
        border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
        transition: 'background 0.22s ease',
        boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.06)',
      }}
    >
      <motion.div
        animate={{ x: value ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 600, damping: 35 }}
        style={{
          position: 'absolute', top: 2, width: 27, height: 27, borderRadius: '50%',
          background: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.1)',
        }}
      />
    </motion.button>
  );
}