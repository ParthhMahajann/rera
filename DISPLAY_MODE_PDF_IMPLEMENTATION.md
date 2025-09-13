# Display Mode PDF Implementation Guide

## Overview

The RERA Easy quotation system now supports **Display Mode** selection that affects both the web view and PDF downloads. Users can choose between two display modes:

1. **Lump Sum Mode**: Shows only header totals and quotation total (individual service prices are hidden)
2. **Bifurcated Mode**: Shows detailed breakdown of all service prices

## Implementation Details

### 1. Frontend Implementation (QuotationSummary.jsx)

The quotation summary page includes a radio button selection for display mode:

```jsx
<FormControl component="fieldset">
  <FormLabel component="legend">Quotation Display Mode</FormLabel>
  <RadioGroup value={displayMode} onChange={handleDisplayModeChange}>
    <FormControlLabel
      value="lumpsum"
      control={<Radio />}
      label="Lump Sum Amount"
    />
    <FormControlLabel
      value="bifurcated"
      control={<Radio />}
      label="Bifurcated Summary"
    />
  </RadioGroup>
</FormControl>
```

### 2. Backend API Integration

The PDF download endpoint (`/api/quotations/<id>/download-pdf`) accepts a `displayMode` parameter:

```javascript
// Frontend download function
const handleDownload = async () => {
  const displayModeParam = getDisplayModeForAPI();
  const res = await fetch(`/api/quotations/${id}/download-pdf?summary=true&displayMode=${displayModeParam}`);
  // ... handle PDF download
};
```

### 3. PDF Generator Logic (pdf_generator.py)

The `QuotationPDFGenerator.generate_summary_pdf()` method processes the display mode:

```python
def generate_summary_pdf(self, quotation_data, filename):
    # Get display mode from quotation data
    display_mode = quotation_data.get('displayMode', 'bifurcated')
    
    # Process each service with display mode logic
    for service in header.get("services", []):
        if display_mode == 'lumpsum':
            # Hide individual service prices
            display_price = None
            show_individual_price = False
        else:
            # Show individual service prices
            display_price = service_price
            show_individual_price = True
        
        # Add to processed services
        processed_services.append({
            "display_price": display_price,
            "show_individual_price": show_individual_price
        })
```

### 4. HTML Template (quotation_summary_template.html)

The template includes conditional logic for display modes:

```html
<!-- Amount Column - Enhanced for Display Modes -->
<td class="service-amount">
    {% if loop.index == 1 %}
        {% if display_mode == 'lumpsum' %}
            <!-- Lump Sum Mode: Hide individual service prices -->
            <span class="amount-hidden">-</span>
        {% else %}
            <!-- Bifurcated Mode: Show individual service prices -->
            {% if service.display_price is not none and service.display_price > 0 %}
                <span class="amount-visible">{{ "{:,.0f}".format(service.display_price) }}*</span>
            {% endif %}
        {% endif %}
    {% endif %}
</td>
```

## How It Works

### Lump Sum Mode (`displayMode: "lumpsum"`)

1. **Frontend**: Individual service prices show as "-"
2. **PDF**: Individual service prices are hidden/show as "-"
3. **Package totals**: Always visible for packages
4. **Grand total**: Always visible

### Bifurcated Mode (`displayMode: "bifurcated"`)

1. **Frontend**: All individual service prices are visible
2. **PDF**: All individual service prices are shown with proper formatting
3. **Package totals**: Visible for packages
4. **Grand total**: Always visible

## Data Flow

1. **User Selection**: User selects display mode via radio buttons in QuotationSummary.jsx
2. **State Management**: Display mode is stored in DisplayModeContext
3. **Download Request**: When user clicks "Download PDF", the current display mode is sent as a parameter
4. **Backend Processing**: 
   - `app.py` extracts displayMode from request parameters
   - Passes it to PDF generator as part of quotation data
5. **PDF Generation**:
   - `pdf_generator.py` processes services based on display mode
   - Template renders appropriate view based on mode
6. **PDF Output**: User receives PDF with correct pricing visibility

## Testing the Implementation

### Manual Testing Steps

1. **Open a quotation summary page**
2. **Test Lump Sum Mode**:
   - Select "Lump Sum Amount" radio button
   - Verify individual service prices show as "-" on screen
   - Click "Download Quotation"
   - Verify PDF shows individual prices as "-" but package totals and grand total are visible
3. **Test Bifurcated Mode**:
   - Select "Bifurcated Summary" radio button  
   - Verify all individual service prices are visible on screen
   - Click "Download Quotation"
   - Verify PDF shows all individual service prices with proper formatting

### Automated Testing

Run the test script to verify logic:
```bash
cd D:\rera-easy
python test_display_mode.py
```

Expected output:
```
✅ Test data structures created successfully
📊 Testing Lumpsum Mode:
     🔒 Service 'Test Service': Price hidden (lumpsum mode)
📊 Testing Bifurcated Mode:  
     👁️ Service 'Another Service': Price shown = 35000 (bifurcated mode)
✅ Display mode logic test completed successfully!
```

## Key Benefits

1. **User Control**: Users can choose how pricing information is displayed
2. **Professional Presentation**: Lump sum mode provides cleaner view for high-level presentations
3. **Detailed Analysis**: Bifurcated mode allows detailed cost analysis
4. **Consistent Experience**: Web view and PDF match exactly
5. **Automatic Sync**: Display mode selection automatically affects PDF output

## Technical Notes

- Display mode defaults to "bifurcated" if not specified
- Package totals are always shown regardless of display mode
- Grand total is always visible in both modes
- The implementation respects edited prices (finalAmount) from pricing breakdown
- Template includes debug mode indicator (hidden in print view)

## Troubleshooting

### Common Issues

1. **PDF shows wrong mode**: Check that displayMode parameter is properly passed in download URL
2. **Individual prices always visible**: Verify display_mode is correctly processed in pdf_generator.py
3. **Template errors**: Check Jinja2 syntax in quotation_summary_template.html

### Debug Steps

1. Check browser network tab for download request URL
2. Look for display mode parameter in server logs
3. Verify quotation_data contains displayMode in pdf_generator.py
4. Check template rendering with debug mode indicator

This implementation provides a robust, user-friendly solution for controlling quotation pricing display in both web and PDF formats.

## ✅ FIXED: PDF Template Format Issues

The PDF template has been completely rewritten to address formatting issues:

### New Template Features:
- **Clean Header Layout**: Logo positioned on top-right, title on top-left
- **Proper Page Structure**: Each header starts on a new page with consistent formatting
- **Service Layout**: 
  - Service name in first column
  - Sub-services displayed as bullet points in description column
  - Pricing aligned to the right
- **Package Totals**: Clearly highlighted at bottom of each service section
- **Grand Total**: Separate section with proper emphasis
- **Professional Styling**: Clean borders, proper spacing, readable fonts

### Display Mode Integration:
- **Lump Sum Mode**: Individual service prices show as "-"
- **Bifurcated Mode**: All service prices visible with proper formatting
- **Package totals and grand total always visible** regardless of mode

### Template Structure:
```html
<!-- Each page has header with logo -->
<div class="header">
    <h1>PACKAGE NAME</h1>
    <img src="logo.png" class="logo">
</div>

<!-- Services table with clean layout -->
<table class="services-table">
    <tr>
        <td>Service Name</td>
        <td>• Sub-service 1<br>• Sub-service 2</td>
        <td>₹ XX,XXX* (or "-" in lump sum)</td>
    </tr>
    <!-- Package total row -->
    <tr class="package-total">
        <td>Package Total</td>
        <td>Total</td>
        <td>₹ XX,XXX*</td>
    </tr>
</table>
```
