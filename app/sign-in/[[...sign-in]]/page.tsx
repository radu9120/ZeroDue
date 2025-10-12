import Bounded from "@/components/ui/bounded";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main>
      <Bounded>
        <SignIn afterSignInUrl="/dashboard" redirectUrl="/dashboard" />
      </Bounded>
    </main>
  );
}
