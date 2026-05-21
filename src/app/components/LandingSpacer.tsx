type Props = {
  bgColor: string;
};

/** Empty snap panel — landing visuals live in the always-mounted LandingStage. */
export default function LandingSpacer({ bgColor }: Props) {
  return (
    <div className="h-full w-full" style={{ background: bgColor }} aria-hidden="true" />
  );
}
