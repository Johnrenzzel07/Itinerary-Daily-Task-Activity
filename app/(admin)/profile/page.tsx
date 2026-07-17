import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/ProfileClient";
import { getProfile } from "@/actions/employee";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  return <ProfileClient profile={profile} />;
}
