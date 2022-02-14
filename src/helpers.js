
export const contrastingColor = (hexColor) => {
  if (hexColor == null) return(null);

  let parts = hexColorToArray(hexColor);

  // Formula from https://www.w3.org/TR/AERT/#color-contrast
  let brightness = ((parts[0] * 299) + (parts[1] * 587) + (parts[2] * 114)) / 1000;

  if (brightness > 128) {
    return("#000000");
  } else {
    return("#ffffff");
  }
}

// Expects to receive a string like "#FF2525"
const hexColorToArray = (string) => {
  return([
    Number(`0x${string.slice(1, 3)}`),
    Number(`0x${string.slice(3, 5)}`),
    Number(`0x${string.slice(5, 7)}`),
  ]);
}
