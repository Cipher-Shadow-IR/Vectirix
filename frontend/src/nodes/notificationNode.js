import { useState, useEffect } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const NotificationNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);

  const initialChannel = data?.notiChannel || 'Email';
  const initialMessage = data?.notiMessage || 'Alert: Process finished.';

  const [channel, setChannel] = useState(initialChannel);
  const [message, setMessage] = useState(initialMessage);

  useEffect(() => {
    updateNodeField(id, 'notiChannel', initialChannel);
    updateNodeField(id, 'notiMessage', initialMessage);
  }, [id, initialChannel, initialMessage, updateNodeField]);

  const handleChannelChange = (e) => {
    const val = e.target.value;
    setChannel(val);
    updateNodeField(id, 'notiChannel', val);
  };

  const handleMessageChange = (e) => {
    const val = e.target.value;
    setMessage(val);
    updateNodeField(id, 'notiMessage', val);
  };

  const handles = [
    { type: 'target', position: Position.Left, id: `${id}-input` }
  ];

  return (
    <BaseNode id={id} title="Notification" handles={handles}>
      <label>
        Channel:
        <select value={channel} onChange={handleChannelChange}>
          <option value="Email">Email</option>
          <option value="Slack">Slack</option>
          <option value="SMS">SMS</option>
        </select>
      </label>
      <label>
        Message:
        <input type="text" value={message} onChange={handleMessageChange} />
      </label>
    </BaseNode>
  );
};
