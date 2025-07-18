import React from 'react';

interface TemplateListProps {
  t: (key: string) => string;
  language: string;
}

const TemplateList: React.FC<TemplateListProps> = ({ t, language }) => {
  return (
    <div className="text-gray-700">
      {/* Placeholder content, replace with actual template list logic as needed */}
      {language === 'fr'
        ? 'Aucune liste de modèles disponible pour le moment.'
        : 'No template list available yet.'}
    </div>
  );
};

export default TemplateList;
