import { HotspotData } from '../types.ts';

export const CHARMINAR_HOTSPOTS: HotspotData[] = [
  {
    id: 'grand_arches',
    title: 'The Four Grand Arches',
    subtitle: 'Char Kaman Cardinal Gateways (1591 CE)',
    category: 'Architecture',
    position: [0, 0.16, 0.22],
    dimensionsOrYear: 'Span: 11 meters | Height: 20 meters',
    description:
      'The four majestic pointed arches face the four cardinal directions, opening directly toward historical royal streets that led to the Golconda fortress, Machilipatnam port, and royal palaces. Built with granite and lime mortar, the arches showcase graceful Persian and Deccan Islamic geometry.',
    audioNarration:
      'Welcome to the Four Grand Arches of Charminar. Built in 1591 by Sultan Muhammad Quli Qutb Shah, these monumental arches span eleven meters across and rise twenty meters high. They served as the central focal point of Hyderabad’s city grid, greeting merchants, diplomats, and travelers from around the ancient world.',
    architecturalDetails: [
      'Pointed Persian ogee arches with stylized floral spandrels',
      'Stucco arabesques and ornamental lotus medallions',
      'Structural core made of solid granite blocks and lime mortar',
      'Double-arched gallery passageways on the upper floor',
    ],
  },
  {
    id: 'minarets',
    title: 'The Four Towering Minarets',
    subtitle: 'Graceful 48.7-meter Stone Spires',
    category: 'Architecture',
    position: [0.19, 0.45, 0.19],
    dimensionsOrYear: 'Height: 48.7 m (160 ft) | 149 Spiral Steps',
    description:
      'Charminar derives its name ("Four Minarets") from these four iconic towers anchored at each corner. Each minaret rises four storeys high, delineated by intricately carved stucco rings and cantilevered balconies with jali balustrades, crowned with a bulbous fluted dome and brass finial.',
    audioNarration:
      'You are looking at one of the four towering minarets that give Charminar its name. Rising nearly forty-nine meters into the Hyderabad sky, each minaret features four gracefully carved balconies supported by ornamental corbels. Inside, a flight of 149 winding spiral steps leads to the breathtaking upper panoramic galleries.',
    architecturalDetails: [
      'Four multi-tier balconies with delicate stucco openwork',
      'Fluted bulbous dome with stylized petal corbelling',
      'Gilded finials reflecting morning and evening light',
      'Internal spiral masonry staircase built for panoramic watch and acoustics',
    ],
  },
  {
    id: 'upper_mosque',
    title: 'The Upper Mosque & Prayer Hall',
    subtitle: 'Hyderabad’s Oldest Surviving Mosque',
    category: 'History',
    position: [-0.08, 0.28, 0],
    dimensionsOrYear: '45 Prayer Spaces (Western Wing)',
    description:
      'The western half of the open roof terrace accommodates an exquisite mosque, the oldest in Hyderabad. It contains 45 prayer spaces (musallahs) oriented toward Mecca, fronted by an open courtyard and surrounded by decorative stone battlements and minaret lanterns.',
    audioNarration:
      'Perched upon the upper level of the monument is Hyderabad’s oldest surviving mosque. Facing west toward Mecca, this peaceful sanctuary provided prayer spaces for royal courtiers and guards during Sultanate times, sheltered by beautiful cusped arches and a tranquil open-air courtyard overlooking the bustling city below.',
    architecturalDetails: [
      '45 distinct prayer bays delineated on the stone floor',
      'Ornate western mihrab wall with Persian Quranic inscriptions',
      'Crenellated parapet with decorative miniature domed pavilions',
      'Acoustic design allowing prayer calls to reverberate across the square',
    ],
  },
  {
    id: 'vazu_fountain',
    title: 'Central Fountain & Reservoir',
    subtitle: 'The Ablution Basin (Vazu Tank)',
    category: 'Culture',
    position: [0, 0.04, 0],
    dimensionsOrYear: 'Hexagonal Marble Hauz (Central Floor)',
    description:
      'Directly beneath the central dome at ground level sits a historic octagonal fountain and water reservoir. Historically fed by underground water pipes from the Mir Alam tank and Musi river, it provided ritual ablution water before prayer and cooled the surrounding air.',
    audioNarration:
      'At the geometric heart of Charminar lies the central stone fountain and ablution tank. In the sixteenth century, ingenious gravity-fed clay pipes brought fresh water here from nearby reservoirs. It cooled the hot Deccan breeze and offered weary travelers and worshippers pure water to refresh themselves.',
    architecturalDetails: [
      'Carved octagonal stone basin with stepped seating',
      'Gravity hydraulic feed channels engineered under the Deccan Sultanate',
      'Natural passive thermal cooling channel beneath the grand arches',
      'Mirrors the sky and central dome ceiling above',
    ],
  },
  {
    id: 'historic_clocks',
    title: 'The Four Historic Clocks',
    subtitle: 'Installed by the 6th Nizam (1889)',
    category: 'History',
    position: [0, 0.24, 0.21],
    dimensionsOrYear: 'Added in 1889 CE | Mir Mahboob Ali Khan',
    description:
      'In 1889, Mir Mahboob Ali Khan, the sixth Nizam of Hyderabad, imported four monumental mechanical clocks from London and had them installed in the four cardinal gables of Charminar, adding a Victorian horological element to the Islamic monument.',
    audioNarration:
      'High above the main archways, notice the grand clock face. These four monumental clocks were added three centuries after Charminar was built, in 1889, by the sixth Nizam of Hyderabad. Imported from London, their melodious bells kept time for the entire Old City for over a hundred years.',
    architecturalDetails: [
      'Mechanical escapement movement engineered in England in 1889',
      'Roman numeral dials visible from the four approach avenues',
      'Seamlessly integrated into the Qutb Shahi stucco crests',
      'Maintained by specialized horologists across the Asaf Jahi era',
    ],
  },
  {
    id: 'laad_bazaar',
    title: 'Laad Bazaar & Cultural Surrounds',
    subtitle: 'Historic Bangle & Pearl Merchant Quarter',
    category: 'Culture',
    position: [0.24, 0.02, 0],
    dimensionsOrYear: 'Over 400 Years of Living Cultural Heritage',
    description:
      'Directly surrounding Charminar is the famous Laad Bazaar (Chudi Bazaar), renowned for handmade lacquer bangles, Hyderabadi natural Basra pearls, traditional attar perfumes, and zardozi embroidery. Charminar remains the vibrant cultural nucleus of Old Hyderabad.',
    audioNarration:
      'Radiating outward from Charminar are the bustling lanes of Laad Bazaar, the legendary market of pearls and lacquer bangles. Established in the late sixteenth century, this marketplace is alive with the chime of glass bangles, the fragrance of jasmine and attar, and the warmth of Hyderabadi hospitality.',
    architecturalDetails: [
      'Historic pedestrian avenues lined with wooden merchant balconies',
      'Four monumental gateways known as Char Kaman framing the district',
      'UNESCO Tentative World Heritage Site precinct',
      'Traditional stone colonnade bazaars preserved since the 16th century',
    ],
  },
];
