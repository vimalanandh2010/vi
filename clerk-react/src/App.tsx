import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import './App.css'

function App() {
  return (
    <header>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <h1>Clerk Auth Prototype</h1>
      <p>This is a test of Clerk Authentication.</p>
    </header>
  )
}

export default App;
