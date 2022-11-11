function createHiDPICanvas(w, h, ratio) {
  const PIXEL_RATIO = (function () {
    const c = document.createElement("canvas"),
      ctx = c.getContext("2d"),
      dpr = window.devicePixelRatio || 1,
      bsr = ctx['webkitBackingStorePixelRatio'] ||
        ctx['mozBackingStorePixelRatio'] ||
        ctx['msBackingStorePixelRatio'] ||
        ctx['oBackingStorePixelRatio'] ||
        ctx['backingStorePixelRatio'] || 1;

    return dpr / bsr;
  })();

  if (!ratio) { ratio = PIXEL_RATIO; }
  const can = document.createElement("canvas");
  can.width = w * ratio;
  can.height = h * ratio;
  can.style.width = w + "px";
  can.style.height = h + "px";
  can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
  return can;
}

function getPixelRatio(context) {
  var backingStore = context.backingStorePixelRatio ||
    context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    context.backingStorePixelRatio || 1;
  return (window.devicePixelRatio || 1) / backingStore;
}

export {
  createHiDPICanvas,
  getPixelRatio
}