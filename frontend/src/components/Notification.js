import { useState, useEffect } from 'react';

let notify = () => {};

export const notifySuccess = (message) => notify('success', message);
export const notifyError = (message) => notify('error', message);

export const NotificationContainer = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    notify = (type, message) => {
      const id = Date.now();
      setItems((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setItems((prev) => prev.filter((n) => n.id !== id));
      }, 3000);
    };
    return () => { notify = () => {}; };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="notification-container">
      {items.map((item) => (
        <div key={item.id} className={`notification notification-${item.type}`}>
          <span>{item.type === 'success' ? '\u2713' : '\u2717'}</span>
          <span>{item.message}</span>
        </div>
      ))}
    </div>
  );
};
