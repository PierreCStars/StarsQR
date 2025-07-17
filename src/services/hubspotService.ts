interface HubSpotCampaign {
  id: string;
  name: string;
  type: string;
  startDate?: string;
  endDate?: string;
  status: string;
}

interface HubSpotCampaignsResponse {
  results: HubSpotCampaign[];
  paging?: {
    next?: {
      after: string;
      link: string;
    };
  };
}

class HubSpotService {
  private apiKey: string;
  private baseUrl = 'https://api.hubapi.com';

  constructor() {
    this.apiKey = import.meta.env.VITE_HUBSPOT_API_KEY || '';
  }

  private async makeRequest(endpoint: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('HubSpot API key not configured');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getCampaigns(): Promise<HubSpotCampaign[]> {
    try {
      console.log('🔗 Fetching HubSpot campaigns...');
      
      // Fetch campaigns from HubSpot
      const response: HubSpotCampaignsResponse = await this.makeRequest('/crm/v3/objects/campaigns?limit=100');
      
      console.log('🔗 HubSpot campaigns response:', response);
      
      if (!response.results) {
        console.log('❌ No campaigns found in HubSpot response');
        return [];
      }

      // Filter active campaigns and sort by name
      const activeCampaigns = response.results
        .filter(campaign => campaign.status === 'ACTIVE' || campaign.status === 'DRAFT')
        .sort((a, b) => a.name.localeCompare(b.name));

      console.log('✅ Found active campaigns:', activeCampaigns.map(c => c.name));
      
      return activeCampaigns;
    } catch (error) {
      console.error('❌ Error fetching HubSpot campaigns:', error);
      
      // Return fallback campaigns if API fails
      return [
        { id: 'fallback-1', name: 'Car Sales', type: 'campaign', status: 'ACTIVE' },
        { id: 'fallback-2', name: 'Yachting Charter', type: 'campaign', status: 'ACTIVE' },
        { id: 'fallback-3', name: 'Yachting Sales', type: 'campaign', status: 'ACTIVE' },
        { id: 'fallback-4', name: 'Real Estate', type: 'campaign', status: 'ACTIVE' },
        { id: 'fallback-5', name: 'Events', type: 'campaign', status: 'ACTIVE' },
      ];
    }
  }

  async getCampaignNames(): Promise<string[]> {
    const campaigns = await this.getCampaigns();
    return campaigns.map(campaign => campaign.name);
  }
}

export const hubspotService = new HubSpotService();
export type { HubSpotCampaign }; 