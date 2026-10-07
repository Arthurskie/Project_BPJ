import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Type, List, CheckSquare, Settings2, Trash2 } from 'lucide-react';
import { useFormContext } from '../../contexts/FormContext';

export default function CreateForm() {
  const navigate = useNavigate();
  const { addForm } = useFormContext();

  const [formName, setFormName] = useState('Untitled Form');
  const [description, setDescription] = useState('');
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, []);
  
  const [fields, setFields] = useState([
    { id: 1, type: 'short_text', label: 'What is your name?', required: true }
  ]);

  const addField = (type) => {
    setFields([
      ...fields,
      { 
        id: Date.now(), 
        type, 
        label: 'Untitled Field', 
        required: false 
      }
    ]);
  };

  const updateFieldLabel = (id, newLabel) => {
    setFields(fields.map(f => f.id === id ? { ...f, label: newLabel } : f));
  };

  const removeField = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    
    addForm({
      name: formName,
      // Could also pass description and fields if we were storing them
    });
    
    navigate('/forms');
  };

  const renderFieldIcon = (type) => {
    switch(type) {
      case 'short_text': return <Type size={16} />;
      case 'long_text': return <List size={16} />;
      case 'multiple_choice': return <CheckSquare size={16} />;
      default: return <Settings2 size={16} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors shadow-sm"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Create New Form</h2>
            <p className="text-slate-500 dark:text-neutral-400 text-sm mt-1">Design your form by adding fields below.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            Save Form
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Canvas */}
        <div className="md:col-span-2 space-y-4">
          {/* Form Settings */}
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl shadow-sm p-6 space-y-4">
            <input 
              ref={titleInputRef}
              type="text" 
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Form Title"
              className="w-full text-2xl font-bold bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-neutral-700 focus:outline-none focus:ring-0"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={2}
              className="w-full text-sm bg-transparent border-none p-0 text-slate-600 dark:text-neutral-400 placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-0 resize-none"
            />
          </div>

          {/* Fields List */}
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl shadow-sm p-5 relative group animate-fade-in">
                <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => removeField(field.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-slate-50 dark:bg-neutral-900 rounded border border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400">
                    {renderFieldIcon(field.type)}
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                    {field.type.replace('_', ' ')}
                  </span>
                </div>
                
                <input 
                  type="text"
                  value={field.label}
                  onChange={(e) => updateFieldLabel(field.id, e.target.value)}
                  placeholder="Question label..."
                  className="w-full text-base font-medium bg-slate-50 dark:bg-neutral-900/50 border border-transparent hover:border-slate-200 dark:hover:border-neutral-800 focus:border-primary-500 dark:focus:border-primary-400 text-slate-900 dark:text-white rounded-lg px-3 py-2 transition-all focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            ))}
          </div>
          
          {fields.length === 0 && (
            <div className="py-12 text-center border border-dashed border-slate-300 dark:border-neutral-700 rounded-xl bg-slate-50 dark:bg-neutral-900/30">
              <p className="text-sm text-slate-500 dark:text-neutral-400">Your form is empty. Add a field to get started.</p>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl shadow-sm p-5 sticky top-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Add Elements</h3>
            <div className="space-y-2">
              <button 
                onClick={() => addField('short_text')}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-900 hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors text-left group"
              >
                <Type size={18} className="text-slate-400 dark:text-neutral-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                <div>
                  <div className="text-sm font-medium text-slate-700 dark:text-neutral-300">Short Text</div>
                  <div className="text-xs text-slate-500 dark:text-neutral-500">Single line response</div>
                </div>
              </button>

              <button 
                onClick={() => addField('long_text')}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-900 hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors text-left group"
              >
                <List size={18} className="text-slate-400 dark:text-neutral-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                <div>
                  <div className="text-sm font-medium text-slate-700 dark:text-neutral-300">Long Text</div>
                  <div className="text-xs text-slate-500 dark:text-neutral-500">Multi-line response</div>
                </div>
              </button>

              <button 
                onClick={() => addField('multiple_choice')}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-900 hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors text-left group"
              >
                <CheckSquare size={18} className="text-slate-400 dark:text-neutral-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                <div>
                  <div className="text-sm font-medium text-slate-700 dark:text-neutral-300">Multiple Choice</div>
                  <div className="text-xs text-slate-500 dark:text-neutral-500">Select one or more options</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
