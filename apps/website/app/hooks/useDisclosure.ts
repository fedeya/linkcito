import { useCallback, useState } from 'react';

const useDisclosure = () => {
  const [isOpen, setIsOpen] = useState(false);

  const onClose = useCallback(() => setIsOpen(false), []);
  const onToggle = useCallback(() => setIsOpen(!isOpen), [isOpen]);
  const onOpen = useCallback(() => setIsOpen(true), []);

  return { isOpen, onClose, onOpen, onToggle, setIsOpen };
};

export default useDisclosure;
