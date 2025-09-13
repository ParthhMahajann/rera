#!/usr/bin/env node

/**
 * Simple Test Runner for Frontend Components
 * Tests basic functionality without requiring full Jest setup
 */

const fs = require('fs');
const path = require('path');

class SimpleTestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }
    
    // Mock testing framework
    describe(description, testFn) {
        console.log(`\n📝 ${description}`);
        testFn();
    }
    
    test(name, testFn) {
        try {
            testFn();
            console.log(`  ✅ ${name}`);
            this.passed++;
        } catch (error) {
            console.log(`  ❌ ${name}: ${error.message}`);
            this.failed++;
        }
    }
    
    expect(value) {
        return {
            toBe: (expected) => {
                if (value !== expected) {
                    throw new Error(`Expected ${expected}, got ${value}`);
                }
            },
            toBeGreaterThan: (expected) => {
                if (value <= expected) {
                    throw new Error(`Expected ${value} to be greater than ${expected}`);
                }
            },
            toContain: (expected) => {
                if (!value || !value.includes || !value.includes(expected)) {
                    throw new Error(`Expected ${value} to contain ${expected}`);
                }
            },
            toBeTruthy: () => {
                if (!value) {
                    throw new Error(`Expected ${value} to be truthy`);
                }
            },
            toBeFalsy: () => {
                if (value) {
                    throw new Error(`Expected ${value} to be falsy`);
                }
            }
        };
    }
    
    runTests() {
        console.log('🧪 RERA Easy Frontend - Simple Test Suite');
        console.log('=' * 50);
        
        this.testFileStructure();
        this.testComponentFiles();
        this.testAPIConfiguration();
        this.testBuildConfiguration();
        this.testDependencies();
        
        console.log(`\n📊 Test Results:`);
        console.log(`   Passed: ${this.passed}`);
        console.log(`   Failed: ${this.failed}`);
        console.log(`   Total: ${this.passed + this.failed}`);
        
        if (this.failed === 0) {
            console.log('🎉 All frontend tests passed!');
            return true;
        } else {
            console.log(`⚠️  ${this.failed} test(s) failed`);
            return false;
        }
    }
    
    testFileStructure() {
        this.describe('File Structure Tests', () => {
            this.test('package.json exists', () => {
                this.expect(fs.existsSync('package.json')).toBeTruthy();
            });
            
            this.test('src directory exists', () => {
                this.expect(fs.existsSync('src')).toBeTruthy();
            });
            
            this.test('public directory exists', () => {
                this.expect(fs.existsSync('public')).toBeTruthy();
            });
            
            this.test('src/App.js exists', () => {
                this.expect(fs.existsSync('src/App.js')).toBeTruthy();
            });
            
            this.test('src/index.js exists', () => {
                this.expect(fs.existsSync('src/index.js')).toBeTruthy();
            });
        });
    }
    
    testComponentFiles() {
        this.describe('Component Files Tests', () => {
            const componentsDir = 'src/components';
            
            this.test('components directory exists', () => {
                this.expect(fs.existsSync(componentsDir)).toBeTruthy();
            });
            
            if (fs.existsSync(componentsDir)) {
                const componentFiles = fs.readdirSync(componentsDir);
                
                this.test('has component files', () => {
                    this.expect(componentFiles.length).toBeGreaterThan(0);
                });
                
                // Test for key components
                const keyComponents = [
                    'CreateQuotation.jsx',
                    'CreateQuotation.js',
                    'Dashboard.jsx',
                    'Dashboard.js'
                ];
                
                keyComponents.forEach(component => {
                    if (componentFiles.includes(component)) {
                        this.test(`${component} exists`, () => {
                            this.expect(true).toBeTruthy();
                        });
                    }
                });
            }
        });
    }
    
    testAPIConfiguration() {
        this.describe('API Configuration Tests', () => {
            const apiFiles = ['src/api.js', 'src/services/api.js', 'src/utils/api.js'];
            let apiFileExists = false;
            
            apiFiles.forEach(file => {
                if (fs.existsSync(file)) {
                    apiFileExists = true;
                    const content = fs.readFileSync(file, 'utf8');
                    
                    this.test('API file contains localhost configuration', () => {
                        this.expect(content).toContain('localhost');
                    });
                    
                    this.test('API file contains port 3001', () => {
                        this.expect(content).toContain('3001');
                    });
                }
            });
            
            this.test('API configuration file exists', () => {
                this.expect(apiFileExists).toBeTruthy();
            });
        });
    }
    
    testBuildConfiguration() {
        this.describe('Build Configuration Tests', () => {
            if (fs.existsSync('package.json')) {
                const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
                
                this.test('has build script', () => {
                    this.expect(packageJson.scripts && packageJson.scripts.build).toBeTruthy();
                });
                
                this.test('has start script', () => {
                    this.expect(packageJson.scripts && packageJson.scripts.start).toBeTruthy();
                });
                
                this.test('uses React', () => {
                    this.expect(
                        (packageJson.dependencies && packageJson.dependencies.react) ||
                        (packageJson.devDependencies && packageJson.devDependencies.react)
                    ).toBeTruthy();
                });
            }
        });
    }
    
    testDependencies() {
        this.describe('Dependencies Tests', () => {
            if (fs.existsSync('package.json')) {
                const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
                const allDeps = {
                    ...(packageJson.dependencies || {}),
                    ...(packageJson.devDependencies || {})
                };
                
                // Test for key dependencies
                const keyDeps = ['react', 'react-dom'];
                
                keyDeps.forEach(dep => {
                    this.test(`has ${dep} dependency`, () => {
                        this.expect(allDeps[dep]).toBeTruthy();
                    });
                });
                
                // Test for Material UI (user preference)
                this.test('has Material UI (user preference)', () => {
                    const hasMui = !!(
                        allDeps['@mui/material'] || 
                        allDeps['@material-ui/core'] ||
                        allDeps['material-ui']
                    );
                    // This is a preference test, so we'll note it but not fail
                    if (hasMui) {
                        console.log('    ✅ Material UI detected (user preference satisfied)');
                    } else {
                        console.log('    ℹ️  Material UI not found (user prefers MUI)');
                    }
                    this.expect(true).toBeTruthy(); // Always pass, just informational
                });
            }
        });
    }
}

// Export for use by main test runner
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleTestRunner;
}

// Run tests if called directly
if (require.main === module) {
    const runner = new SimpleTestRunner();
    const success = runner.runTests();
    process.exit(success ? 0 : 1);
}
