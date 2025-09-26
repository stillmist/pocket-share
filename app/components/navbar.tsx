import { LogOut } from "lucide-react";
import { Form } from "react-router";
import { Button } from "./ui/button";

export default function Navbar() {
  return (
    <>
      <nav className="navbar flex items-center justify-between px-10">
        <div className="text-white text-lg font-bold font-sans">
          Pocket Share
        </div>

        <div className="flex items-center justify-center gap-2 select-none">
          <Form action="/logout" method="post" className="w-full">
            <Button type="submit" size={"sm"} className="w-full cursor-pointer">
              Logout
              <LogOut />
            </Button>
          </Form>
        </div>
      </nav>
    </>
  );
}
