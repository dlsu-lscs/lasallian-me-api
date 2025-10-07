/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Makes test utilities like 'describe', 'it', 'expect' globally available
    environment: 'node', // Specify 'node' for backend testing
    // You can add setupFiles here if you need to run specific code before tests
    // setupFiles: ['./test/setup.ts'],
  },
});
