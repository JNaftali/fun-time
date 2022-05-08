import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

export default function App() {
  const isClient = useIsClient();

  return (
    <html>
      <head></head>
      <body>
        <Routes>
          <Route path="/" element={<div>home</div>} />
          <Route path="butts" element={<div>hehe butts</div>} />
        </Routes>
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
