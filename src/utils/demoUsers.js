// The MVP has no backend yet, so authentication runs against these demo accounts.
export const DEMO_USERS = [
  {
    id: 'u-analyst',
    name: 'Avery Analyst',
    email: 'analyst@patchpulse.dev',
    password: 'patchpulse',
    role: 'analyst',
  },
  {
    id: 'u-analyst-2',
    name: 'Sam Rivera',
    email: 'sam@patchpulse.dev',
    password: 'patchpulse',
    role: 'analyst',
  },
  {
    id: 'u-admin',
    name: 'Jordan Admin',
    email: 'admin@patchpulse.dev',
    password: 'patchpulse',
    role: 'admin',
  },
];

export function findDemoUser(email, password) {
  const user = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
  );
  if (!user) return null;
  const { password: _password, ...publicUser } = user;
  return publicUser;
}

export const TEAM_MEMBERS = DEMO_USERS.map(({ id, name, email, role }) => ({ id, name, email, role }));
