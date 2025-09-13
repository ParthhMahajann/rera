import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const EnhancedApprovalPreviewModal = ({
  open,
  onClose,
  quotation,
  onApprove,
  onReject,
}) => {
  if (!quotation) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* Header */}
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Quotation Approval Preview
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {/* Services Section */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Services Requiring Approval
          </Typography>
          {quotation.services && quotation.services.length > 0 ? (
            quotation.services.map((service, index) => (
              <Box key={index} mb={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {service.category || "Service Group"}
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Service Name</TableCell>
                        <TableCell>Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {service.items.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>₹{item.amount?.toLocaleString() || "N/A"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No services selected
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Discount Section */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Discount Approval
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2">Original Amount</Typography>
                  <Typography variant="h6">
                    ₹{quotation.originalAmount?.toLocaleString() || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2">Discount Amount</Typography>
                  <Typography variant="h6">
                    ₹{quotation.discountAmount?.toLocaleString() || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2">Discount Percentage</Typography>
                  <Typography variant="h6">
                    {quotation.discountPercent || 0}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2">Final Amount</Typography>
                  <Typography variant="h6">
                    ₹{quotation.finalAmount?.toLocaleString() || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Custom Services Section */}
        {quotation.customServices && quotation.customServices.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Custom Services
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quotation.customServices.map((cs, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{cs.name}</TableCell>
                      <TableCell>₹{cs.amount?.toLocaleString() || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Custom Terms Section */}
        {quotation.customTerms && quotation.customTerms.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Custom Terms
            </Typography>
            {quotation.customTerms.map((term, idx) => (
              <Typography key={idx} variant="body2" sx={{ mt: 1 }}>
                - {term}
              </Typography>
            ))}
          </Box>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onReject} color="error" variant="outlined">
          Reject
        </Button>
        <Button onClick={onApprove} color="primary" variant="contained">
          Approve
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnhancedApprovalPreviewModal;
