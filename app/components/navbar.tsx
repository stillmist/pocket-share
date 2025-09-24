import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function Navbar() {
  return (
    <>
      <nav className="navbar flex items-center justify-between px-10">
        <div className="text-white">Pocket Share</div>

        <div className="flex items-center justify-center gap-2 select-none">
          You
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback>PS</AvatarFallback>
          </Avatar>
        </div>
      </nav>
    </>
  );
}
