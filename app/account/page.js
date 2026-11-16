import { redirect } from "next/navigation";
import { getSessionUser } from "../../lib/auth";
import AccountForm from "../components/AccountForm";
import AccountSidebar from "../components/AccountSidebar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profile \u2014 PeopTrust Engineering Group",
};

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const isEmployer = user.role === "employer";

  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow">My account</p>
        <h1>Profile</h1>

        <div className="account-grid">
          <AccountSidebar user={user} active="profile" />

          <div className="form-card">
            <h2>{isEmployer ? "Company profile" : "Your profile"}</h2>
            <p className="account-form-sub">
              {isEmployer
                ? "These details appear to professionals who view your roles."
                : "These details appear to employers who view your applications."}
            </p>
            <AccountForm user={user} />
          </div>
        </div>
      </div>
    </section>
  );
}
