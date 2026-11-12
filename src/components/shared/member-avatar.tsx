import { cn, initials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { avatarTone } from "@/lib/members";
import type { User } from "@/types";

export function MemberAvatar({
  user,
  className,
  showRing = false,
}: {
  user: Pick<User, "id" | "name">;
  className?: string;
  showRing?: boolean;
}) {
  return (
    <Avatar className={cn("border-background", showRing && "ring-2 ring-background", className)}>
      <AvatarFallback className={avatarTone(user.id)}>
        {initials(user.name)}
      </AvatarFallback>
    </Avatar>
  );
}

export function AvatarGroup({
  users,
  max = 4,
  size = "size-6",
  className,
}: {
  users: Pick<User, "id" | "name">[];
  max?: number;
  size?: string;
  className?: string;
}) {
  const visible = users.slice(0, max);
  const extra = users.length - visible.length;
  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex -space-x-1.5">
        {visible.map((user) => (
          <MemberAvatar key={user.id} user={user} className={size} showRing />
        ))}
      </div>
      {extra > 0 && (
        <span
          className={cn(
            "-ml-1.5 flex items-center justify-center rounded-full border border-border bg-secondary font-mono text-[9px] text-muted-foreground",
            size
          )}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
