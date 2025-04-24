import type { Metadata } from "next";
import ActionMenu from "@/app/components/ActionMenu";
import "../globals.css";
import ThemeProviderWrapper from "../components/ThemeProviderWrapper";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ProfileProvider } from "@/context/ProfileContext";
import { DialogProvider } from "@/context/DialogContext";

export const metadata: Metadata = {
  title: "Grupo lamosa",
  description: "Grupo lamosa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppRouterCacheProvider>
      <ThemeProviderWrapper>
        <ProfileProvider>
          <DialogProvider>
            <>
              <ActionMenu />
              {children}
            </>
          </DialogProvider>
        </ProfileProvider>
      </ThemeProviderWrapper>
    </AppRouterCacheProvider>
  );
}
