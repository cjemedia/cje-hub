# Open Graph Image Setup

## Required Image
Create an image file at `/public/images/og-image.png` with the following specifications:

- **Dimensions:** 1200 x 630 pixels
- **Format:** PNG or JPG
- **Aspect Ratio:** 1.91:1 (width:height)

## How to Create

### Option 1: Resize existing image
If you want to use `cje19.png` as the base:

```bash
# Using ImageMagick (if installed)
convert public/images/cje19.png -resize 1200x630^ -gravity center -extent 1200x630 public/images/og-image.png

# Or use an online tool like:
# - https://www.iloveimg.com/resize-image
# - https://www.resizepixel.com/
# - https://squoosh.app/
```

### Option 2: Create new design
Design a 1200x630 image that includes:
- Ciara J. Evans branding
- The CJE Experience logo
- Text overlay (optional): "Ciara J. Evans | The CJE Experience"

## Current Status
- ✅ Metadata configured to use `/images/og-image.png`
- ⚠️ Image file needs to be created at the correct size (1200x630)

## Testing
After creating the image, test it using:
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

