import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.missgiver.pi0logik',
  appName: 'PI Studio 0-Logik',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
