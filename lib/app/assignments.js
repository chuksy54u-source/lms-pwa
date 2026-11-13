// PREVIEW ONLY: homework with file upload has no backend yet. These screens read /mocks/assignments.json.
// When the backend adds the endpoints (suggested: GET /assignments, GET /assignments/:id,
// POST /assignments/:id/submissions as multipart with "file"), swap these two functions for apiGet/apiUpload.
export async function loadAssignments() {
  const res = await fetch('/mocks/assignments.json');
  return (await res.json()).data;
}
export async function loadAssignment(id) {
  return (await loadAssignments()).find((a) => a.id === id) || null;
}
export const MAX_UPLOAD_MB = 10;
export const UPLOAD_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'];
