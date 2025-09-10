import { POST } from '@/app/api/points/charge/route';

// 모의 함수들
jest.mock('@/lib/api/middleware');
jest.mock('@/lib/db/transactions');
jest.mock('@/lib/utils/validation');

describe('/api/points/charge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should create charge request successfully', async () => {
      const { requireAuth, createSuccessResponse, parseAndValidateBody } = require('@/lib/api/middleware');
      const { createPointChargeTransaction } = require('@/lib/db/transactions');
      const { validateChargeAmount } = require('@/lib/utils/validation');

      // Mock 설정
      const mockUser = createMockUser();
      const mockTransaction = createMockTransaction();
      const mockPayment = { id: 'payment-id' };

      requireAuth.mockResolvedValue(mockUser);
      parseAndValidateBody.mockResolvedValue({
        amount: 25000,
        method: 'KAKAO_PAY',
        userType: 'MEMBER'
      });
      validateChargeAmount.mockReturnValue({ isValid: true });
      createPointChargeTransaction.mockResolvedValue({
        transaction: mockTransaction,
        payment: mockPayment
      });
      createSuccessResponse.mockReturnValue(new Response());

      const request = createMockApiRequest('POST', 'http://localhost:3000/api/points/charge', {
        amount: 25000,
        method: 'KAKAO_PAY',
        userType: 'MEMBER'
      });

      const response = await POST(request);

      expect(requireAuth).toHaveBeenCalled();
      expect(parseAndValidateBody).toHaveBeenCalledWith(request, expect.any(Function));
      expect(validateChargeAmount).toHaveBeenCalledWith(25000, 'MEMBER');
      expect(createPointChargeTransaction).toHaveBeenCalledWith({
        userId: mockUser.id,
        amount: 25000,
        method: 'KAKAO_PAY',
        metadata: expect.objectContaining({
          referenceCode: expect.any(String),
          paymentMethod: 'KAKAO_PAY',
          userType: 'MEMBER'
        })
      });
      expect(createSuccessResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionId: mockTransaction.id,
          amount: 25000,
          status: 'PENDING'
        }),
        '충전 요청이 생성되었습니다.',
        201
      );
    });

    it('should reject invalid charge amount', async () => {
      const { requireAuth, parseAndValidateBody, ApiError } = require('@/lib/api/middleware');
      const { validateChargeAmount } = require('@/lib/utils/validation');

      const mockUser = createMockUser();
      
      requireAuth.mockResolvedValue(mockUser);
      parseAndValidateBody.mockResolvedValue({
        amount: 20000,
        method: 'KAKAO_PAY',
        userType: 'MEMBER'
      });
      validateChargeAmount.mockReturnValue({
        isValid: false,
        message: '정회원은 25,000원만 충전 가능합니다.'
      });

      const request = createMockApiRequest('POST', 'http://localhost:3000/api/points/charge', {
        amount: 20000,
        method: 'KAKAO_PAY',
        userType: 'MEMBER'
      });

      await expect(POST(request)).rejects.toThrow(ApiError);
    });

    it('should handle rate limiting', async () => {
      const { rateLimitMiddlewares } = require('@/lib/api/rate-limit');
      
      // Rate limit exceeded 시뮬레이션
      rateLimitMiddlewares.payment.mockImplementation(() => {
        throw new Error('Rate limit exceeded');
      });

      const request = createMockApiRequest('POST', 'http://localhost:3000/api/points/charge', {
        amount: 25000,
        method: 'KAKAO_PAY',
        userType: 'MEMBER'
      });

      await expect(POST(request)).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle unauthenticated request', async () => {
      const { requireAuth, ApiError } = require('@/lib/api/middleware');
      
      requireAuth.mockRejectedValue(new ApiError('Unauthorized', 401));

      const request = createMockApiRequest('POST', 'http://localhost:3000/api/points/charge', {
        amount: 25000,
        method: 'KAKAO_PAY',
        userType: 'MEMBER'
      });

      await expect(POST(request)).rejects.toThrow(ApiError);
    });

    it('should generate different reference codes', async () => {
      const { requireAuth, createSuccessResponse, parseAndValidateBody } = require('@/lib/api/middleware');
      const { createPointChargeTransaction } = require('@/lib/db/transactions');
      const { validateChargeAmount } = require('@/lib/utils/validation');

      const mockUser = createMockUser();
      const mockTransaction = createMockTransaction();
      const mockPayment = { id: 'payment-id' };

      requireAuth.mockResolvedValue(mockUser);
      parseAndValidateBody.mockResolvedValue({
        amount: 25000,
        method: 'KAKAO_PAY',
        userType: 'MEMBER'
      });
      validateChargeAmount.mockReturnValue({ isValid: true });
      createPointChargeTransaction.mockResolvedValue({
        transaction: mockTransaction,
        payment: mockPayment
      });
      createSuccessResponse.mockReturnValue(new Response());

      const request1 = createMockApiRequest('POST', 'http://localhost:3000/api/points/charge', {
        amount: 25000,
        method: 'KAKAO_PAY',
        userType: 'MEMBER'
      });

      const request2 = createMockApiRequest('POST', 'http://localhost:3000/api/points/charge', {
        amount: 25000,
        method: 'KAKAO_PAY',
        userType: 'MEMBER'
      });

      await POST(request1);
      await POST(request2);

      // 두 번 호출되었는지 확인
      expect(createPointChargeTransaction).toHaveBeenCalledTimes(2);
      
      // 서로 다른 referenceCode가 생성되었는지 확인
      const firstCall = createPointChargeTransaction.mock.calls[0][0];
      const secondCall = createPointChargeTransaction.mock.calls[1][0];
      
      expect(firstCall.metadata.referenceCode).not.toBe(secondCall.metadata.referenceCode);
    });
  });
});