const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const runAudit = async (
  lat: number, 
  lng: number, 
  userId: string, 
  isSimulation: boolean = false
) => {
  const res = await fetch(`${API_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        lat, 
        lng, 
        userId,
        mode: isSimulation ? 'SIMULATION' : 'MINT'
    }),
  });
  return res.json();
};

export const runGuardian = async (lat: number, lng: number) => {
  const res = await fetch(`${API_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng }),
  });
  return res.json();
};