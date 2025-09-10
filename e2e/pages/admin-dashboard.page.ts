import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class AdminDashboardPage extends BasePage {
  // Admin dashboard specific elements
  readonly adminSidebar: Locator;
  readonly dashboardTitle: Locator;
  readonly statsCards: Locator;
  readonly quickActions: Locator;
  readonly recentActivity: Locator;
  readonly systemHealth: Locator;
  
  // Statistics cards
  readonly totalMembersCard: Locator;
  readonly totalRevenueCard: Locator;
  readonly activeTournamentsCard: Locator;
  readonly pendingPaymentsCard: Locator;
  readonly systemStatusCard: Locator;
  
  // Quick action buttons
  readonly viewMembersButton: Locator;
  readonly manageTournamentsButton: Locator;
  readonly confirmPaymentsButton: Locator;
  readonly generateReportButton: Locator;
  readonly systemSettingsButton: Locator;
  
  // Recent activity section
  readonly activityList: Locator;
  readonly activityEntries: Locator;
  readonly viewAllActivityButton: Locator;
  
  // Charts and analytics
  readonly revenueChart: Locator;
  readonly memberGrowthChart: Locator;
  readonly tournamentChart: Locator;
  readonly analyticsSection: Locator;
  
  // System monitoring
  readonly serverStatusIndicator: Locator;
  readonly databaseStatusIndicator: Locator;
  readonly paymentSystemStatusIndicator: Locator;
  readonly systemAlertsPanel: Locator;
  
  // Notifications and alerts
  readonly adminNotifications: Locator;
  readonly alertsBadge: Locator;
  readonly criticalAlertsPanel: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize admin dashboard locators
    this.adminSidebar = page.locator('[data-testid="admin-sidebar"]');
    this.dashboardTitle = page.locator('[data-testid="admin-dashboard-title"]');
    this.statsCards = page.locator('[data-testid="admin-stats-cards"]');
    this.quickActions = page.locator('[data-testid="admin-quick-actions"]');
    this.recentActivity = page.locator('[data-testid="admin-recent-activity"]');
    this.systemHealth = page.locator('[data-testid="system-health"]');
    
    // Statistics cards
    this.totalMembersCard = page.locator('[data-testid="total-members-card"]');
    this.totalRevenueCard = page.locator('[data-testid="total-revenue-card"]');
    this.activeTournamentsCard = page.locator('[data-testid="active-tournaments-card"]');
    this.pendingPaymentsCard = page.locator('[data-testid="pending-payments-card"]');
    this.systemStatusCard = page.locator('[data-testid="system-status-card"]');
    
    // Quick actions
    this.viewMembersButton = page.locator('[data-testid="view-members-button"]');
    this.manageTournamentsButton = page.locator('[data-testid="manage-tournaments-button"]');
    this.confirmPaymentsButton = page.locator('[data-testid="confirm-payments-button"]');
    this.generateReportButton = page.locator('[data-testid="generate-report-button"]');
    this.systemSettingsButton = page.locator('[data-testid="system-settings-button"]');
    
    // Recent activity
    this.activityList = page.locator('[data-testid="admin-activity-list"]');
    this.activityEntries = page.locator('[data-testid="admin-activity-entry"]');
    this.viewAllActivityButton = page.locator('[data-testid="view-all-admin-activity"]');
    
    // Charts
    this.revenueChart = page.locator('[data-testid="revenue-chart"]');
    this.memberGrowthChart = page.locator('[data-testid="member-growth-chart"]');
    this.tournamentChart = page.locator('[data-testid="tournament-chart"]');
    this.analyticsSection = page.locator('[data-testid="analytics-section"]');
    
    // System monitoring
    this.serverStatusIndicator = page.locator('[data-testid="server-status"]');
    this.databaseStatusIndicator = page.locator('[data-testid="database-status"]');
    this.paymentSystemStatusIndicator = page.locator('[data-testid="payment-system-status"]');
    this.systemAlertsPanel = page.locator('[data-testid="system-alerts"]');
    
    // Notifications
    this.adminNotifications = page.locator('[data-testid="admin-notifications"]');
    this.alertsBadge = page.locator('[data-testid="alerts-badge"]');
    this.criticalAlertsPanel = page.locator('[data-testid="critical-alerts"]');
  }

  // Navigation
  async goto() {
    await this.page.goto('/admin/dashboard');
    await this.waitForPageLoad();
  }

  async isAdminDashboard(): Promise<boolean> {
    return await this.adminSidebar.isVisible() && 
           await this.dashboardTitle.isVisible();
  }

  // Statistics
  async getTotalMembers(): Promise<number> {
    const membersText = await this.totalMembersCard.locator('[data-testid="stat-value"]').textContent();
    return this.extractNumber(membersText || '');
  }

  async getTotalRevenue(): Promise<number> {
    const revenueText = await this.totalRevenueCard.locator('[data-testid="stat-value"]').textContent();
    return this.extractNumber(revenueText || '');
  }

  async getActiveTournaments(): Promise<number> {
    const tournamentsText = await this.activeTournamentsCard.locator('[data-testid="stat-value"]').textContent();
    return this.extractNumber(tournamentsText || '');
  }

  async getPendingPayments(): Promise<number> {
    const paymentsText = await this.pendingPaymentsCard.locator('[data-testid="stat-value"]').textContent();
    return this.extractNumber(paymentsText || '');
  }

  async getStatCardTrend(cardSelector: string): Promise<'up' | 'down' | 'stable'> {
    const card = this.page.locator(cardSelector);
    const trendIndicator = card.locator('[data-testid="trend-indicator"]');
    
    if (await trendIndicator.isVisible()) {
      const trendClass = await trendIndicator.getAttribute('class');
      if (trendClass?.includes('up') || trendClass?.includes('positive')) {
        return 'up';
      } else if (trendClass?.includes('down') || trendClass?.includes('negative')) {
        return 'down';
      }
    }
    return 'stable';
  }

  // Quick actions navigation
  async goToMembers() {
    await this.viewMembersButton.click();
    await this.waitForNavigation('/admin/members');
  }

  async goToTournaments() {
    await this.manageTournamentsButton.click();
    await this.waitForNavigation('/admin/tournaments');
  }

  async goToPaymentConfirmation() {
    await this.confirmPaymentsButton.click();
    await this.waitForNavigation('/admin/payments/confirm');
  }

  async goToReports() {
    await this.generateReportButton.click();
    await this.waitForNavigation('/admin/reports');
  }

  async goToSettings() {
    await this.systemSettingsButton.click();
    await this.waitForNavigation('/admin/settings');
  }

  // Recent activity
  async getRecentActivityCount(): Promise<number> {
    return await this.activityEntries.count();
  }

  async getRecentActivity(index: number) {
    const entry = this.activityEntries.nth(index);
    
    return {
      type: await entry.locator('[data-testid="activity-type"]').textContent() || '',
      description: await entry.locator('[data-testid="activity-description"]').textContent() || '',
      user: await entry.locator('[data-testid="activity-user"]').textContent() || '',
      timestamp: await entry.locator('[data-testid="activity-timestamp"]').textContent() || '',
    };
  }

  async viewAllActivity() {
    await this.viewAllActivityButton.click();
    await this.waitForNavigation('/admin/activity');
  }

  // System health monitoring
  async getServerStatus(): Promise<'healthy' | 'warning' | 'critical'> {
    return await this.getSystemStatus(this.serverStatusIndicator);
  }

  async getDatabaseStatus(): Promise<'healthy' | 'warning' | 'critical'> {
    return await this.getSystemStatus(this.databaseStatusIndicator);
  }

  async getPaymentSystemStatus(): Promise<'healthy' | 'warning' | 'critical'> {
    return await this.getSystemStatus(this.paymentSystemStatusIndicator);
  }

  private async getSystemStatus(indicator: Locator): Promise<'healthy' | 'warning' | 'critical'> {
    if (await indicator.isVisible()) {
      const statusClass = await indicator.getAttribute('class');
      if (statusClass?.includes('healthy') || statusClass?.includes('success')) {
        return 'healthy';
      } else if (statusClass?.includes('warning')) {
        return 'warning';
      } else if (statusClass?.includes('critical') || statusClass?.includes('error')) {
        return 'critical';
      }
    }
    return 'healthy';
  }

  async hasSystemAlerts(): Promise<boolean> {
    return await this.systemAlertsPanel.isVisible() && 
           await this.systemAlertsPanel.locator('[data-testid="alert-item"]').count() > 0;
  }

  async getSystemAlerts(): Promise<string[]> {
    const alerts: string[] = [];
    const alertItems = this.systemAlertsPanel.locator('[data-testid="alert-item"]');
    const count = await alertItems.count();
    
    for (let i = 0; i < count; i++) {
      const alertText = await alertItems.nth(i).textContent();
      if (alertText) {
        alerts.push(alertText);
      }
    }
    
    return alerts;
  }

  // Charts and analytics
  async isRevenueChartVisible(): Promise<boolean> {
    return await this.revenueChart.isVisible();
  }

  async isMemberGrowthChartVisible(): Promise<boolean> {
    return await this.memberGrowthChart.isVisible();
  }

  async isTournamentChartVisible(): Promise<boolean> {
    return await this.tournamentChart.isVisible();
  }

  async refreshAnalytics() {
    const refreshButton = this.analyticsSection.locator('[data-testid="refresh-analytics"]');
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await this.waitForLoadingToComplete();
    }
  }

  // Notifications and alerts
  async getNotificationCount(): Promise<number> {
    if (await this.alertsBadge.isVisible()) {
      const countText = await this.alertsBadge.textContent();
      return this.extractNumber(countText || '');
    }
    return 0;
  }

  async openNotifications() {
    await this.adminNotifications.click();
    const notificationPanel = this.page.locator('[data-testid="notification-panel"]');
    await notificationPanel.waitFor({ state: 'visible' });
  }

  async hasCriticalAlerts(): Promise<boolean> {
    return await this.criticalAlertsPanel.isVisible();
  }

  async getCriticalAlerts(): Promise<string[]> {
    const alerts: string[] = [];
    if (await this.hasCriticalAlerts()) {
      const criticalAlertItems = this.criticalAlertsPanel.locator('[data-testid="critical-alert"]');
      const count = await criticalAlertItems.count();
      
      for (let i = 0; i < count; i++) {
        const alertText = await criticalAlertItems.nth(i).textContent();
        if (alertText) {
          alerts.push(alertText);
        }
      }
    }
    return alerts;
  }

  // Admin sidebar navigation
  async navigateToAdminSection(section: 'members' | 'tournaments' | 'vouchers' | 'payments' | 'reports' | 'settings') {
    const sectionLink = this.adminSidebar.locator(`[data-testid="admin-nav-${section}"]`);
    await sectionLink.click();
    await this.waitForNavigation(`/admin/${section}`);
  }

  // Time period selection for analytics
  async selectTimePeriod(period: 'day' | 'week' | 'month' | 'year') {
    const periodSelector = this.page.locator('[data-testid="time-period-selector"]');
    await periodSelector.click();
    
    const periodOption = this.page.locator(`[data-testid="period-${period}"]`);
    await periodOption.click();
    
    await this.waitForLoadingToComplete();
  }

  // Export functionality
  async exportDashboardReport() {
    const exportButton = this.page.locator('[data-testid="export-dashboard"]');
    if (await exportButton.isVisible()) {
      await exportButton.click();
      await this.page.waitForTimeout(1000); // Wait for export to start
      return true;
    }
    return false;
  }

  // Dashboard refresh
  async refreshDashboard() {
    const refreshButton = this.page.locator('[data-testid="refresh-dashboard"]');
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await this.waitForLoadingToComplete();
    } else {
      await this.reload();
    }
  }

  // Performance metrics
  async getAverageResponseTime(): Promise<number> {
    const performancePanel = this.page.locator('[data-testid="performance-metrics"]');
    if (await performancePanel.isVisible()) {
      const responseTimeElement = performancePanel.locator('[data-testid="avg-response-time"]');
      const responseTimeText = await responseTimeElement.textContent();
      return this.extractNumber(responseTimeText || '');
    }
    return 0;
  }

  async getConcurrentUsers(): Promise<number> {
    const performancePanel = this.page.locator('[data-testid="performance-metrics"]');
    if (await performancePanel.isVisible()) {
      const concurrentUsersElement = performancePanel.locator('[data-testid="concurrent-users"]');
      const usersText = await concurrentUsersElement.textContent();
      return this.extractNumber(usersText || '');
    }
    return 0;
  }

  // Dashboard customization
  async toggleWidget(widgetName: string) {
    const customizeButton = this.page.locator('[data-testid="customize-dashboard"]');
    if (await customizeButton.isVisible()) {
      await customizeButton.click();
      
      const widgetToggle = this.page.locator(`[data-testid="widget-toggle-${widgetName}"]`);
      await widgetToggle.click();
      
      const saveButton = this.page.locator('[data-testid="save-customization"]');
      await saveButton.click();
    }
  }

  // Helper methods
  private extractNumber(text: string): number {
    const match = text.match(/[\d,]+/);
    if (match) {
      return parseInt(match[0].replace(/,/g, ''));
    }
    return 0;
  }

  // Mobile responsive
  async isMobileAdminView(): Promise<boolean> {
    const mobileView = await this.isMobile();
    const collapsedSidebar = await this.adminSidebar.getAttribute('class');
    return mobileView || (collapsedSidebar?.includes('collapsed') || false);
  }

  async toggleMobileAdminSidebar() {
    if (await this.isMobile()) {
      const sidebarToggle = this.page.locator('[data-testid="admin-sidebar-toggle"]');
      if (await sidebarToggle.isVisible()) {
        await sidebarToggle.click();
      }
    }
  }
}