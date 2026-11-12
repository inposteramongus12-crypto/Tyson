# reads out/edge/f*.png (rendered at half size), prints the frames where a plate/bubble/card touches the 60 px band
# and the frames where plates, bubbles, timers and banners overlap each other (partial overlap; a box fully inside another is skipped)
import sys, glob, os
from PIL import Image
import numpy as np
from scipy import ndimage
M = 30  # 60 px at half scale
bad = 0
for fn in sorted(glob.glob(os.path.join(sys.argv[1], 'f*.png'))):
    im = np.asarray(Image.open(fn).convert('RGB')).astype(int)
    h, w, _ = im.shape
    def near(c, t=3): return (abs(im[..., 0] - c[0]) <= t) & (abs(im[..., 1] - c[1]) <= t) & (abs(im[..., 2] - c[2]) <= t)
    navy = near((17, 20, 44))
    cream = near((251, 248, 239)) | near((255, 246, 220))
    banner = near((42, 32, 54))
    boxes = []
    for name, mask, minpx in (('plate', navy, 700), ('card', cream, 1500), ('banner', banner, 2500)):
        lab, n = ndimage.label(ndimage.binary_dilation(mask, iterations=2))
        for i, sl in enumerate(ndimage.find_objects(lab), 1):
            ys, xs = sl
            area = (lab[sl] == i).sum()
            if area < minpx: continue
            bw, bh = sl[1].stop - sl[1].start, sl[0].stop - sl[0].start
            white = ((im[sl[0], sl[1], 0] > 215) & (im[sl[0], sl[1], 1] > 215) & (im[sl[0], sl[1], 2] > 200)).sum()
            if name == 'plate' and white < 0.015 * bw * bh: continue
            if name == 'plate' and (bh > 130 or area / (bw * bh) < 0.55 or bw < 2.2 * bh): continue
            if name == 'card' and area / (bw * bh) < 0.6: continue
            if name == 'banner' and (area / (bw * bh) < 0.7 or bw < 2.5 * bh or bh > 120): continue
            x0, x1, y0, y1 = xs.start, xs.stop, ys.start, ys.stop
            if not ((x1 - x0) > w * 0.9 and (y1 - y0) > h * 0.7): boxes.append((name, x0, y0, x1, y1))
            sides = []
            if x0 < M: sides.append(f'left {2*(M-x0)}px')
            if x1 > w - M: sides.append(f'right {2*(x1-(w-M))}px')
            if y0 < M: sides.append(f'top {2*(M-y0)}px')
            if y1 > h - M: sides.append(f'bottom {2*(y1-(h-M))}px')
            # skip things that are the frame itself / huge backgrounds
            if (x1 - x0) > w * 0.9 and (y1 - y0) > h * 0.7: continue
            if sides:
                bad += 1
                print(os.path.basename(fn), name, 'at', (2*x0, 2*y0, 2*x1, 2*y1), ', '.join(sides))
    # overlaps between different boxes (plates, bubbles, timers, banners)
    def inside(a, b): return a[1] >= b[1] - 2 and a[2] >= b[2] - 2 and a[3] <= b[3] + 2 and a[4] <= b[4] + 2
    for i in range(len(boxes)):
        for j in range(i + 1, len(boxes)):
            a, b = boxes[i], boxes[j]
            ix = min(a[3], b[3]) - max(a[1], b[1])
            iy = min(a[4], b[4]) - max(a[2], b[2])
            if ix > 4 and iy > 4 and not inside(a, b) and not inside(b, a):
                bad += 1
                print(os.path.basename(fn), 'overlap', a[0], 'x', b[0], 'at', (2 * max(a[1], b[1]), 2 * max(a[2], b[2]), 2 * min(a[3], b[3]), 2 * min(a[4], b[4])))
print('edge issues:', bad)
