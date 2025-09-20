// src/pages/QuotationTerms.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  IconButton,
  Paper,
  Checkbox,
  FormControlLabel,
  Stack,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Enhanced theme for professional real estate look - EXACTLY matching QuotationPricing
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
            backgroundColor: '#f8fafc',
            '&:hover': {
              backgroundColor: '#f1f5f9',
            },
            '&.Mui-focused': {
              backgroundColor: 'white',
              boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
            },
          },
        },
      },
    },
  },
});

const QuotationTerms = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [quotationData, setQuotationData] = useState(null);
  const [applicableTerms, setApplicableTerms] = useState({});
  const [customTerms, setCustomTerms] = useState(['']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showApprovalWarning, setShowApprovalWarning] = useState(false);
  const [checkedTerms, setCheckedTerms] = useState({});
  const [checkedCustomTerms, setCheckedCustomTerms] = useState({});

  const token = localStorage.getItem("token");

  // Function to generate dynamic terms based on quotation data
  const generateDynamicTerms = (quotationData) => {
    const dynamicTerms = [];
    if (quotationData) {
      // 1. Quotation validity term
      const validity = quotationData.validity || quotationData.validityPeriod;
      if (validity) {
        // Handle different validity formats more robustly
        const validityString = validity.toString().toLowerCase();
        let validityDays = 0;
        if (validityString.includes('7')) {
          validityDays = 7;
        } else if (validityString.includes('15')) {
          validityDays = 15;
        } else if (validityString.includes('30')) {
          validityDays = 30;
        } else {
          // Fallback: try to extract number
          const matches = validityString.match(/\d+/);
          if (matches) {
            validityDays = parseInt(matches[0]);
          }
        }

        if (validityDays > 0) {
          // Use quotation creation date if available, otherwise use current date
          const baseDate = quotationData.createdAt ? new Date(quotationData.createdAt) : new Date();
          const validUntilDate = new Date(baseDate.getTime() + validityDays * 24 * 60 * 60 * 1000);
          const formattedDate = validUntilDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          dynamicTerms.push(`The quotation is valid upto ${formattedDate}.`);
        }
      }

      // 2. Advance payment term
      const paymentSchedule = quotationData.paymentSchedule || quotationData.payment_schedule;
      if (paymentSchedule) {
        dynamicTerms.push(`${paymentSchedule} of the total amount must be paid in advance before commencement of work/service.`);
      }
    }
    return dynamicTerms;
  };

  // Fetch current user info
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        try {
          const res = await fetch("/api/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const userData = await res.json();
            setCurrentUser(userData);
          }
        } catch (err) {
          console.error("Failed to fetch user profile");
        }
      }
    };
    fetchUserProfile();
  }, [token]);

  // Function to get terms data with dynamic terms
  const getTermsData = (quotationData) => {
    const dynamicTerms = generateDynamicTerms(quotationData);
    return {
      "General T&C": [
        ...dynamicTerms, // Add dynamic terms at the beginning
        "The above quotation is subject to this project only.",
        "The prices mentioned above are in particular to One Project per year.",
        "The services outlined above are included within the project scope. Any additional services not specified are excluded from this scope.",
        "The prices mentioned above are applicable to One Project only for the duration of the services obtained.",
        "The prices mentioned above DO NOT include Government Fees.",
        "The prices mentioned above DO NOT include Edit Fees.",
        "*18% GST Applicable on above mentioned charges.",
        "The prices listed above do not include any applicable statutory taxes.",
        "Any and all services not mentioned in the above scope of services are not applicable",
        "All Out-of-pocket expenses incurred for completion of the work shall be re-imbursed to RERA Easy"
      ],
      "Package A,B,C": [
        "Payment is due at the initiation of services, followed by annual payments thereafter.",
        "Any kind of drafting of legal documents or contracts are not applicable.",
        "The quoted fee covers annual MahaRERA compliance services, with billing on a Yearly basis for convenience and predictable financial planning.",
        "Invoices will be generated at a predetermined interval for each year in advance.",
        "The initial invoice will be issued from the date of issuance or a start date as specified in the Work Order."
      ],
      "Package D": [
        "All Out-of-pocket expenses incurred for the explicit purpose of Commuting, Refreshment meals of RERA Easy's personnel shall be re-imbursed to RERA Easy, subject to submission of relevant invoices, bills and records submitted."
      ],
    };
  };

  // Service to terms mapping
  const serviceTermsMapping = {
    "Package A": "Package A,B,C",
    "Package B": "Package A,B,C",
    "Package C": "Package A,B,C",
    "Package D": "Package D",
    "Project Registration": "General T&C",
    "Drafting of Legal Documents": "General T&C",
    "Vetting of Legal Documents": "General T&C",
    "Drafting of Title Report in Format A": "General T&C",
    "Liasioning": "General T&C",
    "SRO Membership": "General T&C",
    "Project Extension - Section 7.3": "General T&C",
    "Project Correction - Change of FSI/ Plan": "General T&C",
    "Project Closure": "General T&C",
    "Removal of Abeyance - QPR, Lapsed": "General T&C",
    "Deregistration": "General T&C",
    "Change of Promoter (section 15)": "General T&C",
    "Profile Migration": "General T&C",
    "Profile Updation": "General T&C",
    "Form 1": "General T&C",
    "Form 2": "General T&C",
    "Form 3": "General T&C",
    "Form 5": "General T&C",
    "Title Certificate": "General T&C"
  };

  useEffect(() => {
    const fetchQuotationData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/quotations/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch quotation');
        const quotation = await response.json();
        setQuotationData(quotation.data);

        // Get dynamic terms data based on quotation
        const termsData = getTermsData(quotation.data);

        // Determine applicable terms
        const applicableTermsSets = new Set(['General T&C']);
        quotation.data.headers?.forEach(header => {
          header.services?.forEach(service => {
            const termCategory =
              serviceTermsMapping[service.name] || // match by service.name
              serviceTermsMapping[header.header] || // fallback to header (for Packages)
              "General T&C"; // default fallback
            applicableTermsSets.add(termCategory);
          });
        });

        const terms = {};
        Array.from(applicableTermsSets).forEach(category => {
          if (termsData[category] && termsData[category].length > 0) {
            terms[category] = termsData[category];
          }
        });

        setApplicableTerms(terms);

        // Load existing custom terms
        if (quotation.data.customTerms && quotation.data.customTerms.length > 0) {
          setCustomTerms(quotation.data.customTerms);
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQuotationData();
    }
  }, [id]);

  // Check if custom terms require approval
  useEffect(() => {
    const hasNonEmptyCustomTerms = customTerms.some(term => term.trim() !== '');
    setShowApprovalWarning(hasNonEmptyCustomTerms);
  }, [customTerms]);

  const handleAddCustomTerm = () => {
    setCustomTerms([...customTerms, '']);
  };

  const handleRemoveCustomTerm = (index) => {
    if (customTerms.length > 1) {
      const newTerms = customTerms.filter((_, i) => i !== index);
      setCustomTerms(newTerms);
    }
  };

  const handleCustomTermChange = (index, value) => {
    const newTerms = [...customTerms];
    newTerms[index] = value;
    setCustomTerms(newTerms);
  };

  const handleTermCheck = (category, termIndex, checked) => {
    const key = `${category}-${termIndex}`;
    setCheckedTerms(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const handleCustomTermCheck = (index, checked) => {
    setCheckedCustomTerms(prev => ({
      ...prev,
      [index]: checked
    }));
  };

  const isTermChecked = (category, termIndex) => {
    const key = `${category}-${termIndex}`;
    return checkedTerms[key] !== undefined ? checkedTerms[key] : true; // Default to true (pre-checked)
  };

  const isCustomTermChecked = (index) => {
    return checkedCustomTerms[index] !== undefined ? checkedCustomTerms[index] : true; // Default to true (pre-checked)
  };

  const handleSaveAndContinue = async () => {
    try {
      setLoading(true);
      const validCustomTerms = customTerms.filter(term => term.trim() !== '');

      // Collect accepted terms (those that are checked)
      const acceptedTerms = {};
      Object.entries(applicableTerms).forEach(([category, terms]) => {
        acceptedTerms[category] = terms.filter((_, index) => isTermChecked(category, index));
      });

      // Collect accepted custom terms
      const acceptedCustomTerms = validCustomTerms.filter((_, index) => isCustomTermChecked(index));

      await fetch(`/api/quotations/${id}/terms`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          termsAccepted: true,
          applicableTerms: Object.keys(applicableTerms),
          acceptedTerms: acceptedTerms,
          customTerms: validCustomTerms,
          acceptedCustomTerms: acceptedCustomTerms,
          checkedTermsState: checkedTerms,
          checkedCustomTermsState: checkedCustomTerms
        }),
      });

      navigate(`/quotations/${id}/summary`);
    } catch (err) {
      console.error('Error saving terms:', err);
      setError('Failed to save terms acceptance');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryTitle = (category) => {
    switch(category) {
      case 'General T&C': return 'General Terms & Conditions';
      case 'Package A,B,C': return 'Package A, B, C Terms';
      case 'Package D': return 'Package D Terms';
      default: return category;
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">Error: {error}</Alert>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          {/* Header - EXACT same styling as QuotationPricing */}
          <Paper
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: 4,
              borderRadius: 3,
              mb: 3,
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ color: 'white', fontWeight: 900 }}>
              Terms & Conditions
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 400 }}>
              Please review the terms and conditions applicable to your selected services
            </Typography>
          </Paper>

          {/* Horizontal Card Layout - Row 1: Quotation Details & Selected Services */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
            {/* Quotation Details Card */}
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.grey[700] }}>
                  Quotation Details
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Quotation ID:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{quotationData?.id}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Developer:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{quotationData?.developerName}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Project:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{quotationData?.projectName || 'N/A'}</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* Selected Services Card */}
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.grey[700] }}>
                  Selected Services
                </Typography>
                <Stack spacing={2}>
                  {quotationData?.headers?.map((header, index) => (
                    <Box key={index}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        {header.header}
                      </Typography>
                      <Stack spacing={1}>
                        {header.services?.map((service, sIndex) => (
                          <Chip
                            key={sIndex}
                            label={service.name}
                            size="small"
                            variant="outlined"
                            sx={{ alignSelf: 'flex-start' }}
                          />
                        ))}
                      </Stack>
                      {index < quotationData.headers.length - 1 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>

          {/* Row 2: Applicable Terms & Conditions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.grey[700] }}>
                Applicable Terms & Conditions
              </Typography>

              {Object.keys(applicableTerms).length === 0 ? (
                <Alert severity="info">
                  No specific terms found for selected services. Only general terms will apply.
                </Alert>
              ) : (
                <Stack spacing={3}>
                  {Object.entries(applicableTerms).map(([category, terms], categoryIndex) => (
                    <Box key={category}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: theme.palette.primary.main }}>
                        {getCategoryTitle(category)}
                      </Typography>
                      <Stack spacing={2}>
                        {terms.map((term, index) => (
                          <FormControlLabel
                            key={index}
                            control={
                              <Checkbox
                                checked={isTermChecked(category, index)}
                                onChange={(e) => handleTermCheck(category, index, e.target.checked)}
                                color="primary"
                                sx={{ alignSelf: 'flex-start', pt: 0 }}
                              />
                            }
                            label={
                              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                                {`${index + 1}. ${term}`}
                              </Typography>
                            }
                            sx={{ margin: 0, alignItems: 'flex-start' }}
                          />
                        ))}
                      </Stack>
                      {categoryIndex < Object.keys(applicableTerms).length - 1 && <Divider sx={{ mt: 3 }} />}
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Row 3: Custom Terms & Warning */}
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ mb: 4 }}>
            {/* Custom Terms Card */}
            <Card sx={{ flex: 2 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ color: theme.palette.grey[700] }}>
                    Custom Terms & Conditions
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddCustomTerm}
                    variant="outlined"
                    size="small"
                  >
                    Add Term
                  </Button>
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Add any additional terms and conditions specific to your project or requirements.
                </Typography>

                <Stack spacing={2}>
                  {customTerms.map((term, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <Typography variant="body2" sx={{ pt: 2, minWidth: '24px' }}>
                        {index + 1}.
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        value={term}
                        onChange={(e) => handleCustomTermChange(index, e.target.value)}
                        placeholder={`Enter custom term ${index + 1}...`}
                        variant="outlined"
                        size="small"
                      />
                      {term.trim() !== '' && (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isCustomTermChecked(index)}
                              onChange={(e) => handleCustomTermCheck(index, e.target.checked)}
                              color="primary"
                              sx={{ alignSelf: 'flex-start', pt: 1 }}
                            />
                          }
                          label=""
                          sx={{ margin: 0, minWidth: 'auto' }}
                        />
                      )}
                      {customTerms.length > 1 && (
                        <IconButton
                          onClick={() => handleRemoveCustomTerm(index)}
                          color="error"
                          size="small"
                          sx={{ mt: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Warning Card (if applicable) */}
            {showApprovalWarning && (
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Alert
                    severity="warning"
                    icon={<WarningIcon />}
                    sx={{ border: 'none', backgroundColor: 'transparent', p: 0 }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Approval Required
                    </Typography>
                    <Typography variant="body2">
                      Adding custom terms will send this quotation for manager/admin approval, regardless of discount amount.
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </Stack>

          {/* Navigation Buttons */}
          <Stack 
            direction="row" 
            spacing={2} 
            justifyContent="flex-end"
          >
            <Button
              onClick={() => navigate(`/quotations/${id}/pricing`)}
              variant="outlined"
              size="large"
              startIcon={<ArrowBackIcon />}
            >
              Previous
            </Button>
            <Button
              onClick={handleSaveAndContinue}
              variant="contained"
              size="large"
              disabled={loading}
              endIcon={loading ? <CircularProgress size={20} /> : <ArrowForwardIcon />}
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              }}
            >
              {loading ? 'Saving...' : 'Save Terms & Continue'}
            </Button>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default QuotationTerms;