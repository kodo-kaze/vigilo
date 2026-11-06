import React from "react";
import LiquidGlassCard from "./LiquidGlassCard";
import LiquidGlassButton from "./LiquidGlassButton";

export interface TeamMember {
  name: string;
  username?: string;
  role: string;
  number: string;
}

export interface TeamMemberCardProps {
  member: TeamMember;
  className?: string;
}

/**
 * TeamMemberCard
 *
 * Liquid glass portrait card showcasing team member with custom
 * hexagonal avatar framing, index badge, and GitHub profile button.
 */
export default function TeamMemberCard({
  member,
  className = "",
}: TeamMemberCardProps) {
  return (
    <LiquidGlassCard
      className={`group flex flex-col items-center px-5 py-9 text-center transition duration-500 hover:-translate-y-2 hover:scale-[1.02] ${className}`}
    >
      {/* Hexagonal profile container */}
      <div className="relative mb-7 h-28 w-28 transition duration-500 group-hover:scale-105 select-none">
        {/* Subtle iridescent border ring */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/20 to-white/5"
          style={{
            clipPath:
              "polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0% 50%)",
          }}
        />

        {/* Inner container */}
        <div
          className="absolute inset-[3px] overflow-hidden bg-[#080a0e]"
          style={{
            clipPath:
              "polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0% 50%)",
          }}
        >
          {member.username ? (
            <img
              src={`https://github.com/${member.username}.png?size=300`}
              alt={`${member.name} GitHub profile`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-2xl text-white/30 font-mono">
              {member.number}
            </div>
          )}
        </div>
      </div>

      {/* Identity */}
      <h3 className="text-base font-semibold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
        {member.name}
      </h3>

      <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-white/60 font-mono">
        {member.role}
      </p>

      {/* Profile Link */}
      {member.username ? (
        <LiquidGlassButton
          href={`https://github.com/${member.username}`}
          size="sm"
          external
          title={`@${member.username}`}
          className="mt-7 max-w-full font-mono text-[10px] tracking-wider px-3.5 sm:px-4"
          iconRight={
            <svg
              className="h-3 w-3 shrink-0 text-white/80 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 17L17 7M17 7H7M17 7V17"
              />
            </svg>
          }
        >
          @{member.username}
        </LiquidGlassButton>
      ) : (
        <span className="mt-7 rounded-full border border-white/10 px-4 py-2 text-[10px] font-mono text-white/30">
          GitHub profile
        </span>
      )}
    </LiquidGlassCard>
  );
}
