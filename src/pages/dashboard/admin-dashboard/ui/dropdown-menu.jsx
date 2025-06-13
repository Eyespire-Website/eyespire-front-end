import React from 'react';
import { createPortal } from 'react-dom';

// DropdownMenu component that manages state and context for the dropdown
export const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef(null);

  const contextValue = React.useMemo(() => ({
    isOpen,
    setIsOpen,
    position,
    setPosition,
    triggerRef
  }), [isOpen, position]);

  return (
    <DropdownMenuContext.Provider value={contextValue}>
      {children}
    </DropdownMenuContext.Provider>
  );
};

// Create context for dropdown state
const DropdownMenuContext = React.createContext(null);
const useDropdownMenu = () => React.useContext(DropdownMenuContext);

// Trigger component that toggles the dropdown
export const DropdownMenuTrigger = ({ children, asChild = false }) => {
  const { setIsOpen, isOpen, triggerRef, setPosition } = useDropdownMenu();

  const handleClick = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);

    // Calculate position based on trigger element
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom,
        left: rect.left
      });
    }
  };

  const element = asChild ? React.Children.only(children) : <button>{children}</button>;

  return React.cloneElement(element, {
    onClick: handleClick,
    ref: triggerRef,
    'aria-expanded': isOpen,
    'aria-haspopup': true
  });
};

// Content component that displays dropdown items
export const DropdownMenuContent = ({ 
  children, 
  className = '', 
  side = 'bottom', 
  align = 'center',
  sideOffset = 5
}) => {
  const { isOpen, position } = useDropdownMenu();

  // Calculate position based on side and align props
  const getContentStyle = () => {
    const style = { position: 'absolute' };

    if (side === 'bottom') {
      style.top = `${position.top + sideOffset}px`;
    } else if (side === 'top') {
      style.bottom = `${window.innerHeight - position.top + sideOffset}px`;
    } else if (side === 'right') {
      style.left = `${position.left + sideOffset}px`;
    } else if (side === 'left') {
      style.right = `${window.innerWidth - position.left + sideOffset}px`;
    }

    if (align === 'start') {
      style.left = `${position.left}px`;
    } else if (align === 'center') {
      style.left = `${position.left - 100}px`;
    } else if (align === 'end') {
      style.right = `${window.innerWidth - position.left}px`;
    }

    return style;
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className={`bg-white rounded-md shadow-md p-2 z-50 ${className}`} 
      style={getContentStyle()}
    >
      {children}
    </div>,
    document.body
  );
};

// Individual menu item
export const DropdownMenuItem = ({ 
  children, 
  onClick,
  className = ''
}) => {
  const { setIsOpen } = useDropdownMenu();

  const handleClick = (e) => {
    if (onClick) onClick(e);
    setIsOpen(false);
  };

  return (
    <button 
      className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100 ${className}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};
