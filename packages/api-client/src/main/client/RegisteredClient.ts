interface RegisteredClient {
  address: string; // IP address
  class: 'desktop' | 'phone' | 'tablet';
  cookie: string; // Cookie label
  id: string; // Client ID
  label?: string;
  location: {lat: number; lon: number};
  model?: string;
  time: string; // ISO 8601 Date string
  type: 'permanent' | 'temporary';
}

export default RegisteredClient;
