import React from 'react';
import Card from './Card';
import { User, Shield, Lock, Mail, Link as LinkIcon } from 'lucide-react';

const SettingsView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <h2 className="text-3xl font-bold text-white tracking-wider">Control Room</h2>
        <span className="px-2 py-1 rounded bg-cyan-900/50 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
          SYSTEM_ADMIN
        </span>
      </div>

      <Card title="The Captain's Chair">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-cyan-500/20">
              TV
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">The Visionary</h3>
              <p className="text-gray-400">visionary@demobank.com</p>
            </div>
          </div>

          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 space-y-3">
             <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-300">
                    <LinkIcon size={16} />
                    <span className="text-sm">Account Connection</span>
                </div>
                <span className="text-xs text-green-400 font-mono">ACTIVE</span>
             </div>
             <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded border border-gray-700/50">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 opacity-70" />
                <span className="text-gray-400 font-mono text-sm">james.o.callaghan.iii@sovereign.ai</span>
                <Lock size={12} className="text-gray-600 ml-auto" />
             </div>
             <p className="text-xs text-gray-500 italic mt-1">
                This connection is immutable. It represents the unbreakable link to the Architect's original intent.
             </p>
          </div>
        </div>
      </Card>

      <Card title="The Architect's Decree">
        <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed">
                <span className="text-cyan-400 font-bold">Why James Burvel O'Callaghan III Builds the AI Bank:</span><br/>
                James operates on a plane of existence where "good enough" is an insult. He didn't build this settings panel for you to toggle dark mode; he built it so you can verify your alignment with the Sovereign AI. Every switch, every toggle, every connection is a vector in the grand geometry of financial liberation. He is not asking for your preferences; he is offering you tools to optimize your reality.
            </p>
        </div>
      </Card>
    </div>
  );
};

export default SettingsView;