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
    console.log('🔍 Debugging HubSpot data...');
    
    const debugData = {
      contacts: [],
      customObjects: [],
      schemas: [],
      errors: []
    };

    // Check contacts
    try {
      const contactsResponse = await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts?limit=10&properties=campaign,hs_analytics_source,hs_analytics_first_timestamp`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        debugData.contacts = contactsData.results || [];
        console.log('✅ Found contacts:', debugData.contacts.length);
      } else {
        debugData.errors.push(`Contacts API error: ${contactsResponse.status}`);
      }
    } catch (error) {
      debugData.errors.push(`Contacts error: ${error.message}`);
    }

    // Check schemas
    try {
      const schemasResponse = await fetch(
        'https://api.hubapi.com/crm/v3/schemas',
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (schemasResponse.ok) {
        const schemasData = await schemasResponse.json();
        debugData.schemas = schemasData.results || [];
        console.log('✅ Found schemas:', debugData.schemas.length);
      } else {
        debugData.errors.push(`Schemas API error: ${schemasResponse.status}`);
      }
    } catch (error) {
      debugData.errors.push(`Schemas error: ${error.message}`);
    }

    // Check for campaign-related custom objects
    const campaignSchemas = debugData.schemas.filter(schema => 
      schema.name.toLowerCase().includes('campaign') || 
      schema.labels?.singular?.toLowerCase().includes('campaign')
    );

    for (const schema of campaignSchemas.slice(0, 3)) { // Limit to first 3
      try {
        const objectsResponse = await fetch(
          `https://api.hubapi.com/crm/v3/objects/${schema.name}?limit=5`,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (objectsResponse.ok) {
          const objectsData = await objectsResponse.json();
          debugData.customObjects.push({
            schema: schema.name,
            objects: objectsData.results || []
          });
        }
      } catch (error) {
        debugData.errors.push(`Custom object ${schema.name} error: ${error.message}`);
      }
    }

    return res.status(200).json(debugData);
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    return res.status(500).json({ error: 'Debug failed', details: error.message });
  }
} 