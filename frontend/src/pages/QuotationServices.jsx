// src/pages/QuotationServices.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import { QuotationProvider, useQuotation } from "../context/QuotationContext";
import QuotationBuilder from "../components/QuotationBuilder";
import { updateQuotation, fetchQuotation } from "../services/quotations";

// Inner component that uses the quotation context
function QuotationServicesContent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [quotationData, setQuotationData] = useState(null);
  const { loadExistingData } = useQuotation();
  
  // Load existing quotation data when editing
  useEffect(() => {
    const loadExistingQuotation = async () => {
      if (id && id !== 'new') {
        try {
          setInitialLoading(true);
          const existingQuotation = await fetchQuotation(id);
          console.log('Fetched existing quotation:', existingQuotation);
          setQuotationData(existingQuotation);
          
          // Transform and load the existing data into the context
          if (existingQuotation.headers && existingQuotation.headers.length > 0) {
            // Convert backend format to frontend format
            const transformedHeaders = existingQuotation.headers.map(header => {
              const headerData = {
                name: header.header,
                services: header.services.map(service => {
                  const transformedService = {
                    id: service.id,
                    name: service.label || service.serviceName,
                    label: service.label || service.serviceName,
                    subServices: service.subServices ? 
                      service.subServices.reduce((acc, subService) => {
                        acc[subService.id || subService.text] = subService.text || subService.name;
                        return acc;
                      }, {}) : {}
                  };
                  
                  // Preserve year/quarter selections if they exist
                  if (service.selectedYears) {
                    transformedService.selectedYears = service.selectedYears;
                  }
                  if (service.selectedQuarters) {
                    transformedService.selectedQuarters = service.selectedQuarters;
                  }
                  
                  return transformedService;
                })
              };
              
              // Handle custom headers - preserve original name if it's a custom header
              if (header.originalName && header.originalName.startsWith('custom-')) {
                headerData.originalName = header.originalName;
              }
              
              return headerData;
            });
            
            console.log('Transformed headers for context:', transformedHeaders);
            loadExistingData(transformedHeaders);
          }
        } catch (error) {
          console.error('Failed to load existing quotation:', error);
          setError('Failed to load existing quotation data. Starting fresh.');
        } finally {
          setInitialLoading(false);
        }
      } else {
        setInitialLoading(false);
      }
    };
    
    loadExistingQuotation();
  }, [id, loadExistingData]);

  const handleQuotationComplete = useCallback(
    async (result) => {
      try {
        setLoading(true);
        setError("");
        
        // Handle both old format (array) and new format (object with headers and requiresApproval)
        let selectedHeaders, requiresApproval = false, customHeaderNames = {};
        
        if (Array.isArray(result)) {
          // Old format - backward compatibility
          selectedHeaders = result;
        } else {
          // New format with approval requirement and custom header names
          selectedHeaders = result.headers;
          requiresApproval = result.requiresApproval;
          customHeaderNames = result.customHeaderNames || {};
        }
        
        // Transform the selected headers to the expected format
        const headers = selectedHeaders.map(({ name, originalName, services = [] }) => {
          const headerData = {
            header: name,
            services: services.map((service) => {
              const { id, name, label, subServices = {}, selectedYears, selectedQuarters, quarterCount, ...otherProps } = service;
              const transformedService = {
                id: id || name,
                label: label || name,
                subServices: Object.keys(subServices).map((ss) => ({
                  id: ss,
                  text: ss,
                })),
              };
              
              // Include quarter information if present
              if (selectedYears && selectedYears.length > 0) {
                transformedService.selectedYears = selectedYears;
              }
              if (selectedQuarters && selectedQuarters.length > 0) {
                transformedService.selectedQuarters = selectedQuarters;
              }
              if (quarterCount) {
                transformedService.quarterCount = quarterCount;
              }
              
              // Include any other properties
              Object.assign(transformedService, otherProps);
              
              return transformedService;
            })
          };
          
          // Include original name for custom headers
          if (originalName && originalName.startsWith('custom-')) {
            headerData.originalName = originalName;
          }
          
          return headerData;
        });

        console.log("Saving headers:", headers); // Debug log
        console.log("Requires approval:", requiresApproval); // Debug log
        
        // Prepare update data
        const updateData = { 
          headers,
          ...(requiresApproval && { requiresApproval: true })
        };
        
        // ✅ Use the fixed updateQuotation function with authentication
        await updateQuotation(id, updateData);
        
        // Navigate to pricing step
        navigate(`/quotations/${id}/pricing`);
      } catch (err) {
        console.error("Failed to save services:", err);
        setError(err.message || "Failed to save services");
      } finally {
        setLoading(false);
      }
    },
    [id, navigate]
  );

  // Show initial loading while fetching existing data
  if (initialLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading quotation data...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header - matching Dashboard style */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            {id === 'new' ? 'Services Selection' : 'Edit Services Selection'}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {id === 'new' ? 'Select the services you need for this quotation' : `Editing services for quotation #${id}`}
          </Typography>
          {quotationData && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Project: {quotationData.projectName || 'N/A'} | Developer: {quotationData.developerName || 'N/A'}
            </Typography>
          )}
        </Box>
        <Button
          variant="outlined"
          onClick={() => navigate(id === 'new' ? "/quotations/new" : "/dashboard")}
          sx={{ textTransform: 'none' }}
        >
          ← {id === 'new' ? 'Back to Project Details' : 'Back to Dashboard'}
        </Button>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Success message for loaded data */}
      {quotationData && (
        <Alert severity="info" sx={{ mb: 3 }}>
          ✅ Loaded existing quotation data. You can now modify the services and continue.
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 3 }}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Typography>Saving services...</Typography>
        </Box>
      )}

      {/* Quotation Builder */}
      <QuotationBuilder 
        onComplete={handleQuotationComplete}
        loading={loading}
        quotationData={quotationData}
      />
    </Container>
  );
}

// Main component with provider
export default function QuotationServices() {
  return (
    <QuotationProvider>
      <QuotationServicesContent />
    </QuotationProvider>
  );
}
