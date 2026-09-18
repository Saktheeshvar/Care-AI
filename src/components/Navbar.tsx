import React, { useState } from 'react';
import { 
  HeartPulse, 
  Bell, 
  Languages, 
  User, 
  Menu, 
  X, 
  Settings, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCareAI } from '../contexts/CareAIContext';
import { Language } from '../types';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

interface NavLinkItem {
  label: string;
  path: string;
  badge?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, role, switchRole } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { unreadNotificationCount, notifications, markNotificationRead, activeSenior } = useCareAI();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const caregiverLinks: NavLinkItem[] = [
    { label: t('nav.dashboard'), path: '/caregiver' },
    { label: t('nav.medicines'), path: '/caregiver/medicines' },
    { label: t('nav.history'), path: '/caregiver/history' },
    { label: t('nav.notifications'), path: '/caregiver/notifications', badge: unreadNotificationCount },
    { label: t('nav.assistant'), path: '/caregiver/assistant' },
    { label: t('nav.allProfiles'), path: '/caregiver/users' }
  ];

  const elderlyLinks: NavLinkItem[] = [
    { label: t('elderly.todaysReminders'), path: '/elderly' },
    { label: t('elderly.talkToCareAI'), path: '/elderly/assistant' },
    { label: t('nav.history'), path: '/elderly/history' }
  ];

  const activeLinks: NavLinkItem[] = role === 'CAREGIVER' ? caregiverLinks : elderlyLinks;

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
    setLangMenuOpen(false);
  };

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setLangMenuOpen(false);
  };

  const languageLabels: Record<Language, { short: string; full: string }> = {
    en: { short: 'EN', full: 'English' },
    ta: { short: 'தமிழ்', full: 'தமிழ் (Tamil)' },
    hi: { short: 'हिन्दी', full: 'हिन्दी (Hindi)' }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              id="navbar-brand-logo"
              onClick={() => handleNav('/')}
              className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-sm">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-slate-900 font-display">CareAI</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                    {role === 'CAREGIVER' ? t('role.caregiver') : t('role.senior')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 hidden sm:block leading-none">
                  {t('app.tagline')}
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {activeLinks.map(link => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors relative ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  {link.label}
                  {Boolean(link.badge) && link.badge! > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2">
            {/* Hackathon Demo Center Button */}
            <button
              id="nav-demo-btn"
              onClick={() => handleNav('/demo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs ${
                currentPath === '/demo'
                  ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>{t('nav.demoCenter')}</span>
            </button>

            {/* Language Selector Dropdown (English, Tamil, Hindi) */}
            <div className="relative">
              <button
                id="nav-lang-dropdown-btn"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Select language / மொழி / भाषा"
                aria-label="Select language"
              >
                <Languages className="w-4 h-4 text-teal-600" />
                <span>{languageLabels[language].short}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div 
                  id="nav-lang-dropdown-menu"
                  className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    {t('lang.select')}
                  </div>
                  {(['en', 'ta', 'hi'] as Language[]).map((langKey) => (
                    <button
                      key={langKey}
                      id={`lang-option-${langKey}`}
                      onClick={() => handleLanguageSelect(langKey)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                        language === langKey 
                          ? 'bg-teal-50 text-teal-800 font-black' 
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{languageLabels[langKey].full}</span>
                      {language === langKey && (
                        <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Role Switcher Pill */}
            <button
              id="nav-role-switcher"
              onClick={() => switchRole(role === 'CAREGIVER' ? 'ELDERLY' : 'CAREGIVER')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors"
              title="Quick switch between Caregiver and Senior views"
            >
              <User className="w-3.5 h-3.5 text-slate-600" />
              <span>{role === 'CAREGIVER' ? t('role.viewAsSenior') : t('role.viewAsCaregiver')}</span>
            </button>

            {/* Notifications Bell (for caregiver) */}
            <div className="relative">
              <button
                id="nav-notification-bell"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 relative transition-colors"
                aria-label="Caregiver notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Quick Notifications Popover */}
              {notificationsOpen && (
                <div 
                  id="notifications-popover"
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-teal-600" />
                      <span className="text-sm font-bold text-slate-900">{t('nav.notifications')}</span>
                    </div>
                    <button
                      onClick={() => handleNav('/caregiver/notifications')}
                      className="text-xs text-teal-600 hover:underline font-semibold"
                    >
                      {t('caregiver.viewAllHistory')}
                    </button>
                  </div>

                  <div className="py-2 divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No notifications yet.</p>
                    ) : (
                      notifications.slice(0, 4).map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => {
                            markNotificationRead(n.id);
                            handleNav('/caregiver/notifications');
                          }}
                          className={`py-2.5 px-2 rounded-lg cursor-pointer transition-colors ${
                            !n.read ? 'bg-teal-50/60 font-medium' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 text-xs">
                            <span className={`font-bold ${n.type === 'ESCALATION_ALERT' ? 'text-rose-600' : 'text-slate-900'}`}>
                              {n.title}
                            </span>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings button */}
            <button
              id="nav-settings-btn"
              onClick={() => handleNav('/settings')}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              title="Settings"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              id="nav-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="nav-mobile-drawer" className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
            <span className="text-slate-500 font-semibold">Active Profile:</span>
            <span className="font-bold text-slate-900">{user?.name} ({role})</span>
          </div>

          <div className="grid grid-cols-1 gap-1">
            {activeLinks.map(link => (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between ${
                  currentPath === link.path ? 'bg-teal-100 text-teal-900' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{link.label}</span>
                {Boolean(link.badge) && link.badge! > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-mono">
                    {link.badge}
                  </span>
                )}
              </button>
            ))}

            <button
              onClick={() => {
                switchRole(role === 'CAREGIVER' ? 'ELDERLY' : 'CAREGIVER');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-800 flex items-center gap-2 mt-2"
            >
              <User className="w-4 h-4" />
              <span>{role === 'CAREGIVER' ? t('role.viewAsSenior') : t('role.viewAsCaregiver')}</span>
            </button>

            <button
              onClick={() => handleNav('/demo')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold bg-amber-100 text-amber-900 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{t('nav.demoCenter')}</span>
            </button>

            <div className="pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-500 mb-1 px-1">{t('lang.select')}:</div>
              <div className="grid grid-cols-3 gap-1">
                {(['en', 'ta', 'hi'] as Language[]).map(langKey => (
                  <button
                    key={langKey}
                    onClick={() => handleLanguageSelect(langKey)}
                    className={`py-1.5 text-xs font-bold rounded-lg border text-center ${
                      language === langKey 
                        ? 'bg-teal-600 text-white border-teal-600' 
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {languageLabels[langKey].short}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleNav('/settings')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              <span>{t('nav.settings')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
