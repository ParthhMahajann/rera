import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Button,
  Divider,
  Alert,
  Grid,
  Paper,
  Chip,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const TotalRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  '& td': {
    color: theme.palette.primary.contrastText,
    fontWeight: 'bold',
    fontSize: '1.1rem',
  },
}));

const SummaryPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.grey[50],
}));

export default function AgentServiceSummary() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [backendData, setBackendData] = useState(null);
  
  const { agentData, selectedServices, totalCost, quotationId } = location.state || {
    agentData: {},
    selectedServices: [],
    totalCost: 0,
    quotationId: null
  };

  // If no data, redirect back
  useEffect(() => {
    if (!agentData.agentName || selectedServices.length === 0) {
      navigate('/');
      return;
    }
    
    // Fetch updated data from backend
    fetchBackendData();
  }, []);

  const fetchBackendData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !quotationId) return;

      const response = await fetch(`http://localhost:3001/api/agent-registrations/${quotationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        setBackendData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch backend data:', error);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to complete the registration');
        return;
      }

      // ✅ Complete the agent registration by calling the complete endpoint
      const response = await fetch(`http://localhost:3001/api/agent-registrations/${quotationId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          termsAccepted: true
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        alert('Agent registration completed successfully! We will contact you shortly.');
        navigate('/');
      } else {
        alert(`Failed to complete registration: ${result.error || 'Please try again.'}`);
      }

    } catch (error) {
      console.error('Failed to complete registration:', error);
      alert('Failed to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Agent Registration Summary
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Agent Details */}
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Agent Details
              </Typography>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Agent Name</strong></TableCell>
                    <TableCell>{agentData.agentName}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Agent Type</strong></TableCell>
                    <TableCell>
                      <Chip label={agentData.agentType} color="primary" size="small" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Mobile Number</strong></TableCell>
                    <TableCell>{agentData.mobile}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Email Address</strong></TableCell>
                    <TableCell>{agentData.email || 'Not provided'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </StyledCard>

          {/* Selected Services */}
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Selected Services
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Service</strong></TableCell>
                    <TableCell align="right"><strong>Price (₹)</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedServices.map((service, index) => (
                    <TableRow key={index}>
                      <TableCell>{service.name}</TableCell>
                      <TableCell align="right">{service.price.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TotalRow>
                    <TableCell><strong>Total Amount</strong></TableCell>
                    <TableCell align="right"><strong>₹{totalCost.toLocaleString()}</strong></TableCell>
                  </TotalRow>
                </TableBody>
              </Table>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Summary Card */}
          <SummaryPaper>
            <Typography variant="h6" gutterBottom>
              Quotation Summary
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Date</Typography>
              <Typography variant="body1">{getCurrentDate()}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Services Count</Typography>
              <Typography variant="body1">{selectedServices.length} service(s)</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Total Amount</Typography>
              <Typography variant="h5" color="primary">₹{totalCost.toLocaleString()}</Typography>
            </Box>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              This quotation is valid for 30 days from the date of issue.
            </Alert>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleConfirm}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Completing...
                </>
              ) : (
                'Confirm Registration'
              )}
            </Button>

            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={handlePrint}
              sx={{ mb: 2 }}
            >
              Print/Save as PDF
            </Button>

            <Button
              variant="text"
              size="large"
              fullWidth
              onClick={() => navigate(-1)}
            >
              Back to Services
            </Button>
          </SummaryPaper>

          {/* Backend Data Display (for debugging) */}
          {backendData && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Quotation ID: {backendData.id}
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Terms and Conditions */}
      <StyledCard sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Terms & Conditions
          </Typography>
          <Typography variant="body2" paragraph>
            • All prices are inclusive of applicable taxes unless specified otherwise.
          </Typography>
          <Typography variant="body2" paragraph>
            • Government fees are subject to change as per official notifications.
          </Typography>
          <Typography variant="body2" paragraph>
            • Service delivery timelines may vary based on government processing times.
          </Typography>
          <Typography variant="body2" paragraph>
            • Additional charges may apply for expedited processing or additional documentation.
          </Typography>
          <Typography variant="body2">
            • This quotation is valid for 30 days from the date of issue.
          </Typography>
        </CardContent>
      </StyledCard>
    </Container>
  );
}
