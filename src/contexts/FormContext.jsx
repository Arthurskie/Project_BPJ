import React, { createContext, useContext, useState, useEffect } from 'react';

const FormContext = createContext();

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}

export function FormProvider({ children }) {
  // Try to load forms from localStorage, otherwise use initial dummy data
  const [forms, setForms] = useState(() => {
    const saved = localStorage.getItem('forms_data');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      { id: 1, name: 'Customer Satisfaction Survey 2026', creator: 'Sarah Jenkins', date: '14 Sep 2026', time: '10:30 AM', status: 'Active', responses: 342 },
      { id: 2, name: 'Employee Onboarding Form', creator: 'Admin User', date: '12 Sep 2026', time: '02:15 PM', status: 'Active', responses: 12 },
      { id: 3, name: 'Product Feedback Q3', creator: 'Mark Otto', date: '08 Sep 2026', time: '09:45 AM', status: 'Draft', responses: 0 },
      { id: 4, name: 'Event Registration - TechConf', creator: 'Admin User', date: '05 Sep 2026', time: '11:20 AM', status: 'Closed', responses: 850 },
      { id: 5, name: 'Support Ticket Intake', creator: 'Sarah Jenkins', date: '01 Sep 2026', time: '04:05 PM', status: 'Active', responses: 1205 },
      { id: 6, name: 'Website Bug Report', creator: 'System', date: '30 Aug 2026', time: '11:20 AM', status: 'Active', responses: 45 },
    ];
  });

  // Persist forms to localStorage
  useEffect(() => {
    localStorage.setItem('forms_data', JSON.stringify(forms));
  }, [forms]);

  const addForm = (newForm) => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const formToAdd = {
      ...newForm,
      id: Date.now(),
      creator: 'Admin User', // Current user
      date: formattedDate,
      time: formattedTime,
      status: 'Draft',
      responses: 0,
    };
    
    // Add to the top of the list
    setForms([formToAdd, ...forms]);
  };

  const deleteForm = (id) => {
    setForms(forms.filter(f => f.id !== id));
  };

  return (
    <FormContext.Provider value={{ forms, addForm, deleteForm }}>
      {children}
    </FormContext.Provider>
  );
}
