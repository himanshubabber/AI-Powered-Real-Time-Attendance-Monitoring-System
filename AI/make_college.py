import os
import math
from PIL import Image

# --- CONFIGURATION ---
lfw_folder = "./lfw"
output_filename = "synthetic_classroom.jpg"
target_faces = 100
face_size = 100 # Each face will be 100x100 pixels

print(f"Gathering {target_faces} faces from the LFW dataset...")

# 1. Collect 100 face images
image_paths = []
for root, dirs, files in os.walk(lfw_folder):
    for file in files:
        if file.endswith(('.jpg', '.jpeg', '.png')):
            image_paths.append(os.path.join(root, file))
            # Stop once we have 100 images
            if len(image_paths) >= target_faces:
                break
    if len(image_paths) >= target_faces:
        break

if len(image_paths) < target_faces:
    print(f"Warning: Only found {len(image_paths)} images.")

# 2. Calculate Grid Size (10x10 for 100 faces)
grid_size = math.ceil(math.sqrt(len(image_paths)))
canvas_width = grid_size * face_size
canvas_height = grid_size * face_size

# 3. Create a blank white canvas
print(f"Building a {grid_size}x{grid_size} image grid...")
collage = Image.new('RGB', (canvas_width, canvas_height), (255, 255, 255))

# 4. Paste images into the grid
x_offset = 0
y_offset = 0

for img_path in image_paths:
    try:
        # Open and resize each face
        img = Image.open(img_path)
        img = img.resize((face_size, face_size))
        
        # Paste it onto the canvas
        collage.paste(img, (x_offset, y_offset))
        
        # Move to the next spot in the grid
        x_offset += face_size
        if x_offset >= canvas_width:
            x_offset = 0
            y_offset += face_size
    except Exception as e:
        print(f"Skipping {img_path}: {e}")

# 5. Save the final group photo
collage.save(output_filename)
print(f"✅ Success! Your 100-person group photo is saved as '{output_filename}'")
