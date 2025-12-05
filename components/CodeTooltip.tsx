```typescript
import React, { useMemo, useState } from 'react';
// The provided JSON schema should be saved and imported from a suitable location.
import iso20022Data from '../../data/iso20022.json';

// Define the structure of the definitions for type safety
interface CodeDefinition {
  type: string;
  description: string;
  enum?: string[];
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

interface Iso20022Schema {
  definitions: {
    [key: string]: CodeDefinition;
  };
}

const schemaData: Iso20022Schema = iso20022Data as Iso20022Schema;

interface CodeTooltipProps {
  codeType: string;
  codeValue: string;
  children: React.ReactNode;
}

/**
 * A reusable tooltip component that displays the official definition
 * of any ISO 20022 code when a user hovers over it.
 * It looks up the definition from the imported iso20022.json schema.
 */
const CodeTooltip: React.FC<CodeTooltipProps> = ({ codeType, codeValue, children }) => {
  const [isHovering, setIsHovering] = useState(false);

  const definition = useMemo(() => {
    if (!codeType || !codeValue) {
      return null;
    }

    const typeDefinition = schemaData.definitions[codeType];
    if (!typeDefinition || !typeDefinition.description) {
      // Don't show a tooltip if the type is invalid or has no description
      return null;
    }

    const descriptionLines = typeDefinition.description.split(/\r?\n/);
    const codePrefix = `*\`${codeValue}\`-`;

    // Attempt to find the specific definition for the code value
    for (const line of descriptionLines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith(codePrefix)) {
        return trimmedLine.substring(codePrefix.length).trim();
      }
    }

    // Fallback: If no specific code definition is found but the code exists in the enum,
    // show the general description for the code type.
    if (typeDefinition.enum && typeDefinition.enum.includes(codeValue)) {
      // Return the introductory part of the description before the list of codes
      const firstPart = typeDefinition.description.split('*`')[0].trim();
      return firstPart || null;
    }

    // If the code is not in the enum or no specific definition is found, show no tooltip.
    return null;

  }, [codeType, codeValue]);

  // If no definition could be found, render the children without a tooltip wrapper.
  if (!definition) {
    return <>{children}</>;
  }

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  // CSS-in-JS for styling to keep the component self-contained
  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    cursor: 'help',
    textDecoration: 'underline dotted',
  };

  const tooltipStyle: React.CSSProperties = {
    visibility: isHovering ? 'visible' : 'hidden',
    opacity: isHovering ? 1 : 0,
    width: '300px',
    maxWidth: '90vw',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    color: '#fff',
    textAlign: 'left',
    borderRadius: '6px',
    padding: '8px 12px',
    position: 'absolute',
    zIndex: 1000,
    bottom: '125%',
    left: '50%',
    marginLeft: '-150px',
    transition: 'opacity 0.2s ease-in-out',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    fontSize: '14px',
    lineHeight: '1.5',
    fontFamily: 'sans-serif',
  };

  const tooltipArrowStyle: React.CSSProperties = {
    content: '""',
    position: 'absolute',
    top: '100%',
    left: '50%',
    marginLeft: '-5px',
    borderWidth: '5px',
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0.85) transparent transparent transparent',
  };

  return (
    <span
      style={wrapperStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-describedby={`tooltip-for-${codeValue}`}
    >
      {children}
      <span style={tooltipStyle} role="tooltip" id={`tooltip-for-${codeValue}`}>
        <strong>{codeValue}</strong>: {definition}
        <span style={tooltipArrowStyle} />
      </span>
    </span>
  );
};

export default CodeTooltip;
```