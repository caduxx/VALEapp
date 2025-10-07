// Utility functions to collect device and location information

export interface DeviceInfo {
  ip_address?: string;
  user_agent: string;
  device_type: 'mobile' | 'desktop' | 'tablet';
  screen_resolution: string;
  timezone: string;
  geolocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

export const getDeviceType = (): 'mobile' | 'desktop' | 'tablet' => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/tablet|ipad|playbook|silk/.test(userAgent)) {
    return 'tablet';
  }
  
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent)) {
    return 'mobile';
  }
  
  return 'desktop';
};

export const getScreenResolution = (): string => {
  return `${screen.width}x${screen.height}`;
};

export const getTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const getPublicIP = async (): Promise<string | undefined> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json', {
      timeout: 5000
    });
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn('Não foi possível obter o IP público:', error);
    return undefined;
  }
};

export const getGeolocation = (): Promise<GeolocationPosition | undefined> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Geolocalização não suportada pelo navegador');
      resolve(undefined);
      return;
    }

    console.log('📍 Solicitando permissão de localização...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ Geolocalização obtida:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        resolve(position);
      },
      (error) => {
        console.warn('❌ Erro na geolocalização:', {
          code: error.code,
          message: error.message,
          PERMISSION_DENIED: error.code === 1,
          POSITION_UNAVAILABLE: error.code === 2,
          TIMEOUT: error.code === 3
        });
        resolve(undefined);
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 0 // Sempre pedir nova localização
      }
    );
  });
};

export const collectDeviceInfo = async (): Promise<DeviceInfo> => {
  console.log('📱 Coletando informações do dispositivo...');
  
  const deviceInfo: DeviceInfo = {
    user_agent: navigator.userAgent,
    device_type: getDeviceType(),
    screen_resolution: getScreenResolution(),
    timezone: getTimezone()
  };

  // Collect IP address
  try {
    deviceInfo.ip_address = await getPublicIP();
    console.log('🌐 IP coletado:', deviceInfo.ip_address);
  } catch (error) {
    console.warn('⚠️ Erro ao coletar IP:', error);
  }

  // Collect geolocation (optional)
  try {
    const position = await getGeolocation();
    if (position) {
      deviceInfo.geolocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };
      console.log('📍 Localização coletada:', deviceInfo.geolocation);
    }
  } catch (error) {
    console.warn('⚠️ Erro ao coletar localização:', error);
  }

  console.log('✅ Informações do dispositivo coletadas:', deviceInfo);
  return deviceInfo;
};