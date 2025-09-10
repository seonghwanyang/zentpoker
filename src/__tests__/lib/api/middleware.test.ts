import { NextRequest } from 'next/server';
import { 
  ApiError, 
  handleApiError, 
  createSuccessResponse, 
  createErrorResponse,
  requireAuth,
  parseAndValidateBody 
} from '@/lib/api/middleware';

// 모의 함수들
jest.mock('@/lib/auth/auth-options');
jest.mock('@/lib/prisma');

describe('API Middleware', () => {
  describe('ApiError', () => {
    it('should create an ApiError with correct properties', () => {
      const error = new ApiError('Test error', 400, 'TEST_ERROR');
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.name).toBe('ApiError');
    });

    it('should use default status code 500', () => {
      const error = new ApiError('Test error');
      
      expect(error.statusCode).toBe(500);
    });
  });

  describe('handleApiError', () => {
    it('should handle ApiError correctly', () => {
      const error = new ApiError('Test error', 400, 'TEST_ERROR');
      const response = handleApiError(error);
      
      expect(response.status).toBe(400);
    });

    it('should handle generic Error correctly', () => {
      const error = new Error('Generic error');
      const response = handleApiError(error);
      
      expect(response.status).toBe(500);
    });

    it('should handle unknown error correctly', () => {
      const response = handleApiError('Unknown error');
      
      expect(response.status).toBe(500);
    });
  });

  describe('createSuccessResponse', () => {
    it('should create success response with data', () => {
      const data = { test: 'data' };
      const response = createSuccessResponse(data, 'Success message', 201);
      
      expect(response.status).toBe(201);
    });

    it('should create success response without data', () => {
      const response = createSuccessResponse();
      
      expect(response.status).toBe(200);
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response', () => {
      const response = createErrorResponse('Test error', 'Error message', 400);
      
      expect(response.status).toBe(400);
    });
  });

  describe('parseAndValidateBody', () => {
    it('should parse valid JSON body', async () => {
      const mockRequest = createMockApiRequest('POST', 'http://localhost:3000/api/test', {
        test: 'data'
      });

      const result = await parseAndValidateBody(mockRequest);
      
      expect(result).toHaveProperty('test', 'data');
    });

    it('should throw error for invalid JSON', async () => {
      const mockRequest = new Request('http://localhost:3000/api/test', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      await expect(parseAndValidateBody(mockRequest)).rejects.toThrow(ApiError);
    });

    it('should validate body with validator function', async () => {
      const mockRequest = createMockApiRequest('POST', 'http://localhost:3000/api/test', {
        email: 'test@example.com'
      });

      const validator = (data: any) => {
        if (!data.email) throw new Error('Email required');
        return data;
      };

      const result = await parseAndValidateBody(mockRequest, validator);
      
      expect(result).toHaveProperty('email');
    });
  });

  describe('requireAuth', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw error when no session', async () => {
      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue(null);

      await expect(requireAuth()).rejects.toThrow(ApiError);
    });

    it('should throw error when user not found', async () => {
      const { getServerSession } = require('next-auth');
      const { prisma } = require('@/lib/prisma');
      
      getServerSession.mockResolvedValue({
        user: { email: 'test@example.com' }
      });
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(requireAuth()).rejects.toThrow(ApiError);
    });

    it('should throw error when user is inactive', async () => {
      const { getServerSession } = require('next-auth');
      const { prisma } = require('@/lib/prisma');
      
      getServerSession.mockResolvedValue({
        user: { email: 'test@example.com' }
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'test-id',
        email: 'test@example.com',
        status: 'INACTIVE'
      });

      await expect(requireAuth()).rejects.toThrow(ApiError);
    });

    it('should return user when valid session', async () => {
      const { getServerSession } = require('next-auth');
      const { prisma } = require('@/lib/prisma');
      
      const mockUser = createMockUser({ status: 'ACTIVE' });
      
      getServerSession.mockResolvedValue({
        user: { email: 'test@example.com' }
      });
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await requireAuth();
      
      expect(result).toEqual(mockUser);
    });
  });
});