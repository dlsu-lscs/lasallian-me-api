import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { Request, Response } from 'express';
import AuthorController, { IAuthorService } from '../author.controller.js';
import { HttpError } from '@/shared/middleware/error.middleware.js';
import type { SelectAuthor, InsertAuthor } from '../author.model.js';

// Mock the Logger to keep test output clean
vi.mock('@/shared/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Test fixtures
const fixtures = {
  validAuthor: {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    description: 'Test author bio',
    website: 'https://example.com',
    logo: 'https://example.com/logo.png',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  } as SelectAuthor,
  
  createAuthorData: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    description: 'New author bio',
    website: 'https://jane.com',
    logo: 'https://jane.com/logo.png',
  } as InsertAuthor,
};

const createMockRequest = (override: Partial<Request> = {}): Request => ({
  params: {},
  body: {},
  query: {},
  ...override,
} as Request);

const createMockResponse = () => {
  const jsonMock = vi.fn();
  const sendMock = vi.fn();
  const statusMock = vi.fn().mockReturnValue({ json: jsonMock, send: sendMock });
  
  return {
    res: {
      status: statusMock,
      json: jsonMock,
      send: sendMock,
    } as unknown as Response,
    jsonMock,
    statusMock,
    sendMock,
  };
};

describe('AuthorController', () => {
  let controller: AuthorController;
  let mockService: {
    getAuthor: Mock;
    createAuthor: Mock;
    deleteAuthor: Mock;
  };

  beforeEach(() => {
    mockService = {
      getAuthor: vi.fn(),
      createAuthor: vi.fn(),
      deleteAuthor: vi.fn(),
    };

    controller = new AuthorController(mockService as unknown as IAuthorService);
  });

  describe('getAuthor', () => {
    it('should return 200 and the author when found', async () => {
      // Arrange
      const req = createMockRequest({ params: { email: 'john@example.com' } });
      const { res, statusMock, jsonMock } = createMockResponse();
      
      mockService.getAuthor.mockResolvedValue(fixtures.validAuthor);

      // Act
      await controller.getAuthor(req, res);

      // Assert
      expect(mockService.getAuthor).toHaveBeenCalledWith('john@example.com' );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(fixtures.validAuthor);
    });

    it('should throw 404 HttpError when author is not found', async () => {
      // Arrange
      const req = createMockRequest({ params: { email: 'missing@example.com' } });
      const { res, statusMock } = createMockResponse();
      
      mockService.getAuthor.mockResolvedValue(undefined);

      // Act & Assert
      await expect(controller.getAuthor(req, res))
        .rejects
        .toThrow(HttpError);
      
      expect(mockService.getAuthor).toHaveBeenCalledWith('missing@example.com');
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should throw 400 HttpError when validation fails', async () => {
      // Arrange
      const req = createMockRequest({ params: { email: 'not-an-email' } });
      const { res, statusMock } = createMockResponse();

      // Act & Assert
      await expect(controller.getAuthor(req, res))
        .rejects
        .toThrow();
      
      expect(mockService.getAuthor).not.toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe('postAuthor', () => {
    it('should return 201 and the created author', async () => {
      // Arrange
      const req = createMockRequest({ body: fixtures.createAuthorData });
      const { res, statusMock, jsonMock } = createMockResponse();
      const createdAuthor = { ...fixtures.validAuthor, id: 2, ...fixtures.createAuthorData };
      
      mockService.createAuthor.mockResolvedValue(createdAuthor);

      // Act
      await controller.postAuthor(req, res);

      // Assert
      expect(mockService.createAuthor).toHaveBeenCalledWith(fixtures.createAuthorData);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(createdAuthor);
    });

    it('should throw 400 HttpError when validation fails', async () => {
      // Arrange
      const req = createMockRequest({ body: { name: 'Test' } }); // Missing email
      const { res, statusMock } = createMockResponse();

      // Act & Assert
      await expect(controller.postAuthor(req, res))
        .rejects
        .toThrow();
      
      expect(mockService.createAuthor).not.toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const req = createMockRequest({ body: fixtures.createAuthorData });
      const { res, statusMock } = createMockResponse();
      
      mockService.createAuthor.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(controller.postAuthor(req, res))
        .rejects
        .toThrow('Database error');
      
      expect(mockService.createAuthor).toHaveBeenCalledWith(fixtures.createAuthorData);
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe('deleteAuthor', () => {
    it('should return 204 when author is deleted', async () => {
      // Arrange
      const req = createMockRequest({ params: { id: '1' } });
      const { res, statusMock, sendMock } = createMockResponse();
      
      mockService.deleteAuthor.mockResolvedValue(fixtures.validAuthor);

      // Act
      await controller.deleteAuthor(req, res);

      // Assert
      expect(mockService.deleteAuthor).toHaveBeenCalledWith(1);
      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });

    it('should throw 404 HttpError when author is not found', async () => {
      // Arrange
      const req = createMockRequest({ params: { id: '999' } });
      const { res, statusMock } = createMockResponse();
      
      mockService.deleteAuthor.mockResolvedValue(undefined);

      // Act & Assert
      await expect(controller.deleteAuthor(req, res))
        .rejects
        .toThrow(HttpError);
      
      expect(mockService.deleteAuthor).toHaveBeenCalledWith(999);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should throw 400 HttpError when validation fails', async () => {
      // Arrange
      const req = createMockRequest({ params: {} }); // Missing id
      const { res, statusMock } = createMockResponse();

      // Act & Assert
      await expect(controller.deleteAuthor(req, res))
        .rejects
        .toThrow();
      
      expect(mockService.deleteAuthor).not.toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const req = createMockRequest({ params: { id: '1' } });
      const { res, statusMock } = createMockResponse();
      
      mockService.deleteAuthor.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(controller.deleteAuthor(req, res))
        .rejects
        .toThrow('Database error');
      
      expect(mockService.deleteAuthor).toHaveBeenCalledWith(1);
      expect(statusMock).not.toHaveBeenCalled();
    });
  });
});
