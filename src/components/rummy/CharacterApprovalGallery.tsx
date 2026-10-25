"use client";

import { useState } from "react";
import type { AvatarOption } from "@/types/rummy";
import Link from "next/link";

type Props = { characters: AvatarOption[] };
type Review = "pending" | "approved" | "changes";
function CharacterPose({ src, fallback, name, pose }: { src: string; fallback: string; name: string; pose: string }) {
  const [missing, setMissing] = useState(false);
  return <div className="approval-pose">
    <div className="approval-pose-head"><span>{pose}</span><strong className={missing ? "pending" : "ready"}>{missing ? "Original image — replacement needed" : "New pose file available"}</strong></div>
    <div className="approval-art">
      {/* Missing new artwork is visibly identified, never falsely shown as approved. */}
      <img key={src} src={missing ? fallback : src} alt={name + " — " + pose} onError={() => setMissing(true)} />
    </div>
    <div className="approval-filename">{src}</div>
  </div>;
}
export function CharacterApprovalGallery({ characters }: Props) {
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [filter, setFilter] = useState("all");
  const visible = characters.filter(character => filter === "all" || (reviews[character.id] ?? "pending") === filter);
  const changeReview = (id: string, review: Review) => setReviews(prev => ({ ...prev, [id]: review }));
  return <main className="approval-gallery">
    <header className="approval-header">
      <div><p className="approval-eyebrow">500 RUMMY / CHARACTER ART</p><h1>Character Approval Gallery</h1><p>Review every character in both required formats. Images with missing transparent replacements show the original artwork and are clearly labeled. Reviews here are local to this browser session and do not modify GitHub.</p></div>
      <Link href="/">Back to game</Link>
    </header>
    <div className="approval-toolbar"><span>{characters.length} characters · {characters.length * 2} required poses</span>
      <label>Review filter <select value={filter} onChange={event => setFilter(event.target.value)}><option value="all">All</option><option value="pending">Pending review</option><option value="approved">Marked approved</option><option value="changes">Needs changes</option></select></label>
    </div>
    <div className="approval-grid">{visible.map(character => <article className="approval-character" key={character.id}>
      <div className="approval-character-title"><h2>{character.name}</h2><span>{character.role}</span></div>
      <div className="approval-pair">
        <CharacterPose key={character.id + "-full"} src={character.image} fallback={character.legacyImage} name={character.name} pose="Full-body / selection" />
        <CharacterPose key={character.id + "-table"} src={character.tableImage} fallback={character.legacyImage} name={character.name} pose="Arms-crossed / at table" />
      </div>
      <div className="approval-actions"><span>Visual review: <b>{reviews[character.id] ?? "pending"}</b></span><button onClick={() => changeReview(character.id, "approved")}>Mark approved</button><button onClick={() => changeReview(character.id, "changes")}>Needs changes</button><button onClick={() => changeReview(character.id, "pending")}>Reset</button></div>
    </article>)}</div>
    {visible.length === 0 && <p>No characters match this filter.</p>}
  </main>;
}
