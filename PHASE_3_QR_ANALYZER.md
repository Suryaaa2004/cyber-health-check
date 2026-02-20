# Phase 3 - QR Payment Safety Analyzer

## Overview

The QR Payment Safety Analyzer is a fraud awareness tool that analyzes QR codes for payment fraud patterns and security risks. It helps users identify potentially malicious or suspicious payment QR codes before scanning or making payments.

## Features

### 1. QR Code Upload & Analysis
- Upload QR code images (PNG/JPG)
- Automatic QR code decoding using pyzbar
- Real-time payment format detection

### 2. Payment Type Detection
- **UPI Codes**: Standard UPI payment format detection
- **URL-based Payments**: HTTPS payment gateway detection  
- **Unknown/Suspicious**: Unrecognized formats flagged as potential risk

### 3. Safety Checks

#### Fraud Indicators Detected:
- **Missing Merchant Information**: QR without merchant name
- **Suspicious URL Patterns**: Short links, fake payment domains
- **Unencrypted URLs**: HTTP instead of HTTPS payment gateways
- **Invalid Payment Format**: Random text or unrecognized protocols
- **Unknown Payment Systems**: Non-standard payment methods

### 4. Risk Levels

- **Green (Safe)**: Valid payment format with proper indicators, merchant name present
- **Yellow (Warning)**: Valid format but missing verification information
- **Red (Suspicious)**: Unknown format, suspicious URLs, or critical security issues

### 5. Educational Alerts

Integrated fraud awareness panel showing:
- Always verify receiver name before paying
- Scanning QR does NOT receive money
- Check for sticker tampering in shops
- QR replacement scam awareness
- Fake payment request warnings

## Architecture

### Frontend (React/TypeScript)
- **Component**: `QRPaymentAnalyzer.tsx`
- Location: `/components/QRPaymentAnalyzer.tsx`
- Features:
  - File upload interface with drag-and-drop
  - Risk indicator visualization (green/yellow/red)
  - Extracted payment information display
  - Analysis findings presentation
  - Education panel for fraud awareness

### Backend (Python/FastAPI)

#### QR Analyzer Module
- **File**: `backend/scanners/qr_analyzer.py`
- **Class**: `QRPaymentAnalyzer`
- **Functions**:
  - `analyze_qr_image()` - Main analysis function
  - `_decode_qr()` - QR code decoding using pyzbar
  - `_analyze_content()` - Payment format analysis
  - `_build_response()` - Response formatting

#### API Endpoint
- **Route**: `POST /api/qr-analyze`
- **Proxy Route**: `POST /api/qr-analyze` (Next.js)
- **Input**: Base64 encoded image
- **Output**: Structured analysis results with flags and risk assessment

### Next.js API Routes
- **File**: `app/api/qr-analyze/route.ts`
- **Purpose**: Bridge between frontend and backend
- **Fallback**: Mock analysis when backend unavailable

## Usage

### For Users

1. **Navigate to QR Safety Scan Tab**
   - Click the "QR Payment Safety" tab on the main page
   - (Or "QR" on mobile)

2. **Upload QR Code**
   - Click "Choose File" button
   - Select PNG or JPG image containing the QR code
   - Image is analyzed automatically

3. **Review Results**
   - Check risk level (Green/Yellow/Red)
   - Review extracted payment information
   - Read security findings
   - Consult fraud awareness tips

4. **Analyze Another**
   - Click "Analyze Another QR" button
   - Upload next QR code

### Safety Guidelines

Before making payment via QR code:

1. **Verify Information**
   - Check merchant name matches expected party
   - Confirm UPI ID or payment URL

2. **Check Physical QR Codes**
   - Look for tampering indicators
   - Compare with official merchant materials
   - Verify QR not replaced with sticker

3. **Protect Payment Details**
   - Only scan from trusted sources
   - Don't share QR code payment screens
   - Verify receiving account details

## Testing

### Mock Data (When Backend Unavailable)

The system automatically provides realistic mock analysis with multiple scenarios:

1. **Safe UPI**: Valid merchant payment
2. **Missing Info**: UPI without merchant name  
3. **Suspicious URL**: Non-standard payment domain
4. **Random Text**: Invalid/malicious QR content

### Real Backend Testing

When Python backend is running with pyzbar installed:

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Supported formats:
- UPI: `upi://pay?pa=merchant@upi&pn=Merchant%20Name&am=100`
- URL: `https://payment.gateway.com/pay?amount=100`
- Unsupported: Random text, invalid formats

## Fraud Indicators & Risk Scoring

### Risk Score Calculation

| Factor | Base Score | Risk Multiplier |
|--------|-----------|-----------------|
| UPI Format | 20 | +0% |
| Missing Merchant | +30 | × 1.5 |
| HTTP URL | +20 | × 1.0 |
| Suspicious Domain | +40 | × 2.0 |
| Unknown Format | +85 | × 1.0 |

### Suspicious Domain Patterns
- Short link services: `bit.ly`, `tinyurl`, `goo.gl`
- Fake payment domains: `pay-verify`, `confirm-payment`
- Phishing patterns: `secure-bank`, `verify-account`

## Security Considerations

### What This Tool Detects
✓ Invalid payment format QR codes
✓ Missing critical payment information
✓ Suspicious URL patterns
✓ Unencrypted payment links
✓ Non-standard payment methods

### What This Tool Does NOT Detect
✗ Legitimate URLs that redirect to fraud sites
✗ Authentic-looking spoofed URLs
✗ Compromised legitimate payment gateways
✗ Man-in-the-middle attacks

### Disclaimer

**Important**: This tool provides awareness-based analysis and does not guarantee fraud detection. It serves as an educational tool to help users understand QR code payment risks. Always:

- Use official payment apps recommended by banks
- Verify payment details through multiple channels
- Contact your bank directly for payment issues
- Report suspicious QR codes to relevant authorities

## Dependencies

### Frontend
- React 18+
- TypeScript
- Tailwind CSS
- Lucide React icons

### Backend
- FastAPI 0.104+
- Python 3.8+
- pyzbar 0.1.9+ (QR decoding)
- Pillow 10.1+ (Image processing)

### Installation

```bash
# Backend dependencies
cd backend
pip install -r requirements.txt

# Frontend is part of Next.js project (no additional install needed)
```

## Future Enhancements

1. **Webcam Support**: Real-time QR scanning from device camera
2. **Payment History**: Track scanned QR codes
3. **Database Integration**: Store analysis results
4. **Advanced Pattern Recognition**: ML-based fraud detection
5. **Regional Fraud Alerts**: Location-specific risk indicators
6. **Real-time Updates**: Latest fraud patterns database
7. **User Reports**: Community fraud reporting system
8. **Deep Link Analysis**: Check final destination of URLs

## API Documentation

### QR Analysis Request

```json
POST /api/qr-analyze
Content-Type: application/json

{
  "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA..."
}
```

### QR Analysis Response

```json
{
  "paymentType": "UPI",
  "upiId": "merchant@upi",
  "merchantName": "Coffee Shop XYZ",
  "paymentUrl": "upi://pay?pa=merchant@upi&pn=Coffee%20Shop&am=100",
  "riskLevel": "safe",
  "riskScore": 15,
  "flags": [
    {
      "category": "Payment Format",
      "message": "Valid UPI format detected",
      "severity": "info"
    },
    {
      "category": "Merchant Verification",
      "message": "Merchant name present in QR data",
      "severity": "info"
    }
  ]
}
```

## Configuration

### Environment Variables

None required for Phase 3 in standalone mode. Uses default backend URL if available.

### Optional Backend Configuration

```bash
BACKEND_URL=http://your-backend-server:8000
```

## Troubleshooting

### "Could not decode QR code from image"
- Ensure image contains valid QR code
- Try higher resolution image
- Check image is not blurry

### Backend Analysis Unavailable
- System falls back to mock analysis automatically
- For real analysis, ensure backend running with pyzbar installed

### Large Image Processing
- Recommended max image size: 10MB
- Resize images if needed before upload

## Support

For issues or questions:
1. Check the FAQ section
2. Review fraud awareness tips
3. Contact support through main platform
4. Report fraudulent QR codes to authorities
