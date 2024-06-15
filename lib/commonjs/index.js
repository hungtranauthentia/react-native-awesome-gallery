"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.GalleryItemType = exports.snapPoint = void 0;

var _react = _interopRequireWildcard(require("react"));

var _reactNative = require("react-native");

var _reactNativeGestureHandler = require("react-native-gesture-handler");

var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));

var _reactNativeRedash = require("react-native-redash");

var _utils = require("./utils");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const rtl = _reactNative.I18nManager.isRTL;
const DOUBLE_TAP_SCALE = 3;
const MAX_SCALE = 6;
const SPACE_BETWEEN_IMAGES = 40;

const snapPoint = (value, velocity, points) => {
  'worklet';

  const point = value + 0.25 * velocity;
  const deltas = points.map(p => Math.abs(point - p));
  const minDelta = Math.min.apply(null, deltas);
  return points.filter(p => Math.abs(point - p) === minDelta)[0];
};

exports.snapPoint = snapPoint;

const defaultRenderImage = ({
  item,
  setImageDimensions
}) => {
  if (item.type !== GalleryItemType.VIDEO) return /*#__PURE__*/_react.default.createElement(_reactNative.Image, {
    onLoad: e => {
      const {
        height: h,
        width: w
      } = e.nativeEvent.source;
      setImageDimensions({
        height: h,
        width: w
      });
    },
    source: {
      uri: item
    },
    resizeMode: "contain",
    style: _reactNative.StyleSheet.absoluteFillObject
  });
  return null;
};

let GalleryItemType;
exports.GalleryItemType = GalleryItemType;

(function (GalleryItemType) {
  GalleryItemType["VIDEO"] = "video";
  GalleryItemType["IMAGE"] = "image";
})(GalleryItemType || (exports.GalleryItemType = GalleryItemType = {}));

const springConfig = {
  damping: 800,
  mass: 1,
  stiffness: 250,
  restDisplacementThreshold: 0.02,
  restSpeedThreshold: 4
};

const ResizableImage = /*#__PURE__*/_react.default.memo(({
  item,
  active,
  translateX,
  index,
  isFirst,
  isLast,
  currentIndex,
  renderItem,
  width,
  height,
  onSwipeToClose,
  onTap,
  onDoubleTap,
  onLongPress,
  onPanStart,
  onScaleStart,
  onScaleEnd,
  emptySpaceWidth,
  doubleTapScale,
  doubleTapInterval,
  maxScale,
  pinchEnabled,
  doubleTapEnabled,
  disableTransitionOnScaledImage,
  hideAdjacentImagesOnScaledImage,
  disableVerticalSwipe,
  disableSwipeUp,
  loop,
  length,
  onScaleChange,
  onScaleChangeRange,
  setRef
}) => {
  const CENTER = {
    x: width / 2,
    y: height / 2
  };
  const offset = (0, _reactNativeRedash.useVector)(0, 0);
  const scale = (0, _reactNativeReanimated.useSharedValue)(1);
  const translation = (0, _reactNativeRedash.useVector)(0, 0);
  const origin = (0, _reactNativeRedash.useVector)(0, 0);
  const adjustedFocal = (0, _reactNativeRedash.useVector)(0, 0);
  const originalLayout = (0, _reactNativeRedash.useVector)(width, 0);
  const layout = (0, _reactNativeRedash.useVector)(width, 0);
  const isActive = (0, _reactNativeReanimated.useDerivedValue)(() => currentIndex.value === index, [currentIndex, index]);
  (0, _reactNativeReanimated.useAnimatedReaction)(() => {
    return scale.value;
  }, scaleReaction => {
    if (!onScaleChange) {
      return;
    }

    if (!onScaleChangeRange) {
      (0, _reactNativeReanimated.runOnJS)(onScaleChange)(scaleReaction);
      return;
    }

    if (scaleReaction > onScaleChangeRange.start && scaleReaction < onScaleChangeRange.end) {
      (0, _reactNativeReanimated.runOnJS)(onScaleChange)(scaleReaction);
    }
  });

  const setAdjustedFocal = ({
    focalX,
    focalY
  }) => {
    'worklet';

    adjustedFocal.x.value = focalX - (CENTER.x + offset.x.value);
    adjustedFocal.y.value = focalY - (CENTER.y + offset.y.value);
  };

  const resetValues = (animated = true) => {
    'worklet';

    scale.value = animated ? (0, _reactNativeReanimated.withTiming)(1) : 1;
    offset.x.value = animated ? (0, _reactNativeReanimated.withTiming)(0) : 0;
    offset.y.value = animated ? (0, _reactNativeReanimated.withTiming)(0) : 0;
    translation.x.value = animated ? (0, _reactNativeReanimated.withTiming)(0) : 0;
    translation.y.value = animated ? (0, _reactNativeReanimated.withTiming)(0) : 0;
  };

  const getEdgeX = () => {
    'worklet';

    const newWidth = scale.value * layout.x.value;
    const point = (newWidth - width) / 2;

    if (point < 0 || isNaN(point)) {
      return [-0, 0];
    }

    return [-point, point];
  };

  const clampY = (value, newScale) => {
    'worklet';

    const newHeight = newScale * layout.y.value;
    const point = (newHeight - height) / 2;

    if (newHeight < height) {
      return 0;
    }

    return (0, _utils.clamp)(value, -point, point);
  };

  const clampX = (value, newScale) => {
    'worklet';

    const newWidth = newScale * layout.x.value;
    const point = (newWidth - width) / 2;

    if (newWidth < width) {
      return 0;
    }

    return (0, _utils.clamp)(value, -point, point);
  };

  const getEdgeY = () => {
    'worklet';

    const newHeight = scale.value * layout.y.value;
    const point = (newHeight - height) / 2;

    if (isNaN(point)) {
      return [-0, 0];
    }

    return [-point, point];
  };

  const onStart = () => {
    'worklet';

    (0, _reactNativeReanimated.cancelAnimation)(translateX);
    offset.x.value = offset.x.value + translation.x.value;
    offset.y.value = offset.y.value + translation.y.value;
    translation.x.value = 0;
    translation.y.value = 0;
  };

  const getPosition = i => {
    'worklet';

    return -(width + emptySpaceWidth) * (typeof i !== 'undefined' ? i : index);
  };

  const getIndexFromPosition = position => {
    'worklet';

    return Math.round(position / -(width + emptySpaceWidth));
  };

  (0, _reactNativeReanimated.useAnimatedReaction)(() => {
    return {
      i: currentIndex.value,
      translateX: translateX.value,
      currentScale: scale.value
    };
  }, ({
    i,
    translateX: tx,
    currentScale
  }) => {
    const translateIndex = tx / -(width + emptySpaceWidth);

    if (loop) {
      let diff = Math.abs(translateIndex % 1 - 0.5);

      if (diff > 0.5) {
        diff = 1 - diff;
      }

      if (diff > 0.48 && Math.abs(i) !== index) {
        resetValues(false);
        return;
      }
    }

    if (Math.abs(i - index) === 2 && currentScale > 1) {
      resetValues(false);
    }
  });
  (0, _react.useEffect)(() => {
    setRef(index, {
      reset: animated => resetValues(animated)
    }); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);
  const animatedStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    const isNextForLast = loop && isFirst && currentIndex.value === length - 1 && translateX.value < getPosition(length - 1);
    const isPrevForFirst = loop && isLast && currentIndex.value === 0 && translateX.value > getPosition(0);
    return {
      transform: [{
        translateX: offset.x.value + translation.x.value - (isNextForLast ? getPosition(length) : 0) + (isPrevForFirst ? getPosition(length) : 0)
      }, {
        translateY: offset.y.value + translation.y.value
      }, {
        scale: scale.value
      }]
    };
  });

  const setImageDimensions = ({
    width: w,
    height: h
  }) => {
    originalLayout.x.value = w;
    originalLayout.y.value = h;
    const imgLayout = (0, _utils.resizeImage)({
      width: w,
      height: h
    }, {
      width,
      height
    });
    layout.x.value = imgLayout.width;
    layout.y.value = imgLayout.height;
  };

  (0, _react.useEffect)(() => {
    if (originalLayout.x.value === 0 && originalLayout.y.value === 0) {
      return;
    }

    setImageDimensions({
      width: originalLayout.x.value,
      height: originalLayout.y.value
    }); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);
  const itemProps = {
    item,
    index,
    active,
    setImageDimensions
  };
  const scaleOffset = (0, _reactNativeReanimated.useSharedValue)(1);

  const pinchGesture = _reactNativeGestureHandler.Gesture.Pinch().enabled(pinchEnabled).onStart(({
    focalX,
    focalY
  }) => {
    'worklet';

    if (!isActive.value) return;

    if (onScaleStart) {
      (0, _reactNativeReanimated.runOnJS)(onScaleStart)();
    }

    onStart();
    scaleOffset.value = scale.value;
    setAdjustedFocal({
      focalX,
      focalY
    });
    origin.x.value = adjustedFocal.x.value;
    origin.y.value = adjustedFocal.y.value;
  }).onUpdate(({
    scale: s,
    focalX,
    focalY,
    numberOfPointers
  }) => {
    'worklet';

    if (!isActive.value) return;
    if (numberOfPointers !== 2) return;
    const nextScale = (0, _utils.withRubberBandClamp)(s * scaleOffset.value, 0.55, maxScale, [1, maxScale]);
    scale.value = nextScale;
    setAdjustedFocal({
      focalX,
      focalY
    });
    translation.x.value = adjustedFocal.x.value + -1 * nextScale / scaleOffset.value * origin.x.value;
    translation.y.value = adjustedFocal.y.value + -1 * nextScale / scaleOffset.value * origin.y.value;
  }).onEnd(() => {
    'worklet';

    if (!isActive.value) return;

    if (onScaleEnd) {
      (0, _reactNativeReanimated.runOnJS)(onScaleEnd)(scale.value);
    }

    if (scale.value < 1) {
      resetValues();
    } else {
      const sc = Math.min(scale.value, maxScale);
      const newWidth = sc * layout.x.value;
      const newHeight = sc * layout.y.value;
      const nextTransX = scale.value > maxScale ? adjustedFocal.x.value + -1 * maxScale / scaleOffset.value * origin.x.value : translation.x.value;
      const nextTransY = scale.value > maxScale ? adjustedFocal.y.value + -1 * maxScale / scaleOffset.value * origin.y.value : translation.y.value;
      const diffX = nextTransX + offset.x.value - (newWidth - width) / 2;

      if (scale.value > maxScale) {
        scale.value = (0, _reactNativeReanimated.withTiming)(maxScale);
      }

      if (newWidth <= width) {
        translation.x.value = (0, _reactNativeReanimated.withTiming)(0);
      } else {
        let moved;

        if (diffX > 0) {
          translation.x.value = (0, _reactNativeReanimated.withTiming)(nextTransX - diffX);
          moved = true;
        }

        if (newWidth + diffX < width) {
          translation.x.value = (0, _reactNativeReanimated.withTiming)(nextTransX + width - (newWidth + diffX));
          moved = true;
        }

        if (!moved) {
          translation.x.value = (0, _reactNativeReanimated.withTiming)(nextTransX);
        }
      }

      const diffY = nextTransY + offset.y.value - (newHeight - height) / 2;

      if (newHeight <= height) {
        translation.y.value = (0, _reactNativeReanimated.withTiming)(-offset.y.value);
      } else {
        let moved;

        if (diffY > 0) {
          translation.y.value = (0, _reactNativeReanimated.withTiming)(nextTransY - diffY);
          moved = true;
        }

        if (newHeight + diffY < height) {
          translation.y.value = (0, _reactNativeReanimated.withTiming)(nextTransY + height - (newHeight + diffY));
          moved = true;
        }

        if (!moved) {
          translation.y.value = (0, _reactNativeReanimated.withTiming)(nextTransY);
        }
      }
    }
  });

  const isVertical = (0, _reactNativeReanimated.useSharedValue)(false);
  const initialTranslateX = (0, _reactNativeReanimated.useSharedValue)(0);
  const shouldClose = (0, _reactNativeReanimated.useSharedValue)(false);
  const isMoving = (0, _reactNativeRedash.useVector)(0);

  const panGesture = _reactNativeGestureHandler.Gesture.Pan().minDistance(10).maxPointers(1).onBegin(() => {
    'worklet';

    if (!isActive.value) return;
    const newWidth = scale.value * layout.x.value;
    const newHeight = scale.value * layout.y.value;

    if (isMoving.x.value && offset.x.value < (newWidth - width) / 2 - translation.x.value && offset.x.value > -(newWidth - width) / 2 - translation.x.value) {
      (0, _reactNativeReanimated.cancelAnimation)(offset.x);
    }

    if (isMoving.y.value && offset.y.value < (newHeight - height) / 2 - translation.y.value && offset.y.value > -(newHeight - height) / 2 - translation.y.value) {
      (0, _reactNativeReanimated.cancelAnimation)(offset.y);
    }
  }).onStart(({
    velocityY,
    velocityX
  }) => {
    'worklet';

    if (!isActive.value) return;

    if (onPanStart) {
      (0, _reactNativeReanimated.runOnJS)(onPanStart)();
    }

    onStart();
    isVertical.value = Math.abs(velocityY) > Math.abs(velocityX);
    initialTranslateX.value = translateX.value;
  }).onUpdate(({
    translationX,
    translationY,
    velocityY
  }) => {
    'worklet';

    if (!isActive.value) return;
    if (disableVerticalSwipe && scale.value === 1 && isVertical.value) return;
    const x = getEdgeX();

    if (!isVertical.value || scale.value > 1) {
      const clampedX = (0, _utils.clamp)(translationX, x[0] - offset.x.value, x[1] - offset.x.value);
      const transX = rtl ? initialTranslateX.value - translationX + clampedX : initialTranslateX.value + translationX - clampedX;

      if (hideAdjacentImagesOnScaledImage && disableTransitionOnScaledImage) {
        const disabledTransition = disableTransitionOnScaledImage && scale.value > 1;
        const moveX = (0, _utils.withRubberBandClamp)(transX, 0.55, width, disabledTransition ? [getPosition(index), getPosition(index + 1)] : [getPosition(length - 1), 0]);

        if (!disabledTransition) {
          translateX.value = moveX;
        }

        if (disabledTransition) {
          translation.x.value = rtl ? clampedX - moveX + translateX.value : clampedX + moveX - translateX.value;
        } else {
          translation.x.value = clampedX;
        }
      } else {
        if (loop) {
          translateX.value = transX;
        } else {
          translateX.value = (0, _utils.withRubberBandClamp)(transX, 0.55, width, disableTransitionOnScaledImage && scale.value > 1 ? [getPosition(index), getPosition(index + 1)] : [getPosition(length - 1), 0]);
        }

        translation.x.value = clampedX;
      }
    }

    const newHeight = scale.value * layout.y.value;
    const edgeY = getEdgeY();

    if (newHeight > height) {
      translation.y.value = (0, _utils.withRubberBandClamp)(translationY, 0.55, newHeight, [edgeY[0] - offset.y.value, edgeY[1] - offset.y.value]);
    } else if (!(scale.value === 1 && translateX.value !== getPosition()) && (!disableSwipeUp || translationY >= 0)) {
      translation.y.value = translationY;
    }

    if (isVertical.value && newHeight <= height) {
      const destY = translationY + velocityY * 0.2;
      shouldClose.value = disableSwipeUp ? destY > 220 : Math.abs(destY) > 220;
    }
  }).onEnd(({
    velocityX,
    velocityY
  }) => {
    'worklet';

    if (!isActive.value) return;
    const newHeight = scale.value * layout.y.value;
    const edgeX = getEdgeX();

    if (Math.abs(translateX.value - getPosition()) >= 0 && edgeX.some(x => x === translation.x.value + offset.x.value)) {
      let snapPoints = [index - 1, index, index + 1].filter((_, y) => {
        if (loop) return true;

        if (y === 0) {
          return !isFirst;
        }

        if (y === 2) {
          return !isLast;
        }

        return true;
      }).map(i => getPosition(i));

      if (disableTransitionOnScaledImage && scale.value > 1) {
        snapPoints = [getPosition(index)];
      }

      let snapTo = snapPoint(translateX.value, rtl ? -velocityX : velocityX, snapPoints);
      const nextIndex = getIndexFromPosition(snapTo);

      if (currentIndex.value !== nextIndex) {
        if (loop) {
          if (nextIndex === length) {
            currentIndex.value = 0;
            translateX.value = translateX.value - getPosition(length);
            snapTo = 0;
          } else if (nextIndex === -1) {
            currentIndex.value = length - 1;
            translateX.value = translateX.value + getPosition(length);
            snapTo = getPosition(length - 1);
          } else {
            currentIndex.value = nextIndex;
          }
        } else {
          currentIndex.value = nextIndex;
        }
      }

      translateX.value = (0, _reactNativeReanimated.withSpring)(snapTo, springConfig);
    } else {
      const newWidth = scale.value * layout.x.value;
      isMoving.x.value = 1;
      offset.x.value = (0, _utils.withDecaySpring)({
        velocity: velocityX,
        clamp: [-(newWidth - width) / 2 - translation.x.value, (newWidth - width) / 2 - translation.x.value]
      }, () => {
        'worklet';

        isMoving.x.value = 0;
      });
    }

    if (onSwipeToClose && shouldClose.value) {
      offset.y.value = (0, _reactNativeReanimated.withDecay)({
        velocity: velocityY
      });
      (0, _reactNativeReanimated.runOnJS)(onSwipeToClose)();
      return;
    }

    if (newHeight > height) {
      isMoving.y.value = 1;
      offset.y.value = (0, _utils.withDecaySpring)({
        velocity: velocityY,
        clamp: [-(newHeight - height) / 2 - translation.y.value, (newHeight - height) / 2 - translation.y.value]
      }, () => {
        'worklet';

        isMoving.y.value = 0;
      });
    } else {
      const diffY = translation.y.value + offset.y.value - (newHeight - height) / 2;

      if (newHeight <= height && diffY !== height - diffY - newHeight) {
        const moveTo = diffY - (height - newHeight) / 2;
        translation.y.value = (0, _reactNativeReanimated.withTiming)(translation.y.value - moveTo);
      }
    }
  });

  const interruptedScroll = (0, _reactNativeReanimated.useSharedValue)(false);

  const tapGesture = _reactNativeGestureHandler.Gesture.Tap().enabled(!!onTap).numberOfTaps(1).maxDistance(10).onBegin(() => {
    'worklet';

    if (isMoving.x.value || isMoving.y.value) {
      interruptedScroll.value = true;
    }
  }).onEnd(() => {
    'worklet';

    if (!isActive.value) return;

    if (onTap && !interruptedScroll.value) {
      (0, _reactNativeReanimated.runOnJS)(onTap)();
    }

    interruptedScroll.value = false;
  });

  const doubleTapGesture = _reactNativeGestureHandler.Gesture.Tap().enabled(doubleTapEnabled).numberOfTaps(2).maxDelay(doubleTapInterval).onEnd(({
    x,
    y,
    numberOfPointers
  }) => {
    'worklet';

    if (!isActive.value) return;
    if (numberOfPointers !== 1) return;

    if (onTap && interruptedScroll.value) {
      interruptedScroll.value = false;

      if (onTap) {
        (0, _reactNativeReanimated.runOnJS)(onTap)();
      }

      return;
    }

    if (onDoubleTap) {
      (0, _reactNativeReanimated.runOnJS)(onDoubleTap)();
    }

    if (scale.value === 1) {
      scale.value = (0, _reactNativeReanimated.withTiming)(doubleTapScale);
      setAdjustedFocal({
        focalX: x,
        focalY: y
      });
      offset.x.value = (0, _reactNativeReanimated.withTiming)(clampX(adjustedFocal.x.value + -1 * doubleTapScale * adjustedFocal.x.value, doubleTapScale));
      offset.y.value = (0, _reactNativeReanimated.withTiming)(clampY(adjustedFocal.y.value + -1 * doubleTapScale * adjustedFocal.y.value, doubleTapScale));
    } else {
      resetValues();
    }
  });

  const longPressGesture = _reactNativeGestureHandler.Gesture.LongPress().enabled(!!onLongPress).maxDistance(10).onStart(() => {
    'worklet';

    if (interruptedScroll.value) {
      interruptedScroll.value = false;
      return;
    }

    if (onLongPress) {
      (0, _reactNativeReanimated.runOnJS)(onLongPress)();
    }
  });

  return /*#__PURE__*/_react.default.createElement(_reactNativeGestureHandler.GestureDetector, {
    gesture: (item === null || item === void 0 ? void 0 : item.type) === 'video' ? _reactNativeGestureHandler.Gesture.Race(panGesture, tapGesture) : _reactNativeGestureHandler.Gesture.Race(_reactNativeGestureHandler.Gesture.Simultaneous(longPressGesture, _reactNativeGestureHandler.Gesture.Race(panGesture, pinchGesture)), _reactNativeGestureHandler.Gesture.Exclusive(doubleTapGesture, tapGesture))
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: {
      width,
      height
    }
  }, /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.View, {
    style: [{
      width,
      height
    }, animatedStyle]
  }, renderItem(itemProps))));
});

const GalleryComponent = ({
  data,
  renderItem = defaultRenderImage,
  initialIndex = 0,
  numToRender = 5,
  emptySpaceWidth = SPACE_BETWEEN_IMAGES,
  doubleTapScale = DOUBLE_TAP_SCALE,
  doubleTapInterval = 500,
  maxScale = MAX_SCALE,
  pinchEnabled = true,
  doubleTapEnabled = true,
  disableTransitionOnScaledImage = false,
  hideAdjacentImagesOnScaledImage = false,
  onIndexChange,
  style,
  keyExtractor,
  containerDimensions,
  disableVerticalSwipe,
  disableSwipeUp = false,
  loop = false,
  onScaleChange,
  onScaleChangeRange,
  ...eventsCallbacks
}, ref) => {
  const windowDimensions = (0, _reactNative.useWindowDimensions)();
  const dimensions = containerDimensions || windowDimensions;
  const isLoop = loop && (data === null || data === void 0 ? void 0 : data.length) > 1;
  const [index, setIndex] = (0, _react.useState)(initialIndex);
  const refs = (0, _react.useRef)([]);
  const setRef = (0, _react.useCallback)((itemIndex, value) => {
    refs.current[itemIndex] = value;
  }, []);
  const translateX = (0, _reactNativeReanimated.useSharedValue)(initialIndex * -(dimensions.width + emptySpaceWidth));
  const currentIndex = (0, _reactNativeReanimated.useSharedValue)(initialIndex);
  const animatedStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => ({
    transform: [{
      translateX: rtl ? -translateX.value : translateX.value
    }]
  }));
  const changeIndex = (0, _react.useCallback)(newIndex => {
    onIndexChange === null || onIndexChange === void 0 ? void 0 : onIndexChange(newIndex);
    setIndex(newIndex);
  }, [onIndexChange, setIndex]);
  (0, _reactNativeReanimated.useAnimatedReaction)(() => currentIndex.value, newIndex => (0, _reactNativeReanimated.runOnJS)(changeIndex)(newIndex), [currentIndex, changeIndex]);
  (0, _react.useEffect)(() => {
    translateX.value = index * -(dimensions.width + emptySpaceWidth); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions.width]);
  (0, _react.useImperativeHandle)(ref, () => ({
    setIndex(newIndex, animated) {
      var _refs$current;

      (_refs$current = refs.current) === null || _refs$current === void 0 ? void 0 : _refs$current[index].reset(false);
      setIndex(newIndex);
      currentIndex.value = newIndex;

      if (animated) {
        translateX.value = (0, _reactNativeReanimated.withSpring)(newIndex * -(dimensions.width + emptySpaceWidth), springConfig);
      } else {
        translateX.value = newIndex * -(dimensions.width + emptySpaceWidth);
      }
    },

    reset(animated = false) {
      var _refs$current2;

      (_refs$current2 = refs.current) === null || _refs$current2 === void 0 ? void 0 : _refs$current2.forEach(itemRef => itemRef.reset(animated));
    }

  }));
  (0, _react.useEffect)(() => {
    if (index >= data.length) {
      const newIndex = data.length - 1;
      setIndex(newIndex);
      currentIndex.value = newIndex;
      translateX.value = newIndex * -(dimensions.width + emptySpaceWidth);
    } // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [data === null || data === void 0 ? void 0 : data.length, dimensions.width]);
  return /*#__PURE__*/_react.default.createElement(_reactNativeGestureHandler.GestureHandlerRootView, {
    style: [styles.container, style]
  }, /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.View, {
    style: [styles.rowContainer, animatedStyle]
  }, data.map((item, i) => {
    const isFirst = i === 0;
    const renderCount = item.type === GalleryItemType.VIDEO ? 1 : numToRender;
    const outOfLoopRenderRange = !isLoop || Math.abs(i - index) < data.length - (renderCount - 1) / 2 && Math.abs(i - index) > (renderCount - 1) / 2;
    const hidden = Math.abs(i - index) > (renderCount - 1) / 2 && outOfLoopRenderRange;
    console.log(hidden);
    return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
      key: keyExtractor ? keyExtractor(item, i) : item.id || item.key || item._id || item,
      style: [dimensions, isFirst ? {} : {
        marginLeft: emptySpaceWidth
      }, index === i ? styles.activeItem : styles.inactiveItem]
    }, hidden ? null :
    /*#__PURE__*/
    // @ts-ignore
    _react.default.createElement(ResizableImage, _extends({
      active: index === i,
      translateX,
      item,
      currentIndex,
      index: i,
      isFirst,
      isLast: i === data.length - 1,
      length: data.length,
      renderItem,
      emptySpaceWidth,
      doubleTapScale,
      doubleTapInterval,
      maxScale,
      pinchEnabled,
      doubleTapEnabled,
      disableTransitionOnScaledImage,
      hideAdjacentImagesOnScaledImage,
      disableVerticalSwipe,
      disableSwipeUp,
      loop: isLoop,
      onScaleChange,
      onScaleChangeRange,
      setRef
    }, eventsCallbacks, dimensions)));
  })));
};

const Gallery = /*#__PURE__*/_react.default.forwardRef(GalleryComponent);

const styles = _reactNative.StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black'
  },
  rowContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  activeItem: {
    zIndex: 99
  },
  inactiveItem: {
    zIndex: 0
  }
});

var _default = Gallery;
exports.default = _default;
//# sourceMappingURL=index.js.map