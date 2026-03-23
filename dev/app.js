const publishableKey = 'CLERK_PUBLISHABLE_KEY';

// Derive the Clerk frontend API domain from the publishable key
const clerkDomain = atob(publishableKey.split('_')[2]).slice(0, -1);

function loadScript(src, attributes = {}) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');

    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.type = 'text/javascript';

    Object.entries(attributes).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

    document.head.appendChild(script);
  });
}

async function loadClerk() {
  try {
    await loadScript(`https://${clerkDomain}/npm/@clerk/clerk-js@5/dist/clerk.browser.js`, {
      'data-clerk-publishable-key': publishableKey,
    });

    await loadScript(`https://${clerkDomain}/npm/@clerk/ui@1/dist/ui.browser.js`);

    await Clerk.load({
      ui: { ClerkUI: window.__internal_ClerkUICtor },
    });

    const app = document.getElementById('app');

    if (!app) {
      return;
    }

    if (Clerk.isSignedIn) {
      app.innerHTML = `
        <div id="user-button"></div>
      `;

      const userButtonDiv = document.getElementById('user-button');

      Clerk.mountUserButton(userButtonDiv);
    } else {
      app.innerHTML = `
        <div id="sign-in"></div>
      `;

      const signInDiv = document.getElementById('sign-in');

      Clerk.mountSignIn(signInDiv);
    }
  } catch (error) {
    console.error(error);
  }
}

loadClerk();
