import type { ComponentProps } from 'react';
import { Link, useNavigate, useParams, type NavigateOptions } from 'react-router';

export function useLangNavigate() {
  const navigate = useNavigate();
  const { lang = 'en' } = useParams<{ lang: string }>();

  return (to: string, options?: NavigateOptions) => {
    const prefixed = to.startsWith('/') ? `/${lang}${to}` : to;
    navigate(prefixed, options);
  };
}

export function LangLink({ to, ...props }: ComponentProps<typeof Link>) {
  const { lang = 'en' } = useParams<{ lang: string }>();
  const prefixedTo = typeof to === 'string' && to.startsWith('/') ? `/${lang}${to}` : to;
  return <Link to={prefixedTo} {...props} />;
}
