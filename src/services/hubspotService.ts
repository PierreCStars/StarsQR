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
      
      // Try to get contacts with campaign properties first
      try {
        const contactsResponse = await this.makeRequest('/crm/v3/objects/contacts?limit=100&properties=campaign,hs_analytics_source,hs_analytics_first_timestamp');
        console.log('🔗 Contacts with campaign properties response:', contactsResponse);
        
        if (contactsResponse.results && contactsResponse.results.length > 0) {
          // Extract unique campaign values from contacts
          const campaignValues = new Set<string>();
          contactsResponse.results.forEach((contact: any) => {
            if (contact.properties.campaign) {
              campaignValues.add(contact.properties.campaign);
            }
            // Also check analytics source as potential campaign
            if (contact.properties.hs_analytics_source) {
              campaignValues.add(contact.properties.hs_analytics_source);
            }
          });
          
          const campaigns = Array.from(campaignValues)
            .filter(name => name && name.trim() !== '')
            .map((campaignName, index) => ({
              id: `contact-campaign-${index}`,
              name: campaignName,
              type: 'contact_property',
              status: 'ACTIVE'
            }));
          
          if (campaigns.length > 0) {
            const sortedCampaigns = campaigns.sort((a, b) => a.name.localeCompare(b.name));
            console.log('✅ Found campaigns from contacts:', sortedCampaigns.map(c => c.name));
            return sortedCampaigns;
          }
        }
      } catch (contactsError) {
        console.log('⚠️ Contact campaign properties not available:', contactsError);
      }
      
      // If no campaigns found in contacts, try to get custom objects
      try {
        const customObjectsResponse = await this.makeRequest('/crm/v3/schemas');
        console.log('🔗 Custom objects schemas response:', customObjectsResponse);
        
        if (customObjectsResponse.results) {
          // Look for any custom objects that might contain campaign data
          const potentialSchemas = customObjectsResponse.results.filter((schema: any) => 
            schema.name.toLowerCase().includes('campaign') || 
            schema.name.toLowerCase().includes('event') ||
            schema.name.toLowerCase().includes('marketing') ||
            schema.labels?.singular?.toLowerCase().includes('campaign')
          );
          
          for (const schema of potentialSchemas) {
            try {
              const objectsResponse = await this.makeRequest(`/crm/v3/objects/${schema.name}?limit=100`);
              
              if (objectsResponse.results && objectsResponse.results.length > 0) {
                const campaigns = objectsResponse.results.map((obj: any) => ({
                  id: obj.id,
                  name: obj.properties.name || obj.properties.title || obj.properties.campaign_name || 'Unnamed Campaign',
                  type: 'custom_object',
                  status: obj.properties.status || 'ACTIVE'
                })).filter(campaign => campaign.name && campaign.name !== 'Unnamed Campaign');
                
                if (campaigns.length > 0) {
                  const sortedCampaigns = campaigns.sort((a, b) => a.name.localeCompare(b.name));
                  console.log('✅ Found campaigns from custom objects:', sortedCampaigns.map(c => c.name));
                  return sortedCampaigns;
                }
              }
            } catch (schemaError) {
              console.log(`⚠️ Could not fetch objects from schema ${schema.name}:`, schemaError);
            }
          }
        }
      } catch (customError) {
        console.log('⚠️ Custom objects not available:', customError);
      }
      
      console.log('❌ No campaigns found in HubSpot, using fallback campaigns');
      throw new Error('No campaigns found');
      
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