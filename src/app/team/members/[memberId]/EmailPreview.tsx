import React from 'react';
import Image from 'next/image';
import { 
  Mail, 
  Search, 
  MoreHorizontal,
  User2
} from 'lucide-react';

interface EmailPreviewProps {
  profileImage: string;
  formData: {
    name?: string;
    email?: string;
    jobTitle?: string;
    company?: string;
  };
  emailSubject?: string;
  emailGreeting?: string;
  emailBody?: string;
}

const EmailPreview: React.FC<EmailPreviewProps> = ({ 
  profileImage, 
  formData,
  emailSubject = "Copy of Faruk <> Lead's First Name",
  emailGreeting = "Hi Copy of Faruk and",
  emailBody = "You both just connected via Popl and this is an automatic email intro.\n\nReply to this email to continue the conversation."
}) => {
  const senderName = formData.name || "Copy of Faruk";
  const senderEmail = formData.email || "faruk@babel.com.tr";
  
  // Helper function to highlight template variables in text
  const highlightVariables = (text: string) => {
    const variableRegex = /\{[^}]+\}/g;
    const parts = text.split(variableRegex);
    const variables = text.match(variableRegex);
    
    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {variables && variables[index] && (
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium border border-blue-200">
            {variables[index]}
          </span>
        )}
      </React.Fragment>
    ));
  };
  
  return (
    <div className="flex flex-col items-center h-full">
      <div className="text-xs flex flex-col space-y-2 text-center">
        <p className="text-[#828282] font-semibold">Follow-up Email Preview</p>
        <a className="text-[#29AEF8] font-medium" href="">View Email</a>
      </div>
      
      <div className="mt-4 bg-gray-50 rounded-lg shadow-sm max-w-full w-full overflow-hidden">
        {/* Email content */}
        <div className="p-4">
          <div className="space-y-2">
            {/* From field */}
            <div className="text-xs text-gray-500">
              <span>From</span>
            </div>
            <div className="text-sm font-medium">
              {senderName}
            </div>

            {/* Subject field */}
            <div className="text-xs text-gray-500 mt-4">
              <span>Subject</span>
            </div>
            <div className="text-sm font-medium flex items-center flex-wrap">
              <span className="text-amber-500 mr-1">👋</span>
              <span className="flex flex-wrap items-center gap-1">
                {highlightVariables(emailSubject)}
              </span>
            </div>

            {/* Message field */}
            <div className="text-xs text-gray-500 mt-4">
              <span>Message</span>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-sm">
                <p className="flex flex-wrap items-center gap-1">
                  {highlightVariables(emailGreeting + " Lead's First Name,")}
                </p>
                <div className="mt-4 whitespace-pre-line flex flex-wrap items-center gap-1">
                  {highlightVariables(emailBody)}
                </div>
                
                <div className="mt-6 pt-4 border-t text-sm text-gray-500">
                  <p>Reply to this email to continue the conversation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailPreview; 