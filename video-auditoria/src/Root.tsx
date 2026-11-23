import { Composition } from "remotion";
import { AuditoriaVideo, DURATION, FPS } from "./Video";
import { Portada } from "./Portada";

export const RemotionRoot: React.FC = () => {
  return (
    <>
    <Composition id="Portada" component={Portada} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition
      id="AuditoriaInstagram"
      component={AuditoriaVideo}
      durationInFrames={DURATION}
      fps={FPS}
      width={1080}
      height={1920}
    />
    </>
  );
};
