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
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.kr',
        'user+tag@example.org',
        'user_123@subdomain.example.com',
        'test.email+category@example-domain.com',
        'firstname-lastname@domain.com',
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email format', () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@example.com',
        'test@.com',
        'test.@example.com',
        'test..test@example.com',
        'test@example',
        'test@example.',
        '',
        'test @example.com', // space
        'test@example .com', // space
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(validateEmail(null as any)).toBe(false);
      expect(validateEmail(undefined as any)).toBe(false);
      expect(validateEmail(123 as any)).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should validate correct phone format', () => {
      const validPhones = [
        '010-1234-5678',
        '010-9999-0000',
        '010-0000-1111',
      ];

      validPhones.forEach(phone => {
        expect(validatePhone(phone)).toBe(true);
      });
    });

    it('should reject invalid phone format', () => {
      const invalidPhones = [
        '010-123-4567',    // wrong format
        '02-1234-5678',    // landline
        '010-12345-678',   // wrong format
        '011-1234-5678',   // old format
        '019-1234-5678',   // old format
        '010 1234 5678',   // spaces
        '010.1234.5678',   // dots
        '01012345678',     // no separators
        '',
        '123-456-789',
      ];

      invalidPhones.forEach(phone => {
        expect(validatePhone(phone)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(validatePhone(null as any)).toBe(false);
      expect(validatePhone(undefined as any)).toBe(false);
      expect(validatePhone(123 as any)).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const validPasswords = [
        'password123',
        'MyPassword1',
        'StrongPass99',
        'testPassword2024',
        'HelloWorld123',
      ];

      validPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(true);
      });
    });

    it('should reject weak password', () => {
      const invalidPasswords = [
        '123456',        // 너무 짧음
        'password',      // 숫자 없음
        '12345678',      // 영문 없음
        'pass1',         // 너무 짧음
        'PASSWORD123',   // 소문자 없음
        'password',      // 숫자 없음
        '',              // 빈 문자열
        '1234567',       // 영문 없고 짧음
      ];

      invalidPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(validatePassword(null as any)).toBe(false);
      expect(validatePassword(undefined as any)).toBe(false);
      expect(validatePassword(123 as any)).toBe(false);
    });

    it('should require minimum length', () => {
      // Test passwords with different lengths
      expect(validatePassword('a1')).toBe(false);      // 2 chars
      expect(validatePassword('ab1')).toBe(false);     // 3 chars
      expect(validatePassword('abc1')).toBe(false);    // 4 chars
      expect(validatePassword('abcd1')).toBe(false);   // 5 chars
      expect(validatePassword('abcde1')).toBe(false);  // 6 chars
      expect(validatePassword('abcdef1')).toBe(false); // 7 chars
      expect(validatePassword('abcdef12')).toBe(true); // 8 chars
    });
  });

  describe('validateChargeAmount', () => {
    it('should validate correct member charge amount', () => {
      const result = validateChargeAmount(25000, 'MEMBER');
      expect(result.isValid).toBe(true);
      expect(result.message).toBeUndefined();
      expect(result.expectedAmount).toBe(25000);
    });

    it('should validate correct guest charge amount', () => {
      const result = validateChargeAmount(30000, 'GUEST');
      expect(result.isValid).toBe(true);
      expect(result.message).toBeUndefined();
      expect(result.expectedAmount).toBe(30000);
    });

    it('should reject incorrect member charge amount', () => {
      const invalidAmounts = [20000, 30000, 15000, 50000, 0, -25000];
      
      invalidAmounts.forEach(amount => {
        const result = validateChargeAmount(amount, 'MEMBER');
        expect(result.isValid).toBe(false);
        expect(result.expectedAmount).toBe(25000);
        expect(result.message).toContain('정회원');
        expect(result.message).toContain('25,000원');
      });
    });

    it('should reject incorrect guest charge amount', () => {
      const invalidAmounts = [25000, 20000, 15000, 40000, 0, -30000];
      
      invalidAmounts.forEach(amount => {
        const result = validateChargeAmount(amount, 'GUEST');
        expect(result.isValid).toBe(false);
        expect(result.expectedAmount).toBe(30000);
        expect(result.message).toContain('게스트');
        expect(result.message).toContain('30,000원');
      });
    });

    it('should handle invalid user types', () => {
      const result = validateChargeAmount(25000, 'INVALID' as any);
      expect(result.isValid).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('should handle edge cases', () => {
      // Test null/undefined amounts
      expect(validateChargeAmount(null as any, 'MEMBER').isValid).toBe(false);
      expect(validateChargeAmount(undefined as any, 'MEMBER').isValid).toBe(false);
      
      // Test null/undefined user types
      expect(validateChargeAmount(25000, null as any).isValid).toBe(false);
      expect(validateChargeAmount(25000, undefined as any).isValid).toBe(false);
    });
  });

  describe('validateRebuyAmount', () => {
    it('should validate correct rebuy amount', () => {
      const result = validateRebuyAmount(15000);
      expect(result.isValid).toBe(true);
      expect(result.message).toBeUndefined();
      expect(result.expectedAmount).toBe(15000);
    });

    it('should reject incorrect rebuy amounts', () => {
      const invalidAmounts = [10000, 20000, 5000, 25000, 0, -15000];
      
      invalidAmounts.forEach(amount => {
        const result = validateRebuyAmount(amount);
        expect(result.isValid).toBe(false);
        expect(result.expectedAmount).toBe(15000);
        expect(result.message).toContain('리바인권');
        expect(result.message).toContain('15,000원');
      });
    });

    it('should handle edge cases', () => {
      expect(validateRebuyAmount(null as any).isValid).toBe(false);
      expect(validateRebuyAmount(undefined as any).isValid).toBe(false);
      expect(validateRebuyAmount('15000' as any).isValid).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should trim and normalize whitespace', () => {
      expect(sanitizeString('  hello   world  ')).toBe('hello world');
      expect(sanitizeString('test\n\nstring')).toBe('test string');
      expect(sanitizeString('tab\t\ttab')).toBe('tab tab');
      expect(sanitizeString('mixed\n \t\r\nwhitespace')).toBe('mixed whitespace');
    });

    it('should handle empty and whitespace-only strings', () => {
      expect(sanitizeString('   ')).toBe('');
      expect(sanitizeString('')).toBe('');
      expect(sanitizeString('\n\t\r')).toBe('');
    });

    it('should preserve single spaces between words', () => {
      expect(sanitizeString('normal text')).toBe('normal text');
      expect(sanitizeString('single space')).toBe('single space');
    });

    it('should handle special characters', () => {
      expect(sanitizeString('  hello@world.com  ')).toBe('hello@world.com');
      expect(sanitizeString('  test-string_123  ')).toBe('test-string_123');
    });

    it('should handle edge cases', () => {
      expect(sanitizeString(null as any)).toBe('');
      expect(sanitizeString(undefined as any)).toBe('');
      expect(sanitizeString(123 as any)).toBe('123');
    });
  });

  describe('sanitizePhone', () => {
    it('should format Korean phone number correctly', () => {
      const testCases = [
        { input: '01012345678', expected: '010-1234-5678' },
        { input: '010-1234-5678', expected: '010-1234-5678' },
        { input: '010 1234 5678', expected: '010-1234-5678' },
        { input: '010.1234.5678', expected: '010-1234-5678' },
        { input: '010/1234/5678', expected: '010-1234-5678' },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(sanitizePhone(input)).toBe(expected);
      });
    });

    it('should handle invalid formats', () => {
      const invalidInputs = [
        '02-1234-5678',    // landline
        '011-1234-5678',   // old mobile
        '019-1234-5678',   // old mobile
        '010-123-4567',    // wrong length
        '010-12345-678',   // wrong format
        'invalid',         // non-numeric
        '123456789',       // too short
        '01012345678901',  // too long
        '',                // empty
      ];

      invalidInputs.forEach(input => {
        const result = sanitizePhone(input);
        expect(result).not.toBe('010-1234-5678'); // Should not format to valid pattern
      });
    });

    it('should preserve already formatted numbers', () => {
      const alreadyFormatted = '010-9876-5432';
      expect(sanitizePhone(alreadyFormatted)).toBe(alreadyFormatted);
    });

    it('should handle edge cases', () => {
      expect(sanitizePhone(null as any)).toBe('');
      expect(sanitizePhone(undefined as any)).toBe('');
      expect(sanitizePhone(123 as any)).toBe('');
    });

    it('should remove non-numeric characters except format separators', () => {
      expect(sanitizePhone('010-1234-5678abc')).not.toBe('010-1234-5678');
      expect(sanitizePhone('abc010-1234-5678')).not.toBe('010-1234-5678');
      expect(sanitizePhone('010-abc1234-5678')).not.toBe('010-1234-5678');
    });
  });

  describe('Integration tests', () => {
    it('should work together in user registration scenario', () => {
      const userInput = {
        email: '  test@example.com  ',
        phone: '010 1234 5678',
        password: 'MyPassword123',
      };

      // Sanitize inputs
      const cleanEmail = sanitizeString(userInput.email);
      const cleanPhone = sanitizePhone(userInput.phone);
      const cleanPassword = sanitizeString(userInput.password);

      // Validate sanitized inputs
      expect(validateEmail(cleanEmail)).toBe(true);
      expect(validatePhone(cleanPhone)).toBe(true);
      expect(validatePassword(cleanPassword)).toBe(true);

      expect(cleanEmail).toBe('test@example.com');
      expect(cleanPhone).toBe('010-1234-5678');
      expect(cleanPassword).toBe('MyPassword123');
    });

    it('should handle charge validation in payment flow', () => {
      const memberCharge = validateChargeAmount(25000, 'MEMBER');
      const guestCharge = validateChargeAmount(30000, 'GUEST');
      const rebuyCharge = validateRebuyAmount(15000);

      expect(memberCharge.isValid).toBe(true);
      expect(guestCharge.isValid).toBe(true);
      expect(rebuyCharge.isValid).toBe(true);

      // Invalid amounts should provide helpful messages
      const invalidMember = validateChargeAmount(20000, 'MEMBER');
      expect(invalidMember.isValid).toBe(false);
      expect(invalidMember.message).toBeTruthy();
      expect(invalidMember.expectedAmount).toBe(25000);
    });

    it('should maintain data consistency through sanitization and validation', () => {
      const inputs = [
        '  contaminated@email.com  ',
        '010 9999 0000',
        '  MySecurePassword123  ',
      ];

      const sanitized = inputs.map(input => sanitizeString(input));
      
      expect(sanitized[0]).toBe('contaminated@email.com');
      expect(sanitized[2]).toBe('MySecurePassword123');
      
      expect(validateEmail(sanitized[0])).toBe(true);
      expect(validatePassword(sanitized[2])).toBe(true);
      
      const sanitizedPhone = sanitizePhone(inputs[1]);
      expect(sanitizedPhone).toBe('010-9999-0000');
      expect(validatePhone(sanitizedPhone)).toBe(true);
    });
  });
});