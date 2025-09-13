// src/pages/QuotationTerms.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  TextField,
  IconButton,
  Paper,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

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
        
        // Debug: Log the received quotation data
        console.log('Received quotation data:', quotation.data);
        console.log('Validity field:', quotation.data?.validity);
        console.log('PaymentSchedule field:', quotation.data?.paymentSchedule);

        // Get dynamic terms data based on quotation
        const termsData = getTermsData(quotation.data);

        // Determine applicable terms
        const applicableTermsSets = new Set(['General T&C']);
        quotation.data.headers?.forEach(header => {
  header.services?.forEach(service => {
    const termCategory =
      serviceTermsMapping[service.name] ||   // match by service.name
      serviceTermsMapping[header.header] ||  // fallback to header (for Packages)
      "General T&C";                         // default fallback
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

  // ✅ Check if custom terms require approval
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
      <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
        <CircularProgress />
        <Typography ml={2}>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">Error: {error}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom color="primary">
          Terms & Conditions
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Please review the terms and conditions applicable to your selected services
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>How it works:</strong> All terms are pre-selected by default. You can uncheck any terms that you do not want to accept. 
            Only the checked terms will be included in your final agreement.
          </Typography>
        </Alert>
      </Box>

      {/* Quotation Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quotation Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Quotation ID:
              </Typography>
              <Typography variant="body1" fontFamily="monospace">
                {quotationData?.id}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Developer:
              </Typography>
              <Typography variant="body1">
                {quotationData?.developerName}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Project:
              </Typography>
              <Typography variant="body1">
                {quotationData?.projectName || 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Selected Services */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Selected Services
          </Typography>
          {quotationData?.headers?.map((header, index) => (
            <Box key={index} mb={2}>
              <Typography variant="subtitle1" color="primary" fontWeight={600}>
                {header.header}
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                {header.services?.map((service, sIndex) => (
                  <Chip
                    key={sIndex}
                    label={service.label}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Applicable Terms */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Applicable Terms & Conditions
          </Typography>
          
          {Object.keys(applicableTerms).length === 0 ? (
            <Alert severity="info">
              No specific terms found for selected services. Only general terms will apply.
            </Alert>
          ) : null}

          {Object.entries(applicableTerms).map(([category, terms]) => (
            <Box key={category} mb={3}>
              <Typography variant="subtitle1" color="primary" fontWeight={600} gutterBottom>
                {getCategoryTitle(category)}
              </Typography>
              <List dense>
                {terms.map((term, index) => (
                  <ListItem key={index} sx={{ pl: 0, alignItems: 'flex-start' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isTermChecked(category, index)}
                          onChange={(e) => handleTermCheck(category, index, e.target.checked)}
                          color="primary"
                          sx={{ alignSelf: 'flex-start', pt: 0 }}
                        />
                      }
                      label={
                        <Typography 
                          variant="body2" 
                          sx={{ fontSize: '0.9rem', lineHeight: 1.5, mt: 0.5 }}
                        >
                          {`${index + 1}. ${term}`}
                        </Typography>
                      }
                      sx={{ margin: 0, alignItems: 'flex-start' }}
                    />
                  </ListItem>
                ))}
              </List>
              {Object.keys(applicableTerms).length > 1 && <Divider sx={{ my: 2 }} />}
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Custom Terms */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Custom Terms & Conditions
            </Typography>
            <Button
              onClick={handleAddCustomTerm}
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
            >
              Add Term
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Add any additional terms and conditions specific to your project or requirements.
          </Typography>

          {showApprovalWarning && (
            <Alert 
              severity="warning" 
              icon={<WarningIcon />}
              sx={{ mb: 2 }}
            >
              <Typography variant="body2">
                <strong>Approval Required:</strong> Adding custom terms will send this quotation for manager/admin approval, regardless of discount amount.
              </Typography>
            </Alert>
          )}

          {customTerms.map((term, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2, backgroundColor: '#f9f9f9' }}>
              <Box display="flex" alignItems="flex-start" gap={2}>
                <Typography variant="body2" sx={{ mt: 1, minWidth: '30px' }}>
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
            </Paper>
          ))}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button
          onClick={() => navigate(`/quotations/${id}/pricing`)}
          variant="outlined"
          size="large"
          color="inherit"
          startIcon={<ArrowBackIcon />}
        >
          Previous
        </Button>
        
        <Button
          onClick={handleSaveAndContinue}
          variant="contained"
          size="large"
          disabled={loading}
          endIcon={<ArrowForwardIcon />}
        >
          {loading ? 'Saving...' : 'Save Terms & Continue'}
        </Button>
      </Box>
    </Container>
  );
};

export default QuotationTerms;