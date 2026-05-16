const axios = require('axios');

// Base URLs for the four separate service processes.
const usersServiceUrl = 'http://localhost:3001';
const costsServiceUrl = 'http://localhost:3002';
const logsServiceUrl = 'http://localhost:3003';
const aboutServiceUrl = 'http://localhost:3004';

describe('Cost Manager API Tests', () => {
  // ==================================================
  // Test - developers team details
  // ==================================================

  test('GET /api/about should return team members', async () => {
    // Send a request to the about service.
    const response = await axios.get(`${aboutServiceUrl}/api/about/`);

    // Validate that the response is successful and returns an array.
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);

    // Validate that each team member includes only the required properties.
    response.data.forEach((member) => {
      expect(member).toHaveProperty('first_name');
      expect(member).toHaveProperty('last_name');
      expect(member).not.toHaveProperty('id');
      expect(member).not.toHaveProperty('email');
    });
  });

  // ==================================================
  // Test - users list
  // ==================================================

  test('GET /api/users should return users list', async () => {
    // Send a request to the users service.
    const response = await axios.get(`${usersServiceUrl}/api/users/`);

    // Validate that the response is successful and returns an array.
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  // ==================================================
  // Test - user details with total costs
  // ==================================================

  test('GET /api/users/123123 should return user details with total', async () => {
    // Send a request for the required imaginary user.
    const response = await axios.get(`${usersServiceUrl}/api/users/123123`);

    // Validate the required response properties.
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('first_name');
    expect(response.data).toHaveProperty('last_name');
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('total');

    // Validate the user id and the total type.
    expect(response.data.id).toBe(123123);
    expect(typeof response.data.total).toBe('number');
  });

  // ==================================================
  // Test - monthly report with all categories
  // ==================================================

  test('GET /api/report should return monthly report with all categories', async () => {
    // Send a request for a monthly report.
    const response = await axios.get(`${costsServiceUrl}/api/report/`, {
      params: {
        id: 123123,
        year: 2026,
        month: 1
      }
    });

    // Validate the main report fields.
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('userid', 123123);
    expect(response.data).toHaveProperty('year', 2026);
    expect(response.data).toHaveProperty('month', 1);
    expect(response.data).toHaveProperty('costs');

    // Validate that costs is returned as an array.
    expect(Array.isArray(response.data.costs)).toBe(true);

    // Extract the category names from the report structure.
    const categories = response.data.costs.map((categoryObject) => {
      return Object.keys(categoryObject)[0];
    });

    // Validate that all required categories exist, even when they are empty.
    expect(categories).toContain('food');
    expect(categories).toContain('education');
    expect(categories).toContain('health');
    expect(categories).toContain('housing');
    expect(categories).toContain('sports');
  });

  // ==================================================
  // Test - add a cost item
  // ==================================================

  test('POST /api/add should add a cost item', async () => {
    // Send a valid cost item to the costs service.
    const response = await axios.post(`${costsServiceUrl}/api/add/`, {
      userid: 123123,
      description: 'unit test cost',
      category: 'food',
      sum: 8
    });

    // Validate that the cost item was created successfully.
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('userid', 123123);
    expect(response.data).toHaveProperty('description', 'unit test cost');
    expect(response.data).toHaveProperty('category', 'food');
    expect(response.data).toHaveProperty('sum', 8);
  });

  // ==================================================
  // Test - prevent adding an existing user
  // ==================================================

  test('POST /api/add should not add existing user again', async () => {
    try {
      // Try to add the required imaginary user again.
      await axios.post(`${usersServiceUrl}/api/add/`, {
        id: 123123,
        first_name: 'mosh',
        last_name: 'israeli',
        birthday: '1990-01-01'
      });
    } catch (error) {
      // Validate that the service returns a standard error response.
      expect(error.response.status).toBe(400);
      expect(error.response.data).toHaveProperty('id');
      expect(error.response.data).toHaveProperty('message');
      expect(error.response.data.id).toBe('user_exists');
    }
  });

  // ==================================================
  // Test - logs list
  // ==================================================

  test('GET /api/logs should return logs list', async () => {
    // Send a request to the logs service.
    const response = await axios.get(`${logsServiceUrl}/api/logs/`);

    // Validate that the response is successful and returns an array.
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);

    // Validate the structure of a log document when logs exist.
    if (response.data.length > 0) {
      expect(response.data[0]).toHaveProperty('method');
      expect(response.data[0]).toHaveProperty('url');
      expect(response.data[0]).toHaveProperty('message');
    }
  });
});