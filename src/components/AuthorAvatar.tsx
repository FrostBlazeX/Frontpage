import { useState } from "react";

type AuthorAvatarProps = {
  name: string;
  backgroundColor?: string;
  faviconUrl?: string;
};

function AuthorAvatar({ name, backgroundColor, faviconUrl }: AuthorAvatarProps) {
  const [faviconFailed, setFaviconFailed] = useState(false);
  const initial = name.charAt(0).toUpperCase();

  if (faviconUrl && !faviconFailed) {
    return (
      <img
        src={faviconUrl}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="w-6 h-6 rounded-sm object-contain bg-bg-tertiary"
        onError={() => setFaviconFailed(true)}
      />
    );
  }

  return (
    <div
      className="w-6 h-6 rounded-sm flex items-center justify-center"
      style={{ backgroundColor: backgroundColor }}
      aria-hidden="true"
    >
      <span className="text-xs font-bold text-white">{initial}</span>
    </div>
  );
}

export default AuthorAvatar;
