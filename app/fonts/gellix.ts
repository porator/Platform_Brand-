import localFont from "next/font/local";

/** Gellix, Appcharge's brand face (the website's headings). Used on the intro page and in Create project. */
export const gellix = localFont({
  src: [
    { path: "./gellix/Gellix-Light.otf", weight: "300" },
    { path: "./gellix/Gellix-Regular.otf", weight: "400" },
    { path: "./gellix/Gellix-Medium.otf", weight: "500" },
    { path: "./gellix/Gellix-SemiBold.otf", weight: "600" },
    { path: "./gellix/Gellix-Bold.otf", weight: "700" },
  ],
  display: "swap",
});
