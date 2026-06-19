import { Metadata } from 'next';
import './global.css';
import { ApolloProvider } from './provider/ApolloProvider';

export const metadata: Metadata = {
  title: 'Welcome to todo-web',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ApolloProvider>{children}</ApolloProvider>
      </body>
    </html>
  );
}
