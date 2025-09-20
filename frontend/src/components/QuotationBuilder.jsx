// Enhanced QuotationBuilder.jsx with improved MUI styling and smooth year selection

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  DialogActions,
  Collapse,
  Fade,
  Slide,
  useTheme,
  alpha,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Avatar,
  Badge
} from "@mui/material";
import {
  Add as AddIcon,
  Schedule as ScheduleIcon,
  DateRange as DateRangeIcon,
  CheckCircle,
  RadioButtonUnchecked,
  ExpandMore,
  Close,
  Done,
  Warning,
  Settings,
  Business,
  Extension
} from "@mui/icons-material";

export default function QuotationBuilder({ onComplete, onServicesChange, quotationData }) {
  // Use context for header and services data
  const { selectedHeaders: contextHeaders } = useQuotation();
  const theme = useTheme();
  
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
  
  // Refs to maintain scroll positions
  const yearSectionRefs = useRef({});

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

  // Enhanced Service Card with smooth animations and better styling
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
      <Fade in={true} timeout={300}>
        <Card
          sx={{
            mb: 2,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: `2px solid ${
              isSelected 
                ? theme.palette.primary.main
                : isDisabled 
                  ? alpha(theme.palette.error.main, 0.3)
                  : alpha(theme.palette.divider, 0.3)
            }`,
            backgroundColor: isSelected 
              ? alpha(theme.palette.primary.main, 0.05)
              : isDisabled
                ? alpha(theme.palette.error.main, 0.02)
                : theme.palette.background.paper,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            '&:hover': {
              transform: isDisabled ? 'none' : 'translateY(-2px)',
              boxShadow: isDisabled ? 'none' : theme.shadows[8],
              borderColor: isDisabled 
                ? alpha(theme.palette.error.main, 0.3)
                : isSelected 
                  ? theme.palette.primary.dark
                  : alpha(theme.palette.primary.main, 0.6)
            },
            opacity: isDisabled ? 0.6 : 1,
            borderRadius: 3
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <Checkbox
                checked={isSelected}
                onChange={onToggle}
                disabled={isDisabled}
                icon={<RadioButtonUnchecked />}
                checkedIcon={<CheckCircle />}
                sx={{ 
                  p: 0, 
                  mr: 2,
                  color: theme.palette.primary.main,
                  '&.Mui-checked': {
                    color: theme.palette.primary.main,
                  }
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: isSelected ? theme.palette.primary.main : theme.palette.text.primary,
                      fontSize: '1.1rem'
                    }}
                  >
                    {service.name}
                  </Typography>
                  {service.category === 'addon' && (
                    <Chip
                      label="Add-on"
                      size="small"
                      sx={{
                        backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                        color: theme.palette.secondary.main,
                        fontWeight: 500
                      }}
                    />
                  )}
                </Box>

                {isAddonSelectedElsewhere && (
                  <Chip
                    label="(Selected in another category)"
                    size="small"
                    color="error"
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                )}

                {requiresYearSelection && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <DateRangeIcon sx={{ fontSize: 16, color: theme.palette.info.main }} />
                    <Typography variant="caption" color="info.main" sx={{ fontWeight: 500 }}>
                      Requires {requiresYearOnly ? 'year' : 'year and quarter'} selection
                    </Typography>
                  </Box>
                )}

                {service.origin && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Origin: {service.origin}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Show hint for services with sub-services when not selected */}
            {!isSelected && service.subServices && service.subServices.length > 0 && (
              <Alert severity="info" sx={{ mb: 2, py: 1 }}>
                Contains {service.subServices.length} sub-service{service.subServices.length !== 1 ? 's' : ''} - Select service to configure
              </Alert>
            )}

            {/* Only show sub-services when the main service is selected */}
            <Collapse in={isSelected && service.subServices && service.subServices.length > 0}>
              {isSelected && service.subServices && service.subServices.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
                    Sub-Services ({service.subServices.length}):
                  </Typography>
                  <Grid container spacing={1}>
                    {service.subServices.map((subService) => {
                      const serviceKey = `${headerName}-${service.id}`;
                      const selectedSubs = selectedSubServices[serviceKey] || [];
                      const isSubSelected = selectedSubs.includes(subService.id);

                      return (
                        <Grid item xs={12} sm={6} key={subService.id}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isSubSelected}
                                onChange={() => toggleSubService(headerName, service.id, subService.id)}
                                disabled={isDisabled}
                                color="primary"
                                size="small"
                              />
                            }
                            label={
                              <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
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
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              )}
            </Collapse>

            {/* Enhanced Year and Quarter Selection */}
            <Collapse in={isSelected && requiresYearSelection}>
              {isSelected && requiresYearSelection && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
                    {requiresYearOnly ? 'Select Years' : 'Select Years and Quarters'}
                  </Typography>
                  
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {YEAR_OPTIONS.map((year, yearIndex) => {
                      const isYearSelected = (selectedYears[serviceKey] || []).includes(year.value);
                      const yearQuarters = QUARTER_OPTIONS[year.value] || [];
                      const selectedQuartersForYear = (selectedQuarters[serviceKey] || []).filter(q => q.startsWith(year.value + '-')).length;
                      
                      // Create ref for this year section
                      if (!yearSectionRefs.current[serviceKey]) {
                        yearSectionRefs.current[serviceKey] = {};
                      }
                      if (!yearSectionRefs.current[serviceKey][year.value]) {
                        yearSectionRefs.current[serviceKey][year.value] = React.createRef();
                      }

                      return (
                        <Box
                          key={year.value}
                          ref={yearSectionRefs.current[serviceKey][year.value]}
                          sx={{ mb: 2 }}
                        >
                          {/* Year Selection with better styling */}
                          <Card
                            variant="outlined"
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              border: `1px solid ${isYearSelected ? theme.palette.primary.main : theme.palette.divider}`,
                              backgroundColor: isYearSelected 
                                ? alpha(theme.palette.primary.main, 0.05)
                                : 'transparent',
                              '&:hover': {
                                borderColor: theme.palette.primary.main,
                                backgroundColor: alpha(theme.palette.primary.main, 0.03)
                              }
                            }}
                            onClick={(e) => {
                              if (e.target.type !== 'checkbox') {
                                const checkbox = e.currentTarget.querySelector('input[type="checkbox"]');
                                if (checkbox) {
                                  checkbox.click();
                                  // Scroll to maintain position after state update
                                  setTimeout(() => {
                                    const ref = yearSectionRefs.current[serviceKey]?.[year.value];
                                    if (ref?.current) {
                                      ref.current.scrollIntoView({ 
                                        behavior: 'smooth', 
                                        block: 'nearest',
                                        inline: 'nearest'
                                      });
                                    }
                                  }, 100);
                                }
                              }
                            }}
                          >
                            <CardContent sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
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
                                        
                                        // Maintain scroll position
                                        setTimeout(() => {
                                          const ref = yearSectionRefs.current[serviceKey]?.[year.value];
                                          if (ref?.current) {
                                            ref.current.scrollIntoView({ 
                                              behavior: 'smooth', 
                                              block: 'nearest',
                                              inline: 'nearest'
                                            });
                                          }
                                        }, 50);
                                      }}
                                      color="primary"
                                    />
                                  }
                                  label={
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {year.label}
                                    </Typography>
                                  }
                                  sx={{ m: 0 }}
                                />
                                
                                {isYearSelected && selectedQuartersForYear > 0 && (
                                  <Badge 
                                    badgeContent={selectedQuartersForYear}
                                    color="primary"
                                    sx={{
                                      '& .MuiBadge-badge': {
                                        fontSize: '0.7rem',
                                        height: 18,
                                        minWidth: 18
                                      }
                                    }}
                                  >
                                    <Chip 
                                      label="Quarters"
                                      size="small"
                                      variant="outlined"
                                    />
                                  </Badge>
                                )}
                              </Box>
                            </CardContent>
                          </Card>

                          {/* Enhanced Quarter Selection */}
                          <Collapse in={isYearSelected && yearQuarters.length > 0 && !requiresYearOnly}>
                            {isYearSelected && yearQuarters.length > 0 && !requiresYearOnly && (
                              <Box sx={{ mt: 1, pl: 3 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                  Quarters:
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                  {yearQuarters.map((quarter) => {
                                    const isQuarterSelected = (selectedQuarters[serviceKey] || []).includes(quarter.value);
                                    
                                    return (
                                      <Chip
                                        key={quarter.value}
                                        label={quarter.label}
                                        clickable
                                        variant={isQuarterSelected ? "filled" : "outlined"}
                                        color={isQuarterSelected ? "primary" : "default"}
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
                                          fontSize: '0.75rem',
                                          height: 28,
                                          transition: 'all 0.2s',
                                          '&:hover': {
                                            transform: 'scale(1.05)'
                                          }
                                        }}
                                      />
                                    );
                                  })}
                                </Stack>
                              </Box>
                            )}
                          </Collapse>
                        </Box>
                      );
                    })}
                  </Box>

                  {(selectedYears[serviceKey]?.length > 0 || selectedQuarters[serviceKey]?.length > 0) && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Selected: {selectedYears[serviceKey]?.length || 0} year(s), {selectedQuarters[serviceKey]?.length || 0} quarter(s)
                      </Typography>
                    </Alert>
                  )}
                </Box>
              )}
            </Collapse>
          </CardContent>
        </Card>
      </Fade>
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
    <Box>
      {/* Enhanced Header Selection */}
      <Card sx={{ mb: 4, borderRadius: 3, overflow: 'visible' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: theme.palette.primary.main,
                mb: 1
              }}
            >
              Service Categories
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ fontSize: '1.1rem' }}
            >
              Select service categories and configure individual services
            </Typography>
          </Box>

          {/* Available Headers with enhanced styling */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Available Categories
            </Typography>
            <Grid container spacing={2}>
              {availableHeaders.map(header => (
                <Grid item xs={12} sm={6} md={4} key={header}>
                  <Button
                    variant="outlined"
                    onClick={() => addHeader(header)}
                    startIcon={<AddIcon />}
                    fullWidth
                    sx={{
                      py: 2,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 500,
                      transition: 'all 0.3s',
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4],
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        borderColor: theme.palette.primary.main
                      }
                    }}
                  >
                    {header}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Selected Headers with enhanced chips */}
          {selectedHeaders.length > 0 && (
            <Box sx={{ borderTop: selectedHeaders.length > 0 ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none', pt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
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
                    sx={{
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      py: 2.5,
                      px: 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Service Selection */}
      {currentHeader && (
        <Fade in={!!currentHeader} timeout={600}>
          <Card sx={{ mb: 4, borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Settings sx={{ mr: 2, color: theme.palette.primary.main }} />
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600,
                    color: theme.palette.primary.main
                  }}
                >
                  Configure Services for: {getHeaderDisplayName(currentHeader)}
                </Typography>
              </Box>

              {/* Main Services */}
              {mainServices.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Business sx={{ mr: 1.5, color: theme.palette.primary.main }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Core Services ({mainServices.length})
                    </Typography>
                  </Box>
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
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Extension sx={{ mr: 1.5, color: theme.palette.secondary.main }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Additional Services ({addonServices.length})
                    </Typography>
                  </Box>
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
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  No services available for this category.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Fade>
      )}

      {selectedHeaders.length === 0 && (
        <Card 
          sx={{ 
            textAlign: 'center',
            py: 6,
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
            borderRadius: 3
          }}
        >
          <CardContent>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
              Get Started
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Select a service category above to begin building your quotation
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Complete Button */}
      {selectedHeaders.length > 0 && Object.values(selectedServices).some(services => services.length > 0) && (
        <Slide direction="up" in={true} mountOnEnter>
          <Card 
            sx={{ 
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: 3
            }}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Ready to proceed?
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {Object.values(selectedServices).flat().length} services and{' '}
                {Object.values(selectedSubServices).flat().length} sub-services selected across{' '}
                {selectedHeaders.length} categories
              </Typography>

              {requiresApproval && (
                <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Warning sx={{ mr: 1 }} />
                    This quotation will require approval due to modifications from standard package selections.
                  </Box>
                </Alert>
              )}

              <Button
                variant="contained"
                size="large"
                onClick={handleComplete}
                startIcon={<Done />}
                sx={{
                  py: 2,
                  px: 4,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: theme.shadows[4],
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                Proceed to Pricing
              </Button>
            </CardContent>
          </Card>
        </Slide>
      )}

      {/* Enhanced Custom Header Name Dialog */}
      <Dialog 
        open={showCustomHeaderDialog}
        onClose={handleCustomHeaderCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Create Custom Header
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter a name for your custom service category
          </Typography>
          
          <TextField
            autoFocus
            fullWidth
            variant="outlined"
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
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleCustomHeaderCancel}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCustomHeaderConfirm}
            disabled={!pendingCustomHeader.trim()}
            sx={{ textTransform: 'none' }}
          >
            Create Header
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}