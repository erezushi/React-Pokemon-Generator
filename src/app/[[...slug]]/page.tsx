import { ClientOnly } from './client';

export function generateStaticParams() {
  return [{ slug: [''] }];
}

const Page = () => {
  return <ClientOnly />;
};

export default Page;
