import csv
import random

def generate_data(num_samples=1000):
    data = []
    
    # Standard ad sizes
    ad_sizes = [(300, 250), (728, 90), (160, 600), (300, 600), (320, 50), (970, 250)]
    
    # Content sizes
    content_sizes = [(1024, 768), (800, 600), (1920, 1080), (600, 400), (300, 150), 
                     (500, 200), (50, 50), (1200, 800), (100, 100)]
    
    for _ in range(num_samples):
        # Determine if this row is an ad (roughly 30% ads)
        is_ad = 1 if random.random() < 0.3 else 0
        
        if is_ad:
            # Ads characteristics
            # 80% chance to be a standard ad size
            if random.random() < 0.8:
                width, height = random.choice(ad_sizes)
            else:
                width = random.randint(100, 400)
                height = random.randint(50, 300)
                
            num_links = random.randint(0, 3) 
            has_iframe = 1 if random.random() < 0.7 else 0 # Ads often use iframes
            contains_ads_keyword = 1 if random.random() < 0.9 else 0 # Ads often have keywords
        else:
            # Content characteristics
            # 60% chance standard content size, 40% random
            if random.random() < 0.6:
                width, height = random.choice(content_sizes)
            else:
                width = random.randint(20, 1500)
                height = random.randint(20, 1500)
                
            num_links = random.randint(0, 20) # Content can have many links
            has_iframe = 1 if random.random() < 0.05 else 0 # Content rarely uses iframes for main block
            contains_ads_keyword = 1 if random.random() < 0.1 else 0 # Sometimes content has keywords
            
        data.append({
            'width': width,
            'height': height,
            'num_links': num_links,
            'has_iframe': has_iframe,
            'contains_ads_keyword': contains_ads_keyword,
            'is_ad': is_ad
        })
        
    return data

if __name__ == "__main__":
    dataset = generate_data(1000)
    
    with open('ad_elements_dataset.csv', 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['width', 'height', 'num_links', 'has_iframe', 'contains_ads_keyword', 'is_ad'])
        writer.writeheader()
        writer.writerows(dataset)
        
    print(f"Successfully generated ad_elements_dataset.csv with {len(dataset)} rows.")
