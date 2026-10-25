import "@/styles/character-approval.css";
import { AVATARS } from "@/data/avatars";
import { CharacterApprovalGallery } from "@/components/rummy/CharacterApprovalGallery";

export default function CharactersPage() {
  return <CharacterApprovalGallery characters={AVATARS} />;
}
