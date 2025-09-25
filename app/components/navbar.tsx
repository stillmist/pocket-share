import { useFetcher } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Navbar() {
  return (
    <>
      <nav className="navbar flex items-center justify-between px-10">
        <div className="text-white">Pocket Share</div>

        <div className="flex items-center justify-center gap-2 select-none me-10">
          <p className="text-xl font-semibold">You</p>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback>PS</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <LogoutForm />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </>
  );
}

function LogoutForm() {
  const fetcher = useFetcher();

  return (
    <>
      <fetcher.Form action="/logout" method="post" className="w-full">
        <Button type="submit" variant={"ghost"} size={"sm"} className="w-full">
          Logout
        </Button>
      </fetcher.Form>
    </>
  );
}
