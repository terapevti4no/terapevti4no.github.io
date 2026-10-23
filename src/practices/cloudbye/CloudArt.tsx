import { useId } from 'react';

export const cloudShapes = ['rounded', 'wide', 'wispy', 'billowy', 'layered'] as const;
type CloudShape = typeof cloudShapes[number];
type Volume = readonly [cx: number, cy: number, rx: number, ry: number];

// All silhouettes share a full centre so long thoughts retain a light backdrop.
const shapes: Record<CloudShape, { volumes: Volume[]; highlights: Volume[]; mist: Volume }> = {
  rounded: {
    volumes: [[200,249,145,89], [290,194,142,114], [402,165,152,126], [522,203,136,104], [616,252,135,79], [486,266,185,100], [319,268,190,97]],
    highlights: [[370,173,117,91], [279,215,101,72], [493,225,115,83], [394,259,204,88]],
    mist: [402,294,360,105],
  },
  wide: {
    volumes: [[161,252,125,73], [258,216,158,90], [390,196,167,101], [536,225,154,83], [652,261,113,62], [462,270,213,91], [301,271,198,88]],
    highlights: [[248,227,119,68], [386,207,135,81], [541,241,117,64], [396,265,234,79]],
    mist: [408,296,370,83],
  },
  wispy: {
    volumes: [[147,264,111,68], [251,209,132,101], [356,177,126,113], [439,233,151,100], [577,262,142,64], [681,277,99,44], [294,274,172,87], [449,278,187,78]],
    highlights: [[326,194,101,88], [240,229,91,66], [425,248,123,78], [537,270,143,51], [340,271,180,77]],
    mist: [410,303,366,80],
  },
  billowy: {
    volumes: [[172,249,121,88], [274,169,132,133], [466,166,149,127], [599,243,133,92], [400,233,155,106], [296,277,177,100], [501,277,182,94]],
    highlights: [[260,173,104,105], [453,170,119,102], [166,252,84,65], [588,252,92,67], [389,260,211,91]],
    mist: [403,302,351,106],
  },
  layered: {
    volumes: [[143,215,119,60], [265,180,153,75], [408,199,171,79], [543,231,166,77], [660,258,107,59], [255,270,157,82], [407,275,187,91], [553,289,138,65]],
    highlights: [[256,190,132,57], [392,211,141,62], [533,242,126,59], [321,274,132,69], [459,280,147,66]],
    mist: [407,301,362,88],
  },
};

// Soft, overlapping volumes stay vector-sharp without animated blur filters.
export default function CloudArt({ shape = 'rounded' }: { shape?: CloudShape }) {
  const { volumes, highlights, mist: [cx, cy, rx, ry] } = shapes[shape];
  const id = useId();
  const puff = `${id}-puff`;
  const light = `${id}-light`;
  const mist = `${id}-mist`;
  return <svg className="cloud-art" data-shape={shape} viewBox="0 0 800 440" preserveAspectRatio="none" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id={puff} cx="50%" cy="50%" r="50%">
        <stop stopColor="var(--cloud-highlight)" stopOpacity=".96"/>
        <stop offset=".58" stopColor="var(--cloud-lit)" stopOpacity=".92"/>
        <stop offset=".86" stopColor="var(--cloud-shade)" stopOpacity=".2"/>
        <stop offset="1" stopColor="var(--cloud-shade)" stopOpacity="0"/>
      </radialGradient>
      <radialGradient id={light}>
        <stop stopColor="var(--cloud-highlight)" stopOpacity=".85"/>
        <stop offset=".6" stopColor="var(--cloud-lit)" stopOpacity=".5"/>
        <stop offset="1" stopColor="var(--cloud-lit)" stopOpacity="0"/>
      </radialGradient>
      <radialGradient id={mist}>
        <stop stopColor="var(--cloud-shade)" stopOpacity=".4"/>
        <stop offset="1" stopColor="var(--cloud-shade)" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${mist})`}/>
    <g fill={`url(#${puff})`}>
      {volumes.map(([cx, cy, rx, ry], index) => <ellipse key={index} cx={cx} cy={cy} rx={rx} ry={ry}/>)}
    </g>
    <g fill={`url(#${light})`}>
      {highlights.map(([cx, cy, rx, ry], index) => <ellipse key={index} cx={cx} cy={cy} rx={rx} ry={ry}/>)}
    </g>
    <ellipse cx="420" cy="334" rx="303" ry="48" fill={`url(#${mist})`} opacity=".45"/>
  </svg>;
}
