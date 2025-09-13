import React from "react";
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";

const QuarterSelector = ({ 
  value = 1, 
  onChange, 
  serviceName,
  basePrice,
  disabled = false 
}) => {
  const quarters = [1, 2, 3, 4, 5, 6, 7, 8];

  const handleChange = (event) => {
    const quarterCount = parseInt(event.target.value);
    onChange(quarterCount);
  };

  const calculatePrice = (quarterCount) => {
    return basePrice * quarterCount;
  };

  return (
    <Box sx={{ mt: 2, p: 2, border: 1, borderColor: 'primary.main', borderRadius: 1, bgcolor: 'primary.light', opacity: 0.1 }}>
      <Typography variant="subtitle2" color="primary" gutterBottom>
        Quarter-based Pricing for {serviceName}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
        <FormControl size="small" sx={{ minWidth: 120 }} disabled={disabled}>
          <InputLabel>Quarters</InputLabel>
          <Select
            value={value}
            label="Quarters"
            onChange={handleChange}
            sx={{ bgcolor: 'white' }}
          >
            {quarters.map((quarter) => (
              <MenuItem key={quarter} value={quarter}>
                {quarter} Quarter{quarter > 1 ? 's' : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Box>
          <Typography variant="body2" color="text.secondary">
            Base Price: ₹{basePrice?.toLocaleString()} × {value} = 
          </Typography>
          <Typography variant="body1" fontWeight="600" color="primary">
            ₹{calculatePrice(value).toLocaleString()}
          </Typography>
        </Box>
      </Box>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Select the number of quarters required for this service. Price will be multiplied accordingly.
      </Typography>
    </Box>
  );
};

export default QuarterSelector;
