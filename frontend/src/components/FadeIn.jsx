import { Grow } from '@mui/material';

export default function FadeIn({ children, delay = 0 }) {
  return (
    <Grow in timeout={500} style={{ transitionDelay: `${delay}ms` }}>
      <div>{children}</div>
    </Grow>
  );
}
