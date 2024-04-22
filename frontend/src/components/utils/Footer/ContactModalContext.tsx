import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  modalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}
const ModalContext = createContext<ModalContextType | undefined>(undefined);

/**
 * Custom hook for accessing modal state. This hook simplifies the process of accessing the modal context in any component
 * within the application. Must be used within components that are descendants of the `ModalProvider` or it will throw an
 * error.
 *
 * @returns ModalContextType – The modal context object with modalOpen, openModal, closeModal.
 * @throws Error – If used outside of a `ModalProvider`, it throws an error because it relies on the context provided by
 * that ModalProvider.
 */
const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface Props {
  children: ReactNode;
}

/**
 * Component that initializes the modal state. It initializes the state needed to control whether
 * a modal is open or closed and provides functions to open and close the modal. Any child components
 * wrapped by ModalProvider can access and manipulate the modal's visibility. This is used to prevent
 * multiple components in App.tsx from re-rendering every time the modal is opened/closed by isolating
 * the components that actually use the context.
 *
 * @param children – Child components that will receive access to the modal state
 * @returns
 */
const ModalProvider = ({ children }: Props) => {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <ModalContext.Provider value={{ modalOpen, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export { useModal, ModalProvider };
