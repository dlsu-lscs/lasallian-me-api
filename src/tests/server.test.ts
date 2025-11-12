import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import app from '../app.js';

describe('Server Port Tests', () => {
  let server: http.Server;
  const PORT = process.env.PORT || 8000;

  beforeAll(() => {
    return new Promise<void>((resolve) => {
      server = app.listen(PORT, () => {
        resolve();
      });
    });
  });

  afterAll(() => {
    return new Promise<void>((resolve, reject) => {
      if (server) {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  });

  it('should start server on the configured port from environment', () => {
    expect(server).toBeDefined();
    const address = server.address();
    expect(address).not.toBeNull();
    if (address && typeof address === 'object') {
      expect(address.port).toBe(Number(PORT));
    }
  });

  it('should be listening and accepting connections', async () => {
    const isListening = await new Promise<boolean>((resolve) => {
      const testClient = http.get(`http://localhost:${PORT}/api/auth`, (res) => {
        // We just want to verify the connection works
        // Status code doesn't matter for this test
        resolve(res.statusCode !== undefined);
        res.resume(); // Consume response data
      });
      
      testClient.on('error', () => {
        resolve(false);
      });
    });

    expect(isListening).toBe(true);
  });

  it('should respond to HTTP requests on the configured port', async () => {
    const response = await new Promise<number>((resolve) => {
      http.get(`http://localhost:${PORT}/api/auth`, (res) => {
        resolve(res.statusCode || 0);
        res.resume(); // Consume response data
      });
    });

    // Should get some response (not connection refused)
    expect(response).toBeGreaterThan(0);
  });

  it('should handle multiple concurrent connections', async () => {
    const requests = Array(5).fill(null).map(() => 
      new Promise<boolean>((resolve) => {
        http.get(`http://localhost:${PORT}/api/auth`, (res) => {
          resolve(res.statusCode !== undefined);
          res.resume();
        }).on('error', () => resolve(false));
      })
    );

    const results = await Promise.all(requests);
    expect(results.every(result => result === true)).toBe(true);
  });
});
