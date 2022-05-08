import { useEffect, useState } from "react";

export default function App() {
  const isClient = useIsClient();

  return (
    <html>
      <head></head>
      <body>
        <div>sup bitches</div>
        {isClient && <div>We hydratin</div>}
        <script src="/client.js" />
      </body>
    </html>
  );
}

let hydrated = false;

function useIsClient() {
  const [isClient, setIsClient] = useState(hydrated);
  useEffect(() => {
    if (!isClient) {
      hydrated = true;
      setIsClient(true);
    }
  }, []);

  return isClient;
}
