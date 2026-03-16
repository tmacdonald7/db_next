export type MemberDisplayRecord = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  avatar_label: string | null;
  avatar_theme: "default" | "investor";
  is_hidden_from_band: boolean;
};

export function getMemberAvatarLabel(member: Pick<MemberDisplayRecord, "display_name" | "avatar_label">) {
  const override = member.avatar_label?.trim();

  if (override) {
    return override.slice(0, 2).toUpperCase();
  }

  return member.display_name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function canViewerSeeMemberAvatar(
  member: Pick<MemberDisplayRecord, "id" | "is_hidden_from_band">,
  viewerMemberId: string | null,
  canSeePrivateMembers: boolean,
) {
  return !member.is_hidden_from_band || member.id === viewerMemberId || canSeePrivateMembers;
}
