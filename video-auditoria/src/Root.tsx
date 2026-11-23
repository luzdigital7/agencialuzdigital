import { Composition } from "remotion";
import { AuditoriaVideo, DURATION, FPS } from "./Video";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AuditoriaInstagram"
      component={AuditoriaVideo}
      durationInFrames={DURATION}
      fps={FPS}
      width={1080}
      height={1920}
    />
  );
};
