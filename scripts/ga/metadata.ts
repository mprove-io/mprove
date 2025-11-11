import * as path from 'path';
import * as fs from 'fs/promises';
import * as yaml from 'js-yaml';

async function metadataGetAccessToken() {
  let { JWT } = require('google-auth-library');
  let key = require('../../secrets/ga/g2.json');

  let authClient = new JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ['https://www.googleapis.com/auth/analytics.readonly']
  });

  let tokens = await authClient.authorize();

  return tokens.access_token;
}

async function metadata() {
  let axios = require('axios');

  try {
    let accessToken = await metadataGetAccessToken();
    let propertyId = process.env.PROPERTY_ID;

    let response = await axios.get(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}/metadata`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let content = JSON.stringify(response.data, null, 2);

    let filePath = '_nogit/ga/ga-metadata.json';
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`JSON saved to ${filePath}`);

    let yamlPath = '_nogit/ga/ga-metadata.yaml';
    let yamlContent = makeYaml(response.data);

    await fs.writeFile(yamlPath, yamlContent, 'utf8');
    console.log(`YAML saved to ${yamlPath}`);
  } catch (error: any) {
    console.error(
      'Error fetching analytics data:',
      error.response ? error.response.data : error.message
    );
    console.log('error?.response?.data?.error?.details');
    console.log(error?.response?.data?.error?.details);
  }
}

function toGroupName(str: string): string {
  return str
    .replace(/[/\s]+/g, '_') // ← replace / and spaces with single _
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/_+/g, '_'); // ← collapse multiple _ into one
}

function makeYaml(data: any): string {
  let groups = new Set<string>();
  let fields: any[] = [];

  data.dimensions?.forEach((dimension: any) => {
    let group = toGroupName(dimension.category);
    groups.add(group);
    let { apiName, uiName, description, category, ...rest } = dimension;
    fields.push({
      dimension: toGroupName(apiName),
      result: 'string',
      description,
      group,
      meta: { apiName, uiName, ...rest }
    });
  });

  data.metrics?.forEach((metric: any) => {
    let group = toGroupName(metric.category);
    groups.add(group);
    let { apiName, uiName, description, category, type, ...rest } = metric;
    fields.push({
      measure: toGroupName(apiName),
      result: 'number',
      description,
      group,
      meta: { apiName, uiName, type, ...rest }
    });
  });

  let output = {
    field_groups: Array.from(groups).map((g: string) => ({ group: g })),
    fields
  };

  let raw = yaml.dump(output, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    quotingType: '"',
    forceQuotes: true
  });

  let lines = raw.split('\n');
  let formatted: string[] = [];
  let inFieldGroups = false;

  for (let line of lines) {
    if (line.trim() === 'field_groups:') inFieldGroups = true;
    if (line.trim() === 'fields:') inFieldGroups = false;

    if (/^\s*- /.test(line) && !inFieldGroups) {
      formatted.push('');
    }
    formatted.push(line);
  }

  return formatted.join('\n').trim() + '\n';
}

metadata();
