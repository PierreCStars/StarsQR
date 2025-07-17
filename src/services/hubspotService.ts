interface HubSpotCampaign {
  id: string;
  name: string;
  type: string;
  startDate?: string;
  endDate?: string;
  status: string;
}

// Removed unused interface

class HubSpotService {
  private async makeRequest(): Promise<any> {
    // Use our serverless function instead of direct API calls
    const response = await fetch('/api/hubspot-campaigns', {
      method: 'GET',
      headers: {
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
      console.log('🔗 Fetching HubSpot campaigns via serverless function...');
      
      const campaigns = await this.makeRequest();
      console.log('✅ Campaigns received from serverless function:', campaigns);
      
      return campaigns || [];
      
    } catch (error) {
      console.error('❌ Error fetching HubSpot campaigns:', error);
      return []; // Return empty array on error
    }
  }

  async getCampaignNames(): Promise<string[]> {
    const campaigns = await this.getCampaigns();
    return campaigns.map(campaign => campaign.name);
  }
}

export const hubspotService = new HubSpotService();
export type { HubSpotCampaign }; 