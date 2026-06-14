import { RouterProvider } from 'react-router';
import { MotionConfig } from 'motion/react';
import { router } from './routes';

export default function App() {
  // reducedMotion="user" — prefers-reduced-motion yoqilgan foydalanuvchilarda
  // barcha framer-motion transform/layout animatsiyalari o'chiriladi (opacity qoladi).
  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  );
}
