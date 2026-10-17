import os
import subprocess

# SVG representing the exact WZOS logo uploaded by user
svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Hazard diagonal stripe pattern for top and bottom -->
    <pattern id="hazardStripes" width="90" height="90" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="45" height="90" fill="#FACC15"/>
      <rect x="45" width="45" height="90" fill="#121316"/>
    </pattern>
    <clipPath id="roundedClip">
      <rect x="20" y="20" width="472" height="472" rx="90" ry="90"/>
    </clipPath>
    <clipPath id="maskableClip">
      <rect x="0" y="0" width="512" height="512" rx="60" ry="60"/>
    </clipPath>
  </defs>

  <!-- Outer background rounded card -->
  <rect x="16" y="16" width="480" height="480" rx="94" fill="#0A0B0D" stroke="#252730" stroke-width="8"/>

  <!-- Clipped inner content -->
  <g clip-path="url(#roundedClip)">
    <!-- Dark background -->
    <rect x="20" y="20" width="472" height="472" fill="#121316"/>

    <!-- Top hazard stripe band (y: 20 to 160) -->
    <rect x="20" y="20" width="472" height="142" fill="url(#hazardStripes)"/>

    <!-- Middle black band for text contrast (y: 155 to 357) -->
    <rect x="20" y="155" width="472" height="202" fill="#121316"/>

    <!-- Bottom hazard stripe band (y: 350 to 492) -->
    <rect x="20" y="350" width="472" height="142" fill="url(#hazardStripes)"/>

    <!-- Thin separator accents -->
    <line x1="20" y1="158" x2="492" y2="158" stroke="#121316" stroke-width="6"/>
    <line x1="20" y1="354" x2="492" y2="354" stroke="#121316" stroke-width="6"/>

    <!-- Bold WZOS typography -->
    <text x="256" y="312"
          text-anchor="middle"
          fill="#FFFFFF"
          font-family="system-ui, -apple-system, 'Impact', 'Arial Black', sans-serif"
          font-weight="900"
          font-size="160"
          letter-spacing="2">WZOS</text>
  </g>
</svg>
'''

# Maskable SVG with safe margins for Android adaptive squircle/circle cropping
maskable_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <pattern id="hazardStripesMask" width="70" height="70" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="35" height="70" fill="#FACC15"/>
      <rect x="35" width="35" height="70" fill="#121316"/>
    </pattern>
  </defs>

  <!-- Full bleed dark background -->
  <rect width="512" height="512" fill="#121316"/>

  <!-- Centered safe zone inner content (80% safe zone circle/rect) -->
  <g transform="translate(40, 40) scale(0.84)">
    <rect x="16" y="16" width="480" height="480" rx="80" fill="#0A0B0D" stroke="#252730" stroke-width="8"/>
    <rect x="20" y="20" width="472" height="142" fill="url(#hazardStripesMask)"/>
    <rect x="20" y="155" width="472" height="202" fill="#121316"/>
    <rect x="20" y="350" width="472" height="142" fill="url(#hazardStripesMask)"/>
    <text x="256" y="312"
          text-anchor="middle"
          fill="#FFFFFF"
          font-family="system-ui, -apple-system, 'Impact', 'Arial Black', sans-serif"
          font-weight="900"
          font-size="160"
          letter-spacing="2">WZOS</text>
  </g>
</svg>
'''

os.makedirs('public', exist_ok=True)
os.makedirs('src/assets/images', exist_ok=True)

with open('public/icon.svg', 'w') as f:
    f.write(svg_content)

with open('public/icon-maskable.svg', 'w') as f:
    f.write(maskable_svg)

print("SVGs written successfully")
