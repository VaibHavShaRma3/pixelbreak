import { redirect } from "next/navigation";

// Registration is handled via OAuth — redirect to login
export default function RegisterPage() {
  redirect("/login");
}
