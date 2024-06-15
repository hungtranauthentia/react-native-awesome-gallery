declare type Size = {
    width: number;
    height: number;
};
/**
 * calculates the size of the image, how it would stretch to the borders of the container,
 * while maintaining its proportions (Image -> resizeMode="contain")
 */
export declare const resizeImage: ({ width: imgWidth, height: imgHeight }: Size, { width, height }: Size) => Size;
export {};
