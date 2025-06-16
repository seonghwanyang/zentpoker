const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Next.js 앱의 경로를 지정합니다.
  dir: './',
});

// Jest에 전달할 커스텀 설정을 추가합니다.
const customJestConfig = {
  // 각 테스트 실행 전에 실행할 파일들
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // 모듈 이름 매핑 (Next.js의 절대 경로 import 지원)
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // 테스트 환경
  testEnvironment: 'jsdom',
  
  // 테스트 파일 패턴
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  
  // 커버리지 수집 대상
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/types/**/*',
    '!src/**/index.{js,jsx,ts,tsx}',
  ],
  
  // 커버리지 임계값
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // 무시할 패턴
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],
  
  // 변환 무시 패턴
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  
  // 모듈 변환
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  
  // 모듈 파일 확장자
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // 전역 설정
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx',
      },
    },
  },
  
  // 테스트 타임아웃
  testTimeout: 30000,
  
  // 최대 동시 실행 수
  maxWorkers: '50%',
  
  // 캐시 디렉토리
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // 리포터 설정
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './test-results',
        outputName: 'junit.xml',
      },
    ],
  ],
  
  // 모의(Mock) 설정
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
};

// createJestConfig는 async이므로 이를 내보내서 Jest가 적절히 처리할 수 있도록 합니다.
module.exports = createJestConfig(customJestConfig);