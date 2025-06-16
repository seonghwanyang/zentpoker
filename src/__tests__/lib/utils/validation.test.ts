import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateChargeAmount,
  validateRebuyAmount,
  sanitizeString,
  sanitizePhone,
} from '@/lib/utils/validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email format', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.kr')).toBe(true);
    });

    it('should reject invalid email format', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should validate correct phone format', () => {
      expect(validatePhone('010-1234-5678')).toBe(true);
    });

    it('should reject invalid phone format', () => {
      expect(validatePhone('010-123-4567')).toBe(false);
      expect(validatePhone('02-1234-5678')).toBe(false);
      expect(validatePhone('010-12345-678')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      expect(validatePassword('password123')).toBe(true);
      expect(validatePassword('MyPassword1')).toBe(true);
    });

    it('should reject weak password', () => {
      expect(validatePassword('123456')).toBe(false); // 너무 짧음
      expect(validatePassword('password')).toBe(false); // 숫자 없음
      expect(validatePassword('12345678')).toBe(false); // 영문 없음
    });
  });

  describe('validateChargeAmount', () => {
    it('should validate correct member charge amount', () => {
      const result = validateChargeAmount(25000, 'MEMBER');
      expect(result.isValid).toBe(true);
    });

    it('should validate correct guest charge amount', () => {
      const result = validateChargeAmount(30000, 'GUEST');
      expect(result.isValid).toBe(true);
    });

    it('should reject incorrect member charge amount', () => {
      const result = validateChargeAmount(20000, 'MEMBER');
      expect(result.isValid).toBe(false);
      expect(result.expectedAmount).toBe(25000);
      expect(result.message).toContain('정회원');
    });

    it('should reject incorrect guest charge amount', () => {
      const result = validateChargeAmount(25000, 'GUEST');
      expect(result.isValid).toBe(false);
      expect(result.expectedAmount).toBe(30000);
      expect(result.message).toContain('게스트');
    });
  });

  describe('validateRebuyAmount', () => {
    it('should validate correct rebuy amount', () => {
      const result = validateRebuyAmount(15000);
      expect(result.isValid).toBe(true);
    });

    it('should reject incorrect rebuy amount', () => {
      const result = validateRebuyAmount(10000);
      expect(result.isValid).toBe(false);
      expect(result.expectedAmount).toBe(15000);
      expect(result.message).toContain('리바인권');
    });
  });

  describe('sanitizeString', () => {
    it('should trim and normalize whitespace', () => {
      expect(sanitizeString('  hello   world  ')).toBe('hello world');
      expect(sanitizeString('test\n\nstring')).toBe('test string');
    });

    it('should handle empty string', () => {
      expect(sanitizeString('   ')).toBe('');
    });
  });

  describe('sanitizePhone', () => {
    it('should format Korean phone number correctly', () => {
      expect(sanitizePhone('01012345678')).toBe('010-1234-5678');
      expect(sanitizePhone('010-1234-5678')).toBe('010-1234-5678');
      expect(sanitizePhone('010 1234 5678')).toBe('010-1234-5678');
    });

    it('should return original string for invalid format', () => {
      expect(sanitizePhone('02-1234-5678')).toBe('0212345678');
      expect(sanitizePhone('invalid')).toBe('');
    });
  });
});