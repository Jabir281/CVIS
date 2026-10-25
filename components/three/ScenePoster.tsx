import { pointPositions, type SceneKind, type Stage } from './geometry';

export function ScenePoster({ kind, stage }: { kind: SceneKind; stage: Stage }) {
  if (kind === 'brain') return (
    <svg viewBox="0 0 360 300" role="img" aria-label="Illustrative brain diagram with two hemispheres and a brainstem">
      <g className="brain-poster" strokeWidth="2">
        <path d="M176 244L171 278H193L188 244" />
        <path d="M176 53C149 29 110 45 96 67C65 68 50 100 59 124C35 151 53 184 73 191C72 219 107 237 134 227C149 247 174 234 178 216Z" />
        <path d="M184 53C211 29 250 45 264 67C295 68 310 100 301 124C325 151 307 184 287 191C288 219 253 237 226 227C211 247 186 234 182 216Z" />
        <g fill="none">
          <path d="M164 69C128 56 114 88 133 103C151 120 118 130 100 113M79 142C105 128 126 146 116 166C103 187 132 210 159 195M168 137C142 133 139 160 159 174M107 71C81 91 88 112 102 118M78 186C101 174 102 208 119 209" />
          <path d="M196 69C232 56 246 88 227 103C209 120 242 130 260 113M281 142C255 128 234 146 244 166C257 187 228 210 201 195M192 137C218 133 221 160 201 174M253 71C279 91 272 112 258 118M282 186C259 174 258 208 241 209" />
        </g>
      </g>
    </svg>
  );
  const coordinates = pointPositions(kind, stage);
  return (
    <svg viewBox="0 0 500 460" role="img" aria-label={kind === 'hero' ? 'Illustrative volumetric point cloud and golden scanning plane' : ['Observe: samples arranged on a sensor plane', 'Understand: samples form a three-dimensional volume', 'Apply: samples form a tapered spatial helix'][stage]}>
      <g className="poster-grid" fill="none"><ellipse cx="250" cy="230" rx="170" ry="180" /><path d="M60 230H440M250 40V420M130 80L370 380M370 80L130 380" /></g>
      {Array.from({ length: coordinates.length / 9 }, (_, index) => {
        const offset = index * 9;
        const depth = coordinates[offset + 2];
        return <circle key={index} cx={250 + coordinates[offset] * 6 + depth * 1.5} cy={230 - coordinates[offset + 1] * 6 + depth * 0.6} r={depth > 0 ? 1.7 : 1.1} className={index % 31 === 0 ? 'poster-gold' : 'poster-point'} />;
      })}
      <ellipse className="poster-scan" cx="250" cy="230" rx="166" ry="45" />
    </svg>
  );
}
