import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  Alert,
  Paper,
  Chip,
  Container,
  CircularProgress,
  Stack,
  MenuItem,
  TextField,
  InputAdornment,
  Collapse
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  School as TrainingIcon,
  Quiz as ExamIcon,
  AccountBalance as GovtIcon,
  PersonAdd as RegistrationIcon,
  Refresh as RenewalIcon,
  Search as ScrutinyIcon,
  LocalHospital as HPRIcon,
  RemoveCircle as DeregistrationIcon,
  Edit as CorrectionIcon,
  CurrencyRupee as CurrencyIcon
} from '@mui/icons-material';

// Enhanced theme - EXACTLY matching CreateQuotation
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#388e3c',
      light: '#66bb6a',
      dark: '#2e7d32',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    success: {
      main: '#388e3c',
      light: '#e8f5e8',
    },
    warning: {
      main: '#f57c00',
      light: '#fff3e0',
    },
    error: {
      main: '#d32f2f',
      light: '#ffebee',
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 900,
      color: '#000000',
      fontFamily: '"Times New Roman", serif',
    },
    h5: {
      fontWeight: 600,
      color: '#2d3748',
    },
    h6: {
      fontWeight: 600,
      color: '#4a5568',
    },
    body1: {
      color: '#4a5568',
    },
    body2: {
      color: '#718096',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '10px 24px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

// Enhanced styles for form fields - EXACTLY matching CreateQuotation
const fieldStyles = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#f8fafc',
    transition: 'all 0.2s ease-in-out',
    height: '56px',
    '&:hover': {
      backgroundColor: '#f1f5f9',
      transform: 'none',
    },
    '&.Mui-focused': {
      backgroundColor: 'white',
      boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
      transform: 'none',
    },
  },
  '& .MuiInputLabel-root': {
    transform: 'translate(14px, 16px) scale(1)',
    '&.Mui-focused, &.MuiFormLabel-filled': {
      transform: 'translate(14px, -9px) scale(0.75)',
    },
  },
  '& .MuiInputBase-input': {
    height: 'auto',
    padding: '16px 14px',
  },
};

// Default pricing data with added "above_50" option for HPR
const DEFAULT_PRICING_DATA = {
  Individual: {
    Training: 5900,
    Exam: 1500,
    Govt_fees: 11121,
    Registration_Professional: {
      only_training_exam: 2500,
      only_rera: 4000,
      with_training_exam: 7000
    },
    Renewal: {
      only_rera: 4000,
      with_training_exam: 7000
    },
    Scrutiny_Assistance: 3000,
    HPR: {
      nil: 1500,
      upto_50: 2500,
      above_50: 0 // Blank/editable field
    },
    Deregistration: 3000,
    Correction: 2500
  },
  Proprietary: {
    Training: 5900,
    Exam: 1500,
    Govt_fees: 11121,
    Registration_Professional: {
      only_training_exam: 2500,
      only_rera: 5000,
      with_training_exam: 7000
    },
    Renewal: {
      only_rera: 5000,
      with_training_exam: 7000
    },
    Scrutiny_Assistance: 3000,
    HPR: {
      nil: 1500,
      upto_50: 2500,
      above_50: 0
    },
    Deregistration: 3000,
    Correction: 2500
  },
  'Private Ltd': {
    Training: 5900,
    Exam: 1500,
    Govt_fees: 101121,
    Registration_Professional: {
      only_training_exam: 2500,
      only_rera: 10000,
      with_training_exam: 15000
    },
    Renewal: {
      only_rera: 10000,
      with_training_exam: 15000
    },
    Scrutiny_Assistance: 7000,
    HPR: {
      nil: 1500,
      upto_50: 2500,
      above_50: 0
    },
    Deregistration: 5000,
    Correction: 5000
  },
  LLP: {
    Training: 5900,
    Exam: 1500,
    Govt_fees: 101121,
    Registration_Professional: {
      only_training_exam: 2500,
      only_rera: 10000,
      with_training_exam: 15000
    },
    Renewal: {
      only_rera: 10000,
      with_training_exam: 15000
    },
    Scrutiny_Assistance: 7000,
    HPR: {
      nil: 1500,
      upto_50: 2500,
      above_50: 0
    },
    Deregistration: 5000,
    Correction: 5000
  },
  Partnership: {
    Training: 5900,
    Exam: 1500,
    Govt_fees: 101121,
    Registration_Professional: {
      only_training_exam: 2500,
      only_rera: 10000,
      with_training_exam: 15000
    },
    Renewal: {
      only_rera: 10000,
      with_training_exam: 15000
    },
    Scrutiny_Assistance: 7000,
    HPR: {
      nil: 1500,
      upto_50: 2500,
      above_50: 0
    },
    Deregistration: 5000,
    Correction: 5000
  },
  Others: {
    Training: 5900,
    Exam: 1500,
    Govt_fees: 101121,
    Registration_Professional: {
      only_training_exam: 2500,
      only_rera: 10000,
      with_training_exam: 15000
    },
    Renewal: {
      only_rera: 10000,
      with_training_exam: 15000
    },
    Scrutiny_Assistance: 7000,
    HPR: {
      nil: 1500,
      upto_50: 2500,
      above_50: 0
    },
    Deregistration: 5000,
    Correction: 5000
  }
};

export default function AgentServiceSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { agentData, quotationId } = location.state || {};
  
  // State for selected services
  const [selectedServices, setSelectedServices] = useState({
    training: false,
    exam: false,
    govt_fees: false,
    registration_professional: '',
    renewal: '',
    scrutiny_assistance: false,
    hpr: '',
    deregistration: false,
    correction: false
  });

  // State for editable pricing - initialize with default values
  const [customPricing, setCustomPricing] = useState(() => {
    return JSON.parse(JSON.stringify(DEFAULT_PRICING_DATA));
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!agentData || !quotationId) {
      navigate('/quotations/new/agent');
    }
  }, [agentData, quotationId, navigate]);

  const currentPricing = customPricing[agentData?.agentType] || customPricing.Individual;

  // Handle price changes for simple services
  const handlePriceChange = (service) => (event) => {
    const value = parseInt(event.target.value) || 0;
    setCustomPricing(prev => ({
      ...prev,
      [agentData?.agentType || 'Individual']: {
        ...prev[agentData?.agentType || 'Individual'],
        [service]: value
      }
    }));
  };

  // Handle price changes for nested services
  const handleNestedPriceChange = (service, subService) => (event) => {
    const value = parseInt(event.target.value) || 0;
    setCustomPricing(prev => ({
      ...prev,
      [agentData?.agentType || 'Individual']: {
        ...prev[agentData?.agentType || 'Individual'],
        [service]: {
          ...prev[agentData?.agentType || 'Individual'][service],
          [subService]: value
        }
      }
    }));
  };

  const totalCost = useMemo(() => {
    let total = 0;
    if (selectedServices.training) total += currentPricing.Training;
    if (selectedServices.exam) total += currentPricing.Exam;
    if (selectedServices.govt_fees) total += currentPricing.Govt_fees;
    if (selectedServices.scrutiny_assistance) total += currentPricing.Scrutiny_Assistance;
    if (selectedServices.deregistration) total += currentPricing.Deregistration;
    if (selectedServices.correction) total += currentPricing.Correction;
    if (selectedServices.registration_professional) {
      total += currentPricing.Registration_Professional[selectedServices.registration_professional];
    }
    if (selectedServices.renewal) {
      total += currentPricing.Renewal[selectedServices.renewal];
    }
    if (selectedServices.hpr) {
      total += currentPricing.HPR[selectedServices.hpr];
    }
    return total;
  }, [selectedServices, currentPricing]);

  const handleServiceChange = (service) => (event) => {
    setSelectedServices(prev => ({
      ...prev,
      [service]: event.target.checked
    }));
  };

  const handleSelectChange = (service) => (event) => {
    setSelectedServices(prev => ({
      ...prev,
      [service]: event.target.value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to continue');
        return;
      }

      // Build services list with custom prices
      const selectedServicesList = [];
      if (selectedServices.training) selectedServicesList.push({ name: 'Training', price: currentPricing.Training });
      if (selectedServices.exam) selectedServicesList.push({ name: 'Exam', price: currentPricing.Exam });
      if (selectedServices.govt_fees) selectedServicesList.push({ name: 'Government Fees', price: currentPricing.Govt_fees });
      if (selectedServices.scrutiny_assistance) selectedServicesList.push({ name: 'Scrutiny Assistance', price: currentPricing.Scrutiny_Assistance });
      if (selectedServices.deregistration) selectedServicesList.push({ name: 'Deregistration', price: currentPricing.Deregistration });
      if (selectedServices.correction) selectedServicesList.push({ name: 'Correction', price: currentPricing.Correction });
      
      if (selectedServices.registration_professional) {
        const regPrice = currentPricing.Registration_Professional[selectedServices.registration_professional];
        const regLabel = selectedServices.registration_professional.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        selectedServicesList.push({ name: `Registration & Professional (${regLabel})`, price: regPrice });
      }
      
      if (selectedServices.renewal) {
        const renewalPrice = currentPricing.Renewal[selectedServices.renewal];
        const renewalLabel = selectedServices.renewal.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        selectedServicesList.push({ name: `Renewal (${renewalLabel})`, price: renewalPrice });
      }
      
      if (selectedServices.hpr) {
        const hprPrice = currentPricing.HPR[selectedServices.hpr];
        const hprLabel = selectedServices.hpr === 'nil' ? 'NIL' : selectedServices.hpr === 'upto_50' ? 'Up to 50' : 'Above 50';
        selectedServicesList.push({ name: `HPR (${hprLabel})`, price: hprPrice });
      }

      // Update services and custom pricing in backend
      const servicesResponse = await fetch(`http://localhost:3001/api/agent-registrations/${quotationId}/services`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          services: selectedServicesList,
          customPricing: customPricing[agentData?.agentType || 'Individual']
        })
      });

      if (!servicesResponse.ok) {
        const errorData = await servicesResponse.json();
        setError(errorData.error || 'Failed to update services');
        return;
      }

      // Navigate to summary
      navigate('/agent-quotation-summary', {
        state: {
          agentData,
          selectedServices: selectedServicesList,
          totalCost,
          quotationId,
          customPricing: customPricing[agentData?.agentType || 'Individual']
        }
      });
    } catch (error) {
      console.error('Failed to update services:', error);
      setError('Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = Object.values(selectedServices).some(value =>
    typeof value === 'boolean' ? value : value !== ''
  );

  if (!agentData) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Enhanced Header - EXACT same styling as CreateQuotation */}
          <Paper sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white', 
            p: 4, 
            borderRadius: 3, 
            mb: 3, 
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)' 
          }}>
            <Typography variant="h4" gutterBottom sx={{ color: 'white', fontWeight: 900 }}>
              Agent Service Selection
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 400 }}>
              Select required services for {agentData.agentName} ({agentData.agentType})
            </Typography>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Main Form Card - EXACT same styling as CreateQuotation */}
          <Card>
            <CardContent sx={{ p: 4 }}>
              {/* Section Header */}
              <Typography variant="h6" sx={{ mb: 3, color: theme.palette.grey[700], fontWeight: 600 }}>
                Service Configuration & Pricing
              </Typography>
              <Typography variant="body2" sx={{ mb: 4, color: theme.palette.grey[600] }}>
                Select services and customize pricing as needed
              </Typography>

              <Stack spacing={4}>
                {/* Row 1: Basic Services */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <TrainingIcon sx={{ mr: 1 }} />
                    Basic Services
                  </Typography>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Box sx={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: 2, p: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedServices.training}
                            onChange={handleServiceChange('training')}
                          />
                        }
                        label="Training"
                        sx={{ mb: 1 }}
                      />
                      {selectedServices.training && (
                        <Collapse in={selectedServices.training}>
                          <TextField
                            label="Training Price"
                            type="number"
                            value={currentPricing.Training}
                            onChange={handlePriceChange('Training')}
                            fullWidth
                            size="small"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>
                            }}
                            sx={{ ...fieldStyles, '& .MuiOutlinedInput-root': { height: '40px' } }}
                          />
                        </Collapse>
                      )}
                    </Box>
                    
                    <Box sx={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: 2, p: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedServices.exam}
                            onChange={handleServiceChange('exam')}
                          />
                        }
                        label="Exam"
                        sx={{ mb: 1 }}
                      />
                      {selectedServices.exam && (
                        <Collapse in={selectedServices.exam}>
                          <TextField
                            label="Exam Price"
                            type="number"
                            value={currentPricing.Exam}
                            onChange={handlePriceChange('Exam')}
                            fullWidth
                            size="small"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>
                            }}
                            sx={{ ...fieldStyles, '& .MuiOutlinedInput-root': { height: '40px' } }}
                          />
                        </Collapse>
                      )}
                    </Box>

                    <Box sx={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: 2, p: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedServices.govt_fees}
                            onChange={handleServiceChange('govt_fees')}
                          />
                        }
                        label="Government Fees"
                        sx={{ mb: 1 }}
                      />
                      {selectedServices.govt_fees && (
                        <Collapse in={selectedServices.govt_fees}>
                          <TextField
                            label="Govt Fees Price"
                            type="number"
                            value={currentPricing.Govt_fees}
                            onChange={handlePriceChange('Govt_fees')}
                            fullWidth
                            size="small"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>
                            }}
                            sx={{ ...fieldStyles, '& .MuiOutlinedInput-root': { height: '40px' } }}
                          />
                        </Collapse>
                      )}
                    </Box>
                  </Stack>
                </Box>

                {/* Row 2: Registration & Professional */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <RegistrationIcon sx={{ mr: 1 }} />
                    Registration & Professional
                  </Typography>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      select
                      label="Registration Options"
                      value={selectedServices.registration_professional}
                      onChange={handleSelectChange('registration_professional')}
                      sx={{ ...fieldStyles, flex: 1 }}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value="only_training_exam">
                        Only Training & Exam - ₹{currentPricing.Registration_Professional.only_training_exam.toLocaleString()}
                      </MenuItem>
                      <MenuItem value="only_rera">
                        Only RERA - ₹{currentPricing.Registration_Professional.only_rera.toLocaleString()}
                      </MenuItem>
                      <MenuItem value="with_training_exam">
                        With Training & Exam - ₹{currentPricing.Registration_Professional.with_training_exam.toLocaleString()}
                      </MenuItem>
                    </TextField>
                    
                    {/* Show only the selected option's price field */}
                    {selectedServices.registration_professional && (
                      <Collapse in={!!selectedServices.registration_professional}>
                        <Box sx={{ flex: 1 }}>
                          {selectedServices.registration_professional === 'only_training_exam' && (
                            <TextField
                              label="Training & Exam Price"
                              type="number"
                              value={currentPricing.Registration_Professional.only_training_exam}
                              onChange={handleNestedPriceChange('Registration_Professional', 'only_training_exam')}
                              size="small"
                              fullWidth
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>
                              }}
                              sx={{ ...fieldStyles, '& .MuiOutlinedInput-root': { height: '40px' } }}
                            />
                          )}
                          {selectedServices.registration_professional === 'only_rera' && (
                            <TextField
                              label="Only RERA Price"
                              type="number"
                              value={currentPricing.Registration_Professional.only_rera}
                              onChange={handleNestedPriceChange('Registration_Professional', 'only_rera')}
                              size="small"
                              fullWidth
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>
                              }}
                              sx={{ ...fieldStyles, '& .MuiOutlinedInput-root': { height: '40px' } }}
                            />
                          )}
                          {selectedServices.registration_professional === 'with_training_exam' && (
                            <TextField
                              label="With Training & Exam Price"
                              type="number"
                              value={currentPricing.Registration_Professional.with_training_exam}
                              onChange={handleNestedPriceChange('Registration_Professional', 'with_training_exam')}
                              size="small"
                              fullWidth
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>
                              }}
                              sx={{ ...fieldStyles, '& .MuiOutlinedInput-root': { height: '40px' } }}
                            />
                          )}
                        </Box>
                      </Collapse>
                    )}
                  </Stack>
                </Box>

                {/* Row 3: Renewal Services */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <RenewalIcon sx={{ mr: 1 }} />
                    Renewal Services
                  </Typography>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      select
                      label="Renewal Options"
                      value={selectedServices.renewal}
                      onChange={handleSelectChange('renewal')}
                      sx={{ ...fieldStyles, flex: 1 }}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value="only_rera">
                        Only RERA - ₹{currentPricing.Renewal.only_rera.toLocaleString()}
                      </MenuItem>
                      <MenuItem value="with_training_exam">
                        With Training & Exam - ₹{currentPricing.Renewal.with_training_exam.toLocaleString()}
                      </MenuItem>
                    </TextField>
                    
                    {/* Show only the selected option's price field */}
                    {selectedServices.renewal && (
                      <Collapse in={!!selectedServices.renewal}>
                        <Box sx={{ flex: 1 }}>
                          {selectedServices.renewal === 'only_rera' && (
                            <TextField
                              label="Only RERA Renewal Price"
                              type="number"
                              value={currentPricing.Renewal.only_rera}
                              onChange={handleNestedPriceChange('Renewal', 'only_rera')}
                              size="small"
                              fullWidth
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>
                              }}
                              sx={{ ...fieldStyles, '& .MuiOutlinedInput-root': { height: '40px' } }}
                            />
                          )}
                          {selectedServices.renewal === 'with_training_exam' && (
                            <TextField
                              label="With Training & Exam Renewal Price"
                              type="number"
                              value={currentPricing.Renewal.with_training_exam}
                              onChange={handleNestedPriceChange('Renewal', 'with_training_exam')}
                              size="small"
                              fullWidth
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>
                              }}
                              sx={{ ...fieldStyles, '& .MuiOutlinedInput-root': { height: '40px' } }}
                            />
                          )}
                        </Box>
                      </Collapse>
                    )}
                  </Stack>
                </Box>

                {/* Row 4: HPR Services */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <HPRIcon sx={{ mr: 1 }} />
                    HPR Services
                  </Typography>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      select
                      label="HPR Options"
                      value={selectedServices.hpr}
                      onChange={handleSelectChange('hpr')}
                      sx={{ ...fieldStyles, flex: 1 }}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value="nil">
                        NIL - ₹{currentPricing.HPR.nil.toLocaleString()}
                      </MenuItem>
                      <MenuItem value="upto_50">
                        Up to 50 - ₹{currentPricing.HPR.upto_50.toLocaleString()}
                      </MenuItem>
                      <MenuItem value="above_50">
                        Above 50 - Custom Price
                      </MenuItem>
                    </TextField>
                    
                    {/* Show only the selected option's price field */}
                    {selectedServices.hpr && (
                      <Collapse in={!!selectedServices.hpr}>
                        <Box sx={{ flex: 1 }}>
                          {selectedServices.hpr === 'nil' && (
                            <TextField
                              label="HPR NIL Price"
                              type="number"
                              value={currentPricing.HPR.nil}
                              onChange={handleNestedPriceChange('HPR', 'nil')}
                              size="small"
                              fullWidth
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>
                              }}
                              sx={{ ...fieldStyles, '& .MuiOutlinedInput-root': { height: '40px' } }}
                            />
                          )}
                          {selectedServices.hpr === 'upto_50' && (
                            <TextField
                              label="HPR Up to 50 Price"
                              type="number"
                              value={currentPricing.HPR.upto_50}
                              onChange={handleNestedPriceChange('HPR', 'upto_50')}
                              size="small"
                              fullWidth
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>
                              }}
                              sx={{ ...fieldStyles, '& .MuiOutlinedInput-root': { height: '40px' } }}
                            />
                          )}
                          {selectedServices.hpr === 'above_50' && (
                            <TextField
                              label="HPR Above 50 Price (Enter Custom Amount)"
                              type="number"
                              value={currentPricing.HPR.above_50 || ''}
                              onChange={handleNestedPriceChange('HPR', 'above_50')}
                              size="small"
                              fullWidth
                              placeholder="Enter custom price"
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>
                              }}
                              sx={{ ...fieldStyles, '& .MuiOutlinedInput-root': { height: '40px' } }}
                            />
                          )}
                        </Box>
                      </Collapse>
                    )}
                  </Stack>
                </Box>

                {/* Row 5: Additional Services */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <ScrutinyIcon sx={{ mr: 1 }} />
                    Additional Services
                  </Typography>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Box sx={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: 2, p: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedServices.scrutiny_assistance}
                            onChange={handleServiceChange('scrutiny_assistance')}
                          />
                        }
                        label="Scrutiny Assistance"
                        sx={{ mb: 1 }}
                      />
                      {selectedServices.scrutiny_assistance && (
                        <Collapse in={selectedServices.scrutiny_assistance}>
                          <TextField
                            label="Scrutiny Price"
                            type="number"
                            value={currentPricing.Scrutiny_Assistance}
                            onChange={handlePriceChange('Scrutiny_Assistance')}
                            fullWidth
                            size="small"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>
                            }}
                            sx={{ ...fieldStyles, '& .MuiOutlinedInput-root': { height: '40px' } }}
                          />
                        </Collapse>
                      )}
                    </Box>

                    <Box sx={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: 2, p: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedServices.deregistration}
                            onChange={handleServiceChange('deregistration')}
                          />
                        }
                        label="Deregistration"
                        sx={{ mb: 1 }}
                      />
                      {selectedServices.deregistration && (
                        <Collapse in={selectedServices.deregistration}>
                          <TextField
                            label="Deregistration Price"
                            type="number"
                            value={currentPricing.Deregistration}
                            onChange={handlePriceChange('Deregistration')}
                            fullWidth
                            size="small"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>
                            }}
                            sx={{ ...fieldStyles, '& .MuiOutlinedInput-root': { height: '40px' } }}
                          />
                        </Collapse>
                      )}
                    </Box>

                    <Box sx={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: 2, p: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedServices.correction}
                            onChange={handleServiceChange('correction')}
                          />
                        }
                        label="Correction"
                        sx={{ mb: 1 }}
                      />
                      {selectedServices.correction && (
                        <Collapse in={selectedServices.correction}>
                          <TextField
                            label="Correction Price"
                            type="number"
                            value={currentPricing.Correction}
                            onChange={handlePriceChange('Correction')}
                            fullWidth
                            size="small"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>
                            }}
                            sx={{ ...fieldStyles, '& .MuiOutlinedInput-root': { height: '40px' } }}
                          />
                        </Collapse>
                      )}
                    </Box>
                  </Stack>
                </Box>
              </Stack>

              {/* Total Cost Section - At bottom with CreateQuotation styling */}
              <Paper sx={{ 
                mt: 4, 
                p: 3, 
                backgroundColor: theme.palette.success.light,
                border: `2px solid ${theme.palette.success.main}`,
                borderRadius: 2
              }}>
                <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" justifyContent="space-between" spacing={2}>
                  <Box>
                    <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', color: theme.palette.success.dark }}>
                      <CurrencyIcon sx={{ mr: 1 }} />
                      Total Cost: ₹{totalCost.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: theme.palette.success.dark }}>
                      Agent: {agentData.agentName} • Type: {agentData.agentType} • Services: {Object.values(selectedServices).filter(v =>
                        typeof v === 'boolean' ? v : v !== ''
                      ).length}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Chip 
                      label={`₹${totalCost.toLocaleString()}`} 
                      size="medium" 
                      sx={{ 
                        fontSize: '1.2rem', 
                        fontWeight: 'bold', 
                        px: 2,
                        backgroundColor: theme.palette.success.main,
                        color: 'white'
                      }} 
                    />
                  </Box>
                </Stack>
              </Paper>

              {/* Action Buttons - EXACT same styling as CreateQuotation */}
              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4, pt: 3, borderTop: `1px solid ${theme.palette.grey[200]}` }}>
                <Button variant="outlined" onClick={() => navigate(-1)} size="large" sx={{ px: 4 }}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!canSubmit || loading}
                  size="large"
                  onClick={handleSubmit}
                  sx={{ 
                    px: 4,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Updating...
                    </>
                  ) : (
                    'Continue to Summary'
                  )}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
}