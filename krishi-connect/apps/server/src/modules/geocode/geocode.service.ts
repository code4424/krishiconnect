import axios from 'axios';

export class GeocodeService {
  static async search(query: string) {
    const res = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 5,
        countrycodes: 'in' // Focus on India
      },
      headers: {
        'User-Agent': 'KrishiConnectApp/1.0'
      }
    });
    return res.data;
  }

  static async reverse(lat: number, lng: number) {
    const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon: lng,
        format: 'json',
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'KrishiConnectApp/1.0'
      }
    });
    return res.data;
  }
}
