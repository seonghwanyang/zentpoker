import { Page, APIResponse } from '@playwright/test';
import { testData } from '../fixtures';

export class ApiHelper {
  constructor(private page: Page) {}

  /**
   * Get user's points balance
   */
  async getPointsBalance(): Promise<number> {
    const response = await this.page.request.get('/api/points/balance');
    if (!response.ok()) {
      throw new Error(`Failed to get points balance: ${response.status()}`);
    }
    const data = await response.json();
    return data.balance;
  }

  /**
   * Charge points for user
   */
  async chargePoints(amount: number, method: 'KAKAO_PAY' | 'BANK_TRANSFER' = 'KAKAO_PAY') {
    const response = await this.page.request.post('/api/points/charge', {
      data: {
        amount,
        method,
      },
    });
    
    if (!response.ok()) {
      throw new Error(`Failed to charge points: ${response.status()}`);
    }
    
    return await response.json();
  }

  /**
   * Get point transactions
   */
  async getPointTransactions() {
    const response = await this.page.request.get('/api/points/transactions');
    if (!response.ok()) {
      throw new Error(`Failed to get point transactions: ${response.status()}`);
    }
    return await response.json();
  }

  /**
   * Get available vouchers
   */
  async getVouchers() {
    const response = await this.page.request.get('/api/vouchers/list');
    if (!response.ok()) {
      throw new Error(`Failed to get vouchers: ${response.status()}`);
    }
    return await response.json();
  }

  /**
   * Purchase voucher
   */
  async purchaseVoucher(voucherId: string, quantity: number = 1) {
    const response = await this.page.request.post('/api/vouchers/purchase', {
      data: {
        voucherId,
        quantity,
      },
    });
    
    if (!response.ok()) {
      throw new Error(`Failed to purchase voucher: ${response.status()}`);
    }
    
    return await response.json();
  }

  /**
   * Get voucher pricing
   */
  async getVoucherPricing() {
    const response = await this.page.request.get('/api/vouchers/pricing');
    if (!response.ok()) {
      throw new Error(`Failed to get voucher pricing: ${response.status()}`);
    }
    return await response.json();
  }

  /**
   * Get user profile
   */
  async getUserProfile() {
    const response = await this.page.request.get('/api/members/profile');
    if (!response.ok()) {
      throw new Error(`Failed to get user profile: ${response.status()}`);
    }
    return await response.json();
  }

  /**
   * Update user profile
   */
  async updateUserProfile(profileData: any) {
    const response = await this.page.request.patch('/api/members/profile', {
      data: profileData,
    });
    
    if (!response.ok()) {
      throw new Error(`Failed to update user profile: ${response.status()}`);
    }
    
    return await response.json();
  }

  // Admin API methods
  /**
   * Get all members (admin only)
   */
  async getMembers() {
    const response = await this.page.request.get('/api/admin/members');
    if (!response.ok()) {
      throw new Error(`Failed to get members: ${response.status()}`);
    }
    return await response.json();
  }

  /**
   * Get specific member (admin only)
   */
  async getMember(memberId: string) {
    const response = await this.page.request.get(`/api/admin/members/${memberId}`);
    if (!response.ok()) {
      throw new Error(`Failed to get member: ${response.status()}`);
    }
    return await response.json();
  }

  /**
   * Update member status (admin only)
   */
  async updateMemberStatus(memberId: string, status: 'ACTIVE' | 'SUSPENDED' | 'BANNED') {
    const response = await this.page.request.patch(`/api/admin/members/${memberId}`, {
      data: { status },
    });
    
    if (!response.ok()) {
      throw new Error(`Failed to update member status: ${response.status()}`);
    }
    
    return await response.json();
  }

  /**
   * Adjust member points (admin only)
   */
  async adjustMemberPoints(memberId: string, amount: number, reason: string) {
    const response = await this.page.request.post('/api/admin/points/adjust', {
      data: {
        memberId,
        amount,
        reason,
      },
    });
    
    if (!response.ok()) {
      throw new Error(`Failed to adjust member points: ${response.status()}`);
    }
    
    return await response.json();
  }

  /**
   * Confirm payment (admin only)
   */
  async confirmPayment(paymentId: string) {
    const response = await this.page.request.post('/api/admin/payments/confirm', {
      data: { paymentId },
    });
    
    if (!response.ok()) {
      throw new Error(`Failed to confirm payment: ${response.status()}`);
    }
    
    return await response.json();
  }

  // Tournament API methods
  /**
   * Get tournaments
   */
  async getTournaments() {
    const response = await this.page.request.get('/api/tournaments');
    if (!response.ok()) {
      throw new Error(`Failed to get tournaments: ${response.status()}`);
    }
    return await response.json();
  }

  /**
   * Enter tournament
   */
  async enterTournament(tournamentId: string) {
    const response = await this.page.request.post(`/api/tournaments/${tournamentId}/enter`);
    if (!response.ok()) {
      throw new Error(`Failed to enter tournament: ${response.status()}`);
    }
    return await response.json();
  }

  /**
   * Leave tournament
   */
  async leaveTournament(tournamentId: string) {
    const response = await this.page.request.delete(`/api/tournaments/${tournamentId}/enter`);
    if (!response.ok()) {
      throw new Error(`Failed to leave tournament: ${response.status()}`);
    }
    return await response.json();
  }

  // Payment simulation methods
  /**
   * Simulate KakaoPay payment success
   */
  async simulateKakaoPaySuccess(paymentData: any) {
    // Mock KakaoPay callback for testing
    await this.page.route('**/api/payments/kakao/callback', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          paymentId: 'test-payment-id',
          amount: paymentData.amount,
          status: 'COMPLETED',
        }),
      });
    });
  }

  /**
   * Simulate payment failure
   */
  async simulatePaymentFailure(errorMessage: string = 'Payment failed') {
    await this.page.route('**/api/payments/**', route => {
      route.fulfill({
        status: 400,
        body: JSON.stringify({
          error: errorMessage,
        }),
      });
    });
  }

  // Health check and status methods
  /**
   * Check API health
   */
  async checkApiHealth(): Promise<boolean> {
    try {
      const response = await this.page.request.get('/api/health');
      return response.ok();
    } catch {
      return false;
    }
  }

  /**
   * Get server status
   */
  async getServerStatus() {
    const response = await this.page.request.get('/api/status');
    if (!response.ok()) {
      throw new Error(`Failed to get server status: ${response.status()}`);
    }
    return await response.json();
  }

  // Utility methods
  /**
   * Make authenticated request
   */
  async makeAuthenticatedRequest(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<APIResponse> {
    const options: any = {
      headers: {
        'Content-Type': 'application/json',
        'X-Test-User': 'true', // Mark as test request
      },
    };

    if (data) {
      options.data = data;
    }

    switch (method) {
      case 'GET':
        return await this.page.request.get(endpoint, options);
      case 'POST':
        return await this.page.request.post(endpoint, options);
      case 'PUT':
        return await this.page.request.put(endpoint, options);
      case 'PATCH':
        return await this.page.request.patch(endpoint, options);
      case 'DELETE':
        return await this.page.request.delete(endpoint, options);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }

  /**
   * Wait for API response
   */
  async waitForApiResponse(urlPattern: string, timeout: number = 10000): Promise<APIResponse> {
    return await this.page.waitForResponse(
      response => response.url().includes(urlPattern) && response.status() === 200,
      { timeout }
    );
  }

  /**
   * Intercept and mock API responses
   */
  async mockApiResponse(urlPattern: string, responseData: any, status: number = 200) {
    await this.page.route(urlPattern, route => {
      route.fulfill({
        status,
        body: JSON.stringify(responseData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  }

  /**
   * Clear all API mocks
   */
  async clearApiMocks() {
    await this.page.unrouteAll();
  }
}