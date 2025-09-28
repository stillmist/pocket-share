import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Pocket Share" }, { name: "description", content: "Home" }];
}

export default function Home() {
  return <main>Home</main>;
}
