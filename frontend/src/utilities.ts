export const offsetsFromUtc = () => {
  /*
  Create a list of the UTC time offsets
  "from the westernmost (−12:00) to the easternmost (+14:00)"
  (as per https://en.wikipedia.org/wiki/List_of_UTC_time_offsets ).
  */
  const start = -12;
  const end = 14;

  const nonnegativeOffsetsFromUtc = Array.from({ length: end + 1 }).map((_, ind) => {
    return "+" + ind.toString().padStart(2, "0") + ":00";
  });
  const negativeOffsetsFromUtc = Array.from({ length: -start }).map((_, ind) => {
    return "-" + (ind + 1).toString().padStart(2, "0") + ":00";
  });

  return negativeOffsetsFromUtc.reverse().concat(nonnegativeOffsetsFromUtc);
};
