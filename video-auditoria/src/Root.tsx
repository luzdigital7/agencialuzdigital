import { Composition } from "remotion";
import { AuditoriaVideo, DURATION as D1, FPS as F1 } from "./Video";
import { Portada } from "./Portada";
import { AuditoriaPasos, DURATION, FPS } from "./VideoPasos";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="AuditoriaPasos" component={AuditoriaPasos} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ variant: "dark" as const }} />
      <Composition id="AuditoriaPasosClaro" component={AuditoriaPasos} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ variant: "light" as const }} />
      <Composition id="Portada" component={Portada} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{ variant: "dark" as const }} />
      <Composition id="PortadaClara" component={Portada} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{ variant: "light" as const }} />
      <Composition id="AuditoriaInstagram" component={AuditoriaVideo} durationInFrames={D1} fps={F1} width={1080} height={1920} />
    </>
  );
};
