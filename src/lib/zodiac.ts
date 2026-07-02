const ZODIAC_RANGES = [
  { sign: 'capricorn', from: [12, 22], to: [1, 19] },
  { sign: 'aquarius',  from: [1, 20], to: [2, 18] },
  { sign: 'pisces',    from: [2, 19], to: [3, 20] },
  { sign: 'aries',     from: [3, 21], to: [4, 19] },
  { sign: 'taurus',    from: [4, 20], to: [5, 20] },
  { sign: 'gemini',    from: [5, 21], to: [6, 20] },
  { sign: 'cancer',    from: [6, 21], to: [7, 22] },
  { sign: 'leo',       from: [7, 23], to: [8, 22] },
  { sign: 'virgo',     from: [8, 23], to: [9, 22] },
  { sign: 'libra',     from: [9, 23], to: [10, 22] },
  { sign: 'scorpio',   from: [10, 23], to: [11, 21] },
  { sign: 'sagittarius', from: [11, 22], to: [12, 21] },
];

export function getZodiacSign(month: number, day: number): string {
  for (const z of ZODIAC_RANGES) {
    const [fm, fd] = z.from, [tm, td] = z.to;
    if (fm === tm ? (month === fm && day >= fd && day <= td)
      : ((month === fm && day >= fd) || (month === tm && day <= td))) {
      return z.sign;
    }
  }
  return 'capricorn';
}
