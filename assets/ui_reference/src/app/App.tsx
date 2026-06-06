import { useState } from 'react';
import { WeatherScreen, type Mode, type WeatherType } from './components/WeatherScreen';
import { SettingsDrawer } from './components/SettingsDrawer';
import { PhoneFrame } from './components/PhoneFrame';

interface NotificationSettings {
  eveningSummary: boolean;
  instantAlerts: boolean;
}

function WeatherApp() {
  const [mode, setMode] = useState<Mode>('city');
  const [weather, setWeather] = useState<WeatherType>('sunny');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [notifications, setNotifications] = useState<NotificationSettings>({
    eveningSummary: true,
    instantAlerts: false,
  });

  return (
    <div className="relative w-full h-full" style={{ fontFamily: "'Lexend', 'Inter', sans-serif" }}>
      <WeatherScreen
        mode={mode}
        weather={weather}
        location="Kadıköy, İstanbul"
        userName={userName}
        onSettingsOpen={() => setSettingsOpen(true)}
        onWeatherChange={setWeather}
        onModeChange={setMode}
      />
      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        mode={mode}
        onModeChange={setMode}
        userName={userName}
        onUserNameChange={setUserName}
        notifications={notifications}
        onNotificationsChange={setNotifications}
      />
    </div>
  );
}

export default function App() {
  return (
    <>
      {/* Desktop: show phone mockup */}
      <div className="hidden md:flex w-full h-full items-center justify-center" style={{ background: '#0A0A0A' }}>
        <PhoneFrame>
          <WeatherApp />
        </PhoneFrame>
      </div>

      {/* Mobile: full screen */}
      <div className="flex md:hidden w-full h-full">
        <WeatherApp />
      </div>
    </>
  );
}
