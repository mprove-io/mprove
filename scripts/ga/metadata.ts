async function metadataGetAccessToken() {
  const { JWT } = require('google-auth-library');
  const key = require('../../secrets/ga/g2.json');

  const authClient = new JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ['https://www.googleapis.com/auth/analytics.readonly']
  });

  const tokens = await authClient.authorize();
  return tokens.access_token;
}

async function metadata() {
  const axios = require('axios');

  try {
    const accessToken = await metadataGetAccessToken();

    const propertyId = process.env.PROPERTY_ID;
    const response = await axios.get(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}/metadata`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Analytics Data:', JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.error(
      'Error fetching analytics data:',
      error.response ? error.response.data : error.message
    );
    console.log('error?.response?.data?.error?.details');
    console.log(error?.response?.data?.error?.details);
  }
}

metadata();
