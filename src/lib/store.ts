import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'status.json');

export interface StatusData {
  currentStatus: string;
  professorMessage: string;
  returnTime: string | null;
  mascot: string; // 'fox' | 'cat' | 'dog' | 'robot'
  weatherOverride?: string | null; // 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy' | null
  calendarUrl?: string | null; // Added for Google Calendar integration
  emailSettings?: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    receiverEmail: string;
    baseUrl: string; // e.g. http://192.168.0.10:3000
    secure?: boolean;
  };
  messages: Array<{
    id: string;
    studentName: string;
    content: string;
    timestamp: string;
  }>;
}

export async function getStatus(): Promise<StatusData> {
  let parsed: StatusData;
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    parsed = JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return default
    parsed = {
      currentStatus: 'In Office',
      professorMessage: '',
      returnTime: null,
      messages: [],
      mascot: 'fox',
      weatherOverride: null,
      calendarUrl: null,
      emailSettings: {
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPass: '',
        receiverEmail: '',
        baseUrl: 'http://localhost:3000',
        secure: false
      }
    };

    // Auto-create the file if it doesn't exist
    try {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    } catch (writeError) {
      console.error('Failed to create initial status.json:', writeError);
    }
  }

  // Ensure fields exist for backward compatibility
  // ... (rest of the logic remains, or can be simplified if we start fresh)
  // For safety, we keep the checks:
  if (!parsed.mascot) parsed.mascot = 'fox';
  if (parsed.weatherOverride === undefined) parsed.weatherOverride = null;
  if (parsed.calendarUrl === undefined) parsed.calendarUrl = null;
  if (!parsed.emailSettings) {
    parsed.emailSettings = {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPass: '',
      receiverEmail: '',
      baseUrl: 'http://localhost:3000',
      secure: false
    };
  }

  return parsed;
}

export async function updateStatus(newData: Partial<StatusData>): Promise<StatusData> {
  const current = await getStatus();
  const updated = { ...current, ...newData };
  await fs.writeFile(DATA_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}

export async function addMessage(message: { studentName: string; content: string }) {
  const current = await getStatus();
  const newMessage = {
    id: Date.now().toString(),
    studentName: message.studentName,
    content: message.content,
    timestamp: new Date().toISOString()
  };
  current.messages.push(newMessage);
  await fs.writeFile(DATA_FILE, JSON.stringify(current, null, 2), 'utf-8');
  return newMessage;
}
