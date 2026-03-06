import { SignIn } from "@clerk/clerk-react";
import { PageWrapper } from "@/components/layout/PageWrapper";

export default function SignInPage() {
    return (
        <PageWrapper>
            <div className="flex items-center justify-center min-h-[70vh]">
                <SignIn
                    routing="path"
                    path="/sign-in"
                    signUpUrl="/sign-up"
                    fallbackRedirectUrl="/dashboard"
                />
            </div>
        </PageWrapper>
    );
}
