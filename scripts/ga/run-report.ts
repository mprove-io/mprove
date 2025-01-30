/* eslint-disable @typescript-eslint/naming-convention */
async function runReportGetAccessToken() {
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

async function runReport() {
  const axios = require('axios');

  try {
    const accessToken = await runReportGetAccessToken();

    const propertyId = process.env.PROPERTY_ID;
    const response = await axios.post(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        dateRanges: [
          {
            startDate: '7daysAgo',
            endDate: 'today'
          }
        ],
        dimensions: [
          {
            name: 'year' // "2025"
          },
          {
            name: 'yearMonth' // "202501"
          },
          {
            name: 'isoYearIsoWeek' // "202504"
          },
          {
            name: 'yearWeek' // "202505"
          },
          {
            name: 'date' // "20250127"
          },
          {
            name: 'dateHour' // "2025012722"
          },
          {
            name: 'dateHourMinute' // "202501272212"
          },
          // {
          //   name: 'hour' // "4"
          // },
          // {
          //   name: 'minute' // "40"
          // },
          // {
          //   name: 'day' // "26"
          // },
          // {
          //   name: 'dayOfWeek' // "0"
          // },
          // {
          //   name: 'dayOfWeekName' // "Sunday"
          // },
          // {
          //   name: 'week' // "05"
          // },
          // {
          //   name: 'month' // "01"
          // },
          // {
          //   name: 'isoYear' // "2025"
          // },
          // {
          //   name: 'isoWeek' // "04"
          // },
          // {
          //   name: 'nthYear' // "0000"
          // },
          // {
          //   name: 'nthMonth' // "0000"
          // },
          // {
          //   name: 'nthWeek' // "0001"
          // },
          // {
          //   name: 'nthDay' // "0004"
          // },
          // {
          //   name: 'nthHour' // "0142"
          // },
          // {
          //   name: 'nthMinute' // "8532"
          // },
          {
            name: 'country'
          },
          {
            name: 'city'
          }
        ],
        metrics: [
          {
            name: 'activeUsers'
          },
          {
            name: 'sessions'
          },
          {
            name: 'screenPageViews'
          }
          // ,
          // {
          //   name: 'screenPageViews'
          // }
        ]
        // ,
        // dimensionFilter: {
        //   // filter: {
        //   //   fieldName: 'medium',
        //   //   stringFilter: {
        //   //     value: 'spring_sale'
        //   //   }
        //   // }
        //   orGroup: {
        //     expressions: [
        //       {
        //         andGroup: {
        //           expressions: [
        //             // Filter 1
        //             {
        //               filter: {
        //                 fieldName: 'country',
        //                 inListFilter: {
        //                   values: ['United States', 'Canada']
        //                 }
        //               }
        //             },
        //             // Filter 2
        //             {
        //               orGroup: {
        //                 expressions: [
        //                   {
        //                     filter: {
        //                       fieldName: 'source',
        //                       stringFilter: {
        //                         value: 'google'
        //                       }
        //                     }
        //                   },
        //                   {
        //                     filter: {
        //                       fieldName: 'medium',
        //                       stringFilter: {
        //                         value: 'cpc'
        //                       }
        //                     }
        //                   }
        //                 ]
        //               }
        //             },
        //             // Filter 3
        //             {
        //               notExpression: {
        //                 filter: {
        //                   fieldName: 'campaignId',
        //                   stringFilter: {
        //                     value: 'spring_sale'
        //                   }
        //                 }
        //               }
        //             },
        //             // Filter 4
        //             {
        //               notExpression: {
        //                 andGroup: {
        //                   expressions: [
        //                     {
        //                       filter: {
        //                         fieldName: 'source',
        //                         stringFilter: {
        //                           value: 'google'
        //                         }
        //                       }
        //                     },
        //                     {
        //                       filter: {
        //                         fieldName: 'medium',
        //                         stringFilter: {
        //                           value: 'cpc'
        //                         }
        //                       }
        //                     }
        //                   ]
        //                 }
        //               }
        //             },
        //             // Filter 5
        //             {
        //               notExpression: {
        //                 orGroup: {
        //                   expressions: [
        //                     {
        //                       filter: {
        //                         fieldName: 'source',
        //                         stringFilter: {
        //                           value: 'google'
        //                         }
        //                       }
        //                     },
        //                     {
        //                       filter: {
        //                         fieldName: 'medium',
        //                         stringFilter: {
        //                           value: 'cpc'
        //                         }
        //                       }
        //                     }
        //                   ]
        //                 }
        //               }
        //             }
        //           ]
        //         }
        //       }
        //     ]
        //   }
        // }
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

runReport();
