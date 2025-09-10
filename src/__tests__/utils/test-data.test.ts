import { 
  UserFactory, 
  TransactionFactory, 
  PaymentFactory,
  VoucherFactory,
  TournamentFactory,
  TestDataGenerator,
  SEED_DATA,
} from '../../../tests/utils/test-data';

describe('Test Data Factories', () => {
  describe('UserFactory', () => {
    test('should create a basic user', () => {
      const user = UserFactory.build();

      expect(user).toMatchObject({
        id: expect.any(String),
        email: expect.stringMatching(/^.+@.+\..+$/),
        name: expect.any(String),
        role: 'USER',
        tier: expect.any(String),
        status: 'ACTIVE',
        points: expect.any(Number),
        image: expect.any(String),
        emailVerified: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      expect(['GUEST', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM']).toContain(user.tier);
      expect(user.points).toBeGreaterThanOrEqual(0);
      expect(user.points).toBeLessThanOrEqual(100000);
    });

    test('should create user with overrides', () => {
      const customEmail = 'custom@test.com';
      const customPoints = 50000;
      
      const user = UserFactory.build({
        email: customEmail,
        points: customPoints,
      });

      expect(user.email).toBe(customEmail);
      expect(user.points).toBe(customPoints);
    });

    test('should create different tier users', () => {
      const guestUser = UserFactory.guest();
      const bronzeUser = UserFactory.bronze();
      const silverUser = UserFactory.silver();
      const goldUser = UserFactory.gold();
      const platinumUser = UserFactory.platinum();
      const adminUser = UserFactory.admin();

      expect(guestUser.tier).toBe('GUEST');
      expect(guestUser.points).toBe(0);

      expect(bronzeUser.tier).toBe('BRONZE');
      expect(bronzeUser.points).toBeGreaterThanOrEqual(1000);

      expect(silverUser.tier).toBe('SILVER');
      expect(silverUser.points).toBeGreaterThanOrEqual(25000);

      expect(goldUser.tier).toBe('GOLD');
      expect(goldUser.points).toBeGreaterThanOrEqual(50000);

      expect(platinumUser.tier).toBe('PLATINUM');
      expect(platinumUser.points).toBeGreaterThanOrEqual(100000);

      expect(adminUser.role).toBe('ADMIN');
      expect(adminUser.tier).toBe('PLATINUM');
    });
  });

  describe('TransactionFactory', () => {
    test('should create a basic transaction', () => {
      const transaction = TransactionFactory.build();

      expect(transaction).toMatchObject({
        id: expect.any(String),
        userId: expect.any(String),
        type: expect.any(String),
        amount: expect.any(Number),
        status: expect.any(String),
        description: expect.any(String),
        metadata: expect.any(Object),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      expect(['CHARGE', 'USE', 'REFUND']).toContain(transaction.type);
      expect(['PENDING', 'COMPLETED', 'FAILED']).toContain(transaction.status);
      expect(transaction.amount).toBeGreaterThanOrEqual(1000);
    });

    test('should create specific transaction types', () => {
      const chargeTransaction = TransactionFactory.charge();
      const useTransaction = TransactionFactory.use();
      const refundTransaction = TransactionFactory.refund();

      expect(chargeTransaction.type).toBe('CHARGE');
      expect(chargeTransaction.status).toBe('COMPLETED');
      expect(chargeTransaction.description).toBe('포인트 충전');

      expect(useTransaction.type).toBe('USE');
      expect(refundTransaction.type).toBe('REFUND');
    });
  });

  describe('PaymentFactory', () => {
    test('should create a basic payment', () => {
      const payment = PaymentFactory.build();

      expect(payment).toMatchObject({
        id: expect.any(String),
        userId: expect.any(String),
        transactionId: expect.any(String),
        amount: expect.any(Number),
        method: expect.any(String),
        status: expect.any(String),
        metadata: expect.any(Object),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      expect(['KAKAO_PAY', 'CARD', 'BANK_TRANSFER']).toContain(payment.method);
      expect(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']).toContain(payment.status);
    });

    test('should create KakaoPay payment with specific metadata', () => {
      const kakaoPayment = PaymentFactory.kakaoPay();

      expect(kakaoPayment.method).toBe('KAKAO_PAY');
      expect(kakaoPayment.metadata).toMatchObject({
        paymentKey: expect.any(String),
        orderId: expect.any(String),
        tid: expect.stringMatching(/^T\d{10}$/),
        cid: 'TC0ONETIME',
      });
    });
  });

  describe('VoucherFactory', () => {
    test('should create a basic voucher', () => {
      const voucher = VoucherFactory.build();

      expect(voucher).toMatchObject({
        id: expect.any(String),
        name: expect.stringContaining('바우처'),
        description: expect.any(String),
        tier: expect.any(String),
        price: expect.any(Number),
        duration: expect.any(Number),
        isActive: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      expect(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']).toContain(voucher.tier);
    });

    test('should create specific tier vouchers', () => {
      const bronzeVoucher = VoucherFactory.bronze();
      const silverVoucher = VoucherFactory.silver();

      expect(bronzeVoucher.tier).toBe('BRONZE');
      expect(bronzeVoucher.price).toBe(25000);
      expect(bronzeVoucher.name).toBe('브론즈 바우처');

      expect(silverVoucher.tier).toBe('SILVER');
      expect(silverVoucher.price).toBe(45000);
      expect(silverVoucher.name).toBe('실버 바우처');
    });
  });

  describe('TournamentFactory', () => {
    test('should create a basic tournament', () => {
      const tournament = TournamentFactory.build();

      expect(tournament).toMatchObject({
        id: expect.any(String),
        name: expect.stringContaining('토너먼트'),
        description: expect.any(String),
        entryFee: expect.any(Number),
        maxParticipants: expect.any(Number),
        currentParticipants: expect.any(Number),
        status: expect.any(String),
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        rules: expect.any(String),
        prizes: expect.objectContaining({
          first: expect.any(Number),
          second: expect.any(Number),
          third: expect.any(Number),
        }),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      expect(['SCHEDULED', 'ONGOING', 'COMPLETED']).toContain(tournament.status);
    });

    test('should create tournaments with specific status', () => {
      const scheduledTournament = TournamentFactory.scheduled();
      const ongoingTournament = TournamentFactory.ongoing();
      const completedTournament = TournamentFactory.completed();

      expect(scheduledTournament.status).toBe('SCHEDULED');
      expect(ongoingTournament.status).toBe('ONGOING');
      expect(completedTournament.status).toBe('COMPLETED');

      expect(scheduledTournament.startDate.getTime()).toBeGreaterThan(Date.now());
      expect(ongoingTournament.startDate.getTime()).toBeLessThan(Date.now());
      expect(completedTournament.endDate.getTime()).toBeLessThan(Date.now());
    });
  });

  describe('TestDataGenerator', () => {
    test('should generate multiple users', () => {
      const users = TestDataGenerator.users(5);

      expect(users).toHaveLength(5);
      expect(users[0]).toMatchObject({
        id: expect.any(String),
        email: expect.any(String),
        name: expect.any(String),
      });
    });

    test('should generate complete user profile', () => {
      const profile = TestDataGenerator.completeUserProfile();

      expect(profile).toMatchObject({
        user: expect.objectContaining({
          id: expect.any(String),
          email: expect.any(String),
        }),
        account: expect.objectContaining({
          provider: 'google',
          userId: profile.user.id,
        }),
        session: expect.objectContaining({
          userId: profile.user.id,
          sessionToken: expect.any(String),
        }),
      });
    });

    test('should generate tournament with participants', () => {
      const { tournament, participants } = TestDataGenerator.tournamentWithParticipants(5);

      expect(tournament.currentParticipants).toBe(5);
      expect(participants).toHaveLength(5);
      expect(participants[0].tournamentId).toBe(tournament.id);
    });
  });

  describe('SEED_DATA', () => {
    test('should provide predefined test users', () => {
      expect(SEED_DATA.USERS.GUEST.tier).toBe('GUEST');
      expect(SEED_DATA.USERS.BRONZE.tier).toBe('BRONZE');
      expect(SEED_DATA.USERS.ADMIN.role).toBe('ADMIN');
      expect(SEED_DATA.USERS.SUSPENDED.status).toBe('SUSPENDED');
    });

    test('should provide predefined vouchers', () => {
      expect(SEED_DATA.VOUCHERS.BRONZE.tier).toBe('BRONZE');
      expect(SEED_DATA.VOUCHERS.SILVER.tier).toBe('SILVER');
      expect(SEED_DATA.VOUCHERS.GOLD.tier).toBe('GOLD');
      expect(SEED_DATA.VOUCHERS.PLATINUM.tier).toBe('PLATINUM');
    });

    test('should provide predefined tournaments', () => {
      expect(SEED_DATA.TOURNAMENTS.SCHEDULED.status).toBe('SCHEDULED');
      expect(SEED_DATA.TOURNAMENTS.ONGOING.status).toBe('ONGOING');
      expect(SEED_DATA.TOURNAMENTS.COMPLETED.status).toBe('COMPLETED');
      expect(SEED_DATA.TOURNAMENTS.FULL.currentParticipants).toBe(SEED_DATA.TOURNAMENTS.FULL.maxParticipants);
    });
  });
});