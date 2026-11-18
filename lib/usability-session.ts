/**
 * Usability test session. The flag lives in this module's memory only: Start on the intro page sets it, and a
 * page refresh (or opening a dashboard link directly) loads the app fresh, so it's false again and the
 * dashboard sends the participant back to the intro to start over from scratch.
 * The participant's name (intro, step 2) lives here too, and is shown as the signed-in user in the dashboard.
 */
const session: { started: boolean; name: string | null } = { started: false, name: null };

export const markStarted = () => {
  session.started = true;
};

export const hasStarted = () => session.started;

export const setParticipantName = (name: string) => {
  session.name = name.trim() || null;
};

export const participantName = () => session.name;

/** The "How do you want to start?" choice shows once per session, on the first landing in the dashboard. */
let choiceSeen = false;
export const startChoiceSeen = () => choiceSeen;
export const markStartChoiceSeen = () => {
  choiceSeen = true;
};
