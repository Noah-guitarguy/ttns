import skillToOccupation from "../../public/data/skillToOccupation.json";
import type { CareerMatch } from "../types/outcomes";

interface OccupationRecord {
  code: string;
  title: string;
  skills: string[];
}

const occupations = skillToOccupation as OccupationRecord[];
const MAX_MATCHES = 10;

function normalizeSkill(skill: string): string {
  return skill.trim().toLocaleLowerCase();
}

export function findCareerMatches(skills: string[]): CareerMatch[] {
  const selectedSkills = new Set(skills.map(normalizeSkill));

  if (selectedSkills.size === 0) {
    return [];
  }

  return occupations
    .map((occupation) => {
      const rationale = occupation.skills.filter((skill) =>
        selectedSkills.has(normalizeSkill(skill)),
      );

      return {
        careerId: occupation.code,
        careerTitle: occupation.title,
        score: Number((rationale.length / selectedSkills.size).toFixed(4)),
        rationale,
      };
    })
    .filter((match) => match.rationale.length > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.rationale.length - a.rationale.length ||
        a.careerTitle.localeCompare(b.careerTitle),
    )
    .slice(0, MAX_MATCHES);
}
