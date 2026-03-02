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
  title: string;
  assets: AssetEntry[];
};

export const ASSETS: Record<string, AssetCategory> = {
  logo: {
    title: 'Logo',
    assets: [],
  },
  icons: {
    title: 'Icons',
    assets: [],
  },
  illustrations: {
    title: 'Illustrations',
    assets: [],
  },
  animations: {
    title: 'Animations',
    assets: [],
  },
};
