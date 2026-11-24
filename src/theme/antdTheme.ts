import type { ThemeConfig } from 'antd';

export const sakuraTheme: ThemeConfig = {
  token: {
    colorPrimary: '#e11d48',
    colorInfo: '#e11d48',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorBgBase: '#ffffff',
    colorTextBase: '#0f172a',
    borderRadius: 12,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'Noto Sans JP', Arial, sans-serif",
  },
  components: {
    Button: {
      colorPrimary: '#e11d48',
      colorPrimaryHover: '#f43f5e',
      colorPrimaryActive: '#be123c',
      borderRadius: 10,
      controlHeight: 42,
      fontWeight: 600,
      boxShadow: '0 4px 12px rgba(225, 29, 72, 0.2)',
    },
    Input: {
      borderRadius: 10,
      controlHeight: 42,
      hoverBorderColor: '#fda4af',
      activeBorderColor: '#e11d48',
      activeShadow: '0 0 0 2px rgba(225, 29, 72, 0.15)',
    },
    Card: {
      borderRadiusLG: 18,
    },
    Tag: {
      borderRadiusSM: 6,
    },
    Tabs: {
      itemSelectedColor: '#e11d48',
      inkBarColor: '#e11d48',
    },
    Layout: {
      headerBg: '#ffffff',
      headerColor: '#0f172a',
      headerPadding: '0 24px',
      headerHeight: 64,
      siderBg: '#ffffff',
      bodyBg: '#f8fafc',
    },
  },
};
