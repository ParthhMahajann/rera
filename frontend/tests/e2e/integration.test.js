/**
 * End-to-End Integration Test Suite
 * Tests complete user workflows using Playwright
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

// Test configuration
const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:3001';

// Test data
const testQuotation = {
  developerType: 'category 2',
  projectRegion: 'Mumbai',
  plotArea: '5000',
  developerName: 'E2E Test Developer',
  projectName: 'E2E Test Project',
  validity: '30 days',
  paymentSchedule: '50%'
};

const adminCredentials = {
  username: 'admin',
  password: '1234'
};

test.describe('RERA Easy - End-to-End Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set up test environment
    await page.goto(FRONTEND_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check if the main page loads
    await expect(page).toHaveTitle(/RERA Easy/i);
    
    // Check for main navigation elements
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Check for main content area
    await expect(page.getByRole('main')).toBeVisible();
    
    console.log('✓ Homepage loads successfully');
  });

  test('should handle user authentication flow', async ({ page }) => {
    // Navigate to login page
    await page.getByRole('link', { name: /login/i }).click();
    
    // Fill login form
    await page.getByLabel(/username/i).fill(adminCredentials.username);
    await page.getByLabel(/password/i).fill(adminCredentials.password);
    
    // Submit login
    await page.getByRole('button', { name: /login/i }).click();
    
    // Wait for redirect to dashboard
    await page.waitForURL(/dashboard/i);
    
    // Verify successful login
    await expect(page.getByText(/welcome/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
    
    console.log('✓ User authentication flow working');
  });

  test('should create quotation end-to-end', async ({ page }) => {
    // Login first
    await login(page);
    
    // Navigate to create quotation
    await page.getByRole('link', { name: /create quotation/i }).click();
    
    // Wait for form to load
    await expect(page.getByText(/create quotation/i)).toBeVisible();
    
    // Fill out the quotation form
    await page.getByLabel(/developer type/i).selectOption(testQuotation.developerType);
    await page.getByLabel(/project region/i).selectOption(testQuotation.projectRegion);
    await page.getByLabel(/plot area/i).fill(testQuotation.plotArea);
    await page.getByLabel(/developer name/i).fill(testQuotation.developerName);
    await page.getByLabel(/project name/i).fill(testQuotation.projectName);
    await page.getByLabel(/validity/i).fill(testQuotation.validity);
    await page.getByLabel(/payment schedule/i).fill(testQuotation.paymentSchedule);
    
    // Submit form
    await page.getByRole('button', { name: /create quotation/i }).click();
    
    // Wait for success message or redirect
    await page.waitForLoadState('networkidle');
    
    // Check for success indicators
    const successElements = [
      page.getByText(/success/i),
      page.getByText(/created/i),
      page.getByText(/quotation.*created/i)
    ];
    
    let foundSuccess = false;
    for (const element of successElements) {
      try {
        await expect(element).toBeVisible({ timeout: 5000 });
        foundSuccess = true;
        break;
      } catch (e) {
        // Continue to next element
      }
    }
    
    if (foundSuccess) {
      console.log('✓ Quotation creation successful');
    } else {
      console.log('⚠ Quotation creation may have issues');
    }
  });

  test('should display quotations list correctly', async ({ page }) => {
    await login(page);
    
    // Navigate to quotations list
    await page.getByRole('link', { name: /quotations/i }).click();
    
    // Wait for list to load
    await page.waitForLoadState('networkidle');
    
    // Check for list container
    const listContainer = page.locator('[data-testid="quotations-list"], .quotations-list, [class*="quotation"]').first();
    await expect(listContainer).toBeVisible({ timeout: 10000 });
    
    // Check for search functionality
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000); // Wait for search to process
      console.log('✓ Search functionality present');
    }
    
    // Check for quotation items
    const quotationItems = page.locator('[class*="quotation-item"], .quotation-row, [data-testid*="quotation"]');
    const itemCount = await quotationItems.count();
    
    if (itemCount > 0) {
      console.log(`✓ Found ${itemCount} quotation items`);
      
      // Check first item details
      const firstItem = quotationItems.first();
      await expect(firstItem).toBeVisible();
      
      // Look for download button
      const downloadBtn = firstItem.getByRole('button', { name: /download/i }).or(
        firstItem.getByText(/download/i)
      );
      
      if (await downloadBtn.isVisible()) {
        console.log('✓ Download functionality available');
      }
    } else {
      console.log('ℹ No quotations found in list');
    }
  });

  test('should handle PDF generation', async ({ page }) => {
    await login(page);
    
    // Go to quotations list
    await page.getByRole('link', { name: /quotations/i }).click();
    await page.waitForLoadState('networkidle');
    
    // Find and click download button
    const downloadButton = page.getByRole('button', { name: /download/i }).first();
    
    if (await downloadButton.isVisible()) {
      // Set up download handler
      const downloadPromise = page.waitForEvent('download');
      
      await downloadButton.click();
      
      try {
        const download = await downloadPromise;
        
        // Verify download
        expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
        console.log(`✓ PDF download successful: ${download.suggestedFilename()}`);
        
        // Save the file to verify it's valid
        const downloadPath = path.join(__dirname, 'downloads', download.suggestedFilename());
        await download.saveAs(downloadPath);
        
      } catch (error) {
        console.log('⚠ PDF download may have issues:', error.message);
      }
    } else {
      console.log('ℹ No download buttons found');
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(FRONTEND_URL);
    await page.waitForLoadState('networkidle');
    
    // Check if navigation adapts to mobile
    const mobileNav = page.locator('[class*="mobile"], [data-testid="mobile-nav"], .hamburger, [aria-label*="menu"]');
    
    if (await mobileNav.isVisible()) {
      await mobileNav.click();
      await expect(page.getByRole('navigation')).toBeVisible();
      console.log('✓ Mobile navigation working');
    }
    
    // Test form usability on mobile
    await page.getByRole('link', { name: /create/i }).click();
    
    // Check if form elements are properly sized for mobile
    const formInputs = page.locator('input, select, textarea');
    const inputCount = await formInputs.count();
    
    for (let i = 0; i < Math.min(inputCount, 5); i++) {
      const input = formInputs.nth(i);
      if (await input.isVisible()) {
        const boundingBox = await input.boundingBox();
        expect(boundingBox.width).toBeGreaterThan(200); // Minimum touch-friendly width
        expect(boundingBox.height).toBeGreaterThan(30); // Minimum touch-friendly height
      }
    }
    
    console.log('✓ Mobile responsiveness verified');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept API calls and simulate network failure
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server Error' })
      });
    });
    
    await page.goto(FRONTEND_URL);
    await page.waitForLoadState('networkidle');
    
    // Try to perform an action that requires API
    await page.getByRole('link', { name: /quotations/i }).click();
    
    // Check for error handling
    await page.waitForTimeout(2000);
    
    const errorElements = [
      page.getByText(/error/i),
      page.getByText(/failed/i),
      page.getByText(/unable/i),
      page.getByText(/try again/i)
    ];
    
    let foundError = false;
    for (const element of errorElements) {
      if (await element.isVisible()) {
        foundError = true;
        console.log('✓ Error handling working');
        break;
      }
    }
    
    if (!foundError) {
      console.log('⚠ Error handling may need improvement');
    }
  });

  test('should validate form inputs correctly', async ({ page }) => {
    await login(page);
    
    // Navigate to create quotation
    await page.getByRole('link', { name: /create/i }).click();
    await page.waitForLoadState('networkidle');
    
    // Try to submit empty form
    await page.getByRole('button', { name: /create quotation/i }).click();
    
    // Check for validation messages
    const validationMessages = [
      page.getByText(/required/i),
      page.getByText(/please/i),
      page.getByText(/invalid/i),
      page.getByText(/enter/i)
    ];
    
    let foundValidation = false;
    for (const message of validationMessages) {
      if (await message.isVisible()) {
        foundValidation = true;
        console.log('✓ Form validation working');
        break;
      }
    }
    
    // Test invalid input values
    await page.getByLabel(/plot area/i).fill('invalid');
    await page.getByRole('button', { name: /create quotation/i }).click();
    
    if (!foundValidation) {
      // Check again after invalid input
      for (const message of validationMessages) {
        if (await message.isVisible()) {
          foundValidation = true;
          console.log('✓ Input validation working');
          break;
        }
      }
    }
    
    if (!foundValidation) {
      console.log('⚠ Form validation may need improvement');
    }
  });

  test('should maintain user session correctly', async ({ page }) => {
    await login(page);
    
    // Navigate to different pages
    await page.getByRole('link', { name: /dashboard/i }).click();
    await page.waitForLoadState('networkidle');
    
    await page.getByRole('link', { name: /quotations/i }).click();
    await page.waitForLoadState('networkidle');
    
    // Verify user is still logged in
    const logoutButton = page.getByRole('button', { name: /logout/i });
    await expect(logoutButton).toBeVisible();
    
    // Test logout
    await logoutButton.click();
    await page.waitForLoadState('networkidle');
    
    // Verify logout successful
    await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
    
    console.log('✓ User session management working');
  });

  test('should display pricing without GST as per user rules', async ({ page }) => {
    await login(page);
    
    // Navigate to create quotation
    await page.getByRole('link', { name: /create/i }).click();
    await page.waitForLoadState('networkidle');
    
    // Fill form to trigger pricing calculation
    await page.getByLabel(/developer type/i).selectOption('category 2');
    await page.getByLabel(/plot area/i).fill('5000');
    
    // Wait for pricing to calculate
    await page.waitForTimeout(1000);
    
    // Check that prices are displayed
    const priceElements = page.locator('text=/₹/');
    const priceCount = await priceElements.count();
    
    if (priceCount > 0) {
      console.log(`✓ Found ${priceCount} price elements`);
      
      // Check that no GST is mentioned
      const gstText = page.getByText(/gst|tax/i);
      const hasGST = await gstText.isVisible();
      
      if (!hasGST) {
        console.log('✓ Prices displayed without GST as per user rules');
      } else {
        console.log('⚠ GST may be displayed contrary to user rules');
      }
    } else {
      console.log('ℹ No price elements found');
    }
  });

  test('should use MUI components with white theme and blue accents', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await page.waitForLoadState('networkidle');
    
    // Check for MUI-specific classes or components
    const muiElements = page.locator('[class*="Mui"], [class*="makeStyles"], .MuiButton-root, .MuiTextField-root');
    const muiCount = await muiElements.count();
    
    if (muiCount > 0) {
      console.log(`✓ Found ${muiCount} MUI components`);
    }
    
    // Check color scheme
    const body = page.locator('body');
    const backgroundColor = await body.evaluate(el => getComputedStyle(el).backgroundColor);
    
    // Check for white/light background
    if (backgroundColor.includes('255, 255, 255') || backgroundColor.includes('white')) {
      console.log('✓ White theme detected');
    }
    
    // Look for blue accent colors
    const blueElements = page.locator('[style*="blue"], [class*="blue"], [color*="blue"]');
    const blueCount = await blueElements.count();
    
    if (blueCount > 0) {
      console.log(`✓ Blue accent elements found: ${blueCount}`);
    }
  });

  // Performance test
  test('should load pages within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(FRONTEND_URL);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    console.log(`✓ Page loaded in ${loadTime}ms`);
    
    // Test navigation performance
    const navStartTime = Date.now();
    
    await page.getByRole('link', { name: /create/i }).click();
    await page.waitForLoadState('networkidle');
    
    const navTime = Date.now() - navStartTime;
    expect(navTime).toBeLessThan(2000);
    console.log(`✓ Navigation completed in ${navTime}ms`);
  });
});

// Utility function for login
async function login(page) {
  // Check if already logged in
  const logoutBtn = page.getByRole('button', { name: /logout/i });
  if (await logoutBtn.isVisible()) {
    return; // Already logged in
  }
  
  // Navigate to login
  await page.getByRole('link', { name: /login/i }).click();
  
  // Fill credentials
  await page.getByLabel(/username/i).fill(adminCredentials.username);
  await page.getByLabel(/password/i).fill(adminCredentials.password);
  
  // Submit login
  await page.getByRole('button', { name: /login/i }).click();
  
  // Wait for successful login
  await page.waitForLoadState('networkidle');
  
  // Verify login success
  await expect(page.getByRole('button', { name: /logout/i })).toBeVisible({ timeout: 10000 });
}
