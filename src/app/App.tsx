import type { ReactNode } from 'react';
import { RouterProvider, type createBrowserRouter } from 'react-router';
import { MotionConfig } from 'motion/react';

/** Brauzer va server (entry-server.tsx) uchun umumiy o'ram. */
export function AppShell({ children }: { children: ReactNode }) {
  // reducedMotion="user" — prefers-reduced-motion yoqilgan foydalanuvchilarda
  // barcha framer-motion transform/layout animatsiyalari o'chiriladi (opacity qoladi).
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export default function App({ router }: { router: ReturnType<typeof createBrowserRouter> }) {
  return (
    <AppShell>
      <RouterProvider router={router} />
    </AppShell>
  );
}
