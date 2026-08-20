/**
 * Central image registry.
 * Replace these Unsplash placeholders with the foundation's real photos
 * by dropping files into client/public/images and updating the paths
 * (e.g. "/images/hero-sapling.jpg").
 */
const u = (id, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

export const IMG = {
  heroSapling: u("photo-1542601906990-b4d3fb778b09"),
  heroBanner: u("photo-1441974231531-c6227db76b6e", 1600),
  planting: u("photo-1618477462146-050d2767eac4"),
  teamPlanting: u("photo-1552084117-56a987666449"),
  students: u("photo-1509062522246-3755977927d7"),
  healthCamp: u("photo-1584515933487-779824d29309"),
  volunteers: u("photo-1559027615-cd4628902d4a"),
  books: u("photo-1512820790803-83ca734da794"),
  donateJar: u("photo-1532629345422-7515f3d16bb6"),
  saplingHands: u("photo-1466692476868-aef1dfb1e735"),
};

export default IMG;
