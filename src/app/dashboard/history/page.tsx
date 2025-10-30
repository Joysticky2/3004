'use client';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

export default function History() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(()=>{ (async()=>{
    const { data } = await supabase.from('content_drafts').select('*').order('created_at', { ascending: false });
    setRows(data ?? []);
  })(); }, []);
  const duplicate = async (id:string) => {
    const src = rows.find(r=>r.draft_id===id);
    if (!src) return;
    await supabase.from('content_drafts').insert({
      user_id: src.user_id, content_type: src.content_type, content_text: src.content_text
    });
    location.reload();
  };
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-3">
      {rows.map(r=>(
        <div key={r.draft_id} className="border p-3 rounded">
          <div className="text-sm text-gray-500">{r.content_type} · {new Date(r.created_at).toLocaleString()}</div>
          <p className="line-clamp-2">{r.content_text}</p>
          <div className="space-x-2 mt-2">
            <a className="btn" href={`/dashboard/editor/${r.draft_id}`}>Open</a>
            <button className="btn" onClick={()=>duplicate(r.draft_id)}>Duplicate</button>
          </div>
        </div>
      ))}
    </div>
  );
}
