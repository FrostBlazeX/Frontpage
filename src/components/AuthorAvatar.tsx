type AuthorAvatarProps = {
  name: string;
  backgroundColor?: string;
};

function AuthorAvatar({ name, backgroundColor }: AuthorAvatarProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className="w-6 h-6 rounded-sm flex items-center justify-center"
      style={{ backgroundColor: backgroundColor }}
    >
      <span className="text-lg font-bold text-white">{initial}</span>
    </div>
  );
}

export default AuthorAvatar;
