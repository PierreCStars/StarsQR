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

  try {
    console.log('✅ Returning campaigns from CSV file...');
    
    // Return the specific campaigns from the CSV file
    const campaigns = [
      { id: '404340267644', name: 'Stars Social', type: 'csv', status: 'ACTIVE' },
      { id: '378882390800', name: 'Stars HR', type: 'csv', status: 'ACTIVE' },
      { id: '373400606770', name: 'Robb Report', type: 'csv', status: 'ACTIVE' },
      { id: '371651042127', name: 'Stars Events', type: 'csv', status: 'ACTIVE' },
      { id: '369350707023', name: 'Midi Pneu', type: 'csv', status: 'ACTIVE' },
      { id: '335160641453', name: 'Yachting General', type: 'csv', status: 'ACTIVE' },
      { id: '314200582318', name: 'Stars Yachting - Ice', type: 'csv', status: 'ACTIVE' },
      { id: '299002954543', name: 'Dallara Test Drive - Prospects', type: 'csv', status: 'ACTIVE' },
      { id: '296546114360', name: 'Stars Yachting charter - Ultimate Lady', type: 'csv', status: 'ACTIVE' },
      { id: '293216223907', name: 'Stars Yachting sales - Azul V', type: 'csv', status: 'ACTIVE' },
      { id: '285130116703', name: 'Real Estate - L\'Exotique', type: 'csv', status: 'ACTIVE' },
      { id: '280885937958', name: 'Stars Yachting Sales - Pershing', type: 'csv', status: 'ACTIVE' },
      { id: '277965209263', name: 'StarsMC-Offers', type: 'csv', status: 'ACTIVE' },
      { id: '275200202831', name: 'Stars Yachting Anvera', type: 'csv', status: 'ACTIVE' },
      { id: '268997679722', name: 'Stars Yachting Charter', type: 'csv', status: 'ACTIVE' },
      { id: '266692714828', name: 'Dallara Stradale', type: 'csv', status: 'ACTIVE' },
      { id: '257783862562', name: 'Stars Yachting - Yacht Shows 2023', type: 'csv', status: 'ACTIVE' },
      { id: '255450586129', name: 'Stars Yachting - Belassi', type: 'csv', status: 'ACTIVE' },
      { id: '248004865100', name: 'Stars Aviation', type: 'csv', status: 'ACTIVE' },
      { id: '238796830052', name: 'Stars Remarketing Global', type: 'csv', status: 'ACTIVE' },
      { id: '238771941473', name: 'Stars MC remarketing', type: 'csv', status: 'ACTIVE' },
      { id: '235851813491', name: 'Group Newsletter', type: 'csv', status: 'ACTIVE' },
      { id: '228651702343', name: 'Real Estate Newsletters', type: 'csv', status: 'ACTIVE' },
      { id: '223709670982', name: 'Stars Yachting', type: 'csv', status: 'ACTIVE' },
      { id: '223494458686', name: 'Le Pneu-Generique', type: 'csv', status: 'ACTIVE' },
      { id: '218902911919', name: 'Top Marques', type: 'csv', status: 'ACTIVE' },
      { id: '215443307308', name: 'Réparation de jantes', type: 'csv', status: 'ACTIVE' },
      { id: '214458015882', name: 'Open Track 27 mars', type: 'csv', status: 'ACTIVE' },
      { id: '214015487814', name: 'XPEL Test Pierre', type: 'csv', status: 'ACTIVE' },
      { id: '207723247372', name: 'Rim Repair', type: 'csv', status: 'ACTIVE' },
      { id: '207360371070', name: 'Xpel window tint', type: 'csv', status: 'ACTIVE' },
      { id: '118797960508', name: 'LEADS INSTAGRAM', type: 'csv', status: 'ACTIVE' },
      { id: '69947134629', name: 'Events', type: 'csv', status: 'ACTIVE' },
      { id: '64154009244', name: 'Dark Ads', type: 'csv', status: 'ACTIVE' },
      { id: '63193297254', name: 'flyers', type: 'csv', status: 'ACTIVE' },
      { id: '61703490486', name: 'carte de visite', type: 'csv', status: 'ACTIVE' },
      { id: '57415898910', name: 'Totem', type: 'csv', status: 'ACTIVE' },
      { id: '52709433958', name: 'Véhicules Small', type: 'csv', status: 'ACTIVE' },
      { id: '52629328514', name: 'Vehicules Prestiges', type: 'csv', status: 'ACTIVE' },
      { id: '40408724340', name: 'Social Media', type: 'csv', status: 'ACTIVE' },
      { id: '39916558150', name: 'trackdays', type: 'csv', status: 'ACTIVE' },
      { id: '36523985814', name: 're-engage', type: 'csv', status: 'ACTIVE' },
      { id: '36244926072', name: 'Porsche et Ferrari Fevrier 2021', type: 'csv', status: 'ACTIVE' },
      { id: '36243325008', name: 'Concours Top Marques', type: 'csv', status: 'ACTIVE' }
    ];
    
    // Sort campaigns alphabetically
    const sortedCampaigns = campaigns.sort((a, b) => a.name.localeCompare(b.name));
    console.log('✅ Returning', sortedCampaigns.length, 'campaigns from CSV');
    
    return res.status(200).json(sortedCampaigns);
    
  } catch (error) {
    console.error('❌ Error returning campaigns:', error);
    return res.status(500).json({ error: 'Failed to return campaigns' });
  }
} 