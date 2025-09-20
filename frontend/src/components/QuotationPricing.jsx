import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { calculatePricing } from '../services/quotations';
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  Paper,
  Stack,
  Divider,
  Container,
  Grid,
  Chip,
  Alert,
  InputAdornment,
  Fade,
  Tooltip,
  IconButton
} from "@mui/material";
import {
  ArrowBack,
  SaveAlt,
  Calculate,
  Info,
  Warning,
  CheckCircle,
  TrendingDown,
  Home,
  AccountBalance,
  Person,
  Business,
  DateRange,
  Payment
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Enhanced theme for professional real estate look
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
    }
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
    }
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

const QuotationPricing = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [quotationData, setQuotationData] = useState(null);
  const [pricingBreakdown, setPricingBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [discountType, setDiscountType] = useState("none");
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const token = localStorage.getItem("token");

  // Helper function to safely convert string to number
  const safeParseNumber = (value, isFloat = false) => {
    if (value === "" || value === null || value === undefined) {
      return 0;
    }
    const parsed = isFloat ? parseFloat(value) : parseInt(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Helper function to get display value
  const getDisplayValue = (value) => {
    if (value === 0 || value === "0" || value === "" || value === null || value === undefined) {
      return "";
    }
    return value;
  };

  // Enhanced styles for number input fields
  const numberInputStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#f8fafc',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: '#f1f5f9',
      },
      '&.Mui-focused': {
        backgroundColor: 'white',
        boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
      },
      '& input[type=number]': {
        MozAppearance: 'textfield',
      },
      '& input::-webkit-outer-spin-button': {
        WebkitAppearance: 'none',
        margin: 0,
      },
      '& input::-webkit-inner-spin-button': {
        WebkitAppearance: 'none',
        margin: 0,
      },
    },
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

  useEffect(() => {
    const fetchQuotationAndPricing = async () => {
      try {
        setLoading(true);
        const quotationResponse = await fetch(`/api/quotations/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!quotationResponse.ok) throw new Error("Failed to fetch quotation");
        const quotation = await quotationResponse.json();
        setQuotationData(quotation.data);

        const pricingData = await calculatePricing({
          developerType: quotation.data.developerType,
          projectRegion: quotation.data.projectRegion,
          plotArea: quotation.data.plotArea,
          headers: quotation.data.headers || [],
        });

        const initialPricingBreakdown = pricingData.breakdown.map((header) => ({
          ...header,
          services: header.services.map((service) => ({
            ...service,
            discountAmount: "",
            discountPercent: "",
            finalAmount: service.totalAmount,
          })),
        }));

        setPricingBreakdown(initialPricingBreakdown);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchQuotationAndPricing();
  }, [id, token]);

  const handleServicePriceChange = (hi, si, field, value) => {
    setPricingBreakdown((prev) => {
      const updated = [...prev];
      const service = updated[hi].services[si];
      const originalAmount = service.totalAmount || 0;

      if (field === "finalAmount") {
        const newFinalAmount = safeParseNumber(value);
        service.finalAmount = Math.max(newFinalAmount, 0);
        const discountAmount = Math.max(originalAmount - newFinalAmount, 0);
        service.discountAmount = discountAmount > 0 ? Math.round(discountAmount) : "";
        service.discountPercent = originalAmount > 0 && discountAmount > 0 ? (discountAmount / originalAmount) * 100 : "";
      } else if (field === "discountAmount") {
        service.discountAmount = value;
        const discountAmount = safeParseNumber(value);
        service.finalAmount = Math.max(originalAmount - discountAmount, 0);
        service.discountPercent = originalAmount > 0 && discountAmount > 0 ? (discountAmount / originalAmount) * 100 : "";
      } else if (field === "discountPercent") {
        service.discountPercent = value;
        const discountPercent = safeParseNumber(value, true);
        const clampedPercent = Math.max(Math.min(discountPercent, 100), 0);
        const discountAmount = Math.round((originalAmount * clampedPercent) / 100);
        service.discountAmount = discountAmount > 0 ? discountAmount : "";
        service.finalAmount = Math.max(originalAmount - discountAmount, 0);
      }

      return updated;
    });
  };

  // Totals with stacked discounts: service-level first, then global
  const finalTotals = useMemo(() => {
    const originalSubtotal = pricingBreakdown.reduce(
      (acc, header) =>
        acc +
        header.services.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
      0
    );

    const serviceSubtotal = pricingBreakdown.reduce(
      (acc, header) =>
        acc +
        header.services.reduce((sum, s) => sum + (s.finalAmount || 0), 0),
      0
    );

    const serviceDiscount = Math.max(originalSubtotal - serviceSubtotal, 0);

    let globalDiscount = 0;
    if (discountType === "percent") {
      globalDiscount = (serviceSubtotal * safeParseNumber(discountPercent, true)) / 100;
    } else if (discountType === "amount") {
      globalDiscount = safeParseNumber(discountAmount);
    }

    globalDiscount = Math.min(globalDiscount, serviceSubtotal);
    const subtotalAfterDiscount = Math.max(serviceSubtotal - globalDiscount, 0);
    const total = subtotalAfterDiscount;
    const totalDiscount = serviceDiscount + globalDiscount;
    const effectiveGlobalPercent =
      serviceSubtotal > 0 ? (globalDiscount / serviceSubtotal) * 100 : 0;

    return {
      originalSubtotal,
      serviceSubtotal,
      serviceDiscount,
      globalDiscount,
      subtotalAfterDiscount,
      total,
      totalDiscount,
      isGlobalDiscount: discountType !== "none",
      effectiveGlobalPercent,
    };
  }, [pricingBreakdown, discountType, discountAmount, discountPercent]);

  const handleGlobalDiscountChange = (type, value) => {
    if (type === "percent") {
      setDiscountPercent(value);
      const percent = safeParseNumber(value, true);
      const clampedPercent = Math.max(Math.min(percent, 100), 0);
      const amount = Math.round((finalTotals.serviceSubtotal * clampedPercent) / 100);
      setDiscountAmount(amount > 0 ? amount : "");
    } else if (type === "amount") {
      setDiscountAmount(value);
      const amount = safeParseNumber(value);
      const clampedAmount = Math.max(Math.min(amount, Math.round(finalTotals.serviceSubtotal)), 0);
      const percent = finalTotals.serviceSubtotal > 0 ? (clampedAmount / finalTotals.serviceSubtotal) * 100 : 0;
      setDiscountPercent(percent > 0 ? percent.toFixed(2) : "");
    }
  };

  const handleSavePricing = async () => {
    try {
      setLoading(true);
      const effectiveDiscountPercent = finalTotals.originalSubtotal > 0
        ? (finalTotals.totalDiscount / finalTotals.originalSubtotal) * 100
        : 0;

      const payload = {
        totalAmount: finalTotals.total,
        discountAmount: finalTotals.totalDiscount,
        discountPercent: effectiveDiscountPercent,
        serviceDiscountAmount: finalTotals.serviceDiscount,
        globalDiscountAmount: finalTotals.globalDiscount,
        globalDiscountPercent: finalTotals.effectiveGlobalPercent,
        pricingBreakdown,
        headers: quotationData?.headers || []
      };

      console.log('Saving pricing payload:', payload);

      const response = await fetch(`/api/quotations/${id}/pricing`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save pricing');
      }

      navigate(`/quotations/${id}/terms`);
    } catch (err) {
      console.error('Save pricing error:', err);
      setError(err.message || "Failed to save pricing");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <ThemeProvider theme={theme}>
        <Container maxWidth="lg" sx={{ py: 4, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box textAlign="center">
            <CircularProgress size={48} />
            <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
              Loading pricing details...
            </Typography>
          </Box>
        </Container>
      </ThemeProvider>
    );

  if (error)
    return (
      <ThemeProvider theme={theme}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6">Error Loading Data</Typography>
            <Typography>{error}</Typography>
          </Alert>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Container>
      </ThemeProvider>
    );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Fade in timeout={800}>
            <Box>
              {/* Enhanced Header with lighter shade */}
              <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #8fa4f3 0%, #9c7cc7 100%)', color: 'white' }}>
                <CardContent sx={{ py: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <Home sx={{ fontSize: 32 }} />
                    <Box>
                      <Typography variant="h4" sx={{ color: 'white', fontWeight: 900, fontFamily: '"Times New Roman", serif' }}>
                        Service Pricing
                      </Typography>
                      <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 400 }}>
                        Project Management & Registration Services
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Horizontal line-by-line details */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccountBalance sx={{ fontSize: 20 }} />
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                          <strong>Category:</strong> {quotationData?.developerType || 'Category 1'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Home sx={{ fontSize: 20 }} />
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                          <strong>Region:</strong> {quotationData?.projectRegion || 'Mumbai Suburban'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person sx={{ fontSize: 20 }} />
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                          <strong>Developer:</strong> {quotationData?.developerName || 'Developer Name'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business sx={{ fontSize: 20 }} />
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                          <strong>Project:</strong> {quotationData?.projectName || 'Project Name'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DateRange sx={{ fontSize: 20 }} />
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                          <strong>Validity:</strong> {quotationData?.quotationValidity || '30 days'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Payment sx={{ fontSize: 20 }} />
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                          <strong>Advance Payment:</strong> {quotationData?.advancePayment || '50%'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Service Breakdown */}
              <Box sx={{ mb: 4 }}>
                {pricingBreakdown.map((header, hi) => (
                  <Card key={hi} sx={{ mb: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Calculate sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          {header.header}
                        </Typography>
                      </Box>

                      <Stack spacing={3}>
                        {header.services.map((service, si) => (
                          <Paper 
                            key={si} 
                            sx={{ 
                              p: 3, 
                              border: '1px solid #e2e8f0',
                              borderRadius: 2,
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                borderColor: 'primary.light'
                              }
                            }}
                          >
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                {service.name}
                              </Typography>

                              {/* Time-based Pricing Info */}
                              {service.requiresYearQuarter && service.quarterCount && service.basePrice && (
                                <Alert severity="info" sx={{ mb: 2 }}>
                                  <Typography variant="body2">
                                    <strong>Quarter-based Pricing:</strong> Base Price: ₹{service.basePrice?.toLocaleString()} × {service.quarterCount} quarter{service.quarterCount !== 1 ? 's' : ''} = ₹{(service.basePrice * service.quarterCount)?.toLocaleString()}
                                  </Typography>
                                </Alert>
                              )}

                              {service.requiresYearOnly && service.yearCount && service.basePrice && (
                                <Alert severity="info" sx={{ mb: 2 }}>
                                  <Typography variant="body2">
                                    <strong>Year-based Pricing:</strong> Base Price: ₹{service.basePrice?.toLocaleString()} × {service.yearCount} year{service.yearCount !== 1 ? 's' : ''} = ₹{(service.basePrice * service.yearCount)?.toLocaleString()}
                                  </Typography>
                                </Alert>
                              )}
                            </Box>

                            {/* Pricing Controls */}
                            <Grid container spacing={3} alignItems="center">
                              {/* Original Price */}
                              <Grid item xs={12} sm={6} md={3}>
                                <Box>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                                    Original Price
                                  </Typography>
                                  <TextField
                                    fullWidth
                                    value={`₹${service.totalAmount?.toLocaleString()}`}
                                    variant="outlined"
                                    disabled
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        backgroundColor: '#f8fafc',
                                      }
                                    }}
                                  />
                                </Box>
                              </Grid>

                              {/* Final Price */}
                              <Grid item xs={12} sm={6} md={3}>
                                <Box>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                                    Final Price *
                                  </Typography>
                                  <TextField
                                    fullWidth
                                    type="number"
                                    value={getDisplayValue(service.finalAmount)}
                                    onChange={(e) =>
                                      handleServicePriceChange(hi, si, "finalAmount", e.target.value)
                                    }
                                    variant="outlined"
                                    InputProps={{
                                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                    }}
                                    sx={numberInputStyles}
                                    inputProps={{ min: 0, step: 1 }}
                                  />
                                </Box>
                              </Grid>

                              {/* Discount Amount */}
                              <Grid item xs={12} sm={6} md={3}>
                                <Box>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                                    Discount Amount
                                  </Typography>
                                  <TextField
                                    fullWidth
                                    type="number"
                                    value={getDisplayValue(service.discountAmount)}
                                    onChange={(e) =>
                                      handleServicePriceChange(hi, si, "discountAmount", e.target.value)
                                    }
                                    variant="outlined"
                                    InputProps={{
                                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                    }}
                                    sx={numberInputStyles}
                                    inputProps={{ min: 0, step: 1 }}
                                  />
                                </Box>
                              </Grid>

                              {/* Discount Percentage */}
                              <Grid item xs={12} sm={6} md={3}>
                                <Box>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                                    Discount %
                                  </Typography>
                                  <TextField
                                    fullWidth
                                    type="number"
                                    value={getDisplayValue(typeof service.discountPercent === 'number' ? service.discountPercent.toFixed(2) : service.discountPercent)}
                                    onChange={(e) =>
                                      handleServicePriceChange(hi, si, "discountPercent", e.target.value)
                                    }
                                    variant="outlined"
                                    InputProps={{
                                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    }}
                                    sx={numberInputStyles}
                                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                                  />
                                </Box>
                              </Grid>
                            </Grid>

                            <Alert severity="info" sx={{ mt: 2 }}>
                              <Typography variant="body2">
                                <Info sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                                Edit the final price directly, or use discount amount/percentage fields. All fields are linked.
                              </Typography>
                            </Alert>
                          </Paper>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              {/* Global Discount - Removed tip box and global savings */}
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <TrendingDown sx={{ mr: 2, color: 'secondary.main' }} />
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Global Discount (Optional)
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Apply an additional discount on top of individual service discounts.
                      </Typography>
                    </Box>
                  </Box>

                  <FormControl component="fieldset" sx={{ mb: 3 }}>
                    <FormLabel component="legend" sx={{ mb: 2, fontWeight: 500 }}>
                      Discount Type
                    </FormLabel>
                    <RadioGroup
                      value={discountType}
                      onChange={(e) => {
                        setDiscountType(e.target.value);
                        if (e.target.value === "none") {
                          setDiscountAmount("");
                          setDiscountPercent("");
                        }
                      }}
                      row
                    >
                      <FormControlLabel 
                        value="none" 
                        control={<Radio />} 
                        label="No Global Discount" 
                      />
                      <FormControlLabel 
                        value="percent" 
                        control={<Radio />} 
                        label="Percentage" 
                      />
                      <FormControlLabel 
                        value="amount" 
                        control={<Radio />} 
                        label="Fixed Amount" 
                      />
                    </RadioGroup>
                  </FormControl>

                  {discountType === "percent" && (
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Global Discount Percentage
                        </Typography>
                        <TextField
                          fullWidth
                          type="number"
                          value={getDisplayValue(discountPercent)}
                          onChange={(e) => handleGlobalDiscountChange("percent", e.target.value)}
                          variant="outlined"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          sx={numberInputStyles}
                          inputProps={{ min: 0, max: 100, step: 0.01 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Discount Amount
                          </Typography>
                          <Chip 
                            label={`₹${Math.round(finalTotals.globalDiscount).toLocaleString()}`}
                            color="secondary"
                            size="medium"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  )}

                  {discountType === "amount" && (
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Global Discount Amount
                        </Typography>
                        <TextField
                          fullWidth
                          type="number"
                          value={getDisplayValue(discountAmount)}
                          onChange={(e) => handleGlobalDiscountChange("amount", e.target.value)}
                          variant="outlined"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          sx={numberInputStyles}
                          inputProps={{ min: 0, max: Math.round(finalTotals.serviceSubtotal), step: 1 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Discount Percentage
                          </Typography>
                          <Chip 
                            label={`${safeParseNumber(discountPercent, true).toFixed(2)}%`}
                            color="secondary"
                            size="medium"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  )}

                  {/* Only show warning alert for approval threshold - removed global savings and tip alerts */}
                  {discountType !== "none" && currentUser && finalTotals.effectiveGlobalPercent > (currentUser.threshold || 0) && (
                    <Alert severity="warning" sx={{ mt: 3 }}>
                      <Typography variant="body2">
                        <Warning sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                        <strong>Warning:</strong> Global discount of {finalTotals.effectiveGlobalPercent.toFixed(2)}% exceeds your approval threshold of {currentUser.threshold}%. This quotation will require manager/admin approval.
                      </Typography>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced Pricing Summary with same color as header - updated discount colors to white */}
              <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #8fa4f3 0%, #9c7cc7 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'white' }}>
                    Pricing Summary
                  </Typography>
                  
                  {/* Line by line horizontal layout */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                        Subtotal (before discounts):
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                        ₹{Math.round(finalTotals.originalSubtotal).toLocaleString()}
                      </Typography>
                    </Box>

                    {finalTotals.serviceDiscount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                          Service Discounts:
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                          -₹{Math.round(finalTotals.serviceDiscount).toLocaleString()}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                        Subtotal (after service modifications):
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                        ₹{Math.round(finalTotals.serviceSubtotal).toLocaleString()}
                      </Typography>
                    </Box>

                    {finalTotals.globalDiscount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                          Global Discount{discountType === "percent" ? ` (${safeParseNumber(discountPercent, true)}%)` : ""}:
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                          -₹{Math.round(finalTotals.globalDiscount).toLocaleString()}
                        </Typography>
                      </Box>
                    )}

                    {/* Total Amount - highlighted */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, mt: 2, borderTop: '2px solid rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 1, px: 2 }}>
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                        Total Amount:
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                        ₹{Math.round(finalTotals.total).toLocaleString()}
                      </Typography>
                    </Box>

                    {/* Removed total savings chip as requested */}
                  </Box>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={() => navigate(`/quotations/${id}/services`)}
                  size="large"
                  sx={{ px: 4 }}
                >
                  Back
                </Button>

                <Button
                  variant="contained"
                  endIcon={<SaveAlt />}
                  onClick={handleSavePricing}
                  disabled={loading}
                  size="large"
                  sx={{ 
                    px: 4,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  }}
                >
                  {loading ? "Saving..." : "Save & Continue"}
                </Button>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default QuotationPricing;