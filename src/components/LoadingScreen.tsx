import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onFinished: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinished }) => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [opacity, setOpacity] = useState(1);
  
  const welcomeText = "Welcome Developer";
  
  useEffect(() => {
    // Typing animation for "Welcome Developer"
    let charIndex = 0;
    const typingInterval = setInterval(() => {
      if (charIndex < welcomeText.length) {
        setTypedText(welcomeText.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setAnimationPhase(1);
        
        // Show VS Code logo after typing completes
        setTimeout(() => {
          setAnimationPhase(2);
          
          // Fade out animation before moving to main app
          setTimeout(() => {
            setOpacity(0);
            setTimeout(() => {
              onFinished();
            }, 500);
          }, 1500);
        }, 1000);
      }
    }, 100);
    
    return () => clearInterval(typingInterval);
  }, [onFinished, welcomeText]);
  
  return (
    <div 
      className="h-screen bg-[#1E1E1E] text-[#CCCCCC] flex flex-col items-center justify-center overflow-hidden relative"
      style={{ opacity, transition: 'opacity 0.5s ease-in-out' }}
    >
      {/* Animated code particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <div 
            key={i}
            className="absolute text-xs"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              transform: `scale(${0.5 + Math.random() * 0.5})`,
              opacity: 0.2 + Math.random() * 0.3,
              color: Math.random() > 0.7 ? '#007ACC' : '#33FF33'
            }}
          >
            {Math.random() > 0.6 ? '{ }' : Math.random() > 0.3 ? '</ >' : '[ ]'}
          </div>
        ))}
      </div>
      
      {/* Glowing lines */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-[#007ACC] to-transparent opacity-30" 
             style={{ top: '30%', animation: 'pulse 2s infinite' }}></div>
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-[#007ACC] to-transparent opacity-20"
             style={{ top: '70%', animation: 'pulse 3s infinite' }}></div>
        <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-[#007ACC] to-transparent opacity-30"
             style={{ left: '20%', animation: 'pulse 2.5s infinite' }}></div>
        <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-[#007ACC] to-transparent opacity-20"
             style={{ left: '80%', animation: 'pulse 3.5s infinite' }}></div>
      </div>
      
      {animationPhase < 2 && (
        <div className="text-center z-10 mb-8">
          <h1 className="text-5xl font-bold mb-6 text-[#FFFFFF] tracking-wide">
            {typedText}
            <span className={`animate-blink ${animationPhase === 1 ? 'opacity-0' : 'opacity-100'}`}>_</span>
          </h1>
          
          {animationPhase === 1 && (
            <div className="mt-4 flex space-x-2 justify-center animate-fadeIn">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          )}
        </div>
      )}
      
      {animationPhase === 2 && (
        <div className="animate-scaleIn flex flex-col items-center z-10">
          <div className="w-36 h-36 mb-8 flex items-center justify-center">
            <div className="w-32 h-32 bg-[#007ACC] rounded-md flex items-center justify-center relative">
              <div className="absolute inset-0 bg-[#007ACC] rounded-md animate-pulse opacity-50"></div>
              {/* VS Code bracket icon */}
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute w-full h-full border-4 border-white rounded-sm"></div>
                <div className="absolute w-1/2 h-full border-r-4 border-white"></div>
              </div>
            </div>
          </div>
          <div className="text-xl text-[#FFFFFF] animate-fadeIn tracking-wide">
            Launching VS Code...
          </div>
        </div>
      )}
      
      {/* CSS for animations */}
      <style>
        {`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-100px) rotate(180deg); }
          100% { transform: translateY(-200px) rotate(360deg); opacity: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.4; }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out;
        }
        `}
      </style>
    </div>
  );
};

export default LoadingScreen; 