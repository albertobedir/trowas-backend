/**
 * Utility functions for image handling
 */

/**
 * Processes a profile image to ensure there are no black areas outside the circular crop
 * This function should be used when loading profile images in portrait mode
 * 
 * @param imageUrl URL of the profile image
 * @param backgroundColor The background color to use for the image container
 * @returns A CSS object with background properties
 */
export const getCircularImageStyles = (imageUrl: string, backgroundColor: string = "#ffffff") => {
  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: backgroundColor,
    borderRadius: '50%',
  };
};

/**
 * Processes an image to create a blur background effect
 * Used to create a background layer in portrait mode
 * 
 * @param imageUrl URL of the image to blur
 * @param scale Scale factor for the background (should be > 1.0)
 * @returns A CSS object with the blur effect properties
 */
export const getBlurBackgroundStyles = (imageUrl: string, scale: number = 1.2) => {
  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(12px)',
    transform: `scale(${scale})`,
    opacity: 0.9,
  };
};