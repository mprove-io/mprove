async function runRealtimeReportGetAccessToken() {
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

async function runRealtimeReport() {
  const axios = require('axios');

  try {
    const accessToken = await runRealtimeReportGetAccessToken();

    const propertyId = process.env.PROPERTY_ID;

    const response = await axios.post(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
      {
        dimensions: [
          {
            name: 'country'
          },
          {
            name: 'eventName'
          }
        ],
        metrics: [
          {
            name: 'eventCount'
          }
          // ,
          // {
          //   name: 'activeUsers'
          // }
        ]
      },
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

runRealtimeReport();
