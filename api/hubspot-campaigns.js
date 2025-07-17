export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.VITE_HUBSPOT_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'HubSpot API key not configured' });
  }

  try {
    console.log('🔗 Fetching HubSpot campaigns...');
    
    // Try to get contacts with campaign properties first
    try {
      const contactsResponse = await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=campaign,hs_analytics_source,hs_analytics_first_timestamp`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        console.log('🔗 Contacts with campaign properties response:', contactsData);
        
        if (contactsData.results && contactsData.results.length > 0) {
          // Extract unique campaign values from contacts
          const campaignValues = new Set();
          contactsData.results.forEach((contact) => {
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
            return res.status(200).json(sortedCampaigns);
          }
        }
      }
    } catch (contactsError) {
      console.log('⚠️ Contact campaign properties not available:', contactsError);
    }
    
    // If no campaigns found in contacts, try to get custom objects
    try {
      const customObjectsResponse = await fetch(
        'https://api.hubapi.com/crm/v3/schemas',
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (customObjectsResponse.ok) {
        const schemasData = await customObjectsResponse.json();
        console.log('🔗 Custom objects schemas response:', schemasData);
        
        if (schemasData.results) {
          // Look for any custom objects that might contain campaign data
          const potentialSchemas = schemasData.results.filter((schema) => 
            schema.name.toLowerCase().includes('campaign') || 
            schema.name.toLowerCase().includes('event') ||
            schema.name.toLowerCase().includes('marketing') ||
            schema.labels?.singular?.toLowerCase().includes('campaign')
          );
          
          for (const schema of potentialSchemas) {
            try {
              const objectsResponse = await fetch(
                `https://api.hubapi.com/crm/v3/objects/${schema.name}?limit=100`,
                {
                  headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                  },
                }
              );
              
              if (objectsResponse.ok) {
                const objectsData = await objectsResponse.json();
                
                if (objectsData.results && objectsData.results.length > 0) {
                  const campaigns = objectsData.results.map((obj) => ({
                    id: obj.id,
                    name: obj.properties.name || obj.properties.title || obj.properties.campaign_name || 'Unnamed Campaign',
                    type: 'custom_object',
                    status: obj.properties.status || 'ACTIVE'
                  })).filter(campaign => campaign.name && campaign.name !== 'Unnamed Campaign');
                  
                  if (campaigns.length > 0) {
                    const sortedCampaigns = campaigns.sort((a, b) => a.name.localeCompare(b.name));
                    console.log('✅ Found campaigns from custom objects:', sortedCampaigns.map(c => c.name));
                    return res.status(200).json(sortedCampaigns);
                  }
                }
              }
            } catch (schemaError) {
              console.log(`⚠️ Could not fetch objects from schema ${schema.name}:`, schemaError);
            }
          }
        }
      }
    } catch (customError) {
      console.log('⚠️ Custom objects not available:', customError);
    }
    
    console.log('❌ No campaigns found in HubSpot');
    return res.status(200).json([]); // Return empty array
    
  } catch (error) {
    console.error('❌ Error fetching HubSpot campaigns:', error);
    return res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
} 