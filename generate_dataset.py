import csv
import random

# File to output dataset
OUTPUT_FILE = 'advanced_ad_dataset.csv'
NUM_SAMPLES = 1500

# Feature definitions
FEATURES = [
    'width', 'height', 'num_links', 'has_iframe', 'has_keyword', 
    'text_length', 'num_images', 'is_fixed_pos', 'z_index_high', 
    'cross_domain_links', 'is_ad'
]

def generate_ad_sample():
    """Generates a realistic Ad profile"""
    # Ad sizes: standard IAB banner sizes mostly
    sizes = [(300, 250), (728, 90), (160, 600), (320, 50), (970, 250), (300, 600)]
    w, h = random.choice(sizes)
    
    num_links = random.randint(1, 3) 
    has_iframe = 1 if random.random() > 0.4 else 0 # 60% are iframes
    has_keyword = 1 if random.random() > 0.3 else 0 # 70% have keywords
    
    # Ads have very little actual pure text, mostly graphics
    text_length = random.randint(0, 50) 
    num_images = random.randint(1, 4)
    
    # Ads are often fixed or have high z-indexes (popups/stickies)
    is_fixed_pos = 1 if random.random() > 0.7 else 0
    z_index_high = 1 if random.random() > 0.6 else 0
    
    # Ads almost EXCLUSIVELY link to external domains
    cross_domain_links = random.randint(1, num_links) if num_links > 0 else 1
    
    return [w, h, num_links, has_iframe, has_keyword, text_length, num_images, is_fixed_pos, z_index_high, cross_domain_links, 1]

def generate_normal_sample():
    """Generates a realistic normal HTML content profile"""
    category = random.choice(['header', 'article', 'sidebar_widget', 'youtube_embed'])
    
    if category == 'header':
        w = random.randint(800, 1920)
        h = random.randint(50, 150)
        num_links = random.randint(5, 20)
        has_iframe = 0
        has_keyword = 1 if random.random() > 0.9 else 0 # Rarely has keyword
        text_length = random.randint(20, 100)
        num_images = random.randint(0, 2) # Logo
        is_fixed_pos = 1 if random.random() > 0.5 else 0 # Sticky headers exist
        z_index_high = 1 if is_fixed_pos else 0
        cross_domain_links = 0 # Mostly internal links
        
    elif category == 'article':
        w = random.randint(600, 900)
        h = random.randint(500, 3000)
        num_links = random.randint(2, 15)
        has_iframe = 0
        has_keyword = 0 
        text_length = random.randint(1000, 5000) # Tons of text
        num_images = random.randint(1, 5)
        is_fixed_pos = 0
        z_index_high = 0
        cross_domain_links = random.randint(0, 2) # Might link externally a bit
        
    elif category == 'sidebar_widget':
        w = random.randint(250, 350)
        h = random.randint(200, 400)
        num_links = random.randint(0, 5)
        has_iframe = 0
        has_keyword = 0
        text_length = random.randint(50, 300)
        num_images = random.randint(0, 1)
        is_fixed_pos = 0
        z_index_high = 0
        cross_domain_links = 0
        
    elif category == 'youtube_embed':
        w = 560
        h = 315
        num_links = 0
        has_iframe = 1 # THIS IS AN IFRAME, BUT NOT AN AD
        has_keyword = 0
        text_length = 0
        num_images = 0
        is_fixed_pos = 0
        z_index_high = 0
        cross_domain_links = 0
        
    return [w, h, num_links, has_iframe, has_keyword, text_length, num_images, is_fixed_pos, z_index_high, cross_domain_links, 0]

def main():
    with open(OUTPUT_FILE, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(FEATURES)
        
        # Keep dataset balanced: 50% Ads, 50% Normal elements
        ad_count = int(NUM_SAMPLES / 2)
        normal_count = NUM_SAMPLES - ad_count
        
        data = []
        for _ in range(ad_count):
            data.append(generate_ad_sample())
            
        for _ in range(normal_count):
            data.append(generate_normal_sample())
            
        # Shuffle to mix ads and normal samples
        random.shuffle(data)
        
        for row in data:
            writer.writerow(row)
            
    print(f"✅ Successfully generated {NUM_SAMPLES} samples into {OUTPUT_FILE}")

if __name__ == '__main__':
    main()
