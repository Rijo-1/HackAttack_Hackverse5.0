import React from 'react';

interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-bold mb-4">{message}</h3>
        <div className="flex justify-end">
          <button onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg mr-2">
            Cancel
          </button>
          <button onClick={onConfirm} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 