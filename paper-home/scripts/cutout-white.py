"""Key out near-white backgrounds from line-art JPGs and crop."""
import os
import sys

sys.path.insert(0, r"C:\Users\19045\anaconda3\envs\teacher\Lib\site-packages")
from PIL import Image
import numpy as np

SRC = r"D:\bysq_D"
DST = r"D:\bysq\paper-home\assets\sprites"

JOBS = [
    ("Pt8DW.jpg", "coast.png"),
    ("yun1.jpg", "cloud-1.png"),
    ("yun2.jpg", "cloud-2.png"),
    ("yun3.jpg", "cloud-3.png"),
]


def cutout(src_path, dst_path):
    im = Image.open(src_path).convert("RGBA")
    arr = np.asarray(im).astype(np.float32)
    rgb = arr[..., :3] / 255.0
    luma = rgb[..., 0] * 0.299 + rgb[..., 1] * 0.587 + rgb[..., 2] * 0.114
    ink = 1.0 - luma
    alpha = np.clip((ink - 0.04) / 0.22, 0.0, 1.0)
    out = np.zeros_like(arr)
    out[..., 0] = 42
    out[..., 1] = 38
    out[..., 2] = 34
    out[..., 3] = alpha * 255.0
    img = Image.fromarray(out.astype(np.uint8), "RGBA")
    bbox = img.getbbox()
    if bbox:
        pad = 8
        x0, y0, x1, y1 = bbox
        x0 = max(0, x0 - pad)
        y0 = max(0, y0 - pad)
        x1 = min(img.width, x1 + pad)
        y1 = min(img.height, y1 + pad)
        img = img.crop((x0, y0, x1, y1))
    img.save(dst_path, "PNG")
    print("wrote", dst_path, img.size)


def main():
    os.makedirs(DST, exist_ok=True)
    for src_name, dst_name in JOBS:
        cutout(os.path.join(SRC, src_name), os.path.join(DST, dst_name))


if __name__ == "__main__":
    main()
