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
  TextField,
  CircularProgress,
  Card,
  CardContent,
  Paper,
  Stack,
  Divider
} from "@mui/material";

const QuotationPricing = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [quotationData, setQuotationData] = useState(null);
  const [pricingBreakdown, setPricingBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [discountType, setDiscountType] = useState("none"); // global discount type
  const [discountAmount, setDiscountAmount] = useState(0);   // global amount
  const [discountPercent, setDiscountPercent] = useState(0); // global percent
  const [currentUser, setCurrentUser] = useState(null);
  const token = localStorage.getItem("token");

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
        const quotationResponse = await fetch(`/api/quotations/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
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
            discountAmount: 0,
            discountPercent: 0,
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
  }, [id]);

  const handleServicePriceChange = (hi, si, field, value) => {
    setPricingBreakdown((prev) => {
      const updated = [...prev];
      const service = updated[hi].services[si];
      const originalAmount = service.totalAmount || 0;

      if (field === "finalAmount") {
        // User is editing the final price directly
        const newFinalAmount = parseInt(value) || 0;
        service.finalAmount = Math.max(newFinalAmount, 0);
        
        // Calculate discount amount and percentage
        const discountAmount = Math.max(originalAmount - newFinalAmount, 0);
        service.discountAmount = Math.round(discountAmount);
        service.discountPercent = originalAmount > 0 ? (discountAmount / originalAmount) * 100 : 0;
        
      } else if (field === "discountAmount") {
        // User is editing discount amount
        const discountAmount = parseInt(value) || 0;
        service.discountAmount = Math.max(discountAmount, 0);
        service.finalAmount = Math.max(originalAmount - discountAmount, 0);
        service.discountPercent = originalAmount > 0 ? (discountAmount / originalAmount) * 100 : 0;
        
      } else if (field === "discountPercent") {
        // User is editing discount percentage
        const discountPercent = parseFloat(value) || 0;
        service.discountPercent = Math.max(Math.min(discountPercent, 100), 0); // Clamp between 0-100
        const discountAmount = Math.round((originalAmount * service.discountPercent) / 100);
        service.discountAmount = discountAmount;
        service.finalAmount = Math.max(originalAmount - discountAmount, 0);
      }

      return updated;
    });
  };

  // Totals with stacked discounts: service-level first, then global
  const finalTotals = useMemo(() => {
    // A) Subtotal before any discounts
    const originalSubtotal = pricingBreakdown.reduce(
      (acc, header) =>
        acc +
        header.services.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
      0
    );

    // B) Subtotal after service discounts
    const serviceSubtotal = pricingBreakdown.reduce(
      (acc, header) =>
        acc +
        header.services.reduce((sum, s) => sum + (s.finalAmount || 0), 0),
      0
    );

    // C) Service discount amount (for display)
    const serviceDiscount = Math.max(originalSubtotal - serviceSubtotal, 0);

    // D) Global discount on top of service-discounted subtotal
    let globalDiscount = 0;
    if (discountType === "percent") {
      globalDiscount = (serviceSubtotal * (discountPercent || 0)) / 100;
    } else if (discountType === "amount") {
      globalDiscount = discountAmount || 0;
    }

    // Clamp to not exceed serviceSubtotal
    globalDiscount = Math.min(globalDiscount, serviceSubtotal);

    const subtotalAfterDiscount = Math.max(serviceSubtotal - globalDiscount, 0);
    const total = subtotalAfterDiscount;

    const totalDiscount = serviceDiscount + globalDiscount;

    const effectiveGlobalPercent =
      serviceSubtotal > 0
        ? (globalDiscount / serviceSubtotal) * 100
        : 0;

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

  const handleSavePricing = async () => {
    try {
      setLoading(true);

      // Calculate effective discount percentage for approval logic
      const effectiveDiscountPercent = finalTotals.originalSubtotal > 0 
        ? (finalTotals.totalDiscount / finalTotals.originalSubtotal) * 100 
        : 0;

      const payload = {
        totalAmount: finalTotals.total,
        // overall discount (service + global)
        discountAmount: finalTotals.totalDiscount,
        discountPercent: effectiveDiscountPercent,
        // breakdowns (useful for backend/audit)
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
      <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
        <CircularProgress />
        <Typography ml={2}>Loading...</Typography>
      </Box>
    );

  if (error)
    return (
      <Box p={3}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );

  return (
    <Box 
      p={4} 
      maxWidth="1200px" 
      mx="auto"
      sx={{
        overflow: 'visible',
        '& *': {
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none'
        }
      }}
    >
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom color="primary">
          Project: {quotationData?.projectName || quotationData?.developerName}
        </Typography>
        <Typography variant="h5" color="text.secondary">
          Service Pricing
        </Typography>
      </Box>

      {/* Service Breakdown */}
      {pricingBreakdown.map((header, hi) => (
        <Paper key={hi} sx={{ p: 3, mb: 3, overflow: 'visible' }} elevation={2}>
          <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
            {header.header}
          </Typography>

          {header.services.map((service, si) => (
            <Card key={si} variant="outlined" sx={{ mb: 2, overflow: 'visible' }}>
              <CardContent sx={{ overflow: 'visible', '&:last-child': { pb: 2 } }}>
                <Box sx={{ overflow: 'visible', width: '100%' }}>
                  {/* Service Name */}
                  <Typography fontWeight={600} variant="h6" gutterBottom color="text.primary">
                    {service.name}
                  </Typography>
                  
                  {/* Time-based Pricing Info */}
                  {service.requiresYearQuarter && service.quarterCount && service.basePrice && (
                    <Box sx={{ 
                      mb: 2, 
                      p: 1.5, 
                      backgroundColor: '#e3f2fd', 
                      borderRadius: 1,
                      border: '1px solid #1976d2'
                    }}>
                      <Typography variant="caption" color="primary" fontWeight={600} display="block">
                        Quarter-based Pricing:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Base Price: ₹{service.basePrice?.toLocaleString()} × {service.quarterCount} quarter{service.quarterCount !== 1 ? 's' : ''} = ₹{(service.basePrice * service.quarterCount)?.toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                  {service.requiresYearOnly && service.yearCount && service.basePrice && (
                    <Box sx={{ 
                      mb: 2, 
                      p: 1.5, 
                      backgroundColor: '#e8f5e8', 
                      borderRadius: 1,
                      border: '1px solid #4caf50'
                    }}>
                      <Typography variant="caption" color="success.main" fontWeight={600} display="block">
                        Year-based Pricing:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Base Price: ₹{service.basePrice?.toLocaleString()} × {service.yearCount} year{service.yearCount !== 1 ? 's' : ''} = ₹{(service.basePrice * service.yearCount)?.toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Pricing Row */}
                  <Stack 
                    direction="row" 
                    spacing={2} 
                    alignItems="center" 
                    flexWrap="wrap" 
                    sx={{ 
                      gap: 2,
                      overflow: 'visible',
                      '& > *': {
                        flexShrink: 0
                      }
                    }}
                  >
                    {/* Original Price (Read-only) */}
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Original Price
                      </Typography>
                      <Typography fontWeight={500} color="success.main">
                        ₹{service.totalAmount?.toLocaleString()}
                      </Typography>
                    </Box>

                    {/* Editable Final Price */}
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Final Price *
                      </Typography>
                      <TextField
                        size="small"
                        type="number"
                        value={Math.round(service.finalAmount) || 0}
                        onChange={(e) =>
                          handleServicePriceChange(hi, si, "finalAmount", e.target.value)
                        }
                        sx={{ 
                          width: 140,
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#f8f9fa',
                            '&:hover': {
                              backgroundColor: '#e9ecef'
                            },
                            '&.Mui-focused': {
                              backgroundColor: 'white'
                            }
                          }
                        }}
                        inputProps={{ min: 0, step: 1 }}
                      />
                    </Box>

                    {/* Discount Amount */}
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Discount Amount
                      </Typography>
                      <TextField
                        size="small"
                        type="number"
                        value={Math.round(service.discountAmount) || 0}
                        onChange={(e) =>
                          handleServicePriceChange(hi, si, "discountAmount", e.target.value)
                        }
                        sx={{ width: 120 }}
                        inputProps={{ min: 0, step: 1 }}
                      />
                    </Box>

                    {/* Discount Percentage */}
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Discount %
                      </Typography>
                      <TextField
                        size="small"
                        type="number"
                        value={service.discountPercent || 0}
                        onChange={(e) =>
                          handleServicePriceChange(hi, si, "discountPercent", e.target.value)
                        }
                        sx={{ width: 100 }}
                        inputProps={{ min: 0, max: 100, step: 0.01 }}
                      />
                    </Box>

                  </Stack>
                  
                  {/* Helper text */}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    * Edit the final price directly, or use discount amount/percentage fields. All fields are linked.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Paper>
      ))}

      {/* Global Discount */}
      <Paper sx={{ p: 3, mt: 4, border: "2px solid", borderColor: "primary.main", overflow: 'visible' }}>
        <Typography variant="h6" gutterBottom color="primary">
          Global Discount (Optional)
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Apply an additional discount on top of individual service discounts.
        </Typography>

        <FormControl sx={{ mt: 2 }}>
          <RadioGroup
            value={discountType}
            onChange={(e) => {
              setDiscountType(e.target.value);
              if (e.target.value === "none") {
                setDiscountAmount(0);
                setDiscountPercent(0);
              }
            }}
            row
          >
            <FormControlLabel value="none" control={<Radio />} label="No Global Discount" />
            <FormControlLabel value="percent" control={<Radio />} label="Apply Global Discount" />
          </RadioGroup>
        </FormControl>

        {discountType === "percent" && (
          <Box sx={{ mt: 3 }}>
            <Stack direction="row" spacing={3} alignItems="center">
              {/* Global Discount Percentage */}
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Global Discount %
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={discountPercent || 0}
                  onChange={(e) => {
                    const percent = parseFloat(e.target.value) || 0;
                    const clampedPercent = Math.max(Math.min(percent, 100), 0);
                    setDiscountPercent(clampedPercent);
                    // Auto-calculate amount based on current subtotal
                    const amount = Math.round((finalTotals.serviceSubtotal * clampedPercent) / 100);
                    setDiscountAmount(amount);
                  }}
                  sx={{ width: 120 }}
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                />
              </Box>

              {/* Global Discount Amount */}
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Global Discount Amount
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={discountAmount || 0}
                  onChange={(e) => {
                    const amount = parseInt(e.target.value) || 0;
                    const clampedAmount = Math.max(Math.min(amount, Math.round(finalTotals.serviceSubtotal)), 0);
                    setDiscountAmount(clampedAmount);
                    // Auto-calculate percentage
                    const percent = finalTotals.serviceSubtotal > 0 ? (clampedAmount / finalTotals.serviceSubtotal) * 100 : 0;
                    setDiscountPercent(percent);
                  }}
                  sx={{ width: 140 }}
                  inputProps={{ min: 0, max: Math.round(finalTotals.serviceSubtotal), step: 1 }}
                />
              </Box>

              {/* Preview */}
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Total Global Savings
                </Typography>
                <Typography fontWeight={600} color="error.main">
                  ₹{Math.round(finalTotals.globalDiscount).toLocaleString()}
                </Typography>
              </Box>
            </Stack>

            {/* Threshold Warning */}
            {currentUser && finalTotals.effectiveGlobalPercent > (currentUser.threshold || 0) && (
              <Box mt={2} p={2} bgcolor="error.light" borderRadius={1}>
                <Typography variant="body2" color="error.dark">
                  ⚠️ <strong>Warning:</strong> Global discount of {finalTotals.effectiveGlobalPercent.toFixed(2)}% exceeds your approval threshold of {currentUser.threshold}%. This quotation will require manager/admin approval.
                </Typography>
              </Box>
            )}

            {/* Helpful Info */}
            <Box mt={2} p={2} bgcolor="info.light" borderRadius={1}>
              <Typography variant="body2" color="info.dark">
                💡 <strong>Tip:</strong> Both percentage and amount fields are linked. Edit either one and the other will update automatically based on the current subtotal of ₹{Math.round(finalTotals.serviceSubtotal).toLocaleString()}.
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Pricing Summary */}
      <Paper sx={{ p: 3, mt: 4, overflow: 'visible' }} elevation={3}>
        <Typography variant="h6" gutterBottom color="primary">
          Pricing Summary
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between">
            <Typography>Subtotal (before discounts):</Typography>
            <Typography fontWeight={600}>₹{Math.round(finalTotals.originalSubtotal).toLocaleString()}</Typography>
          </Stack>

          {finalTotals.serviceDiscount > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography color="error">Service Discounts:</Typography>
              <Typography fontWeight={600} color="error">
                -₹{Math.round(finalTotals.serviceDiscount).toLocaleString()}
              </Typography>
            </Stack>
          )}

          {finalTotals.globalDiscount > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography color="error">
                Global Discount{discountType === "percent" ? ` (${discountPercent}%)` : ""}:
              </Typography>
              <Typography fontWeight={600} color="error">
                -₹{Math.round(finalTotals.globalDiscount).toLocaleString()}
              </Typography>
            </Stack>
          )}

          <Stack direction="row" justifyContent="space-between">
            <Typography>After Discount:</Typography>
            <Typography fontWeight={600}>
              ₹{Math.round(finalTotals.subtotalAfterDiscount).toLocaleString()}
            </Typography>
          </Stack>

          <Divider sx={{ mt: 2 }} />
          <Stack direction="row" justifyContent="space-between" pt={1}>
            <Typography variant="h6">Total:</Typography>
            <Typography variant="h6" color="primary" fontWeight="bold">
              ₹{Math.round(finalTotals.total).toLocaleString()}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} mt={4}>
        <Button variant="outlined" onClick={() => navigate(`/quotations/${id}/services`)}>
          Back
        </Button>
        <Button variant="contained" onClick={handleSavePricing} disabled={loading}>
          {loading ? "Saving..." : "Save & Continue"}
        </Button>
      </Stack>
    </Box>
  );
};

export default QuotationPricing;
