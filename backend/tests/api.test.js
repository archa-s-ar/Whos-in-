const http = require('http');
const connectDB = require('../src/config/db');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Setup process env
process.env.PORT = 5001;
process.env.JWT_SECRET = 'test_secret_key_123_456_789';

const runTests = async () => {
  console.log('Starting API integration tests...');
  let mongoServer;
  
  // 1. Establish DB connection
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGO_URI = mongoUri;
    await mongoose.connect(mongoUri);
    console.log('Connected to In-Memory Test Database.');
  } catch (error) {
    console.error('Test DB Connection failed.');
    console.error(error.message);
    process.exit(1);
  }

  // 2. Setup Server
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', require('../src/routes/auth'));
  app.use('/api/teams', require('../src/routes/teams'));
  app.use('/api/requests', require('../src/routes/requests'));
  app.use('/api/admin', require('../src/routes/admin'));
  app.use('/api/users', require('../src/routes/users'));

  const server = app.listen(process.env.PORT, () => {
    console.log(`Test server listening on port ${process.env.PORT}`);
  });

  const baseUrl = `http://localhost:${process.env.PORT}`;
  let authToken = '';
  let testUserId = '';
  let teamId = '';

  const request = async (path, options = {}) => {
    return new Promise((resolve, reject) => {
      const url = `${baseUrl}${path}`;
      const parsedUrl = new URL(url);
      
      const reqOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      };

      if (authToken) {
        reqOptions.headers['Authorization'] = `Bearer ${authToken}`;
      }

      const req = http.request(reqOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              body: JSON.parse(data)
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              body: data
            });
          }
        });
      });

      req.on('error', (err) => reject(err));
      
      if (options.body) {
        req.write(JSON.stringify(options.body));
      }
      req.end();
    });
  };

  try {
    // Test 1: User Registration
    console.log('\nRunning Test 1: User Registration...');
    const registerRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Archa Nair',
        email: 'archa@rit.edu',
        password: 'password123',
        college: 'RIT Kottayam',
        branch: 'Computer Science',
        skills: ['React', 'Node.js', 'Python'],
        bio: 'Looking for hackathon teammates!',
        phone: '+91 9999988888'
      }
    });

    if (registerRes.status !== 201 || !registerRes.body.success) {
      throw new Error(`Registration failed with status ${registerRes.status}: ${JSON.stringify(registerRes.body)}`);
    }
    console.log('✓ Test 1 Passed: User Registered.');
    authToken = registerRes.body.token;
    testUserId = registerRes.body.user._id;

    // Test 2: User Login
    console.log('\nRunning Test 2: User Login...');
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'archa@rit.edu',
        password: 'password123'
      }
    });

    if (loginRes.status !== 200 || !loginRes.body.success) {
      throw new Error(`Login failed with status ${loginRes.status}: ${JSON.stringify(loginRes.body)}`);
    }
    console.log('✓ Test 2 Passed: User Authenticated.');

    // Test 3: Team Creation
    console.log('\nRunning Test 3: Team Creation...');
    const teamRes = await request('/api/teams', {
      method: 'POST',
      body: {
        name: 'Alpha Team',
        projectTitle: 'Smart Agriculture Drone',
        description: 'Build an autonomous drone using computer vision to map field health.',
        category: 'Hackathon',
        requiredSkills: ['Computer Vision', 'ROS', 'C++'],
        maxSize: 4
      }
    });

    if (teamRes.status !== 201 || !teamRes.body.success) {
      throw new Error(`Team creation failed with status ${teamRes.status}: ${JSON.stringify(teamRes.body)}`);
    }
    console.log('✓ Test 3 Passed: Team Created.');
    teamId = teamRes.body.data._id;

    // Test 4: Retrieve Teams
    console.log('\nRunning Test 4: Fetch Team list...');
    const fetchRes = await request('/api/teams');
    if (fetchRes.status !== 200 || !fetchRes.body.success || fetchRes.body.data.length === 0) {
      throw new Error(`Fetch teams failed: ${JSON.stringify(fetchRes.body)}`);
    }
    console.log('✓ Test 4 Passed: Team list retrieved.');

    // Test 5: Verify profile retrieval privacy
    console.log('\nRunning Test 5: Fetch profile privacy check...');
    const profileRes = await request(`/api/users/${testUserId}`);
    if (profileRes.status !== 200 || profileRes.body.data.email !== 'archa@rit.edu') {
      throw new Error(`Profile check failed: ${JSON.stringify(profileRes.body)}`);
    }
    console.log('✓ Test 5 Passed: Profile retrieved (with owner full contact info).');

    console.log('\n=====================================');
    console.log('All API tests completed successfully!');
    console.log('=====================================');
    
  } catch (error) {
    console.error('\n✗ Test Suite Failed:');
    console.error(error);
  } finally {
    // Cleanup
    server.close();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('Cleaned up server and DB connection.');
  }
};

runTests();
