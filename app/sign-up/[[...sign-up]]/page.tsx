import Bounded from "@/components/ui/bounded";
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <main>
      <Bounded>
        <SignUp afterSignUpUrl="/dashboard" redirectUrl="/dashboard" />
      </Bounded>
    </main>
  );
}
