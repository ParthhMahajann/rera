import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Typography,
  FormHelperText,
  Container,
  ListSubheader,
  Stack,
  Chip,
  Paper,
} from "@mui/material";
import {
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Home as HomeIcon,
  AccountBalance as BankIcon,
  DateRange as DateRangeIcon,
  VerifiedUser as VerifiedIcon,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { createQuotation } from "../services/quotations";

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
          },
        },
      },
    },
  },
});

// Constants
const DEVELOPER_TYPE_OPTIONS = [
  { value: "category 1", label: "Category 1" },
  { value: "category 2", label: "Category 2" },
  { value: "category 3", label: "Category 3" },
  { value: "agent", label: "Agent Registration" },
];

const REGION_GROUPS = [
  {
    label: "Project Region",
    options: [
      "Mumbai Suburban", "Mumbai City", "Thane", "Palghar", "KDMC", 
      "Navi Mumbai", "Raigad", "Pune - 1", "Pune 2", "Pune 3", 
      "Pune 4", "ROM (Rest of Maharashtra)"
    ],
  },
];

const VALIDITY_OPTIONS = ["7 days", "15 days", "30 days"];
const PAYMENT_SCHEDULE_OPTIONS = ["25%","50%", "70%", "100%"];

const INITIAL_FORM_STATE = {
  developerType: "",
  projectRegion: "",
  projectLocation: "",
  plotArea: "",
  developerName: "",
  projectName: "",
  validity: "",
  paymentSchedule: "",
  reraNumber: "",
};

// Enhanced styles for form fields - matching QuotationPricing
const fieldStyles = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#f8fafc',
    transition: 'all 0.2s ease-in-out',
    height: '56px', // Fixed height
    '&:hover': {
      backgroundColor: '#f1f5f9',
      transform: 'none', // Keep static
    },
    '&.Mui-focused': {
      backgroundColor: 'white',
      boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
      transform: 'none', // Keep static
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

export default function CreateQuotation() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM_STATE);

  // Plot area validation
  const plotAreaNum = useMemo(() => Number(form.plotArea), [form.plotArea]);
  const plotAreaValid = useMemo(
    () => Number.isFinite(plotAreaNum) && plotAreaNum >= 0,
    [plotAreaNum]
  );

  const plotAreaBand = useMemo(() => {
    if (!plotAreaValid) return "";
    if (plotAreaNum <= 500) return "0 - 500 sq units";
    if (plotAreaNum <= 1000) return "501 - 1000 sq units";
    if (plotAreaNum <= 1500) return "1001 - 1500 sq units";
    if (plotAreaNum <= 2500) return "1501 - 2500 sq units";
    if (plotAreaNum <= 4000) return "2501 - 4000 sq units";
    if (plotAreaNum <= 6500) return "4001 - 6500 sq units";
    return "6500+ sq units";
  }, [plotAreaValid, plotAreaNum]);

  const handleChange = (field, value) => {
    setForm((prevForm) => ({ ...prevForm, [field]: value }));
  };

  const validateReraNumber = (value) => {
    if (!value) return true;
    return /^[A-Z0-9]{3,5}-[A-Z0-9]{6,10}$/i.test(value);
  };

  const reraValid = validateReraNumber(form.reraNumber);

  const canSubmit = useMemo(
    () =>
      !!form.developerType &&
      !!form.projectRegion &&
      form.developerName.trim().length > 0 &&
      plotAreaValid &&
      !!form.validity &&
      !!form.paymentSchedule &&
      reraValid,
    [form, plotAreaValid, reraValid]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      const created = await createQuotation({
        ...form,
        plotArea: Number(form.plotArea),
        projectName: form.projectName || null,
        reraNumber: form.reraNumber || null,
        createdBy: form.developerName,
      });

      if (form.developerType !== "agent" && created?.id) {
        navigate(`/quotations/${encodeURIComponent(created.id)}/services`);
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save quotation");
    }
  };

  useEffect(() => {
    if (form.developerType === "agent") {
      navigate("/quotations/new/agent", { replace: true });
    }
  }, [form.developerType, navigate]);

  const developerDependentDisabled = form.developerType === "agent";

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          {/* Enhanced Header with EXACT same styling as QuotationPricing */}
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
              Create Quotation
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 400 }}>
              Project Management & Registration Services
            </Typography>
          </Paper>

          {/* Main Form Card - EXACT same styling as QuotationPricing */}
          <Card>
            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                {/* Section Header */}
                <Typography variant="h6" sx={{ mb: 3, color: theme.palette.grey[700], fontWeight: 600 }}>
                  Developer & Project Information
                </Typography>
                <Typography variant="body2" sx={{ mb: 4, color: theme.palette.grey[600] }}>
                  Enter comprehensive project details for accurate quotation
                </Typography>

                <Stack spacing={3}>
                  {/* Row 1: Developer Type & Project Region */}
                  <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                    <TextField
                      select
                      label="Developer Type"
                      value={form.developerType}
                      onChange={(e) => handleChange("developerType", e.target.value)}
                      helperText={!form.developerType ? "Please select developer type" : ""}
                      required
                      fullWidth
                      sx={{ ...fieldStyles, flex: 1 }}
                    >
                      {DEVELOPER_TYPE_OPTIONS.map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      label="Project Region"
                      value={form.projectRegion}
                      onChange={(e) => handleChange("projectRegion", e.target.value)}
                      helperText={!form.projectRegion ? "Please select project region" : ""}
                      required
                      fullWidth
                      sx={{ ...fieldStyles, flex: 1 }}
                    >
                      {REGION_GROUPS.map((g) => [
                        <ListSubheader key={g.label}>{g.label}</ListSubheader>,
                        ...g.options.map((opt) => (
                          <MenuItem key={opt} value={opt}>
                            {opt}
                          </MenuItem>
                        )),
                      ])}
                    </TextField>
                  </Stack>

                  {/* Agent Registration Notice */}
                  {form.developerType === "agent" && (
                    <Paper
                      sx={{
                        backgroundColor: theme.palette.warning.light,
                        p: 2,
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.warning.main}`,
                      }}
                    >
                      <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600 }}>
                        Agent Registration Mode: Some fields are disabled for Agent Registration process.
                      </Typography>
                    </Paper>
                  )}

                  {/* Row 2: Project Location & Developer Name */}
                  <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                    <TextField
                      label="Project Location"
                      value={form.projectLocation}
                      onChange={(e) => handleChange("projectLocation", e.target.value)}
                      fullWidth
                      disabled={developerDependentDisabled}
                      sx={{ ...fieldStyles, flex: 1 }}
                    />

                    <TextField
                      label="Developer Name"
                      value={form.developerName}
                      onChange={(e) => handleChange("developerName", e.target.value)}
                      required
                      fullWidth
                      disabled={developerDependentDisabled}
                      sx={{ ...fieldStyles, flex: 1 }}
                    />
                  </Stack>

                  {/* Row 3: Project Name & Plot Area */}
                  <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                    <TextField
                      label="Project Name"
                      value={form.projectName}
                      onChange={(e) => handleChange("projectName", e.target.value)}
                      fullWidth
                      disabled={developerDependentDisabled}
                      sx={{ ...fieldStyles, flex: 1 }}
                    />

                    <Box sx={{ flex: 1 }}>
                      <TextField
                        label="Plot Area (sq units)"
                        value={form.plotArea}
                        onChange={(e) => handleChange("plotArea", e.target.value)}
                        required
                        fullWidth
                        error={!plotAreaValid && form.plotArea !== ""}
                        helperText={
                          !plotAreaValid && form.plotArea !== ""
                            ? "Enter a valid non-negative number."
                            : plotAreaValid && plotAreaBand
                            ? `Detected range: ${plotAreaBand}`
                            : ""
                        }
                        sx={fieldStyles}
                      />
                      {plotAreaValid && plotAreaBand && (
                        <Chip
                          label={plotAreaBand}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  </Stack>

                  {/* Row 4: Quotation Validity & Advance Payment */}
                  <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                    <TextField
                      select
                      label="Quotation Validity"
                      value={form.validity}
                      onChange={(e) => handleChange("validity", e.target.value)}
                      helperText={!form.validity ? "Please select validity period" : ""}
                      required
                      fullWidth
                      sx={{ ...fieldStyles, flex: 1 }}
                    >
                      {VALIDITY_OPTIONS.map((v) => (
                        <MenuItem key={v} value={v}>
                          {v}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      label="Advance Payment %"
                      value={form.paymentSchedule}
                      onChange={(e) => handleChange("paymentSchedule", e.target.value)}
                      helperText={!form.paymentSchedule ? "Please select payment percentage" : ""}
                      required
                      fullWidth
                      sx={{ ...fieldStyles, flex: 1 }}
                    >
                      {PAYMENT_SCHEDULE_OPTIONS.map((v) => (
                        <MenuItem key={v} value={v}>
                          {v}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>

                  {/* Row 5: RERA Project Number */}
                  <TextField
                    label="RERA Project Number (Optional)"
                    value={form.reraNumber}
                    onChange={(e) => handleChange("reraNumber", e.target.value.toUpperCase())}
                    placeholder="e.g., P51700000123"
                    fullWidth
                    error={!reraValid}
                    helperText={
                      !reraValid
                        ? "Format should be like ABC-123456 or P517-201234."
                        : form.reraNumber ? "✓ RERA number format is valid" : ""
                    }
                    sx={{ ...fieldStyles, maxWidth: { md: "50%" } }}
                  />
                </Stack>

                {/* Action Buttons - EXACT same styling as QuotationPricing */}
                <Stack 
                  direction="row" 
                  spacing={2} 
                  justifyContent="flex-end" 
                  sx={{ mt: 4, pt: 3, borderTop: `1px solid ${theme.palette.grey[200]}` }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    size="large"
                    sx={{ px: 4 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!canSubmit}
                    size="large"
                    sx={{
                      px: 4,
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                    }}
                  >
                    Next Step
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
}