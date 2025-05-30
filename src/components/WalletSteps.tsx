import React from 'react';
import { WalletStep } from '../types/wallet';

interface WalletStepsProps {
  steps: WalletStep[];
}

export const WalletSteps: React.FC<WalletStepsProps> = ({ steps }) => {
  return (
    <div className="wallet-steps">
      <h3>Wallet Creation Steps</h3>
      {steps.map((step, index) => (
        <div 
          key={index} 
          className={`step ${step.status}`}
        >
          <div className="step-header">
            <div className="step-number">{index + 1}</div>
            <h4>{step.title}</h4>
          </div>
          <p className="step-description">{step.description}</p>
          {step.data && (
            <div className="step-data">
              <code>{step.data}</code>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}; 