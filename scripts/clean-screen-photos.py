"""
Conservative cleanup for the After Effects frames.

The FFT notch attempt is abandoned here on purpose. Moire is periodic, but so
is an interface built almost entirely from straight lines, so the spikes the
notch removed included the timeline's own rules. The result smeared the
artwork horizontally, which is worse than the banding it fixed.

What is left is the part that carries no structural risk. Rainbow fringing
lives in chroma, and real chroma in these frames is flat UI fill and broad
gradients, so smoothing Cr and Cb takes the colour noise out and leaves every
edge where it was. Luma is untouched.
"""
import cv2
import numpy as np

A = "/Users/alitleis/.t3/userdata/attachments/239651e7-a47e-459b-9482-9bc57c886d7d-"
JOBS = [
    ("eye-edit",     A + "c63c4ca9-5abd-4f6c-b7a3-0bafe9caca57.png", (0, 960, 1260, 945)),
    ("rengoku-edit", A + "4bf1728d-e8da-4667-a4a3-9d023eb2fa0c.png", (30, 1175, 1210, 908)),
    ("eye-flow",     A + "00dba196-3c8c-481d-9875-b65fb0dea18e.png", (0, 1070, 1260, 990)),
    ("eye-flowers",  A + "ccfc8e9d-efc5-46e1-a2e9-52b21346bb93.png", (0, 880, 1260, 1220)),
]

for name, src, (x, t, w, h) in JOBS:
    img = cv2.imread(src, cv2.IMREAD_COLOR)
    ycc = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb).astype(np.float32)
    y, cr, cb = cv2.split(ycc)

    cr = cv2.GaussianBlur(cr, (0, 0), 3.0)
    cb = cv2.GaussianBlur(cb, (0, 0), 3.0)

    out = cv2.cvtColor(cv2.merge([y, cr, cb]).astype(np.uint8), cv2.COLOR_YCrCb2BGR)

    # Enough to counter the phone's own softness, not enough to ring the
    # high-contrast UI lines.
    blur = cv2.GaussianBlur(out, (0, 0), 0.9)
    out = cv2.addWeighted(out, 1.22, blur, -0.22, 0)

    cv2.imwrite(f"/tmp/demoire/s-{name}.png", out[t:t + h, x:x + w])
    print(f"{name}: chroma smoothed, luma untouched")
