import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Sparkles, Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeOption = ({ active, label, icon: Icon, onClick }) => (
  <motion.button
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="theme-option"
    style={{
      border: active ? '1px solid var(--accent)' : '1px solid var(--card-border)',
      background: active ? 'linear-gradient(135deg, var(--accent-soft), transparent)' : 'var(--card-bg)',
      boxShadow: active ? '0 10px 30px rgba(56, 189, 248, 0.18)' : 'none',
    }}
  >
    <div className="theme-option-icon">
      <Icon size={18} />
    </div>
    <div>
      <div className="theme-option-title">{label}</div>
      <div className="theme-option-subtitle">{active ? 'Active' : 'Click to apply'}</div>
    </div>
  </motion.button>
);

const Settings = () => {
  const { theme, setTheme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '40px', maxWidth: '980px' }}
    >
      <div className="page-header-block">
        <h1>Settings</h1>
        <p>Customize appearance for a better clinical dashboard experience.</p>
      </div>

      <div className="glass-card settings-card">
        <div className="settings-card-header">
          <div className="settings-card-title-wrap">
            <Palette size={20} />
            <h3>Theme</h3>
          </div>
          <span className="settings-pill">Saved to localStorage</span>
        </div>

        <div className="settings-grid">
          <ThemeOption
            label="Light Theme"
            icon={Sun}
            active={theme === 'light'}
            onClick={() => setTheme('light')}
          />
          <ThemeOption
            label="Dark Theme"
            icon={Moon}
            active={theme === 'dark'}
            onClick={() => setTheme('dark')}
          />
        </div>
      </div>

      <div className="glass-card settings-note">
        <Sparkles size={18} />
        <span>
          Dark mode uses deep navy/charcoal surfaces with neon risk accents and glassmorphism cards.
        </span>
      </div>
    </motion.div>
  );
};

export default Settings;
