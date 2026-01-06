import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { generateOpenAPIDocument } from '../config/openapi.js';

const router = Router();

// Serve Swagger UI - generate document on each request to include all registered routes
router.use('/', swaggerUi.serve);
router.get('/', (req, res, next) => {
  const openAPIDocument = generateOpenAPIDocument();
  swaggerUi.setup(openAPIDocument, {
    customSiteTitle: 'Lasallian.me API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  })(req, res, next);
});

// Serve raw OpenAPI JSON
router.get('/openapi.json', (req, res) => {
  const openAPIDocument = generateOpenAPIDocument();
  res.json(openAPIDocument);
});

export default router;
