import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verificarToken } from "@/lib/auth";

export default async function Home() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("leadflow_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const usuario =
    await verificarToken(token);

  if (!usuario) {
    redirect("/login");
  }

  redirect("/dashboard");
}