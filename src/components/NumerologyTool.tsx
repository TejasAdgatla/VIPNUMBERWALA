import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { calculateNameNumber, calculateDOBNumber, getNumberMeaning } from '../utils/chaldean';

const NumerologyTool: React.FC = () => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [report, setReport] = useState<{
    nameNumber: number;
    dobNumber: number;
    destinyNumber: number;
  } | null>(null);

  const generateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dob) return;

    const nameData = calculateNameNumber(name);
    const dobData = calculateDOBNumber(dob);

    let destinyRaw = nameData.reduced + dobData.reduced;
    while (destinyRaw > 9) {
      destinyRaw = String(destinyRaw).split('').reduce((a, b) => a + parseInt(b), 0);
    }

    setReport({
      nameNumber: nameData.reduced,
      dobNumber: dobData.reduced,
      destinyNumber: destinyRaw,
    });
  };

  return (
    <div className="tool-wrapper">
      <div className="tool-card">
        <div className="tool-header">
          <span className="tool-badge">✨ Free Tool</span>
          <h2>Free Chaldean Report</h2>
          <p>Enter your name and date of birth to discover your core numbers using ancient Chaldean wisdom.</p>
        </div>

        <form onSubmit={generateReport} className="tool-form">
          <div className="input-group">
            <label htmlFor="fullname">Full Name</label>
            <input
              id="fullname"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="dob">Date of Birth</label>
            <input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary submit-btn">
            Generate My Report
          </button>
        </form>

        {report && (
          <motion.div
            className="report-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="report-title">Your Chaldean Numbers</h3>
            <div className="result-cards">
              <div className="result-item">
                <div className="result-number">{report.nameNumber}</div>
                <div className="result-label">Expression<br />Number</div>
              </div>
              <div className="result-item">
                <div className="result-number">{report.dobNumber}</div>
                <div className="result-label">Life Path<br />Number</div>
              </div>
              <div className="result-item highlight">
                <div className="result-number">{report.destinyNumber}</div>
                <div className="result-label">Destiny<br />Number</div>
              </div>
            </div>
            <div className="result-meaning">
              <strong>Your Destiny Meaning:</strong>
              <p>{getNumberMeaning(report.destinyNumber)}</p>
            </div>
            <div className="result-meaning">
              <strong>Your Expression Meaning:</strong>
              <p>{getNumberMeaning(report.nameNumber)}</p>
            </div>
            <div className="result-cta">
              <p>Want a VIP number that matches your destiny number <strong>{report.destinyNumber}</strong>?</p>
              <a
                href={`https://wa.me/919876543210?text=Hi%21%20My%20destiny%20number%20is%20${report.destinyNumber}.%20Please%20suggest%20a%20matching%20VIP%20number.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                💬 Get a Matching VIP Number
              </a>
            </div>
          </motion.div>
        )}
      </div>

      <style>{`
        .tool-wrapper {
          padding: 5rem 1.5rem;
          background: #fffdf8;
        }
        .tool-card {
          max-width: 620px;
          margin: 0 auto;
          background: var(--surface-color);
          border-radius: var(--radius-lg);
          padding: 3rem 2.5rem;
          box-shadow: var(--shadow-md);
          border: 1px solid rgba(0,0,0,0.04);
        }
        .tool-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .tool-badge {
          display: inline-block;
          background: #fff3e0;
          color: var(--accent-color);
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.3rem 0.8rem;
          border-radius: var(--radius-full);
          margin-bottom: 1rem;
          border: 1px solid rgba(230, 81, 0, 0.2);
        }
        .tool-header h2 {
          font-size: 2rem;
          margin-bottom: 0.75rem;
        }
        .tool-header p {
          color: #666;
          font-size: 0.95rem;
        }
        .tool-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .input-group label {
          display: block;
          font-weight: 500;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }
        .input-group input {
          width: 100%;
          padding: 0.85rem 1rem;
          border: 1.5px solid #e0e0e0;
          border-radius: var(--radius-sm);
          font-family: var(--font-sans);
          font-size: 1rem;
          transition: var(--transition-smooth);
          background: #fafafa;
        }
        .input-group input:focus {
          border-color: var(--accent-color);
          outline: none;
          box-shadow: 0 0 0 3px rgba(230, 81, 0, 0.1);
          background: #fff;
        }
        .submit-btn {
          width: 100%;
          padding: 1rem;
          font-size: 1rem;
        }
        .report-results {
          margin-top: 2.5rem;
          padding-top: 2.5rem;
          border-top: 1px solid #eee;
        }
        .report-title {
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          font-family: var(--font-sans);
          font-weight: 600;
        }
        .result-cards {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .result-item {
          flex: 1;
          text-align: center;
          padding: 1.5rem 1rem;
          background: var(--secondary-bg);
          border-radius: var(--radius-md);
        }
        .result-item.highlight {
          background: var(--accent-color);
          color: white;
        }
        .result-number {
          font-size: 2.5rem;
          font-family: var(--font-serif);
          font-weight: 600;
          line-height: 1;
          margin-bottom: 0.5rem;
        }
        .result-label {
          font-size: 0.75rem;
          opacity: 0.75;
          line-height: 1.3;
        }
        .result-meaning {
          background: #fafafa;
          border-radius: var(--radius-sm);
          padding: 1.25rem;
          margin-bottom: 1rem;
          border-left: 3px solid var(--accent-color);
          font-size: 0.95rem;
          color: #555;
        }
        .result-meaning strong {
          display: block;
          margin-bottom: 0.4rem;
          color: var(--text-color);
        }
        .result-cta {
          margin-top: 1.5rem;
          text-align: center;
          background: #fff3e0;
          border-radius: var(--radius-md);
          padding: 1.5rem;
        }
        .result-cta p {
          margin-bottom: 1rem;
          font-size: 0.95rem;
          color: #555;
        }
      `}</style>
    </div>
  );
};

export default NumerologyTool;
