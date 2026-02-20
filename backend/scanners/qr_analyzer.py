"""
QR Payment Safety Analyzer
Detects and analyzes QR codes for payment fraud patterns and security risks
"""

import re
import base64
from typing import Dict, List, Tuple
from io import BytesIO
from PIL import Image

try:
    from pyzbar.pyzbar import decode as pyzbar_decode
    HAS_PYZBAR = True
except ImportError:
    HAS_PYZBAR = False
    print("[QR] Warning: pyzbar not installed. Install with: pip install pyzbar pillow")


class QRPaymentAnalyzer:
    """Analyzes QR codes for payment safety and fraud risks"""

    SUSPICIOUS_DOMAINS = [
        'bit.ly', 'tinyurl', 'short.link', 'goo.gl',
        'pay-verify', 'confirm-payment', 'verify-account',
        'secure-bank', 'update-billing', 'verify-identity'
    ]

    def __init__(self):
        self.upi_pattern = re.compile(r'upi://pay\?pa=([^&]+)')
        self.http_pattern = re.compile(r'https?://[^\s]+')

    async def analyze_qr_image(self, image_base64: str) -> Dict:
        """
        Analyze a QR code image for payment safety
        
        Args:
            image_base64: Base64 encoded image data
            
        Returns:
            Dictionary containing analysis results
        """
        try:
            # Decode image
            image_data = base64.b64decode(image_base64.split(',')[1] if ',' in image_base64 else image_base64)
            image = Image.open(BytesIO(image_data))
            
            # Decode QR code
            qr_content = self._decode_qr(image)
            
            if not qr_content:
                return self._build_response(
                    payment_type='Unknown',
                    risk_level='warning',
                    risk_score=60,
                    flags=[{
                        'category': 'QR Detection',
                        'message': 'Could not decode QR code from image',
                        'severity': 'warning'
                    }]
                )
            
            # Analyze content
            return self._analyze_content(qr_content)
            
        except Exception as e:
            print(f"[QR] Analysis error: {str(e)}")
            return self._build_response(
                payment_type='Error',
                risk_level='warning',
                risk_score=50,
                flags=[{
                    'category': 'Processing Error',
                    'message': str(e),
                    'severity': 'warning'
                }]
            )

    def _decode_qr(self, image: Image.Image) -> str:
        """Decode QR code using pyzbar"""
        if not HAS_PYZBAR:
            return None
            
        try:
            decoded_objects = pyzbar_decode(image)
            if decoded_objects:
                return decoded_objects[0].data.decode('utf-8')
        except Exception as e:
            print(f"[QR] Decode error: {str(e)}")
        
        return None

    def _analyze_content(self, content: str) -> Dict:
        """Analyze decoded QR content for payment safety"""
        
        flags = []
        risk_score = 0
        payment_type = 'Unknown'
        upi_id = None
        merchant_name = None
        payment_url = None

        # Check for UPI format
        upi_match = self.upi_pattern.search(content)
        if upi_match:
            payment_type = 'UPI'
            upi_id = upi_match.group(1)
            risk_score = 20
            
            # Check if merchant name present
            if '&pn=' in content:
                pn_match = re.search(r'&pn=([^&]+)', content)
                if pn_match:
                    merchant_name = pn_match.group(1).replace('%20', ' ')
                    flags.append({
                        'category': 'Merchant Verification',
                        'message': f'Merchant name present: {merchant_name}',
                        'severity': 'info'
                    })
            else:
                risk_score += 30
                flags.append({
                    'category': 'Missing Information',
                    'message': 'Merchant name not present in QR code',
                    'severity': 'warning'
                })
                flags.append({
                    'category': 'Security Risk',
                    'message': 'Cannot verify legitimate merchant from QR alone',
                    'severity': 'warning'
                })

        # Check for HTTP/HTTPS URLs
        http_match = self.http_pattern.search(content)
        if http_match:
            payment_type = 'URL-based Payment'
            payment_url = http_match.group(0)
            risk_score = 40
            
            # Check for suspicious domains
            url_lower = payment_url.lower()
            for suspicious in self.SUSPICIOUS_DOMAINS:
                if suspicious in url_lower:
                    risk_score = 80
                    flags.append({
                        'category': 'Suspicious Domain',
                        'message': f'URL contains potentially suspicious pattern: {suspicious}',
                        'severity': 'critical'
                    })
                    break
            
            # Check for HTTPS
            if not payment_url.startswith('https://'):
                risk_score += 20
                flags.append({
                    'category': 'Security Warning',
                    'message': 'Payment URL does not use HTTPS encryption',
                    'severity': 'critical'
                })

        # Random text or unknown format
        if not upi_match and not http_match:
            payment_type = 'Random Text/Unknown'
            risk_score = 85
            flags.append({
                'category': 'Invalid Format',
                'message': 'QR code contains unrecognized payment format',
                'severity': 'critical'
            })
            flags.append({
                'category': 'Security Risk',
                'message': 'Content does not match known payment system formats',
                'severity': 'critical'
            })

        # Determine risk level
        if risk_score <= 30:
            risk_level = 'safe'
            flags.insert(0, {
                'category': 'Payment Format',
                'message': 'Valid payment format detected with proper security indicators',
                'severity': 'info'
            })
        elif risk_score <= 60:
            risk_level = 'warning'
            flags.insert(0, {
                'category': 'Caution Required',
                'message': 'Payment QR detected but additional verification recommended',
                'severity': 'warning'
            })
        else:
            risk_level = 'suspicious'

        return self._build_response(
            payment_type=payment_type,
            upi_id=upi_id,
            merchant_name=merchant_name,
            payment_url=payment_url,
            risk_level=risk_level,
            risk_score=min(100, risk_score),
            flags=flags
        )

    def _build_response(self, payment_type: str, risk_level: str, risk_score: int,
                       upi_id: str = None, merchant_name: str = None,
                       payment_url: str = None, flags: List[Dict] = None) -> Dict:
        """Build standardized response"""
        return {
            'paymentType': payment_type,
            'upiId': upi_id,
            'merchantName': merchant_name,
            'paymentUrl': payment_url,
            'riskLevel': risk_level,
            'riskScore': risk_score,
            'flags': flags or []
        }


# Initialize analyzer
qr_analyzer = QRPaymentAnalyzer()
