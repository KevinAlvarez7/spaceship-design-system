export type AssetFormat =
  | 'svg'
  | 'png'
  | 'jpg'
  | 'lottie'     // .json — played by @lottiefiles/dotlottie-web
  | 'rive'       // .riv  — played by @rive-app/react-canvas
  | 'svg-anim';  // inline SVG with CSS / SMIL animation

export type AssetEntry = {
  name: string;
  filePath: string;         // relative to /public, e.g. '/assets/icons/arrow.svg'
  format: AssetFormat;
  description?: string;
  tags?: string[];
  dimensions?: { width: number; height: number };
};

export type AssetCategory = {
  slug: string;
  title: string;
  assets: AssetEntry[];
};

export const assetCategories = {
  logo: {
    slug: 'logo',
    title: 'Logo',
    assets: [],
  },
  icons: {
    slug: 'icons',
    title: 'Icons',
    assets: [],
  },
  illustrations: {
    slug: 'illustrations',
    title: 'Illustrations',
    assets: [],
  },
  animations: {
    slug: 'animations',
    title: 'Animations',
    assets: [],
  },
} satisfies Record<string, AssetCategory>;
