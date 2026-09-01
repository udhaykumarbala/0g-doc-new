import { LottieProps } from "@lottielab/lottie-player/react";
import React, { useEffect, useState } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import { ILottie } from "@lottielab/lottie-player";
import { useColorMode } from "@docusaurus/theme-common";

// The same animation in two palettes. Both files live in static/animations so
// the fetch stays same-origin and passes the site's connect-src CSP (vercel.json).
const ANIMATION_SRC = {
  light: "/animations/future-of-ai.json",
  dark: "/animations/future-of-ai-dark.json",
} as const;

const LottieAnimation = () => {
  const { colorMode } = useColorMode();
  const [LottieComponent, setLottieComponent] =
    useState<React.ForwardRefExoticComponent<
      LottieProps & React.RefAttributes<ILottie>
    > | null>(null);

  useEffect(() => {
    import("@lottielab/lottie-player/react").then((module) => {
      setLottieComponent(() => module.default);
    });
  }, []);

  const src = ANIMATION_SRC[colorMode === "dark" ? "dark" : "light"];

  return (
    <BrowserOnly>
      {() =>
        LottieComponent ? (
          // key remounts the player on theme change so it loads the other file
          <LottieComponent key={src} src={src} autoplay />
        ) : null
      }
    </BrowserOnly>
  );
};

export default LottieAnimation;
