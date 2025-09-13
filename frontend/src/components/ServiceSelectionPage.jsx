import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  FormControlLabel,
  TextField,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Button,
  Divider,
  Paper,
  Grid,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Switch,
  InputAdornment,
  Container,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Calculate as CalculateIcon,
  Receipt as ReceiptIcon,
  Save as SaveIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Pricing data extracted from the Excel file
const PRICING_DATA = {
  individual: {
    entity_display_name: "Individual",
    fixed_services: {
      training: { price: 5900, editable: false, required: false },
      exam: { price: 1500, editable: false, required: false },
      govt_fees: { price: 11121, editable: false, required: true }
    },
    professional_fees_rates: {
      training_exam_only: { price: 2500, condition: "training=true AND exam=true AND govt_fees=false", description: "Professional fees when only Training and Exam are selected" },
      rera_only: { price: 4000, condition: "training=false AND exam=false AND govt_fees=true", description: "Professional fees when only RERA (Government fees) is selected" },
      with_training_exam: { price: 7000, condition: "training=true AND exam=true AND govt_fees=true", description: "Professional fees when Training, Exam, and Government fees are all selected" }
    },
    renewal_fees_rates: {
      rera_only: { price: 4000, condition: "rera_renewal_only", description: "Renewal fees for RERA only" },
      with_training_exam: { price: 7000, condition: "rera_renewal_with_training_exam", description: "Renewal fees for RERA with training and exam" }
    },
    other_services: {
      scrutiny_assistance: { default_price: 3000, editable: true, required: false },
      deregistration: { default_price: 3000, editable: true, required: false },
      correction: { default_price: 2500, editable: true, required: false }
    },
    hpr_options: {
      nil: { default_price: 1500, editable: true, description: "HPR NIL option" },
      upto_50: { default_price: 2500, editable: true, description: "HPR Up to 50 option" },
      above_50: { default_price: null, editable: true, input_required: true, validation: { type: "number", min: 0 }, description: "HPR Above 50 option - custom price input required" }
    }
  },
  proprietary: {
    entity_display_name: "Proprietary",
    fixed_services: {
      training: { price: 5900, editable: false, required: false },
      exam: { price: 1500, editable: false, required: false },
      govt_fees: { price: 11121, editable: false, required: true }
    },
    professional_fees_rates: {
      training_exam_only: { price: 2500, condition: "training=true AND exam=true AND govt_fees=false", description: "Professional fees when only Training and Exam are selected" },
      rera_only: { price: 5000, condition: "training=false AND exam=false AND govt_fees=true", description: "Professional fees when only RERA (Government fees) is selected" },
      with_training_exam: { price: 7000, condition: "training=true AND exam=true AND govt_fees=true", description: "Professional fees when Training, Exam, and Government fees are all selected" }
    },
    renewal_fees_rates: {
      rera_only: { price: 5000, condition: "rera_renewal_only", description: "Renewal fees for RERA only" },
      with_training_exam: { price: 7000, condition: "rera_renewal_with_training_exam", description: "Renewal fees for RERA with training and exam" }
    },
    other_services: {
      scrutiny_assistance: { default_price: 3000, editable: true, required: false },
      deregistration: { default_price: 3000, editable: true, required: false },
      correction: { default_price: 2500, editable: true, required: false }
    },
    hpr_options: {
      nil: { default_price: 1500, editable: true, description: "HPR NIL option" },
      upto_50: { default_price: 2500, editable: true, description: "HPR Up to 50 option" },
      above_50: { default_price: null, editable: true, input_required: true, validation: { type: "number", min: 0 }, description: "HPR Above 50 option - custom price input required" }
    }
  },
  private_ltd: {
    entity_display_name: "Private Ltd",
    fixed_services: {
      training: { price: 5900, editable: false, required: false },
      exam: { price: 1500, editable: false, required: false },
      govt_fees: { price: 101121, editable: false, required: true }
    },
    professional_fees_rates: {
      training_exam_only: { price: 2500, condition: "training=true AND exam=true AND govt_fees=false", description: "Professional fees when only Training and Exam are selected" },
      rera_only: { price: 10000, condition: "training=false AND exam=false AND govt_fees=true", description: "Professional fees when only RERA (Government fees) is selected" },
      with_training_exam: { price: 15000, condition: "training=true AND exam=true AND govt_fees=true", description: "Professional fees when Training, Exam, and Government fees are all selected" }
    },
    renewal_fees_rates: {
      rera_only: { price: 10000, condition: "rera_renewal_only", description: "Renewal fees for RERA only" },
      with_training_exam: { price: 15000, condition: "rera_renewal_with_training_exam", description: "Renewal fees for RERA with training and exam" }
    },
    other_services: {
      scrutiny_assistance: { default_price: 7000, editable: true, required: false },
      deregistration: { default_price: 5000, editable: true, required: false },
      correction: { default_price: 5000, editable: true, required: false }
    },
    hpr_options: {
      nil: { default_price: 1500, editable: true, description: "HPR NIL option" },
      upto_50: { default_price: 2500, editable: true, description: "HPR Up to 50 option" },
      above_50: { default_price: null, editable: true, input_required: true, validation: { type: "number", min: 0 }, description: "HPR Above 50 option - custom price input required" }
    }
  }
};

const ServiceSelectionPage = () => {
  // State management
  const [entityType, setEntityType] = useState('individual');
  const [selectedServices, setSelectedServices] = useState({
    registration: {
      training: false,
      exam: false,
      govt_fees: true, // Always true for registration
      professional_fees: 0,
      professional_fees_override: null,
    },
    renewal: {
      selected: false,
      renewal_fees: 0,
      renewal_fees_override: null,
    },
    scrutiny_assistance: {
      selected: false,
      price: 0,
      price_override: null,
    },
    deregistration: {
      selected: false,
      price: 0,
      price_override: null,
    },
    correction: {
      selected: false,
      price: 0,
      price_override: null,
    },
    hpr: {
      selected: false,
      option: null, // 'nil', 'upto_50', 'above_50'
      price: 0,
      custom_price: null,
    }
  });

  const [calculations, setCalculations] = useState({
    subtotals: {},
    grandTotal: 0,
    breakdown: []
  });

  const [errors, setErrors] = useState({});

  // Get current pricing data
  const currentPricing = PRICING_DATA[entityType];

  // Professional fees calculation function
  const calculateProfessionalFees = (entityType, services) => {
    const pricing = PRICING_DATA[entityType];

    const hasTraining = services.registration.training;
    const hasExam = services.registration.exam;
    const hasGovtFees = services.registration.govt_fees; // Always true for registration

    if (hasTraining && hasExam && !hasGovtFees) {
      return pricing.professional_fees_rates.training_exam_only.price;
    } else if (!hasTraining && !hasExam && hasGovtFees) {
      return pricing.professional_fees_rates.rera_only.price;
    } else if (hasTraining && hasExam && hasGovtFees) {
      return pricing.professional_fees_rates.with_training_exam.price;
    }

    return 0;
  };

  // Renewal fees calculation function
  const calculateRenewalFees = (entityType, services) => {
    const pricing = PRICING_DATA[entityType];

    if (services.registration.training && services.registration.exam) {
      return pricing.renewal_fees_rates.with_training_exam.price;
    } else {
      return pricing.renewal_fees_rates.rera_only.price;
    }
  };

  // Total calculation function
  const calculateGrandTotal = (services) => {
    let total = 0;
    const breakdown = [];
    const subtotals = {};

    // Registration services
    let registrationTotal = 0;

    if (services.registration.govt_fees) {
      const price = currentPricing.fixed_services.govt_fees.price;
      registrationTotal += price;
      breakdown.push({ service: 'Government Fees', price, category: 'registration' });
    }

    if (services.registration.training) {
      const price = currentPricing.fixed_services.training.price;
      registrationTotal += price;
      breakdown.push({ service: 'Training', price, category: 'registration' });
    }

    if (services.registration.exam) {
      const price = currentPricing.fixed_services.exam.price;
      registrationTotal += price;
      breakdown.push({ service: 'Exam', price, category: 'registration' });
    }

    // Professional fees
    const professionalFees = services.registration.professional_fees_override || 
                            calculateProfessionalFees(entityType, services);
    if (professionalFees > 0) {
      registrationTotal += professionalFees;
      breakdown.push({ service: 'Professional Fees', price: professionalFees, category: 'registration', editable: true });
    }

    subtotals.registration = registrationTotal;
    total += registrationTotal;

    // Renewal
    if (services.renewal.selected) {
      const renewalFees = services.renewal.renewal_fees_override || 
                         calculateRenewalFees(entityType, services);
      subtotals.renewal = renewalFees;
      total += renewalFees;
      breakdown.push({ service: 'Renewal Fees', price: renewalFees, category: 'renewal', editable: true });
    }

    // Other services
    let otherServicesTotal = 0;
    if (services.scrutiny_assistance.selected) {
      const price = services.scrutiny_assistance.price_override || 
                   currentPricing.other_services.scrutiny_assistance.default_price;
      otherServicesTotal += price;
      breakdown.push({ service: 'Scrutiny Assistance', price, category: 'other', editable: true });
    }

    if (services.deregistration.selected) {
      const price = services.deregistration.price_override || 
                   currentPricing.other_services.deregistration.default_price;
      otherServicesTotal += price;
      breakdown.push({ service: 'Deregistration', price, category: 'other', editable: true });
    }

    if (services.correction.selected) {
      const price = services.correction.price_override || 
                   currentPricing.other_services.correction.default_price;
      otherServicesTotal += price;
      breakdown.push({ service: 'Correction', price, category: 'other', editable: true });
    }

    subtotals.other_services = otherServicesTotal;
    total += otherServicesTotal;

    // HPR
    if (services.hpr.selected && services.hpr.option) {
      let hprPrice = 0;
      if (services.hpr.option === 'above_50') {
        hprPrice = services.hpr.custom_price || 0;
      } else {
        hprPrice = currentPricing.hpr_options[services.hpr.option].default_price;
      }
      subtotals.hpr = hprPrice;
      total += hprPrice;
      breakdown.push({ service: `HPR (${services.hpr.option.replace('_', ' ').toUpperCase()})`, price: hprPrice, category: 'hpr', editable: true });
    }

    return { total, breakdown, subtotals };
  };

  // Update calculations whenever services change
  useEffect(() => {
    const newCalculations = calculateGrandTotal(selectedServices);
    setCalculations(newCalculations);

    // Update professional fees in state
    if (selectedServices.registration.professional_fees_override === null) {
      setSelectedServices(prev => ({
        ...prev,
        registration: {
          ...prev.registration,
          professional_fees: calculateProfessionalFees(entityType, selectedServices)
        }
      }));
    }

    // Update renewal fees in state
    if (selectedServices.renewal.selected && selectedServices.renewal.renewal_fees_override === null) {
      setSelectedServices(prev => ({
        ...prev,
        renewal: {
          ...prev.renewal,
          renewal_fees: calculateRenewalFees(entityType, selectedServices)
        }
      }));
    }
  }, [selectedServices, entityType]);

  // Handle service selection changes
  const handleServiceChange = (category, field, value) => {
    setSelectedServices(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  // Handle price override changes
  const handlePriceOverride = (category, field, value) => {
    const numValue = value === '' ? null : parseFloat(value);
    setSelectedServices(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: numValue
      }
    }));
  };

  // Handle entity type change
  const handleEntityTypeChange = (newEntityType) => {
    setEntityType(newEntityType);
    // Reset overrides when entity type changes
    setSelectedServices(prev => ({
      ...prev,
      registration: {
        ...prev.registration,
        professional_fees_override: null
      },
      renewal: {
        ...prev.renewal,
        renewal_fees_override: null
      },
      scrutiny_assistance: {
        ...prev.scrutiny_assistance,
        price_override: null
      },
      deregistration: {
        ...prev.deregistration,
        price_override: null
      },
      correction: {
        ...prev.correction,
        price_override: null
      }
    }));
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (selectedServices.hpr.selected && selectedServices.hpr.option === 'above_50' && (!selectedServices.hpr.custom_price || selectedServices.hpr.custom_price <= 0)) {
      newErrors.hpr_custom_price = 'Custom price is required for Above 50 option and must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save selection function
  const handleSaveSelection = () => {
    if (validateForm()) {
      const selectionData = {
        entity_type: entityType,
        selected_services: selectedServices,
        calculations: calculations,
        timestamp: new Date().toISOString()
      };

      console.log('Saving selection:', selectionData);
      // Here you would typically send this data to your backend API
      alert('Service selection saved successfully!');
    }
  };

  // Generate quotation function
  const handleGenerateQuotation = () => {
    if (validateForm()) {
      console.log('Generating quotation for:', { entityType, selectedServices, calculations });
      // Here you would typically call your quotation generation API
      alert('Quotation generated successfully!');
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
        <Toolbar>
          <CalculateIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            RERA Agent Service Selection & Pricing
          </Typography>
          <Chip 
            label={`Entity: ${currentPricing.entity_display_name}`} 
            color="secondary" 
            variant="outlined" 
            sx={{ color: 'white', borderColor: 'white' }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Entity Type Selection */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Entity Type Selection
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                row
                value={entityType}
                onChange={(e) => handleEntityTypeChange(e.target.value)}
              >
                <FormControlLabel value="individual" control={<Radio />} label="Individual" />
                <FormControlLabel value="proprietary" control={<Radio />} label="Proprietary" />
                <FormControlLabel value="private_ltd" control={<Radio />} label="Private Ltd" />
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Left Column - Service Selection */}
          <Grid item xs={12} md={8}>
            {/* Registration & Professional Fees */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Registration & Professional Fees
                  <Chip 
                    label={`₹${calculations.subtotals.registration || 0}`} 
                    color="primary" 
                    size="small" 
                    sx={{ ml: 2 }} 
                  />
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {/* Training */}
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedServices.registration.training}
                          onChange={(e) => handleServiceChange('registration', 'training', e.target.checked)}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1">Training</Typography>
                          <Typography variant="body2" color="text.secondary">
                            ₹{currentPricing.fixed_services.training.price} (Fixed)
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>

                  {/* Exam */}
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedServices.registration.exam}
                          onChange={(e) => handleServiceChange('registration', 'exam', e.target.checked)}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1">Exam</Typography>
                          <Typography variant="body2" color="text.secondary">
                            ₹{currentPricing.fixed_services.exam.price} (Fixed)
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>

                  {/* Government Fees */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        Government Fees (Required)
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ₹{currentPricing.fixed_services.govt_fees.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        This fee is mandatory and cannot be modified
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* Professional Fees */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Professional Fees"
                      type="number"
                      value={selectedServices.registration.professional_fees_override || selectedServices.registration.professional_fees}
                      onChange={(e) => handlePriceOverride('registration', 'professional_fees_override', e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Calculated based on selected services. You can override this value.">
                              <InfoIcon color="action" />
                            </Tooltip>
                          </InputAdornment>
                        )
                      }}
                      helperText="Calculated automatically based on selected services (editable)"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Renewal */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Renewal Services
                  {selectedServices.renewal.selected && (
                    <Chip 
                      label={`₹${calculations.subtotals.renewal || 0}`} 
                      color="secondary" 
                      size="small" 
                      sx={{ ml: 2 }} 
                    />
                  )}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={selectedServices.renewal.selected}
                          onChange={(e) => handleServiceChange('renewal', 'selected', e.target.checked)}
                        />
                      }
                      label="Include Renewal Services"
                    />
                  </Grid>

                  {selectedServices.renewal.selected && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Renewal Fees"
                        type="number"
                        value={selectedServices.renewal.renewal_fees_override || selectedServices.renewal.renewal_fees}
                        onChange={(e) => handlePriceOverride('renewal', 'renewal_fees_override', e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>
                        }}
                        helperText="Renewal fees based on registration services selected (editable)"
                      />
                    </Grid>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Additional Services */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Additional Services
                  {calculations.subtotals.other_services > 0 && (
                    <Chip 
                      label={`₹${calculations.subtotals.other_services}`} 
                      color="success" 
                      size="small" 
                      sx={{ ml: 2 }} 
                    />
                  )}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {/* Scrutiny Assistance */}
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={selectedServices.scrutiny_assistance.selected}
                          onChange={(e) => handleServiceChange('scrutiny_assistance', 'selected', e.target.checked)}
                        />
                      }
                      label="Scrutiny Assistance"
                    />
                    {selectedServices.scrutiny_assistance.selected && (
                      <TextField
                        fullWidth
                        type="number"
                        value={selectedServices.scrutiny_assistance.price_override || currentPricing.other_services.scrutiny_assistance.default_price}
                        onChange={(e) => handlePriceOverride('scrutiny_assistance', 'price_override', e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>
                        }}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Grid>

                  {/* Deregistration */}
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={selectedServices.deregistration.selected}
                          onChange={(e) => handleServiceChange('deregistration', 'selected', e.target.checked)}
                        />
                      }
                      label="Deregistration"
                    />
                    {selectedServices.deregistration.selected && (
                      <TextField
                        fullWidth
                        type="number"
                        value={selectedServices.deregistration.price_override || currentPricing.other_services.deregistration.default_price}
                        onChange={(e) => handlePriceOverride('deregistration', 'price_override', e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>
                        }}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Grid>

                  {/* Correction */}
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={selectedServices.correction.selected}
                          onChange={(e) => handleServiceChange('correction', 'selected', e.target.checked)}
                        />
                      }
                      label="Correction"
                    />
                    {selectedServices.correction.selected && (
                      <TextField
                        fullWidth
                        type="number"
                        value={selectedServices.correction.price_override || currentPricing.other_services.correction.default_price}
                        onChange={(e) => handlePriceOverride('correction', 'price_override', e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>
                        }}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* HPR */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  HPR (Healthcare Professional Registration)
                  {selectedServices.hpr.selected && (
                    <Chip 
                      label={`₹${calculations.subtotals.hpr || 0}`} 
                      color="warning" 
                      size="small" 
                      sx={{ ml: 2 }} 
                    />
                  )}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={selectedServices.hpr.selected}
                          onChange={(e) => handleServiceChange('hpr', 'selected', e.target.checked)}
                        />
                      }
                      label="Include HPR Services"
                    />
                  </Grid>

                  {selectedServices.hpr.selected && (
                    <>
                      <Grid item xs={12}>
                        <FormControl component="fieldset">
                          <FormLabel component="legend">HPR Option</FormLabel>
                          <RadioGroup
                            value={selectedServices.hpr.option}
                            onChange={(e) => handleServiceChange('hpr', 'option', e.target.value)}
                          >
                            <FormControlLabel 
                              value="nil" 
                              control={<Radio />} 
                              label={`NIL (₹${currentPricing.hpr_options.nil.default_price})`} 
                            />
                            <FormControlLabel 
                              value="upto_50" 
                              control={<Radio />} 
                              label={`Up to 50 (₹${currentPricing.hpr_options.upto_50.default_price})`} 
                            />
                            <FormControlLabel 
                              value="above_50" 
                              control={<Radio />} 
                              label="Above 50 (Custom Price)" 
                            />
                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      {selectedServices.hpr.option === 'above_50' && (
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Custom Price for Above 50"
                            type="number"
                            value={selectedServices.hpr.custom_price || ''}
                            onChange={(e) => handleServiceChange('hpr', 'custom_price', parseFloat(e.target.value) || null)}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>
                            }}
                            error={!!errors.hpr_custom_price}
                            helperText={errors.hpr_custom_price || 'Enter custom price for above 50 professionals'}
                            required
                          />
                        </Grid>
                      )}
                    </>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Right Column - Summary & Actions */}
          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <ReceiptIcon sx={{ mr: 1 }} />
                  Price Summary
                </Typography>

                <Divider sx={{ mb: 2 }} />

                {/* Breakdown */}
                {calculations.breakdown.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {item.service}
                      {item.editable && (
                        <Chip label="Editable" size="small" variant="outlined" sx={{ ml: 1, height: 20 }} />
                      )}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      ₹{item.price.toLocaleString()}
                    </Typography>
                  </Box>
                ))}

                <Divider sx={{ my: 2 }} />

                {/* Grand Total */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Grand Total
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    ₹{calculations.grandTotal.toLocaleString()}
                  </Typography>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<SaveIcon />}
                    onClick={handleSaveSelection}
                    disabled={calculations.grandTotal === 0}
                  >
                    Save Selection
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ReceiptIcon />}
                    onClick={handleGenerateQuotation}
                    disabled={calculations.grandTotal === 0}
                  >
                    Generate Quotation
                  </Button>
                </Box>

                {/* Validation Alerts */}
                {Object.keys(errors).length > 0 && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    Please fix the following errors:
                    <ul>
                      {Object.values(errors).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </Alert>
                )}

                {calculations.grandTotal === 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Please select at least one service to proceed.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ServiceSelectionPage;