"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resizeImage = void 0;

/**
 * calculates the size of the image, how it would stretch to the borders of the container,
 * while maintaining its proportions (Image -> resizeMode="contain")
 */
const resizeImage = ({
  width: imgWidth,
  height: imgHeight
}, {
  width,
  height
}) => {
  const rw = imgWidth / width;
  const rh = imgHeight / height;

  if (rw > rh) {
    return {
      width: width,
      height: imgHeight / rw
    };
  } else {
    return {
      width: imgWidth / rh,
      height: height
    };
  }
};

exports.resizeImage = resizeImage;
//# sourceMappingURL=image.js.map