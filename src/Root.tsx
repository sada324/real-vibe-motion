import "./index.css";
import { Composition } from "remotion";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";
import { HermesVideo } from "./HermesVideo";
import { MembersLiveVideo } from "./MembersLiveVideo";
import { LifestyleVideo } from "./LifestyleVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MembersLiveVideo"
        component={MembersLiveVideo}
        durationInFrames={1380}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="LifestyleVideo"
        component={LifestyleVideo}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="HermesVideo"
        component={HermesVideo}
        durationInFrames={750}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />
      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema2}
        defaultProps={{
          logoColor1: "#91dAE2" as const,
          logoColor2: "#86A8E7" as const,
        }}
      />
    </>
  );
};
