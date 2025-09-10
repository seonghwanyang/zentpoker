import { test, expect, testGroups, retryConfig } from '../fixtures';

test.describe(testGroups.tournament, () => {
  test.describe.configure(retryConfig.admin);

  test('should display tournaments page correctly', async ({ memberPage, navigationHelper }) => {
    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToTournaments();

    // Check page elements
    await expect(memberPage).toHaveTitle(/토너먼트|Tournament/);
    await expect(memberPage.locator('[data-testid="tournaments-list"]')).toBeVisible();
    await expect(memberPage.locator('[data-testid="tournaments-filter"]')).toBeVisible();
  });

  test('should display tournament information correctly', async ({ 
    memberPage, 
    navigationHelper,
    databaseHelper 
  }) => {
    // Create test tournament
    const tournament = await databaseHelper.createTestTournament({
      name: 'E2E Test Tournament',
      maxParticipants: 100,
      entryFee: 1000,
      prizePool: 50000,
      status: 'UPCOMING',
    });

    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToTournaments();

    // Check tournament card
    const tournamentCard = memberPage.locator('[data-testid="tournament-card"]').first();
    await expect(tournamentCard).toBeVisible();
    await expect(tournamentCard).toContainText('E2E Test Tournament');
    await expect(tournamentCard).toContainText('1,000P'); // Entry fee
    await expect(tournamentCard).toContainText('50,000P'); // Prize pool
    await expect(tournamentCard).toContainText('100명'); // Max participants

    // Check tournament status
    await expect(tournamentCard.locator('[data-testid="tournament-status"]')).toContainText('모집 중');

    // Cleanup
    await databaseHelper.deleteTestTournament(tournament.id);
  });

  test('should successfully enter tournament with sufficient points', async ({ 
    memberPage, 
    navigationHelper,
    databaseHelper,
    apiHelper 
  }) => {
    // Create test tournament
    const tournament = await databaseHelper.createTestTournament({
      name: 'Entry Test Tournament',
      entryFee: 1000,
      status: 'UPCOMING',
    });

    // Ensure user has sufficient points
    await databaseHelper.updateUserPoints('member@zentpoker.test', 5000);

    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToTournaments();

    // Find and enter tournament
    const tournamentCard = memberPage.locator('[data-testid="tournament-card"]', {
      hasText: 'Entry Test Tournament'
    });
    await tournamentCard.locator('[data-testid="enter-tournament"]').click();

    // Confirm entry in modal
    const entryModal = memberPage.locator('[data-testid="tournament-entry-modal"]');
    await expect(entryModal).toBeVisible();
    
    await expect(entryModal.locator('[data-testid="tournament-name"]')).toContainText('Entry Test Tournament');
    await expect(entryModal.locator('[data-testid="entry-fee"]')).toContainText('1,000P');
    await expect(entryModal.locator('[data-testid="current-balance"]')).toContainText('5,000P');
    await expect(entryModal.locator('[data-testid="remaining-balance"]')).toContainText('4,000P');

    await entryModal.locator('[data-testid="confirm-entry"]').click();

    // Check success state
    await expect(memberPage.locator('[data-testid="entry-success"]')).toBeVisible();
    await expect(memberPage.locator('[data-testid="success-message"]')).toContainText('토너먼트 참가가 완료되었습니다');

    // Check tournament card shows entered state
    await expect(tournamentCard.locator('[data-testid="tournament-status"]')).toContainText('참가 중');
    await expect(tournamentCard.locator('[data-testid="leave-tournament"]')).toBeVisible();

    // Cleanup
    await databaseHelper.deleteTestTournament(tournament.id);
  });

  test('should prevent entry with insufficient points', async ({ 
    memberPage, 
    navigationHelper,
    databaseHelper 
  }) => {
    // Create tournament with high entry fee
    const tournament = await databaseHelper.createTestTournament({
      name: 'Expensive Tournament',
      entryFee: 10000,
      status: 'UPCOMING',
    });

    // Set insufficient balance
    await databaseHelper.updateUserPoints('member@zentpoker.test', 5000);

    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToTournaments();

    // Find tournament card
    const tournamentCard = memberPage.locator('[data-testid="tournament-card"]', {
      hasText: 'Expensive Tournament'
    });

    // Entry button should be disabled
    const enterButton = tournamentCard.locator('[data-testid="enter-tournament"]');
    await expect(enterButton).toBeDisabled();

    // Should show insufficient points message
    await expect(tournamentCard.locator('[data-testid="insufficient-points"]')).toBeVisible();
    await expect(tournamentCard.locator('[data-testid="insufficient-points"]')).toContainText('포인트 부족');

    // Cleanup
    await databaseHelper.deleteTestTournament(tournament.id);
  });

  test('should successfully leave tournament', async ({ 
    memberPage, 
    navigationHelper,
    databaseHelper 
  }) => {
    // Create tournament and enter user
    const tournament = await databaseHelper.createTestTournament({
      name: 'Leave Test Tournament',
      entryFee: 1000,
      status: 'UPCOMING',
    });

    const testUser = await databaseHelper.getUserByEmail('member@zentpoker.test');
    if (testUser) {
      await databaseHelper.enterUserInTournament(testUser.email, tournament.id);
    }

    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToTournaments();

    // Find tournament card
    const tournamentCard = memberPage.locator('[data-testid="tournament-card"]', {
      hasText: 'Leave Test Tournament'
    });

    // Should show leave button
    await expect(tournamentCard.locator('[data-testid="leave-tournament"]')).toBeVisible();

    // Leave tournament
    await tournamentCard.locator('[data-testid="leave-tournament"]').click();

    // Confirm leave action
    const leaveModal = memberPage.locator('[data-testid="tournament-leave-modal"]');
    await expect(leaveModal).toBeVisible();
    await leaveModal.locator('[data-testid="confirm-leave"]').click();

    // Check success state
    await expect(memberPage.locator('[data-testid="leave-success"]')).toBeVisible();
    await expect(memberPage.locator('[data-testid="success-message"]')).toContainText('토너먼트 참가가 취소되었습니다');

    // Tournament card should show entry button again
    await expect(tournamentCard.locator('[data-testid="enter-tournament"]')).toBeVisible();

    // Cleanup
    await databaseHelper.deleteTestTournament(tournament.id);
  });

  test('should show tournament details page', async ({ 
    memberPage, 
    navigationHelper,
    databaseHelper 
  }) => {
    // Create detailed tournament
    const tournament = await databaseHelper.createTestTournament({
      name: 'Detailed Tournament',
      maxParticipants: 50,
      entryFee: 2000,
      prizePool: 80000,
      status: 'UPCOMING',
    });

    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToTournaments();

    // Click on tournament card to view details
    const tournamentCard = memberPage.locator('[data-testid="tournament-card"]', {
      hasText: 'Detailed Tournament'
    });
    await tournamentCard.locator('[data-testid="view-details"]').click();

    // Should navigate to tournament details page
    await expect(memberPage).toHaveURL(new RegExp(`/tournaments/${tournament.id}`));

    // Check tournament details page
    await expect(memberPage.locator('[data-testid="tournament-details"]')).toBeVisible();
    await expect(memberPage.locator('[data-testid="tournament-title"]')).toContainText('Detailed Tournament');
    await expect(memberPage.locator('[data-testid="tournament-description"]')).toBeVisible();
    await expect(memberPage.locator('[data-testid="tournament-rules"]')).toBeVisible();
    await expect(memberPage.locator('[data-testid="participants-list"]')).toBeVisible();

    // Check tournament information
    await expect(memberPage.locator('[data-testid="max-participants"]')).toContainText('50');
    await expect(memberPage.locator('[data-testid="entry-fee-amount"]')).toContainText('2,000P');
    await expect(memberPage.locator('[data-testid="prize-pool-amount"]')).toContainText('80,000P');

    // Cleanup
    await databaseHelper.deleteTestTournament(tournament.id);
  });

  test('should filter tournaments by status', async ({ 
    memberPage, 
    navigationHelper,
    databaseHelper 
  }) => {
    // Create tournaments with different statuses
    const upcomingTournament = await databaseHelper.createTestTournament({
      name: 'Upcoming Tournament',
      status: 'UPCOMING',
    });

    const activeTournament = await databaseHelper.createTestTournament({
      name: 'Active Tournament',
      status: 'ACTIVE',
    });

    const completedTournament = await databaseHelper.createTestTournament({
      name: 'Completed Tournament',
      status: 'COMPLETED',
    });

    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToTournaments();

    // Test "All" filter
    await memberPage.locator('[data-testid="filter-all"]').click();
    await expect(memberPage.locator('[data-testid="tournament-card"]')).toHaveCount(3);

    // Test "Upcoming" filter
    await memberPage.locator('[data-testid="filter-upcoming"]').click();
    await expect(memberPage.locator('[data-testid="tournament-card"]')).toHaveCount(1);
    await expect(memberPage.locator('[data-testid="tournament-card"]')).toContainText('Upcoming Tournament');

    // Test "Active" filter
    await memberPage.locator('[data-testid="filter-active"]').click();
    await expect(memberPage.locator('[data-testid="tournament-card"]')).toHaveCount(1);
    await expect(memberPage.locator('[data-testid="tournament-card"]')).toContainText('Active Tournament');

    // Test "Completed" filter
    await memberPage.locator('[data-testid="filter-completed"]').click();
    await expect(memberPage.locator('[data-testid="tournament-card"]')).toHaveCount(1);
    await expect(memberPage.locator('[data-testid="tournament-card"]')).toContainText('Completed Tournament');

    // Cleanup
    await databaseHelper.deleteTestTournament(upcomingTournament.id);
    await databaseHelper.deleteTestTournament(activeTournament.id);
    await databaseHelper.deleteTestTournament(completedTournament.id);
  });

  test('should handle tournament entry errors', async ({ 
    memberPage, 
    navigationHelper,
    databaseHelper 
  }) => {
    const tournament = await databaseHelper.createTestTournament({
      name: 'Error Test Tournament',
      entryFee: 1000,
      status: 'UPCOMING',
    });

    await databaseHelper.updateUserPoints('member@zentpoker.test', 5000);

    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToTournaments();

    // Mock API error
    await memberPage.route(`**/api/tournaments/${tournament.id}/enter`, route => {
      route.fulfill({
        status: 400,
        body: JSON.stringify({
          error: '토너먼트 참가에 실패했습니다'
        }),
      });
    });

    // Attempt to enter tournament
    const tournamentCard = memberPage.locator('[data-testid="tournament-card"]', {
      hasText: 'Error Test Tournament'
    });
    await tournamentCard.locator('[data-testid="enter-tournament"]').click();
    await memberPage.locator('[data-testid="confirm-entry"]').click();

    // Check error handling
    await expect(memberPage.locator('[data-testid="entry-error"]')).toBeVisible();
    await expect(memberPage.locator('[data-testid="error-message"]')).toContainText('토너먼트 참가에 실패했습니다');

    // Cleanup
    await databaseHelper.deleteTestTournament(tournament.id);
  });

  test('should prevent entry to full tournaments', async ({ 
    memberPage, 
    navigationHelper,
    databaseHelper 
  }) => {
    const tournament = await databaseHelper.createTestTournament({
      name: 'Full Tournament',
      maxParticipants: 1,
      entryFee: 1000,
      status: 'UPCOMING',
    });

    // Fill tournament to capacity
    const dummyUser = await databaseHelper.createTestUser({
      email: 'dummy@zentpoker.test',
      points: 5000,
    });
    await databaseHelper.enterUserInTournament(dummyUser.email, tournament.id);

    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToTournaments();

    // Tournament should show as full
    const tournamentCard = memberPage.locator('[data-testid="tournament-card"]', {
      hasText: 'Full Tournament'
    });

    await expect(tournamentCard.locator('[data-testid="tournament-full"]')).toBeVisible();
    await expect(tournamentCard.locator('[data-testid="tournament-full"]')).toContainText('만석');
    await expect(tournamentCard.locator('[data-testid="enter-tournament"]')).toBeDisabled();

    // Cleanup
    await databaseHelper.deleteTestUser(dummyUser.email);
    await databaseHelper.deleteTestTournament(tournament.id);
  });

  test('should show participants count correctly', async ({ 
    memberPage, 
    navigationHelper,
    databaseHelper 
  }) => {
    const tournament = await databaseHelper.createTestTournament({
      name: 'Participants Tournament',
      maxParticipants: 10,
      entryFee: 1000,
      status: 'UPCOMING',
    });

    // Add some participants
    const participants = await Promise.all([
      databaseHelper.createTestUser({ email: 'participant1@zentpoker.test' }),
      databaseHelper.createTestUser({ email: 'participant2@zentpoker.test' }),
      databaseHelper.createTestUser({ email: 'participant3@zentpoker.test' }),
    ]);

    for (const participant of participants) {
      await databaseHelper.enterUserInTournament(participant.email, tournament.id);
    }

    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToTournaments();

    // Check participants count
    const tournamentCard = memberPage.locator('[data-testid="tournament-card"]', {
      hasText: 'Participants Tournament'
    });

    await expect(tournamentCard.locator('[data-testid="participants-count"]')).toContainText('3/10');

    // Cleanup
    for (const participant of participants) {
      await databaseHelper.deleteTestUser(participant.email);
    }
    await databaseHelper.deleteTestTournament(tournament.id);
  });

  test('should handle network errors during tournament operations', async ({ 
    memberPage, 
    navigationHelper,
    databaseHelper 
  }) => {
    const tournament = await databaseHelper.createTestTournament({
      name: 'Network Error Tournament',
      entryFee: 1000,
      status: 'UPCOMING',
    });

    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToTournaments();

    // Mock network failure
    await memberPage.route('**/api/tournaments/**', route => {
      route.abort();
    });

    // Try to enter tournament
    const tournamentCard = memberPage.locator('[data-testid="tournament-card"]', {
      hasText: 'Network Error Tournament'
    });
    await tournamentCard.locator('[data-testid="enter-tournament"]').click();
    await memberPage.locator('[data-testid="confirm-entry"]').click();

    // Should show network error
    await expect(memberPage.locator('[data-testid="network-error"]')).toBeVisible();
    await expect(memberPage.locator('[data-testid="error-message"]')).toContainText('네트워크 오류');

    // Cleanup
    await databaseHelper.deleteTestTournament(tournament.id);
  });
});