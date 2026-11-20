import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes';
import { sakuraTheme } from './theme/antdTheme';

export const App: React.FC = () => {
  return (
    <ConfigProvider theme={sakuraTheme}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
