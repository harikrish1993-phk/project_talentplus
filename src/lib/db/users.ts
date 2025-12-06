export async function getUser() {
  return { id: '1', name: 'Test User', role: 'recruiter' };
}

export async function updateUser(data: any) {
  return { ...data, id: '1' };
}
