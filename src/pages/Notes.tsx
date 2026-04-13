import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Note } from '../types';
import { Search, Plus, Bell, Calendar, Pin } from 'lucide-react';
import { format } from 'date-fns';

export default function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
      setNotes(notesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    try {
      await addDoc(collection(db, 'notes'), {
        content: newNote,
        created_by: 'local',
        created_at: new Date().toISOString(),
        is_pinned: false
      });
      setNewNote('');
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif text-primary">Notes</h2>
      </div>

      <div className="card space-y-4">
        <div className="text-xs font-bold text-primary-light/60 uppercase tracking-widest flex items-center justify-between">
          <span>{format(new Date(), 'dd/MM/yyyy HH:mm')}</span>
        </div>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write your note here..."
          className="w-full bg-transparent border-none focus:ring-0 text-primary-dark font-medium resize-none min-h-[120px]"
        />
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-primary text-primary rounded-2xl font-bold text-sm hover:bg-primary/5 transition-colors">
            <Bell size={18} /> Add Reminder
          </button>
        </div>
        <button 
          onClick={handleSaveNote}
          disabled={!newNote.trim()}
          className="w-full btn-primary py-4 shadow-lg shadow-primary/20"
        >
          Save Note
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-light/40" size={20} />
        <input 
          type="text" 
          placeholder="Search notes..." 
          className="input-field pl-12"
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          [1, 2].map(i => <div key={i} className="h-32 bg-accent/20 rounded-3xl animate-pulse" />)
        ) : notes.length === 0 ? (
          <div className="text-center py-12 text-primary-light/60 italic">
            Your notes list is empty. Add a note to get started!
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="card space-y-3 relative">
              {note.is_pinned && <Pin size={16} className="absolute top-4 right-4 text-primary" />}
              <div className="flex items-center gap-2 text-[10px] font-bold text-primary-light/60 uppercase tracking-widest">
                <Calendar size={12} />
                {format(new Date(note.created_at), 'dd/MM/yyyy HH:mm')}
              </div>
              <p className="text-primary-dark font-medium whitespace-pre-wrap">{note.content}</p>
              {note.reminder_at && (
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit">
                  <Bell size={14} />
                  Reminder: {format(new Date(note.reminder_at), 'dd/MM/yyyy HH:mm')}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
