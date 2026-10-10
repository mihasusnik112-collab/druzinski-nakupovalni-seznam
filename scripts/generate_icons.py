from PIL import Image, ImageDraw

def create_pwa_icon(size, is_maskable=False):
    # Supersampling 2x for smooth antialiasing
    scale = 2
    dim = size * scale
    img = Image.new('RGBA', (dim, dim), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Emerald background #10B981
    radius = int(dim * 0.22) if not is_maskable else 0
    if is_maskable:
        # Full bleed for maskable icon
        draw.rectangle([0, 0, dim, dim], fill=(16, 185, 129, 255))
    else:
        draw.rounded_rectangle([0, 0, dim, dim], radius=radius, fill=(16, 185, 129, 255))
    
    # Internal content scaling (for maskable, add more margin: 60% safe zone)
    content_scale = 0.60 if is_maskable else 0.78
    center = dim // 2
    
    # Bag coordinates
    bag_w = int(dim * 0.52 * content_scale)
    bag_h = int(dim * 0.50 * content_scale)
    bag_x0 = center - bag_w // 2
    bag_x1 = center + bag_w // 2
    bag_y0 = center - int(bag_h * 0.25)
    bag_y1 = bag_y0 + bag_h
    
    # Handle coordinates
    h_w = int(bag_w * 0.55)
    h_h = int(bag_h * 0.50)
    h_x0 = center - h_w // 2
    h_x1 = center + h_w // 2
    h_y0 = bag_y0 - int(h_h * 0.65)
    h_y1 = bag_y0 + int(h_h * 0.35)
    handle_thick = int(dim * 0.05 * content_scale)
    
    # Draw Handle (arc)
    draw.arc([h_x0, h_y0, h_x1, h_y1], start=180, end=0, fill=(255, 255, 255, 255), width=handle_thick)
    
    # Draw Bag body
    bag_r = int(dim * 0.08 * content_scale)
    draw.rounded_rectangle([bag_x0, bag_y0, bag_x1, bag_y1], radius=bag_r, fill=(255, 255, 255, 255))
    
    # Apple on bag (Red circle with indent)
    apple_r = int(bag_w * 0.28)
    apple_cy = bag_y0 + int(bag_h * 0.52)
    draw.ellipse([center - apple_r, apple_cy - apple_r, center + apple_r, apple_cy + apple_r], fill=(239, 68, 68, 255))
    
    # Apple leaf (Green)
    leaf_w = int(apple_r * 0.6)
    leaf_h = int(apple_r * 0.4)
    draw.ellipse([center, apple_cy - apple_r - int(leaf_h*0.7), center + leaf_w, apple_cy - apple_r + int(leaf_h*0.3)], fill=(16, 185, 129, 255))
    
    # Resize to target
    res = img.resize((size, size), Image.Resampling.LANCZOS)
    return res

if __name__ == '__main__':
    create_pwa_icon(192).save('public/pwa-192x192.png')
    create_pwa_icon(512).save('public/pwa-512x512.png')
    create_pwa_icon(512, is_maskable=True).save('public/pwa-maskable-512x512.png')
    create_pwa_icon(180).save('public/apple-touch-icon.png')
    print('PNG icons generated successfully!')
