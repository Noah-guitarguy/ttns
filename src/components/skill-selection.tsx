//Things to work on 
//Buttons don't select 
"use client";

import { useState } from "react";
import skillsData from "../../public/data/skills.json";
// This component allows users to select skills from a predefined list, with search.
export function UserSkillSelection() {
  const [skills] = useState<string[]>(skillsData as string[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [matches, setMatches] = useState<
    Array<{ careerId: string; careerTitle?: string; score: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredSkills = skills.filter((skill) =>
    skill.toLowerCase().includes(searchQuery.toLowerCase())
  );
// Function to toggle skill selection 
  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const findMatches = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: selectedSkills }),
      });
      const body: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof body === "object" &&
          body !== null &&
          "error" in body &&
          typeof body.error === "string"
            ? body.error
            : "Career matches could not be loaded.";
        throw new Error(message);
      }

      if (
        typeof body !== "object" ||
        body === null ||
        !("matches" in body) ||
        !Array.isArray(body.matches)
      ) {
        throw new Error("The matching service returned an invalid response.");
      }

      setMatches(body.matches);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Career matches could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">User Skill Selection</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select your skills from the list below or use search.
        </p>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search skills (e.g., Numeracy, Digital Literacy)..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 border rounded-md bg-background text-foreground"
      />

      {/* Skills Selection Grid (Padding matches gap-3 for balanced spacing) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-3 border rounded-md max-h-[19rem] overflow-y-auto">
        {filteredSkills.map((skill) => {
          const isSelected = selectedSkills.includes(skill);
          return (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className={`p-3 text-left rounded-lg border transition-all text-sm font-medium ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-card-foreground hover:border-muted-foreground"
              }`}
            >
              {skill}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={findMatches}
        disabled={isLoading || selectedSkills.length === 0}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
      >
        {isLoading ? "Finding matches..." : "Find career matches"}
      </button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {matches.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Career matches</h3>
          <ol className="list-decimal pl-5 space-y-1">
            {matches.map((match) => (
              <li key={match.careerId}>
                {match.careerTitle ?? match.careerId} (
                {Math.round(match.score * 100)}% match)
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Selected Summary */}
      <div className="p-4 bg-muted rounded-lg">
        <h3 className="font-semibold text-sm">
          Selected Skills ({selectedSkills.length}):
        </h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedSkills.length === 0 ? (
            <span className="text-xs text-muted-foreground">
              None selected yet.
            </span>
          ) : (
            selectedSkills.map((s) => (
              <span
                key={s}
                className="px-2.5 py-1 text-xs bg-background border rounded-full shadow-sm"
              >
                {s}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}