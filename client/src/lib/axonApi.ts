export async function postJSON<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`http://localhost:8000${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const AxonAPI = {
  tagPaper: (input: { cid?: string; text?: string; }) =>
    postJSON<{ tags: string[]; topics: string[]; embedding_id: string }>("/tag/paper", input),

  tagReviewer: (input: { wallet: string; profile_text: string; past_titles: string[] }) =>
    postJSON<{ tags: string[]; embedding_id: string }>("/tag/reviewer", input),

  match: (input: { paper_embedding_id: string; paper_tags: string[]; k?: number }) =>
    postJSON<Array<{ wallet: string; score: number; tags: string[]; reputation: number }>>("/match", input),

  assistant: (input: { cid?: string; text?: string; questions?: string[] }) =>
    postJSON<{ sections: Array<{name:string;summary:string}>; red_flags: string[]; answers: Array<{q:string;a:string}> }>("/assistant", input),
};
