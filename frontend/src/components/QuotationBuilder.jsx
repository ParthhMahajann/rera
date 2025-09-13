// src/components/QuotationBuilder.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  getAvailableHeaders, 
  getServicesForHeader, 
  expandPackageServices, 
  isPackageHeader,
  YEAR_OPTIONS,
  QUARTER_OPTIONS,
  getAllQuartersForYears
} from "../lib/servicesData";
import { useQuotation } from "../context/QuotationContext";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Stack,
  Divider,
  Checkbox,
  FormControlLabel,
  Paper,
  Alert,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import {
  Add as AddIcon,
  Schedule as ScheduleIcon,
  DateRange as DateRangeIcon
} from "@mui/icons-material";

export default function QuotationBuilder({ onComplete, onServicesChange, quotationData }) {
  // Use context for header and services data
  const { selectedHeaders: contextHeaders } = useQuotation();
  
  // Local state for UI-specific data
  const [selectedHeaders, setSelectedHeaders] = useState([]);
  const [selectedServices, setSelectedServices] = useState({});
  const [selectedSubServices, setSelectedSubServices] = useState({}); // New state for sub-services
  const [currentHeader, setCurrentHeader] = useState(null);
  const [summary, setSummary] = useState({});
  const [allSelectedServices, setAllSelectedServices] = useState([]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customHeaderName, setCustomHeaderName] = useState("");
  const [customHeaderNames, setCustomHeaderNames] = useState({}); // Map header ID to custom name
  const [showCustomHeaderDialog, setShowCustomHeaderDialog] = useState(false);
  const [pendingCustomHeader, setPendingCustomHeader] = useState("");
  const [selectedYears, setSelectedYears] = useState({});
  const [selectedQuarters, setSelectedQuarters] = useState({});
  const [globallySelectedAddons, setGloballySelectedAddons] = useState(new Set());
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [originalPackageSelections, setOriginalPackageSelections] = useState({});
  const [dataLoaded, setDataLoaded] = useState(false);

  // Helper function to get default services for a header (what should be pre-selected)
  const getDefaultServicesForHeader = useCallback((headerName) => {
    const headerServices = getServicesForHeader(headerName);
    const defaultServices = [];
    
    if (isPackageHeader(headerName) || headerName === 'Customized Header') {
      // For packages and custom header, only main services are pre-selected
      headerServices.forEach(service => {
        if (service.category === 'main') {
          defaultServices.push(service);
        }
      });
    }
    
    return defaultServices;
  }, []);

  // Helper function to get all globally selected addon service IDs
  const getGloballySelectedAddonIds = useCallback(() => {
    const addonIds = new Set();
    Object.values(selectedServices).forEach(headerServices => {
      headerServices.forEach(service => {
        if (service.category === 'addon') {
          addonIds.add(service.id);
        }
      });
    });
    return addonIds;
  }, [selectedServices]);

  // Helper function to check if all sub-services are selected for a service
  const areAllSubServicesSelected = useCallback((headerName, serviceId) => {
    const service = getServicesForHeader(headerName).find(s => s.id === serviceId);
    if (!service || !service.subServices || service.subServices.length === 0) return true;
    
    const serviceKey = `${headerName}-${serviceId}`;
    const selectedSubs = selectedSubServices[serviceKey] || [];
    return service.subServices.every(subService => selectedSubs.includes(subService.id));
  }, [selectedSubServices]);

  // Helper function to check if any sub-services are selected for a service
  const areAnySubServicesSelected = useCallback((headerName, serviceId) => {
    const serviceKey = `${headerName}-${serviceId}`;
    const selectedSubs = selectedSubServices[serviceKey] || [];
    return selectedSubs.length > 0;
  }, [selectedSubServices]);

  // Helper function to toggle all sub-services for a service
  const toggleAllSubServices = useCallback((headerName, serviceId, shouldSelect) => {
    const service = getServicesForHeader(headerName).find(s => s.id === serviceId);
    if (!service || !service.subServices) return;
    
    const serviceKey = `${headerName}-${serviceId}`;
    setSelectedSubServices(prev => ({
      ...prev,
      [serviceKey]: shouldSelect ? service.subServices.map(sub => sub.id) : []
    }));
  }, []);

  // Helper function to check if current selection differs from default
  const checkIfRequiresApproval = useCallback(() => {
    for (const headerName of selectedHeaders) {
      if (isPackageHeader(headerName) || headerName === 'Customized Header' || isCustomHeader(headerName)) {
        const currentServices = selectedServices[headerName] || [];
        const defaultServices = getDefaultServicesForHeader(isCustomHeader(headerName) ? 'Customized Header' : headerName);
        
        // Create sets for easier comparison
        const currentServiceIds = new Set(currentServices.map(s => s.id));
        const defaultServiceIds = new Set(defaultServices.map(s => s.id));
        
        // Check if any default service is deselected
        for (const defaultId of defaultServiceIds) {
          if (!currentServiceIds.has(defaultId)) {
            return true; // Requires approval - default service was removed
          }
        }
        
        // Check if any addon services are selected (these require approval)
        for (const service of currentServices) {
          if (service.category === 'addon') {
            return true; // Requires approval - addon service was added
          }
        }
      }
    }
    return false;
  }, [selectedHeaders, selectedServices, getDefaultServicesForHeader]);

  // Calculate services count and completion percentage
  const updateProgress = useCallback(() => {
    const totalSelectedServices = Object.values(selectedServices).flat().length;
    const totalSelectedSubServices = Object.values(selectedSubServices).flat().length;
    const totalSelected = totalSelectedServices + totalSelectedSubServices;
    
    const completionPercentage = selectedHeaders.length > 0 
      ? Math.min(100, Math.round((totalSelected / Math.max(selectedHeaders.length * 5, 1)) * 100))
      : 0;

    if (onServicesChange) {
      onServicesChange(totalSelected, completionPercentage);
    }
  }, [selectedServices, selectedSubServices, selectedHeaders.length, onServicesChange]);

  // Load data from context when it's available
  useEffect(() => {
    if (contextHeaders && contextHeaders.length > 0 && !dataLoaded) {
      console.log('Loading data from context:', contextHeaders);
      
      // Convert context data back to component state
      const headerNames = [];
      const customNames = {};
      const servicesMap = {};
      const subServicesMap = {};
      const yearsMap = {};
      const quartersMap = {};
      
      contextHeaders.forEach(header => {
        // Handle custom header names
        if (header.originalName && header.originalName.startsWith('custom-')) {
          headerNames.push(header.originalName);
          customNames[header.originalName] = header.name;
        } else {
          headerNames.push(header.name);
        }
        
        if (header.services && header.services.length > 0) {
          // Determine the header key to use
          const headerKey = header.originalName || header.name;
          
          // Get full service information from servicesData to merge with context data  
          // For custom headers, use 'Customized Header' as the service lookup key
          const serviceLookupKey = (header.originalName && header.originalName.startsWith('custom-')) 
            ? 'Customized Header' 
            : header.name;
          const fullHeaderServices = getServicesForHeader(serviceLookupKey);
          
          servicesMap[headerKey] = header.services.map(contextService => {
            // Find the full service data to get complete information
            const fullService = fullHeaderServices.find(fs => fs.id === contextService.id) || {
              id: contextService.id,
              name: contextService.name,
              label: contextService.label || contextService.name,
              category: 'main',
              subServices: []
            };
            
            // Handle sub-services - convert object back to selection array
            if (contextService.subServices && Object.keys(contextService.subServices).length > 0) {
              const serviceKey = `${headerKey}-${contextService.id}`;
              subServicesMap[serviceKey] = Object.keys(contextService.subServices);
            }
            
            // Handle year/quarter selections
            if (contextService.selectedYears && contextService.selectedYears.length > 0) {
              const serviceKey = `${headerKey}-${contextService.id}`;
              yearsMap[serviceKey] = contextService.selectedYears;
            }
            
            if (contextService.selectedQuarters && contextService.selectedQuarters.length > 0) {
              const serviceKey = `${headerKey}-${contextService.id}`;
              quartersMap[serviceKey] = contextService.selectedQuarters;
            }
            
            return fullService;
          });
        }
      });
      
      console.log('Loading state:', { headerNames, servicesMap, subServicesMap, yearsMap, quartersMap, customNames });
      
      setSelectedHeaders(headerNames);
      setSelectedServices(servicesMap);
      setSelectedSubServices(subServicesMap);
      setSelectedYears(yearsMap);
      setSelectedQuarters(quartersMap);
      setCustomHeaderNames(customNames);
      setCurrentHeader(headerNames[0] || null);
      setDataLoaded(true);
    }
  }, [contextHeaders, dataLoaded]);

  useEffect(() => {
    updateProgress();
    // Update globally selected addons whenever services change
    setGloballySelectedAddons(getGloballySelectedAddonIds());
    // Check if changes require approval
    setRequiresApproval(checkIfRequiresApproval());
  }, [updateProgress, getGloballySelectedAddonIds, checkIfRequiresApproval]);

  // Service Card with clean professional styling
  const ServiceCard = ({ service, isSelected, onToggle, headerName }) => {
    const requiresYearQuarter = service.requiresYearQuarter;
    const requiresYearOnly = service.requiresYearOnly;
    const requiresYearSelection = requiresYearQuarter || requiresYearOnly;
    const serviceKey = `${headerName}-${service.id}`;
    
    // Check if this addon service is already selected in another header
    const isAddonSelectedElsewhere = service.category === 'addon' && 
      globallySelectedAddons.has(service.id) && !isSelected;
    
    const isDisabled = isAddonSelectedElsewhere;


    return (
      <Card sx={{
        mb: 2,
        border: '1px solid',
        borderColor: isSelected ? '#1976d2' : isDisabled ? '#d1d5db' : '#e2e8f0',
        backgroundColor: isSelected ? '#f3f4f6' : isDisabled ? '#f9fafb' : 'white',
        opacity: isDisabled ? 0.6 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        '&:hover': {
          borderColor: isDisabled ? '#d1d5db' : '#1976d2',
          backgroundColor: isDisabled ? '#f9fafb' : '#f8f9fa'
        }
      }}>
        <CardContent sx={{ p: 2 }}>
          <Box display="flex" alignItems="flex-start" justifyContent="space-between">
            <Box flex={1} mr={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isSelected}
                    onChange={isDisabled ? undefined : onToggle}
                    disabled={isDisabled}
                    color="primary"
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={600}
                      color={isDisabled ? 'text.disabled' : 'text.primary'}
                    >
                      {service.name}
                      {isAddonSelectedElsewhere && (
                        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          (Selected in another category)
                        </Typography>
                      )}
                    </Typography>
                    {requiresYearSelection && (
                      <Tooltip title={requiresYearOnly ? "This service requires year selection" : "This service requires year and quarter selection"}>
                        <ScheduleIcon sx={{ ml: 1, fontSize: 16, color: 'orange' }} />
                      </Tooltip>
                    )}
                  </Box>
                }
                sx={{ alignItems: 'flex-start', mr: 0 }}
              />

              {service.origin && (
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 1 }}>
                  Origin: {service.origin}
                </Typography>
              )}
              
              {/* Show hint for services with sub-services when not selected */}
              {!isSelected && service.subServices && service.subServices.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 4, fontStyle: 'italic' }}>
                  Contains {service.subServices.length} sub-service{service.subServices.length !== 1 ? 's' : ''} - Select service to configure
                </Typography>
              )}

              {/* Only show sub-services when the main service is selected */}
              {isSelected && service.subServices && service.subServices.length > 0 && (
                <Box sx={{ ml: 4, mt: 2 }}>
                  <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
                    Sub-Services ({service.subServices.length}):
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 300, overflow: 'auto' }}>
                    {service.subServices.map((subService) => {
                      const serviceKey = `${headerName}-${service.id}`;
                      const selectedSubs = selectedSubServices[serviceKey] || [];
                      const isSubSelected = selectedSubs.includes(subService.id);
                      
                      return (
                        <FormControlLabel
                          key={subService.id}
                          control={
                            <Checkbox
                              size="small"
                              checked={isSubSelected}
                              onChange={() => toggleSubService(headerName, service.id, subService.id)}
                              disabled={isDisabled}
                              color="primary"
                            />
                          }
                          label={
                            <Typography 
                              variant="caption" 
                              color={isDisabled ? 'text.disabled' : 'text.secondary'}
                              sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}
                            >
                              {subService.name}
                            </Typography>
                          }
                          sx={{ 
                            alignItems: 'flex-start', 
                            mr: 0,
                            '& .MuiFormControlLabel-label': { 
                              mt: 0.25 
                            }
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              )}

              {/* Year and Quarter Selection for specific services */}
              {isSelected && requiresYearSelection && (
                <Box sx={{ 
                  ml: 4, 
                  mt: 2, 
                  p: 2, 
                  backgroundColor: '#f8fafc',
                  borderRadius: 1,
                  border: '1px solid #e2e8f0'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DateRangeIcon sx={{ 
                      fontSize: 16, 
                      mr: 1, 
                      color: '#1976d2'
                    }} />
                  <Typography 
                    variant="body2" 
                    fontWeight={600} 
                    color="text.primary"
                  >
                    {requiresYearOnly ? 'Select Years' : 'Select Years and Quarters'}
                  </Typography>
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 1,
                    maxHeight: 250,
                    overflowY: 'auto'
                  }}>
                    {YEAR_OPTIONS.map((year) => {
                      const isYearSelected = (selectedYears[serviceKey] || []).includes(year.value);
                      const yearQuarters = QUARTER_OPTIONS[year.value] || [];
                      const selectedQuartersForYear = (selectedQuarters[serviceKey] || []).filter(q => q.startsWith(year.value + '-')).length;
                      
                      return (
                        <Box key={year.value}>
                          {/* Compact Year Selection */}
                          <Box
                            sx={{
                              p: 1,
                              backgroundColor: isYearSelected ? '#e3f2fd' : 'white',
                              borderRadius: 1,
                              border: '1px solid #e0e0e0',
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: '#f5f5f5'
                              }
                            }}
                            onClick={(e) => {
                              if (e.target.type !== 'checkbox') {
                                const checkbox = e.currentTarget.querySelector('input[type="checkbox"]');
                                if (checkbox) checkbox.click();
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={isYearSelected}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      const currentYears = selectedYears[serviceKey] || [];
                                      const currentQuarters = selectedQuarters[serviceKey] || [];
                                      let newYears;
                                      let newQuarters = [...currentQuarters];
                                      
                                      if (e.target.checked) {
                                        // Add year
                                        newYears = [...currentYears, year.value];
                                        // Auto-select quarters only if not year-only service
                                        if (!requiresYearOnly) {
                                          const yearQuarterValues = yearQuarters.map(q => q.value);
                                          newQuarters = [...currentQuarters, ...yearQuarterValues];
                                        }
                                      } else {
                                        // Remove year and its quarters
                                        newYears = currentYears.filter(y => y !== year.value);
                                        newQuarters = currentQuarters.filter(q => !q.startsWith(year.value + '-'));
                                      }
                                      
                                      setSelectedYears(prev => ({
                                        ...prev,
                                        [serviceKey]: newYears
                                      }));
                                      
                                      setSelectedQuarters(prev => ({
                                        ...prev,
                                        [serviceKey]: newQuarters
                                      }));
                                    }}
                                    color="primary"
                                  />
                                }
                                label={
                                  <Typography 
                                    variant="body2" 
                                    fontWeight={500}
                                  >
                                    {year.label}
                                  </Typography>
                                }
                                sx={{ m: 0 }}
                              />
                              {isYearSelected && selectedQuartersForYear > 0 && (
                                <Chip 
                                  label={`${selectedQuartersForYear}Q`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{
                                    fontSize: '0.7rem',
                                    height: 20,
                                    minWidth: 32
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                          
                          {/* Compact Quarter Selection - only show if year is selected and quarters are needed */}
                          {isYearSelected && yearQuarters.length > 0 && !requiresYearOnly && (
                            <Box sx={{ 
                              ml: 2, 
                              mt: 0.5,
                              p: 1,
                              backgroundColor: 'white',
                              borderRadius: 1,
                              border: '1px solid #e8f4fd'
                            }}>
                              <Typography 
                                variant="caption" 
                                color="text.secondary" 
                                sx={{ mb: 0.5, display: 'block', fontSize: '0.7rem' }}
                              >
                                Quarters:
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {yearQuarters.map((quarter) => {
                                  const isQuarterSelected = (selectedQuarters[serviceKey] || []).includes(quarter.value);
                                  return (
                                    <Chip
                                      key={quarter.value}
                                      label={quarter.quarter}
                                      size="small"
                                      clickable
                                      color={isQuarterSelected ? 'primary' : 'default'}
                                      variant={isQuarterSelected ? 'filled' : 'outlined'}
                                      onClick={() => {
                                        const currentQuarters = selectedQuarters[serviceKey] || [];
                                        let newQuarters;
                                        
                                        if (isQuarterSelected) {
                                          newQuarters = currentQuarters.filter(q => q !== quarter.value);
                                        } else {
                                          newQuarters = [...currentQuarters, quarter.value];
                                        }
                                        
                                        setSelectedQuarters(prev => ({
                                          ...prev,
                                          [serviceKey]: newQuarters
                                        }));
                                      }}
                                      sx={{
                                        fontSize: '0.7rem',
                                        height: 24,
                                        minWidth: 32,
                                        '& .MuiChip-label': {
                                          px: 1
                                        }
                                      }}
                                    />
                                  );
                                })}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>

                  {(selectedYears[serviceKey]?.length > 0 || selectedQuarters[serviceKey]?.length > 0) && (
                    <Alert 
                      severity="info" 
                      sx={{ 
                        mt: 1.5,
                        py: 0.5
                      }}
                    >
                      <Typography variant="caption">
                        Selected: {selectedYears[serviceKey]?.length || 0} year(s), {selectedQuarters[serviceKey]?.length || 0} quarter(s)
                      </Typography>
                    </Alert>
                  )}
                </Box>
              )}
            </Box>

            <Chip
              label={service.category === 'addon' ? 'Add-on' : 'Core'}
              size="small"
              variant={service.category === 'addon' ? 'outlined' : 'filled'}
              color={service.category === 'addon' ? 'warning' : 'primary'}
            />
          </Box>
        </CardContent>
      </Card>
    );
  };

  const addHeader = (headerName) => {
    if (headerName === 'Customized Header') {
      // Show dialog for custom header name
      setShowCustomHeaderDialog(true);
      return;
    }
    
    if (selectedHeaders.includes(headerName)) return;

    const newHeaders = [...selectedHeaders, headerName];
    setSelectedHeaders(newHeaders);
    
    // Auto-select main services for package headers
    const headerServices = getServicesForHeader(headerName);
    const mainServicesToSelect = [];
    
    if (isPackageHeader(headerName)) {
      // For packages, pre-select all main services (not addons)
      headerServices.forEach(service => {
        if (service.category === 'main') {
          mainServicesToSelect.push(service);
          // Auto-select all sub-services for auto-selected main services
          if (service.subServices && service.subServices.length > 0) {
            const serviceKey = `${headerName}-${service.id}`;
            setSelectedSubServices(prev => ({
              ...prev,
              [serviceKey]: service.subServices.map(sub => sub.id)
            }));
          }
        }
      });
    }
    
    setSelectedServices({ 
      ...selectedServices, 
      [headerName]: mainServicesToSelect 
    });
    setCurrentHeader(headerName);
  };

  const handleCustomHeaderConfirm = () => {
    if (!pendingCustomHeader.trim()) return;
    
    const customHeaderId = `custom-${Date.now()}`;
    const customName = pendingCustomHeader.trim();
    
    // Add the custom header to selected headers with a unique ID
    const newHeaders = [...selectedHeaders, customHeaderId];
    setSelectedHeaders(newHeaders);
    
    // Store the custom name mapping
    setCustomHeaderNames(prev => ({
      ...prev,
      [customHeaderId]: customName
    }));
    
    // Initialize services for custom header (empty by default)
    setSelectedServices({ 
      ...selectedServices, 
      [customHeaderId]: [] 
    });
    
    setCurrentHeader(customHeaderId);
    setShowCustomHeaderDialog(false);
    setPendingCustomHeader("");
  };

  const handleCustomHeaderCancel = () => {
    setShowCustomHeaderDialog(false);
    setPendingCustomHeader("");
  };

  // Helper function to get display name for any header
  const getHeaderDisplayName = (headerName) => {
    if (headerName.startsWith('custom-')) {
      return customHeaderNames[headerName] || 'Custom Header';
    }
    return headerName;
  };

  // Helper function to check if a header is custom
  const isCustomHeader = (headerName) => {
    return headerName.startsWith('custom-');
  };

  const removeHeader = (headerName) => {
    const newHeaders = selectedHeaders.filter(h => h !== headerName);
    const newServices = { ...selectedServices };
    const newSubServices = { ...selectedSubServices };
    
    // Clear year/quarter/sub-service selections for services in this header
    const headerServices = selectedServices[headerName] || [];
    headerServices.forEach(service => {
      const serviceKey = `${headerName}-${service.id}`;
      setSelectedYears(prev => {
        const updated = { ...prev };
        delete updated[serviceKey];
        return updated;
      });
      setSelectedQuarters(prev => {
        const updated = { ...prev };
        delete updated[serviceKey];
        return updated;
      });
      // Clear sub-service selections
      delete newSubServices[serviceKey];
    });
    
    delete newServices[headerName];
    
    // If it's a custom header, also remove its name mapping
    if (isCustomHeader(headerName)) {
      setCustomHeaderNames(prev => {
        const updated = { ...prev };
        delete updated[headerName];
        return updated;
      });
    }
    
    setSelectedHeaders(newHeaders);
    setSelectedServices(newServices);
    setSelectedSubServices(newSubServices);

    if (currentHeader === headerName) {
      setCurrentHeader(newHeaders.length > 0 ? newHeaders[0] : null);
    }
  };

  const toggleService = (headerName, service) => {
    // Prevent selection if this addon is already selected elsewhere
    if (service.category === 'addon' && globallySelectedAddons.has(service.id)) {
      const headerServices = selectedServices[headerName] || [];
      const isSelectedHere = headerServices.some(s => s.id === service.id);
      
      // Only allow deselection if it's selected in this header
      if (!isSelectedHere) {
        return; // Prevent selection
      }
    }

    const headerServices = selectedServices[headerName] || [];
    const isSelected = headerServices.some(s => s.id === service.id);

    let newServices;
    if (isSelected) {
      newServices = headerServices.filter(s => s.id !== service.id);
      // Clear year/quarter selections when service is deselected
      const serviceKey = `${headerName}-${service.id}`;
      setSelectedYears(prev => {
        const updated = { ...prev };
        delete updated[serviceKey];
        return updated;
      });
      setSelectedQuarters(prev => {
        const updated = { ...prev };
        delete updated[serviceKey];
        return updated;
      });
      // Clear all sub-services when parent service is deselected
      toggleAllSubServices(headerName, service.id, false);
    } else {
      newServices = [...headerServices, service];
      // Auto-select all sub-services when parent service is selected
      toggleAllSubServices(headerName, service.id, true);
    }

    setSelectedServices({
      ...selectedServices,
      [headerName]: newServices
    });
  };

  // Function to toggle individual sub-service
  const toggleSubService = (headerName, serviceId, subServiceId) => {
    const serviceKey = `${headerName}-${serviceId}`;
    const currentSubServices = selectedSubServices[serviceKey] || [];
    
    let newSubServices;
    if (currentSubServices.includes(subServiceId)) {
      newSubServices = currentSubServices.filter(id => id !== subServiceId);
    } else {
      newSubServices = [...currentSubServices, subServiceId];
    }
    
    setSelectedSubServices(prev => ({
      ...prev,
      [serviceKey]: newSubServices
    }));

    // Check if parent service should be selected/deselected based on sub-service selection
    const headerServices = selectedServices[headerName] || [];
    const isParentSelected = headerServices.some(s => s.id === serviceId);
    const service = getServicesForHeader(headerName).find(s => s.id === serviceId);
    
    if (newSubServices.length === 0 && isParentSelected) {
      // Deselect parent if no sub-services are selected
      const newServices = headerServices.filter(s => s.id !== serviceId);
      setSelectedServices({
        ...selectedServices,
        [headerName]: newServices
      });
    } else if (newSubServices.length > 0 && !isParentSelected) {
      // Select parent if at least one sub-service is selected
      const newServices = [...headerServices, service];
      setSelectedServices({
        ...selectedServices,
        [headerName]: newServices
      });
    }
  };

  const handleComplete = () => {
    const result = selectedHeaders.map(headerName => ({
      name: getHeaderDisplayName(headerName), // Use display name instead of internal ID
      originalName: headerName, // Keep original ID for internal tracking
      services: selectedServices[headerName].map(service => {
        const serviceKey = `${headerName}-${service.id}`;
        const selectedSubs = selectedSubServices[serviceKey] || [];
        
        // Filter sub-services to only include selected ones
        const selectedSubServicesList = service.subServices 
          ? service.subServices.filter(sub => selectedSubs.includes(sub.id))
          : [];
        
        const serviceResult = {
          ...service,
          selectedSubServices: selectedSubServicesList,
          selectedYears: selectedYears[serviceKey] || [],
          selectedQuarters: selectedQuarters[serviceKey] || []
        };
        
        // Add quarter count for services that require quarter-based pricing
        if (service.requiresYearQuarter) {
          const quarterCount = selectedQuarters[serviceKey]?.length || 1;
          serviceResult.quarterCount = quarterCount;
        }
        
        return serviceResult;
      })
    }));

    // Include approval requirement in the result
    const resultWithApproval = {
      headers: result,
      requiresApproval: requiresApproval,
      customHeaderNames: customHeaderNames // Include custom header names for saving
    };

    onComplete(resultWithApproval);
  };

  const availableHeaders = getAvailableHeaders(selectedHeaders);
  
  // Handle service retrieval for custom headers
  let currentServices = [];
  if (currentHeader) {
    if (isCustomHeader(currentHeader)) {
      currentServices = getServicesForHeader('Customized Header');
    } else {
      currentServices = getServicesForHeader(currentHeader);
    }
  }
  
  const mainServices = currentServices.filter(s => s.category === 'main');
  const addonServices = currentServices.filter(s => s.category === 'addon');

  return (
    <Paper sx={{ mt: 2 }}>
      {/* Header Selection */}
      <Box sx={{ p: 3, backgroundColor: '#f8f9fa', borderBottom: '1px solid #e2e8f0' }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
          Service Categories
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Select service categories and configure individual services
        </Typography>

        {/* Available Headers */}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {availableHeaders.map(header => (
            <Button
              key={header}
              variant="outlined"
              size="small"
              onClick={() => addHeader(header)}
              startIcon={<AddIcon />}
              sx={{ textTransform: 'none', mb: 1 }}
            >
              {header}
            </Button>
          ))}
        </Stack>
      </Box>

      {/* Selected Headers */}
      {selectedHeaders.length > 0 && (
        <Box sx={{ p: 3, borderBottom: selectedHeaders.length > 0 ? '1px solid #e2e8f0' : 'none' }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Selected Categories ({selectedHeaders.length})
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {selectedHeaders.map(header => (
              <Chip
                key={header}
                label={getHeaderDisplayName(header)}
                onDelete={() => removeHeader(header)}
                variant={currentHeader === header ? "filled" : "outlined"}
                color={currentHeader === header ? "primary" : "default"}
                onClick={() => setCurrentHeader(header)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Service Selection */}
      {currentHeader && (
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
            Configure Services for: {getHeaderDisplayName(currentHeader)}
          </Typography>

          {/* Main Services */}
          {mainServices.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Core Services ({mainServices.length})
              </Typography>

                {mainServices.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    headerName={currentHeader}
                    isSelected={selectedServices[currentHeader]?.some(s => s.id === service.id)}
                    onToggle={() => toggleService(currentHeader, service)}
                  />
                ))}
              </Box>
            )}

          {/* Add-on Services */}
          {addonServices.length > 0 && (
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Additional Services ({addonServices.length})
              </Typography>

                {addonServices.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    headerName={currentHeader}
                    isSelected={selectedServices[currentHeader]?.some(s => s.id === service.id)}
                    onToggle={() => toggleService(currentHeader, service)}
                  />
                ))}
              </Box>
            )}

          {mainServices.length === 0 && addonServices.length === 0 && (
            <Alert severity="info">
              <Typography variant="body2">
                No services available for this category.
              </Typography>
            </Alert>
          )}
        </Box>
      )}

      {selectedHeaders.length === 0 && (
        <Box sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Get Started
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select a service category above to begin building your quotation
          </Typography>
        </Box>
      )}

      {/* Complete Button */}
      {selectedHeaders.length > 0 && Object.values(selectedServices).some(services => services.length > 0) && (
        <Box sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body1" fontWeight={600}>
                Ready to proceed?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Object.values(selectedServices).flat().length} services and {Object.values(selectedSubServices).flat().length} sub-services selected across {selectedHeaders.length} categories
              </Typography>
              {requiresApproval && (
                <Alert severity="info" sx={{ mt: 2, maxWidth: 400 }}>
                  <Typography variant="body2">
                    ⚠️ This quotation will require approval due to modifications from standard package selections.
                  </Typography>
                </Alert>
              )}
            </Box>
            <Button
              variant="contained"
              size="large"
              onClick={handleComplete}
              sx={{ textTransform: 'none', px: 4 }}
            >
              Proceed to Pricing
            </Button>
          </Stack>
        </Box>
      )}

      {/* Custom Header Name Dialog */}
      <Dialog open={showCustomHeaderDialog} onClose={handleCustomHeaderCancel} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Create Custom Header
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Enter a name for your custom service category
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label="Custom Header Name"
            value={pendingCustomHeader}
            onChange={(e) => setPendingCustomHeader(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && pendingCustomHeader.trim()) {
                handleCustomHeaderConfirm();
              }
            }}
            placeholder="e.g., Special Services, Additional Compliance"
            sx={{ mt: 1 }}
            inputProps={{ maxLength: 50 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCustomHeaderCancel} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleCustomHeaderConfirm} 
            variant="contained" 
            disabled={!pendingCustomHeader.trim()}
            sx={{ textTransform: 'none' }}
          >
            Create Header
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
