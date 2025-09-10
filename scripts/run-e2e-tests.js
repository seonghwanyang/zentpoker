#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n${colors.bold}🚀 ${description}${colors.reset}`, 'cyan');
  log(`Command: ${command}`, 'blue');
  
  const startTime = Date.now();
  
  try {
    execSync(command, { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'test' }
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`✅ ${description} completed in ${duration}s`, 'green');
    return true;
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`❌ ${description} failed after ${duration}s`, 'red');
    return false;
  }
}

function checkPrerequisites() {
  log('\n🔍 Checking prerequisites...', 'yellow');
  
  // Check if .env.test exists
  const envTestPath = path.join(process.cwd(), '.env.test');
  if (!fs.existsSync(envTestPath)) {
    log('❌ .env.test file not found. Please create it first.', 'red');
    log('Copy .env.local.template to .env.test and configure test database settings.', 'yellow');
    return false;
  }
  
  // Check if Playwright browsers are installed
  try {
    execSync('npx playwright --version', { stdio: 'pipe' });
    log('✅ Playwright is installed', 'green');
  } catch (error) {
    log('❌ Playwright not found. Run: npm install @playwright/test', 'red');
    return false;
  }
  
  return true;
}

async function main() {
  log(`${colors.bold}${colors.magenta}
╔══════════════════════════════════════════════╗
║          ZentPoker E2E Test Suite           ║
║              Comprehensive Testing          ║
╚══════════════════════════════════════════════╝
${colors.reset}`);

  const args = process.argv.slice(2);
  const options = {
    skipSetup: args.includes('--skip-setup'),
    category: args.find(arg => arg.startsWith('--category='))?.split('=')[1],
    browser: args.find(arg => arg.startsWith('--browser='))?.split('=')[1],
    headed: args.includes('--headed'),
    debug: args.includes('--debug'),
    help: args.includes('--help') || args.includes('-h'),
  };

  if (options.help) {
    log(`
Usage: node scripts/run-e2e-tests.js [options]

Options:
  --skip-setup              Skip database setup
  --category=<category>     Run specific test category (auth|payment|tournament|admin|performance|a11y)
  --browser=<browser>       Run on specific browser project
  --headed                  Run tests in headed mode
  --debug                   Run tests in debug mode
  --help, -h               Show this help message

Examples:
  node scripts/run-e2e-tests.js
  node scripts/run-e2e-tests.js --category=auth
  node scripts/run-e2e-tests.js --browser="Desktop Chrome" --headed
  node scripts/run-e2e-tests.js --category=performance --skip-setup
`, 'cyan');
    return;
  }

  // Check prerequisites
  if (!checkPrerequisites()) {
    process.exit(1);
  }

  const results = {
    setup: true,
    categories: {},
    startTime: Date.now(),
  };

  // Setup phase
  if (!options.skipSetup) {
    log('\n📋 Setting up test environment...', 'yellow');
    
    const setupSteps = [
      { cmd: 'npm run db:test:reset', desc: 'Reset test database' },
      { cmd: 'npm run db:test:migrate', desc: 'Run database migrations' },
      { cmd: 'npm run db:test:seed', desc: 'Seed test database' },
    ];

    for (const step of setupSteps) {
      if (!runCommand(step.cmd, step.desc)) {
        results.setup = false;
        break;
      }
    }

    if (!results.setup) {
      log('\n❌ Setup failed. Cannot proceed with tests.', 'red');
      process.exit(1);
    }
  }

  // Test execution
  const testCategories = [
    { name: 'auth', desc: '🔐 Authentication Tests', cmd: 'npm run test:e2e:auth' },
    { name: 'payment', desc: '💳 Payment Flow Tests', cmd: 'npm run test:e2e:payment' },
    { name: 'tournament', desc: '🏆 Tournament Tests', cmd: 'npm run test:e2e:tournament' },
    { name: 'admin', desc: '👨‍💼 Admin Panel Tests', cmd: 'npm run test:e2e:admin' },
    { name: 'performance', desc: '⚡ Performance Tests', cmd: 'npm run test:e2e:performance' },
    { name: 'a11y', desc: '♿ Accessibility Tests', cmd: 'npm run test:e2e:a11y' },
  ];

  // Filter categories if specific category requested
  const categoriesToRun = options.category 
    ? testCategories.filter(cat => cat.name === options.category)
    : testCategories;

  if (categoriesToRun.length === 0) {
    log(`❌ Unknown category: ${options.category}`, 'red');
    log(`Available categories: ${testCategories.map(c => c.name).join(', ')}`, 'yellow');
    process.exit(1);
  }

  // Modify commands for browser/headed/debug options
  for (const category of categoriesToRun) {
    let cmd = category.cmd;
    
    if (options.browser) {
      cmd = cmd.replace('playwright test', `playwright test --project="${options.browser}"`);
    }
    
    if (options.headed) {
      cmd = cmd.replace('playwright test', 'playwright test --headed');
    }
    
    if (options.debug) {
      cmd = cmd.replace('playwright test', 'playwright test --debug');
    }

    const success = runCommand(cmd, category.desc);
    results.categories[category.name] = success;
  }

  // Summary report
  const totalTime = ((Date.now() - results.startTime) / 1000 / 60).toFixed(2);
  
  log(`\n${colors.bold}📊 Test Execution Summary${colors.reset}`, 'cyan');
  log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'cyan');
  
  const passed = Object.values(results.categories).filter(Boolean).length;
  const total = Object.keys(results.categories).length;
  
  log(`⏱️  Total execution time: ${totalTime} minutes`, 'blue');
  log(`📈 Test categories: ${passed}/${total} passed`, passed === total ? 'green' : 'yellow');
  
  for (const [category, success] of Object.entries(results.categories)) {
    const status = success ? '✅' : '❌';
    const color = success ? 'green' : 'red';
    const categoryInfo = testCategories.find(c => c.name === category);
    log(`${status} ${categoryInfo?.desc || category}`, color);
  }

  if (passed === total) {
    log('\n🎉 All tests passed successfully!', 'green');
    
    // Show report command
    log('\n📋 View detailed HTML report:', 'cyan');
    log('npm run test:e2e:report', 'blue');
    
    process.exit(0);
  } else {
    log(`\n⚠️  ${total - passed} test categor${total - passed === 1 ? 'y' : 'ies'} failed`, 'yellow');
    
    // Show debugging tips
    log('\n🔧 Debugging tips:', 'cyan');
    log('• Run failed tests individually: npm run test:e2e:<category>', 'yellow');
    log('• Use headed mode: npm run test:e2e:<category> -- --headed', 'yellow');
    log('• Use debug mode: npm run test:e2e:<category> -- --debug', 'yellow');
    log('• Check logs in test-results/ directory', 'yellow');
    
    process.exit(1);
  }
}

// Handle process interruption
process.on('SIGINT', () => {
  log('\n\n⚠️  Test execution interrupted by user', 'yellow');
  process.exit(130);
});

process.on('SIGTERM', () => {
  log('\n\n⚠️  Test execution terminated', 'yellow');
  process.exit(143);
});

// Run the main function
main().catch(error => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});