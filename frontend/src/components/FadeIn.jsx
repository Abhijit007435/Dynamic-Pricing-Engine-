import { Grow } from '@mui/material';

/*
  FadeIn — wrap any element with this to make it grow/fade in on mount.
  Use the "delay" prop to stagger multiple items (e.g. 0, 100, 200ms)
  so a row of cards animates in one after another instead of all at once.

  Usage:
  <FadeIn delay={100}>
    <StatCard ... />
  </FadeIn>
*/
export default function FadeIn({ children, delay = 0 }) {
  return (
    <Grow in timeout={500} style={{ transitionDelay: `${delay}ms` }}>
      <div>{children}</div>
    </Grow>
  );
}
