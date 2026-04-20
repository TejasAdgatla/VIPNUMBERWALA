export const chaldeanMap: Record<string, number> = {
  a: 1, i: 1, j: 1, q: 1, y: 1,
  b: 2, k: 2, r: 2,
  c: 3, g: 3, l: 3, s: 3,
  d: 4, m: 4, t: 4,
  e: 5, h: 5, n: 5, x: 5,
  u: 6, v: 6, w: 6,
  o: 7, z: 7,
  f: 8, p: 8
};

export function calculateNameNumber(name: string): { total: number, reduced: number } {
  let total = 0;
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  
  for (const char of cleanName) {
    if (chaldeanMap[char]) {
      total += chaldeanMap[char];
    }
  }

  return {
    total,
    reduced: reduceToSingleDigit(total)
  };
}

export function calculateDOBNumber(dobString: string): { total: number, reduced: number } {
    let total = 0;
    const cleanDob = dobString.replace(/[^0-9]/g, '');
    for(const char of cleanDob) {
        total += parseInt(char, 10);
    }
    return {
        total,
        reduced: reduceToSingleDigit(total)
    };
}

function reduceToSingleDigit(num: number): number {
  if (num === 0) return 0;
  // In numerology, master numbers (11, 22, 33) are sometimes not reduced
  // But standard Chaldean reduces until a single digit, let's just do single digit for now
  let n = num;
  while (n > 9) {
    let sum = 0;
    let temp = n;
    while (temp > 0) {
      sum += temp % 10;
      temp = Math.floor(temp / 10);
    }
    n = sum;
  }
  return n;
}

export const getNumberMeaning = (num: number): string => {
    const meanings: Record<number, string> = {
        1: "Leadership, independence, and strong will. Associated with the Sun.",
        2: "Partnership, diplomacy, and sensitivity. Associated with the Moon.",
        3: "Creativity, self-expression, and optimism. Associated with Jupiter.",
        4: "Stability, structure, and hard work. Associated with Uranus/Rahu.",
        5: "Freedom, adaptability, and dynamic energy. Associated with Mercury.",
        6: "Harmony, responsibility, and love. Associated with Venus.",
        7: "Spirituality, analysis, and inner wisdom. Associated with Neptune/Ketu.",
        8: "Power, ambition, and material success. Associated with Saturn.",
        9: "Humanitarianism, completion, and universal love. Associated with Mars.",
    };
    return meanings[num] || "A mysterious vibration with hidden depths.";
}
