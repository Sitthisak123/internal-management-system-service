#!/usr/bin/env -S node --input-type=module

/**
 * GraphQL Testing Script
 * Tests the GraphQL endpoint with various queries
 * Usage: node test-graphql.mjs
 */

import http from 'http';

const BASE_URL = 'http://localhost:3000';
const GRAPHQL_ENDPOINT = '/graphql';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body ? JSON.parse(body) : null
        });
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Test cases
async function runTests() {
  console.log('🧪 GraphQL Endpoint Testing\n');
  console.log(`Testing: ${BASE_URL}${GRAPHQL_ENDPOINT}\n`);

  // Test 1: GET request (should return 200 with message)
  console.log('Test 1: GET /graphql');
  try {
    const result = await makeRequest('GET', GRAPHQL_ENDPOINT);
    console.log(`✓ Status: ${result.status}`);
    console.log(`✓ Response:`, result.body);
    console.log();
  } catch (error) {
    console.log(`✗ Failed:`, error.message);
    console.log();
  }

  // Test 2: Simple query
  console.log('Test 2: Query getMaterialTypes');
  try {
    const query = {
      query: `
        query {
          getMaterialTypes {
            id
            title
          }
        }
      `
    };
    const result = await makeRequest('POST', GRAPHQL_ENDPOINT, query);
    console.log(`✓ Status: ${result.status}`);
    if (result.body.data) {
      console.log(`✓ Found ${result.body.data.getMaterialTypes?.length || 0} material types`);
      console.log(`✓ Sample:`, result.body.data.getMaterialTypes?.[0]);
    } else if (result.body.errors) {
      console.log(`✗ GraphQL Errors:`, result.body.errors);
    }
    console.log();
  } catch (error) {
    console.log(`✗ Failed:`, error.message);
    console.log();
  }

  // Test 3: Query with nested relations
  console.log('Test 3: Query Materials with Types');
  try {
    const query = {
      query: `
        query {
          getMaterials {
            id
            title
            unit
            quantity
            material_type {
              id
              title
            }
          }
        }
      `
    };
    const result = await makeRequest('POST', GRAPHQL_ENDPOINT, query);
    console.log(`✓ Status: ${result.status}`);
    if (result.body.data) {
      console.log(`✓ Found ${result.body.data.getMaterials?.length || 0} materials`);
      console.log(`✓ Sample:`, result.body.data.getMaterials?.[0]);
    } else if (result.body.errors) {
      console.log(`✗ GraphQL Errors:`, result.body.errors);
    }
    console.log();
  } catch (error) {
    console.log(`✗ Failed:`, error.message);
    console.log();
  }

  // Test 4: Query Users
  console.log('Test 4: Query Users');
  try {
    const query = {
      query: `
        query {
          getUsers {
            id
            fullname
            position
            email
            role
          }
        }
      `
    };
    const result = await makeRequest('POST', GRAPHQL_ENDPOINT, query);
    console.log(`✓ Status: ${result.status}`);
    if (result.body.data) {
      console.log(`✓ Found ${result.body.data.getUsers?.length || 0} users`);
      console.log(`✓ Sample:`, result.body.data.getUsers?.[0]);
    } else if (result.body.errors) {
      console.log(`✗ GraphQL Errors:`, result.body.errors);
    }
    console.log();
  } catch (error) {
    console.log(`✗ Failed:`, error.message);
    console.log();
  }

  // Test 5: Invalid query (should return error)
  console.log('Test 5: Invalid Query (testing error handling)');
  try {
    const query = {
      query: `{ invalidQuery { id } }`
    };
    const result = await makeRequest('POST', GRAPHQL_ENDPOINT, query);
    console.log(`✓ Status: ${result.status}`);
    if (result.body.errors) {
      console.log(`✓ Error handling working`);
      console.log(`✓ Error message sample:`, result.body.errors[0]?.message);
    }
    console.log();
  } catch (error) {
    console.log(`✗ Failed:`, error.message);
    console.log();
  }

  // Test 6: Empty body (should return error)
  console.log('Test 6: Empty Body (testing validation)');
  try {
    const result = await makeRequest('POST', GRAPHQL_ENDPOINT, {});
    console.log(`✓ Status: ${result.status}`);
    if (result.body.error || result.body.errors) {
      console.log(`✓ Validation working`);
      console.log(`✓ Error:`, result.body.error || result.body.errors[0]?.message);
    }
    console.log();
  } catch (error) {
    console.log(`✗ Failed:`, error.message);
    console.log();
  }

  console.log('✅ Testing complete!');
}

// Run tests
runTests().catch(console.error);
