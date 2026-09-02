// Requires a real HTTP Basic Auth password (a native browser login prompt)
// before Netlify will serve anything under /members/*. The password lives
// in a Netlify environment variable (MEMBERS_PASSWORD) — never commit it
// to the repo. The username can be anything; only the password is checked.
export default async (request, context) => {
  const expected = Deno.env.get("MEMBERS_PASSWORD");

  // Fail closed: if no password has been configured yet, block access
  // entirely rather than accidentally leaving the page open to everyone.
  if (!expected) {
    return new Response(
      "Members Contacts isn't set up yet — an admin needs to set the MEMBERS_PASSWORD environment variable in Netlify.",
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Basic ")) {
    try {
      const decoded = atob(authHeader.slice(6));
      const separatorIndex = decoded.indexOf(":");
      const password = decoded.slice(separatorIndex + 1);
      if (password === expected) {
        return context.next();
      }
    } catch (err) {
      // Malformed header — fall through to the 401 challenge below.
    }
  }

  return new Response("Restricted — members only.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="CVSA Members Contacts"' },
  });
};
