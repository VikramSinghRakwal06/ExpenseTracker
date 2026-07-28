import { ConfigProvider, theme as antdTheme } from 'antd';
import { useTheme } from '../context/ThemeContext';

/**
 * Ant Design v5 ships its own token-based theming, so switching Tailwind's
 * `dark` class alone leaves antd widgets (Table, Select, Modal, DatePicker)
 * on the light palette. This keeps antd in step with the app theme.
 */
const AntdThemeProvider = ({ children }) => {
  const { theme } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: { colorPrimary: '#3b82f6', borderRadius: 8 },
        components: {
          Table: { headerBg: theme === 'dark' ? '#1f2937' : '#f9fafb' },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};

export default AntdThemeProvider;
