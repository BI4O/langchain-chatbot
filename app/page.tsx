import { Suspense } from "react";
import Chat from "./components/Chat";
import { StreamProvider } from "./provider/Stream";
import { ThreadProvider } from "./provider/Thread";
import { Toaster } from "sonner";
import RedirectWithParams from "./components/RedirectWithParams";

// Home component that passes environment variables as props
function HomeClient() {
  return (
    <>
      <RedirectWithParams />
      <ThreadProvider>
        <StreamProvider>
          <Chat />
        </StreamProvider>
      </ThreadProvider>
      <Toaster />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeClient />
    </Suspense>
  );
}
