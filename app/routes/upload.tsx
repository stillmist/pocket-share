import type { Route } from "./+types/upload";

export async function action({ request }: Route.ActionArgs) {
  let formData = await request.formData();

  console.log(formData);

  return { ok: true };
}
