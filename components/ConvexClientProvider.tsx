"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient, Authenticated } from "convex/react";
import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function UserSync() {
  const { isSignedIn } = useAuth();
  const storeUser = useMutation(api.users.store);
  
  useEffect(() => {
    if (isSignedIn) {
      storeUser().catch(console.error);
    }
  }, [isSignedIn, storeUser]);

  return null;
}

export default function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <UserSync />
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
