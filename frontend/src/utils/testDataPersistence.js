// Test utility to verify data persistence functionality
// This file helps verify that quotation data is properly saved and loaded

export const createTestQuotation = () => {
  return {
    id: 'test-123',
    projectName: 'Test Project',
    developerName: 'Test Developer',
    status: 'draft',
    headers: [
      {
        header: 'Add ons',
        services: [
          {
            id: 'service-addon-4',
            label: 'Form 1 (Architect\'s Certificate)',
            selectedYears: ['2023', '2024'],
            selectedQuarters: ['2023-Q1', '2023-Q2', '2024-Q1', '2024-Q4'],
            subServices: []
          },
          {
            id: 'service-addon-5',
            label: 'Form 2 (Engineer\'s Certificate)',
            selectedYears: ['2023'],
            selectedQuarters: ['2023-Q3', '2023-Q4'],
            subServices: []
          },
          {
            id: 'service-addon-7',
            label: 'Annual Return/Report as per Form 5',
            selectedYears: ['2023', '2024'],
            // No quarters for Form 5 as it's year-only
            subServices: []
          }
        ]
      }
    ]
  };
};

export const verifyDataIntegrity = (originalData, loadedData) => {
  const issues = [];
  
  // Check if basic structure is preserved
  if (!loadedData.headers || loadedData.headers.length === 0) {
    issues.push('No headers found in loaded data');
    return issues;
  }
  
  // Check each header
  originalData.headers.forEach((originalHeader, headerIndex) => {
    const loadedHeader = loadedData.headers[headerIndex];
    
    if (!loadedHeader) {
      issues.push(`Header ${headerIndex} missing in loaded data`);
      return;
    }
    
    if (originalHeader.header !== loadedHeader.name) {
      issues.push(`Header name mismatch: expected "${originalHeader.header}", got "${loadedHeader.name}"`);
    }
    
    // Check services
    originalHeader.services.forEach((originalService, serviceIndex) => {
      const loadedService = loadedHeader.services?.[serviceIndex];
      
      if (!loadedService) {
        issues.push(`Service ${serviceIndex} missing in header ${headerIndex}`);
        return;
      }
      
      // Check year selections
      if (originalService.selectedYears && originalService.selectedYears.length > 0) {
        if (!loadedService.selectedYears || loadedService.selectedYears.length === 0) {
          issues.push(`Year selections missing for service ${originalService.label}`);
        } else {
          const missingYears = originalService.selectedYears.filter(
            year => !loadedService.selectedYears.includes(year)
          );
          if (missingYears.length > 0) {
            issues.push(`Missing years for ${originalService.label}: ${missingYears.join(', ')}`);
          }
        }
      }
      
      // Check quarter selections
      if (originalService.selectedQuarters && originalService.selectedQuarters.length > 0) {
        if (!loadedService.selectedQuarters || loadedService.selectedQuarters.length === 0) {
          issues.push(`Quarter selections missing for service ${originalService.label}`);
        } else {
          const missingQuarters = originalService.selectedQuarters.filter(
            quarter => !loadedService.selectedQuarters.includes(quarter)
          );
          if (missingQuarters.length > 0) {
            issues.push(`Missing quarters for ${originalService.label}: ${missingQuarters.join(', ')}`);
          }
        }
      }
    });
  });
  
  return issues;
};

export const logTestResults = (testName, issues) => {
  console.group(`🔍 Test: ${testName}`);
  
  if (issues.length === 0) {
    console.log('✅ All tests passed! Data persistence is working correctly.');
  } else {
    console.log('❌ Issues found:');
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }
  
  console.groupEnd();
  return issues.length === 0;
};
