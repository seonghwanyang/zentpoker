import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  // Dashboard specific elements
  readonly welcomeMessage: Locator;
  readonly pointsBalance: Locator;
  readonly quickActions: Locator;
  readonly recentTransactions: Locator;
  readonly upcomingTournaments: Locator;
  readonly membershipStatus: Locator;
  readonly sidebar: Locator;
  readonly mainContent: Locator;
  
  // Quick action buttons
  readonly chargePointsButton: Locator;
  readonly buyVoucherButton: Locator;
  readonly viewTournamentsButton: Locator;
  readonly viewProfileButton: Locator;
  
  // Statistics cards
  readonly totalPointsCard: Locator;
  readonly tournamentsEnteredCard: Locator;
  readonly vouchersOwnedCard: Locator;
  readonly rankingCard: Locator;
  
  // Recent activity section
  readonly recentActivityList: Locator;
  readonly activityEntries: Locator;
  readonly viewAllActivityButton: Locator;
  
  // Notifications
  readonly notificationBell: Locator;
  readonly notificationDropdown: Locator;
  readonly notificationCount: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize dashboard-specific locators
    this.welcomeMessage = page.locator('[data-testid="welcome-message"]');
    this.pointsBalance = page.locator('[data-testid="points-balance"]');
    this.quickActions = page.locator('[data-testid="quick-actions"]');
    this.recentTransactions = page.locator('[data-testid="recent-transactions"]');
    this.upcomingTournaments = page.locator('[data-testid="upcoming-tournaments"]');
    this.membershipStatus = page.locator('[data-testid="membership-status"]');
    this.sidebar = page.locator('[data-testid="member-sidebar"]');
    this.mainContent = page.locator('[data-testid="dashboard-main"]');
    
    // Quick actions
    this.chargePointsButton = page.locator('[data-testid="charge-points-button"]');
    this.buyVoucherButton = page.locator('[data-testid="buy-voucher-button"]');
    this.viewTournamentsButton = page.locator('[data-testid="view-tournaments-button"]');
    this.viewProfileButton = page.locator('[data-testid="view-profile-button"]');
    
    // Statistics
    this.totalPointsCard = page.locator('[data-testid="total-points-card"]');
    this.tournamentsEnteredCard = page.locator('[data-testid="tournaments-entered-card"]');
    this.vouchersOwnedCard = page.locator('[data-testid="vouchers-owned-card"]');
    this.rankingCard = page.locator('[data-testid="ranking-card"]');
    
    // Recent activity
    this.recentActivityList = page.locator('[data-testid="recent-activity-list"]');
    this.activityEntries = page.locator('[data-testid="activity-entry"]');
    this.viewAllActivityButton = page.locator('[data-testid="view-all-activity"]');
    
    // Notifications
    this.notificationBell = page.locator('[data-testid="notification-bell"]');
    this.notificationDropdown = page.locator('[data-testid="notification-dropdown"]');
    this.notificationCount = page.locator('[data-testid="notification-count"]');
  }

  // Navigation
  async goto() {
    await this.page.goto('/dashboard');
    await this.waitForPageLoad();
  }

  // Points management
  async getPointsBalance(): Promise<number> {
    const balanceText = await this.pointsBalance.textContent();
    if (balanceText) {
      const match = balanceText.match(/[\d,]+/);
      if (match) {
        return parseInt(match[0].replace(/,/g, ''));
      }
    }
    return 0;
  }

  async goToChargePoints() {
    await this.chargePointsButton.click();
    await this.waitForNavigation('/points/charge');
  }

  async goToBuyVoucher() {
    await this.buyVoucherButton.click();
    await this.waitForNavigation('/vouchers/purchase');
  }

  // Tournament actions
  async goToTournaments() {
    await this.viewTournamentsButton.click();
    await this.waitForNavigation('/tournaments');
  }

  async getUpcomingTournamentCount(): Promise<number> {
    const tournamentItems = this.upcomingTournaments.locator('[data-testid="tournament-item"]');
    return await tournamentItems.count();
  }

  async joinFirstUpcomingTournament() {
    const firstTournament = this.upcomingTournaments.locator('[data-testid="tournament-item"]').first();
    const joinButton = firstTournament.locator('[data-testid="join-tournament"]');
    
    if (await joinButton.isVisible() && await joinButton.isEnabled()) {
      await joinButton.click();
      return true;
    }
    return false;
  }

  // Profile actions
  async goToProfile() {
    await this.viewProfileButton.click();
    await this.waitForNavigation('/profile');
  }

  async getUsernameFromWelcome(): Promise<string> {
    const welcomeText = await this.welcomeMessage.textContent();
    if (welcomeText) {
      // Extract username from welcome message
      const match = welcomeText.match(/안녕하세요,\s*(.+)님!/);
      if (match) {
        return match[1];
      }
    }
    return '';
  }

  // Statistics
  async getTotalPoints(): Promise<number> {
    const pointsText = await this.totalPointsCard.locator('[data-testid="stat-value"]').textContent();
    if (pointsText) {
      return parseInt(pointsText.replace(/[^0-9]/g, ''));
    }
    return 0;
  }

  async getTournamentsEntered(): Promise<number> {
    const tournamentsText = await this.tournamentsEnteredCard.locator('[data-testid="stat-value"]').textContent();
    if (tournamentsText) {
      return parseInt(tournamentsText.replace(/[^0-9]/g, ''));
    }
    return 0;
  }

  async getVouchersOwned(): Promise<number> {
    const vouchersText = await this.vouchersOwnedCard.locator('[data-testid="stat-value"]').textContent();
    if (vouchersText) {
      return parseInt(vouchersText.replace(/[^0-9]/g, ''));
    }
    return 0;
  }

  async getCurrentRank(): Promise<string> {
    const rankText = await this.rankingCard.locator('[data-testid="stat-value"]').textContent();
    return rankText || '';
  }

  // Recent activity
  async getRecentActivityCount(): Promise<number> {
    return await this.activityEntries.count();
  }

  async getRecentActivityEntries(): Promise<string[]> {
    const entries = await this.activityEntries.allTextContents();
    return entries;
  }

  async viewAllActivity() {
    await this.viewAllActivityButton.click();
    await this.waitForNavigation('/activity');
  }

  // Notifications
  async openNotifications() {
    await this.notificationBell.click();
    await this.notificationDropdown.waitFor({ state: 'visible' });
  }

  async closeNotifications() {
    if (await this.notificationDropdown.isVisible()) {
      await this.pressEscape();
      await this.notificationDropdown.waitFor({ state: 'hidden' });
    }
  }

  async getNotificationCount(): Promise<number> {
    if (await this.notificationCount.isVisible()) {
      const countText = await this.notificationCount.textContent();
      return countText ? parseInt(countText) : 0;
    }
    return 0;
  }

  async hasUnreadNotifications(): Promise<boolean> {
    return await this.notificationCount.isVisible();
  }

  // Sidebar navigation
  async navigateToPointsPage() {
    const pointsLink = this.sidebar.locator('[data-testid="sidebar-points"]');
    await pointsLink.click();
    await this.waitForNavigation('/points');
  }

  async navigateToTournamentsPage() {
    const tournamentsLink = this.sidebar.locator('[data-testid="sidebar-tournaments"]');
    await tournamentsLink.click();
    await this.waitForNavigation('/tournaments');
  }

  async navigateToVouchersPage() {
    const vouchersLink = this.sidebar.locator('[data-testid="sidebar-vouchers"]');
    await vouchersLink.click();
    await this.waitForNavigation('/vouchers');
  }

  // Dashboard validation
  async isDashboardComplete(): Promise<boolean> {
    const essentialElements = [
      this.welcomeMessage,
      this.pointsBalance,
      this.quickActions,
      this.totalPointsCard,
      this.sidebar
    ];

    for (const element of essentialElements) {
      if (!await element.isVisible()) {
        return false;
      }
    }
    return true;
  }

  async hasRecentTransactions(): Promise<boolean> {
    return await this.recentTransactions.isVisible() && 
           await this.activityEntries.count() > 0;
  }

  async hasUpcomingTournaments(): Promise<boolean> {
    return await this.upcomingTournaments.isVisible() &&
           await this.getUpcomingTournamentCount() > 0;
  }

  // Member status
  async getMembershipStatus(): Promise<string> {
    const statusText = await this.membershipStatus.textContent();
    return statusText || '';
  }

  async isMembershipActive(): Promise<boolean> {
    const status = await this.getMembershipStatus();
    return status.includes('활성') || status.includes('Active');
  }

  // Responsive behavior
  async toggleMobileSidebar() {
    if (await this.isMobile()) {
      const sidebarToggle = this.page.locator('[data-testid="mobile-sidebar-toggle"]');
      if (await sidebarToggle.isVisible()) {
        await sidebarToggle.click();
      }
    }
  }

  async isMobileSidebarOpen(): Promise<boolean> {
    if (await this.isMobile()) {
      return await this.sidebar.isVisible();
    }
    return true; // Desktop sidebar is always visible
  }

  // Error states
  async hasDataLoadingError(): Promise<boolean> {
    const errorState = this.page.locator('[data-testid="dashboard-error"]');
    return await errorState.isVisible();
  }

  async retryDataLoading() {
    const retryButton = this.page.locator('[data-testid="retry-loading"]');
    if (await retryButton.isVisible()) {
      await retryButton.click();
      await this.waitForLoadingToComplete();
    }
  }

  // Refresh functionality
  async refreshDashboard() {
    const refreshButton = this.page.locator('[data-testid="refresh-dashboard"]');
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await this.waitForLoadingToComplete();
    } else {
      await this.reload();
    }
  }
}