'use client';

import React, { useRef, useState, useMemo, useCallback, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { countryCodeToFlag as _countryCodeToFlag } from '@/lib/famelack-types';

// ─── Country data ───
const COUNTRY_COORDS: Record<string, [number, number]> = {
  AD:[42.55,1.6],AE:[23.42,53.85],AF:[33.94,67.71],AG:[17.06,-61.8],AL:[41.15,20.17],
  AM:[40.07,45.04],AO:[-11.2,17.87],AR:[-38.42,-63.62],AT:[47.52,14.55],AU:[-25.27,133.78],
  AW:[12.52,-69.97],AZ:[40.14,47.58],BA:[43.92,17.68],BB:[13.19,-59.54],BD:[23.68,90.36],
  BE:[50.5,4.47],BF:[12.24,-1.56],BG:[42.73,25.49],BH:[26.07,50.56],BI:[-3.37,29.92],
  BJ:[9.31,2.32],BN:[4.21,114.67],BO:[-16.29,-63.59],BR:[-14.24,-51.93],BS:[25.03,-77.4],
  BT:[27.51,90.43],BW:[-22.33,24.68],BY:[53.71,27.95],BZ:[17.19,-88.5],CA:[56.13,-106.35],
  CD:[-4.04,21.76],CF:[6.61,20.94],CG:[-0.23,15.83],CH:[46.82,8.23],CI:[7.54,-5.55],
  CL:[-35.68,-71.54],CM:[7.37,12.35],CN:[35.86,104.2],CO:[4.57,-74.3],CR:[9.75,-83.75],
  CU:[21.52,-77.78],CV:[16.0,-24.01],CW:[12.17,-68.98],CY:[35.13,33.43],CZ:[49.82,15.47],
  DE:[51.17,10.45],DJ:[11.83,42.59],DK:[56.26,9.5],DO:[18.74,-70.16],DZ:[28.03,1.66],
  EC:[-1.83,-78.18],EE:[58.6,25.01],EG:[26.82,30.8],ER:[15.18,39.78],ES:[40.46,-3.75],
  ET:[9.15,40.49],FI:[61.92,25.75],FJ:[-16.58,179.41],FM:[7.43,150.55],FO:[61.89,-6.88],
  FR:[46.23,2.21],GA:[-0.8,11.61],GB:[55.38,-3.44],GE:[42.32,43.36],GF:[3.94,-53.13],
  GH:[7.95,-1.02],GI:[36.14,-5.35],GL:[71.71,-42.6],GM:[13.44,-15.31],GN:[9.95,-9.7],
  GQ:[1.65,10.27],GR:[39.07,21.82],GT:[15.78,-90.23],GU:[13.44,144.79],GW:[11.8,-15.18],
  GY:[4.86,-58.93],HK:[22.4,114.11],HN:[15.2,-86.24],HR:[45.1,15.2],HT:[18.97,-72.29],
  HU:[47.16,19.5],ID:[-0.79,113.92],IE:[53.14,-7.69],IL:[31.05,34.85],IM:[54.24,-4.55],
  IN:[20.59,78.96],IQ:[33.22,43.68],IR:[32.43,53.69],IS:[64.96,-19.02],IT:[41.87,12.57],
  JM:[18.11,-77.3],JO:[30.59,36.24],JP:[36.2,138.25],KE:[-0.02,37.91],KG:[41.2,74.77],
  KH:[12.57,104.99],KM:[-11.88,43.87],KN:[17.36,-62.78],KP:[40.34,127.51],KR:[35.91,127.77],
  KW:[29.31,47.48],KY:[19.31,-81.25],KZ:[48.02,66.92],LA:[19.86,102.5],LB:[33.85,35.86],
  LC:[13.91,-60.98],LI:[47.17,9.56],LK:[7.87,80.77],LR:[6.43,-9.43],LS:[-29.61,28.23],
  LT:[55.17,23.88],LU:[49.82,6.13],LV:[56.88,24.6],LY:[26.34,17.23],MA:[31.79,-7.09],
  MC:[43.73,7.42],MD:[47.41,28.37],ME:[42.71,19.37],MG:[-18.77,46.87],MH:[7.13,171.18],
  MK:[41.51,21.75],ML:[17.57,-4.0],MM:[21.91,95.96],MN:[46.86,103.85],MO:[22.2,113.55],
  MP:[17.45,145.78],MQ:[14.64,-60.98],MR:[21.01,-10.94],MS:[16.74,-62.19],MT:[35.94,14.38],
  MU:[-20.35,57.55],MV:[3.2,73.22],MW:[-13.25,34.3],MX:[23.63,-102.55],MY:[4.21,101.98],
  MZ:[-18.67,35.53],NA:[-22.96,18.49],NC:[-22.28,166.45],NE:[17.61,8.08],NG:[9.08,8.68],
  NI:[12.87,-85.21],NL:[52.13,5.29],NO:[60.47,8.47],NP:[28.39,84.12],NR:[-0.52,166.93],
  NU:[-19.05,-169.87],NZ:[-40.9,174.89],OM:[21.47,55.98],PA:[8.54,-80.78],PE:[-9.19,-75.02],
  PF:[-17.68,-149.41],PG:[-6.31,143.96],PH:[12.88,121.77],PK:[30.38,69.35],PL:[51.92,19.15],
  PM:[46.94,-56.31],PR:[18.22,-66.59],PS:[31.95,35.23],PT:[39.4,-8.22],PW:[7.51,134.58],
  PY:[-23.44,-58.44],QA:[25.35,51.18],RE:[-21.12,55.54],RO:[45.94,24.97],RS:[44.02,21.01],
  RU:[61.52,105.32],RW:[-1.94,29.87],SA:[23.89,45.08],SB:[-9.65,160.16],SC:[-4.68,55.49],
  SD:[12.86,30.22],SE:[60.13,18.64],SG:[1.35,103.82],SH:[-7.94,-14.36],SI:[46.15,14.99],
  SK:[48.67,19.7],SL:[8.46,-11.78],SM:[43.94,12.46],SN:[14.5,-14.45],SO:[5.15,46.2],
  SR:[3.92,-56.03],SS:[6.88,31.31],ST:[0.19,6.61],SV:[13.79,-88.9],SX:[18.03,-63.05],
  SY:[34.8,38.99],SZ:[-26.52,31.47],TC:[21.79,-72.0],TD:[15.45,18.73],TG:[8.62,1.17],
  TH:[15.87,100.99],TJ:[38.86,71.28],TL:[-8.87,125.73],TM:[38.97,59.56],TN:[33.89,9.54],
  TO:[-21.18,-175.2],TR:[38.96,35.24],TT:[10.69,-61.22],TV:[-7.11,179.2],TW:[23.7,120.96],
  TZ:[-6.37,34.89],UA:[48.38,31.17],UG:[1.37,32.29],US:[37.09,-95.71],UY:[-32.52,-55.77],
  UZ:[41.38,64.59],VA:[41.9,12.45],VC:[12.98,-61.29],VE:[6.42,-66.59],VG:[18.42,-64.64],
  VI:[18.34,-64.77],VN:[14.06,108.28],VU:[-15.38,166.96],WF:[-13.77,-177.2],WS:[-13.76,-172.1],
  XK:[42.6,20.9],YE:[15.55,48.52],ZA:[-30.56,22.94],ZM:[-13.13,27.85],ZW:[-19.02,29.15],
};

const COUNTRY_NAMES: Record<string, string> = {
  AF:'Afghanistan',AL:'Albania',DZ:'Algeria',AD:'Andorra',AO:'Angola',AG:'Antigua & Barbuda',
  AR:'Argentina',AM:'Armenia',AU:'Australia',AT:'Austria',AZ:'Azerbaijan',BS:'Bahamas',
  BH:'Bahrain',BD:'Bangladesh',BB:'Barbados',BY:'Belarus',BE:'Belgium',BZ:'Belize',
  BJ:'Benin',BT:'Bhutan',BO:'Bolivia',BA:'Bosnia & Herz.',BW:'Botswana',BR:'Brazil',
  BN:'Brunei',BG:'Bulgaria',BF:'Burkina Faso',BI:'Burundi',KH:'Cambodia',CM:'Cameroon',
  CA:'Canada',CV:'Cape Verde',CF:'Central African Rep.',TD:'Chad',CL:'Chile',CN:'China',
  CO:'Colombia',KM:'Comoros',CG:'Congo',CD:'Dem. Rep. Congo',CR:'Costa Rica',HR:'Croatia',
  CU:'Cuba',CY:'Cyprus',CZ:'Czech Republic',DK:'Denmark',DJ:'Djibouti',DM:'Dominica',
  DO:'Dominican Republic',EC:'Ecuador',EG:'Egypt',SV:'El Salvador',GQ:'Eq. Guinea',ER:'Eritrea',
  EE:'Estonia',ET:'Ethiopia',FJ:'Fiji',FI:'Finland',FR:'France',GA:'Gabon',GM:'Gambia',
  GE:'Georgia',DE:'Germany',GH:'Ghana',GR:'Greece',GD:'Grenada',GT:'Guatemala',GN:'Guinea',
  GW:'Guinea-Bissau',GY:'Guyana',HT:'Haiti',HN:'Honduras',HK:'Hong Kong',HU:'Hungary',
  IS:'Iceland',IN:'India',ID:'Indonesia',IR:'Iran',IQ:'Iraq',IE:'Ireland',IL:'Israel',
  IT:'Italy',CI:'Ivory Coast',JM:'Jamaica',JP:'Japan',JO:'Jordan',KZ:'Kazakhstan',KE:'Kenya',
  KP:'North Korea',KR:'South Korea',KW:'Kuwait',KG:'Kyrgyzstan',LA:'Laos',LV:'Latvia',
  LB:'Lebanon',LS:'Lesotho',LR:'Liberia',LY:'Libya',LI:'Liechtenstein',LT:'Lithuania',
  LU:'Luxembourg',MO:'Macau',MK:'Macedonia',MG:'Madagascar',MW:'Malawi',MY:'Malaysia',
  MV:'Maldives',ML:'Mali',MT:'Malta',MH:'Marshall Islands',MQ:'Martinique',MR:'Mauritania',
  MU:'Mauritius',MX:'Mexico',FM:'Micronesia',MD:'Moldova',MC:'Monaco',MN:'Mongolia',
  ME:'Montenegro',MA:'Morocco',MZ:'Mozambique',MM:'Myanmar',NA:'Namibia',NR:'Nauru',
  NP:'Nepal',NL:'Netherlands',NZ:'New Zealand',NI:'Nicaragua',NE:'Niger',NG:'Nigeria',
  MP:'Northern Mariana',NO:'Norway',OM:'Oman',PK:'Pakistan',PW:'Palau',PS:'Palestine',
  PA:'Panama',PG:'Papua New Guinea',PY:'Paraguay',PE:'Peru',PH:'Philippines',PL:'Poland',
  PT:'Portugal',PR:'Puerto Rico',QA:'Qatar',RE:'Reunion',RO:'Romania',RU:'Russia',RW:'Rwanda',
  KN:'Saint Kitts & Nevis',LC:'Saint Lucia',WS:'Samoa',SM:'San Marino',ST:'Sao Tome & Principe',
  SA:'Saudi Arabia',SN:'Senegal',RS:'Serbia',SC:'Seychelles',SL:'Sierra Leone',SG:'Singapore',
  SX:'Sint Maarten',SK:'Slovakia',SI:'Slovenia',SB:'Solomon Islands',SO:'Somalia',
  ZA:'South Africa',SS:'South Sudan',ES:'Spain',LK:'Sri Lanka',SD:'Sudan',SR:'Suriname',
  SZ:'Eswatini',SE:'Sweden',CH:'Switzerland',SY:'Syria',TW:'Taiwan',TJ:'Tajikistan',
  TZ:'Tanzania',TH:'Thailand',TL:'Timor-Leste',TG:'Togo',TO:'Tonga',TT:'Trinidad & Tobago',
  TN:'Tunisia',TR:'Turkey',TM:'Turkmenistan',TC:'Turks & Caicos',TV:'Tuvalu',UG:'Uganda',
  UA:'Ukraine',AE:'UAE',GB:'United Kingdom',US:'United States',UY:'Uruguay',UZ:'Uzbekistan',
  VU:'Vanuatu',VE:'Venezuela',VN:'Vietnam',VG:'Virgin Islands (UK)',VI:'Virgin Islands (US)',
  EH:'Western Sahara',YE:'Yemen',ZM:'Zambia',ZW:'Zimbabwe',XK:'Kosovo',FO:'Faroe Islands',
  GL:'Greenland',GU:'Guam',KI:'Kiribati',NC:'New Caledonia',NU:'Niue',
  PF:'French Polynesia',WF:'Wallis & Futuna',AS:'American Samoa',CK:'Cook Islands',
};

function getCountryName(code: string): string {
  return COUNTRY_NAMES[code] || code;
}

const countryCodeToFlag = _countryCodeToFlag;

// Short display name for the label on earth surface
function getShortName(code: string): string {
  const name = COUNTRY_NAMES[code] || code;
  if (name.length <= 12) return name;
  // Truncate long names
  return name.substring(0, 11) + '\u2026';
}

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

// ─── Textured Earth — vivid satellite texture + clouds ───
function TexturedEarth() {
  const [earthMap, cloudMap] = useTexture([
    '/textures/earth-vivid.webp',
    '/textures/earth_clouds_1024.webp',
  ]);

  useEffect(() => {
    earthMap.colorSpace = THREE.SRGBColorSpace;
    earthMap.anisotropy = 8;
  }, [earthMap]);

  return (
    <>
      {/* Main earth sphere — 128 segments for smoother rendering */}
      <mesh>
        <sphereGeometry args={[2, 128, 128]} />
        <meshPhongMaterial
          map={earthMap}
          color="#ffffff"
          specular={new THREE.Color('#333333')}
          shininess={25}
          emissive={new THREE.Color('#111111')}
        />
      </mesh>
      {/* Cloud layer */}
      <mesh>
        <sphereGeometry args={[2.015, 128, 128]} />
        <meshPhongMaterial
          alphaMap={cloudMap}
          color="#ffffff"
          transparent
          opacity={0.3}
          depthWrite={false}
          side={THREE.FrontSide}
        />
      </mesh>
      {/* Atmosphere glow — subtle rim effect with additive blending */}
      <mesh>
        <sphereGeometry args={[2.15, 64, 64]} />
        <meshBasicMaterial
          color={new THREE.Color('#4488ff')}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

// ─── Build a canvas texture with flag + name pill ───
function buildLabelTexture(code: string): THREE.CanvasTexture {
  const cw = 300, ch = 90;
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d')!;

  const flag = countryCodeToFlag(code);
  const name = getShortName(code);

  // Measure text to size the pill
  ctx.font = 'bold 24px Outfit, system-ui, sans-serif';
  const tw = ctx.measureText(name).width;
  const flagW = 34, pad = 16, gap = 6;
  const pillW = Math.min(288, flagW + gap + tw + pad * 2);
  const pillH = 48;
  const x0 = (cw - pillW) / 2, y0 = (ch - pillH) / 2, r = 16;

  // Rounded pill background
  ctx.fillStyle = 'rgba(0,0,0,0.62)';
  ctx.beginPath();
  ctx.moveTo(x0 + r, y0);
  ctx.lineTo(x0 + pillW - r, y0);
  ctx.quadraticCurveTo(x0 + pillW, y0, x0 + pillW, y0 + r);
  ctx.lineTo(x0 + pillW, y0 + pillH - r);
  ctx.quadraticCurveTo(x0 + pillW, y0 + pillH, x0 + pillW - r, y0 + pillH);
  ctx.lineTo(x0 + r, y0 + pillH);
  ctx.quadraticCurveTo(x0, y0 + pillH, x0, y0 + pillH - r);
  ctx.lineTo(x0, y0 + r);
  ctx.quadraticCurveTo(x0, y0, x0 + r, y0);
  ctx.fill();

  // Subtle border
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Flag emoji
  ctx.font = '30px serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(flag, x0 + pad, y0 + pillH / 2 + 1);

  // Country name
  ctx.font = 'bold 24px Outfit, system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(name, x0 + pad + flagW + gap, y0 + pillH / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ─── Country label — painted on earth surface, rotates with globe because it's a child ───
function CountryLabel({
  code,
  basePosition,
  isSelected,
  cameraPosRef,
  onClick,
  onHover,
  onUnhover,
}: {
  code: string;
  basePosition: THREE.Vector3;
  isSelected: boolean;
  cameraPosRef: React.RefObject<THREE.Vector3>;
  onClick: () => void;
  onHover: () => void;
  onUnhover: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const planeRef = useRef<THREE.Mesh>(null);
  const dotRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const facingRef = useRef(false);
  const fc = useRef(0);

  // Canvas texture — created once per country
  const texture = useMemo(() => buildLabelTexture(code), [code]);

  // Orientation — face outward from sphere center (perpendicular to surface normal)
  const orientation = useMemo(() => {
    const normal = basePosition.clone().normalize();
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    return q;
  }, [basePosition]);

  // Apply orientation once mesh mounts
  useEffect(() => {
    if (planeRef.current) {
      planeRef.current.quaternion.copy(orientation);
    }
  }, [orientation]);

  // Position on sphere surface, slightly above
  const surfPos = useMemo(
    () => basePosition.clone().normalize().multiplyScalar(2.12),
    [basePosition],
  );

  // Pre-allocated vectors — avoids creating 6 new objects per frame per label
  const _worldPos = useMemo(() => new THREE.Vector3(), []);
  const _camDir = useMemo(() => new THREE.Vector3(), []);
  const _normal = useMemo(() => basePosition.clone().normalize(), [basePosition]);
  const _parentNormal = useMemo(() => new THREE.Vector3(), []);

  // Every frame: facing check only — rotation is inherited from parent earth group!
  useFrame(() => {
    fc.current++;

    // Facing check — show only when this part of earth faces camera
    const cam = cameraPosRef.current;
    if (cam && groupRef.current) {
      // Reuse pre-allocated vectors — zero allocations per frame
      groupRef.current.getWorldPosition(_worldPos);
      _camDir.copy(cam).sub(_worldPos).normalize();
      _parentNormal.copy(_normal);
      const parentObj = groupRef.current.parent;
      if (parentObj) {
        _parentNormal.applyQuaternion(parentObj.quaternion);
      }
      const d = _parentNormal.dot(_camDir);
      const facing = d > 0.1;
      if (fc.current % 6 === 0 && facing !== facingRef.current) {
        facingRef.current = facing;
        groupRef.current.visible = facing || isSelected;
      }
    }

    // Scale animations — only when visible
    if (planeRef.current && groupRef.current?.visible) {
      const s = isSelected ? 1 + Math.sin(fc.current * 0.04) * 0.08 : hovered ? 1.18 : 1;
      planeRef.current.scale.setScalar(s);
    }
    if (dotRef.current && groupRef.current?.visible) {
      const s = isSelected ? 1 + Math.sin(fc.current * 0.06) * 0.3 : 1;
      dotRef.current.scale.setScalar(s);
    }
  });

  // Dispose texture on unmount
  useEffect(() => () => { texture.dispose(); }, [texture]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pointerHandlers: Record<string, (e: any) => void> = {
    onPointerEnter: (e) => { e.stopPropagation(); setHovered(true); onHover(); document.body.style.cursor = 'pointer'; },
    onPointerLeave: (e) => { e.stopPropagation(); setHovered(false); onUnhover(); document.body.style.cursor = 'grab'; },
    onClick: (e) => { e.stopPropagation(); onClick(); },
  };

  // Always mounted — visibility controlled via .visible in useFrame
  return (
    <group ref={groupRef} visible={false}>
      {/* Green dot anchor on the surface */}
      <mesh ref={dotRef} position={surfPos} {...pointerHandlers}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshBasicMaterial
          color={isSelected ? '#6C84E8' : hovered ? '#66BB6A' : '#4CAF50'}
          transparent
          opacity={isSelected ? 1 : 0.8}
        />
      </mesh>

      {/* Flag + name label — 3D plane tangent to sphere, rotates with earth */}
      <mesh ref={planeRef} position={surfPos} {...pointerHandlers}>
        <planeGeometry args={[0.28, 0.09]} />
        <meshBasicMaterial
          map={texture}
          transparent
          depthWrite={false}
          side={THREE.FrontSide}
        />
      </mesh>
    </group>
  );
}

// ─── Earth container with auto-rotation — country labels are CHILDREN so they rotate with it ───
function EarthSphere({
  earthGroupRef,
  children,
}: {
  earthGroupRef: React.MutableRefObject<THREE.Group | null>;
  children: React.ReactNode;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const cloudRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const speed = 60 * delta;
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002 * speed;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y += 0.0006 * speed;
    }
    // Sync the outer group so OrbitControls + facing checks can read world rotation
    if (earthGroupRef.current && meshRef.current) {
      earthGroupRef.current.rotation.copy(meshRef.current.rotation);
    }
  });

  return (
    <group ref={earthGroupRef}>
      <group ref={meshRef}>
        <group ref={cloudRef}>
          <Suspense fallback={null}>
            <TexturedEarth />
          </Suspense>
          {/* Country labels live inside the rotating mesh group — they inherit rotation! */}
          {children}
        </group>
      </group>
    </group>
  );
}

// ─── Scene ───
function Scene({
  availableCountries,
  metadata,
  selectedCountry,
  onSelectCountry,
  onHoverCountry,
  onUnhoverCountry,
}: {
  availableCountries: Set<string>;
  metadata: Record<string, { hasChannels: boolean; channelCount: number }>;
  selectedCountry: string | null;
  onSelectCountry: (code: string) => void;
  onHoverCountry: (code: string | null) => void;
  onUnhoverCountry: () => void;
}) {
  const earthGroupRef = useRef<THREE.Group | null>(null);
  const { camera } = useThree();
  const cameraPosRef = useRef(new THREE.Vector3());
  const lightRef = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    cameraPosRef.current.copy(camera.position);
    if (lightRef.current) {
      lightRef.current.position.copy(camera.position);
    }
  });

  const countriesArray = useMemo(() => {
    return Array.from(availableCountries)
      .filter(code => COUNTRY_COORDS[code])
      .map(code => ({
        code,
        position: latLngToVector3(COUNTRY_COORDS[code][0], COUNTRY_COORDS[code][1], 2.03),
      }));
  }, [availableCountries, metadata]);

  return (
    <>
      <directionalLight ref={lightRef} color="#ffffff" intensity={1.8} />
      <ambientLight intensity={0.6} />
      <ambientLight color={new THREE.Color('#8888ff')} intensity={0.3} />

      {/* Earth with labels as children — they physically rotate together */}
      <EarthSphere earthGroupRef={earthGroupRef}>
        {countriesArray.map(({ code, position }) => (
          <CountryLabel
            key={code}
            code={code}
            basePosition={position}
            isSelected={code === selectedCountry}
            cameraPosRef={cameraPosRef}
            onClick={() => onSelectCountry(code)}
            onHover={() => onHoverCountry(code)}
            onUnhover={onUnhoverCountry}
          />
        ))}
      </EarthSphere>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={8}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        autoRotate={false}
        dampingFactor={0.08}
        enableDamping
        // Touch optimization for mobile
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
      />
    </>
  );
}

// ─── Main GlobeSelector ───
interface GlobeSelectorProps {
  metadata: Record<string, { hasChannels: boolean; channelCount: number }>;
  selectedCountry: string | null;
  onSelectCountry: (code: string) => void;
  mode: 'tv' | 'radio';
}

export default function GlobeSelector({
  metadata,
  selectedCountry,
  onSelectCountry,
  mode,
}: GlobeSelectorProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const availableCountries = useMemo(() => {
    return new Set(Object.keys(metadata).filter(c => metadata[c]?.hasChannels));
  }, [metadata]);

  const handleSelectCountry = useCallback((code: string) => {
    onSelectCountry(code === selectedCountry ? '' : code);
  }, [onSelectCountry, selectedCountry]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <div
        className="flex-1 relative p-2 sm:p-3"
        style={{ background: 'linear-gradient(160deg, #0a1018 0%, #0d1520 40%, #111b2a 70%, #0a1018 100%)' }}
      >
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-[#6C84E8]/30 border-t-[#6C84E8] rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[10px] sm:text-xs text-[#6C84E8]/60 font-medium">Loading Earth...</p>
            </div>
          </div>
        }>
          <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
            onCreated={({ gl, camera }) => {
              gl.setClearColor(new THREE.Color('#0d1520'), 1);
              // Mobile: wider FOV so globe fits better on small screens
              if (window.innerWidth < 768) {
                (camera as THREE.PerspectiveCamera).fov = 55;
                (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
              }
              const canvas = gl.domElement;
              canvas.addEventListener('webglcontextlost', (e) => e.preventDefault());
              canvas.addEventListener('webglcontextrestored', () => {
                gl.setClearColor(new THREE.Color('#0d1520'), 1);
              });
            }}
          >
            <Scene
              availableCountries={availableCountries}
              metadata={metadata}
              selectedCountry={selectedCountry}
              onSelectCountry={handleSelectCountry}
              onHoverCountry={setHoveredCountry}
              onUnhoverCountry={() => setHoveredCountry(null)}
            />
          </Canvas>
        </Suspense>
      </div>

      {/* Bottom bar */}
      <div
        className="absolute bottom-0 left-0 right-0 flex justify-center pb-4 sm:pb-6 safe-bottom pointer-events-none z-10"
        style={{
          background: 'linear-gradient(0deg, rgba(13,21,32,0.92) 0%, rgba(13,21,32,0.4) 60%, transparent 100%)',
        }}
      >
        <AnimatePresence mode="wait">
          {selectedCountry ? (
            <motion.div
              key={selectedCountry}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl pointer-events-auto cursor-pointer"
              style={{
                background: 'rgba(18, 28, 42, 0.92)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(108, 132, 232, 0.2)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3), 0 0 12px rgba(108, 132, 232, 0.08)',
              }}
              onClick={() => onSelectCountry(selectedCountry)}
            >
              <span className="text-xl sm:text-2xl">{countryCodeToFlag(selectedCountry)}</span>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">{getCountryName(selectedCountry)}</p>
                <p className="text-[10px] sm:text-xs text-[#6C84E8]">{metadata[selectedCountry]?.channelCount || 0} channels</p>
              </div>
              <div className="ml-1 sm:ml-2 w-2 h-2 rounded-full" style={{ background: '#6C84E8' }}>
                <div className="w-full h-full rounded-full live-pulse" style={{ background: '#6C84E8', boxShadow: '0 0 8px rgba(108,132,232,0.5)' }} />
              </div>
            </motion.div>
          ) : hoveredCountry && availableCountries.has(hoveredCountry) ? (
            <motion.div
              key={hoveredCountry}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl"
              style={{
                background: 'rgba(18, 28, 42, 0.85)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.25)',
              }}
            >
              <span className="text-base sm:text-lg">{countryCodeToFlag(hoveredCountry)}</span>
              <div>
                <p className="text-[10px] sm:text-xs font-semibold text-white">{getCountryName(hoveredCountry)}</p>
                <p className="text-[9px] sm:text-[10px] text-gray-400">Click to explore</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="hint"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl"
              style={{
                background: 'rgba(18, 28, 42, 0.85)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.25)',
              }}
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(108,132,232,0.15)', border: '1px solid rgba(108,132,232,0.25)' }}>
                <span className="text-[8px] sm:text-[10px]">&#127757;</span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400">
                <span className="font-semibold text-white">Drag to rotate</span> &middot; <span className="hidden sm:inline">Click a label to select</span><span className="sm:hidden">Tap to select</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Top badges */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex justify-between gap-2 sm:gap-3 pointer-events-none z-10 safe-top">
        <div className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl" style={{ background: 'rgba(18, 28, 42, 0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>
          <span className="text-xs">{mode === 'tv' ? '&#127909;' : '&#128255;'}</span>
          <span className="text-[9px] sm:text-[10px] font-semibold text-white uppercase tracking-wider">{mode === 'tv' ? 'Television' : 'Radio'}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl" style={{ background: 'rgba(18, 28, 42, 0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4CAF50', boxShadow: '0 0 4px rgba(76,175,80,0.4)' }} />
          <span className="text-[9px] sm:text-[10px] font-semibold text-white tabular-nums">{availableCountries.size} countries</span>
        </div>
      </div>
    </div>
  );
}
