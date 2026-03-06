import { SignUp } from "@clerk/clerk-react";
import { PageWrapper } from "@/components/layout/PageWrapper";

export default function SignUpPage() {
    return (
        <PageWrapper>
            <div className="flex items-center justify-center min-h-[70vh]">
                <SignUp
                    routing="path"
                    path="/sign-up"
                    signInUrl="/sign-in"
                    fallbackRedirectUrl="/dashboard"
                />
            </div>
        </PageWrapper>
    );
}
