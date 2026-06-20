export interface Point {
  x: number; // relative coordinate [0, 1]
  y: number; // relative coordinate [0, 1]
}

export interface CornerPoints {
  tl: Point;
  tr: Point;
  br: Point;
  bl: Point;
}

/**
 * Solves Ax = B using Gaussian elimination.
 * n is 8 for the 8 homography coefficients.
 */
export function solveGaussian(A: number[][], B: number[]): number[] {
  const n = 8;
  // Deep copy A and B to avoid modifying inputs
  const a = A.map(row => [...row]);
  const b = [...B];

  for (let i = 0; i < n; i++) {
    // Search for maximum in this column
    let maxEl = Math.abs(a[i][i]);
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(a[k][i]) > maxEl) {
        maxEl = Math.abs(a[k][i]);
        maxRow = k;
      }
    }

    // Swap maximum row with current row
    if (maxRow !== i) {
      const tmpRow = a[maxRow];
      a[maxRow] = a[i];
      a[i] = tmpRow;

      const tmpVal = b[maxRow];
      b[maxRow] = b[i];
      b[i] = tmpVal;
    }

    // Check for singular matrix
    if (Math.abs(a[i][i]) < 1e-12) {
      // Return identity/default mappings if unsolvable
      return [1, 0, 0, 0, 1, 0, 0, 0];
    }

    // Make all rows below this one 0 in current column
    for (let k = i + 1; k < n; k++) {
      const c = -a[k][i] / a[i][i];
      for (let j = i; j < n; j++) {
        if (i === j) {
          a[k][j] = 0;
        } else {
          a[k][j] += c * a[i][j];
        }
      }
      b[k] += c * b[i];
    }
  }

  // Solve equation Ax=B for an upper triangular matrix
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = b[i] / a[i][i];
    for (let k = i - 1; k >= 0; k--) {
      b[k] -= a[k][i] * x[i];
    }
  }
  return x;
}

/**
 * Detects the 4 corners of a document in the image using Sobel filters and boundary extreme search.
 */
export function detectDocumentCorners(imageData: ImageData, w: number, h: number): CornerPoints | null {
  const data = imageData.data;
  
  // 1. Convert to grayscale
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  }

  // 2. Sobel edge detection
  const edges = new Float32Array(w * h);
  let maxMagnitude = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      
      const gx =
        -gray[(y - 1) * w + (x - 1)] + gray[(y - 1) * w + (x + 1)] -
        2 * gray[y * w + (x - 1)] + 2 * gray[y * w + (x + 1)] -
        gray[(y + 1) * w + (x - 1)] + gray[(y + 1) * w + (x + 1)];

      const gy =
        -gray[(y - 1) * w + (x - 1)] - 2 * gray[(y - 1) * w + x] - gray[(y - 1) * w + (x + 1)] +
        gray[(y + 1) * w + (x - 1)] + 2 * gray[(y + 1) * w + x] + gray[(y + 1) * w + (x + 1)];

      const mag = Math.sqrt(gx * gx + gy * gy);
      edges[idx] = mag;
      if (mag > maxMagnitude) {
        maxMagnitude = mag;
      }
    }
  }

  // 3. Threshold edge points (above 30% of max magnitude)
  const threshold = Math.max(35, maxMagnitude * 0.3);
  const edgePoints: Point[] = [];
  
  for (let y = 2; y < h - 2; y++) {
    for (let x = 2; x < w - 2; x++) {
      const idx = y * w + x;
      if (edges[idx] > threshold) {
        edgePoints.push({ x: x / w, y: y / h });
      }
    }
  }

  // If we don't have enough edge coordinates, return null
  if (edgePoints.length < 80) {
    return null;
  }

  // 4. Find the extreme corner candidate points:
  // - Top-Left: minimizes x + y
  // - Top-Right: maximizes x - y
  // - Bottom-Right: maximizes x + y
  // - Bottom-Left: minimizes x - y
  
  let tl = edgePoints[0];
  let tr = edgePoints[0];
  let br = edgePoints[0];
  let bl = edgePoints[0];
  
  let minSum = tl.x + tl.y;
  let maxSum = tl.x + tl.y;
  let maxDiff = tl.x - tl.y;
  let minDiff = tl.x - tl.y;

  for (let i = 1; i < edgePoints.length; i++) {
    const pt = edgePoints[i];
    const sum = pt.x + pt.y;
    const diff = pt.x - pt.y;

    if (sum < minSum) {
      minSum = sum;
      tl = pt;
    }
    if (sum > maxSum) {
      maxSum = sum;
      br = pt;
    }
    if (diff > maxDiff) {
      maxDiff = diff;
      tr = pt;
    }
    if (diff < minDiff) {
      minDiff = diff;
      bl = pt;
    }
  }

  // Verify that these corner candidates form a reasonable quad
  const widthTop = Math.hypot(tr.x - tl.x, tr.y - tl.y);
  const widthBottom = Math.hypot(br.x - bl.x, br.y - bl.y);
  const heightLeft = Math.hypot(bl.x - tl.x, bl.y - tl.y);
  const heightRight = Math.hypot(br.x - tr.x, br.y - tr.y);

  // If width or height is way too small, the detection is probably noise
  if (widthTop < 0.2 || widthBottom < 0.2 || heightLeft < 0.2 || heightRight < 0.2) {
    return null;
  }

  return { tl, tr, br, bl };
}

/**
 * Performs a perspective projection warp of a quadrilateral area defined by corners
 * into an upright rectangular image.
 */
export async function warpImage(
  imageSrc: string,
  corners: CornerPoints
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const srcW = img.naturalWidth;
        const srcH = img.naturalHeight;

        // Calculate absolute pixel coordinates in original image
        const p0 = { x: corners.tl.x * srcW, y: corners.tl.y * srcH };
        const p1 = { x: corners.tr.x * srcW, y: corners.tr.y * srcH };
        const p2 = { x: corners.br.x * srcW, y: corners.br.y * srcH };
        const p3 = { x: corners.bl.x * srcW, y: corners.bl.y * srcH };

        // Calculate destination width and height based on the maximum side lengths
        const w1 = Math.hypot(p1.x - p0.x, p1.y - p0.y);
        const w2 = Math.hypot(p2.x - p3.x, p2.y - p3.y);
        const h1 = Math.hypot(p3.x - p0.x, p3.y - p0.y);
        const h2 = Math.hypot(p2.x - p1.x, p2.y - p1.y);

        const destW = Math.round(Math.max(w1, w2));
        const destH = Math.round(Math.max(h1, h2));

        // Limit dimensions to a maximum of 1400px to ensure good performance and prevent memory overflow,
        // while preserving enough detail for OCR/Gemini.
        const maxDim = 1400;
        let W = destW;
        let H = destH;
        if (W > maxDim || H > maxDim) {
          const scale = maxDim / Math.max(W, H);
          W = Math.round(W * scale);
          H = Math.round(H * scale);
        }

        // Draw original image to an offscreen canvas to extract pixel buffer
        const srcCanvas = document.createElement('canvas');
        srcCanvas.width = srcW;
        srcCanvas.height = srcH;
        const srcCtx = srcCanvas.getContext('2d');
        if (!srcCtx) throw new Error('Could not get 2d context for source canvas');
        srcCtx.drawImage(img, 0, 0);
        const srcData = srcCtx.getImageData(0, 0, srcW, srcH);

        // Create destination canvas and image buffer
        const destCanvas = document.createElement('canvas');
        destCanvas.width = W;
        destCanvas.height = H;
        const destCtx = destCanvas.getContext('2d');
        if (!destCtx) throw new Error('Could not get 2d context for dest canvas');
        const destData = destCtx.createImageData(W, H);

        // Setup the perspective transform linear system
        // Maps (u, v) in destination space to (x, y) in source space
        const A: number[][] = [];
        const B: number[] = [];
        const destPoints = [
          [0, 0],
          [W, 0],
          [W, H],
          [0, H]
        ];
        const srcPoints = [
          [p0.x, p0.y],
          [p1.x, p1.y],
          [p2.x, p2.y],
          [p3.x, p3.y]
        ];

        for (let i = 0; i < 4; i++) {
          const u = destPoints[i][0];
          const v = destPoints[i][1];
          const x = srcPoints[i][0];
          const y = srcPoints[i][1];

          A.push([u, v, 1, 0, 0, 0, -u * x, -v * x]);
          B.push(x);

          A.push([0, 0, 0, u, v, 1, -u * y, -v * y]);
          B.push(y);
        }

        const c = solveGaussian(A, B);

        const srcPixels = srcData.data;
        const destPixels = destData.data;

        // Perform backward mapping warp with bilinear interpolation
        for (let v = 0; v < H; v++) {
          for (let u = 0; u < W; u++) {
            const divisor = c[6] * u + c[7] * v + 1;
            const x = (c[0] * u + c[1] * v + c[2]) / divisor;
            const y = (c[3] * u + c[4] * v + c[5]) / divisor;

            // Interpolate color if inside source boundary
            if (x >= 0 && x < srcW - 1 && y >= 0 && y < srcH - 1) {
              const xf = Math.floor(x);
              const yf = Math.floor(y);
              const xc = xf + 1;
              const yc = yf + 1;

              const dx = x - xf;
              const dy = y - yf;

              const idx00 = (yf * srcW + xf) * 4;
              const idx10 = (yf * srcW + xc) * 4;
              const idx01 = (yc * srcW + xf) * 4;
              const idx11 = (yc * srcW + xc) * 4;

              const destIdx = (v * W + u) * 4;

              for (let ch = 0; ch < 4; ch++) {
                const val00 = srcPixels[idx00 + ch];
                const val10 = srcPixels[idx10 + ch];
                const val01 = srcPixels[idx01 + ch];
                const val11 = srcPixels[idx11 + ch];

                destPixels[destIdx + ch] =
                  val00 * (1 - dx) * (1 - dy) +
                  val10 * dx * (1 - dy) +
                  val01 * (1 - dx) * dy +
                  val11 * dx * dy;
              }
            } else {
              // Set pixels out of bounds to solid black
              const destIdx = (v * W + u) * 4;
              destPixels[destIdx] = 0;
              destPixels[destIdx + 1] = 0;
              destPixels[destIdx + 2] = 0;
              destPixels[destIdx + 3] = 255;
            }
          }
        }

        destCtx.putImageData(destData, 0, 0);
        resolve(destCanvas.toDataURL('image/jpeg', 0.95));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (e) => reject(new Error('Failed to load image for deskewing'));
    img.src = imageSrc;
  });
}
