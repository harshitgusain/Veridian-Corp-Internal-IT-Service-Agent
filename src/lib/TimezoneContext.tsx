import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  TimezoneMode,
  TIMEZONE_OPTIONS,
  formatTimestamp,
  getUserLocalTimezoneSummary,
} from './timeUtils.ts';

interface TimezoneContextType {
  timezoneMode: TimezoneMode;
  setTimezoneMode: (mode: TimezoneMode) => void;
  formatTime: (dateStr?: string | null, style?: 'full' | 'time-only' | 'compact') => string;
  userTimezoneSummary: string;
  currentTimeString: string;
}

const TimezoneContext = createContext<TimezoneContextType>({
  timezoneMode: 'local',
  setTimezoneMode: () => {},
  formatTime: (dateStr) => dateStr || '',
  userTimezoneSummary: '',
  currentTimeString: '',
});

export const TimezoneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timezoneMode, setTimezoneModeState] = useState<TimezoneMode>(() => {
    try {
      const saved = localStorage.getItem('veridian_tz_mode');
      if (saved === 'local' || saved === 'IST' || saved === 'UTC' || saved === 'HQ') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'local';
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const setTimezoneMode = (mode: TimezoneMode) => {
    setTimezoneModeState(mode);
    try {
      localStorage.setItem('veridian_tz_mode', mode);
    } catch {
      // ignore
    }
  };

  const userTimezoneSummary = getUserLocalTimezoneSummary();

  const formatTime = (dateStr?: string | null, style: 'full' | 'time-only' | 'compact' = 'full') => {
    return formatTimestamp(dateStr, timezoneMode, style);
  };

  const currentTimeString = formatTimestamp(currentTime.toISOString(), timezoneMode, 'time-only');

  return (
    <TimezoneContext.Provider
      value={{
        timezoneMode,
        setTimezoneMode,
        formatTime,
        userTimezoneSummary,
        currentTimeString,
      }}
    >
      {children}
    </TimezoneContext.Provider>
  );
};

export const useTimezone = () => useContext(TimezoneContext);
