// Sistema robusto de geolocalização com GPS prioritário e fallback IP
// Implementa as especificações exatas fornecidas

export interface GeolocationData {
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
  accuracy_meters: number | null;
  source_method: 'GPS' | 'IP' | 'FAILED';
  ip_address: string | null;
  city: string | null;
  state_province: string | null;
  country: string | null;
}

// Função para obter IP público
const getPublicIP = async (): Promise<string | null> => {
  try {
    console.log('🌐 Obtendo IP público...');
    const response = await fetch('https://api.ipify.org?format=json', {
      timeout: 5000
    });
    const data = await response.json();
    console.log('✅ IP obtido:', data.ip);
    return data.ip;
  } catch (error) {
    console.warn('❌ Erro ao obter IP:', error);
    return null;
  }
};

// Função para geolocalização por IP
const getLocationByIP = async (ip: string): Promise<Partial<GeolocationData>> => {
  try {
    console.log('🌍 Obtendo localização por IP:', ip);
    
    // Usando ipapi.co (gratuito, sem API key necessária)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      timeout: 10000
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Dados de localização por IP:', data);
    
    return {
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      accuracy_meters: 99999, // Baixa precisão para IP
      source_method: 'IP',
      city: data.city || null,
      state_province: data.region || null,
      country: data.country_name || null
    };
  } catch (error) {
    console.error('❌ Erro na geolocalização por IP:', error);
    return {
      latitude: null,
      longitude: null,
      accuracy_meters: null,
      source_method: 'FAILED',
      city: null,
      state_province: null,
      country: null
    };
  }
};

// Função para reverse geocoding (GPS -> endereço)
const reverseGeocode = async (lat: number, lng: number): Promise<{city: string | null, state_province: string | null, country: string | null}> => {
  try {
    console.log('🗺️ Fazendo reverse geocoding para:', { lat, lng });
    
    // Usando Nominatim (OpenStreetMap) - gratuito
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        timeout: 8000,
        headers: {
          'User-Agent': 'VALEAPP-Geolocation/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Reverse geocoding resultado:', data);
    
    const address = data.address || {};
    
    return {
      city: address.city || address.town || address.village || null,
      state_province: address.state || address.region || null,
      country: address.country || null
    };
  } catch (error) {
    console.warn('⚠️ Erro no reverse geocoding:', error);
    return {
      city: null,
      state_province: null,
      country: null
    };
  }
};

// Função para obter GPS com alta precisão
const getGPSLocation = (): Promise<GeolocationData> => {
  return new Promise((resolve) => {
    console.log('📍 Tentando obter localização GPS...');
    
    if (!navigator.geolocation) {
      console.warn('❌ Geolocalização não suportada');
      resolve({
        timestamp: new Date().toISOString(),
        latitude: null,
        longitude: null,
        accuracy_meters: null,
        source_method: 'FAILED',
        ip_address: null,
        city: null,
        state_province: null,
        country: null
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log('✅ GPS obtido:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });

        // Fazer reverse geocoding para obter endereço
        const addressInfo = await reverseGeocode(
          position.coords.latitude,
          position.coords.longitude
        );

        // Obter IP também
        const ip = await getPublicIP();

        resolve({
          timestamp: new Date().toISOString(),
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy_meters: position.coords.accuracy,
          source_method: 'GPS',
          ip_address: ip,
          ...addressInfo
        });
      },
      async (error) => {
        console.warn('❌ Erro GPS:', {
          code: error.code,
          message: error.message,
          PERMISSION_DENIED: error.code === 1,
          POSITION_UNAVAILABLE: error.code === 2,
          TIMEOUT: error.code === 3
        });

        // Fallback para IP
        console.log('🔄 Tentando fallback por IP...');
        const ip = await getPublicIP();
        
        if (ip) {
          const ipLocation = await getLocationByIP(ip);
          resolve({
            timestamp: new Date().toISOString(),
            ip_address: ip,
            ...ipLocation
          } as GeolocationData);
        } else {
          resolve({
            timestamp: new Date().toISOString(),
            latitude: null,
            longitude: null,
            accuracy_meters: null,
            source_method: 'FAILED',
            ip_address: null,
            city: null,
            state_province: null,
            country: null
          });
        }
      },
      {
        enableHighAccuracy: true, // Máxima precisão
        timeout: 10000, // 10 segundos
        maximumAge: 0 // Sempre nova localização
      }
    );
  });
};

// Função principal - implementa toda a lógica especificada
export const collectRobustGeolocation = async (): Promise<GeolocationData> => {
  console.log('🎯 INICIANDO COLETA ROBUSTA DE GEOLOCALIZAÇÃO');
  console.log('📋 Prioridade: GPS -> IP -> FAILED');
  
  try {
    // ETAPA 1: Tentar GPS com alta precisão
    const gpsResult = await getGPSLocation();
    
    if (gpsResult.source_method === 'GPS') {
      console.log('✅ SUCESSO: Localização GPS obtida');
      return gpsResult;
    }
    
    // ETAPA 2: Se GPS falhou, já tentou IP no fallback
    if (gpsResult.source_method === 'IP') {
      console.log('✅ SUCESSO: Localização IP obtida (fallback)');
      return gpsResult;
    }
    
    // ETAPA 3: Tudo falhou
    console.log('❌ FALHA: Não foi possível obter localização');
    return gpsResult; // Já retorna FAILED
    
  } catch (error) {
    console.error('❌ ERRO CRÍTICO na coleta de geolocalização:', error);
    
    return {
      timestamp: new Date().toISOString(),
      latitude: null,
      longitude: null,
      accuracy_meters: null,
      source_method: 'FAILED',
      ip_address: null,
      city: null,
      state_province: null,
      country: null
    };
  }
};

// Função para formatar para string (compatibilidade com código atual)
export const formatGeolocationForDB = (geoData: GeolocationData): string => {
  if (geoData.source_method === 'FAILED') {
    return 'Localização não disponível';
  }
  
  const parts = [];
  
  if (geoData.latitude && geoData.longitude) {
    parts.push(`${geoData.latitude.toFixed(6)},${geoData.longitude.toFixed(6)}`);
  }
  
  if (geoData.city) parts.push(geoData.city);
  if (geoData.state_province) parts.push(geoData.state_province);
  if (geoData.country) parts.push(geoData.country);
  
  const location = parts.join(', ');
  const method = geoData.source_method === 'GPS' ? 'GPS' : 'IP';
  const accuracy = geoData.accuracy_meters ? `±${geoData.accuracy_meters}m` : 'Baixa precisão';
  
  return `${location} (${method}, ${accuracy})`;
};