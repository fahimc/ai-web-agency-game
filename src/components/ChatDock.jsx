import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { needsChat } from '../utils/text.js';

export function ChatDock({ state, onSubmit }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  const show = needsChat(state);
  const hint = {
    name: 'Enter your name',
    choice: 'New or returning customer',
    returning_email: 'Enter saved email',
    project_choice: 'Choose a project',
    email: 'Enter your email',
    new_email: 'Enter your email',
    approval: 'Type approve or describe changes',
    error: 'Press Resume to try again',
  }[state.phase] || 'Reply to continue';

  useEffect(() => {
    if (show) window.setTimeout(() => inputRef.current?.focus(), 120);
  }, [show, state.phase]);

  function submit(event) {
    event.preventDefault();
    onSubmit(value);
    setValue('');
  }

  useEffect(() => {
    if (state.phase === 'project_choice') setValue(state.availableProjects?.[0]?.projectId || '__new__');
  }, [state.availableProjects, state.phase]);

  return (
    <form className={`chat-dock ${show ? 'show' : ''}`} autoComplete="off" onSubmit={submit}>
      <div className="chat-top"><span><b>{state.phase === 'approval' ? 'Preview approval' : state.phase === 'error' ? 'Resume helper' : 'Nova'}</b> is asking:</span><span className="chat-help">{hint}</span></div>
      {state.phase === 'project_choice' ? (
        <select ref={inputRef} value={value} onChange={(event) => setValue(event.target.value)} aria-label="Choose previous project">
          {(state.availableProjects || []).map((project) => (
            <option value={project.projectId} key={project.projectId}>
              {project.projectName} - {project.complete ? 'complete' : `${Math.round(project.progress || 0)}%`}
            </option>
          ))}
          <option value="__new__">Start a new project</option>
        </select>
      ) : (
        <textarea ref={inputRef} value={value} onChange={(event) => setValue(event.target.value)} placeholder={state.phase === 'name' ? 'Your name...' : state.phase === 'choice' ? 'New or returning...' : state.phase === 'email' || state.phase === 'new_email' || state.phase === 'returning_email' ? 'Your email...' : 'Type your reply...'} rows="1" />
      )}
      <button type="submit" disabled={!show}><Send size={18} /> Send</button>
    </form>
  );
}
