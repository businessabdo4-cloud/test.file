"""Minimal Real-ESRGAN (RRDBNet) inference on CPU/GPU, tiled.

Weights: RealESRGAN_x2plus.pth from https://github.com/xinntao/Real-ESRGAN/releases
(looked up in $ESRGAN_WEIGHTS, ~/models/, or ./models/).
"""
import os
from pathlib import Path

import numpy as np
import torch
from torch import nn
from torch.nn import functional as F


class RDB(nn.Module):
    def __init__(self, nf=64, gc=32):
        super().__init__()
        self.conv1 = nn.Conv2d(nf, gc, 3, 1, 1)
        self.conv2 = nn.Conv2d(nf + gc, gc, 3, 1, 1)
        self.conv3 = nn.Conv2d(nf + 2 * gc, gc, 3, 1, 1)
        self.conv4 = nn.Conv2d(nf + 3 * gc, gc, 3, 1, 1)
        self.conv5 = nn.Conv2d(nf + 4 * gc, nf, 3, 1, 1)
        self.lrelu = nn.LeakyReLU(0.2, True)

    def forward(self, x):
        x1 = self.lrelu(self.conv1(x))
        x2 = self.lrelu(self.conv2(torch.cat((x, x1), 1)))
        x3 = self.lrelu(self.conv3(torch.cat((x, x1, x2), 1)))
        x4 = self.lrelu(self.conv4(torch.cat((x, x1, x2, x3), 1)))
        x5 = self.conv5(torch.cat((x, x1, x2, x3, x4), 1))
        return x5 * 0.2 + x


class RRDB(nn.Module):
    def __init__(self, nf, gc=32):
        super().__init__()
        self.rdb1, self.rdb2, self.rdb3 = RDB(nf, gc), RDB(nf, gc), RDB(nf, gc)

    def forward(self, x):
        return self.rdb3(self.rdb2(self.rdb1(x))) * 0.2 + x


class RRDBNet(nn.Module):
    def __init__(self, scale=2, nf=64, nb=23, gc=32):
        super().__init__()
        self.scale = scale
        in_ch = 3 * (4 if scale == 2 else 16 if scale == 1 else 1)
        self.conv_first = nn.Conv2d(in_ch, nf, 3, 1, 1)
        self.body = nn.Sequential(*[RRDB(nf, gc) for _ in range(nb)])
        self.conv_body = nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_up1 = nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_up2 = nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_hr = nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_last = nn.Conv2d(nf, 3, 3, 1, 1)
        self.lrelu = nn.LeakyReLU(0.2, True)

    def forward(self, x):
        if self.scale == 2:
            x = F.pixel_unshuffle(x, 2)
        feat = self.conv_first(x)
        feat = feat + self.conv_body(self.body(feat))
        feat = self.lrelu(self.conv_up1(F.interpolate(feat, scale_factor=2, mode="nearest")))
        feat = self.lrelu(self.conv_up2(F.interpolate(feat, scale_factor=2, mode="nearest")))
        return self.conv_last(self.lrelu(self.conv_hr(feat)))


_model = None


def _load():
    global _model
    if _model is None:
        cands = [os.environ.get("ESRGAN_WEIGHTS", ""), str(Path.home() / "models/RealESRGAN_x2plus.pth"), "models/RealESRGAN_x2plus.pth"]
        path = next(p for p in cands if p and Path(p).exists())
        m = RRDBNet(scale=2)
        sd = torch.load(path, map_location="cpu", weights_only=True)
        m.load_state_dict(sd.get("params_ema", sd.get("params", sd)))
        m.eval()
        torch.set_num_threads(os.cpu_count() or 4)
        _model = m
    return _model


@torch.no_grad()
def upscale2x(rgb: np.ndarray, tile=192, pad=12) -> np.ndarray:
    """rgb uint8 HxWx3 -> uint8 2Hx2Wx3."""
    model = _load()
    h, w = rgb.shape[:2]
    # pad to even size
    ph, pw = h % 2, w % 2
    img = np.pad(rgb, ((0, ph), (0, pw), (0, 0)), mode="edge")
    x = torch.from_numpy(img).permute(2, 0, 1).float().unsqueeze(0) / 255.0
    H, W = img.shape[:2]
    out = torch.zeros(1, 3, H * 2, W * 2)
    for y0 in range(0, H, tile):
        for x0 in range(0, W, tile):
            y1, x1 = min(y0 + tile, H), min(x0 + tile, W)
            ya, xa = max(y0 - pad, 0), max(x0 - pad, 0)
            yb, xb = min(y1 + pad, H), min(x1 + pad, W)
            ya -= ya % 2
            xa -= xa % 2
            yb += yb % 2
            xb += xb % 2
            o = model(x[:, :, ya:yb, xa:xb])
            out[:, :, y0 * 2:y1 * 2, x0 * 2:x1 * 2] = o[:, :, (y0 - ya) * 2:(y1 - ya) * 2, (x0 - xa) * 2:(x1 - xa) * 2]
    res = (out.clamp(0, 1)[0].permute(1, 2, 0).numpy() * 255).round().astype(np.uint8)
    return res[: h * 2, : w * 2]
