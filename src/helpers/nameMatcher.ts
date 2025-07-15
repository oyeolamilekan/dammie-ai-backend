interface NameMatchResult {
  score: number;
  match: 'exact' | 'high' | 'medium' | 'low' | 'none';
}

export class NameMatcher {
  /**
   * Compare two names and return a similarity score (0-100)
   */
  static compare(name1: string, name2: string): NameMatchResult {
    if (!name1 || !name2) {
      return { score: 0, match: 'none' };
    }

    // Normalize names
    const normalized1 = this.normalize(name1);
    const normalized2 = this.normalize(name2);

    // Check exact match
    if (normalized1 === normalized2) {
      return { score: 100, match: 'exact' };
    }

    // Calculate similarity
    const similarity = this.calculateSimilarity(normalized1, normalized2);
    const score = Math.round(similarity * 100);

    return {
      score,
      match: this.getMatchLevel(score)
    };
  }

  /**
   * Normalize name: lowercase, remove extra spaces, sort words
   */
  private static normalize(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(word => word.length > 0)
      .sort()
      .join(' ');
  }

  /**
   * Calculate similarity using Jaro-Winkler algorithm
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    if (str1.length === 0 || str2.length === 0) return 0.0;

    const matchWindow = Math.floor(Math.max(str1.length, str2.length) / 2) - 1;
    if (matchWindow < 0) return 0.0;

    const str1Matches = new Array(str1.length).fill(false);
    const str2Matches = new Array(str2.length).fill(false);

    let matches = 0;
    let transpositions = 0;

    // Find matches
    for (let i = 0; i < str1.length; i++) {
      const start = Math.max(0, i - matchWindow);
      const end = Math.min(i + matchWindow + 1, str2.length);

      for (let j = start; j < end; j++) {
        if (str2Matches[j] || str1[i] !== str2[j]) continue;
        str1Matches[i] = true;
        str2Matches[j] = true;
        matches++;
        break;
      }
    }

    if (matches === 0) return 0.0;

    // Count transpositions
    let k = 0;
    for (let i = 0; i < str1.length; i++) {
      if (!str1Matches[i]) continue;
      while (!str2Matches[k]) k++;
      if (str1[i] !== str2[k]) transpositions++;
      k++;
    }

    const jaro = (matches / str1.length + matches / str2.length + (matches - transpositions / 2) / matches) / 3;

    // Add prefix bonus (Winkler)
    let prefix = 0;
    for (let i = 0; i < Math.min(str1.length, str2.length, 4); i++) {
      if (str1[i] === str2[i]) prefix++;
      else break;
    }

    return jaro + (0.1 * prefix * (1 - jaro));
  }

  /**
   * Convert score to match level
   */
  private static getMatchLevel(score: number): 'exact' | 'high' | 'medium' | 'low' | 'none' {
    if (score === 100) return 'exact';
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'low';
    return 'none';
  }
}